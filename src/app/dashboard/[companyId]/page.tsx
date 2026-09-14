import { notFound, redirect } from "next/navigation";
import { after } from "next/server";
import { DashboardClient } from "@/components/dashboard-client";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { createCompanyContext } from "@/lib/company-brief";
import { newestRunPerAgent } from "@/lib/agents/latest-runs";
import { withoutSkillProvenance } from "@/lib/documents/public";
import { recordCompanyView } from "@/lib/admin/activity";

export default async function DashboardPage({ params }: PageProps<"/dashboard/[companyId]">) {
  const user = await requireUser();
  if (!user.llmVerifiedAt) redirect("/onboarding");
  const { companyId } = await params;
  const company = await db.company.findFirst({
    where: { id: companyId, userId: user.id },
    include: {
      documents: { orderBy: { createdAt: "asc" } },
      crawlPages: { orderBy: { fetchedAt: "desc" }, take: 12, select: { url: true, title: true, description: true, content: true } },
      agentRuns: { where: { status: "DONE" }, orderBy: { createdAt: "desc" } },
      _count: { select: { crawlPages: true } },
      auditJobs: { orderBy: { createdAt: "desc" }, take: 1 },
      integrations: { select: { provider: true, status: true, connectedAt: true }, orderBy: { provider: "asc" } },
      agentConfigs: { select: { agentType: true, config: true } },
      chatSessions: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: { messages: { orderBy: { createdAt: "desc" }, take: 30, select: { id: true, role: true, content: true, createdAt: true } } },
      },
      chatAttachments: { where: { remembered: true }, orderBy: { createdAt: "desc" }, select: { id: true, title: true, sourceType: true, content: true, createdAt: true } },
    },
  });
  if (!company) notFound();
  if (company.status !== "ACTIVE" && company.auditJobs[0]) redirect(`/onboarding/audit/${company.auditJobs[0].id}`);
  after(() => recordCompanyView(user.id, company.id));
  const companies = await db.company.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, websiteUrl: true, logoUrl: true, status: true },
    orderBy: { createdAt: "asc" },
  });
  const latestAgents = newestRunPerAgent(company.agentRuns);
  const latestChatSession = company.chatSessions[0];
  const companyContext = createCompanyContext({ ...company, intelligenceMarkdown: company.documents.find((document) => document.type === "COMPANY_INTELLIGENCE")?.contentMarkdown, crawlPages: company.crawlPages });
  return <DashboardClient data={{
    company: { id: company.id, name: company.name, websiteUrl: company.websiteUrl, logoUrl: company.logoUrl, category: company.category, description: company.description, companyContext, lastAuditedAt: company.lastAuditedAt?.toISOString() ?? null },
    companies,
    user: { name: user.name, email: user.email, llmProvider: user.llmProvider, llmKeyPreview: user.llmKeyPreview, demoMode: user.demoMode, tokenBudget: user.tokenBudget, tokenUsed: user.tokenUsed },
    documents: company.documents.map((document) => {
      const publicDocument = withoutSkillProvenance(document);
      return { ...publicDocument, createdAt: document.createdAt.toISOString(), updatedAt: document.updatedAt.toISOString() };
    }),
    agents: latestAgents.map((run) => ({ id: run.id, agentType: run.agentType, status: run.status, summary: run.summary, output: run.output, sources: run.sources, skills: run.skills, confidence: run.confidence, tokensUsed: run.tokensUsed, error: run.error, createdAt: run.createdAt.toISOString() })),
    integrations: company.integrations.map((integration) => ({ provider: integration.provider, status: integration.status, connectedAt: integration.connectedAt?.toISOString() ?? null })),
    agentConfigs: company.agentConfigs.map((config) => ({ agentType: config.agentType, config: config.config })),
    chat: latestChatSession ? {
      sessionId: latestChatSession.id,
      messages: latestChatSession.messages.slice().reverse().map((message) => ({ id: message.id, role: message.role === "assistant" ? "assistant" as const : "user" as const, content: message.content, createdAt: message.createdAt.toISOString() })),
    } : null,
    sources: company.chatAttachments.map((source) => ({ id: source.id, title: source.title, sourceType: source.sourceType, characterCount: source.content.length, createdAt: source.createdAt.toISOString() })),
    pagesRead: company._count.crawlPages,
    crawlPages: company.crawlPages,
    analysis: company.auditJobs[0] ? { jobId: company.auditJobs[0].id, status: company.auditJobs[0].status, progress: company.auditJobs[0].progress, step: company.auditJobs[0].step } : null,
  }} />;
}
