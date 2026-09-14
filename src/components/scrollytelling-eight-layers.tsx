"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll } from "motion/react";
import {
  Activity,
  Layers,
  Search,
  Compass,
  BarChart3,
  Users,
  Radio,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  Globe,
  TrendingUp,
  Cpu,
  Terminal,
  FileCode,
  Scan
} from "lucide-react";

interface LayerData {
  id: number;
  layerNumber: string;
  tag: string;
  headline: string;
  subheadline: string;
  copy: string;
  category: "Internal Strategy" | "External Execution" | "Conclusion";
}

const LAYERS: LayerData[] = [
  {
    id: 1,
    layerNumber: "01",
    tag: "LAYER 01 • NETWORK BASELINE",
    headline: "Start with Clarity.",
    subheadline: "The Status Quo: Raw Infrastructure",
    copy: "Before defining the future, we must understand the now. Measuring HTTP response timing, TTFB latency baselines, server geography, and asset delivery speeds across global edge nodes.",
    category: "Internal Strategy",
  },
  {
    id: 2,
    layerNumber: "02",
    tag: "LAYER 02 • ENTITY GRAPH & DATA STRUCTURE",
    headline: "The Architecture of Intent.",
    subheadline: "Building the Foundation: Structured Knowledge",
    copy: "A rigid, logical framework transforms information into insight. Disambiguating brand entities into machine-readable JSON-LD claim graphs for LLM ingestion and vector resolution.",
    category: "Internal Strategy",
  },
  {
    id: 3,
    layerNumber: "03",
    tag: "LAYER 03 • TECHNICAL AUDIT",
    headline: "Precision, Uncompromised.",
    subheadline: "The Integrity Check: Core Web Vitals",
    copy: "Rigorous analysis ensures every element is optimized for performance. Running local headless Chromium audits for Core Web Vitals, server response, and crawl architecture.",
    category: "Internal Strategy",
  },
  {
    id: 4,
    layerNumber: "04",
    tag: "LAYER 04 • TOPIC GAP ANALYSIS",
    headline: "Discover the Whitespace.",
    subheadline: "Finding the Gaps: Saturated vs Uncontested",
    copy: "Innovation lives in the areas others overlook. Isolating uncontested search demand, content positioning chasms, and buyer queries that competitors ignore.",
    category: "Internal Strategy",
  },
  {
    id: 5,
    layerNumber: "05",
    tag: "LAYER 05 • COMPETITOR BENCHMARKING",
    headline: "Define the Standard.",
    subheadline: "Setting the Benchmark: Multi-Dimensional Positioning",
    copy: "Understand the landscape. Then rewrite the rules. Multi-dimensional positioning that rises distinctly above legacy vendor limitations and commoditized features.",
    category: "Internal Strategy",
  },
  {
    id: 6,
    layerNumber: "06",
    tag: "LAYER 06 • AUDIENCE PERSONAS & JTBD",
    headline: "Designed for Them.",
    subheadline: "Human Connection: ICPs & Buying Jobs",
    copy: "Strategy is only effective when it resonates on a human level. Translating cold technical analytics into Jobs-To-Be-Done profiles, emotional triggers, and executive empathy.",
    category: "External Execution",
  },
  {
    id: 7,
    layerNumber: "07",
    tag: "LAYER 07 • LIVE INTENT MINING",
    headline: "Every Voice Heard.",
    subheadline: "Listening to the Noise: Real-Time Signals",
    copy: "Real-time insights keep the strategy agile and responsive. Detecting 100-point commercial buying triggers and pain points across Reddit, X, and LinkedIn.",
    category: "External Execution",
  },
  {
    id: 8,
    layerNumber: "08",
    tag: "LAYER 08 • CMO ACTION ROADMAP",
    headline: "The Path Forward. Defined.",
    subheadline: "The Roadmap to Launch: Deterministic Execution",
    copy: "A precise execution plan brings the vision to life. Synthesizing all 8 layers into an unambiguous 30/60/90-day operational roadmap for modern growth leaders.",
    category: "External Execution",
  },
  {
    id: 9,
    layerNumber: "09",
    tag: "THE CONCLUSION • ASSEMBLED TRUTH",
    headline: "From Raw URL to Deterministic Strategy.",
    subheadline: "Single Source of Marketing Truth",
    copy: "Our automated crawler processes your web footprint across 8 specialized layers to assemble a board-ready marketing command center in under 3 minutes.",
    category: "Conclusion",
  },
];

