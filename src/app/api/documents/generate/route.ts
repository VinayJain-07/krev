import { z } from "zod";
import type { DocumentType } from "@prisma/client";
import { requireApiUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { ALL_DOCUMENTS, getDocumentDefinition } from "@/lib/nodes/registry";
import { buildEvidencePack, deriveResearchTopics, runCoreDocument, saveCoreAnalysis } from "@/lib/nodes/runner";
import { withoutSkillProvenance } from "@/lib/documents/public";

const allowed = ALL_DOCUMENTS.map((document) => document.type) as [string, ...string[]];
const schema = z.object({ companyId: z.string().min(1), documentType: z.enum(allowed) });

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (!user) return Response.json({ error: "Sign in to generate a document." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Choose a valid research document." }, { status: 400 });
  const definition = getDocumentDefinition(parsed.data.documentType as DocumentType);
  if (!definition || !ALL_DOCUMENTS.some((document) => document.type === definition.type)) return Response.json({ error: "This document is not available on demand." }, { status: 400 });
  const company = await db.company.findFirst({
    where: { id: parsed.data.companyId, userId: user.id },
    include: { user: true, crawlPages: { orderBy: { fetchedAt: "desc" }, take: 48 }, pageSpeedAudits: { orderBy: { createdAt: "desc" }, take: 2 } },
  });
  if (!company) return Response.json({ error: "Company not found." }, { status: 404 });
  const evidence = buildEvidencePack({ companyName: company.name, websiteUrl: company.websiteUrl, pages: company.crawlPages, pageSpeed: company.pageSpeedAudits });
  try {
    if (company.user.demoMode) return Response.json({ error: "Demo Mode preserves prepared documents. Connect a real provider to generate a new skill-backed document." }, { status: 409 });
    const result = await runCoreDocument({ definition, company, user: company.user, evidence, researchTopics: deriveResearchTopics(company.crawlPages, company.name) });
    await saveCoreAnalysis({ companyId: company.id, userId: company.userId, definition, analysis: result.analysis, tokensUsed: result.tokensUsed, execution: result.execution });
  } catch (error) {
    return Response.json({ error: `No document was saved because the required skill chain could not complete: ${error instanceof Error ? error.message : "unknown generation error"}` }, { status: 400 });
  }
  const document = await db.document.findUnique({ where: { companyId_type: { companyId: company.id, type: definition.type } } });
  if (!document) return Response.json({ document: null });
  const safeDocument = withoutSkillProvenance(document);
  return Response.json({ document: { ...safeDocument, createdAt: document.createdAt.toISOString(), updatedAt: document.updatedAt.toISOString() } });
}
