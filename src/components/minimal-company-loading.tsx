"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Pause,
  Play,
  Zap,
  Plus,
  ArrowUpRight,
  Search,
  CheckCircle2,
  Loader2,
  Globe,
  Sparkles,
  Shield,
  Layers,
  Terminal,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoutButton } from "./logout-button";
import { AuditStoryPanel } from "./audit-story-panel";

export type AuditJobState = {
  status: string;
  progress: number;
  step: string;
  error?: string | null;
  requiresProvider: boolean;
  requiresModelChange: boolean;
  companyId: string;
  companyName: string;
  websiteUrl?: string;
  pagesRead: number;
  agentsReady: number;
  documents: Array<{ type: string; title: string }>;
};

interface MinimalCompanyLoadingProps {
  jobId?: string;
  initial?: AuditJobState;
  initialCompany?: string;
  initialUrl?: string;
  onComplete?: () => void;
}

const crawlSteps = [
  { progress: 8, label: "Verifying website endpoint & robots.txt directives", icon: Globe },
  { progress: 20, label: "Crawling public pages, headers & DOM hierarchy", icon: Search },
  { progress: 38, label: "Extracting offer stack, brand tone & proof ladder", icon: Shield },
  { progress: 54, label: "Checking AI answer engine visibility (ChatGPT, Perplexity)", icon: Sparkles },
  { progress: 72, label: "Mapping competitive whitespace & positioning gaps", icon: Layers },
  { progress: 88, label: "Synthesizing ICP buying jobs & objection trees", icon: Terminal },
  { progress: 96, label: "Compiling 6 connected reports & priming 12 agents", icon: Zap },
  { progress: 100, label: "Foundational marketing workspace ready", icon: CheckCircle2 },
];

