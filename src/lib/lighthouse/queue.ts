import { db } from "@/lib/db";
import { runLighthouseAudit } from "./engine";
import { pageSpeedConfigured, runPageSpeedAudit } from "./pagespeed";
import { LighthouseAuditError } from "./types";
import { LIGHTHOUSE_CACHE_TTL_MS } from "./policy";
import { runWithAuditTimeout } from "./runtime";

const MAX_QUEUE_DEPTH = Math.max(1, Number(process.env.LIGHTHOUSE_MAX_QUEUE_DEPTH ?? 5));

type QueueState = { pending: string[]; running: boolean };
const globalQueue = globalThis as unknown as { smarkLighthouseQueue?: QueueState };
const state = globalQueue.smarkLighthouseQueue ?? { pending: [], running: false };
globalQueue.smarkLighthouseQueue = state;

function configuredProvider() {
  const requested = process.env.SPEED_AUDIT_PROVIDER?.trim().toLowerCase();
  if (requested === "lighthouse" || requested === "pagespeed") return requested;
  return pageSpeedConfigured() ? "pagespeed" : "lighthouse";
}

async function runConfiguredAudit(url: string, strategy: "mobile" | "desktop", signal: AbortSignal) {
  if (configuredProvider() === "pagespeed") return runPageSpeedAudit(url, strategy, signal);
  return runLighthouseAudit(url, strategy, signal);
}

export function lighthouseQueueDepth() {
  return state.pending.length + (state.running ? 1 : 0);
}

export function canAcceptLighthouseJob() {
  return lighthouseQueueDepth() < MAX_QUEUE_DEPTH;
}

async function executeJob(jobId: string) {
  try {
    const claimed = await db.lighthouseAuditJob.updateMany({ where: { id: jobId, status: "QUEUED" }, data: { status: "RUNNING", startedAt: new Date(), errorCode: null, errorMessage: null } });
    if (!claimed.count) return;
    const job = await db.lighthouseAuditJob.findUnique({ where: { id: jobId } });
    if (!job) return;
    const report = await runWithAuditTimeout((signal) => runConfiguredAudit(job.normalizedUrl, job.strategy === "desktop" ? "desktop" : "mobile", signal));
    const completedAt = new Date();
    await db.lighthouseAuditJob.updateMany({ where: { id: jobId, status: "RUNNING" }, data: { status: "COMPLETED", result: report, completedAt, expiresAt: new Date(completedAt.getTime() + LIGHTHOUSE_CACHE_TTL_MS) } });
  } catch (error) {
    const auditError = error instanceof LighthouseAuditError ? error : new LighthouseAuditError("AUDIT_FAILED", error instanceof Error ? error.message : "Lighthouse could not complete the audit.");
    console.error("Lighthouse audit failed", { jobId, code: auditError.code });
    try {
      await db.lighthouseAuditJob.updateMany({ where: { id: jobId, status: "RUNNING" }, data: { status: "FAILED", errorCode: auditError.code, errorMessage: auditError.message, completedAt: new Date() } });
    } catch (persistError) {
      console.error("Lighthouse audit failure could not be persisted", { jobId, error: persistError instanceof Error ? persistError.message : String(persistError) });
    }
  }
}

async function drainQueue() {
  if (state.running) return;
  state.running = true;
  try {
    while (state.pending.length) {
      const jobId = state.pending.shift();
      if (jobId) await executeJob(jobId);
    }
  } finally {
    state.running = false;
  }
}

export async function enqueueLighthouseJob(jobId: string): Promise<void> {
  if (!state.pending.includes(jobId)) state.pending.push(jobId);
  await drainQueue();
}
