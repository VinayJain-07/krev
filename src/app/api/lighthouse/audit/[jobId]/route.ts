import type { LighthouseAuditJob } from "@prisma/client";
import { after } from "next/server";
import { requireApiUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { enqueueLighthouseJob } from "@/lib/lighthouse/queue";
import { isLighthouseStorageMissing, LIGHTHOUSE_STORAGE_MESSAGE } from "@/lib/lighthouse/storage";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ jobId: string }> }) {
  const user = await requireApiUser();
  if (!user) return Response.json({ error: "Sign in to view Lighthouse reports.", code: "UNAUTHORIZED" }, { status: 401 });
  const { jobId } = await context.params;
  let job: LighthouseAuditJob | null;
  try {
    job = await db.lighthouseAuditJob.findFirst({ where: { id: jobId, userId: user.id } });
  } catch (error) {
    if (isLighthouseStorageMissing(error)) return Response.json({ error: LIGHTHOUSE_STORAGE_MESSAGE, code: "STORAGE_UNAVAILABLE" }, { status: 503 });
    throw error;
  }
  if (!job) return Response.json({ error: "Lighthouse audit job not found.", code: "NOT_FOUND" }, { status: 404 });
  if ((job.status === "QUEUED" || job.status === "RUNNING") && job.createdAt) {
    const timeoutBase = job.status === "RUNNING" ? job.startedAt ?? job.createdAt : job.createdAt;
    const maxAgeMs = job.status === "RUNNING" ? 210_000 : 10 * 60 * 1000;
    const ageMs = Date.now() - timeoutBase.getTime();
    if (ageMs > maxAgeMs) {
      job = await db.lighthouseAuditJob.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          errorCode: "TIMEOUT",
          errorMessage: "The audit timed out or the server restarted before completion.",
          completedAt: new Date(),
        },
      });
    }
  }
  if (job.status === "QUEUED") {
    after(async () => {
      await enqueueLighthouseJob(job.id);
    });
  }
  return Response.json({
    jobId: job.id,
    url: job.normalizedUrl,
    strategy: job.strategy,
    status: job.status.toLowerCase(),
    cached: job.cacheHit,
    createdAt: job.createdAt.toISOString(),
    startedAt: job.startedAt?.toISOString() ?? null,
    completedAt: job.completedAt?.toISOString() ?? null,
    result: job.result,
    error: job.errorMessage,
    code: job.errorCode,
  }, { headers: { "Cache-Control": "private, no-store" } });
}
