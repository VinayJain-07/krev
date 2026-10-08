import { ReactNode } from "react";
import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { KrevLogo } from "./krev-logo";
import { Check, Shield } from "lucide-react";

const steps = [
  { number: "01", label: "Connect AI" },
  { number: "02", label: "Add company" },
  { number: "03", label: "Initial audit" },
];

export function OnboardingLayout({ activeStep, children }: { activeStep: number; children: ReactNode }) {
  return (
    <main className="relative min-h-screen w-full bg-[#0a0a0f] font-sans text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#0a0a0f]/85 px-6 backdrop-blur-xl md:px-12">
        <Link href="/" className="group flex items-center gap-3">
          <KrevLogo inverse compact className="transition-transform group-hover:scale-[1.03]" />
        </Link>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span>Secure Onboarding</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <Shield className="size-3.5 text-purple-400" />
            <span>BYOK &bull; AES-256</span>
          </div>
          <LogoutButton className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all" label="Sign out" />
        </div>
      </header>

      {/* Frame */}
      <div className="pt-16 min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-[380px_1fr]">
        {/* Progress Sidebar */}
        <aside className="border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0c0c14] p-8 md:p-12 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
              SET UP YOUR AI CMO
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Three steps to your first marketing brief.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Connect your company and KREV AI will turn your live website into an actionable marketing workspace.
            </p>

            <ol className="mt-10 space-y-3">
              {steps.map((step, index) => {
                const isComplete = index < activeStep;
                const isCurrent = index === activeStep;
                return (
                  <li
                    key={step.number}
                    className={`flex items-center gap-3.5 rounded-xl border p-3.5 text-xs transition-all ${
                      isCurrent
                        ? "border-purple-500/50 bg-purple-950/20 text-white font-semibold"
                        : isComplete
                        ? "border-white/10 bg-white/[0.02] text-slate-300"
                        : "border-white/5 bg-transparent text-slate-500"
                    }`}
                  >
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isComplete
                          ? "bg-purple-600 text-white"
                          : isCurrent
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                          : "bg-white/5 text-slate-500"
                      }`}
                    >
                      {isComplete ? <Check className="size-3.5 stroke-[3]" /> : step.number}
                    </span>
                    <div className="min-w-0">
                      <strong className="block text-xs font-semibold">{step.label}</strong>
                      <small className="block text-[11px] text-slate-400">
                        {isComplete ? "Complete" : isCurrent ? "In Progress" : "Upcoming"}
                      </small>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-12 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-slate-400 flex items-start gap-3">
            <Shield className="size-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-white">Your data stays private.</strong>
              <span>Provider keys are encrypted at rest with AES-256 and never returned to the browser.</span>
            </div>
          </div>
        </aside>

        {/* Stage Content */}
        <section className="relative flex items-center justify-center p-6 md:p-12 bg-[#0a0a0f]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,rgba(139,44,224,0.06)_0%,transparent_100%)]" />
          <div className="relative z-10 w-full max-w-xl">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
