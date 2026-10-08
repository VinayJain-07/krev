"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Search,
  Globe,
  PenTool,
  Mail,
  Video,
  Palette,
  Crosshair,
  Target,
  RotateCw,
  CheckCircle2,
  Sparkles,
  Bot,
  Zap,
  ArrowRight,
  Filter,
  ExternalLink,
} from "lucide-react";

export interface SpecialistAgent {
  id: string;
  number: string;
  name: string;
  category: "search" | "content" | "revenue";
  categoryLabel: string;
  tagline: string;
  iconType: "image" | "lucide";
  iconSrc?: string;
  lucideIcon?: React.ComponentType<{ className?: string }>;
  accentColor: {
    border: string;
    borderHover: string;
    bg: string;
    glow: string;
    badge: string;
    text: string;
  };
  mission: string;
  groundedIn: string;
  deliverables: string[];
  keyMetric: string;
}

const AGENTS: SpecialistAgent[] = [
  {
    id: "seo-agent",
    number: "01",
    name: "SEO Agent",
    category: "search",
    categoryLabel: "Technical Architecture",
    tagline: "Technical Fixes & CWV Remediation",
    iconType: "lucide",
    lucideIcon: Search,
    accentColor: {
      border: "border-cyan-500/30",
      borderHover: "hover:border-cyan-400",
      bg: "bg-cyan-950/20",
      glow: "shadow-cyan-500/20",
      badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
      text: "text-cyan-400",
    },
    mission: "Diagnoses crawl friction, validates heading hierarchy cascades, repairs orphaned page trees, and drafts automated technical schema.",
    groundedIn: "SEO Technical Audit & Chromium Core Web Vitals Trace",
    deliverables: ["JSON-LD Structured Data Schema", "Internal Link Re-Balancing Graph", "Core Web Vitals Remediation Specs"],
    keyMetric: "100% Crawl Indexability & Sub-Second LCP",
  },
  {
    id: "geo-agent",
    number: "02",
    name: "GEO Agent",
    category: "search",
    categoryLabel: "Synthesized AI Search",
    tagline: "LLM Citation Placement Depth",
    iconType: "lucide",
    lucideIcon: Globe,
    accentColor: {
      border: "border-violet-500/30",
      borderHover: "hover:border-violet-400",
      bg: "bg-violet-950/20",
      glow: "shadow-violet-500/20",
      badge: "bg-violet-500/10 text-violet-300 border-violet-500/20",
      text: "text-violet-400",
    },
    mission: "Optimizes brand vector presence inside LLM answer engines (ChatGPT Search, Perplexity Pro, Claude, and Gemini) via entity clarity graphs.",
    groundedIn: "GEO & AI Visibility Report + Entity Graph Model",
    deliverables: ["Entity Schema Claim Graphs", "AI Crawler Directives (robots.txt)", "LLM Query Synthesized Answer Snippets"],
    keyMetric: "+310% Generative Citation Probability",
  },
  {
    id: "content-agent",
    number: "03",
    name: "Content Agent",
    category: "content",
    categoryLabel: "Editorial & Inbound",
    tagline: "Pillar Clusters & High-Intent BOFU",
    iconType: "lucide",
    lucideIcon: PenTool,
    accentColor: {
      border: "border-emerald-500/30",
      borderHover: "hover:border-emerald-400",
      bg: "bg-emerald-950/20",
      glow: "shadow-emerald-500/20",
      badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      text: "text-emerald-400",
    },
    mission: "Architects full-funnel editorial clusters and bottom-of-funnel comparison guides that convert research intent into pipeline.",
    groundedIn: "Content Strategy & Audience JTBD Pain Vectors",
    deliverables: ["90-Day Pillar Topic Clusters", "High-Intent BOFU Conversion Playbooks", "Semantic Search Content Briefs"],
    keyMetric: "100% Brand Voice Consistency & Zero Fluff",
  },
  {
    id: "x-agent",
    number: "04",
    name: "X (Twitter) Agent",
    category: "content",
    categoryLabel: "Organic Distribution",
    tagline: "Breakdown Threads & Contrarian Takes",
    iconType: "image",
    iconSrc: "/agent-logos/x.svg",
    accentColor: {
      border: "border-white/20",
      borderHover: "hover:border-white/50",
      bg: "bg-slate-900/40",
      glow: "shadow-white/10",
      badge: "bg-white/10 text-slate-200 border-white/20",
      text: "text-slate-200",
    },
    mission: "Crafts thought-provoking contrarian threads, timely industry hot-takes, and engagement hooks directly in the executive founder voice.",
    groundedIn: "Company Intelligence Brand Voice + Live Mining Trends",
    deliverables: ["5-to-7 Post Breakdown Threads", "Daily Viral Conversation Hijacks", "High-Engagement Hook Variations"],
    keyMetric: "4.8x Higher Bookmark-to-Impression Ratio",
  },
  {
    id: "linkedin-agent",
    number: "05",
    name: "LinkedIn Agent",
    category: "content",
    categoryLabel: "B2B Thought Leadership",
    tagline: "Executive Narratives & Carousels",
    iconType: "image",
    iconSrc: "/agent-logos/linkedin.svg",
    accentColor: {
      border: "border-sky-500/30",
      borderHover: "hover:border-sky-400",
      bg: "bg-sky-950/20",
      glow: "shadow-sky-500/20",
      badge: "bg-sky-500/10 text-sky-300 border-sky-500/20",
      text: "text-sky-400",
    },
    mission: "Builds authoritative founder narratives, document carousel outlines, and B2B case studies optimized for executive feed dwell time.",
    groundedIn: "Company Intelligence Offer Stack + Competitor SWOT",
    deliverables: ["Swipeable PDF Carousel Outlines", "Executive Founder Op-Eds", "B2B Framework Deconstructions"],
    keyMetric: "Optimized for Senior Decision-Maker Feeds",
  },
  {
    id: "reddit-agent",
    number: "06",
    name: "Reddit Agent",
    category: "content",
    categoryLabel: "Community Mining",
    tagline: "Authentic Replies & Commercial Intent",
    iconType: "image",
    iconSrc: "/agent-logos/reddit.svg",
    accentColor: {
      border: "border-orange-500/30",
      borderHover: "hover:border-orange-400",
      bg: "bg-orange-950/20",
      glow: "shadow-orange-500/20",
      badge: "bg-orange-500/10 text-orange-300 border-orange-500/20",
      text: "text-orange-400",
    },
    mission: "Surfaces high-intent subreddit discussions and drafts authentic, helpful replies that establish technical authority without sales spam.",
    groundedIn: "100-Point Intent Lead Miner & Objection Playbook",
    deliverables: ["Value-First Discussion Comment Scripts", "Subreddit Commercial Intent Telemetry", "Community AMA Briefs"],
    keyMetric: "0 Spam Flags & High Organic Upvote Velocity",
  },
  {
    id: "instagram-agent",
    number: "07",
    name: "Instagram Agent",
    category: "content",
    categoryLabel: "Visual Social Media",
    tagline: "Carousel Outlines & Reel Storyboards",
    iconType: "image",
    iconSrc: "/agent-logos/instagram.svg",
    accentColor: {
      border: "border-pink-500/30",
      borderHover: "hover:border-pink-400",
      bg: "bg-pink-950/20",
      glow: "shadow-pink-500/20",
      badge: "bg-pink-500/10 text-pink-300 border-pink-500/20",
      text: "text-pink-400",
    },
    mission: "Designs high-retention visual carousels, 30-second Reel storyboards, and aesthetic educational graphics for modern B2B founders.",
    groundedIn: "Company Intelligence Brand Voice + Content Pillars",
    deliverables: ["10-Slide Educational Carousel Wireframes", "30s Short-Form Video Storyboards", "High-Engagement Caption Bundles"],
    keyMetric: "Maximizes Saves & Direct Message Inquiries",
  },
  {
    id: "email-agent",
    number: "08",
    name: "Email Agent",
    category: "revenue",
    categoryLabel: "Retention & Lifecycle",
    tagline: "Nurture Sequences & Newsletters",
    iconType: "lucide",
    lucideIcon: Mail,
    accentColor: {
      border: "border-amber-500/30",
      borderHover: "hover:border-amber-400",
      bg: "bg-amber-950/20",
      glow: "shadow-amber-500/20",
      badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      text: "text-amber-400",
    },
    mission: "Builds automated 5-part lead onboarding sequences, weekly intelligence newsletters, and high-open rate subject line matrices.",
    groundedIn: "Audience JTBD Triggers & Offer Stack Categorization",
    deliverables: ["5-Part Automated Onboarding Drips", "Weekly Curated Industry Newsletters", "High-Conversion Cold Email Copy"],
    keyMetric: "48%+ Average B2B Executive Open Rates",
  },
  {
    id: "youtube-agent",
    number: "09",
    name: "YouTube Agent",
    category: "content",
    categoryLabel: "Long-Form Video",
    tagline: "Video Scripts & Thumbnail Concepts",
    iconType: "lucide",
    lucideIcon: Video,
    accentColor: {
      border: "border-rose-500/30",
      borderHover: "hover:border-rose-400",
      bg: "bg-rose-950/20",
      glow: "shadow-rose-500/20",
      badge: "bg-rose-500/10 text-rose-300 border-rose-500/20",
      text: "text-rose-400",
    },
    mission: "Structures deep-dive video concepts, script outlines, high-retention first 30 seconds hooks, and chapter timestamps.",
    groundedIn: "SEO Content Clusters & Proof Ladder Architecture",
    deliverables: ["Full Video Narrative Scripts", "High-CTR Thumbnail Visual Briefs", "Search-Optimized Video Metadata"],
    keyMetric: "60%+ Video Audience Retention at 30 Seconds",
  },
  {
    id: "creative-agent",
    number: "10",
    name: "Creative Agent",
    category: "revenue",
    categoryLabel: "Visual Brand Design",
    tagline: "Infographic Briefs & Design Systems",
    iconType: "lucide",
    lucideIcon: Palette,
    accentColor: {
      border: "border-purple-500/30",
      borderHover: "hover:border-purple-400",
      bg: "bg-purple-950/20",
      glow: "shadow-purple-500/20",
      badge: "bg-purple-500/10 text-purple-300 border-purple-500/20",
      text: "text-purple-400",
    },
    mission: "Transforms technical audit scores and strategic positioning into executive design briefs, infographic concepts, and ad creative boards.",
    groundedIn: "Brand Visual Guidelines & KREV AI Design System",
    deliverables: ["Figma Design Wireframe Briefs", "Statistical Infographic Blueprints", "High-Performing Ad Creative Concepts"],
    keyMetric: "Board-Ready Executive Aesthetic Fidelity",
  },
  {
    id: "competitor-agent",
    number: "11",
    name: "Competitor Agent",
    category: "revenue",
    categoryLabel: "Market Intelligence",
    tagline: "Feature Teardowns & Battlecards",
    iconType: "lucide",
    lucideIcon: Crosshair,
    accentColor: {
      border: "border-rose-500/30",
      borderHover: "hover:border-rose-400",
      bg: "bg-rose-950/20",
      glow: "shadow-rose-500/20",
      badge: "bg-rose-500/10 text-rose-300 border-rose-500/20",
      text: "text-rose-400",
    },
    mission: "Continuously tracks rival feature roadmaps, pricing page alterations, and generates sales battlecards highlighting your uncontested advantages.",
    groundedIn: "Competitor Whitespace Report & Live SERP Crawling",
    deliverables: ["Competitor Pricing & Tier Matrix", "Sales Objection Battlecards", "Positioning Arbitrage Counter-Hooks"],
    keyMetric: "Exploits Saturated Competitor Blindspots",
  },
  {
    id: "outbound-agent",
    number: "12",
    name: "Outbound Lead Agent",
    category: "revenue",
    categoryLabel: "Active Pipeline",
    tagline: "100-Pt Intent Leads & SDR Hooks",
    iconType: "lucide",
    lucideIcon: Target,
    accentColor: {
      border: "border-sky-500/30",
      borderHover: "hover:border-sky-400",
      bg: "bg-sky-950/20",
      glow: "shadow-sky-500/20",
      badge: "bg-sky-500/10 text-sky-300 border-sky-500/20",
      text: "text-sky-400",
    },
    mission: "Surfaces 100-point intent prospects across Reddit, X, and LinkedIn, generating verified trigger events and personalized outreach openers.",
    groundedIn: "Live Conversation Miner + Audience ICP Persona Dossier",
    deliverables: ["Trigger-Event Outbound Emails", "Personalized LinkedIn Connection Hooks", "Executive SDR Lead Qualification Cards"],
    keyMetric: "32%+ Positive Reply Rate on Trigger Events",
  },
];

