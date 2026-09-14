import { currentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SmarkHeroSection } from "@/components/ui/hero-section";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollytellingEightLayers } from "@/components/scrollytelling-eight-layers";
import { ConnectedIntelligenceFlowchart } from "@/components/connected-intelligence-flowchart";
import { SpecialistAgentsFlipper } from "@/components/specialist-agents-flipper";
import { ComparisonMatrix } from "@/components/comparison-matrix";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Zap,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default async function Home() {
  const user = await currentUser();

  // If user is authenticated, route into onboarding or dashboard
  if (user) {
    if (!user.llmVerifiedAt) redirect("/onboarding");
    const company = await db.company.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        auditJobs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    if (!company) redirect("/onboarding");
    if (company.status !== "ACTIVE" && company.auditJobs[0]) {
      redirect(`/onboarding/audit/${company.auditJobs[0].id}`);
    }
    redirect(`/dashboard/${company.id}`);
  }

  // Complete React Landing Page for visitors
  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0f] font-sans text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* Sticky Main Menu Header */}
      <SiteHeader />

      {/* Hero Section */}
      <div className="pt-16">
        <SmarkHeroSection />
      </div>

      {/* The Paradigm Shift Section */}
      <section id="features" className="relative border-t border-white/10 bg-[#0c0c14] py-24 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-purple-400">
            THE PARADIGM SHIFT
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.01em] text-white sm:text-4xl md:text-5xl">
            Why isolated ChatGPT prompts
            <br />
            <span className="text-purple-300 font-serif italic font-normal">fail enterprise growth teams</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-normal leading-relaxed text-slate-300/90 tracking-[0.012em]">
            When marketing teams rely on standalone AI prompts, each team member inputs different context. The result is brand voice drift, contradictory messaging, and fragmented agency reporting. Smark Connect enforces a unified evidence foundation.
          </p>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 text-left">
            {/* Card 1 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-lg transition-all duration-300 hover:border-purple-500/40 hover:bg-white/[0.05]">
              <div className="flex size-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Shield className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">Unified Company Ground Truth</h3>
              <p className="mt-2 text-sm font-normal leading-relaxed text-slate-400 tracking-[0.012em]">
                Single-prompt AI assistants lose brand voice within 3 turns. Smark Connect builds a 20-page web topology baseline so all 12 specialist agents execute from the exact same company truth.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-lg transition-all duration-300 hover:border-indigo-500/40 hover:bg-white/[0.05]">
              <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Zap className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">Vector Synthesis Engine</h3>
              <p className="mt-2 text-sm font-normal leading-relaxed text-slate-400 tracking-[0.012em]">
                Generative Engine Optimization (GEO) requires optimizing for LLM vector resolution rather than blue keyword links. Smark Connect extracts machine-readable entity nodes that rank inside ChatGPT and Perplexity.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-lg transition-all duration-300 hover:border-purple-500/40 hover:bg-white/[0.05]">
              <div className="flex size-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Layers className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">Sure-Shot Recommendations</h3>
              <p className="mt-2 text-sm font-normal leading-relaxed text-slate-400 tracking-[0.012em]">
                Trained on high-dimensional marketing frameworks and B2B growth models. Replaces ambiguous dashboard interpretation with high-confidence, prioritized action items.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8-Layer Information Capture Scrollytelling Experience */}
      <ScrollytellingEightLayers />

      {/* 6 Core Connected Analyses Flowchart */}
      <ConnectedIntelligenceFlowchart />

      {/* 12 Specialist Execution Agents with 3D Flippable Cards */}
      <SpecialistAgentsFlipper />

      {/* Knowledge & Case Studies Bento Grid */}
      <section id="insights" className="border-t border-white/10 bg-[#0c0c14] py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-purple-400">
              PRACTICAL GUIDES
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.01em] text-white sm:text-4xl">
              Guides for Evidence-Led Marketing
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm font-normal text-slate-400 tracking-[0.012em]">
              Clear methods, illustrative examples, and practical exercises for modern marketing teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-black/60 p-7 backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-[10px] font-semibold text-purple-300 uppercase tracking-wider">Generative Search Guide</span>
                <span className="text-xs text-purple-400 font-medium">Framework + Exercise</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">How to Measure Generative Search Visibility</h3>
              <p className="mt-2 text-sm text-slate-300/85 leading-relaxed tracking-[0.012em]">
                Build a repeatable query set, record citations and brand mentions, and turn missing answers into a focused editorial backlog.
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
                <span>Includes an illustrative example</span>
                <Link href="/blog/the-shift-from-search-to-synthesis-benchmarking-geo-in-2026" className="text-purple-300 font-medium hover:underline inline-flex items-center gap-1">
                  Read guide <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-slate-500/20 px-3 py-1 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Intent Playbook</span>
                <span className="text-xs text-slate-300 font-medium">Research Workflow</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">Turning Public Buying Signals into a B2B Research Workflow</h3>
              <p className="mt-2 text-sm text-slate-300/85 leading-relaxed tracking-[0.012em]">
                Distinguish active evaluation from general chatter, qualify the context, and respond in a way that helps the buyer.
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
                <span>Includes a qualification rubric</span>
                <Link href="/blog/commercial-intent-mining-turning-social-signals-into-b2b-pipeline" className="text-purple-300 font-medium hover:underline inline-flex items-center gap-1">
                  Read guide <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix with all 10 points and competitor breakdown */}
      <ComparisonMatrix />

      {/* Pricing Teaser Section */}
      <section className="border-t border-white/10 bg-[#0c0c14] py-24 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-purple-400">
            SIMPLE PRICING
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.01em] text-white sm:text-5xl">
            One plan. <em className="font-serif italic font-normal text-purple-300">Everything included.</em>
          </h2>
          <p className="mt-3 text-sm font-normal text-slate-400 tracking-[0.012em]">
            No feature gating. No per-seat charges. Every workspace gets the full platform.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 text-left">
            {/* Monthly Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-md flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold tracking-[0.12em] text-slate-400">MONTHLY</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$59</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="mt-2 text-xs text-slate-400 tracking-[0.012em]">Ideal for teams testing new company scans month-to-month.</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-300 tracking-[0.012em]">
                  {["Six evidence-led analyses", "AI CMO cross-document synthesis", "12+ specialist agents on demand", "PDF, PPTX, XLSX exports", "2M token workspace budget"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-purple-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href="/onboarding"
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 text-xs font-medium tracking-wide text-white transition-all hover:bg-white/10"
                >
                  Start monthly
                </Link>
                <p className="mt-2 text-center text-[11px] text-slate-500">Cancel any time. No lock-in.</p>
              </div>
            </div>

            {/* Annual Card */}
            <div className="rounded-2xl border border-purple-500/50 bg-gradient-to-b from-purple-950/20 to-white/[0.04] p-8 backdrop-blur-md shadow-xl shadow-purple-950/20 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-4 right-4 rounded-full bg-purple-600 px-3 py-0.5 text-[10px] font-semibold tracking-wider text-white">
                SAVE 44%
              </div>
              <div>
                <span className="text-xs font-semibold tracking-[0.12em] text-purple-300">ANNUAL (RECOMMENDED)</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$399</span>
                  <span className="text-xs text-slate-400">/ year</span>
                </div>
                <p className="mt-2 text-xs text-purple-200/80 tracking-[0.012em]">That&apos;s $33/month, billed annually. Saves $309 per year.</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-200 tracking-[0.012em]">
                  {["Everything in Monthly", "Priority crawler queue", "Unlimited company workspaces", "Self-hosted Lighthouse audits", "Bring your own AI key"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-purple-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href="/onboarding"
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-white text-xs font-medium tracking-wide text-black shadow-lg transition-all hover:bg-slate-200"
                >
                  Start annual
                </Link>
                <p className="mt-2 text-center text-[11px] text-slate-400">Full platform included. 30-day guarantee.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="border-t border-white/10 bg-[#07070a] py-24 px-6 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-purple-400">
            YOUR NEXT MOVE IS IN THE DATA
          </span>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.01em] text-white sm:text-5xl">
            Give your marketing
            <br />
            <em className="font-serif italic font-normal text-purple-300">direction.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base font-normal text-slate-300/90 tracking-[0.012em]">
            Connect your website. Build your company intelligence. Let an AI CMO and twelve specialist agents do the rest.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 text-sm font-medium tracking-wide text-white shadow-xl shadow-purple-600/30 transition-all hover:brightness-110 active:scale-95"
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
