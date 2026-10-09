import { after } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { canAcceptLighthouseJob, enqueueLighthouseJob } from "@/lib/lighthouse/queue";
import { LighthouseAuditError } from "@/lib/lighthouse/types";
import { lighthouseCacheKey, MAX_AUDIT_URL_LENGTH, normalizeAuditTarget } from "@/lib/lighthouse/url";
import { isActiveDuplicate, isReusableAudit } from "@/lib/lighthouse/policy";
import { isLighthouseStorageMissing, LIGHTHOUSE_STORAGE_MESSAGE } from "@/lib/lighthouse/storage";

export const runtime = "nodejs";

const requestSchema = z.object({
  url: z.string().trim().min(1, "Enter a public website URL.").max(MAX_AUDIT_URL_LENGTH),
  strategy: z.enum(["mobile", "desktop"]).default("mobile"),
  fresh: z.boolean().optional().default(false),
});

function statusForCode(code: LighthouseAuditError["code"]) {
  if (code === "RATE_LIMITED") return 429;
  if (code === "SERVER_OVERLOAD" || code === "STORAGE_UNAVAILABLE") return 503;
  if (code === "PRIVATE_URL" || code === "INVALID_URL") return 400;
  if (code === "UNREACHABLE") return 422;
  return 422;
}

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (!user) return Response.json({ error: "Sign in to run a Lighthouse audit.", code: "UNAUTHORIZED" }, { status: 401 });
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "The audit request is invalid.", code: "INVALID_URL" }, { status: 400 });
  try {
    const normalizedUrl = await normalizeAuditTarget(parsed.data.url);
    const cacheKey = lighthouseCacheKey(normalizedUrl, parsed.data.strategy);

    if (!parsed.data.fresh) {
      const active = await db.lighthouseAuditJob.findFirst({
        where: { userId: user.id, cacheKey, status: { in: ["QUEUED", "RUNNING"] } },
        orderBy: { createdAt: "desc" },
      });
      if (active && isActiveDuplicate(active)) return Response.json({ jobId: active.id, status: active.status.toLowerCase(), duplicate: true }, { status: 202 });

      const cached = await db.lighthouseAuditJob.findFirst({
        where: { userId: user.id, cacheKey, status: "COMPLETED", expiresAt: { gt: new Date() }, result: { not: Prisma.JsonNull } },
        orderBy: { completedAt: "desc" },
      });
      if (cached?.result && isReusableAudit(cached)) {
        const clone = await db.lighthouseAuditJob.create({ data: {
          userId: user.id,
          normalizedUrl: normalizedUrl.href,
          strategy: parsed.data.strategy,
          cacheKey,
          status: "COMPLETED",
          cacheHit: true,
          result: cached.result as Prisma.InputJsonValue,
          startedAt: new Date(),
          completedAt: new Date(),
          expiresAt: cached.expiresAt,
        } });
        return Response.json({ jobId: clone.id, status: "completed", cached: true });
      }
    } else {
      await db.lighthouseAuditJob.updateMany({
        where: { userId: user.id, cacheKey, status: { in: ["QUEUED", "RUNNING"] } },
        data: { status: "FAILED", errorCode: "SUPERSEDED", errorMessage: "Superseded by a fresh audit request.", completedAt: new Date() },
      });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const rateLimit = Math.max(1, Number(process.env.LIGHTHOUSE_RATE_LIMIT_PER_HOUR ?? 5));
    const recentJobs = await db.lighthouseAuditJob.count({ where: { userId: user.id, createdAt: { gte: oneHourAgo }, cacheHit: false } });
    if (recentJobs >= rateLimit) throw new LighthouseAuditError("RATE_LIMITED", `You can run up to ${rateLimit} fresh Lighthouse audits per hour.`);
    if (!canAcceptLighthouseJob()) throw new LighthouseAuditError("SERVER_OVERLOAD", "The audit queue is full. Please try again in a few minutes.");

    const job = await db.lighthouseAuditJob.create({ data: { userId: user.id, normalizedUrl: normalizedUrl.href, strategy: parsed.data.strategy, cacheKey } });
    after(async () => {
      await enqueueLighthouseJob(job.id);
    });
    return Response.json({ jobId: job.id, status: "queued", cached: false }, { status: 202 });
  } catch (error) {
    if (isLighthouseStorageMissing(error)) return Response.json({ error: LIGHTHOUSE_STORAGE_MESSAGE, code: "STORAGE_UNAVAILABLE" }, { status: 503 });
    const auditError = error instanceof LighthouseAuditError ? error : new LighthouseAuditError("AUDIT_FAILED", error instanceof Error ? error.message : "The Lighthouse audit could not be queued.");
    return Response.json({ error: auditError.message, code: auditError.code }, { status: statusForCode(auditError.code) });
  }
}
