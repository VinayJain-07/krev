import { z } from "zod";
import { requireApiUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { decryptSecret } from "@/lib/crypto";
import { getProvider } from "@/lib/llm";
import { loadSkillPack } from "@/lib/nodes/loader";
import { getInternalOperation } from "@/lib/nodes/registry";
import { buildUploadedSourceEvidence } from "@/lib/sources/content";

const schema = z.object({ companyId: z.string().min(1), sessionId: z.string().optional(), message: z.string().trim().min(1).max(5000) });

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (!user) return Response.json({ error: "Sign in to chat." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter a message." }, { status: 400 });
  if (user.demoMode) return Response.json({ error: "Demo Mode — connect a real provider key in Settings to chat live." }, { status: 409 });
  if (!user.llmProvider || !user.llmApiKeyEnc || !user.llmModel) return Response.json({ error: "Reconnect your provider key in Settings." }, { status: 403 });
  const chatReservation = 55_000;
  if (user.tokenBudget > 0 && user.tokenUsed + chatReservation > user.tokenBudget) {
    return Response.json({ error: `This chat request needs an estimated ${chatReservation.toLocaleString()} tokens, but the workspace limit does not have enough capacity. Update your token limit in Settings to continue.` }, { status: 403 });
  }
  const company = await db.company.findFirst({
    where: { id: parsed.data.companyId, userId: user.id },
    include: {
      documents: true,
      crawlPages: { orderBy: { fetchedAt: "desc" }, take: 12 },
      agentRuns: { where: { status: "DONE" }, orderBy: { createdAt: "desc" }, take: 10 },
      chatAttachments: { where: { remembered: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!company) return Response.json({ error: "Company not found." }, { status: 404 });
  let session = parsed.data.sessionId ? await db.chatSession.findFirst({ where: { id: parsed.data.sessionId, companyId: company.id }, include: { messages: { orderBy: { createdAt: "desc" }, take: 12 } } }) : null;
  if (!session) session = await db.chatSession.create({ data: { companyId: company.id, title: parsed.data.message.slice(0, 80) }, include: { messages: true } });
  await db.chatMessage.create({ data: { sessionId: session.id, role: "user", content: parsed.data.message } });

  const recentPages = (company.crawlPages ?? [])
    .map((page) => `PAGE [${page.url}] — ${page.title || "Page"}\n${page.description ? `Summary: ${page.description}\n` : ""}${page.content ? `Content: ${page.content.slice(0, 400)}` : ""}`)
    .join("\n\n");

  const context = [
    `Company: ${company.name}\nWebsite: ${company.websiteUrl}\nDescription: ${company.description ?? ""}\nCategory: ${company.category ?? "Technology / Growth"}`,
    buildUploadedSourceEvidence(company.chatAttachments, 60_000),
    recentPages ? `LATEST CRAWLED PAGES, NEWS & BLOG UPDATES:\n${recentPages}` : "",
    company.documents.map((document) => `DOCUMENT — ${document.title}\n${document.contentMarkdown}`).join("\n\n").slice(0, 55_000),
    company.agentRuns.map((run) => `AGENT SIGNALS & OPPORTUNITIES — ${run.agentType}\n${JSON.stringify(run.output)}`).join("\n\n").slice(0, 30_000),
  ].filter(Boolean).join("\n\n---\n\n").slice(0, 150_000);

  const history = session.messages.slice().reverse().slice(-10).map((message) => ({ role: message.role === "assistant" ? "assistant" as const : "user" as const, content: message.content }));
  try {
    const operation = getInternalOperation("ai-cmo-chat");
    const embeddedSkills = await loadSkillPack(operation.skills, 48_000);
    const systemPrompt = `You are the AI CMO Director inside Smark Connect.

STRICT TWO-PHASE RESPONSE FRAMEWORK:
For any question asked by the user, you MUST deliver your answer following this structured 2-phase sequence:

### 1. Skill-Governed Strategic Framework & Methodology
- First, answer the question through the exact strategic frameworks, methodologies, and decision rules established in your installed repository skills (Product Marketing Context, Behavioral Psychology, CRO, SEO/GEO principles, Paid Ads, and Campaign Sequencing).
- Deliver sharp, battle-tested principles and explain the underlying strategic mechanics clearly.

### 2. Grounded Company Application & Latest News/Signals
- Second, ground and apply the skill framework directly to ${company.name}'s current reality: incorporating the latest company news, recent product updates, crawled website pages, live competitor movements, and target-customer signals from memory.
- Provide concrete, contextualized next steps and decisions based on verified company facts.

REQUIRED SKILL CHAIN:
${embeddedSkills}

OPERATION RULES:
${operation.instructions}

COMPANY CONTEXT & LATEST SIGNALS:
${context}`;

    const content = await getProvider(user.llmProvider).complete({ apiKey: decryptSecret(user.llmApiKeyEnc), model: user.llmModel, system: systemPrompt, messages: [...history, { role: "user", content: parsed.data.message }], maxTokens: 1400, temperature: 0.35 });
    await db.chatMessage.create({ data: { sessionId: session.id, role: "assistant", content } });
    const estimatedTokens = Math.max(250, Math.ceil((context.length + content.length + parsed.data.message.length) / 4));
    await db.user.update({ where: { id: user.id }, data: { tokenUsed: { increment: estimatedTokens } } });
    return Response.json({ sessionId: session.id, content });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "The provider request failed." }, { status: 400 });
  }
}
