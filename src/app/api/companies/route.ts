import { after } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { assertPublicUrl, normalizedDomain, normalizeWebsiteUrl } from "@/lib/crawl/url-safety";
import { runInitialAudit } from "@/lib/audit/run-initial-audit";
import { createOrReuseAuditJob } from "@/lib/audit/jobs";
import { resolveCompanyLogo } from "@/lib/company-logo";
import { recordCompanyCreated } from "@/lib/admin/activity";

const schema = z.object({ companyName: z.string().trim().min(2).max(120), websiteUrl: z.string().trim().min(4).max(2048) });

export const maxDuration = 1800;

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (!user) return Response.json({ error: "Sign in to add a company." }, { status: 401 });
  if (!user.llmVerifiedAt) return Response.json({ error: "Connect and verify an LLM provider first.", requiresProvider: true }, { status: 403 });
  if (user.demoMode) return Response.json({ error: "Connect and verify a live AI provider before auditing a new company.", requiresProvider: true }, { status: 409 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Enter a company name and website." }, { status: 400 });
  try {
    const url = await assertPublicUrl(normalizeWebsiteUrl(parsed.data.websiteUrl));
    const domain = normalizedDomain(url);
    const logoUrl = await resolveCompanyLogo(url).catch(() => null);
    const existingCompany = await db.company.findUnique({ where: { userId_normalizedDomain: { userId: user.id, normalizedDomain: domain } } });
    const company = existingCompany ?? await db.company.create({ data: { userId: user.id, name: parsed.data.companyName, websiteUrl: url.href, normalizedDomain: domain, logoUrl } });
    if (!existingCompany) await recordCompanyCreated(user.id, company.id);
    const result = await createOrReuseAuditJob({ companyId: company.id });
    if (!result.resumed && existingCompany) {
      await db.company.update({ where: { id: company.id }, data: { name: parsed.data.companyName, websiteUrl: url.href, logoUrl: logoUrl ?? existingCompany.logoUrl, status: "ONBOARDING", crawlStatus: "QUEUED", crawlProgress: 0, crawlStep: "Queued", crawlError: null } });
    } else if (existingCompany && logoUrl && logoUrl !== existingCompany.logoUrl) {
      await db.company.update({ where: { id: company.id }, data: { name: parsed.data.companyName, websiteUrl: url.href, logoUrl } });
    }
    if (!result.resumed) {
      after(() => runInitialAudit(result.job.id));
    }
    return Response.json({ companyId: company.id, jobId: result.job.id, resumed: result.resumed }, { status: 202 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "This website could not be reached safely." }, { status: 400 });
  }
}
