import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { createVisualReport } from "../src/lib/documents/pdf";
import { CORE_DOCUMENTS } from "../src/lib/nodes/registry";

process.loadEnvFile?.(".env.local");
const db = new PrismaClient();

async function main() {
  const document = await db.document.findFirst({
    where: { type: "SEO_AUDIT" },
    include: { company: true },
    orderBy: { updatedAt: "desc" },
  });
  if (!document) throw new Error("Seeded SEO audit document was not found.");
  const metadata = (document.metadata as { sources?: unknown[] } | null) ?? {};
  const coreOrder = new Map(CORE_DOCUMENTS.map((definition, index) => [definition.type, index]));
  const siblingDocuments = (await db.document.findMany({ where: { companyId: document.companyId } })).filter((item) => coreOrder.has(item.type)).sort((left, right) => (coreOrder.get(left.type) ?? 99) - (coreOrder.get(right.type) ?? 99));
  const args = {
    companyName: document.company.name,
    title: siblingDocuments.length > 1 ? "Strategic Intelligence Report" : document.title,
    markdown: document.contentMarkdown,
    updatedAt: document.updatedAt,
    sourceCount: siblingDocuments.reduce((total, item) => { const itemMetadata = (item.metadata as { sources?: unknown[] } | null) ?? {}; return total + (Array.isArray(itemMetadata.sources) ? itemMetadata.sources.length : 0); }, 0) || (Array.isArray(metadata.sources) ? metadata.sources.length : 0),
    modules: siblingDocuments.length > 1 ? siblingDocuments.map((item) => ({ type: item.type, title: item.title, markdown: item.contentMarkdown })) : undefined,
  };
  const outputDirectory = path.resolve("output", "pdf");
  await mkdir(outputDirectory, { recursive: true });
  const visualReport = await createVisualReport(args);
  await Promise.all([
    writeFile(path.join(outputDirectory, "smark-connect-strategic-intelligence-report.pdf"), visualReport.pdf),
    writeFile(path.join(outputDirectory, "smark-connect-strategic-intelligence-report.html"), visualReport.html),
  ]);
  process.stdout.write(`${outputDirectory}\n${JSON.stringify(visualReport.qa)}\n`);
}

main().finally(() => db.$disconnect());
