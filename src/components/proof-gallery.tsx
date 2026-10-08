import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bot, CheckCircle2, FileText, Gauge, Sparkles } from "lucide-react";

export function ProofGallery() {
  return (
    <section id="proof" className="border-t border-white/10 bg-[#090911] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-purple-400">SEE THE OUTPUT</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
            Intelligence that looks ready to use.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
            KREV AI turns one public website into decision-ready reports, measurable performance signals, and specialist work your team can act on.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.18fr_.82fr]">
          <article className="proof-report-card group overflow-hidden rounded-3xl border border-purple-400/20 bg-[#11101b] shadow-2xl shadow-purple-950/25">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300"><FileText size={17} /></span>
                <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-purple-300">PDF REPORT PREVIEW</p><h3 className="mt-1 text-sm font-semibold text-white">Strategic intelligence, ready for the room</h3></div>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">Evidence-led</span>
            </div>
            <div className="p-5 sm:p-7">
              <div className="proof-report-page rounded-2xl border border-[#e9e1ea] bg-[#fffdfa] p-5 text-[#211a28] shadow-xl sm:p-7">
                <div className="flex items-start justify-between gap-4 border-b border-[#ece5ed] pb-5">
                  <div className="min-w-0">
                    <Image src="/krev-ai-logo.svg" alt="KREV AI" width={156} height={34} className="h-7 w-auto" />
                    <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#7c34bc]">Confidential executive intelligence</p>
                    <h4 className="mt-2 max-w-md text-xl font-extrabold leading-tight tracking-[-0.03em] sm:text-2xl">A clearer path from signal to growth.</h4>
                    <p className="mt-2 max-w-lg text-[11px] leading-relaxed text-[#6b6370]">A connected view of the company, market, search visibility, performance, and next-best actions.</p>
                  </div>
                  <div className="hidden rounded-xl border border-[#e6d9f0] bg-[#fbf7ff] p-3 text-right sm:block"><span className="block text-[8px] font-bold uppercase tracking-[0.14em] text-[#8b2ce0]">Company score</span><strong className="mt-1 block text-3xl font-extrabold text-[#392b47]">78</strong><span className="text-[9px] text-[#7a7082]">evidence index</span></div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {["Visibility", "Performance", "Opportunity"].map((label, index) => <div key={label} className="rounded-xl border border-[#e9e1ea] bg-white p-3"><span className="block text-[8px] font-semibold uppercase tracking-[0.08em] text-[#8b8290]">{label}</span><strong className="mt-2 block text-sm text-[#392b47]">{["82%", "74%", "12" ][index]}</strong><span className="mt-1 block text-[9px] text-[#7a7082]">{["AI visibility", "web health", "priority moves"][index]}</span></div>)}
                </div>
                <div className="mt-5 grid grid-cols-[1.2fr_.8fr] gap-3">
                  <div className="rounded-xl border border-[#e9e1ea] bg-[#fbf7ff] p-3"><span className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#7c34bc]">Decision map</span><div className="mt-3 space-y-2"><div className="h-2 w-[86%] rounded-full bg-gradient-to-r from-[#8b2ce0] to-[#e8447a]" /><div className="h-2 w-[67%] rounded-full bg-[#d9c5e8]" /><div className="h-2 w-[48%] rounded-full bg-[#eadff1]" /></div><p className="mt-3 text-[9px] leading-relaxed text-[#6b6370]">Prioritized recommendations connect evidence, owner, timing, and expected impact.</p></div>
                  <div className="rounded-xl border border-[#e9e1ea] bg-white p-3"><span className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#7c34bc]">Next moves</span><ul className="mt-3 space-y-2 text-[9px] text-[#554c5e]"><li className="flex gap-1.5"><CheckCircle2 size={11} className="shrink-0 text-[#8b2ce0]" />Repair intent gaps</li><li className="flex gap-1.5"><CheckCircle2 size={11} className="shrink-0 text-[#8b2ce0]" />Improve LCP</li><li className="flex gap-1.5"><CheckCircle2 size={11} className="shrink-0 text-[#8b2ce0]" />Publish proof</li></ul></div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-400">Every report carries source context, visual frameworks, and a practical action path.</p><Link href="/docs#reports" className="inline-flex items-center gap-1 text-xs font-semibold text-purple-300 hover:text-white">See report formats <ArrowUpRight size={13} /></Link></div>
            </div>
          </article>

          <div className="grid gap-6">
            <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl shadow-black/20">
              <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><Gauge size={17} /></span><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">ANALYTICS SNAPSHOT</p><h3 className="mt-1 text-sm font-semibold text-white">A page-speed story you can explain</h3></div></div><span className="text-[10px] text-slate-500">Lab estimate</span></div>
              <div className="mt-6 flex items-center gap-5"><div className="proof-score-ring"><strong>86</strong><span>Performance</span></div><div className="grid flex-1 grid-cols-2 gap-2"><div className="proof-metric"><span>FCP</span><strong>1.4s</strong></div><div className="proof-metric"><span>LCP</span><strong>2.1s</strong></div><div className="proof-metric"><span>CLS</span><strong>0.012</strong></div><div className="proof-metric"><span>Requests</span><strong>48</strong></div></div></div>
              <p className="mt-5 text-xs leading-relaxed text-slate-400">Turn performance signals into clear recommendations instead of a score with no owner.</p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/35 via-purple-950/20 to-white/[0.03] p-6 shadow-xl shadow-purple-950/20"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-purple-400/10 text-purple-300"><Bot size={17} /></span><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-purple-300">SPECIALIST WORKSPACE</p><h3 className="mt-1 text-sm font-semibold text-white">Twelve focused agents, one evidence base</h3></div></div><div className="mt-5 grid grid-cols-2 gap-2">{["SEO", "Audience", "Competitors", "Content", "GEO", "Campaigns"].map((label, index) => <div key={label} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-[11px] text-slate-300"><span className={`size-1.5 rounded-full ${index % 2 ? "bg-pink-400" : "bg-purple-400"}`} />{label}<Sparkles size={11} className="ml-auto text-slate-500" /></div>)}</div><p className="mt-5 text-xs leading-relaxed text-slate-400">Each agent gets the same company truth, so recommendations reinforce one another.</p></article>
          </div>
        </div>

        <div className="mt-7 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 text-center sm:flex-row sm:text-left"><div><p className="text-sm font-semibold text-white">Want to see a complete sample?</p><p className="mt-1 text-xs text-slate-400">Open the report preview before connecting your own website.</p></div><Link href="/demo-monthly-summary.html" target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold text-purple-200 transition hover:bg-purple-500/20">Open sample report <ArrowUpRight size={14} /></Link></div>
      </div>
    </section>
  );
}
