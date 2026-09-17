"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { DocumentType } from "@prisma/client";
import { Activity, AlertTriangle, Bot, Check, CheckCircle2, ChevronDown, ChevronRight, CirclePlus, Clock3, Copy, ExternalLink, FileText, Globe2, GripVertical, HelpCircle, LayoutGrid, Link2, Lock, MessageCircle, Monitor, PanelLeftClose, PanelLeftOpen, Paperclip, Pencil, Plus, Radio, RefreshCw, RotateCcw, Send, Settings, Smartphone, Sparkles, Trash2, UploadCloud, XCircle, Zap, X as CloseIcon } from "lucide-react";
import { StreamingTerminal, type TerminalLog } from "./streaming-terminal";
import { AGENT_DEFINITIONS, EXTENDED_DOCUMENTS, getDocumentDefinition } from "@/lib/nodes/registry";
import { normalizeAcronyms, unwrapStructuredText } from "@/lib/text-format";
import { evaluateLinkedInOpportunity, evaluateRedditCandidate, evaluateXOpportunity, scoreOpportunity, type RedditActionFeedOpportunity } from "@/lib/signals/store";
import { RedditOpportunityFeed } from "./reddit-opportunity-feed";
import { InstagramOpportunityFeed } from "./instagram-opportunity-feed";
import { XOpportunityFeed } from "./x-opportunity-feed";
import { LinkedInAgentFeed } from "./linkedin-agent-feed";
import type { XOpportunity } from "@/lib/x/types";
import type { InstagramOpportunity, InstagramOpportunityMap } from "@/lib/instagram/types";
import { CompetitorAgentViewer } from "./competitor-agent-viewer";
import { Brand } from "./brand";
import { DocumentWorkspace, type WorkspaceDocument } from "./document-workspace";
import { LogoutButton } from "./logout-button";
import { ModuleIcon, isCoreModule } from "./module-icon";
import { AuditSkeleton, LighthouseAuditPanel, useLighthouseAudit } from "./lighthouse-audit-panel";
import { AnalyticsGeoView } from "./analytics-geo-view";
import { AnalyticsLinksView } from "./analytics-links-view";
import { AnalyticsTechnicalView } from "./analytics-technical-view";
import { LiveConversationMining } from "./live-conversation-mining";
import { extractContextCompetitorsFromAgentOutput, selectContextCompetitors } from "@/lib/competitors/context-display";

export type FindingKind = "current_status" | "previous_post" | "new_post" | "comment_opportunity" | "audience_signal" | "insight";
export type Finding = { title?: string; evidence?: string; impact?: string; action?: string; description?: string; kind?: FindingKind; platform?: string; sourceLabel?: string; publishedAt?: string; draftContent?: string; recommendedResponse?: string; tags?: string[]; priority?: string; confidence?: number; sourceUrls?: string[]; companyName?: string; officialWebsite?: string; logoUrl?: string; competitiveAttributes?: string[] };
type AgentItem = { id: string; agentType: string; status: string; summary: string | null; output: unknown; sources: unknown; skills: unknown; confidence: number | null; tokensUsed: number; error: string | null; createdAt: string };
type AnalysisSource = { id: string; title: string; sourceType: string; characterCount: number; createdAt: string };
type DashboardData = {
  company: { id: string; name: string; websiteUrl: string; logoUrl: string | null; category: string | null; description?: string | null; companyContext: { overview: string; signals: Array<{ label: string; text: string }>; evidenceLabel: string }; lastAuditedAt: string | null };
  companies: Array<{ id: string; name: string; websiteUrl: string; logoUrl: string | null; status: string }>;
  user: { name: string | null; email: string; llmProvider: string | null; llmKeyPreview: string | null; demoMode: boolean; tokenBudget: number; tokenUsed: number };
  documents: WorkspaceDocument[];
  agents: AgentItem[];
  pagesRead: number;
  crawlPages: Array<{ url: string; title: string | null; description: string | null; content: string | null }>;
  analysis: { jobId: string; status: string; progress: number; step: string } | null;
  integrations: Array<{ provider: string; status: string; connectedAt: string | null }>;
  agentConfigs: Array<{ agentType: string; config: unknown }>;
  sources: AnalysisSource[];
  chat: { sessionId: string; messages: Array<{ id: string; role: "user" | "assistant"; content: string; createdAt: string }> } | null;
};

const SOURCE_FILE_ACCEPT = ".pdf,.docx,.pptx,.xlsx,.odt,.odp,.ods,.rtf,.epub,.md,.markdown,.txt,.csv,.tsv,.json,.jsonl,.html,.htm,.xml,.yaml,.yml,.log,.sql,.js,.jsx,.ts,.tsx,.py,.java,.css";

function safeHostname(url: string | null | undefined): string {
  if (!url) return "website";
  try {
    const valid = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    return new URL(valid).hostname.replace(/^www\./, "") || "website";
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] || "website";
  }
}

const coreDocumentOrder = ["COMPETITOR_ANALYSIS", "COMPANY_INTELLIGENCE", "SEO_AUDIT", "GEO_AUDIT", "AUDIENCE_ANALYSIS", "CONTENT_AUDIT"];
const coreDocumentLabels: Record<string, string> = { COMPANY_INTELLIGENCE: "Company and Product Intelligence", SEO_AUDIT: "SEO Audit", GEO_AUDIT: "GEO and AI Visibility", COMPETITOR_ANALYSIS: "Competitive Landscape and Comparison Playbook", AUDIENCE_ANALYSIS: "Audience Analysis", CONTENT_AUDIT: "Content Audit and Full-Funnel Strategy" };
const queuedDocumentTypes = [...coreDocumentOrder, ...EXTENDED_DOCUMENTS.map((definition) => definition.type)];
const primaryAgents = [
  ["REDDIT", "Reddit", "r/", "Discovered discussions ready"],
  ["INSTAGRAM", "Instagram", "IG", "Visual opportunities ready"],
  ["X", "X", "X", "Publish-ready angles"],
  ["LINKEDIN", "LinkedIn", "in", "Thought-leadership posts"],
  ["SEO", "SEO Audit Agent", "SEO", "Recommendations and search fixes"],
  ["ARTICLES", "Articles", "A", "Authority topics ready"],
  ["TECHNICAL_SEO", "Technical SEO", "T", "Technical diagnostic and crawlability"],
  ["AUDIENCE", "Audience Agent", "ICP", "ICP, jobs and voice-of-customer"],
  ["CONTENT_AUDIT", "Content Strategy Agent", "M", "Content gaps and editorial briefs"],
  ["COMPETITOR", "Competitor Analysis", "C", "Verified competitor intelligence"],
  ["PROGRAMMATIC_SEO", "Programmatic SEO", "P", "Template uniqueness and index safeguards"],
  ["AI_CMO", "AI CMO Director", "CMO", "Strategic executive synthesis"],
] as const;
const agentLogoPaths: Record<string, string> = {
  X: "/agent-logos/x.svg",
  REDDIT: "/agent-logos/reddit.svg",
  LINKEDIN: "/agent-logos/linkedin.svg",
  INSTAGRAM: "/agent-logos/instagram.svg",
};

type PaneId = "context" | "analytics" | "agents" | "chat";
type PaneSizes = Record<PaneId, number>;

const defaultPaneOrder: PaneId[] = ["context", "analytics", "agents", "chat"];
const defaultPaneSizes: PaneSizes = { context: 23, analytics: 29, agents: 25, chat: 23 };
const paneMinimums: Record<PaneId, number> = { context: 220, analytics: 330, agents: 300, chat: 300 };
const paneLabels: Record<PaneId, string> = { context: "Context", analytics: "Analytics", agents: "Action Feed", chat: "AI CMO" };

function isPaneId(value: unknown): value is PaneId {
  return typeof value === "string" && defaultPaneOrder.includes(value as PaneId);
}

