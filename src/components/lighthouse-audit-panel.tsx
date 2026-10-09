"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, Gauge, LoaderCircle, RotateCcw, ShieldCheck } from "lucide-react";
import type { LighthouseReport, LighthouseStrategy } from "@/lib/lighthouse/types";

type JobStatus = "idle" | "queued" | "running" | "completed" | "failed";
type JobResponse = {
  jobId: string;
  status: Exclude<JobStatus, "idle">;
  cached?: boolean;
  duplicate?: boolean;
  result?: LighthouseReport | null;
  error?: string | null;
  code?: string | null;
  completedAt?: string | null;
};

const POLL_INTERVAL_MS = 2_000;
const POLL_MAX_DURATION_MS = 240_000;
const POLL_REQUEST_TIMEOUT_MS = 30_000;
const POLL_RETRY_MAX_DELAY_MS = 8_000;

function scoreClass(score: number | null) {
  return score === null ? "muted" : score >= 90 ? "good" : score >= 50 ? "warn" : "bad";
}

function formatMetric(value: number | null, kind: "ms" | "bytes" | "count" | "cls") {
  if (value === null) return "—";
  if (kind === "count") return Math.round(value).toLocaleString();
  if (kind === "cls") return value.toFixed(3);
  if (kind === "bytes") return value < 1024 ? `${Math.round(value)} B` : value >= 1024 * 1024 ? `${(value / 1024 / 1024).toFixed(1)} MB` : `${Math.round(value / 1024)} KB`;
  return value >= 1000 ? `${(value / 1000).toFixed(1)} s` : `${Math.round(value)} ms`;
}

const userFacingErrors: Record<string, string> = {
  INVALID_URL: "Enter a valid public HTTP or HTTPS website URL.",
  PRIVATE_URL: "Private, local, and internal network addresses cannot be audited.",
  UNREACHABLE: "The website could not be reached from the audit server.",
  TIMEOUT: "The website did not finish within the 180-second audit limit.",
  BROWSER_FAILURE: "The audit browser stopped unexpectedly. You can safely retry.",
  UNSUPPORTED_WEBSITE: "This website could not be audited because its response or redirects are unsupported.",
  STORAGE_UNAVAILABLE: "Lighthouse storage is not ready. Apply the database migrations and retry.",
  SERVER_OVERLOAD: "The single audit worker is at capacity. Try again shortly.",
  RATE_LIMITED: "The hourly Lighthouse audit limit has been reached.",
};

export function AuditSkeleton({ status, delayed = false }: { status: "queued" | "running"; delayed?: boolean }) {
  const running = status === "running";
  return <div className="lighthouse-progress lighthouse-progress--minimal" role="status" aria-live="polite">
    <LoaderCircle size={15} className="lighthouse-progress-icon" aria-hidden="true" />
    <div className="lighthouse-progress-copy">
      <strong>{delayed ? "Reconnecting to audit worker" : running ? "Auditing website" : "Audit queued"}</strong>
      <span>{delayed ? "The audit is still running; status updates are temporarily delayed" : running ? "Checking performance, accessibility, SEO, and best practices" : "Waiting for the audit to begin"}</span>
    </div>
    <span className="lighthouse-progress-state">{delayed ? "Reconnecting" : running ? "In progress" : "Waiting"}</span>
    <div className="audit-progress-rail" aria-hidden="true"><span className={status} /></div>
  </div>;
}

