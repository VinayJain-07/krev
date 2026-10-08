"use client";

import * as React from "react";
import { Check, X, Sparkles, Shield, ArrowRight } from "lucide-react";

interface ComparisonRow {
  capability: string;
  semrush: { text: string; status: "full" | "basic" | "no" | "manual" };
  ahrefs: { text: string; status: "full" | "basic" | "no" | "manual" };
  hubspot: { text: string; status: "full" | "basic" | "no" | "manual" };
  growpad: { text: string; status: "full" | "basic" | "no" | "manual" };
  smark: { text: string; highlight: boolean };
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    capability: "Keyword Research & Tracking",
    semrush: { text: "Full", status: "full" },
    ahrefs: { text: "Full", status: "full" },
    hubspot: { text: "Basic", status: "basic" },
    growpad: { text: "Full", status: "full" },
    smark: { text: "✓ Full AI + Entity", highlight: true },
  },
  {
    capability: "Competitor Analysis",
    semrush: { text: "SERP Only", status: "basic" },
    ahrefs: { text: "SERP Only", status: "basic" },
    hubspot: { text: "Manual", status: "manual" },
    growpad: { text: "Full", status: "full" },
    smark: { text: "✓ SWOT & Whitespace", highlight: true },
  },
  {
    capability: "AI Content Generation",
    semrush: { text: "Add-on", status: "basic" },
    ahrefs: { text: "✕ No", status: "no" },
    hubspot: { text: "Basic AI", status: "basic" },
    growpad: { text: "Full", status: "full" },
    smark: { text: "✓ 12 Specialist Agents", highlight: true },
  },
  {
    capability: "CRM Pipeline Attribution",
    semrush: { text: "✕ No", status: "no" },
    ahrefs: { text: "✕ No", status: "no" },
    hubspot: { text: "Full", status: "full" },
    growpad: { text: "Full", status: "full" },
    smark: { text: "✓ Closed-Loop Sync", highlight: true },
  },
  {
    capability: "Keyword → Revenue Mapping",
    semrush: { text: "✕ No", status: "no" },
    ahrefs: { text: "✕ No", status: "no" },
    hubspot: { text: "Manual Setup", status: "manual" },
    growpad: { text: "Full", status: "full" },
    smark: { text: "✓ Automated Mapping", highlight: true },
  },
  {
    capability: "Intent Cluster Linkage",
    semrush: { text: "Basic", status: "basic" },
    ahrefs: { text: "Basic", status: "basic" },
    hubspot: { text: "✕ No", status: "no" },
    growpad: { text: "Full", status: "full" },
    smark: { text: "✓ Dynamic JTBD Clusters", highlight: true },
  },
  {
    capability: "AI Overview / AEO Tracking",
    semrush: { text: "✕ No", status: "no" },
    ahrefs: { text: "✕ No", status: "no" },
    hubspot: { text: "✕ No", status: "no" },
    growpad: { text: "Full", status: "full" },
    smark: { text: "✓ ChatGPT, Perplexity & Gemini", highlight: true },
  },
  {
    capability: "Behavioral Intent (Heatmaps / Mining)",
    semrush: { text: "✕ No", status: "no" },
    ahrefs: { text: "✕ No", status: "no" },
    hubspot: { text: "✕ No", status: "no" },
    growpad: { text: "Heatmaps", status: "full" },
    smark: { text: "✓ 100-Pt Live Lead Mining", highlight: true },
  },
  {
    capability: "Evidence-Scored Recommendations",
    semrush: { text: "✕ No", status: "no" },
    ahrefs: { text: "✕ No", status: "no" },
    hubspot: { text: "✕ No", status: "no" },
    growpad: { text: "Full", status: "full" },
    smark: { text: "✓ 100% Sourced Proof", highlight: true },
  },
  {
    capability: "Pipeline Impact Scoring",
    semrush: { text: "✕ No", status: "no" },
    ahrefs: { text: "✕ No", status: "no" },
    hubspot: { text: "✕ No", status: "no" },
    growpad: { text: "Full", status: "full" },
    smark: { text: "✓ AI CMO Prioritization", highlight: true },
  },
];