export function ScrollytellingEightLayers() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [isManualOverride, setIsManualOverride] = React.useState<boolean>(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (progress) => {
      if (isManualOverride) return;
      const step = Math.min(8, Math.max(0, Math.floor(progress * 9)));
      setActiveStep(step);
    });
    return () => unsubscribe();
  }, [scrollYProgress, isManualOverride]);

  const scrollToStep = (index: number) => {
    setIsManualOverride(true);
    setActiveStep(index);
    if (containerRef.current) {
      const containerTop = containerRef.current.offsetTop;
      const totalHeight = containerRef.current.offsetHeight - window.innerHeight;
      const targetScroll = containerTop + (index / 8.2) * totalHeight;
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
    setTimeout(() => setIsManualOverride(false), 800);
  };

  const current = LAYERS[activeStep] || LAYERS[0];
  const isExternalExecution = current.category === "External Execution";

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#07070a] border-t border-white/10"
      style={{ height: "700vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between selection:bg-purple-600/30 selection:text-white">
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-colors duration-1000 ${
            isExternalExecution
              ? "bg-gradient-to-b from-[#0c0e18] via-[#0d1020] to-[#080911]"
              : current.category === "Conclusion"
              ? "bg-gradient-to-b from-[#0a0814] via-[#100b24] to-[#07070a]"
              : "bg-gradient-to-b from-[#07070a] via-[#090910] to-[#060609]"
          }`}
        />

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-3xl transition-all duration-1000 opacity-25 ${
            isExternalExecution
              ? "bg-indigo-500/20"
              : current.category === "Conclusion"
              ? "bg-purple-500/30 scale-125 opacity-40"
              : "bg-purple-600/20"
          }`}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px]"
        />

        <header className="relative z-20 pt-8 px-6 sm:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Layers className="size-3.5" />
            </div>
            <div>
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-purple-400 block">
                8-LAYER INFORMATION CAPTURE
              </span>
              <span className="text-xs font-normal text-slate-400 tracking-[0.012em]">
                From raw URL to deterministic strategy
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-medium tracking-[0.04em] border transition-all duration-500 ${
                isExternalExecution
                  ? "bg-white/10 text-white border-white/30 shadow-md shadow-white/5"
                  : current.category === "Conclusion"
                  ? "bg-purple-600/30 text-purple-200 border-purple-500/40"
                  : "bg-purple-950/40 text-purple-300 border-purple-500/20"
              }`}
            >
              {current.category === "Internal Strategy" && "PHASE 1 • INTERNAL STRATEGY"}
              {current.category === "External Execution" && "PHASE 2 • EXTERNAL MARKET EXECUTION"}
              {current.category === "Conclusion" && "PHASE 3 • ASSEMBLED TRUTH"}
            </span>
          </div>
        </header>

        <div className="relative z-20 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto w-full px-6 sm:px-12 py-4">
          <div className="lg:col-span-6 flex flex-col justify-center max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-2 rounded-md border border-purple-500/30 bg-purple-950/40 px-3 py-1 text-[11px] font-mono font-medium tracking-[0.04em] text-purple-300 mb-4">
                  <span className="size-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span>{current.tag}</span>
                </div>

                <h3 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.01em] text-white leading-[1.12]">
                  {current.headline}
                </h3>

                <p className="mt-2 text-xs sm:text-sm font-medium text-purple-300/90 tracking-[0.08em] uppercase">
                  {current.subheadline}
                </p>

                <p className="mt-4 text-sm sm:text-base font-normal leading-relaxed text-slate-300/90 max-w-lg tracking-[0.012em]">
                  {current.copy}
                </p>

                <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-4">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-purple-400">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold tracking-[0.14em] text-slate-400 block">
                      OUTPUT SPECIFICATION
                    </span>
                    <span className="text-xs font-medium text-slate-100 tracking-[0.012em]">
                      {activeStep === 0 && "Sub-100ms baseline telemetry & DNS topology"}
                      {activeStep === 1 && "Verified JSON-LD microdata & entity claims"}
                      {activeStep === 2 && "Headless Chromium Core Web Vitals (100/100)"}
                      {activeStep === 3 && "Uncontested positioning chasms & search gaps"}
                      {activeStep === 4 && "+535% Generative engine citation advantage"}
                      {activeStep === 5 && "Audience JTBD empathy & buyer objection map"}
                      {activeStep === 6 && "100-Point verified commercial intent leads"}
                      {activeStep === 7 && "Prioritized 30/60/90-day C-suite roadmap"}
                      {activeStep === 8 && "Unified marketing command center in 3 minutes"}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="lg:col-span-6 flex items-center justify-center relative min-h-[340px] sm:min-h-[420px]">
            <AnimatePresence mode="wait">
              {activeStep === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="relative flex flex-col items-center justify-center w-full max-w-md p-8 rounded-3xl border border-purple-500/30 bg-black/60 backdrop-blur-xl shadow-2xl"
                >
                  <div className="relative size-48 flex items-center justify-center my-4">
                    <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-ping" style={{ animationDuration: "3s" }} />
                    <div className="absolute inset-4 rounded-full border border-purple-500/30" />
                    <div className="absolute inset-10 rounded-full border border-dashed border-indigo-500/40 animate-spin" style={{ animationDuration: "20s" }} />
                    <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(168,85,247,0.25)_60deg,transparent_90deg)] animate-spin" style={{ animationDuration: "4s" }} />
                    <div className="size-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/50">
                      <Activity className="size-7 animate-pulse" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 w-full mt-4 font-mono text-[11px]">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center">
                      <span className="text-slate-400 block text-[9px]">TTFB LATENCY</span>
                      <span className="font-bold text-emerald-400">42ms [OPTIMAL]</span>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center">
                      <span className="text-slate-400 block text-[9px]">PROTOCOL</span>
                      <span className="font-bold text-purple-300">HTTP/3 QUIC</span>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center">
                      <span className="text-slate-400 block text-[9px]">SERVER REGION</span>
                      <span className="font-bold text-slate-200">US-East Edge</span>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center">
                      <span className="text-slate-400 block text-[9px]">DNS RESOLUTION</span>
                      <span className="font-bold text-emerald-400">8ms Cached</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="relative flex flex-col items-center justify-center w-full max-w-md p-7 rounded-3xl border border-indigo-500/30 bg-black/60 backdrop-blur-xl shadow-2xl font-mono"
                >
                  <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 text-xs text-indigo-400">
                    <span className="flex items-center gap-1.5 font-bold">
                      <FileCode className="size-4" />
                      JSON-LD CLAIM GRAPH
                    </span>
                    <span className="text-[10px] text-emerald-400">DISAMBIGUATED</span>
                  </div>

                  <div className="w-full my-4 space-y-2.5 text-[11px]">
                    <div className="rounded-xl border border-purple-500/40 bg-purple-950/30 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-purple-400" />
                        <span className="text-white font-bold">@type: SoftwareApplication</span>
                      </div>
                      <span className="text-purple-300 text-[10px]">Primary Entity</span>
                    </div>

                    <div className="ml-4 pl-3 border-l-2 border-indigo-500/40 space-y-2">
                      <div className="rounded-lg border border-white/10 bg-white/5 p-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-300">applicationCategory</span>
                        <span className="text-emerald-400">&quot;MarketingIntelligence&quot;</span>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-300">operatingSystem</span>
                        <span className="text-emerald-400">&quot;Web&quot;</span>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-300">entityClarityScore</span>
                        <span className="text-purple-300 font-bold">94 / 100</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-300 font-medium">AI Crawler Directive</span>
                      <span className="text-white font-bold">Allow GPTBot & Perplexity</span>
                    </div>
                  </div>

                  <div className="w-full text-center text-[10px] text-slate-500 pt-2 border-t border-white/5">
                    Structured Schema Nodes Linked to 8-Layer Knowledge Graph
                  </div>
                </motion.div>
              )}

              {activeStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="relative flex flex-col items-center justify-center w-full max-w-md p-7 rounded-3xl border border-emerald-500/30 bg-black/60 backdrop-blur-xl shadow-2xl overflow-hidden"
                >
                  <motion.div
                    animate={{ y: [-140, 140] }}
                    transition={{ duration: 2.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] z-30 pointer-events-none"
                  />

                  <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 text-xs text-emerald-400">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Scan className="size-4" />
                      LIGHTHOUSE AUDIT TELEMETRY
                    </span>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-bold">
                      100 / 100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full my-5 font-mono text-xs">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
                      <span className="text-[10px] text-slate-400 block">LCP (Largest Contentful)</span>
                      <span className="text-base font-bold text-white">0.9s</span>
                      <span className="text-[10px] text-emerald-400 block mt-0.5">● Good (&lt;2.5s)</span>
                    </div>

                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
                      <span className="text-[10px] text-slate-400 block">CLS (Layout Shift)</span>
                      <span className="text-base font-bold text-white">0.00</span>
                      <span className="text-[10px] text-emerald-400 block mt-0.5">● Zero Shift</span>
                    </div>

                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
                      <span className="text-[10px] text-slate-400 block">INP (Interaction Next)</span>
                      <span className="text-base font-bold text-white">38ms</span>
                      <span className="text-[10px] text-emerald-400 block mt-0.5">● High Responsiveness</span>
                    </div>

                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
                      <span className="text-[10px] text-slate-400 block">TBT (Blocking Time)</span>
                      <span className="text-base font-bold text-white">18ms</span>
                      <span className="text-[10px] text-emerald-400 block mt-0.5">● No Main-Thread Halt</span>
                    </div>
                  </div>

                  <div className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-white/5 text-[11px]">
                    <span className="text-slate-300">Self-Hosted Chromium Pipeline</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" />
                      All Inefficiencies Calibrated
                    </span>
                  </div>
                </motion.div>
              )}

              {activeStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="relative flex flex-col items-center justify-center w-full max-w-md p-7 rounded-3xl border border-purple-500/40 bg-black/60 backdrop-blur-xl shadow-2xl"
                >
                  <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 text-xs text-purple-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Compass className="size-4" />
                      UNCONTESTED MARKET WHITESPACE
                    </span>
                    <span className="text-[10px] text-purple-300">3 CHASMS ISOLATED</span>
                  </div>

                  <div className="w-full my-4 space-y-3">
                    <div className="relative rounded-2xl border border-purple-500/50 bg-gradient-to-r from-purple-950/60 to-black p-4 shadow-lg overflow-hidden">
                      <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-purple-500 animate-pulse" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">AI CMO Strategy Synthesis</span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          0 Direct Competitors
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-purple-200/80">
                        Monthly Commercial Intent Volume: 6,400 queries. Saturated tools lack multi-agent reasoning.
                      </p>
                    </div>

                    <div className="relative rounded-2xl border border-indigo-500/40 bg-indigo-950/30 p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Deterministic Brand Guardrails</span>
                        <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full">
                          High Whitespace
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-300">
                        Enterprise buyer objection: fear of hallucinated claims across 10+ marketing agents.
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Saturated Red-Ocean Topics</span>
                      <span className="text-rose-400 font-medium">Bypassed (Zero ROI)</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="relative flex flex-col items-center justify-center w-full max-w-md p-7 rounded-3xl border border-purple-500/50 bg-black/70 backdrop-blur-xl shadow-2xl"
                >
                  <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 text-xs text-purple-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="size-4" />
                      MULTI-DIMENSIONAL BENCHMARK
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">+535% DELTA</span>
                  </div>

                  <div className="w-full mt-4 rounded-2xl border border-purple-400 bg-gradient-to-b from-purple-900/40 to-black p-4 shadow-xl shadow-purple-950/40 relative">
                    <div className="absolute -top-2.5 right-4 rounded-full bg-purple-600 px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                      ELEVATED STRATEGY
                    </div>
                    <h4 className="text-xs font-bold text-white">Smark Connect 8-Layer Vector Graph</h4>
                    <p className="text-[11px] text-purple-200 mt-1">
                      89% Generative Engine Vector Resolution across ChatGPT Search, Perplexity, and Claude.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-emerald-300 font-semibold">
                      <CheckCircle2 className="size-3.5" />
                      Deterministic multi-agent execution & proof ladder nodes
                    </div>
                  </div>

                  <div className="w-full mt-3 space-y-2 opacity-50">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Legacy Tool A (Keyword Matching)</span>
                      <span>14% Mention Rate</span>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Legacy Tool B (Basic Schema Org)</span>
                      <span>38% Mention Rate</span>
                    </div>
                  </div>

                  <div className="w-full text-center text-[10px] text-slate-500 pt-3 border-t border-white/5 mt-3">
                    Strategy Positioned Distinctly Above Competitor Baselines
                  </div>
                </motion.div>
              )}

              {activeStep === 5 && (
                <motion.div
                  key="step-5"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="relative flex flex-col items-center justify-center w-full max-w-md p-6 sm:p-7 rounded-3xl border border-white/30 bg-slate-950/90 backdrop-blur-2xl shadow-2xl text-white"
                >
                  <div className="w-full flex items-center justify-between pb-3 border-b border-white/15 text-xs text-indigo-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-4 text-purple-400" />
                      AUDIENCE ICP & JTBD PROFILES
                    </span>
                    <span className="text-[10px] text-slate-300">EMPATHY MAP</span>
                  </div>

                  <div className="w-full my-4 space-y-3">
                    <div className="rounded-2xl border border-purple-500/40 bg-purple-950/40 p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Sarah Chen • Enterprise CMO</span>
                        <span className="text-[10px] text-purple-300 font-mono">Executive ICP</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-300 italic">
                        &quot;Needs board-ready narrative decks in minutes without 3-week agency delays.&quot;
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[9px]">
                        <span className="rounded bg-white/10 px-2 py-0.5 text-purple-200">Board Alignment</span>
                        <span className="rounded bg-white/10 px-2 py-0.5 text-purple-200">ROI Clarity</span>
                        <span className="rounded bg-white/10 px-2 py-0.5 text-purple-200">Zero Risk</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Marcus Vance • VP of Growth</span>
                        <span className="text-[10px] text-indigo-300 font-mono">Demand Gen</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-300 italic">
                        &quot;Requires verified intent leads mined directly from social conversations.&quot;
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[9px]">
                        <span className="rounded bg-white/10 px-2 py-0.5 text-indigo-200">100-Pt Leads</span>
                        <span className="rounded bg-white/10 px-2 py-0.5 text-indigo-200">Pipeline Velocity</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Elena Rostova • Head of Organic</span>
                        <span className="text-[10px] text-emerald-400 font-mono">Technical</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 italic">
                        &quot;Demands 100/100 Core Web Vitals and LLM citation dominance.&quot;
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeStep === 6 && (
                <motion.div
                  key="step-6"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="relative flex flex-col items-center justify-center w-full max-w-lg p-5 sm:p-6 rounded-3xl border border-purple-500/40 bg-black/85 backdrop-blur-2xl shadow-2xl overflow-hidden font-sans"
                >
                  {/* Concentric Ambient Acoustic Ripples */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-3xl opacity-20">
                    <div className="size-64 rounded-full border border-orange-500/30 animate-ping" style={{ animationDuration: "3.5s" }} />
                    <div className="size-96 rounded-full border border-purple-500/20 animate-ping" style={{ animationDuration: "5s", animationDelay: "1s" }} />
                  </div>

                  {/* Header */}
                  <div className="relative z-10 w-full flex items-center justify-between pb-3.5 border-b border-white/10 text-xs text-purple-400 font-bold">
                    <span className="flex items-center gap-2 text-white">
                      <span className="relative flex size-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
                      </span>
                      <span className="text-xs uppercase tracking-wider font-semibold text-purple-300">
                        LIVE SOCIAL INTENT RADAR
                      </span>
                    </span>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] text-emerald-300 font-mono font-bold">
                      24H FRESHNESS WINDOW
                    </span>
                  </div>

                  {/* Dynamic Stream Container */}
                  <div className="relative z-10 w-full my-4 space-y-3.5">
                    {/* REDDIT INTENT SIGNAL CARD */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="group relative rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-950/20 via-black/60 to-black p-4 transition-all duration-300 hover:border-orange-500/60 hover:bg-orange-950/30 shadow-lg"
                    >
                      {/* Top Meta Bar with Official Reddit Logo */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="relative size-7 rounded-full overflow-hidden border border-orange-500/50 bg-black flex items-center justify-center shadow-md shadow-orange-500/20">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/agent-logos/reddit.svg"
                              alt="Reddit Logo"
                              className="size-full object-cover transition-transform group-hover:scale-110"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white tracking-wide">r/marketing</span>
                              <span className="text-[10px] text-slate-400">• u/SaaS_Growth_Lead</span>
                            </div>
                            <span className="text-[10px] text-orange-300/80 font-mono">
                              Verified Demand Gen VP • 4m ago
                            </span>
                          </div>
                        </div>

                        {/* Intent Score Badge */}
                        <div className="rounded-full border border-emerald-500/40 bg-emerald-950/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 shadow-sm flex items-center gap-1">
                          <Zap className="size-3 text-emerald-400 fill-emerald-400" />
                          <span>99 / 100 PRIORITY</span>
                        </div>
                      </div>

                      {/* Question / Asking Text */}
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-200 leading-relaxed">
                        <p className="font-semibold text-white mb-1">
                          &quot;Looking for an AI platform that unifies complete website intelligence + multi-agent execution? Tired of prompt drift across tools.&quot;
                        </p>
                        <p className="text-[11px] text-slate-400 italic">
                          &quot;We&apos;re replacing our legacy SEO stack. Budget is approved for Q4. Need verified evidence, not hallucinations.&quot;
                        </p>
                      </div>

                      {/* Outbound Hook Telemetry Pill */}
                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 text-orange-300 font-medium">
                          <span>⚡ Trigger:</span>
                          <span className="text-slate-300">&quot;budget approved for Q4 • replacing SEO stack&quot;</span>
                        </span>
                        <span className="text-emerald-400 font-mono font-bold">Hook Generated</span>
                      </div>
                    </motion.div>

                    {/* X (TWITTER) INTENT SIGNAL CARD */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.25 }}
                      className="group relative rounded-2xl border border-white/20 bg-gradient-to-r from-white/[0.04] via-black/60 to-black p-4 transition-all duration-300 hover:border-white/40 hover:bg-white/[0.06] shadow-lg"
                    >
                      {/* Top Meta Bar with Official X Logo */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="relative size-7 rounded-full overflow-hidden border border-white/30 bg-black flex items-center justify-center shadow-md">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/agent-logos/x.svg"
                              alt="X Logo"
                              className="size-full object-cover transition-transform group-hover:scale-110"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">David Miller</span>
                              <span className="text-[10px] text-slate-400">@david_growth</span>
                            </div>
                            <span className="text-[10px] text-purple-300/80 font-mono">
                              Head of Growth • 14m ago
                            </span>
                          </div>
                        </div>

                        {/* Intent Score Badge */}
                        <div className="rounded-full border border-purple-500/40 bg-purple-950/50 px-2.5 py-0.5 text-[10px] font-bold text-purple-300 shadow-sm flex items-center gap-1">
                          <Zap className="size-3 text-purple-400 fill-purple-400" />
                          <span>96 / 100 STRONG</span>
                        </div>
                      </div>

                      {/* Question / Asking Text */}
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-200 leading-relaxed">
                        <p className="font-semibold text-white mb-1">
                          &quot;What tool are growth teams using to turn live web audits into board-ready strategy decks? Need 100% grounded evidence, not generic chat prompts.&quot;
                        </p>
                        <p className="text-[11px] text-slate-400 italic">
                          &quot;Evaluating new autonomous marketing engines this week. Who has cracked multi-agent voice consistency across channels? Drop recs 👇&quot;
                        </p>
                      </div>

                      {/* Outbound Hook Telemetry Pill */}
                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 text-purple-300 font-medium">
                          <span>🎯 Trigger:</span>
                          <span className="text-slate-300">&quot;evaluating new autonomous marketing engines&quot;</span>
                        </span>
                        <span className="text-purple-400 font-mono font-bold">DM Hook Prepared</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Bottom Stats Footer */}
                  <div className="relative z-10 w-full flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-white/5 text-[11px]">
                    <span className="text-slate-300 font-medium">Automated 100-Point Scoring</span>
                    <span className="text-emerald-400 font-mono font-bold">0% SDR Time Wasted</span>
                  </div>
                </motion.div>
              )}

              {activeStep === 7 && (
                <motion.div
                  key="step-7"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="relative flex flex-col items-center justify-center w-full max-w-md p-7 rounded-3xl border border-purple-500/40 bg-black/70 backdrop-blur-xl shadow-2xl"
                >
                  <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 text-xs text-purple-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-4" />
                      30 / 60 / 90-DAY ACTION ROADMAP
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">DETERMINISTIC</span>
                  </div>

                  <div className="w-full my-4 space-y-3 relative pl-6 border-l-2 border-purple-500/40 font-sans">
                    <div className="relative">
                      <span className="absolute -left-[31px] top-1 size-3 rounded-full bg-purple-500 shadow-md shadow-purple-500" />
                      <span className="text-[10px] uppercase font-bold text-purple-400">DAYS 01 – 30</span>
                      <h4 className="text-xs font-bold text-white">Foundation & Schema Ingestion</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Deploy JSON-LD entity graph, calibrate Core Web Vitals to 100/100, establish baseline crawl.
                      </p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[31px] top-1 size-3 rounded-full bg-indigo-500 shadow-md shadow-indigo-500" />
                      <span className="text-[10px] uppercase font-bold text-indigo-400">DAYS 31 – 60</span>
                      <h4 className="text-xs font-bold text-white">Whitespace Mining & Agent Sprints</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Deploy 12 specialist execution agents to close competitor gaps and mine 90+ point intent leads.
                      </p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[31px] top-1 size-3 rounded-full bg-emerald-500 shadow-md shadow-emerald-500" />
                      <span className="text-[10px] uppercase font-bold text-emerald-400">DAYS 61 – 90</span>
                      <h4 className="text-xs font-bold text-white">AI CMO Synthesis & Market Scale</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Automated board decks, zero context drift across 14 channels, and continuous vector ranking.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeStep === 8 && (
                <motion.div
                  key="step-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="relative flex flex-col items-center justify-center w-full max-w-md p-8 rounded-3xl border border-purple-500/50 bg-gradient-to-br from-purple-950/50 via-black to-[#0a0a10] backdrop-blur-xl shadow-2xl text-center"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-xl shadow-purple-600/50 mb-4">
                    <Sparkles className="size-6" />
                  </div>

                  <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">
                    READY FOR IMMEDIATE AUDIT
                  </span>

                  <h4 className="mt-2 text-xl font-bold text-white">
                    Assemble Your Marketing Truth
                  </h4>

                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    Connect your website URL. Let our crawler process your 8 specialized layers in under 3 minutes.
                  </p>

                  <div className="mt-6 w-full flex flex-col gap-3">
                    <Link
                      href="/onboarding"
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 text-xs font-semibold text-white shadow-xl shadow-purple-600/30 hover:brightness-110 active:scale-95 transition-all"
                    >
                      <span>Start 8-Layer Analysis</span>
                      <ArrowRight className="size-4" />
                    </Link>

                    <Link
                      href="/docs"
                      className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                    >
                      Explore Documentation
                    </Link>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="size-3 text-emerald-400" />
                      Encrypted at rest
                    </span>
                    <span>•</span>
                    <span>Bring your own AI key</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <footer className="relative z-20 pb-8 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-4">
          <div className="flex items-center gap-2">
            {LAYERS.map((layer, idx) => (
              <button
                key={layer.id}
                type="button"
                onClick={() => scrollToStep(idx)}
                className={`group relative flex items-center justify-center transition-all duration-300 focus:outline-none ${
                  activeStep === idx
                    ? "w-8 h-2.5 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"
                    : "w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Jump to Layer ${layer.layerNumber}: ${layer.headline}`}
              >
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-[9px] font-mono text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap border border-white/10">
                  {layer.layerNumber} {layer.headline}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <span>
              STEP {activeStep + 1} OF {LAYERS.length}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollToStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="size-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Previous Layer"
              >
                <ChevronUp className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollToStep(Math.min(LAYERS.length - 1, activeStep + 1))}
                disabled={activeStep === LAYERS.length - 1}
                className="size-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Next Layer"
              >
                <ChevronDown className="size-4" />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
