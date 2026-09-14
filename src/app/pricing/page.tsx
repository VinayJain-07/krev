import * as React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Layers,
  Search,
  Users,
  Compass,
  FileText,
  BarChart3,
  Bot,
  HelpCircle,
} from "lucide-react";

export const metadata = {
  title: "Pricing — Smark Connect",
  description: "Simple, transparent pricing. One plan with everything included. No feature gating, no per-seat charges.",
};

export default function PricingPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0f] font-sans text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* Sticky Main Menu Header */}
      <SiteHeader activeNav="pricing" />

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-16 text-center md:pt-36">
        <div className="mx-auto max-w-4xl">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
            SIMPLE PRICING
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            One plan.
            <br />
            <span className="font-serif italic font-normal text-purple-300">Everything included.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400">
            No feature gating. No per-seat charges. Every workspace gets the full platform, all six intelligence engines, and twelve specialist agents.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Monthly Card */}
            <div className="relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/30 hover:bg-white/[0.05]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    MONTHLY
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-white">$59</span>
                  <span className="text-sm font-medium text-slate-400">/month</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Full flexibility. Cancel or pause anytime without lock-in.
                </p>

                <div className="my-8 border-t border-white/10" />

                <ul className="space-y-3.5 text-xs text-slate-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>Six evidence-led core analyses</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>AI CMO cross-document synthesis</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>12+ specialist agents on demand</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>Branded PDF, PPTX, XLSX exports</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>Self-hosted Lighthouse technical audits</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>Live conversation intent mining</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>2M token workspace budget</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>Unlimited companies in your workspace</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>Bring your own AI key (OpenAI, Claude, Gemini)</span>
                  </li>
                </ul>
              </div>

              <div className="mt-10">
                <Link
                  href="/onboarding"
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 text-xs font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
                >
                  Start monthly
                </Link>
                <p className="mt-2.5 text-center text-[11px] text-slate-500">
                  Cancel any time. No lock-in contract.
                </p>
              </div>
            </div>

            {/* Annual Card (Featured) */}
            <div className="relative flex flex-col justify-between rounded-2xl border border-purple-500/50 bg-gradient-to-b from-purple-950/20 via-white/[0.03] to-white/[0.02] p-8 shadow-2xl shadow-purple-500/10 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/70">
              <div className="absolute -top-3.5 right-6 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-purple-600/30">
                Save 44%
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    ANNUAL PLAN
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-white">$399</span>
                  <span className="text-sm font-medium text-slate-400">/year</span>
                </div>
                <p className="mt-2 text-xs text-purple-300">
                  That&apos;s $33/month, billed annually. Saves you $309/year.
                </p>

                <div className="my-8 border-t border-purple-500/20" />

                <ul className="space-y-3.5 text-xs text-slate-200">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>Six evidence-led core analyses</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>AI CMO cross-document synthesis</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>12+ specialist agents on demand</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>Branded PDF, PPTX, XLSX exports</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>Self-hosted Lighthouse technical audits</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>Live conversation intent mining</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>2M token workspace budget</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>Unlimited companies in your workspace</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-purple-400" />
                    <span>Bring your own AI key (OpenAI, Claude, Gemini)</span>
                  </li>
                </ul>
              </div>

              <div className="mt-10">
                <Link
                  href="/onboarding"
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-white text-xs font-semibold text-black shadow-lg transition-all hover:bg-slate-200 active:scale-95"
                >
                  Start annual
                </Link>
                <p className="mt-2.5 text-center text-[11px] text-slate-400">
                  Full platform included. 30-day money-back guarantee.
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Note Banner */}
          <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center text-xs text-slate-400 backdrop-blur-sm">
            Both plans include the full platform. The annual plan saves you $309 per year.
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="border-t border-white/10 bg-[#0c0c14] py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
              FULL CAPABILITIES
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Everything you need,
              <br />
              <span className="font-serif italic font-normal text-purple-300">nothing you don&apos;t.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">
              Every subscriber gets unrestricted access to our complete marketing intelligence engine, agent suite, and stakeholder export formats.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Column 1: Intelligence & Analysis */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-lg transition-all duration-300 hover:border-purple-500/40 hover:bg-white/[0.05]">
              <div className="flex size-11 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
                <Search className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">Intelligence & Analysis</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Six interconnected evidence engines that examine your digital topology:
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-purple-400" />
                  <span>Company Intelligence & Offer Stack</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-purple-400" />
                  <span>Technical SEO & Internal Link Topology</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-purple-400" />
                  <span>GEO & AI Answer Engine Visibility</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-purple-400" />
                  <span>Competitor Landscape & Whitespace SWOT</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-purple-400" />
                  <span>Audience ICPs & Objection Mapping</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-purple-400" />
                  <span>Content Strategy & Pillar Roadmap</span>
                </li>
              </ul>
            </div>

            {/* Column 2: Agents & Execution */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-lg transition-all duration-300 hover:border-indigo-500/40 hover:bg-white/[0.05]">
              <div className="flex size-11 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                <Bot className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">Agents & Execution</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Specialized agents grounded in your verified company ground truth:
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-indigo-400" />
                  <span>AI CMO Cross-Document Synthesis</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-indigo-400" />
                  <span>Technical SEO & Structured Data Agent</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-indigo-400" />
                  <span>Editorial & Content Planning Agent</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-indigo-400" />
                  <span>Social Agents (X, LinkedIn, Reddit, IG)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-indigo-400" />
                  <span>Email & Newsletter Drip Architect</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-indigo-400" />
                  <span>YouTube, Creative & Outbound Agents</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Platform & Exports */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-lg transition-all duration-300 hover:border-purple-500/40 hover:bg-white/[0.05]">
              <div className="flex size-11 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
                <FileText className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">Platform & Exports</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Stakeholder-ready deliverables formatted for boardrooms and teams:
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-purple-400" />
                  <span>Branded PDF Executive Narrative Reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-purple-400" />
                  <span>Editable PPTX Presentation Decks</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-purple-400" />
                  <span>Operational XLSX Action Workbooks</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-purple-400" />
                  <span>Self-Hosted Local Lighthouse Audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-purple-400" />
                  <span>Live 100-Point Intent Social Mining</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-purple-400" />
                  <span>Audit Version History & Targeted Edits</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-white/10 bg-[#0a0a0f] py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Answers to common questions
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-400">
              Clear terms with no surprises. Contact support if you need anything else.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-lg">
              <h3 className="text-base font-bold text-white flex items-center gap-2.5">
                <HelpCircle className="size-4 text-purple-400 shrink-0" />
                Is there a free trial?
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                You can sign up and explore the demo company workspace at zero cost. When you are ready to connect your own domain and execute full crawlers and reports, select either the monthly or annual plan.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-lg">
              <h3 className="text-base font-bold text-white flex items-center gap-2.5">
                <HelpCircle className="size-4 text-purple-400 shrink-0" />
                What counts as a token?
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Tokens measure the underlying LLM inference across your analysis runs, focused edits, and agent task runs. A full 20-page crawl and 6-document synthesis consumes approximately 180k–300k tokens. Your 2M token budget comfortably powers 6–8 complete audits with ample room for ongoing iterative edits.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-lg">
              <h3 className="text-base font-bold text-white flex items-center gap-2.5">
                <HelpCircle className="size-4 text-purple-400 shrink-0" />
                Can I switch plans later?
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Yes. You can upgrade or downgrade anytime through your workspace settings. When switching from monthly to annual, your unused monthly balance is automatically credited toward the annual invoice.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-lg">
              <h3 className="text-base font-bold text-white flex items-center gap-2.5">
                <HelpCircle className="size-4 text-purple-400 shrink-0" />
                What AI providers are supported?
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Smark Connect supports OpenAI, Anthropic (Claude), Google Gemini, and OpenRouter. You bring your own API key, which is encrypted with AES-256 at rest and never exposed to client browsers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="border-t border-white/10 bg-[#07070a] py-24 px-6 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
            YOUR NEXT MOVE IS IN THE DATA
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Give your marketing
            <br />
            <em className="font-serif italic font-normal text-purple-300">direction.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-400">
            Connect your website. Build your company intelligence. Let an AI CMO and twelve specialist agents do the rest.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 text-sm font-semibold text-white shadow-xl shadow-purple-600/30 transition-all hover:brightness-110 active:scale-95"
            >
              <span>Start with your website</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Standard Footer */}
      <SiteFooter />
    </div>
  );
}
