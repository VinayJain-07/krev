import { PrismaClient } from "@prisma/client";
import { buildEvidencePack, runCoreDocument, saveCoreAnalysis } from "../src/lib/nodes/runner";
import { CORE_DOCUMENTS } from "../src/lib/nodes/registry";

process.loadEnvFile?.(".env.local");
const db = new PrismaClient();

async function main() {
  const [companyId, type = "COMPANY_INTELLIGENCE"] = process.argv.slice(2);
  const definition = CORE_DOCUMENTS.find((document) => document.type === type);
  if (!definition) throw new Error("Unknown core document type.");
  const company = await db.company.findUnique({ where: { id: companyId }, include: { user: true, crawlPages: { orderBy: { fetchedAt: "desc" }, take: 48 }, pageSpeedAudits: { orderBy: { createdAt: "desc" }, take: 2 } } });
  if (!company) throw new Error("Company not found.");
  const evidence = buildEvidencePack({ companyName: company.name, websiteUrl: company.websiteUrl, pages: company.crawlPages, pageSpeed: company.pageSpeedAudits });
  const result = await runCoreDocument({ definition, company, user: company.user, evidence });
  await saveCoreAnalysis({ companyId: company.id, userId: company.userId, definition, analysis: result.analysis, tokensUsed: result.tokensUsed, execution: result.execution });
  process.stdout.write(`${JSON.stringify({ type, summary: result.analysis.summary, contentLength: result.analysis.contentMarkdown.length, tokensUsed: result.tokensUsed })}\n`);
}

main().finally(() => db.$disconnect());
