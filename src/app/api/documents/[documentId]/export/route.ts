import { requireApiUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { createBrandedDocx } from "@/lib/documents/docx";
import { createBrandedHtml, createBrandedPdf } from "@/lib/documents/pdf";
import { createExecutivePptx } from "@/lib/documents/pptx";
import { createBrandedXlsx } from "@/lib/documents/xlsx";
import type { VisualReportCompetitor } from "@/lib/documents/pdf";
import { normalizeDocumentMarkdown, safeFilename } from "@/lib/documents/content";
import { fetchCompanyLogoAsset } from "@/lib/company-logo";
import { CORE_DOCUMENTS } from "@/lib/nodes/registry";
import { createCompanyBrief } from "@/lib/company-brief";
import { buildReportDataModel } from "@/lib/artifacts/model";
import { canonicalReportType, isArtifactEnabled, resolveArtifactManifest } from "@/lib/artifacts/config";
import { documentContentIssue } from "@/lib/documents/content-quality";
import type { ArtifactFormat } from "@/lib/artifacts/types";

export const runtime = "nodejs";

type ReportMetadata = { sources?: unknown[]; competitors?: VisualReportCompetitor[] };
async function reportCompetitors(metadata: ReportMetadata): Promise<VisualReportCompetitor[]> {
  const competitors = Array.isArray(metadata.competitors) ? metadata.competitors.slice(0, 10) : [];
  return Promise.all(competitors.map(async (competitor) => {
    if (!competitor.logoUrl) return competitor;
    try {
      const asset = await fetchCompanyLogoAsset(competitor.logoUrl);
      return asset ? { ...competitor, logoDataUrl: `data:${asset.contentType};base64,${Buffer.from(asset.body).toString("base64")}` } : competitor;
    } catch { return competitor; }
  }));
}

export async function GET(request: Request, context: { params: Promise<{ documentId: string }> }) {
  const user = await requireApiUser();
  if (!user) return Response.json({ error: "Sign in to export documents." }, { status: 401 });
  const { documentId } = await context.params;
  const document = await db.document.findFirst({ where: { id: documentId, company: { userId: user.id } }, include: { company: true } });
  if (!document) return Response.json({ error: "Document not found." }, { status: 404 });
  const url = new URL(request.url);
  const requestedFormat = url.searchParams.get("format");
  if (requestedFormat && !["pdf", "pptx", "xlsx", "docx", "html"].includes(requestedFormat)) {
    return Response.json({ error: "Choose PDF, PPTX, XLSX, DOCX, or HTML." }, { status: 400 });
  }
  const disposition = url.searchParams.get("preview") === "1" ? "inline" : "attachment";
  const metadata = (document.metadata as ReportMetadata | null) ?? {};
  const competitors = Array.isArray(metadata.competitors) ? metadata.competitors : [];
  const documentManifest = resolveArtifactManifest({ reportType: document.type, markdown: document.contentMarkdown, metadata, competitorCount: competitors.length });
  const format = requestedFormat || documentManifest.primaryArtifact;
  if ((format === "pdf" || format === "pptx" || format === "xlsx") && !isArtifactEnabled(documentManifest, format as ArtifactFormat)) {
    return Response.json({ error: documentManifest.decisions[format as ArtifactFormat].reason, manifest: documentManifest }, { status: 409 });
  }
  // Support company-wide master dossier compilation (18-22 pages across all modules)
  const includeAllModules = url.searchParams.get("scope") === "company" || (document.type as string) === "STRATEGIC_INTELLIGENCE";
  const coreOrder = new Map<string, number>(CORE_DOCUMENTS.map((definition, index) => [definition.type, index]));
  const siblingDocuments = includeAllModules ? await db.document.findMany({ where: { companyId: document.companyId }, orderBy: { updatedAt: "desc" } }) : [];
  const coreByCanonicalType = new Map<string, typeof siblingDocuments[number]>();
  for (const item of siblingDocuments) {
    const canonicalType = canonicalReportType(item.type);
    if (!coreOrder.has(canonicalType)) continue;
    const previous = coreByCanonicalType.get(canonicalType);
    if (!previous || item.updatedAt > previous.updatedAt) coreByCanonicalType.set(canonicalType, item);
  }
  const coreDocuments = Array.from(coreByCanonicalType.values()).sort((left, right) => (coreOrder.get(canonicalReportType(left.type)) ?? 99) - (coreOrder.get(canonicalReportType(right.type)) ?? 99));
  const modules = await Promise.all(coreDocuments.map(async (item) => {
    const itemMetadata = (item.metadata as ReportMetadata | null) ?? {};
    return { type: item.type, title: item.title, markdown: normalizeDocumentMarkdown(item.contentMarkdown), competitors: item.type === "COMPETITOR_ANALYSIS" ? await reportCompetitors(itemMetadata) : [] };
  }));
  const reportType = includeAllModules && modules.length > 1 ? "STRATEGIC_INTELLIGENCE" : document.type;
  const title = includeAllModules && modules.length > 1 ? "Strategic Intelligence Report" : document.title;
  const markdown = normalizeDocumentMarkdown(includeAllModules && modules.length > 1 ? modules.map((module) => `# ${module.title}\n\n${module.markdown}`).join("\n\n") : document.contentMarkdown);
  const qualityIssue = documentContentIssue(markdown);
  if (qualityIssue) return Response.json({ error: `${qualityIssue} Open the document and choose Repair report before exporting.` }, { status: 409 });
  const sourceCount = includeAllModules && modules.length > 1 ? coreDocuments.reduce((total, item) => { const itemMetadata = (item.metadata as ReportMetadata | null) ?? {}; return total + (Array.isArray(itemMetadata.sources) ? itemMetadata.sources.length : 0); }, 0) : Array.isArray(metadata.sources) ? metadata.sources.length : 0;
  const manifest = resolveArtifactManifest({ reportType, markdown, metadata, competitorCount: competitors.length });
  const reportModel = buildReportDataModel({
    reportType,
    companyName: document.company.name,
    companyWebsite: document.company.websiteUrl,
    companyCategory: document.company.category,
    title,
    markdown,
    updatedAt: document.updatedAt,
    sourceCount,
    competitors: competitors.map((competitor) => ({ companyName: competitor.companyName, officialWebsite: competitor.officialWebsite, positioning: competitor.positioning, competitiveAttributes: competitor.competitiveAttributes })),
    manifest,
  });
  const args = { companyName: document.company.name, companyWebsite: document.company.websiteUrl, companyCategory: document.company.category, companyBrief: createCompanyBrief(document.company), title, documentType: canonicalReportType(reportType), markdown, updatedAt: document.updatedAt, sourceCount, modules: includeAllModules && modules.length > 1 ? modules : undefined, reportModel, manifest };
  let body: Buffer;
  try {
    body = format === "docx" ? await createBrandedDocx(args) : format === "pptx" ? await createExecutivePptx({ model: reportModel, manifest }) : format === "xlsx" ? await createBrandedXlsx(args) : format === "html" ? await createBrandedHtml(args) : await createBrandedPdf(args);
  } catch (error) {
    console.error("Document export failed", { documentId, format, error });
    return Response.json({ error: `The ${format.toUpperCase()} could not be prepared. Please retry or choose another available format.` }, { status: 500 });
  }
  const extension = format;
  const contentType = format === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : format === "pptx" ? "application/vnd.openxmlformats-officedocument.presentationml.presentation" : format === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : format === "html" ? "text/html; charset=utf-8" : "application/pdf";
  return new Response(new Uint8Array(body), { headers: { "Content-Type": contentType, "Content-Disposition": `${disposition}; filename="${safeFilename(`${document.company.name}-${document.title}`)}.${extension}"`, "Cache-Control": "private, no-store" } });
}
