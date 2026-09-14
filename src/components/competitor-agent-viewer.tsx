"use client";

import { useState, useEffect } from "react";
import {
  ExternalLink,
  RefreshCw,
  Check,
  Copy,
  Target,
  ShieldAlert,
  Zap,
  TrendingUp,
  Award,
  Sparkles,
  Layers,
  Users,
  Compass,
  ArrowRight,
  Flame,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  CompetitorIntelligencePayload,
  CompetitorProfile,
  PrioritizedActionItem,
} from "@/lib/competitors/types";

interface CompetitorAgentViewerProps {
  companyId: string;
  companyName: string;
  websiteUrl: string;
  initialPayload?: CompetitorIntelligencePayload | null;
  onRefreshParent?: () => void;
}

export function CompetitorAgentViewer({
  companyId,
  companyName,
  websiteUrl,
  initialPayload,
  onRefreshParent,
}: CompetitorAgentViewerProps) {
  const [payload, setPayload] = useState<CompetitorIntelligencePayload | null>(initialPayload || null);
  const [loading, setLoading] = useState(!initialPayload);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"landscape" | "actions" | "findings" | "positioning">("landscape");
  const [copiedActionId, setCopiedActionId] = useState<string | null>(null);
  const [expandedCompId, setExpandedCompId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    if (initialPayload) return;
    let active = true;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/agents/competitor/analysis?companyId=${companyId}`);
        if (res.ok) {
          const json = await res.json();
          if (active && json.payload) setPayload(json.payload);
        }
      } catch (err) {
        console.error("Failed to load competitor intelligence", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchData();
    return () => { active = false; };
  }, [companyId, initialPayload]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/agents/competitor/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.payload) {
          setPayload(json.payload);
          if (onRefreshParent) onRefreshParent();
        }
      }
    } catch (err) {
      console.error("Failed to refresh competitor intelligence", err);
    } finally {
      setRefreshing(false);
    }
  }

  function handleCopyAction(action: PrioritizedActionItem) {
    const brief = `ACTION BRIEF: ${action.title}
Priority: ${action.priorityScore}/100 (${action.priorityTier})
Goal/KPI: ${action.goalKpiAlignment}
What to do: ${action.whatShouldBeDone}
Why it matters: ${action.whyItMatters}
Next Step: ${action.concreteNextStep}`;

    navigator.clipboard.writeText(brief);
    setCopiedActionId(action.id);
    setTimeout(() => setCopiedActionId(null), 2000);
  }

  function toggleExpandCompetitor(id: string) {
    setExpandedCompId((prev) => (prev === id ? null : id));
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-slate-500 gap-3 border border-dashed border-slate-200 rounded-lg bg-white">
        <RefreshCw size={20} className="animate-spin text-blue-500" />
        <p className="text-xs font-medium">Scanning domain &amp; analyzing direct market competitors...</p>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-slate-500 gap-3 border border-dashed border-slate-200 rounded-lg bg-white">
        <p className="text-xs">No competitor intelligence available yet.</p>
        <button
          type="button"
          onClick={handleRefresh}
          className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
        >
          <Zap size={13} /> Run Competitor Analysis
        </button>
      </div>
    );
  }

  const { companyProfile, competitors, findings, actionItems, executiveSummary } = payload;

  const filteredFindings = filterCategory === "all"
    ? findings
    : findings.filter((f) => f.type === filterCategory || f.category === filterCategory);

  return (
    <div className="w-full flex flex-col gap-4 text-slate-800 font-sans">
      {/* Minimal Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-lg shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded uppercase tracking-wider">
              <CheckCircle2 size={11} /> Live Verified
            </span>
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-semibold rounded">
              {companyProfile.category}
            </span>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">
            {companyName} Competitor Landscape &amp; Positioning
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded border border-slate-700 text-xs">
            <span className="text-slate-400">Monitored:</span>
            <strong className="text-white font-bold">{competitors.length} Rivals</strong>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            disabled={refreshing}
            onClick={handleRefresh}
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Concise Executive Summary */}
      {executiveSummary && (
        <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-900 dark:text-amber-200">
          <Sparkles size={15} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-slate-700">{executiveSummary}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1 text-xs overflow-x-auto">
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-t font-semibold transition-colors border-b-2 ${
            activeTab === "landscape"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
          }`}
          onClick={() => setActiveTab("landscape")}
        >
          <Compass size={13} /> Competitors ({competitors.length})
        </button>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-t font-semibold transition-colors border-b-2 ${
            activeTab === "actions"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
          }`}
          onClick={() => setActiveTab("actions")}
        >
          <Flame size={13} /> Action Systems ({actionItems.length})
        </button>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-t font-semibold transition-colors border-b-2 ${
            activeTab === "findings"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
          }`}
          onClick={() => setActiveTab("findings")}
        >
          <TrendingUp size={13} /> Strategic Findings ({findings.length})
        </button>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-t font-semibold transition-colors border-b-2 ${
            activeTab === "positioning"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
          }`}
          onClick={() => setActiveTab("positioning")}
        >
          <Layers size={13} /> Company Memory
        </button>
      </div>

      {/* TAB 1: COMPETITOR LANDSCAPE (Minimal Functional Table / Minimal Rows) */}
      {activeTab === "landscape" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Verified Direct Competitor Analysis ({competitors.length} Companies)
            </h3>
          </div>

          <div className="flex flex-col divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
            {competitors.map((comp) => {
              const isExpanded = expandedCompId === comp.id;
              const domain = comp.officialWebsite.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
              const logoSrc = comp.logoUrl
                ? `/api/assets/logo?url=${encodeURIComponent(comp.logoUrl)}`
                : `/api/assets/logo?website=${encodeURIComponent(comp.officialWebsite)}`;

              return (
                <div key={comp.id} className="flex flex-col p-3.5 hover:bg-slate-50/80 transition-colors">
                  {/* Primary Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Competitor Identity with Logo */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        <img
                          src={logoSrc}
                          alt={comp.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // Fallback image if favicon fails
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{comp.name}</h4>
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded uppercase bg-slate-100 text-slate-600 border border-slate-200">
                            {comp.marketShareTier.replace(/_/g, " ")}
                          </span>
                        </div>
                        <a
                          href={comp.officialWebsite}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          {domain} <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>

                    {/* USP & Position */}
                    <div className="flex-1 text-xs text-slate-700 line-clamp-2 sm:px-3 border-l-0 sm:border-l border-slate-200">
                      <strong className="text-slate-900 block text-[11px]">Primary USP:</strong>
                      {comp.primaryUsp || comp.positioningAngle}
                    </div>

                    {/* Expand Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleExpandCompetitor(comp.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded inline-flex items-center gap-1 self-start sm:self-center transition-colors cursor-pointer"
                    >
                      {isExpanded ? "Less Details" : "Details"}
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  {/* How We Differ Callout Line (Always visible for fast reference) */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 text-xs flex items-start gap-1.5 bg-blue-50/60 p-2 rounded text-blue-900">
                    <Zap size={13} className="text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-bold text-blue-950">How We Differ:</strong> {comp.howWeDiffer}
                    </span>
                  </div>

                  {/* Expanded Functional Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-3 text-xs text-slate-700 bg-slate-50/50 p-3 rounded">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <strong className="text-slate-900 text-[11px] block mb-1">Core Offerings &amp; Features:</strong>
                          <div className="flex flex-wrap gap-1">
                            {comp.keyFeatures.map((feat) => (
                              <span key={feat} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-700">
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <strong className="text-slate-900 text-[11px] block mb-1">Pricing &amp; Commercial Model:</strong>
                          <span className="text-slate-800 font-medium">{comp.pricingMarketPosition}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                        <div>
                          <strong className="text-emerald-700 text-[11px] block mb-1">Strengths:</strong>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
                            {comp.strengths.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong className="text-amber-700 text-[11px] block mb-1">Weaknesses / Gaps:</strong>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
                            {comp.weaknesses.map((w, i) => (
                              <li key={i}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PRIORITIZED ACTIONS */}
      {activeTab === "actions" && (
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Prioritized Action Systems ({actionItems.length})
          </h3>

          <div className="flex flex-col gap-2.5">
            {actionItems.map((action) => {
              const isCopied = copiedActionId === action.id;

              return (
                <div
                  key={action.id}
                  className="flex flex-col p-3.5 bg-white border border-slate-200 rounded-lg shadow-sm gap-2 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded">
                        Score {action.priorityScore}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200 rounded uppercase">
                        {action.priorityTier}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{action.title}</h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyAction(action)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      {isCopied ? "Copied" : "Copy Brief"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
                    <div>
                      <strong className="text-slate-900 font-semibold">What to do:</strong> {action.whatShouldBeDone}
                    </div>
                    <div>
                      <strong className="text-slate-900 font-semibold">Why it matters:</strong> {action.whyItMatters}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1 text-blue-700 font-semibold">
                      <ArrowRight size={11} /> Next: {action.concreteNextStep}
                    </span>
                    <span className="font-medium text-slate-400">Aligns with {action.goalKpiAlignment}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: STRATEGIC FINDINGS */}
      {activeTab === "findings" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Normalized Strategic Findings ({findings.length})
            </h3>
            <div className="flex items-center gap-1">
              {["all", "positive_signal", "issue", "opportunity", "risk", "insight"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`px-2 py-1 text-[10px] font-bold rounded uppercase transition-colors ${
                    filterCategory === cat
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {filteredFindings.map((finding) => (
              <div key={finding.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded uppercase">
                      {finding.type.replace(/_/g, " ")}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs">{finding.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Confidence {finding.confidence}%</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{finding.evidence}</p>
                <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                  <strong>Impact:</strong> {finding.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COMPANY MEMORY */}
      {activeTab === "positioning" && (
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Company Strategic Foundation &amp; Memory
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-white border border-slate-200 rounded-lg flex flex-col gap-2">
              <strong className="text-slate-900 font-bold text-xs inline-flex items-center gap-1.5">
                <Layers size={13} /> Core Offer Stack
              </strong>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {companyProfile.coreOfferStack.map((offer, i) => (
                  <li key={i}>{offer}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-lg flex flex-col gap-2">
              <strong className="text-slate-900 font-bold text-xs inline-flex items-center gap-1.5">
                <Users size={13} /> Target Buyer Personas
              </strong>
              <div className="space-y-1.5 text-slate-700">
                {companyProfile.icpsAndPersonas.map((icp, i) => (
                  <div key={i}>
                    <strong>{icp.title}:</strong> {icp.description}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-lg flex flex-col gap-2">
              <strong className="text-slate-900 font-bold text-xs inline-flex items-center gap-1.5">
                <ShieldAlert size={13} /> Customer Pain Points Solved
              </strong>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {companyProfile.painPoints.map((pain, i) => (
                  <li key={i}>{pain}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-lg flex flex-col gap-2">
              <strong className="text-slate-900 font-bold text-xs inline-flex items-center gap-1.5">
                <Award size={13} /> Core Differentiators &amp; Proof
              </strong>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {companyProfile.differentiators.map((diff, i) => (
                  <li key={i}>{diff}</li>
                ))}
              </ul>
              {companyProfile.proofPoints[0] && (
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <strong>Proof Signal:</strong> {companyProfile.proofPoints[0]}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
