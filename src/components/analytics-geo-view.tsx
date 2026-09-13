"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  FileText,
  Globe,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import type { AeoScanReport } from "@/lib/seo/geo-citability";

interface AnalyticsGeoViewProps {
  companyId: string;
  companyName: string;
  websiteUrl: string;
  geoSummary?: string | null;
}

async function fetchScan(companyId: string, signal?: AbortSignal): Promise<AeoScanReport> {
  const response = await fetch(`/api/companies/${encodeURIComponent(companyId)}/aeo`, { cache: "no-store", signal });
  const value = await response.json() as AeoScanReport & { error?: string };
  if (!response.ok) throw new Error(value.error ?? "The live AEO scan could not be completed.");
  return value;
}

export function AnalyticsGeoView({ companyId, companyName, websiteUrl, geoSummary }: AnalyticsGeoViewProps) {
  const [report, setReport] = useState<AeoScanReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPassageIndex, setSelectedPassageIndex] = useState<number | null>(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(`smark-aeo-actions:${companyId}`);
      return saved ? JSON.parse(saved) as Record<string, boolean> : {};
    } catch { return {}; }
  });

  const cleanHost = useMemo(() => {
    try { return new URL(websiteUrl).hostname.replace(/^www\./, ""); }
    catch { return websiteUrl; }
  }, [websiteUrl]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchScan(companyId, controller.signal)
      .then((value) => { if (!controller.signal.aborted) { setReport(value); setSelectedPassageIndex(0); } })
      .catch((cause) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "The live AEO scan could not be completed."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [companyId]);

  function rescan() {
    setLoading(true);
    setError("");
    void fetchScan(companyId)
      .then((value) => { setReport(value); setSelectedPassageIndex(0); })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "The live AEO scan could not be completed."))
      .finally(() => setLoading(false));
  }

  const filteredPassages = useMemo(() => (report?.answerPassages ?? []).filter((passage) => {
    const matchesType = filterType === "all" || passage.type === filterType;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || [passage.query, passage.passage, passage.path].some((value) => value.toLowerCase().includes(query));
    return matchesType && matchesSearch;
  }), [report, filterType, searchQuery]);

  const selectedPassage = selectedPassageIndex === null ? null : filteredPassages[selectedPassageIndex] ?? filteredPassages[0] ?? null;
  const completedCount = report?.strategicActions.filter((action) => completedActions[action]).length ?? 0;

  async function copyPassage(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedText(value);
      window.setTimeout(() => setCopiedText(null), 1800);
    } catch {
      setError("Clipboard access was blocked. Select the passage text to copy it.");
    }
  }

  function toggleAction(action: string) {
    setCompletedActions((current) => {
      const next = { ...current, [action]: !current[action] };
      try { localStorage.setItem(`smark-aeo-actions:${companyId}`, JSON.stringify(next)); } catch { /* Keep in memory. */ }
      return next;
    });
  }

  return (
    <div className="analytics-geo-container geo-inspector geo-single-page">
      <div className="geo-inspector-header">
        <div className="geo-inspector-title">
          <span><Globe size={16} /></span>
          <div><strong>AEO / GEO</strong><small>{companyName} · {cleanHost}</small></div>
        </div>
        <button type="button" className="geo-scan-btn" onClick={rescan} disabled={loading} title="Run a fresh live AEO scan"><RefreshCw size={12} className={loading ? "spin" : ""} /> {loading ? "Scanning" : "Rescan"}</button>
      </div>

      <p className="geo-scan-status">
        {report ? `${report.entitySignals.totalAuditedPages} of ${report.attemptedPages} pages scanned · ${new Date(report.scannedAt).toLocaleString()}` : loading ? "Fetching current public-page evidence…" : "No scan results yet."}
      </p>
      {error && <div className="geo-scan-error" role="alert"><AlertTriangle size={14} /><span>{error}</span><button type="button" onClick={rescan}>Try again</button></div>}

      {report && <>
        <section className="geo-score-ledger">
          <div className="geo-score-primary">
            <span><strong>{report.readinessScore ?? "—"}</strong><small>{report.readinessScore === null ? "" : "/100"}</small></span>
            <div><strong>On-page answer readiness</strong><small>{report.citationReadinessStage} · Based on fetched HTML, not AI search rankings</small></div>
          </div>
          <div className="geo-score-track" aria-label={report.readinessScore === null ? "Readiness not measured" : `On-page answer readiness ${report.readinessScore} out of 100`}><span style={{ width: `${report.readinessScore ?? 0}%` }} /></div>
        </section>

        <div className="geo-evidence-ledger geo-primary-evidence">
          {[
            { label: "Public pages analyzed", value: report.entitySignals.totalAuditedPages },
            { label: "Words inspected", value: report.entitySignals.totalAuditedWords },
            { label: "Direct answer passages", value: report.answerPassages.length },
            { label: "Schema.org JSON-LD types", value: report.entitySignals.schemaTypes.length },
            { label: "Lists and tables", value: report.entitySignals.structuredListsCount + report.entitySignals.tablesCount },
          ].map((row) => <div className="geo-evidence-row" key={row.label}><span className={row.value > 0 ? "good" : "warning"}>{row.value > 0 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}</span><strong>{row.label}</strong><span>{row.value}</span></div>)}
        </div>

        <div className="geo-section-heading"><div><strong>Site checks</strong><span>Current on-page and discovery signals</span></div><ShieldCheck size={15} /></div>
        <div className="geo-check-list">
          {report.checks.map((check) => <div className="geo-check-row" key={check.id}>
            <span className={`geo-check-status ${check.status}`}>{check.status === "pass" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}</span>
            <div><strong>{check.label}</strong><small>{check.detail}</small>{check.sourceUrl && <a href={check.sourceUrl} target="_blank" rel="noreferrer">View source <ArrowUpRight size={10} /></a>}</div>
            <em>{check.status === "pass" ? "Found" : check.status === "fail" ? "Needs work" : "Unverified"}</em>
          </div>)}
        </div>

        {report.failedPages.length > 0 && <div className="geo-scan-failures"><strong>{report.failedPages.length} page{report.failedPages.length === 1 ? "" : "s"} could not be checked</strong>{report.failedPages.map((item) => <p key={item.url}><a href={item.url} target="_blank" rel="noreferrer">{item.url}</a> — {item.reason}</p>)}</div>}

        {report.entitySignals.totalAuditedPages === 0 && report.savedCrawlPages.length > 0 && <>
          <div className="geo-section-heading"><div><strong>Saved crawl snapshot</strong><span>Previously collected page metadata; current HTML could not be verified</span></div><FileText size={15} /></div>
          <div className="geo-snapshot-list">
            {report.savedCrawlPages.map((page) => <div className="geo-snapshot-row" key={page.url}>
              <a href={page.url} target="_blank" rel="noreferrer">{page.title || page.url}<ArrowUpRight size={11} /></a>
              <p>{page.description || "No saved meta description"}</p>
              <small>{page.wordCount.toLocaleString()} saved words · Crawled {new Date(page.fetchedAt).toLocaleDateString()}</small>
            </div>)}
          </div>
        </>}

        <div className="geo-section-heading"><div><strong>Extracted answer passages</strong><span>Heading-and-paragraph pairs from the live pages</span></div><FileText size={15} /></div>
        <div className="geo-passages-toolbar compact">
          <label className="geo-search-input-wrap"><Search size={13} /><input type="search" aria-label="Search answer passages" placeholder="Search passages or paths" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /></label>
          <div className="geo-filter-pills">
            {(["all", "definition", "procedure", "comparison", "faq"] as const).map((type) => <button key={type} type="button" className={filterType === type ? "active" : ""} onClick={() => { setFilterType(type); setSelectedPassageIndex(0); }}>{type === "all" ? "All" : type}</button>)}
          </div>
        </div>
        <div className="geo-passage-ledger expanded">
          {filteredPassages.map((passage, index) => <button type="button" key={`${passage.sourceUrl}-${passage.heading}-${index}`} className={selectedPassage === passage ? "selected" : ""} onClick={() => setSelectedPassageIndex(index)}><span className="geo-passage-score good"><FileText size={12} /></span><span><strong>{passage.query}</strong><small>{passage.path} · {passage.type} · {passage.wordCount} words</small></span><ChevronRight size={14} /></button>)}
          {filteredPassages.length === 0 && <p className="geo-inline-empty"><Search size={15} /> {report.answerPassages.length ? "No passages match this filter." : "No direct answer passages found on the checked pages."}</p>}
        </div>

        {selectedPassage && <div className="geo-passage-detail">
          <header><div><strong>{selectedPassage.query}</strong><span>{selectedPassage.wordCount} words</span></div><button type="button" aria-label="Close passage details" onClick={() => setSelectedPassageIndex(null)}>×</button></header>
          <blockquote>{selectedPassage.passage}</blockquote>
          <div className="geo-passage-source"><span><FileText size={13} /> {selectedPassage.path}</span><strong>{selectedPassage.type}</strong></div>
          <div className="geo-passage-actions">
            <button type="button" onClick={() => void copyPassage(selectedPassage.passage)}>{copiedText === selectedPassage.passage ? <Check size={12} /> : <Copy size={12} />}{copiedText === selectedPassage.passage ? "Copied" : "Copy passage"}</button>
            <a href={selectedPassage.sourceUrl} target="_blank" rel="noreferrer"><FileText size={12} />Open source<ArrowUpRight size={11} /></a>
            <a href={`https://www.perplexity.ai/search?q=${encodeURIComponent(selectedPassage.query)}`} target="_blank" rel="noreferrer"><Bot size={12} />Test query<ArrowUpRight size={11} /></a>
          </div>
        </div>}

        {geoSummary && <div className="geo-analysis-summary"><header><Sparkles size={14} /><strong>Previous GEO agent summary</strong></header><p>{geoSummary}</p></div>}
        <p className="geo-evidence-note"><ShieldCheck size={14} /> Readiness uses only HTML fetched in this scan. Saved crawl data is labeled separately. This panel does not measure live citations, referral traffic, or rankings inside AI platforms.</p>

        <div className="geo-section-heading"><div><strong>Prioritized actions</strong><span>{completedCount} of {report.strategicActions.length} completed on this browser</span></div><Target size={15} /></div>
        <div className="geo-actions-ledger">
          {report.strategicActions.map((action) => <button type="button" key={action} className={completedActions[action] ? "completed" : ""} onClick={() => toggleAction(action)}><span>{completedActions[action] && <Check size={12} />}</span><p>{action}</p></button>)}
          {report.strategicActions.length === 0 && <p className="geo-inline-empty"><CheckCircle2 size={15} /> No immediate on-page actions from this scan.</p>}
        </div>
      </>}
    </div>
  );
}
