import { after } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { assertPublicUrl, normalizedDomain, normalizeWebsiteUrl } from "@/lib/crawl/url-safety";
import { runInitialAudit } from "@/lib/audit/run-initial-audit";
import { createOrReuseAuditJob } from "@/lib/audit/jobs";
import { resolveCompanyLogo } from "@/lib/company-logo";
import { recordCompanyCreated } from "@/lib/admin/activity";
import { extractSourceContent, sourceTypeForFilename, MAX_SOURCE_FILES_PER_UPLOAD } from "@/lib/sources/content";
import { formatMarketingBriefToMarkdown, MarketingStrategyBrief } from "@/lib/marketing-brief/types";

const schema = z.object({
  companyName: z.string().trim().min(2).max(120),
  websiteUrl: z.string().trim().min(4).max(2048),
});

export const maxDuration = 1800;

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (!user) return Response.json({ error: "Sign in to add a company." }, { status: 401 });
  if (!user.llmVerifiedAt) return Response.json({ error: "Connect and verify an LLM provider first.", requiresProvider: true }, { status: 403 });
  if (user.demoMode) return Response.json({ error: "Connect and verify a live AI provider before auditing a new company.", requiresProvider: true }, { status: 409 });

  let companyName = "";
  let websiteUrl = "";
  let marketingBrief: Partial<MarketingStrategyBrief> | null = null;
  let files: File[] = [];

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => null);
    if (!formData) return Response.json({ error: "Invalid form data submission." }, { status: 400 });
    companyName = String(formData.get("companyName") ?? "").trim();
    websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
    const briefRaw = formData.get("marketingBrief");
    if (typeof briefRaw === "string" && briefRaw.trim()) {
      try {
        marketingBrief = JSON.parse(briefRaw);
      } catch {
        // invalid JSON ignored
      }
    }
    files = formData.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
  } else {
    const body = await request.json().catch(() => null);
    companyName = String(body?.companyName ?? "").trim();
    websiteUrl = String(body?.websiteUrl ?? "").trim();
    marketingBrief = body?.marketingBrief ?? null;
  }

  const parsed = schema.safeParse({ companyName, websiteUrl });
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Enter a company name and website." }, { status: 400 });
  if (files.length > MAX_SOURCE_FILES_PER_UPLOAD) {
    return Response.json({ error: `Upload up to ${MAX_SOURCE_FILES_PER_UPLOAD} files at a time.` }, { status: 400 });
  }

  try {
    const url = await assertPublicUrl(normalizeWebsiteUrl(parsed.data.websiteUrl));
    const domain = normalizedDomain(url);
    const logoUrl = await resolveCompanyLogo(url).catch(() => null);
    const existingCompany = await db.company.findUnique({ where: { userId_normalizedDomain: { userId: user.id, normalizedDomain: domain } } });
    const company = existingCompany ?? await db.company.create({
      data: {
        userId: user.id,
        name: parsed.data.companyName,
        websiteUrl: url.href,
        normalizedDomain: domain,
        logoUrl,
        category: marketingBrief?.targetAudience?.segments?.[0] ?? undefined,
        description: marketingBrief?.positioning?.valueProposition ?? undefined,
      },
    });

    if (!existingCompany) await recordCompanyCreated(user.id, company.id);

    // 1. Process custom uploaded documents if present
    if (files.length > 0) {
      const extracted = await Promise.all(
        files.map(async (file) => ({
          title: file.name.slice(0, 240),
          sourceType: sourceTypeForFilename(file.name),
          content: await extractSourceContent(file),
        }))
      );
      await db.$transaction(
        extracted.map((source) =>
          db.chatAttachment.create({
            data: {
              companyId: company.id,
              userId: user.id,
              sourceType: source.sourceType,
              title: source.title,
              content: source.content,
              remembered: true,
            },
          })
        )
      );
    }

    // 2. Process marketing strategy brief if present
    if (marketingBrief) {
      const briefMarkdown = formatMarketingBriefToMarkdown(marketingBrief);
      if (briefMarkdown.trim()) {
        await db.chatAttachment.create({
          data: {
            companyId: company.id,
            userId: user.id,
            sourceType: "MARKETING_BRIEF",
            title: "Strategic Marketing & Geography Brief.md",
            content: briefMarkdown,
            remembered: true,
          },
        });
      }
    }

    const result = await createOrReuseAuditJob({ companyId: company.id });
    if (!result.resumed && existingCompany) {
      await db.company.update({
        where: { id: company.id },
        data: {
          name: parsed.data.companyName,
          websiteUrl: url.href,
          logoUrl: logoUrl ?? existingCompany.logoUrl,
          status: "ONBOARDING",
          crawlStatus: "QUEUED",
          crawlProgress: 0,
          crawlStep: "Queued",
          crawlError: null,
          category: marketingBrief?.targetAudience?.segments?.[0] ?? existingCompany.category,
          description: marketingBrief?.positioning?.valueProposition ?? existingCompany.description,
        },
      });
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