export function MinimalCompanyLoading({
  jobId,
  initial,
  initialCompany = "Stripe",
  initialUrl = "https://stripe.com",
  onComplete,
}: MinimalCompanyLoadingProps) {
  const router = useRouter();

  // State
  const [job, setJob] = useState<AuditJobState | null>(initial || null);
  const [company, setCompany] = useState(initial?.companyName || initialCompany);
  const [url, setUrl] = useState(initial?.websiteUrl || initialUrl);
  const [progress, setProgress] = useState(initial?.progress ?? 8);
  const [stepText, setStepText] = useState(initial?.step || "Initializing research crawler...");
  const [isPaused, setIsPaused] = useState(
    initial?.status === "STOPPED" || initial?.step === "Audit stopped by user"
  );
  const [stopping, setStopping] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Claude 3.7 Sonnet (Fast)");
  const [newCompanyInput, setNewCompanyInput] = useState("");
  const [newUrlInput, setNewUrlInput] = useState("");
  const [showStory, setShowStory] = useState(true);
  const [initialDocumentCount] = useState(() => initial?.documents.length ?? 0);
  const workspaceReady = Boolean(jobId && job?.companyId && (["DONE", "PARTIAL"].includes(job.status) || job.documents.length > initialDocumentCount));

  // Live crawl event ticker
  const [liveLogs, setLiveLogs] = useState<string[]>([
    "GET / - 200 OK (214ms)",
    "Parsed DOM nodes, schema.org/Organization identified",
  ]);

  // REAL LIVE AUDIT POLLING (when jobId is present)
  useEffect(() => {
    if (!jobId) return;
    if (isPaused) return;
    if (job?.status && ["DONE", "PARTIAL"].includes(job.status)) return;

    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/audits/${jobId}`, { cache: "no-store" });
        if (!response.ok) return;
        const next = (await response.json()) as AuditJobState;
        setJob(next);
        setProgress(next.progress);
        if (next.companyName) setCompany(next.companyName);
        if (next.step) setStepText(next.step);

        // Update live logs from real crawl events
        if (next.pagesRead > 0) {
          setLiveLogs((prev) => [
            `Indexed ${next.pagesRead} pages & parsed link topology`,
            ...prev.slice(0, 2),
          ]);
        }
        if (next.documents.length > 0) {
          const latestDoc = next.documents[next.documents.length - 1];
          setLiveLogs((prev) => [
            `Ready: ${latestDoc.title}`,
            ...prev.slice(0, 2),
          ]);
        }

      } catch {
        // network retry
      }
    }, 1800);

    return () => window.clearInterval(timer);
  }, [jobId, isPaused, job?.status]);

  // Let someone finish reading the story when the first report becomes ready.
  useEffect(() => {
    if (!jobId || !workspaceReady || showStory || isPaused || !job?.companyId) return;
    const timer = window.setTimeout(() => router.push(`/dashboard/${job.companyId}`), 700);
    return () => window.clearTimeout(timer);
  }, [jobId, workspaceReady, showStory, isPaused, job?.companyId, router]);

  // SIMULATED PROGRESS (only when standalone without real jobId)
  useEffect(() => {
    if (jobId) return; // real audit uses live polling above
    if (isPaused || progress >= 100) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return 100;
        }

        // Update step label in demo mode
        const stepIdx = crawlSteps.findIndex((s, idx) => {
          const nextStep = crawlSteps[idx + 1];
          return next <= (nextStep ? nextStep.progress : 100);
        });
        if (stepIdx !== -1) {
          setStepText(crawlSteps[stepIdx].label);
        }

        // Add periodic terminal logs
        if (next % 12 === 0) {
          const logMessages = [
            `Scraped /pricing - Extracted product tiers`,
            `Analyzed internal link topology (${Math.floor(next * 1.8)} edges mapped)`,
            `Vector similarity check passed on AI answer engines`,
            `Lighthouse performance baseline: 94/100 recorded`,
            `Isolated 4 competitor whitespace opportunities`,
          ];
          const newLog = logMessages[(next / 12) % logMessages.length];
          setLiveLogs((curr) => [newLog, ...curr.slice(0, 2)]);
        }

        return next;
      });
    }, 180 / speedMultiplier);

    return () => clearInterval(interval);
  }, [jobId, isPaused, speedMultiplier, progress, onComplete]);

  // Actions
  async function handleStopOrPause() {
    if (jobId) {
      if (isPaused || isError) {
        // Resume audit
        setRetrying(true);
        try {
          const response = await fetch(`/api/audits/${jobId}`, { method: "POST" });
          const data = (await response.json()) as {
            jobId?: string;
            error?: string;
            requiresProvider?: boolean;
            requiresModelChange?: boolean;
          };
          if (response.ok && data.jobId && data.jobId !== jobId) {
            router.replace(`/onboarding/audit/${data.jobId}`);
            return;
          }
          setJob((current) =>
            current
              ? {
                  ...current,
                  status: "RUNNING",
                  error: data.error ?? null,
                  requiresProvider: Boolean(data.requiresProvider) || current.requiresProvider,
                  requiresModelChange: Boolean(data.requiresModelChange) || current.requiresModelChange,
                }
              : null
          );
          setIsPaused(false);
        } catch {
          setIsPaused(false);
        } finally {
          setRetrying(false);
        }
      } else {
        // Stop audit
        setStopping(true);
        try {
          const response = await fetch(`/api/audits/${jobId}`, { method: "DELETE" });
          const data = (await response.json()) as { status?: string; step?: string };
          setJob((current) =>
            current
              ? {
                  ...current,
                  status: data.status ?? "STOPPED",
                  step: data.step ?? "Audit stopped by user",
                }
              : null
          );
          setIsPaused(true);
        } catch {
          setIsPaused(true);
        } finally {
          setStopping(false);
        }
      }
    } else {
      setIsPaused((prev) => !prev);
    }
  }

  const handleAddCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyInput.trim()) return;
    if (jobId) {
      // In real onboarding, navigate to add company page
      router.push(`/onboarding/company?mode=add`);
    } else {
      setCompany(newCompanyInput.trim());
      setUrl(newUrlInput.trim() || `https://${newCompanyInput.toLowerCase().replace(/\s+/g, "")}.com`);
      setProgress(0);
      setIsPaused(false);
      setShowAddModal(false);
      setNewCompanyInput("");
      setNewUrlInput("");
    }
  };

  const isStopped = isPaused || job?.status === "STOPPED" || job?.step === "Audit stopped by user" || job?.error === "Audit was stopped by user.";
  const providerError = Boolean(job?.requiresProvider);
  const modelError = Boolean(job?.requiresModelChange);
  const isError = job?.status === "ERROR" || providerError || modelError;

  const displayHeadline = modelError
    ? "Change AI Model"
    : providerError
    ? "Connect AI Provider"
    : isError
    ? "Scan Interrupted"
    : isStopped
    ? "Scan Paused"
    : (
      <>
        Searching{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-purple-200">
          {company}
        </span>
      </>
    );

  const displaySubtitle = isStopped
    ? "Audit was paused. You can resume processing, switch AI models, or add another company workspace."
    : modelError
    ? "The selected AI model returned an error. Choose another model in settings to resume."
    : providerError
    ? "Connect and verify your AI provider key to run deep intelligence analyses."
    : isError
    ? (job?.error || "We encountered an issue during crawl. Click Retry to continue.")
    : stepText;

  function closeStory() {
    setShowStory(false);
  }

  return (
    <div className="relative min-h-screen w-full bg-[#05030a] text-slate-100 flex flex-col justify-between overflow-hidden font-sans select-none">
      {/* Pitch Dark Purple Radial Glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(112,26,189,0.15)_0%,rgba(43,10,75,0.08)_40%,transparent_75%)]" />
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-purple-950/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-indigo-950/25 blur-[120px]" />

      {/* Subtle Dot Matrix Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* ========================================================= */}
      {/* 1. TOP MINIMAL HEADER BAR */}
      {/* ========================================================= */}
      <header className="relative z-20 flex w-full items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex size-7 items-center justify-center rounded-full bg-purple-900/40 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.25)] transition-transform group-hover:scale-105">
            <span className="size-2 rounded-full bg-purple-300" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
            Smark Connect
          </span>
        </Link>

        {/* Live Active Signal Chip */}
        <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs backdrop-blur-md">
          <span className="relative flex size-2">
            <span
              className={`absolute inline-flex size-full rounded-full ${
                isError
                  ? "bg-rose-400"
                  : isStopped
                  ? "bg-amber-400"
                  : "bg-emerald-400 animate-ping opacity-75"
              }`}
            />
            <span
              className={`relative inline-flex size-2 rounded-full ${
                isError
                  ? "bg-rose-400 shadow-[0_0_8px_#f87171]"
                  : isStopped
                  ? "bg-amber-400"
                  : "bg-emerald-400 shadow-[0_0_8px_#34d399]"
              }`}
            />
          </span>
          <span className="text-[11px] font-medium text-slate-300">
            {isError ? "Notice" : isStopped ? "Audit Paused" : "Live Deep Scan"}
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-[11px] font-mono text-purple-300 max-w-[140px] truncate">
            {company}
          </span>
        </div>

        {/* Top Right: Security badge + Sign Out */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <Shield className="size-3.5 text-purple-400" />
            <span className="text-[11px]">BYOK &bull; AES-256</span>
          </div>
          <LogoutButton
            className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            label="Sign out"
          />
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. CENTER STAGE: SEARCHING FOR COMPANY & 4 MINIMAL BUTTONS */}
      {/* ========================================================= */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 text-center max-w-2xl mx-auto w-full">
        {/* Radar Pulse Orb with Company Monogram */}
        <div className="relative mb-6 flex size-24 sm:size-28 items-center justify-center">
          {/* Animated concentric pulse rings */}
          <motion.div
            animate={{
              scale: isStopped || isError ? 1 : [1, 1.45, 1.8],
              opacity: isStopped || isError ? 0.2 : [0.6, 0.25, 0],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="absolute inset-0 rounded-full border border-purple-500/30 bg-purple-600/10"
          />
          <motion.div
            animate={{
              scale: isStopped || isError ? 1 : [1, 1.25, 1.5],
              opacity: isStopped || isError ? 0.3 : [0.5, 0.2, 0],
            }}
            transition={{
              duration: 2.4,
              delay: 0.6,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="absolute inset-0 rounded-full border border-indigo-500/30"
          />

          {/* Central Glass Orb */}
          <div className="relative flex size-20 sm:size-22 items-center justify-center rounded-full border border-white/15 bg-gradient-to-b from-white/[0.08] to-purple-950/40 backdrop-blur-2xl shadow-[0_0_35px_rgba(139,44,224,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
              {company.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Eyebrow Kicker */}
        <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-purple-400">
          Autonomous Research Engine
        </span>

        {/* Main Searching Headline */}
        <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
          {displayHeadline}
        </h1>

        {/* Dynamic Context Subtitle */}
        <p
          className={`mt-2.5 max-w-md text-xs sm:text-sm leading-relaxed ${
            isError ? "text-rose-300 font-medium" : "text-slate-400"
          }`}
        >
          {displaySubtitle}
        </p>

        {/* ========================================================= */}
        {/* 3. FOUR MINIMAL BUTTONS */}
        {/* ========================================================= */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {/* Button 1: Pause / Resume / Retry */}
          <button
            type="button"
            disabled={stopping || retrying}
            onClick={handleStopOrPause}
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.015] px-3 text-[11px] font-normal text-slate-400 transition-all hover:border-white/20 hover:bg-white/[0.04] hover:text-slate-200 cursor-pointer active:scale-95 backdrop-blur-sm disabled:opacity-40"
            title={isStopped || isError ? "Resume search" : "Pause search"}
          >
            {isError ? (
              <>
                <RotateCcw className={`size-2.5 text-purple-400 ${retrying ? "animate-spin" : ""}`} />
                <span>{retrying ? "Restarting..." : "Retry"}</span>
              </>
            ) : isStopped ? (
              <>
                <Play className="size-2.5 text-emerald-400 fill-emerald-400" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="size-2.5 text-slate-400" />
                <span>{stopping ? "Stopping..." : "Pause"}</span>
              </>
            )}
          </button>

          {/* Button 2: AI Model / Connect Provider */}
          {jobId ? (
            <Link
              href={
                providerError
                  ? "/settings/credits"
                  : `/settings/credits?reason=model&returnTo=${encodeURIComponent(
                      `/onboarding/audit/${jobId}`
                    )}`
              }
              className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-[11px] font-normal transition-all backdrop-blur-sm cursor-pointer active:scale-95 ${
                providerError || modelError
                  ? "border-purple-500/70 bg-purple-600/20 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.25)]"
                  : "border-white/[0.07] bg-white/[0.015] text-slate-400 hover:border-white/20 hover:bg-white/[0.04] hover:text-slate-200"
              }`}
              title={providerError ? "Connect AI provider" : "Switch AI model in-between"}
            >
              <Zap className="size-2.5 text-slate-400" />
              <span>{providerError ? "Connect AI" : "AI Model"}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setShowModelModal(true)}
              className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.015] px-3 text-[11px] font-normal text-slate-400 transition-all hover:border-white/20 hover:bg-white/[0.04] hover:text-slate-200 cursor-pointer active:scale-95 backdrop-blur-sm"
              title="Switch AI model or speed"
            >
              <Zap className="size-2.5 text-slate-400" />
              <span>AI Model</span>
            </button>
          )}

          {/* Button 3: Add Company */}
          <Link
            href="/onboarding/company?mode=add"
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.015] px-3 text-[11px] font-normal text-slate-400 transition-all hover:border-white/20 hover:bg-white/[0.04] hover:text-slate-200 cursor-pointer active:scale-95 backdrop-blur-sm"
            title="Add another company workspace"
          >
            <Plus className="size-2.5 text-slate-400" />
            <span>Add Company</span>
          </Link>

          {/* Button 4: Preview Workspace */}
          <Link
            href={job?.companyId ? `/dashboard/${job.companyId}` : "/onboarding"}
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.015] px-3 text-[11px] font-normal text-slate-400 transition-all hover:border-white/20 hover:bg-white/[0.04] hover:text-slate-200 cursor-pointer active:scale-95 backdrop-blur-sm"
            title="Open workspace dashboard"
          >
            <span>Preview</span>
            <ArrowUpRight className="size-2.5 text-slate-400" />
          </Link>
        </div>
      </main>

      {/* ========================================================= */}
      {/* 4. MINIMAL LOADING IN THE BOTTOM */}
      {/* ========================================================= */}
      <footer className="relative z-20 w-full px-6 py-5 sm:px-10 border-t border-white/[0.05] bg-[#05030a]/80 backdrop-blur-lg">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          {/* Current Micro Status */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="size-1.5 rounded-full bg-purple-400 animate-pulse shrink-0" />
            <span className="truncate text-slate-300 font-medium">
              {stepText}
            </span>
          </div>

          {/* Hairline Linear Progress Bar with Glow */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative h-1.5 w-full sm:w-56 md:w-64 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-emerald-400 transition-all duration-300 shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                style={{ width: `${Math.min(100, Math.max(3, progress))}%` }}
              />
            </div>

            {/* Numeric Percentage */}
            <span className="font-mono text-xs font-semibold text-white shrink-0 min-w-[36px] text-right">
              {progress}%
            </span>
          </div>
        </div>
      </footer>

      {showStory && (
        <AuditStoryPanel
          company={company}
          progress={progress}
          isLive={Boolean(jobId)}
          scanActive={!isStopped && !isError}
          onRequestClose={closeStory}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD COMPANY QUICK INPUT (Demo Mode) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0714] p-6 shadow-2xl text-left"
            >
              <h3 className="text-lg font-bold text-white">Search Another Company</h3>
              <p className="mt-1 text-xs text-slate-400">
                Enter a different company name and domain to launch a fresh search scan.
              </p>

              <form onSubmit={handleAddCompanySubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Linear"
                    value={newCompanyInput}
                    onChange={(e) => setNewCompanyInput(e.target.value)}
                    className="h-10 w-full rounded-xl border border-white/10 !bg-transparent px-3.5 text-xs text-white placeholder-slate-400 outline-none focus:border-purple-500"
                    style={{ backgroundColor: "transparent" }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Website URL (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your website URL (e.g. linear.app)"
                    value={newUrlInput}
                    onChange={(e) => setNewUrlInput(e.target.value)}
                    className="h-10 w-full rounded-xl border border-white/10 !bg-transparent px-3.5 text-xs text-white placeholder-slate-400 outline-none focus:border-purple-500"
                    style={{ backgroundColor: "transparent" }}
                  />
                </div>

                <div className="mt-5 flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="h-9 rounded-xl border border-white/10 px-4 text-xs font-medium text-slate-300 hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-9 rounded-xl bg-purple-600 px-4 text-xs font-semibold text-white hover:bg-purple-500 shadow-md shadow-purple-600/30 cursor-pointer"
                  >
                    Start Search
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: AI MODEL & SPEED CHANGER (Demo Mode) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showModelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0714] p-6 shadow-2xl text-left"
            >
              <h3 className="text-lg font-bold text-white">Switch AI Engine</h3>
              <p className="mt-1 text-xs text-slate-400">
                Adjust the inference model and crawl throughput for this company scan.
              </p>

              <div className="mt-4 space-y-2">
                {[
                  { name: "Claude 3.7 Sonnet (Fast)", hint: "Recommended &bull; Nuanced strategy & synthesis" },
                  { name: "GPT-4o (High Speed)", hint: "Fastest response times for multi-agent runs" },
                  { name: "Gemini 1.5 Pro", hint: "Long context window for deep document analysis" },
                ].map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => {
                      setSelectedModel(m.name);
                      setShowModelModal(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selectedModel === m.name
                        ? "border-purple-500/60 bg-purple-950/20 text-white"
                        : "border-white/[0.08] bg-white/[0.02] text-slate-300 hover:border-white/20"
                    }`}
                  >
                    <div>
                      <strong className="block text-xs font-semibold">{m.name}</strong>
                      <span className="text-[10px] text-slate-400" dangerouslySetInnerHTML={{ __html: m.hint }} />
                    </div>
                    {selectedModel === m.name && <CheckCircle2 className="size-4 text-purple-400" />}
                  </button>
                ))}
              </div>

              {/* Speed multiplier toggle */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-slate-300">Simulation Speed:</span>
                <div className="flex gap-1.5">
                  {[1, 2, 4].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpeedMultiplier(s)}
                      className={`size-7 rounded-lg text-xs font-mono font-semibold cursor-pointer ${
                        speedMultiplier === s
                          ? "bg-purple-600 text-white"
                          : "bg-white/5 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModelModal(false)}
                  className="h-9 rounded-xl bg-purple-600 px-4 text-xs font-semibold text-white hover:bg-purple-500 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