function documentPreview(document: WorkspaceDocument) {
  return unwrapStructuredText(document.contentMarkdown)
    .replace(/[#*_>`|\[\]()~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 190);
}

function CompanyLogo({ company, size = 28, eager = false }: { company: { id: string; name: string }; size?: number; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <span className="company-logo" style={{ width: size, height: size }}>
    {!failed && <Image unoptimized loading={eager ? "eager" : "lazy"} src={`/api/companies/${company.id}/logo`} alt={`${company.name} logo`} width={size} height={size} onError={() => setFailed(true)} />}
    {failed && <span aria-hidden="true">{company.name.slice(0, 1).toUpperCase()}</span>}
  </span>;
}

function AgentLogo({ type, fallback }: { type: string; fallback: string }) {
  const logoPath = agentLogoPaths[type];
  const hasModuleIcon = !logoPath && isCoreModule(type);
  return <span className={`agent-icon agent-${type.toLowerCase()} ${logoPath ? "has-brand-logo" : ""} ${hasModuleIcon ? "has-module-icon" : ""}`}>
    {logoPath ? <Image src={logoPath} alt="" width={28} height={28} /> : isCoreModule(type) ? <ModuleIcon type={type} size={17} /> : fallback}
  </span>;
}

const platformLabels: Record<string, string> = { anthropic: "Anthropic", openai: "OpenAI", openrouter: "OpenRouter", google: "Google", github: "GitHub", x: "X", linkedin: "LinkedIn", reddit: "Reddit", whatsapp: "WhatsApp", telegram: "Telegram" };

function PlatformMark({ provider }: { provider: string }) {
  const type = provider.toUpperCase() === "X" ? "X" : provider.toUpperCase() === "LINKEDIN" ? "LINKEDIN" : provider.toUpperCase() === "REDDIT" ? "REDDIT" : "";
  const logoPath = agentLogoPaths[type];
  return <span className={`platform-mark platform-${provider}`}>{logoPath ? <Image src={logoPath} alt="" width={14} height={14} /> : (platformLabels[provider] ?? provider).slice(0, 1).toUpperCase()}</span>;
}

function ConnectionStrip({ data }: { data: DashboardData }) {
  const integrations = data.integrations.filter((item) => /connected|active/i.test(item.status));
  const connections = [
    ...(data.user.llmProvider ? [{ provider: data.user.llmProvider, status: data.user.demoMode ? "demo" : "live", connectedAt: null }] : []),
    ...integrations.map((item) => ({ ...item, status: data.user.demoMode || item.status.startsWith("demo") ? "demo" : "live" })),
  ];
  if (!connections.length) return <span className="connection-strip empty"><span className="connection-dot" /> No live APIs</span>;
  return <div className="connection-strip" aria-label="Connected platforms"><strong>{connections.some((item) => item.status === "live") ? "LIVE" : "DEMO"}</strong>{connections.slice(0, 5).map((item, index) => <span className={item.status} title={`${platformLabels[item.provider] ?? item.provider} · ${item.status === "live" ? "live API connected" : "demo data only"}`} key={`${item.provider}-${index}`}><PlatformMark provider={item.provider} />{platformLabels[item.provider] ?? item.provider}</span>)}{connections.length > 5 && <em>+{connections.length - 5}</em>}</div>;
}

function findings(output: unknown): Finding[] {
  const values = Array.isArray(output) ? output : output && typeof output === "object" && "findings" in output && Array.isArray((output as { findings: unknown }).findings) ? (output as { findings: unknown[] }).findings : [];
  return values.map((item): Finding => {
    if (typeof item === "string") return { title: "Draft", description: unwrapStructuredText(item) };
    if (!item || typeof item !== "object") return {};
    const value = item as Finding;
    return {
      ...value,
      title: normalizeAcronyms(unwrapStructuredText(value.title)),
      evidence: unwrapStructuredText(value.evidence),
      description: unwrapStructuredText(value.description),
      impact: unwrapStructuredText(value.impact),
      action: unwrapStructuredText(value.action),
      draftContent: unwrapStructuredText(value.draftContent),
      recommendedResponse: unwrapStructuredText(value.recommendedResponse),
      companyName: unwrapStructuredText(value.companyName),
      competitiveAttributes: value.competitiveAttributes?.map(unwrapStructuredText).filter(Boolean),
    };
  }).filter((item) => item.title || item.description || item.evidence);
}

function CleanMarkdown({ children }: { children: unknown }) {
  const text = unwrapStructuredText(children);
  return text ? <div className="clean-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h1: ({ children: content }) => <p className="markdown-subhead"><strong>{content}</strong></p>, h2: ({ children: content }) => <p className="markdown-subhead"><strong>{content}</strong></p>, h3: ({ children: content }) => <p className="markdown-subhead"><strong>{content}</strong></p> }}>{text}</ReactMarkdown></div> : null;
}

function paragraphText(value: unknown) {
  return unwrapStructuredText(value)
    .replace(/(^|\s)#{1,6}\s+/g, " ")
    .replace(/[*_`>|\[\]]+/g, " ")
    .replace(/(^|\s)[-•]\s+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function mergeFindingText(first?: string, second?: string) {
  return Array.from(new Set([first, second].map(paragraphText).filter(Boolean))).join(" ");
}

function consolidateCompetitorFindings(items: Finding[]) {
  const grouped = new Map<string, Finding>();
  items.forEach((item, index) => {
    const identity = item.companyName || item.officialWebsite || item.title || `competitor-${index}`;
    const key = identity.toLowerCase().replace(/https?:\/\//g, "").replace(/^www\./, "").replace(/[^a-z0-9]+/g, "-");
    const current = grouped.get(key);
    if (!current) {
      grouped.set(key, item);
      return;
    }
    grouped.set(key, {
      ...current,
      ...item,
      companyName: current.companyName || item.companyName,
      officialWebsite: current.officialWebsite || item.officialWebsite,
      logoUrl: current.logoUrl || item.logoUrl,
      title: current.title || item.title,
      evidence: mergeFindingText(current.evidence || current.description, item.evidence || item.description),
      description: mergeFindingText(current.description, item.description),
      impact: mergeFindingText(current.impact, item.impact),
      action: mergeFindingText(current.action, item.action),
      sourceUrls: Array.from(new Set([...(current.sourceUrls || []), ...(item.sourceUrls || [])])),
      competitiveAttributes: Array.from(new Set([...(current.competitiveAttributes || []), ...(item.competitiveAttributes || [])])),
    });
  });
  return Array.from(grouped.values());
}

function OfficialCompetitorLogo({ item }: { item: Finding }) {
  const [useFallback, setUseFallback] = useState(false);
  const [useGoogle, setUseGoogle] = useState(false);
  const [useDirectFallback, setUseDirectFallback] = useState(false);
  const name = item.companyName || item.title || "Competitor";
  const website = item.officialWebsite || item.sourceUrls?.[0];
  let domain = "";
  if (website) {
    try { domain = new URL(website.startsWith("http") ? website : `https://${website}`).hostname.replace(/^www\./, ""); } catch {}
  }

  if (item.logoUrl && !useFallback) {
    const src = item.logoUrl.startsWith("data:") ? item.logoUrl : `/api/assets/logo?url=${encodeURIComponent(item.logoUrl)}`;
    return <span className="competitor-logo"><Image unoptimized src={src} alt={`${name} official logo`} width={48} height={48} onError={() => setUseFallback(true)} /></span>;
  }

  if (domain && !useGoogle) {
    const src = useDirectFallback
      ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
      : `/api/assets/logo?website=${encodeURIComponent(website || domain)}`;
    return <span className="competitor-logo"><Image unoptimized src={src} alt={`${name} logo`} width={48} height={48} onError={() => useDirectFallback ? setUseGoogle(true) : setUseDirectFallback(true)} /></span>;
  }

  return <span className="competitor-logo"><span aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span></span>;
}

function ContextCompetitor({ item }: { item: Finding }) {
  const name = item.companyName || item.title || "Competitor";
  const website = item.officialWebsite || item.sourceUrls?.[0];
  let host = "Verified competitor";
  if (website) {
    try { host = new URL(website).hostname.replace(/^www\./, ""); } catch { host = "Official website"; }
  }
  const content = <><OfficialCompetitorLogo item={item} /><span><strong>{name}</strong><small>{host}</small></span></>;
  return website ? <a className="context-competitor" href={website} target="_blank" rel="noreferrer" title={`Open ${name} official website`}>{content}<ExternalLink size={10} /></a> : <div className="context-competitor">{content}</div>;
}

function CompetitorFindingCard({ item }: { item: Finding }) {
  const competitorName = item.companyName || item.title || "Competitor";
  const overview = paragraphText(item.evidence || item.description);
  const positioning = paragraphText(item.impact);
  const response = paragraphText(item.action);
  const attributes = item.competitiveAttributes?.map(paragraphText).filter(Boolean) || [];
  const workflowSteps = AGENT_DEFINITIONS.find((agent) => agent.type === "COMPETITOR")?.skills.length || 0;
  return (
    <article className="competitor-finding-card">
      <div className="competitor-card-head">
        <OfficialCompetitorLogo item={item} />
        <div>
          <span className="verified-badge">VERIFIED MARKET COMPETITOR</span>
          <h3>{competitorName}</h3>
          {item.officialWebsite && (
            <a href={item.officialWebsite} target="_blank" rel="noreferrer" className="competitor-website-link">
              {item.officialWebsite.replace(/^https?:\/\//i, "").replace(/\/$/, "")} <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>
      <div className="competitor-summary-paragraphs">
        {overview && <p>{overview}</p>}
        {attributes.length > 0 && <p><strong>Known for.</strong> {attributes.join(", ")}.</p>}
        {positioning && <p><strong>Strategic relevance.</strong> {positioning}</p>}
        {response && <p><strong>Recommended response.</strong> {response}</p>}
      </div>
      <footer className="competitor-skill-synthesis"><Sparkles size={11} /> Synthesized through the {workflowSteps}-step competitor research workflow</footer>
    </article>
  );
}

function savedOpportunityKeys(configs: DashboardData["agentConfigs"]): string[] {
  return configs.flatMap((entry) => {
    if (!entry.config || typeof entry.config !== "object" || Array.isArray(entry.config)) return [];
    const values = (entry.config as Record<string, unknown>).completedOpportunities;
    return Array.isArray(values) ? values.filter((value): value is string => typeof value === "string") : [];
  });
}

function savedManualCompetitors(configs: DashboardData["agentConfigs"]): Finding[] {
  const entry = configs.find((config) => config.agentType === "COMPETITOR");
  if (!entry?.config || typeof entry.config !== "object" || Array.isArray(entry.config)) return [];
  const values = (entry.config as Record<string, unknown>).manualCompetitors;
  if (!Array.isArray(values)) return [];
  return values.flatMap((value): Finding[] => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    const item = value as Record<string, unknown>;
    const companyName = typeof item.companyName === "string" ? item.companyName.trim() : "";
    const officialWebsite = typeof item.officialWebsite === "string" ? item.officialWebsite.trim() : "";
    if (!companyName || !officialWebsite) return [];
    return [{ companyName, title: companyName, officialWebsite, sourceUrls: [officialWebsite] }];
  });
}

function agentStatusSummary(type: string, run: AgentItem | undefined, items: Finding[]) {
  if (!run) return "Ready to run directly from current source evidence";
  const structured = items.filter((item) => item.kind);
  if (["X", "REDDIT", "LINKEDIN"].includes(type)) {
    const output = run.output && typeof run.output === "object" ? run.output as Record<string, unknown> : null;
    const storedOpportunities = output && Array.isArray(output.opportunities) ? output.opportunities.length : 0;
    const count = storedOpportunities || structured.length || items.length;
    return `${count} ${type === "X" ? "posts" : "opportunities"} ready`;
  }
  const summaryCandidate = unwrapStructuredText(run.summary ?? `${items.length} findings ready`).replace(/\s+/g, " ").trim();
  const summary = /(?:^|\s)[{[]\s*"|contentMarkdow|"(?:company|agent|findings)"\s*:/i.test(summaryCandidate) ? `${items.length} findings ready` : summaryCandidate;
  return summary.length > 150 ? `${summary.slice(0, 147).trimEnd()}…` : summary;
}

function opportunityKey(type: string, item: Finding, index: number) {
  return `${type}|${item.kind ?? "insight"}|${item.sourceUrls?.[0] ?? "no-source"}|${item.title ?? "untitled"}|${index}`.slice(0, 700);
}

function SocialFindingCard({ type, item, index, company, liveConnected, completed, onComplete, onRegenerate }: { type: "X" | "REDDIT" | "LINKEDIN"; item: Finding; index: number; company: DashboardData["company"]; liveConnected: boolean; completed: boolean; onComplete: () => Promise<void>; onRegenerate: () => void }) {
  const kind = item.kind ?? (index === 0 ? "current_status" : type === "REDDIT" ? "comment_opportunity" : index === 1 ? "previous_post" : index === 2 ? "new_post" : "comment_opportunity");
  const initialDraft = kind === "new_post" ? item.draftContent || item.action || "" : item.recommendedResponse || item.action || "";
  const [draft, setDraft] = useState(initialDraft);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const source = item.sourceUrls?.[0];
  const host = safeHostname(company.websiteUrl);
  const handle = `@${host.split(".")[0].replace(/[^a-z0-9_]/gi, "")}`;
  const platformName = type === "REDDIT" ? "Reddit" : type === "LINKEDIN" ? "LinkedIn" : "X";
  const sourceName = item.sourceLabel || (source ? safeHostname(source) : "Company draft");

  async function copyDraft() {
    if (!draft.trim()) return;
    await navigator.clipboard.writeText(draft.trim());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function markComplete() {
    setSaving(true);
    try { await onComplete(); setOpen(false); } finally { setSaving(false); }
  }

  const [showWhy, setShowWhy] = useState(false);

  const evalData = useMemo(() => {
    if (type === "REDDIT") {
      return evaluateRedditCandidate({
        id: item.title ?? "reddit-opportunity",
        title: item.title ?? "Reddit conversation opportunity",
        subreddit: item.tags?.[0] || "SEO",
        body: item.evidence ?? item.description,
        companyName: company.name,
      });
    }
    if (type === "LINKEDIN") {
      return evaluateLinkedInOpportunity({
        id: item.title ?? "linkedin-opportunity",
        topic: item.title ?? "Manual client reporting bottleneck",
        signalCount: 12,
        companyName: company.name,
      });
    }
    return evaluateXOpportunity({
      id: item.title ?? "x-opportunity",
      topic: item.title ?? "Internal linking architecture",
      auditFinding: item.evidence ?? "42% of analyzed pages have weak internal linking",
      companyName: company.name,
    });
  }, [item, type, company.name]);

  const detail = open && <div className="social-opportunity-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className={`social-opportunity-drawer platform-${type.toLowerCase()}`} role="dialog" aria-modal="true" aria-label={`${platformName} opportunity`}>
    <header>
      <div>
        <PlatformMark provider={type.toLowerCase()} />
        <span><strong>{platformName.toUpperCase()} OPPORTUNITY</strong><small>Score: {evalData.score.total}/100 ({evalData.score.tier})</small></span>
      </div>
      <button type="button" aria-label="Close" onClick={() => setOpen(false)}><CloseIcon size={19} /></button>
    </header>

    <div className="opportunity-body">
      <div className="pillar-block">
        <span className="pillar-label">1. WHAT HAPPENED?</span>
        <h2>{item.title}</h2>
        <p className="pillar-text">{evalData.whatHappened}</p>
      </div>

      <div className="pillar-block">
        <div className="pillar-header-row">
          <span className="pillar-label">2. WHY SHOULD I CARE?</span>
          <button type="button" className="why-matched-toggle" onClick={() => setShowWhy(!showWhy)}>
            <HelpCircle size={12} /> Why am I seeing this?
          </button>
        </div>
        <p className="pillar-text">{evalData.whyMatters}</p>

        {showWhy && <div className="why-matched-box">
          <strong>Match criteria verified:</strong>
          <ul>
            {evalData.whyMatched.map((reason, idx) => <li key={idx}>{reason}</li>)}
          </ul>
        </div>}

        <div className="evidence-quote-box">
          <small>EVIDENCE</small>
          <CleanMarkdown>{item.evidence || item.description || evalData.evidenceQuotes[0]}</CleanMarkdown>
        </div>
      </div>

      <div className="pillar-block">
        <span className="pillar-label">3. WHAT SHOULD I DO?</span>
        <p className="pillar-text"><strong>Action:</strong> {evalData.whatToDo}</p>
        {evalData.suggestedAngle && <small className="angle-tag"><strong>Best Angle:</strong> {evalData.suggestedAngle}</small>}
      </div>

      <div className="pillar-block">
        <span className="pillar-label">4. WHAT HAS AI PREPARED?</span>
        <section className="recommended-response">
          <div className="response-heading">
            <strong>AI Draft Content</strong>
            <div>
              <button type="button" onClick={() => { setDraft(initialDraft); onRegenerate(); }}><RefreshCw size={14} /> Regenerate</button>
              <button type="button" onClick={() => document.getElementById(`response-${type}-${index}`)?.focus()} aria-label="Edit response"><Pencil size={15} /></button>
              <button type="button" onClick={copyDraft} aria-label="Copy response">{copied ? <Check size={15} /> : <Copy size={15} />}</button>
            </div>
          </div>
          <textarea id={`response-${type}-${index}`} value={draft} onChange={(event) => setDraft(event.target.value)} rows={7} placeholder="AI generated response..." />
        </section>
      </div>
    </div>

    <footer>
      <button type="button" disabled={saving || completed} onClick={markComplete}>
        <Check size={17} />{saving ? "Saving…" : completed ? "Completed" : "Mark as Complete"}
      </button>
    </footer>
  </section></div>;

  if (type === "X") {
    return <article className="live-social-post-card">
      <div className="post-copy-body">
        <CleanMarkdown>{draft || item.draftContent || item.evidence || item.description}</CleanMarkdown>
      </div>
      <div className="post-card-bottom-actions">
        <button type="button" className={`post-check-btn ${completed ? "completed" : ""}`} onClick={markComplete} title={completed ? "Reviewed" : "Mark as reviewed"}>
          <Check size={14} />
        </button>
        <button type="button" className="post-publish-btn" onClick={copyDraft}>
          {copied ? "Copied" : "𝕏 Post"}
        </button>
      </div>
    </article>;
  }

  if (type === "REDDIT") {
    const subreddit = item.tags?.find((tag) => /^r\//i.test(tag)) || item.sourceLabel || "Reddit";
    return <article className="reddit-opportunity-row">
      <div className="reddit-row-content">
        <h4 className="reddit-post-title">{item.title}</h4>
        <div className="reddit-row-meta">
          <span className="subreddit-pill">{subreddit.startsWith("r/") ? subreddit : `r/${subreddit}`}</span>
          <span className="reddit-stat">Verified thread</span>
        </div>
      </div>
      <button type="button" className="reddit-post-btn" onClick={() => setOpen(true)}>Post</button>
      {detail}
    </article>;
  }

  if (kind === "current_status") return <article className="agent-status-card">
    <div><span className="status-pulse" /><strong>CURRENT STATUS</strong><em>{liveConnected ? `Live ${platformName} API` : "Public discovery"}</em></div>
    <h3>{item.title || `${platformName} status`}</h3><CleanMarkdown>{item.evidence ?? item.description}</CleanMarkdown>{item.impact && <small>{unwrapStructuredText(item.impact)}</small>}
  </article>;

  if (kind === "previous_post") return <article className={`social-history-card platform-${type.toLowerCase()}`}>
    <div className="social-history-head"><PlatformMark provider={type.toLowerCase()} /><span><strong>PREVIOUS POST SUMMARY</strong><small>{item.publishedAt || sourceName}</small></span>{completed && <em><Check size={11} /> Reviewed</em>}</div>
    <h3>{item.title}</h3><CleanMarkdown>{item.evidence ?? item.description}</CleanMarkdown>{source && <a className="social-source" href={source} target="_blank" rel="noreferrer"><ExternalLink size={12} /> Open discovered post</a>}
  </article>;

  if (kind === "new_post") return <article className={`social-card social-draft-card platform-${type.toLowerCase()}`}>
    <div className="social-context"><span>NEW {platformName.toUpperCase()} POST</span><em>Ready for human review</em></div>
    <div className="social-post-head"><CompanyLogo company={company} size={34} /><div><strong>{company.name}</strong><small>{handle} · draft</small></div><PlatformMark provider={type.toLowerCase()} /></div>
    <h3>{item.title}</h3><textarea aria-label={`${platformName} post draft`} value={draft} onChange={(event) => setDraft(event.target.value)} rows={6} />
    <div className="social-draft-actions"><small>{`${draft.length} characters`} · publish manually</small><button type="button" disabled={!draft.trim()} onClick={copyDraft}>{copied ? <Check size={12} /> : <Copy size={12} />}{copied ? "Copied" : "Copy post"}</button></div>
  </article>;

  const compactCard = <article className={`social-opportunity-card platform-${type.toLowerCase()} ${completed ? "completed" : ""}`}>
    <div className="opportunity-label"><PlatformMark provider={type.toLowerCase()} /><span>{completed ? "COMPLETED" : `COMMENT ON ${platformName.toUpperCase()}`}</span><em>{item.publishedAt || "Current public result"}</em></div>
    <h3>{item.title}</h3><CleanMarkdown>{item.evidence ?? item.description}</CleanMarkdown><div className="opportunity-tags">{(item.tags ?? []).slice(0, 3).map((tag) => <span key={tag}>{normalizeAcronyms(tag)}</span>)}</div>
    <button type="button" onClick={() => setOpen(true)}>{completed ? <Check size={13} /> : <MessageCircle size={13} />}{completed ? "Review response" : "Review & comment"}</button>
  </article>;

  return <>{compactCard}{detail}</>;
}

function GenericAgentFindingCard({
  item,
}: {
  item: Finding;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const summary = paragraphText(item.evidence ?? item.description).slice(0, 180);
  const priority = item.priority ? normalizeAcronyms(item.priority) : "Insight";

  const handleCopyText = async () => {
    const text = `${item.title}\n\n${item.evidence ?? item.description ?? ""}\n\nImpact: ${unwrapStructuredText(item.impact)}\nAction: ${unwrapStructuredText(item.action)}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className={`generic-agent-finding-card generic-agent-finding-card--minimal ${expanded ? "is-expanded" : ""}`}>
      <button
        type="button"
        className="finding-card-summary"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className={`finding-priority-dot finding-priority-dot--${item.priority ?? "default"}`} aria-hidden="true" />
        <span className="finding-card-summary-copy">
          <strong>{item.title || "Untitled finding"}</strong>
          {summary && <small>{summary}</small>}
        </span>
        <span className="finding-card-summary-meta">
          <em>{priority}{item.confidence !== undefined ? ` · ${item.confidence}%` : ""}</em>
          <ChevronDown size={13} className={expanded ? "rotated" : ""} />
        </span>
      </button>

      {expanded && (
        <div className="finding-card-detail">
          {item.publishedAt && <time className="finding-timestamp">{item.publishedAt}</time>}
          <div className="finding-card-body-text">
            <CleanMarkdown>{item.evidence ?? item.description}</CleanMarkdown>
          </div>

          {(item.impact || item.action) && (
            <div className="finding-decision-list">
              {item.impact && <div><strong>Impact</strong><span>{unwrapStructuredText(item.impact)}</span></div>}
              {item.action && <div><strong>Next step</strong><span>{unwrapStructuredText(item.action)}</span></div>}
            </div>
          )}

          <div className="finding-card-footer">
            {item.sourceUrls?.length ? (
              <div className="finding-sources-wrap">
                {item.sourceUrls.slice(0, 2).map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="finding-source-link">
                    <ExternalLink size={10} /> {url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 28)}…
                  </a>
                ))}
              </div>
            ) : <span className="finding-source-empty">Source evidence stored in this analysis</span>}

            <button type="button" className="finding-copy-button" onClick={handleCopyText}>
              {copied ? <Check size={11} /> : <Copy size={11} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function SourceDrawer({ companyName, sources, uploading, dragActive, error, inputRef, onClose, onFiles, onDragActive, onRemove }: {
  companyName: string;
  sources: AnalysisSource[];
  uploading: boolean;
  dragActive: boolean;
  error: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onFiles: (files: FileList | File[]) => void;
  onDragActive: (active: boolean) => void;
  onRemove: (source: AnalysisSource) => void;
}) {
  return <div className="drawer-backdrop source-drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !uploading) onClose(); }}>
    <section className="source-drawer" role="dialog" aria-modal="true" aria-labelledby="source-drawer-title">
      <header>
        <div><p className="eyebrow">ANALYSIS EVIDENCE</p><h2 id="source-drawer-title">Source documents</h2><span>Every uploaded source is read and included in future reports, AI CMO answers, and specialist agent work.</span></div>
        <button type="button" onClick={onClose} disabled={uploading} aria-label="Close source documents"><CloseIcon size={18} /></button>
      </header>
      <div
        className={`source-drop-zone ${dragActive ? "drag-active" : ""}`}
        onDragEnter={(event) => { event.preventDefault(); onDragActive(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) onDragActive(false); }}
        onDrop={(event) => { event.preventDefault(); onFiles(event.dataTransfer.files); }}
      >
        <input ref={inputRef} type="file" multiple accept={SOURCE_FILE_ACCEPT} onChange={(event) => { if (event.target.files) onFiles(event.target.files); }} />
        <UploadCloud size={24} aria-hidden="true" />
        <strong>{uploading ? "Reading your documents…" : "Drop source documents here"}</strong>
        <span>or</span>
        <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()}>{uploading ? <RefreshCw className="spin" size={14} /> : <Plus size={14} />} Choose files</button>
        <small>PDF, DOCX, PPTX, XLSX, Markdown, text, CSV, JSON, HTML, OpenDocument and more · 15 MB each</small>
      </div>
      {error && <p className="source-error" role="alert"><AlertTriangle size={14} />{error}</p>}
      <div className="source-list-heading"><div><strong>Included in analysis</strong><span>{sources.length} {sources.length === 1 ? "document" : "documents"}</span></div>{sources.length > 0 && <small>New agent runs and reports use these automatically.</small>}</div>
      <div className="source-list">
        {sources.length ? sources.map((source) => <article key={source.id}>
          <span className="source-file-icon"><FileText size={16} /></span>
          <div><strong title={source.title}>{source.title}</strong><small>{source.sourceType.toUpperCase()} · {source.characterCount.toLocaleString()} characters · Added {new Date(source.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</small></div>
          <button type="button" onClick={() => onRemove(source)} disabled={uploading} aria-label={`Remove ${source.title}`} title="Remove from future analysis"><Trash2 size={14} /></button>
        </article>) : <div className="source-empty"><FileText size={22} /><strong>No uploaded sources yet</strong><p>Add briefs, research, proposals, reports, spreadsheets, or other supporting documents.</p></div>}
      </div>
      <footer><CheckCircle2 size={14} /><span>Stored sources are private to {companyName} and its analysis workspace.</span></footer>
    </section>
  </div>;
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const router = useRouter();
  const workspaceRef = useRef<HTMLElement>(null);
  const [paneOrder, setPaneOrder] = useState<PaneId[]>(defaultPaneOrder);
  const [paneSizes, setPaneSizes] = useState<PaneSizes>(defaultPaneSizes);
  const [collapsedPanes, setCollapsedPanes] = useState<PaneId[]>([]);
  const [draggingPane, setDraggingPane] = useState<PaneId | null>(null);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [documents, setDocuments] = useState(data.documents);
  const [selectedDocument, setSelectedDocument] = useState<WorkspaceDocument | null>(null);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [analysisTab, setAnalysisTab] = useState<"health" | "links" | "technical" | "aigeo" | "checks">("health");
  const lighthouse = useLighthouseAudit(data.company.websiteUrl);
  const [vitalsDevice, setVitalsDevice] = useState<"desktop" | "mobile">("desktop");
  const [companyMenu, setCompanyMenu] = useState(false);
  const [agentTray, setAgentTray] = useState(false);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [generatingDocument, setGeneratingDocument] = useState<string | null>(null);
  const [showReportsCatalog, setShowReportsCatalog] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [sources, setSources] = useState(data.sources);
  const [sourceUploading, setSourceUploading] = useState(false);
  const [sourceDragActive, setSourceDragActive] = useState(false);
  const [sourceError, setSourceError] = useState("");
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const [catalogCategory, setCatalogCategory] = useState<string>("all");
  const [activeCatalogType, setActiveCatalogType] = useState<string | null>(null);
  const [agentError, setAgentError] = useState("");
  const [completedOpportunities, setCompletedOpportunities] = useState(() => new Set(savedOpportunityKeys(data.agentConfigs)));
  const [manualCompetitors, setManualCompetitors] = useState<Finding[]>(() => savedManualCompetitors(data.agentConfigs));
  const [showCompetitorAdd, setShowCompetitorAdd] = useState(false);
  const [competitorAddPending, setCompetitorAddPending] = useState(false);
  const [competitorAddError, setCompetitorAddError] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>(
    data.chat?.messages.length
      ? data.chat.messages.map(({ role, content }) => ({ role, content }))
      : [{ role: "assistant", content: `I’ve synthesized ${documents.length} core documents and ${data.pagesRead} source pages for ${data.company.name}. Ask me for a detailed priority analysis or campaign decision.` }],
  );
  const [chatPending, setChatPending] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(data.chat?.sessionId);
  const geoRun = data.agents.find((item) => item.agentType === "GEO");
  const competitorItems = useMemo(() => {
    const agentCompetitors = extractContextCompetitorsFromAgentOutput(data.agents.find((item) => item.agentType === "COMPETITOR")?.output);
    const documentCompetitors = (documents.find((d) => d.type === "COMPETITOR_ANALYSIS")?.metadata as { competitors?: Finding[] } | null)?.competitors ?? [];
    return selectContextCompetitors({
      agentItems: [...manualCompetitors, ...agentCompetitors],
      documentItems: documentCompetitors,
      company: data.company,
    });
  }, [data.agents, data.company, documents, manualCompetitors]);
  const analysisRunning = data.analysis && ["QUEUED", "RUNNING"].includes(data.analysis.status);
  const queuedDocumentsReady = documents.filter((document) => queuedDocumentTypes.includes(document.type)).length;

  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>(() => {
    const time = () => new Date().toLocaleTimeString("en-US", { hour12: false });
    const initial: TerminalLog[] = [
      { id: "init-1", timestamp: time(), level: "success", tag: "INIT", message: "Phase 1 Foundational Intelligence Layer validated (STATUS: 200_OK)." },
      { id: "init-2", timestamp: time(), level: "info", tag: "VIEW", message: `Switched to Main Board View. Active Workspace: ${data.company.name}.` },
      { id: "init-3", timestamp: time(), level: "info", tag: "ANALYTICS", message: `Concurrent background diagnostic engines active for ${safeHostname(data.company.websiteUrl)}.` },
    ];
    data.documents.forEach((doc, idx) => {
      initial.push({
        id: `doc-${doc.id}`,
        timestamp: time(),
        level: "success",
        tag: `DOC ${idx + 1}/${queuedDocumentTypes.length}`,
        message: `Ready: ${doc.title} -> Stored in state.`,
      });
    });
    if (data.analysis && ["QUEUED", "RUNNING"].includes(data.analysis.status)) {
      initial.push({
        id: "prog-init",
        timestamp: time(),
        level: "info",
        tag: "PROGRESS",
        message: `${data.analysis.progress}% Background queue compiling: ${data.analysis.step}`,
      });
    }
    return initial;
  });

  const DEFAULT_EXTENDED_TYPES = useMemo(() => ["MARKETING_STRATEGY", "DESIGN_GUIDE", "SOCIAL_BATCH_PLAN", "SHORT_FORM_VIDEO_BLUEPRINT"], []);
  const visibleExtendedDocuments = useMemo(() => {
    return EXTENDED_DOCUMENTS.filter(
      (definition) => DEFAULT_EXTENDED_TYPES.includes(definition.type) || documents.some((d) => d.type === definition.type)
    );
  }, [documents, DEFAULT_EXTENDED_TYPES]);

  useEffect(() => {
    setDocuments(data.documents);
    setSelectedDocument((current) => current ? data.documents.find((document) => document.id === current.id) ?? current : null);
  }, [data.documents]);

  useEffect(() => setSources(data.sources), [data.sources]);

  useEffect(() => {
    if (!analysisRunning) return;
    const timer = window.setInterval(() => router.refresh(), 4_000);
    return () => window.clearInterval(timer);
  }, [analysisRunning, router]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("smark-workspace-layout-v1");
      if (stored) {
        const parsed = JSON.parse(stored) as { order?: unknown[]; sizes?: Partial<PaneSizes>; collapsed?: unknown[] };
        const order = parsed.order?.filter(isPaneId);
        if (order?.length === defaultPaneOrder.length && new Set(order).size === defaultPaneOrder.length) setPaneOrder(order);
        if (parsed.sizes) setPaneSizes((current) => ({
          context: Number(parsed.sizes?.context) || current.context,
          analytics: Number(parsed.sizes?.analytics) || current.analytics,
          agents: Number(parsed.sizes?.agents) || current.agents,
          chat: Number(parsed.sizes?.chat) || current.chat,
        }));
        if (parsed.collapsed) setCollapsedPanes(parsed.collapsed.filter(isPaneId));
      }
    } catch {
      window.localStorage.removeItem("smark-workspace-layout-v1");
    } finally {
      setWorkspaceReady(true);
    }
  }, []);

  useEffect(() => {
    if (!workspaceReady) return;
    window.localStorage.setItem("smark-workspace-layout-v1", JSON.stringify({ order: paneOrder, sizes: paneSizes, collapsed: collapsedPanes }));
  }, [collapsedPanes, paneOrder, paneSizes, workspaceReady]);

  const gridStyle = useMemo(() => ({
    "--pane-columns": paneOrder.map((id) => collapsedPanes.includes(id) ? "72px" : `minmax(${paneMinimums[id]}px, ${paneSizes[id]}fr)`).join(" "),
  } as React.CSSProperties), [collapsedPanes, paneOrder, paneSizes]);

  function nextExpandedPane(id: PaneId) {
    const index = paneOrder.indexOf(id);
    return paneOrder.slice(index + 1).find((candidate) => !collapsedPanes.includes(candidate));
  }

  function resizePanePair(id: PaneId, delta: number) {
    const next = nextExpandedPane(id);
    const width = workspaceRef.current?.clientWidth ?? 1200;
    if (!next || collapsedPanes.includes(id)) return;
    const leftMinimum = paneMinimums[id] / width * 100;
    const rightMinimum = paneMinimums[next] / width * 100;
    setPaneSizes((current) => {
      const total = current[id] + current[next];
      const left = Math.min(total - rightMinimum, Math.max(leftMinimum, current[id] + delta));
      return { ...current, [id]: left, [next]: total - left };
    });
  }

  function startPaneResize(id: PaneId, event: React.PointerEvent<HTMLDivElement>) {
    const next = nextExpandedPane(id);
    if (!next || collapsedPanes.includes(id)) return;
    event.preventDefault();
    const startX = event.clientX;
    const width = workspaceRef.current?.clientWidth ?? 1200;
    const startLeft = paneSizes[id];
    const startRight = paneSizes[next];
    const leftMinimum = paneMinimums[id] / width * 100;
    const rightMinimum = paneMinimums[next] / width * 100;
    document.documentElement.classList.add("resizing-workspace");
    const move = (moveEvent: PointerEvent) => {
      const total = startLeft + startRight;
      const proposed = startLeft + ((moveEvent.clientX - startX) / width * 100);
      const left = Math.min(total - rightMinimum, Math.max(leftMinimum, proposed));
      setPaneSizes((current) => ({ ...current, [id]: left, [next]: total - left }));
    };
    const stop = () => {
      document.documentElement.classList.remove("resizing-workspace");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
  }

  function togglePane(id: PaneId) {
    setCollapsedPanes((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function movePane(dragged: PaneId, target: PaneId) {
    if (dragged === target) return;
    setPaneOrder((current) => {
      const next = current.filter((id) => id !== dragged);
      next.splice(next.indexOf(target), 0, dragged);
      return next;
    });
  }

  function paneProps(id: PaneId) {
    return {
      "data-pane-id": id,
      "data-collapsed": collapsedPanes.includes(id),
      "data-dragging": draggingPane === id,
      style: { order: paneOrder.indexOf(id) },
      onDragOver: (event: React.DragEvent<HTMLElement>) => event.preventDefault(),
      onDrop: (event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        const dragged = event.dataTransfer.getData("text/smark-pane");
        if (isPaneId(dragged)) movePane(dragged, id);
        setDraggingPane(null);
      },
    };
  }

  function paneControls(id: PaneId) {
    const collapsed = collapsedPanes.includes(id);
    return <div className="pane-layout-controls">
        <button className="pane-drag-grip" type="button" draggable aria-label={`Drag ${paneLabels[id]} pane`} title="Drag to move this pane" onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/smark-pane", id); setDraggingPane(id); }} onDragEnd={() => setDraggingPane(null)}><GripVertical size={14} /></button>
        <button className="pane-collapse" type="button" aria-label={`${collapsed ? "Expand" : "Minimize"} ${paneLabels[id]} pane`} title={`${collapsed ? "Expand" : "Minimize"} pane`} onClick={() => togglePane(id)}>{collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}</button>
      </div>;
  }

  function paneResizer(id: PaneId) {
    const lastExpanded = !nextExpandedPane(id);
    return !lastExpanded && !collapsedPanes.includes(id) ? <div className="column-resizer" role="separator" aria-label={`Resize ${paneLabels[id]} pane`} aria-orientation="vertical" tabIndex={0} onPointerDown={(event) => startPaneResize(id, event)} onKeyDown={(event) => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); resizePanePair(id, event.key === "ArrowLeft" ? -2 : 2); } }} /> : null;
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = String(form.get("message") ?? "").trim();
    if (!message || chatPending) return;
    event.currentTarget.reset();
    setMessages((items) => [...items, { role: "user", content: message }]);
    setChatPending(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId: data.company.id, sessionId, message }) });
      const result = await response.json() as { content?: string; sessionId?: string; error?: string };
      if (!response.ok || !result.content) throw new Error(result.error ?? "The CMO assistant could not respond.");
      setSessionId(result.sessionId);
      setMessages((items) => [...items, { role: "assistant", content: result.content! }]);
    } catch (error) {
      setMessages((items) => [...items, { role: "assistant", content: error instanceof Error ? error.message : "The assistant could not respond." }]);
    } finally { setChatPending(false); }
  }

  async function uploadSourceFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (!files.length || sourceUploading) return;
    setSourceUploading(true);
    setSourceError("");
    const formData = new FormData();
    formData.set("companyId", data.company.id);
    files.forEach((file) => formData.append("files", file));
    appendLog("info", "SOURCE_READ", `Reading ${files.length} source document${files.length === 1 ? "" : "s"} for company analysis...`);
    try {
      const response = await fetch("/api/sources", { method: "POST", body: formData });
      const result = await response.json() as { sources?: AnalysisSource[]; error?: string };
      if (!response.ok || !result.sources) throw new Error(result.error ?? "The source documents could not be added.");
      setSources((current) => [...result.sources!, ...current]);
      appendLog("success", "SOURCE_READY", `${result.sources.length} source document${result.sources.length === 1 ? " is" : "s are"} now included in reports and agent work.`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "The source documents could not be added.";
      setSourceError(message);
      appendLog("error", "SOURCE_ERR", message);
    } finally {
      setSourceUploading(false);
      setSourceDragActive(false);
      if (sourceInputRef.current) sourceInputRef.current.value = "";
    }
  }

  async function removeSource(source: AnalysisSource) {
    setSourceError("");
    try {
      const response = await fetch(`/api/sources/${source.id}`, { method: "DELETE" });
      const result = await response.json() as { removed?: boolean; error?: string };
      if (!response.ok || !result.removed) throw new Error(result.error ?? "The source document could not be removed.");
      setSources((current) => current.filter((item) => item.id !== source.id));
      appendLog("warn", "SOURCE_REMOVED", `${source.title} is no longer included in future analysis.`);
    } catch (error) {
      setSourceError(error instanceof Error ? error.message : "The source document could not be removed.");
    }
  }

  async function addManualCompetitor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (competitorAddPending) return;
    const form = new FormData(event.currentTarget);
    const companyName = String(form.get("companyName") ?? "").trim();
    const websiteInput = String(form.get("officialWebsite") ?? "").trim();
    setCompetitorAddError("");

    let officialWebsite = websiteInput;
    try {
      const parsed = new URL(/^https?:\/\//i.test(websiteInput) ? websiteInput : `https://${websiteInput}`);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error("invalid protocol");
      officialWebsite = parsed.toString().replace(/\/$/, "");
    } catch {
      setCompetitorAddError("Enter a valid company website.");
      return;
    }

    if (!companyName) {
      setCompetitorAddError("Enter the competitor name.");
      return;
    }
    const host = safeHostname(officialWebsite);
    if (host === safeHostname(data.company.websiteUrl)) {
      setCompetitorAddError("This is the current company website.");
      return;
    }
    if (competitorItems.some((item) => safeHostname(item.officialWebsite) === host)) {
      setCompetitorAddError("This competitor is already in the list.");
      return;
    }

    const next = [...manualCompetitors, { companyName, title: companyName, officialWebsite, sourceUrls: [officialWebsite] }];
    setCompetitorAddPending(true);
    try {
      const response = await fetch("/api/agents/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: data.company.id, agentType: "COMPETITOR", config: { manualCompetitors: next } }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "The competitor could not be saved.");
      setManualCompetitors(next);
      setShowCompetitorAdd(false);
      event.currentTarget.reset();
    } catch (error) {
      setCompetitorAddError(error instanceof Error ? error.message : "The competitor could not be saved.");
    } finally {
      setCompetitorAddPending(false);
    }
  }
  function appendLog(level: "info" | "success" | "interrupt" | "p0" | "warn" | "error", tag: string, message: string) {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setTerminalLogs((prev) => [
      ...prev,
      { id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, timestamp: time, level, tag, message },
    ]);
  }

  async function runAgent(agentType: string) {
    setRunningAgent(agentType);
    setAgentError("");
    appendLog("info", "AGENT_RUN", `Running specialist agent: ${agentType}...`);
    try {
      const endpoint = agentType === "REDDIT" ? "/api/agents/reddit/opportunities" : "/api/agents/run";
      const body = agentType === "REDDIT" ? { companyId: data.company.id } : { companyId: data.company.id, agentType };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "The agent could not run.");
      setExpandedAgent(agentType);
      setAgentTray(false);
      appendLog("success", "AGENT_DONE", `Specialist agent completed: ${agentType} -> Findings updated.`);
      router.refresh();
    } catch (error) {
      const err = error instanceof Error ? error.message : "The agent could not run.";
      setAgentError(err);
      appendLog("error", "AGENT_ERR", `Agent ${agentType} execution error: ${err}`);
    } finally {
      setRunningAgent(null);
    }
  }

  async function completeOpportunity(agentType: string, key: string) {
    const response = await fetch("/api/agents/run", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId: data.company.id, agentType, opportunityKey: key, completed: true }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) throw new Error(result.error ?? "The opportunity could not be saved.");
    setCompletedOpportunities((current) => new Set([...current, key]));
  }

  async function generateDocument(documentType: string) {
    setGeneratingDocument(documentType);
    setAgentError("");
    const def = getDocumentDefinition(documentType as DocumentType);
    const title = def?.title ?? documentType;
    appendLog("info", "DOC_COMPILE", `Compiling document: ${title}...`);
    try {
      const response = await fetch("/api/documents/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId: data.company.id, documentType }) });
      const result = await response.json() as { document?: WorkspaceDocument; error?: string };
      if (!response.ok || !result.document) throw new Error(result.error ?? "The document could not be generated.");
      setDocuments((current) => [...current.filter((item) => item.type !== result.document!.type), result.document!]);
      setSelectedDocument(result.document);
      appendLog("success", "DOC_READY", `Ready: ${result.document.title} -> Rendered in workspace.`);
    } catch (error) {
      const err = error instanceof Error ? error.message : "The document could not be generated.";
      setAgentError(err);
      appendLog("error", "DOC_ERR", `Failed to generate ${title}: ${err}`);
    } finally {
      setGeneratingDocument(null);
    }
  }

  async function prioritizeDocument(documentType: string, customTitle?: string) {
    const def = getDocumentDefinition(documentType as DocumentType);
    const title = customTitle ?? def?.title ?? documentType;
    appendLog("interrupt", "INTERRUPT", `User selected ${title} -> Elevating priority to P0 (Critical Path).`);
    appendLog("p0", "P0_QUEUE", `Pausing background queue -> Compiling ${title} immediately...`);
    await generateDocument(documentType);
  }

  function updateDocument(updated: WorkspaceDocument) {
    setDocuments((items) => items.map((item) => item.id === updated.id ? updated : item));
    setSelectedDocument(updated);
  }

  const activeState = (generatingDocument || runningAgent)
    ? "interrupt"
    : analysisRunning
    ? "running"
    : "completed";

  const activeTask = generatingDocument
    ? `P0 Compiling: ${getDocumentDefinition(generatingDocument as DocumentType)?.title ?? generatingDocument}`
    : runningAgent
    ? `P0 Agent: ${runningAgent}`
    : analysisRunning
    ? data.analysis?.step ?? "Compiling background queue"
    : null;

  return <main className="dashboard-shell">
    <header className="dashboard-topbar">
      <div className="workspace-switch-wrap">
        <button className="workspace-switch" onClick={() => setCompanyMenu((value) => !value)}><CompanyLogo company={data.company} size={24} eager /><strong>{data.company.name}</strong><ChevronDown size={13} /></button>
        {companyMenu && <div className="company-menu"><p>COMPANIES</p>{data.companies.map((company) => <Link className={company.id === data.company.id ? "active" : ""} href={`/dashboard/${company.id}`} key={company.id}><CompanyLogo company={company} size={30} /><div><strong>{company.name}</strong><small>{safeHostname(company.websiteUrl)}</small></div>{company.id === data.company.id && <em>Current</em>}</Link>)}<Link className="add-company" href="/onboarding/company?mode=add"><CirclePlus size={15} /> Add another company</Link></div>}
      </div>
      
      <StreamingTerminal
        logs={terminalLogs}
        activeState={activeState}
        activeTask={activeTask}
        progress={data.analysis?.progress ?? Math.round((queuedDocumentsReady / queuedDocumentTypes.length) * 100)}
        tokenCount={data.user.tokenUsed}
        connectionSummary={<ConnectionStrip data={data} />}
      />

      <nav className="dashboard-actions"><Link href={`/dashboard/${data.company.id}/reporting`}>Reporting</Link><Link href={`/dashboard/${data.company.id}/visuals`}>Visual Studio</Link><button type="button" className="topbar-source-button" onClick={() => setShowSources(true)} aria-label={`Add source documents. ${sources.length} currently included`} title="Add source documents"><Plus size={16} /><span>Sources</span>{sources.length > 0 && <em>{sources.length}</em>}</button><Link href="/admin" title="Admin dashboard">Admin</Link><Link href="/settings/credits" aria-label="Settings"><Settings size={16} /></Link><span className="avatar-small">{(data.user.name ?? data.user.email).slice(0, 2).toUpperCase()}</span><LogoutButton /></nav>
    </header>

    <section className="dashboard-grid" ref={workspaceRef} style={gridStyle}>
      <aside className="company-pane pane" {...paneProps("context")}>
        <div className="pane-header"><span><Globe2 size={15} /><span className="pane-title-text">Context</span></span><span className="account-count">{data.companies.length} account{data.companies.length === 1 ? "" : "s"}</span>{paneControls("context")}</div>
        <div className="company-content">
          <div className="company-title-row"><CompanyLogo company={data.company} size={34} eager /><h1>{data.company.name}</h1></div>
          <a className="company-url" href={data.company.websiteUrl} target="_blank" rel="noreferrer"><Link2 size={12} />{safeHostname(data.company.websiteUrl)}</a>
          <div className="company-context">
            <p className="company-description">{data.company.companyContext.overview}</p>
            <small className="company-context-evidence"><Sparkles size={11} />Grounded in {data.company.companyContext.evidenceLabel}</small>
          </div>
        </div>
        <section className="pane-section"><div className="section-label-row"><p className="section-label">CORE DOCUMENTS</p><span>{documents.filter((item) => coreDocumentOrder.includes(item.type)).length}/6</span></div><div className="document-list">{coreDocumentOrder.map((type) => { const document = documents.find((item) => item.type === type); return document ? <button type="button" key={type} onClick={() => setSelectedDocument(document)}><ModuleIcon type={type} size={14} /><span className="document-row-title">{document.title}</span><small>v{document.version}</small><ChevronRight size={13} /><span className="document-hover-detail" role="tooltip"><strong>{document.title}</strong><span>{documentPreview(document) || "Open this document to review its complete evidence and recommendations."}{document.contentMarkdown.length > 190 ? "…" : ""}</span><em>{document.tokenEstimate.toLocaleString()} tokens · Updated {new Date(document.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</em></span></button> : <button className="pending-document p0-triggerable" type="button" key={type} disabled={Boolean(generatingDocument)} onClick={() => prioritizeDocument(type, coreDocumentLabels[type])} title="Click to elevate to P0 and compile immediately"><ModuleIcon type={type} size={14} /><span>{coreDocumentLabels[type]}</span><small className="p0-action-tag">{generatingDocument === type ? <RefreshCw className="spin" size={10} /> : <Zap size={10} />}{generatingDocument === type ? "Compiling" : "P0"}</small></button>; })}</div></section>
        <section className="pane-section context-competitors">
          <div className="section-label-row"><p className="section-label">COMPETITORS &amp; ALTERNATIVES</p><span>{competitorItems.length ? `${competitorItems.length} tracked` : "Discovery pending"}</span><button type="button" className="competitors-add" onClick={() => { setCompetitorAddError(""); setShowCompetitorAdd((open) => !open); }} title="Add competitor" aria-label="Add competitor"><Plus size={13} /></button><button type="button" className="competitors-refresh" disabled={Boolean(runningAgent)} onClick={() => runAgent("COMPETITOR")} title="Refresh competitor research" aria-label="Refresh competitor research"><RefreshCw className={runningAgent === "COMPETITOR" ? "spin" : ""} size={12} /></button></div>
          {showCompetitorAdd && <form className="competitor-quick-add" onSubmit={addManualCompetitor} aria-label="Add competitor manually">
            <header><strong>Add competitor</strong><button type="button" onClick={() => setShowCompetitorAdd(false)} aria-label="Close competitor form"><CloseIcon size={13} /></button></header>
            <label><span>Company name</span><input name="companyName" autoFocus autoComplete="organization" placeholder="Competitor name" required /></label>
            <label><span>Official website</span><input name="officialWebsite" inputMode="url" autoComplete="url" placeholder="company.com" required /></label>
            {competitorAddError && <p role="alert">{competitorAddError}</p>}
            <footer><button type="button" onClick={() => setShowCompetitorAdd(false)}>Cancel</button><button type="submit" disabled={competitorAddPending}>{competitorAddPending ? "Saving…" : "Add"}</button></footer>
          </form>}
          {competitorItems.length ? <div className="context-competitor-grid">{competitorItems.map((item, index) => <ContextCompetitor item={item} key={`${item.companyName || item.title}-${index}`} />)}</div> : <div className="context-competitor-empty"><ModuleIcon type="COMPETITOR" size={15} /><div><strong>Build the competitor set</strong><small>Run the competitor agent to discover six real companies and their official logos.</small></div><button type="button" disabled={Boolean(runningAgent)} onClick={() => runAgent("COMPETITOR")}>{runningAgent === "COMPETITOR" ? "Finding…" : "Find competitors"}</button></div>}
        </section>
        <section className="pane-section extended-documents">
          <div className="section-label-row">
            <p className="section-label">ADDITIONAL DOCUMENTS</p>
            <span>{documents.filter((item) => EXTENDED_DOCUMENTS.some((definition) => definition.type === item.type)).length}/{visibleExtendedDocuments.length}{analysisRunning ? " background" : " ready"}</span>
          </div>
          <div>
            {visibleExtendedDocuments.map((definition) => {
              const document = documents.find((item) => item.type === definition.type);
              const pending = generatingDocument === definition.type;
              const queued = Boolean(analysisRunning) && !document;
              return (
                <article key={definition.type} className={pending || queued ? "is-generating" : document ? "is-complete" : ""}>
                  <ModuleIcon type={definition.type} size={15} />
                  <div>
                    <strong>{definition.title}</strong>
                    <small>{queued ? "Queued · select + to prioritize" : document ? "Complete" : "Awaiting generation"}</small>
                  </div>
                  {document ? (
                    <button type="button" className="document-open-btn" onClick={() => setSelectedDocument(document)} title="Open document" aria-label="Open document">
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button type="button" className="p0-action-btn" disabled={Boolean(generatingDocument)} onClick={() => prioritizeDocument(definition.type, definition.title)} title="Prioritize report generation" aria-label="Prioritize report generation">
                      {pending ? <RefreshCw className="spin" size={13} /> : <Plus size={14} />}
                    </button>
                  )}
                </article>
              );
            })}
            <button
              type="button"
              className="more-reports-catalog-btn"
              onClick={() => setShowReportsCatalog(true)}
            >
              <Plus size={13} />
              <span>View all reports · {Math.max(0, EXTENDED_DOCUMENTS.length - visibleExtendedDocuments.length)}</span>
            </button>
          </div>
        </section>
        {paneResizer("context")}
      </aside>

      <section className="analytics-pane pane" {...paneProps("analytics")}>
        <div className="pane-header"><span><Activity size={15} /><span className="pane-title-text">Analytics</span></span><span className="live-dot" />{paneControls("analytics")}</div>
        <div className="analytics-content">
          {analysisTab === "health" && <div className="health-toolbar-row">
            <div className="vitals-device-toggle">
              <button type="button" className={lighthouse.strategy === "mobile" ? "active" : ""} onClick={() => lighthouse.selectStrategy("mobile")} disabled={lighthouse.status === "queued" || lighthouse.status === "running"} aria-label="Mobile audit" title="Mobile"><Smartphone size={13} /></button>
              <button type="button" className={lighthouse.strategy === "desktop" ? "active" : ""} onClick={() => lighthouse.selectStrategy("desktop")} disabled={lighthouse.status === "queued" || lighthouse.status === "running"} aria-label="Desktop audit" title="Desktop"><Monitor size={13} /></button>
            </div>
            <button type="button" className="run-fresh-btn" onClick={() => void lighthouse.startAudit(true)} disabled={lighthouse.status === "queued" || lighthouse.status === "running"} aria-label="Run a fresh audit" title="Run a fresh audit"><RotateCcw size={12} /></button>
          </div>}
          <div className="analytics-tabs">
            {(["health", "links", "technical", "aigeo"] as const).map((tabName) => <button key={tabName} className={analysisTab === tabName ? "active" : ""} onClick={() => setAnalysisTab(tabName)}>{tabName === "aigeo" ? "AEO / GEO" : tabName.slice(0, 1).toUpperCase() + tabName.slice(1)}</button>)}
          </div>
          {analysisTab === "health" && <div className="analytics-health-section">
            {(lighthouse.status === "queued" || lighthouse.status === "running") && <AuditSkeleton status={lighthouse.status} />}

            {lighthouse.status === "failed" && <div className="lighthouse-error" role="alert"><AlertTriangle size={17} /><div><strong>Lighthouse audit not completed</strong><span>{lighthouse.error}</span></div><button type="button" onClick={() => void lighthouse.startAudit(true)}><RotateCcw size={12} /> Try again</button></div>}

            {lighthouse.report && <>
              <div className="pagespeed-scores-section">
                <div className="section-title-row">
                  <div><strong>{lighthouse.report.provider === "pagespeed" ? "PageSpeed Insights Scores" : "Lighthouse Scores"}</strong><small>{lighthouse.report.provider === "pagespeed" ? "Google-hosted Lighthouse lab measurements" : "Self-hosted Lighthouse lab measurements"}</small></div>
                  <span className="audit-date">Audited: {new Date(lighthouse.report.fetchedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="gauges-row">
                  <div className={`score-gauge-ring ${lighthouse.report.scores.performance !== null && lighthouse.report.scores.performance >= 90 ? "good" : lighthouse.report.scores.performance !== null && lighthouse.report.scores.performance >= 50 ? "warn" : "bad"}`}><div className="ring"><span>{lighthouse.report.scores.performance ?? "—"}</span></div><small>Performance</small></div>
                  <div className={`score-gauge-ring ${lighthouse.report.scores.accessibility !== null && lighthouse.report.scores.accessibility >= 90 ? "good" : lighthouse.report.scores.accessibility !== null && lighthouse.report.scores.accessibility >= 50 ? "warn" : "bad"}`}><div className="ring"><span>{lighthouse.report.scores.accessibility ?? "—"}</span></div><small>Accessibility</small></div>
                  <div className={`score-gauge-ring ${lighthouse.report.scores.bestPractices !== null && lighthouse.report.scores.bestPractices >= 90 ? "good" : lighthouse.report.scores.bestPractices !== null && lighthouse.report.scores.bestPractices >= 50 ? "warn" : "bad"}`}><div className="ring"><span>{lighthouse.report.scores.bestPractices ?? "—"}</span></div><small>Best Practices</small></div>
                  <div className={`score-gauge-ring ${lighthouse.report.scores.seo !== null && lighthouse.report.scores.seo >= 90 ? "good" : lighthouse.report.scores.seo !== null && lighthouse.report.scores.seo >= 50 ? "warn" : "bad"}`}><div className="ring"><span>{lighthouse.report.scores.seo ?? "—"}</span></div><small>SEO</small></div>
                </div>
              </div>

              <div className="core-vitals-section margin-top">
                <div className="section-title-row">
                  <div><strong>Core Web Vitals &amp; Lab Metrics</strong><small>{lighthouse.report.strategy.toUpperCase()} strategy</small></div>
                </div>
                <div className="vitals-cards-grid">
                  <div className="vital-metric-card"><span className="vital-name"><span className="metric-dot pass" /> FCP</span><strong className="vital-val">{lighthouse.report.metrics.firstContentfulPaint.displayValue ?? "—"}</strong><small className="vital-status">First Contentful Paint</small></div>
                  <div className="vital-metric-card"><span className="vital-name"><span className="metric-dot pass" /> LCP</span><strong className="vital-val">{lighthouse.report.metrics.largestContentfulPaint.displayValue ?? "—"}</strong><small className="vital-status">Largest Contentful Paint</small></div>
                  <div className="vital-metric-card"><span className="vital-name"><span className="metric-dot pass" /> TBT</span><strong className="vital-val">{lighthouse.report.metrics.totalBlockingTime.displayValue ?? "—"}</strong><small className="vital-status">Total Blocking Time</small></div>
                  <div className="vital-metric-card"><span className="vital-name"><span className="metric-dot pass" /> CLS</span><strong className="vital-val">{lighthouse.report.metrics.cumulativeLayoutShift.displayValue ?? "—"}</strong><small className="vital-status">Cumulative Layout Shift</small></div>
                </div>
              </div>

              <div className="section-header-block margin-top">
                <div className="title-with-badge">
                  <h3>Issues &amp; Opportunities</h3>
                  <div className="issues-badge-row">
                    <span className="crit"><XCircle size={10} /> {lighthouse.report.failedAudits.length}</span>
                    <span className="warn"><AlertTriangle size={10} /> {lighthouse.report.opportunities.length}</span>
                    <span className="pass"><CheckCircle2 size={10} /> {lighthouse.report.passedAudits.length}</span>
                  </div>
                </div>
                <p>Detected performance, accessibility, and SEO issues</p>
              </div>

              <div className="issues-card-wrapper">
                <div className="top-issues-bar">
                  <span className="top-label">Top issue</span>
                  <div className="top-pill">{lighthouse.report.failedAudits[0]?.title ?? lighthouse.report.opportunities[0]?.title ?? "All automated audits passed"}</div>
                  <span className="total-label">{lighthouse.report.failedAudits.length + lighthouse.report.opportunities.length} total</span>
                </div>
                <div className="issues-list">
                  {lighthouse.report.failedAudits.map((item) => (
                    <div key={item.id} className="issue-row crit">
                      <span><XCircle size={13} /> {item.title}</span>
                      <span className="sev-tag crit">Critical</span>
                    </div>
                  ))}
                  {lighthouse.report.opportunities.map((item) => (
                    <div key={item.id} className="issue-row warn">
                      <span><AlertTriangle size={13} /> {item.title}</span>
                      <span className="sev-tag warn">{item.displayValue ?? "Opportunity"}</span>
                    </div>
                  ))}
                  {lighthouse.report.failedAudits.length === 0 && lighthouse.report.opportunities.length === 0 && (
                    <div className="issue-row pass">
                      <span><CheckCircle2 size={13} /> No critical issues detected</span>
                      <span className="sev-tag pass">Clean</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="section-header-block margin-top row-space">
                <div>
                  <h3>Passed Checks</h3>
                  <p>All on-page signals verified by Lighthouse</p>
                </div>
                <span className="passed-count-tag">{lighthouse.report.passedAudits.length} passed</span>
              </div>

              <div className="passed-checks-table">
                <div className="table-header-row">
                  <span>CHECK</span>
                  <span>AUDIT KEY</span>
                </div>
                {lighthouse.report.passedAudits.map((item) => (
                  <div key={item.id} className="check-row-item">
                    <span><CheckCircle2 size={13} className="check-icon" /> {item.title}</span>
                    <span className="cat-label">{item.id}</span>
                  </div>
                ))}
              </div>
            </>}
          </div>}
          {analysisTab === "links" && (
            <AnalyticsLinksView
              companyUrl={data.company.websiteUrl}
              crawlPages={data.crawlPages.map((page) => ({ url: page.url, title: page.title, content: page.content || "" }))}
            />
          )}
          {analysisTab === "technical" && (
            <AnalyticsTechnicalView
              company={data.company}
              crawlPages={data.crawlPages.map((page) => ({ url: page.url, title: page.title, description: page.description, content: page.content || "" }))}
              pagesRead={data.pagesRead}
              lighthouseReport={lighthouse.report}
            />
          )}
          {analysisTab === "aigeo" && (
            <AnalyticsGeoView
              companyId={data.company.id}
              companyName={data.company.name}
              websiteUrl={data.company.websiteUrl}
              geoSummary={geoRun?.summary}
            />
          )}

        </div>
        {paneResizer("analytics")}
      </section>

      <section className="agents-pane pane" {...paneProps("agents")}>
        <div className="pane-header"><span><Bot size={15} /><span className="pane-title-text">Action Feed</span><span className="live-dot" /></span><div className="pane-tool-group"><button type="button" className="pane-tool-btn" title="Grid view"><LayoutGrid size={13} /></button><button type="button" className="pane-tool-btn" title="Settings"><Settings size={13} /></button></div>{paneControls("agents")}</div>
        <div className="agents-list">{primaryAgents.map(([type, label, icon, defaultSubtitle]) => {
          const run = data.agents.find((item) => item.agentType === type);
          const open = expandedAgent === type;
          let items = findings(run?.output);
          if (type === "X" && items.length === 0) {
            items = [
              { title: "Market Positioning Angle", description: `When analyzing market positioning for ${data.company.name}, differentiating on core execution and verifiable proof creates defensible contrast.`, kind: "new_post", draftContent: `Most companies focus on activity instead of systems.\n\nHere is how ${data.company.name} approaches ${data.company.category || "growth"}:\n• Clear problem diagnosis\n• Structured workflow\n• Measurable outcomes\n\nFocus on what moves the needle.` },
              { title: "Operational Insight", description: `Sharing real operational principles builds qualified audience trust.`, kind: "new_post", draftContent: `If you want better results in ${data.company.category || "your industry"}, start with transparency in your process.\n\n${data.company.name}` },
            ];
          }
          const competitorItems = type === "COMPETITOR" ? consolidateCompetitorFindings(items) : [];
          const running = runningAgent === type;
          const liveConnected = !data.user.demoMode && data.integrations.some((integration) => integration.provider.toLowerCase() === type.toLowerCase() && /connected|active/i.test(integration.status));
          return <div className="agent-row" key={type}>
            <button className="agent-summary" type="button" aria-expanded={open} onClick={() => {
              if (open) {
                setExpandedAgent(null);
                return;
              }
              setExpandedAgent(type);
              if (!run && !runningAgent) void runAgent(type);
            }}>
              <AgentLogo type={type} fallback={icon} />
              <span><strong>{label}</strong><small>{running ? "Fetching current public sources and building recommendations…" : run ? agentStatusSummary(type, run, items) : defaultSubtitle}</small></span>
              <ChevronDown className={open ? "rotated" : ""} size={15} />
            </button>
            {open && <div className="agent-output">
              <div className="agent-output-toolbar">
                <button
                  type="button"
                  className="agent-refresh-btn"
                  aria-label={`Refresh ${label}`}
                  title={`Refresh ${label}`}
                  disabled={Boolean(runningAgent)}
                  onClick={() => runAgent(type)}
                >
                  <RefreshCw size={12} className={running ? "spin" : ""} />
                </button>
              </div>
              {running ? (
                <div className="agent-run-minimal" role="status" aria-live="polite">
                  <RefreshCw size={14} className="spin" aria-hidden="true" />
                  <span><strong>Running {label}</strong><small>Reviewing connected evidence through the configured workflow</small></span>
                  <em>Working</em>
                  <i aria-hidden="true"><b /></i>
                </div>
              ) : type === "REDDIT" ? (
                <RedditOpportunityFeed
                  companyId={data.company.id}
                  companyName={data.company.name}
                  companyWebsite={data.company.websiteUrl}
                  companyLogoUrl={data.company.logoUrl}
                  initialOpportunities={
                    (run?.output && typeof run.output === "object" && Array.isArray((run.output as Record<string, unknown>).opportunities)
                      ? (run.output as Record<string, unknown>).opportunities
                      : []) as RedditActionFeedOpportunity[]
                  }
                  onOpportunityUpdated={() => router.refresh()}
                />
              ) : type === "INSTAGRAM" ? (
                <InstagramOpportunityFeed
                  companyId={data.company.id}
                  companyName={data.company.name}
                  companyWebsite={data.company.websiteUrl}
                  companyLogoUrl={data.company.logoUrl}
                  initialOpportunities={
                    (run?.output && typeof run.output === "object" && Array.isArray((run.output as Record<string, unknown>).opportunities)
                      ? (run.output as Record<string, unknown>).opportunities
                      : []) as InstagramOpportunity[]
                  }
                  opportunityMapSummary={
                    run?.output && typeof run.output === "object" && (run.output as Record<string, unknown>).opportunityMap
                      ? ((run.output as Record<string, unknown>).opportunityMap as InstagramOpportunityMap)
                      : null
                  }
                  onOpportunityUpdated={() => router.refresh()}
                />
              ) : items.length ? (
                type === "LINKEDIN" ? (
                  <LinkedInAgentFeed
                    items={items}
                    company={data.company}
                    liveConnected={liveConnected}
                    completedOpportunities={completedOpportunities}
                    completeOpportunity={completeOpportunity}
                    runAgent={runAgent}
                    running={Boolean(runningAgent === "LINKEDIN")}
                  />
                ) : type === "X" ? (
                  <XOpportunityFeed
                    companyId={data.company.id}
                    companyName={data.company.name}
                    companyWebsite={data.company.websiteUrl}
                    companyLogoUrl={data.company.logoUrl}
                    initialOpportunities={
                      (run?.output && typeof run.output === "object" && Array.isArray((run.output as Record<string, unknown>).opportunities)
                        ? (run.output as Record<string, unknown>).opportunities
                        : []) as XOpportunity[]
                    }
                    onOpportunityUpdated={() => router.refresh()}
                  />
                ) : type === "COMPETITOR" ? (
                  <div className="competitor-findings-unified-container">
                    <div className="competitor-findings-heading"><strong>Verified competitors</strong><span>{competitorItems.length} companies</span></div>
                    <div className="competitor-findings-grid">
                      {competitorItems.map((item, index) => (
                        <CompetitorFindingCard key={`${item.companyName || item.title}-${index}`} item={item} />
                      ))}
                    </div>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <GenericAgentFindingCard
                      key={`${item.title}-${index}`}
                      item={item}
                    />
                  ))
                )
              ) : null}
            </div>}
          </div>;
        })}{agentError && <p className="agent-error">{agentError}</p>}</div>
        {paneResizer("agents")}
      </section>

      <aside className="chat-pane pane" {...paneProps("chat")}>
        <div className="pane-header"><span><MessageCircle size={15} /><span className="pane-title-text">AI CMO</span></span>{paneControls("chat")}</div>
        <div className="cmo-split-workspace">
          <section className="cmo-chat-section" aria-label="AI CMO conversation">
            <div className="chat-hero"><span className="agent-icon agent-ai_cmo"><Bot size={16} /></span><div><strong>Your AI CMO</strong><small>Grounded in {documents.length} reports, {data.pagesRead} web sources and {sources.length} uploaded {sources.length === 1 ? "source" : "sources"}</small></div></div>
            <div className="chat-messages">{messages.map((message, index) => <div className={`chat-message ${message.role}`} key={index}>{message.role === "assistant" && <span className="chat-role"><Sparkles size={13} /> CMO</span>}<ReactMarkdown>{message.content}</ReactMarkdown></div>)}{chatPending && <div className="chat-message assistant typing"><span /><span /><span /></div>}</div>
            <form className="chat-composer" onSubmit={sendMessage}><textarea name="message" rows={2} placeholder="Ask me anything…" required /><div><button type="button" className="attach-button" aria-label="Add source documents" title="Add source documents" onClick={() => setShowSources(true)}><Paperclip size={16} /></button><span>Uses all company evidence</span><button className="send-button" type="submit" disabled={chatPending}><Send size={14} /></button></div></form>
          </section>
          <LiveConversationMining
            agents={data.agents}
            running={Boolean(runningAgent && ["REDDIT", "X", "LINKEDIN"].includes(runningAgent))}
            onScan={() => {
              void (async () => {
                await runAgent("REDDIT");
                await runAgent("X");
                await runAgent("LINKEDIN");
              })();
            }}
            companyId={data.company.id}
            companyName={data.company.name}
            companyIndustry={data.company.category || undefined}
          />
        </div>
        {paneResizer("chat")}
      </aside>
    </section>

    {selectedDocument && <DocumentWorkspace key={`${selectedDocument.id}-${selectedDocument.version}`} document={selectedDocument} companyId={data.company.id} onClose={() => setSelectedDocument(null)} onUpdate={updateDocument} />}
    {showSources && <SourceDrawer companyName={data.company.name} sources={sources} uploading={sourceUploading} dragActive={sourceDragActive} error={sourceError} inputRef={sourceInputRef} onClose={() => setShowSources(false)} onFiles={(files) => void uploadSourceFiles(files)} onDragActive={setSourceDragActive} onRemove={(source) => void removeSource(source)} />}
    {agentTray && <div className="drawer-backdrop agent-tray-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setAgentTray(false); }}><section className="agent-tray"><header><div><p className="eyebrow">MARKETING SPECIALISTS</p><h2>Add an agent</h2><span>Each agent uses verified company evidence to produce practical next steps.</span></div><button onClick={() => setAgentTray(false)}>×</button></header><div>{AGENT_DEFINITIONS.filter((agent) => agent.optional).map((agent) => <article key={agent.type}><AgentLogo type={agent.type} fallback="✦" /><div><strong>{agent.label}</strong><p>{agent.description}</p></div><button type="button" disabled={Boolean(runningAgent)} onClick={() => runAgent(agent.type)}>{runningAgent === agent.type ? <RefreshCw className="spin" size={13} /> : <Sparkles size={13} />}{runningAgent === agent.type ? "Running" : "Run analysis"}</button></article>)}</div>{agentError && <p className="form-error">{agentError}</p>}</section></div>}
    {showReportsCatalog && (() => {
      const filteredReports = EXTENDED_DOCUMENTS.filter((def) => {
        if (catalogCategory === "all") return true;
        if (catalogCategory === "cro") return ["PAGE_CRO_AUDIT", "ONBOARDING_CRO_AUDIT", "AB_TEST_ROADMAP"].includes(def.type);
        if (catalogCategory === "seo") return ["TOPIC_CLUSTER_BLUEPRINT", "PSEO_BLUEPRINT", "BACKLINK_OUTREACH_BLUEPRINT", "LOCAL_SEO_AUDIT"].includes(def.type);
        if (catalogCategory === "outbound") return ["COLD_OUTBOUND_PLAYBOOK", "EMAIL_LIFECYCLE_PLAYBOOK", "LEAD_MAGNET_STRATEGY"].includes(def.type);
        if (catalogCategory === "growth") return ["PAID_ADS_PLAYBOOK", "COMPETITOR_ANALYSIS", "MARKETING_STRATEGY"].includes(def.type);
        if (catalogCategory === "content") return ["SOCIAL_BATCH_PLAN", "SHORT_FORM_VIDEO_BLUEPRINT", "BRAND_STORYTELLING_GUIDE", "DESIGN_GUIDE"].includes(def.type);
        if (catalogCategory === "analytics") return ["ANALYTICS_TRACKING_BLUEPRINT"].includes(def.type);
        return true;
      });

      const currentActiveType = activeCatalogType && filteredReports.some((item) => item.type === activeCatalogType)
        ? activeCatalogType
        : filteredReports[0]?.type ?? null;

      const selectedCatalogDefinition = EXTENDED_DOCUMENTS.find((item) => item.type === currentActiveType);
      const selectedCatalogDocument = selectedCatalogDefinition ? documents.find((item) => item.type === selectedCatalogDefinition.type) : null;

      return (
        <div className="drawer-backdrop reports-catalog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowReportsCatalog(false); }}>
          <section className="reports-catalog-modal vendor-repository-card" role="dialog" aria-modal="true" aria-label="Skill-Generated Reports Catalog">
            <header className="catalog-header">
              <div>
                <p className="eyebrow">VENDOR SKILL REPOSITORIES</p>
                <h2>Skill-Generated Reports Catalog</h2>
                <span>Choose and generate specialized reports powered by your installed marketing, CRO, SEO, outbound, and creative skill chains.</span>
              </div>
              <button type="button" className="catalog-close-btn" onClick={() => setShowReportsCatalog(false)}>×</button>
            </header>

            <div className="catalog-categories-bar">
              {([
                ["all", "All Reports"],
                ["cro", "CRO & Funnels"],
                ["seo", "SEO & Search Architecture"],
                ["outbound", "Outbound & Email"],
                ["growth", "Paid & Growth"],
                ["content", "Content & Brand"],
                ["analytics", "Analytics & Tracking"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`cat-pill-btn ${catalogCategory === key ? "active" : ""}`}
                  onClick={() => setCatalogCategory(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="vendor-repository-container catalog-container">
              <div className="vendor-minimal-list catalog-minimal-list">
                <span className="vendor-list-label">SELECT REPORT TYPE</span>
                {filteredReports.map((definition) => {
                  const document = documents.find((item) => item.type === definition.type);
                  const isHoveredOrSelected = currentActiveType === definition.type;

                  return (
                    <button
                      key={definition.type}
                      type="button"
                      className={`vendor-list-row ${isHoveredOrSelected ? "selected" : ""}`}
                      onMouseEnter={() => setActiveCatalogType(definition.type)}
                      onClick={() => setActiveCatalogType(definition.type)}
                    >
                      <div className="vendor-row-main">
                        <div className="vendor-icon-wrap">
                          <ModuleIcon type={definition.type} size={16} />
                        </div>
                        <div className="vendor-row-info">
                          <strong>{definition.title}</strong>
                          <small>{definition.purpose.slice(0, 52)}…</small>
                        </div>
                      </div>

                      <div className="vendor-row-meta">
                        {document ? (
                          <span className="rec-model-pill ready">v{document.version} Ready</span>
                        ) : (
                          <span className="rec-model-pill">Ready to generate</span>
                        )}
                        <ChevronRight size={14} className="vendor-row-arrow" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedCatalogDefinition && (
                <div className="vendor-detail-card catalog-detail-card">
                  <div>
                    <div className="vendor-detail-header">
                      <div className="detail-logo-wrap">
                        <ModuleIcon type={selectedCatalogDefinition.type} size={20} />
                      </div>
                      <div>
                        <h3>{selectedCatalogDefinition.title}</h3>
                        <span className="detail-tag">Evidence-led workflow</span>
                      </div>
                    </div>

                    <p className="vendor-detail-desc">{selectedCatalogDefinition.purpose}</p>

                    <div className="vendor-spec-pills">
                      {selectedCatalogDocument && (
                        <span className="spec-pill ready">
                          <CheckCircle2 size={11} className="check-mark" /> Version {selectedCatalogDocument.version} Active
                        </span>
                      )}
                    </div>

                  </div>

                  <div className="vendor-detail-action-wrap">
                    {selectedCatalogDocument ? (
                      <button
                        type="button"
                        className="catalog-open-btn vendor-action-primary-btn"
                        onClick={() => {
                          setSelectedDocument(selectedCatalogDocument);
                          setShowReportsCatalog(false);
                        }}
                      >
                        <CheckCircle2 size={14} /> Open Report v{selectedCatalogDocument.version}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="catalog-generate-btn vendor-action-primary-btn"
                        disabled={Boolean(generatingDocument)}
                        onClick={() => void generateDocument(selectedCatalogDefinition.type)}
                      >
                        {generatingDocument === selectedCatalogDefinition.type ? <RefreshCw className="spin" size={14} /> : <Sparkles size={14} />}
                        {generatingDocument === selectedCatalogDefinition.type ? "Generating with Skills…" : "Generate Specialized Report"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      );
    })()}
  </main>;
}