export function useLighthouseAudit(defaultUrl: string) {
  const [strategy, setStrategy] = useState<LighthouseStrategy>("mobile");
  const [status, setStatus] = useState<JobStatus>("idle");
  const [jobId, setJobId] = useState("");
  const [report, setReport] = useState<LighthouseReport | null>(null);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [cacheHit, setCacheHit] = useState(false);
  const [pollingDelayed, setPollingDelayed] = useState(false);
  const mounted = useRef(true);
  const autoStartedFor = useRef("");
  const auditRunning = useRef(false);

  const poll = useCallback(async (nextJobId: string) => {
    const startedPollingAt = Date.now();
    let consecutivePollFailures = 0;
    const waitBeforeRetry = async () => {
      consecutivePollFailures += 1;
      if (mounted.current) setPollingDelayed(true);
      const retryDelay = Math.min(POLL_INTERVAL_MS * consecutivePollFailures, POLL_RETRY_MAX_DELAY_MS);
      await new Promise((resolve) => window.setTimeout(resolve, retryDelay));
    };
    while (mounted.current) {
      const remainingPollTime = POLL_MAX_DURATION_MS - (Date.now() - startedPollingAt);
      if (remainingPollTime <= 0) {
        const timeoutError = new Error("The audit is taking longer than expected. Refresh in a moment to resume status checks.") as Error & { code?: string };
        timeoutError.code = "STATUS_TIMEOUT";
        throw timeoutError;
      }
      const requestController = new AbortController();
      const requestTimeout = window.setTimeout(() => requestController.abort(), Math.min(POLL_REQUEST_TIMEOUT_MS, remainingPollTime));
      let response: Response;
      try {
        response = await fetch(`/api/lighthouse/audit/${nextJobId}`, { cache: "no-store", signal: requestController.signal });
      } catch (cause) {
        const transientFailure = cause instanceof Error && (cause.name === "AbortError" || cause.name === "TypeError");
        if (transientFailure) {
          await waitBeforeRetry();
          continue;
        }
        throw cause;
      } finally {
        window.clearTimeout(requestTimeout);
      }

      if (response.redirected && response.url.includes("/login")) throw new Error("Your session expired. Sign in again to view the audit.");
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        await waitBeforeRetry();
        continue;
      }
      const data = await response.json() as JobResponse;
      if (!response.ok) {
        if (response.status >= 500) {
          await waitBeforeRetry();
          continue;
        }
        throw new Error(data.error ?? "The audit status could not be loaded.");
      }
      if (!mounted.current) return;
      consecutivePollFailures = 0;
      setPollingDelayed(false);
      setStatus(data.status);
      setCacheHit(Boolean(data.cached));
      if (data.status === "completed" && data.result) { setReport(data.result); return; }
      if (data.status === "failed") {
        setErrorCode(data.code ?? "AUDIT_FAILED");
        setError(userFacingErrors[data.code ?? ""] ?? data.error ?? "Lighthouse could not complete this audit.");
        return;
      }
      await new Promise((resolve) => window.setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }, []);

  const startAudit = useCallback(async (fresh = false, requestedStrategy: LighthouseStrategy = strategy) => {
    if (auditRunning.current) return;
    auditRunning.current = true;
    setStatus("queued");
    setError("");
    setErrorCode("");
    setPollingDelayed(false);
    if (fresh) setReport(null);
    try {
      const response = await fetch("/api/lighthouse/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: defaultUrl, strategy: requestedStrategy, fresh }) });
      const data = await response.json() as JobResponse;
      if (!response.ok || !data.jobId) {
        const message = userFacingErrors[data.code ?? ""] ?? data.error ?? "The Lighthouse audit could not start.";
        const requestError = new Error(message) as Error & { code?: string };
        requestError.code = data.code ?? undefined;
        throw requestError;
      }
      setJobId(data.jobId);
      setCacheHit(Boolean(data.cached));
      await poll(data.jobId);
    } catch (cause) {
      if (!mounted.current) return;
      const code = cause instanceof Error && "code" in cause ? String((cause as Error & { code?: string }).code ?? "") : "";
      setStatus("failed");
      setErrorCode(code);
      setPollingDelayed(false);
      setError(cause instanceof Error ? cause.message : "The Lighthouse audit could not start.");
    } finally {
      auditRunning.current = false;
    }
  }, [defaultUrl, poll, strategy]);

  useEffect(() => {
    mounted.current = true;
    if (defaultUrl && autoStartedFor.current !== defaultUrl) {
      autoStartedFor.current = defaultUrl;
      void startAudit(false, "mobile");
    }
    return () => { mounted.current = false; };
  }, [defaultUrl, startAudit]);

  const selectStrategy = useCallback((nextStrategy: LighthouseStrategy) => {
    if (nextStrategy === strategy) return;
    setStrategy(nextStrategy);
    void startAudit(false, nextStrategy);
  }, [startAudit, strategy]);

  return {
    strategy,
    status,
    jobId,
    report,
    error,
    errorCode,
    cacheHit,
    pollingDelayed,
    selectStrategy,
    startAudit,
  };
}

export function LighthouseReportView({ report, cacheHit, busy = false, onRunFresh }: { report: LighthouseReport; cacheHit: boolean; busy?: boolean; onRunFresh?: () => void }) {
  const metrics = [
    ["FCP", report.metrics.firstContentfulPaint.value, "ms"],
    ["LCP", report.metrics.largestContentfulPaint.value, "ms"],
    ["CLS", report.metrics.cumulativeLayoutShift.value, "cls"],
    ["TBT", report.metrics.totalBlockingTime.value, "ms"],
    ["Speed Index", report.metrics.speedIndex.value, "ms"],
    ["Interactive", report.metrics.timeToInteractive.value, "ms"],
    ["Page size", report.metrics.totalPageSize.value, "bytes"],
    ["Requests", report.metrics.requestCount.value, "count"],
  ] as const;
  const scores = [
    ["Performance", report.scores.performance],
    ["Accessibility", report.scores.accessibility],
    ["SEO", report.scores.seo],
    ["Best practices", report.scores.bestPractices],
  ] as const;

  return <div className="lighthouse-report">
    <div className="lighthouse-success" role="status"><CheckCircle2 size={15} /><span><strong>Report ready</strong><small>{cacheHit ? "Reused from the 24-hour cache" : `Completed ${new Date(report.fetchedAt).toLocaleString("en-IN")}`}</small></span><button type="button" onClick={onRunFresh} disabled={busy}><RotateCcw size={12} /> Run fresh</button></div>
    <div className="lighthouse-scores">{scores.map(([label, score]) => <div className={scoreClass(score)} key={label}><strong>{score ?? "—"}<small>{score === null ? "" : "%"}</small></strong><span>{label}</span></div>)}</div>
    <div className="lighthouse-metrics">{metrics.map(([label, value, kind]) => <div key={label}><span>{label}</span><strong>{formatMetric(value, kind)}</strong></div>)}</div>
    <details className="lighthouse-findings" open><summary>Top opportunities <span>{report.opportunities.length}</span></summary>{report.opportunities.length ? <ol>{report.opportunities.map((item) => <li key={item.id}><strong>{item.title}</strong><small>{item.displayValue ?? (item.savingsMs ? `Potential savings ${formatMetric(item.savingsMs, "ms")}` : "Review in the audit details")}</small></li>)}</ol> : <p>No scored performance opportunities were returned.</p>}</details>
    <div className="lighthouse-audit-groups"><details><summary>Failed audits <span>{report.failedAudits.length}</span></summary><ul>{report.failedAudits.map((item) => <li key={item.id}>{item.title}</li>)}</ul></details><details><summary>Passed audits <span>{report.passedAudits.length}</span></summary><ul>{report.passedAudits.map((item) => <li key={item.id}>{item.title}</li>)}</ul></details></div>
    {report.warnings.length > 0 && <details className="lighthouse-warnings"><summary><AlertTriangle size={12} /> Diagnostic warnings <span>{report.warnings.length}</span></summary><ul>{report.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></details>}
    <div className="lighthouse-report-meta"><ShieldCheck size={12} /><span>{report.provider === "pagespeed" ? "PageSpeed Insights" : "Lighthouse"} {report.lighthouseVersion} · {report.strategy} · lab test, not field data</span><a href={report.finalUrl} target="_blank" rel="noreferrer">Open tested page <ExternalLink size={10} /></a></div>
  </div>;
}

export function LighthouseAuditPanel({ defaultUrl }: { defaultUrl: string }) {
  const { strategy, status, jobId, report, error, errorCode, cacheHit, pollingDelayed, selectStrategy, startAudit } = useLighthouseAudit(defaultUrl);
  const busy = status === "queued" || status === "running";
  const targetLabel = (() => { try { return new URL(defaultUrl).hostname; } catch { return defaultUrl; } })();
  return <section className="lighthouse-panel" aria-labelledby="lighthouse-heading">
    <div className="lighthouse-heading"><span><Gauge size={17} /></span><div><strong id="lighthouse-heading">Lighthouse speed audit</strong><small>Automatically testing the company website with browser-based lab measurements</small></div></div>
    <div className="lighthouse-target"><div><span>Company website</span><a href={defaultUrl} target="_blank" rel="noreferrer">{targetLabel} <ExternalLink size={10} /></a></div><div className="lighthouse-strategy" aria-label="Audit strategy">{(["mobile", "desktop"] as const).map((item) => <button type="button" className={strategy === item ? "active" : ""} onClick={() => selectStrategy(item)} disabled={busy} key={item}>{item.slice(0, 1).toUpperCase() + item.slice(1)}</button>)}</div></div>

    {busy && <AuditSkeleton status={status} delayed={pollingDelayed} />}
    {status === "failed" && <div className="lighthouse-error" role="alert"><AlertTriangle size={17} /><div><strong>Audit not completed</strong><span>{error}</span>{errorCode && <small>Error code: {errorCode}</small>}</div><button type="button" onClick={() => void startAudit(true)}><RotateCcw size={12} /> Try again</button></div>}
    {status === "completed" && report && <LighthouseReportView report={report} cacheHit={cacheHit} busy={busy} onRunFresh={() => void startAudit(true)} />}
    {jobId && status !== "completed" && <span className="sr-only">Audit job {jobId}</span>}
  </section>;
}