function StatusBadge({ cell }: { cell: { text: string; status: "full" | "basic" | "no" | "manual" } }) {
  if (cell.status === "full") {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
        <Check className="size-3.5 stroke-[2.5]" />
        <span>{cell.text}</span>
      </span>
    );
  }
  if (cell.status === "no") {
    return (
      <span className="inline-flex items-center gap-1 text-slate-500">
        <X className="size-3.5" />
        <span>No</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-white/[0.04] px-2 py-0.5 text-xs text-slate-300 border border-white/5">
      {cell.text}
    </span>
  );
}

export function ComparisonMatrix() {
  return (
    <section id="comparison" className="relative border-t border-white/10 bg-[#09090e] py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full bg-purple-600/10 blur-[150px]" />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-medium tracking-[0.16em] text-purple-300 uppercase shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Sparkles className="size-3.5 text-purple-400 animate-pulse" />
            WHY KREV AI
          </div>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.01em] text-white sm:text-4xl lg:text-5xl">
            They report data. <br className="hidden sm:inline" />
            <em className="font-serif italic font-normal text-purple-300">We connect it to pipeline.</em>
          </h2>

          <p className="mt-4 text-base font-normal text-slate-300/85 leading-relaxed tracking-[0.012em]">
            Legacy SEO platforms log search numbers. CRMs track closed deals. KREV AI bridges the gap between raw web evidence and revenue growth.
          </p>
        </div>

        {/* The 10-Point Comparison Table */}
        <div className="mt-14 overflow-x-auto rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-purple-950/20">
          <table className="w-full min-w-[780px] text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04] text-slate-300">
                <th className="p-4 sm:p-5 font-medium text-slate-200 tracking-wide w-[28%]">
                  Capability
                </th>
                <th className="p-4 sm:p-5 font-normal text-slate-400 w-[14%] text-center sm:text-left tracking-wide">
                  SEMrush
                </th>
                <th className="p-4 sm:p-5 font-normal text-slate-400 w-[14%] text-center sm:text-left tracking-wide">
                  Ahrefs
                </th>
                <th className="p-4 sm:p-5 font-normal text-slate-400 w-[14%] text-center sm:text-left tracking-wide">
                  HubSpot
                </th>
                <th className="p-4 sm:p-5 font-normal text-slate-400 w-[14%] text-center sm:text-left tracking-wide">
                  Growpad
                </th>
                <th className="p-4 sm:p-5 font-semibold text-white bg-purple-600/15 border-x border-purple-500/30 w-[16%] shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-200 font-medium">KREV AI</span>
                    <span className="rounded bg-purple-500/30 border border-purple-400/40 px-1.5 py-0.5 text-[10px] font-mono text-purple-300 uppercase tracking-wider">
                      AI CMO
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {COMPARISON_DATA.map((row, idx) => (
                <tr
                  key={idx}
                  className="transition-colors hover:bg-white/[0.02] group"
                >
                  {/* Capability Name */}
                  <td className="p-4 sm:p-5 font-normal text-slate-100 group-hover:text-purple-200 transition-colors tracking-[0.01em]">
                    {row.capability}
                  </td>

                  {/* SEMrush */}
                  <td className="p-4 sm:p-5 text-center sm:text-left">
                    <StatusBadge cell={row.semrush} />
                  </td>

                  {/* Ahrefs */}
                  <td className="p-4 sm:p-5 text-center sm:text-left">
                    <StatusBadge cell={row.ahrefs} />
                  </td>

                  {/* HubSpot */}
                  <td className="p-4 sm:p-5 text-center sm:text-left">
                    <StatusBadge cell={row.hubspot} />
                  </td>

                  {/* Growpad */}
                  <td className="p-4 sm:p-5 text-center sm:text-left">
                    <StatusBadge cell={row.growpad} />
                  </td>

                  {/* KREV AI (Highlighted Column) */}
                  <td className="p-4 sm:p-5 bg-purple-600/10 border-x border-purple-500/20 font-semibold text-purple-200">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/20 border border-purple-400/30 px-2.5 py-1 text-xs text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                      {row.smark.text}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom CTA / Guarantee Note */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 text-xs text-slate-400 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Shield className="size-4 text-purple-400 shrink-0" />
            <span>
              All 10 capabilities are powered automatically by our 8-Layer automated crawler &amp; shared vector memory.
            </span>
          </div>
          <a
            href="/onboarding/company"
            className="inline-flex items-center gap-1.5 font-semibold text-purple-300 hover:text-white transition-colors whitespace-nowrap"
          >
            <span>Scan your website now</span>
            <ArrowRight className="size-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
