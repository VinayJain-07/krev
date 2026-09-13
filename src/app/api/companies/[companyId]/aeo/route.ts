import { requireApiUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { scanAeoWebsite } from "@/lib/seo/aeo-live";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ companyId: string }> }) {
  const user = await requireApiUser();
  if (!user) return Response.json({ error: "Sign in to scan AEO evidence." }, { status: 401 });
  const { companyId } = await context.params;
  const company = await db.company.findFirst({
    where: { id: companyId, userId: user.id },
    select: {
      name: true,
      websiteUrl: true,
      category: true,
      crawlPages: { select: { url: true, title: true, description: true, wordCount: true, fetchedAt: true }, orderBy: { fetchedAt: "desc" }, take: 20 },
    },
  });
  if (!company) return Response.json({ error: "Company not found." }, { status: 404 });
  try {
    const report = await scanAeoWebsite({ name: company.name, websiteUrl: company.websiteUrl, category: company.category, savedCrawlPages: company.crawlPages.map((page) => ({ ...page, fetchedAt: page.fetchedAt.toISOString() })) });
    return Response.json(report, { headers: { "Cache-Control": "private, no-store" } });
  } catch (cause) {
    return Response.json({ error: cause instanceof Error ? cause.message : "AEO scan could not be completed." }, { status: 502 });
  }
}