type CategoryFilter = "all" | "search" | "content" | "revenue";

export function SpecialistAgentsFlipper() {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const [allFlipped, setAllFlipped] = useState(false);

  const toggleCard = (id: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleAll = () => {
    const nextState = !allFlipped;
    setAllFlipped(nextState);
    const updated: Record<string, boolean> = {};
    AGENTS.forEach((a) => {
      updated[a.id] = nextState;
    });
    setFlippedCards(updated);
  };

  const filteredAgents = AGENTS.filter((agent) => {
    if (activeFilter === "all") return true;
    return agent.category === activeFilter;
  });

  return (
    <section id="specialist-agents" className="relative border-t border-white/10 bg-[#09090e] py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background illumination */}
      <div className="pointer-events-none absolute top-1/4 -left-40 size-96 rounded-full bg-purple-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-1/4 -right-40 size-96 rounded-full bg-blue-600/10 blur-[140px]" />

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-medium tracking-[0.16em] text-purple-300 uppercase shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Bot className="size-3.5 text-purple-400 animate-pulse" />
            ON-DEMAND SPECIALIST EXECUTION
          </div>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.01em] text-white sm:text-4xl lg:text-5xl">
            12 Specialist Execution Agents
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base font-normal text-slate-300/85 tracking-[0.012em]">
            Grounded in the same unified company truth. No briefings, no context drift. Click any card to flip and inspect what each specialist builds.
          </p>

          {/* Controls Bar: Category Filters & Flip All Toggle */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-mono mr-1 hidden sm:inline">Filter:</span>
              {[
                { id: "all", label: "All 12 Agents" },
                { id: "search", label: "Search & Technical (2)" },
                { id: "content", label: "Content & Social (6)" },
                { id: "revenue", label: "Pipeline & Creative (4)" },
              ].map((filter) => {
                const isActive = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id as CategoryFilter)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-purple-600 text-white shadow-md shadow-purple-500/25 border border-purple-400"
                        : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white border border-white/10"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* Flip All Button */}
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-mono text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all ml-auto"
            >
              <RotateCw className={`size-3.5 text-purple-400 transition-transform duration-500 ${allFlipped ? "rotate-180" : ""}`} />
              <span>{allFlipped ? "Reset All Cards" : "Flip All 12 Cards"}</span>
            </button>
          </div>
        </div>

        {/* 12 FLIPPABLE CARDS GRID */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAgents.map((agent) => {
            const isFlipped = !!flippedCards[agent.id];
            const LucideIcon = agent.lucideIcon;

            return (
              <div
                key={agent.id}
                onClick={() => toggleCard(agent.id)}
                className="group relative cursor-pointer select-none"
                style={{ perspective: "1000px" }}
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative h-[290px] w-full rounded-2xl"
                >
                  {/* FRONT FACE */}
                  <div
                    style={{ backfaceVisibility: "hidden" }}
                    className={`absolute inset-0 flex flex-col justify-between rounded-2xl border bg-white/[0.03] p-5 backdrop-blur-md transition-all duration-300 group-hover:bg-white/[0.05] ${
                      agent.accentColor.border
                    } ${agent.accentColor.borderHover} shadow-lg ${agent.accentColor.glow}`}
                  >
                    <div>
                      {/* Card Top: Number & Category */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                          AGENT {agent.number}
                        </span>
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${agent.accentColor.badge}`}
                        >
                          {agent.categoryLabel}
                        </span>
                      </div>

                      {/* Icon & Title */}
                      <div className="mt-4 flex items-center gap-3">
                        <div
                          className={`relative flex size-12 shrink-0 items-center justify-center rounded-xl border overflow-hidden ${agent.accentColor.badge}`}
                        >
                          {agent.iconType === "image" && agent.iconSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={agent.iconSrc}
                              alt={agent.name}
                              className="size-7 object-contain transition-transform group-hover:scale-110"
                            />
                          ) : LucideIcon ? (
                            <LucideIcon className="size-6 transition-transform group-hover:scale-110" />
                          ) : (
                            <Bot className="size-6" />
                          )}
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-white group-hover:text-purple-300 transition-colors">
                            {agent.name}
                          </h3>
                          <p className="text-[11px] font-normal text-slate-400 leading-tight mt-0.5 tracking-[0.01em]">
                            {agent.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Mission Excerpt */}
                      <p className="mt-3 text-xs font-normal leading-relaxed text-slate-300 line-clamp-3 tracking-[0.012em]">
                        {agent.mission}
                      </p>
                    </div>

                    {/* Front Card Footer */}
                    <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-[10px] text-slate-500 tracking-[0.02em]">
                        {agent.keyMetric}
                      </span>
                      <span className={`flex items-center gap-1.5 font-medium ${agent.accentColor.text} group-hover:underline`}>
                        <span>Flip details</span>
                        <RotateCw className="size-3 transition-transform group-hover:rotate-90" />
                      </span>
                    </div>
                  </div>

                  {/* BACK FACE (FLIPPED 180 DEG) */}
                  <div
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                    className={`absolute inset-0 flex flex-col justify-between rounded-2xl border bg-gradient-to-b from-[#11111b] to-[#0a0a12] p-5 backdrop-blur-xl shadow-2xl ${
                      agent.accentColor.border
                    }`}
                  >
                    <div>
                      {/* Back Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`size-2 rounded-full bg-purple-400 animate-ping`} />
                          <span className="text-xs font-semibold text-white">
                            {agent.name} Specs
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-purple-400 uppercase flex items-center gap-1">
                          <RotateCw className="size-2.5" /> Back
                        </span>
                      </div>

                      {/* Grounded In */}
                      <div className="mt-2.5">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
                          Grounded in Company Truth:
                        </span>
                        <p className="text-[11px] text-purple-300 font-medium leading-tight mt-0.5">
                          {agent.groundedIn}
                        </p>
                      </div>

                      {/* Deliverables Checklist */}
                      <div className="mt-2.5">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
                          Concrete Deliverables:
                        </span>
                        <ul className="mt-1 space-y-1">
                          {agent.deliverables.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-1.5 text-[10px] text-slate-300 leading-tight"
                            >
                              <CheckCircle2 className="size-3 shrink-0 text-emerald-400 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Back Footer */}
                    <div className="border-t border-white/10 pt-2.5 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-mono">
                        Target Velocity:
                      </span>
                      <span className="font-semibold text-emerald-400">
                        Zero Context Drift
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center backdrop-blur-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="text-sm font-bold text-white">
                All 12 agents operate on your single evidence repository
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Every analysis run, section edit, and conversation grounds back to your 20+ page crawl and ICP framework.
              </p>
            </div>
            <a
              href="/onboarding/company"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-500/25 hover:bg-purple-500 transition-all whitespace-nowrap"
            >
              <span>Deploy Specialist Agents</span>
              <ArrowRight className="size-3.5" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
