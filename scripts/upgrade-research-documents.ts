import { PrismaClient } from "@prisma/client";
import { ALL_DOCUMENTS } from "../src/lib/nodes/registry";
import { appendCompleteResearchAppendix } from "../src/lib/nodes/runner";

process.loadEnvFile?.(".env.local");
const db = new PrismaClient();

async function main() {
  const companyId = process.argv[2];
  if (!companyId) throw new Error("Pass a company id.");
  const company = await db.company.findUnique({ where: { id: companyId }, include: { documents: true, crawlPages: { orderBy: { fetchedAt: "desc" }, take: 48 }, pageSpeedAudits: { orderBy: { createdAt: "desc" }, take: 2 } } });
  if (!company) throw new Error("Company not found.");
  let upgraded = 0;
  for (const document of company.documents) {
    const definition = ALL_DOCUMENTS.find((candidate) => candidate.type === document.type);
    if (!definition) continue;
    const contentMarkdown = appendCompleteResearchAppendix(document.contentMarkdown, { companyName: company.name, websiteUrl: company.websiteUrl, pages: company.crawlPages, pageSpeed: company.pageSpeedAudits });
    const metadata = { ...((document.metadata as Record<string, unknown> | null) ?? {}), sources: company.crawlPages.map((page) => page.url), pagesIncluded: company.crawlPages.length, fullResearchAppendix: true };
    await db.document.update({ where: { id: document.id }, data: { contentMarkdown, metadata, skillProvenance: definition.skills, tokenEstimate: Math.ceil(contentMarkdown.length / 4), version: { increment: contentMarkdown === document.contentMarkdown ? 0 : 1 } } });
    upgraded += 1;
  }
  process.stdout.write(`Upgraded ${upgraded} documents with complete ${company.crawlPages.length}-page research appendices.\n`);
}

main().finally(() => db.$disconnect());
