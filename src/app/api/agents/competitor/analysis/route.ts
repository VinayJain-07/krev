import "server-only";
import { requireApiUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { runCompetitorIntelligencePipeline } from "@/lib/competitors/pipeline";
import type { CompetitorIntelligencePayload } from "@/lib/competitors/types";
import { resolveCompanyLogo } from "@/lib/company-logo";
import type { Prisma } from "@prisma/client";

async function repairCachedCompetitorLogos(output: Record<string, unknown>): Promise<{ output: Record<string, unknown>; changed: boolean }> {
  if (!Array.isArray(output.competitors)) return { output, changed: false };
  let changed = false;
  const competitors = await Promise.all(output.competitors.map(async (item) => {
    if (!item || typeof item !== "object") return item;
    const competitor = item as Record<string, unknown>;
    const existingLogo = typeof competitor.logoUrl === "string" ? competitor.logoUrl.trim() : "";
    if (existingLogo) return competitor;
    const website = typeof competitor.officialWebsite === "string" ? competitor.officialWebsite.trim() : "";
    if (!website) return competitor;
    try {
      const logoUrl = await resolveCompanyLogo(new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`));
      if (!logoUrl) return competitor;
      changed = true;
      return { ...competitor, logoUrl };
    } catch {
      return competitor;
    }
  }));
  return { output: { ...output, competitors }, changed };
}

export async function GET(request: Request) {
  const user = await requireApiUser();
  if (!user) return Response.json({ error: "Sign in to view competitor intelligence." }, { status: 401 });

  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId");
  if (!companyId) return Response.json({ error: "companyId is required" }, { status: 400 });

  const company = await db.company.findFirst({
    where: { id: companyId, userId: user.id },
    select: { id: true, name: true, websiteUrl: true },
  });
  if (!company) return Response.json({ error: "Company not found." }, { status: 404 });

  // Get latest COMPETITOR AgentRun
  const latestRun = await db.agentRun.findFirst({
    where: { companyId: company.id, agentType: "COMPETITOR", status: "DONE" },
    orderBy: { createdAt: "desc" },
  });

  const output = latestRun?.output && typeof latestRun.output === "object" ? (latestRun.output as Record<string, unknown>) : null;

  const profileObj = (output?.companyProfile && typeof output.companyProfile === "object" ? output.companyProfile : {}) as Record<string, unknown>;
  const categoryStr = String(profileObj.category || "").toLowerCase();
  const isPhysical = /\b(?:extract|hemp|cannabis|cbd|thc|concentrate|botanical|supplement|food|beverage|ingredient|apparel|clothing|retail|consumer|cosmetic|skincare|manufacturing)\b/i.test(categoryStr) || company.name.toLowerCase().includes("extract");

  const hasInvalidCompetitors = Array.isArray(output?.competitors) && (output.competitors as Array<Record<string, unknown>>).some((c) => {
    const site = String(c.officialWebsite || c.website || "").toLowerCase();
    const name = String(c.name || c.companyName || "").toLowerCase();

    const isJunkHost = (
      site.includes("merriam-webster") ||
      site.includes("key-test") ||
      site.includes("keyboard-tester") ||
      site.includes("dictionary") ||
      site === "key.com" ||
      site.includes("ibx.key.com") ||
      name.includes("definition") ||
      name.includes("tester") ||
      name.includes("keybank") ||
      name.includes("meaning") ||
      name.includes("company a") ||
      name.includes("evidence review")
    );

    const isSoftwareMismatch = isPhysical && (
      site.includes("hubspot.com") ||
      site.includes("salesforce.com") ||
      site.includes("zoho.com") ||
      site.includes("monday.com") ||
      site.includes("clickup.com") ||
      site.includes("semrush.com") ||
      site.includes("ahrefs.com")
    );

    return isJunkHost || isSoftwareMismatch;
  });

  if (output && output.competitors && output.companyProfile && !hasInvalidCompetitors) {
    const repaired = await repairCachedCompetitorLogos(output);
    if (repaired.changed && latestRun) {
      await db.agentRun.update({ where: { id: latestRun.id }, data: { output: repaired.output as unknown as Prisma.InputJsonValue } });
    }
    return Response.json({
      payload: repaired.output as unknown as CompetitorIntelligencePayload,
      runId: latestRun?.id ?? null,
      lastAnalyzedAt: latestRun?.completedAt ?? null,
    });
  }

  // If no previous run or legacy format, generate on-the-fly
  try {
    const payload = await runCompetitorIntelligencePipeline({
      companyId: company.id,
      userId: user.id,
    });

    return Response.json({
      payload,
      runId: latestRun?.id ?? null,
      lastAnalyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate competitor intelligence.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (!user) return Response.json({ error: "Sign in to run competitor intelligence." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const companyId = body.companyId;
  if (!companyId) return Response.json({ error: "companyId is required" }, { status: 400 });

  const company = await db.company.findFirst({
    where: { id: companyId, userId: user.id },
    select: { id: true, name: true },
  });
  if (!company) return Response.json({ error: "Company not found." }, { status: 404 });

  try {
    const payload = await runCompetitorIntelligencePipeline({
      companyId: company.id,
      userId: user.id,
    });

    // Persist the run so subsequent queries return the verified fresh payload
    await db.agentRun.create({
      data: {
        companyId: company.id,
        agentType: "COMPETITOR",
        status: "DONE",
        output: payload as unknown as Prisma.InputJsonValue,
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    return Response.json({
      success: true,
      payload,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to run competitor intelligence pipeline.";
    return Response.json({ error: message }, { status: 500 });
  }
}
