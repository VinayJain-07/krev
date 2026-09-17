import { PrismaClient } from "@prisma/client";
import { CORE_DOCUMENTS, INITIAL_AGENT_TYPES } from "../src/lib/nodes/registry";
import { buildEvidencePack, deriveResearchTopics, runAgentAnalysis, runCmoSynthesis, runCoreDocument, saveCoreAnalysis } from "../src/lib/nodes/runner";

process.loadEnvFile?.(".env.local");
const db = new PrismaClient();

async function main() {
  const companyId = process.argv[2];
  const company = await db.company.findUnique({ where: { id: companyId }, include: { user: true, documents: true, crawlPages: { orderBy: { fetchedAt: "desc" }, take: 48 }, pageSpeedAudits: { orderBy: { createdAt: "desc" }, take: 2 } } });
  if (!company) throw new Error("Company not found.");
  if (!company.user.llmProvider || !company.user.llmApiKeyEnc || !company.user.llmModel) throw new Error("A verified provider is required for a skill-governed backfill.");
  const existing = new Set(company.documents.map((document) => document.type));
  const evidence = buildEvidencePack({ companyName: company.name, websiteUrl: company.websiteUrl, pages: company.crawlPages, pageSpeed: company.pageSpeedAudits });
  const researchTopics = deriveResearchTopics(company.crawlPages, company.name);
  for (const definition of CORE_DOCUMENTS) {
    if (existing.has(definition.type)) continue;
    const result = await runCoreDocument({ definition, company, user: company.user, evidence, researchTopics });
    await saveCoreAnalysis({ companyId: company.id, userId: company.userId, definition, analysis: result.analysis, tokensUsed: result.tokensUsed, execution: result.execution });
  }
  for (const agentType of INITIAL_AGENT_TYPES) await runAgentAnalysis({ companyId: company.id, userId: company.userId, agentType });
  await runCmoSynthesis({ companyId: company.id, userId: company.userId });
  const latest = await db.auditJob.findFirst({ where: { companyId }, orderBy: { createdAt: "desc" } });
  const step = "Missing documents and core agents regenerated through their required local skill chains";
  await db.$transaction([
    db.company.update({ where: { id: companyId }, data: { status: "ACTIVE", crawlStatus: "PARTIAL", crawlProgress: 100, crawlStep: step, crawlError: null, lastAuditedAt: new Date() } }),
    ...(latest ? [db.auditJob.update({ where: { id: latest.id }, data: { status: "PARTIAL", progress: 100, step, error: null, completedAt: new Date() } })] : []),
  ]);
  process.stdout.write(`${step}\n`);
}

main().finally(() => db.$disconnect());
