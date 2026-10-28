import { z } from "zod";
import { requireApiUser } from "@/lib/auth-helpers";
import { buildCulturalIntelligence } from "@/lib/qloo/cultural-intelligence";
import { QlooConfigurationError, QlooRequestError } from "@/lib/qloo/client";
import { decryptSecret } from "@/lib/crypto";
import { getProvider } from "@/lib/llm";

const schema = z.object({
  companyId: z.string().trim().min(1).max(120),
  campaignGoal: z.string().trim().min(3).max(240),
  audience: z.string().trim().min(3).max(240),
  geography: z.string().trim().max(120).optional(),
  seedQueries: z.array(z.string().trim().min(2).max(120)).min(1).max(5),
  categories: z.array(z.enum(["artist", "movie", "tv_show", "brand", "place", "destination", "book", "podcast", "videogame"])).min(1).max(4),
});

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (!user) return Response.json({ ok: false, error: "Sign in to build a cultural profile." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, error: "Add a clear goal, audience, seed, and at least one category." }, { status: 400 });
  const { companyId, ...input } = parsed.data;
  const { db } = await import("@/lib/db");
  const company = await db.company.findFirst({ where: { id: companyId, userId: user.id }, select: { id: true } });
  if (!company) return Response.json({ ok: false, error: "Company not found." }, { status: 404 });
  try {
    const result = await buildCulturalIntelligence(input);
    let planDraft: string | null = null;
    if (user.llmProvider && user.llmApiKeyEnc && user.llmModel && !user.demoMode) {
      try {
        planDraft = await getProvider(user.llmProvider).complete({
          apiKey: decryptSecret(user.llmApiKeyEnc),
          model: user.llmModel,
          system: "You are KREV AI's cultural strategy planner. Use only the supplied Qloo evidence and user context. Clearly separate observed signals from strategic hypotheses. Do not invent demographics, popularity, performance, or health claims. Return a concise Markdown campaign direction with: cultural tension, audience interpretation, three campaign territories, channel/format suggestions, and a measurement plan.",
          messages: [{ role: "user", content: JSON.stringify({ context: input, qlooEvidence: result }) }],
          maxTokens: 1800,
          temperature: 0.25,
        });
      } catch {
        // Qloo evidence remains useful when the optional plan synthesis fails.
      }
    }
    return Response.json({ ok: true, ...result, planDraft, source: "qloo-live" });
  } catch (error) {
    if (error instanceof QlooConfigurationError) return Response.json({ ok: false, error: error.message, source: "unavailable" }, { status: 503 });
    if (error instanceof QlooRequestError) return Response.json({ ok: false, error: error.message, source: "qloo" }, { status: error.status });
    return Response.json({ ok: false, error: "Cultural intelligence could not be built. Try again shortly.", source: "qloo" }, { status: 502 });
  }
}
