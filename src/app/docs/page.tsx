"use client";

import * as React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  BookOpen,
  ArrowRight,
  Shield,
  Zap,
  Layers,
  Search,
  Compass,
  FileText,
  BarChart3,
  Bot,
  CheckCircle2,
  Cpu,
  Key,
  Database,
  Share2,
  Terminal,
  Activity,
  HelpCircle,
  Hash,
} from "lucide-react";

const DOCS_SECTIONS = [
  { id: "getting-started", title: "Getting Started", icon: BookOpen },
  { id: "setting-up", title: "Setting Up Your Workspace", icon: Database },
  { id: "understanding-reports", title: "Understanding Your Reports", icon: Layers },
  { id: "working-with-ai-cmo", title: "Working with the AI CMO", icon: Bot },
  { id: "specialist-agents", title: "Specialist Agents", icon: Cpu },
  { id: "exporting-sharing", title: "Exporting & Sharing", icon: Share2 },
  { id: "live-mining", title: "Live Conversation Mining", icon: Search },
  { id: "analytics-lighthouse", title: "Analytics & Lighthouse", icon: Activity },
  { id: "token-management", title: "Token Management", icon: Terminal },
  { id: "faqs", title: "FAQs & Troubleshooting", icon: HelpCircle },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = React.useState("getting-started");

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (const section of DOCS_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      const headerOffset = 90;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0f] font-sans text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* Sticky Main Menu Header */}
      <SiteHeader activeNav="docs" />

      {/* Hero Header */}
      <section className="relative px-6 pt-32 pb-12 text-center md:pt-36">
        <div className="mx-auto max-w-4xl">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
            DOCUMENTATION & GUIDES
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Learn how to use
            <br />
            <span className="font-serif italic font-normal text-purple-300">Smark Connect.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400">
            From first setup to advanced multi-agent workflows — everything you need to get the most out of your AI CMO.
          </p>
        </div>
      </section>

      {/* Two-Column Docs Layout */}
      <div className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
          {/* Sticky Left Navigation Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-xl">
              <div className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-purple-400">
                Documentation Index
              </div>
              <nav className="space-y-1">
                {DOCS_SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  const isCurrent = activeSection === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={(e) => scrollToSection(e, sec.id)}
                      className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                        isCurrent
                          ? "bg-purple-600/15 text-white font-semibold border-l-2 border-purple-500"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`}
                    >
                      <Icon
                        className={`size-4 shrink-0 transition-colors ${
                          isCurrent ? "text-purple-400" : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      />
                      <span className="truncate">{sec.title}</span>
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="space-y-12 min-w-0">
            {/* Section 1: Getting Started */}
            <section
              id="getting-started"
              className="scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-purple-400">
                <BookOpen className="size-4" />
                <span>Section 01</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Getting Started</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Smark Connect is an AI-powered marketing intelligence platform that turns your company&apos;s website into a full marketing command center. Unlike disconnected tools or shallow ChatGPT prompts, Smark Connect crawls your public digital footprint to extract verified evidence before generating strategy.
              </p>

              <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white">Prerequisites:</h3>
                <ul className="mt-3 space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-purple-400 shrink-0" />
                    <span>A publicly reachable company website or product landing page.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-purple-400 shrink-0" />
                    <span>An API key from OpenAI, Anthropic (Claude), Google Gemini, or OpenRouter.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-purple-400 shrink-0" />
                    <span>A modern web browser (Chrome, Firefox, Safari, Edge).</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-semibold text-white">Quick Start Steps:</h3>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <span className="inline-flex size-6 items-center justify-center rounded-lg bg-purple-500/20 text-xs font-bold text-purple-400">
                      1
                    </span>
                    <h4 className="mt-2 text-xs font-bold text-white">Create Your Account</h4>
                    <p className="mt-1 text-[11px] text-slate-400">Sign up and enter your name and credentials.</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <span className="inline-flex size-6 items-center justify-center rounded-lg bg-purple-500/20 text-xs font-bold text-purple-400">
                      2
                    </span>
                    <h4 className="mt-2 text-xs font-bold text-white">Connect AI Provider</h4>
                    <p className="mt-1 text-[11px] text-slate-400">Paste your chosen provider API key (AES-256 encrypted).</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <span className="inline-flex size-6 items-center justify-center rounded-lg bg-purple-500/20 text-xs font-bold text-purple-400">
                      3
                    </span>
                    <h4 className="mt-2 text-xs font-bold text-white">Enter Target URL</h4>
                    <p className="mt-1 text-[11px] text-slate-400">Input your company root domain to initialize the 20-page crawl.</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <span className="inline-flex size-6 items-center justify-center rounded-lg bg-purple-500/20 text-xs font-bold text-purple-400">
                      4
                    </span>
                    <h4 className="mt-2 text-xs font-bold text-white">Synthesize Intelligence</h4>
                    <p className="mt-1 text-[11px] text-slate-400">Wait 2–3 minutes as all six core intelligence documents build concurrently.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Setting Up Your Workspace */}
            <section
              id="setting-up"
              className="scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-purple-400">
                <Database className="size-4" />
                <span>Section 02</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Setting Up Your Workspace</h2>
              
              <h3 className="mt-6 text-sm font-semibold text-white">Connecting an AI Provider:</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                During onboarding, you will connect your preferred AI inference provider. Each provider brings distinct advantages:
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Key className="size-3.5 text-purple-400" />
                    <span>OpenAI (GPT-4o, o1)</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Highest reliability, rapid parallel JSON schema completion, and broad ecosystem compatibility.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Key className="size-3.5 text-purple-400" />
                    <span>Anthropic Claude (3.5 Sonnet)</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Superb structured reasoning, nuanced long-form strategic documentation, and superior editorial voice.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Key className="size-3.5 text-purple-400" />
                    <span>Google Gemini (1.5 Pro, 2.0)</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Massive 1M+ token context window, multimodal understanding, and outstanding cost-efficiency.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Key className="size-3.5 text-purple-400" />
                    <span>OpenRouter</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Single unified API key accessing over 100+ open and proprietary models with automatic failover.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-xs text-slate-300">
                <span className="font-semibold text-purple-300">Zero Trust Security:</span> Your API keys are encrypted with AES-256 at rest in the database and never transmitted to client browsers. You can update or switch keys at any time.
              </div>

              <h3 className="mt-8 text-sm font-semibold text-white">Adding Company Workspaces:</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                You can host unlimited company workspaces. For every company, Smark Connect executes an automated 20-page crawl that extracts:
              </p>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-purple-400" />
                  <span>Crawl topology, sitemap hierarchy, and internal hyperlink connectivity</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-purple-400" />
                  <span>Meta descriptions, OpenGraph tags, canonical URLs, and schema markup graphs</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-purple-400" />
                  <span>Server response timing (TTFB), status codes, and HTTP network baselines</span>
                </li>
              </ul>
            </section>

            {/* Section 3: Understanding Your Reports */}
            <section
              id="understanding-reports"
              className="scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-purple-400">
                <Layers className="size-4" />
                <span>Section 03</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Understanding Your Reports</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Every company workspace synthesizes six interconnected foundational documents. Each document addresses a crucial dimension of market positioning:
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="size-2 rounded-full bg-purple-400" />
                    1. Company Intelligence (Offer Stack & Proof Ladder)
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    Identifies your primary value proposition, core pillars, proof assets, pricing tiers, and brand voice guidelines. Serves as the authoritative source of truth for all subsequent agent actions.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="size-2 rounded-full bg-purple-400" />
                    2. Technical SEO & Architecture Audit
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    Evaluates crawlability, Core Web Vitals, index status, metadata health, internal linking depth, and URL taxonomy with prioritized fixes.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="size-2 rounded-full bg-purple-400" />
                    3. GEO & AI Visibility (Generative Engine Optimization)
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    Measures how visible your company is inside generative engines like ChatGPT Search, Perplexity AI, and Google AI Overviews. Evaluates entity clarity, citations, and machine readability.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="size-2 rounded-full bg-purple-400" />
                    4. Competitor Landscape & Whitespace Matrix
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    Discovers direct and adjacent market rivals, maps positioning whitespace, analyzes competitor claims, and identifies high-leverage differentiation vectors.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="size-2 rounded-full bg-purple-400" />
                    5. Audience ICP Profiling & Objection Mapping
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    Breaks down buyer personas into primary triggers, purchase friction points, decision criteria, and voice-of-customer language extracted from target communities.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="size-2 rounded-full bg-purple-400" />
                    6. Content Audit & Strategic Editorial Roadmap
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    Surveys existing website content, detects semantic content gaps, and produces an actionable calendar of high-intent topics linked directly to customer acquisition.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Working with the AI CMO */}
            <section
              id="working-with-ai-cmo"
              className="scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-purple-400">
                <Bot className="size-4" />
                <span>Section 04</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Working with the AI CMO</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Your AI CMO sits above the six core documents, acting as your high-level strategic advisor. It synthesizes findings across disparate domains to provide prioritized, actionable guidance.
              </p>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white">Recommended Questions for Your AI CMO:</h3>
                <div className="mt-3 space-y-2 text-xs text-slate-300">
                  <div className="rounded-lg bg-black/40 p-2.5 font-mono text-purple-300 border border-white/5">
                    &quot;Based on our competitor whitespace and SEO gaps, what are our top 3 moves for Q3?&quot;
                  </div>
                  <div className="rounded-lg bg-black/40 p-2.5 font-mono text-purple-300 border border-white/5">
                    &quot;Draft a 90-day outbound campaign addressing the top 3 objections from our audience audit.&quot;
                  </div>
                  <div className="rounded-lg bg-black/40 p-2.5 font-mono text-purple-300 border border-white/5">
                    &quot;How can we optimize our homepage schema to get cited by ChatGPT and Perplexity?&quot;
                  </div>
                </div>
              </div>

              <h3 className="mt-8 text-sm font-semibold text-white">Focused Edits vs. Full Regeneration:</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                When you want to adjust a specific report section (e.g., refining the brand voice or adding an ICP), use <strong>Focused Edit Mode</strong>. This targets only the selected section using minimal tokens (5k–15k) and preserves full version history. Full regenerations re-crawl the site and rebuild the entire evidence base.
              </p>
            </section>

            {/* Section 5: Specialist Agents */}
            <section
              id="specialist-agents"
              className="scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-purple-400">
                <Cpu className="size-4" />
                <span>Section 05</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Specialist Agents</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Beyond the AI CMO, you have twelve specialist agents ready for deployment. Each agent executes against your verified company evidence without needing repetitive briefings:
              </p>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="pb-3 font-semibold">Specialist Agent</th>
                      <th className="pb-3 font-semibold">Primary Output & Execution Scope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    <tr>
                      <td className="py-3 font-medium text-white">SEO Agent</td>
                      <td className="py-3 text-slate-400">Technical fixes, structured data schemas, on-page optimization specs.</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-white">GEO Agent</td>
                      <td className="py-3 text-slate-400">Citation optimization, entity clarity, AI Overviews source positioning.</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-white">Content Agent</td>
                      <td className="py-3 text-slate-400">Topic ideation, outline architecture, editorial calendars, long-form drafts.</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-white">X (Twitter) Agent</td>
                      <td className="py-3 text-slate-400">Contrarian threads, narrative hooks, daily industry commentary in brand voice.</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-white">LinkedIn Agent</td>
                      <td className="py-3 text-slate-400">Founder stories, thought leadership frameworks, PDF carousel decks.</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-white">Reddit Agent</td>
                      <td className="py-3 text-slate-400">Subreddit listening, buyer intent identification, value-first response drafts.</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-white">Instagram Agent</td>
                      <td className="py-3 text-slate-400">Visual carousel outlines, Reel scripting, Stories engagement sequences.</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-white">Email Agent</td>
                      <td className="py-3 text-slate-400">Newsletter campaigns, onboarding drip sequences, high-converting subject lines.</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-white">YouTube Agent</td>
                      <td className="py-3 text-slate-400">Video hooks, narrative outlines, search-optimized descriptions and thumbnails.</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-white">Creative Agent</td>
                      <td className="py-3 text-slate-400">Visual direction, design briefs, copy-design synergy for campaigns.</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-white">Competitor Agent</td>
                      <td className="py-3 text-slate-400">Market shift tracking, feature-by-feature battlecards, counter-messaging.</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-white">Outbound Agent</td>
                      <td className="py-3 text-slate-400">Target account research, personalized outreach hooks, multi-touch cold email.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 6: Exporting & Sharing */}
            <section
              id="exporting-sharing"
              className="scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-purple-400">
                <Share2 className="size-4" />
                <span>Section 06</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Exporting & Sharing</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Every analysis report and presentation can be exported in three publication-ready formats:
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                  <h4 className="text-sm font-bold text-white">PDF Reports</h4>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Board-ready narrative reports with custom cover pages, executive summaries, and at least 30% visualized sections via WeasyPrint.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                  <h4 className="text-sm font-bold text-white">PPTX Presentations</h4>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Fully editable PowerPoint decks with conclusion-led slides, stat cards, and speaker notes powered by PptxGenJS.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                  <h4 className="text-sm font-bold text-white">XLSX Workbooks</h4>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Operational spreadsheets containing scoring matrices, audit checklists, auto-calculated formulas, and assignment trackers.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7: Live Conversation Mining */}
            <section
              id="live-mining"
              className="scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-purple-400">
                <Search className="size-4" />
                <span>Section 07</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Live Conversation Mining</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Our social intent engine continuously listens to public discussions on Reddit, X, and LinkedIn to surface high-intent potential customers in real time.
              </p>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white">The 100-Point Intent Scoring Model:</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5 text-center">
                  <div className="rounded-lg bg-white/5 p-3">
                    <span className="text-lg font-bold text-purple-400">25</span>
                    <p className="mt-1 text-[10px] text-slate-400">ICP & Firmographic Fit</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <span className="text-lg font-bold text-purple-400">25</span>
                    <p className="mt-1 text-[10px] text-slate-400">Buying Intent Signal</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <span className="text-lg font-bold text-purple-400">15</span>
                    <p className="mt-1 text-[10px] text-slate-400">Event Trigger & Recency</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <span className="text-lg font-bold text-purple-400">10</span>
                    <p className="mt-1 text-[10px] text-slate-400">Evidence Strength</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <span className="text-lg font-bold text-purple-400">5</span>
                    <p className="mt-1 text-[10px] text-slate-400">Contact Data Quality</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8: Analytics & Lighthouse */}
            <section
              id="analytics-lighthouse"
              className="scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-purple-400">
                <Activity className="size-4" />
                <span>Section 08</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Analytics & Lighthouse Auditing</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Smark Connect hosts its own local Chromium Lighthouse auditor. We don&apos;t rely on third-party rate-limited APIs to gauge your site&apos;s Core Web Vitals.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Performance</span>
                  <div className="mt-2 text-xl font-bold text-emerald-400">FCP / LCP</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Accessibility</span>
                  <div className="mt-2 text-xl font-bold text-purple-400">ARIA / Contrast</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Best Practices</span>
                  <div className="mt-2 text-xl font-bold text-indigo-400">HTTPS / Security</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SEO Health</span>
                  <div className="mt-2 text-xl font-bold text-purple-400">Crawl / Meta</div>
                </div>
              </div>
            </section>

            {/* Section 9: Token Management */}
            <section
              id="token-management"
              className="scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-purple-400">
                <Terminal className="size-4" />
                <span>Section 09</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Token Management & Budgets</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Every workspace includes a 2,000,000 token monthly budget. Here is how your tokens are typically utilized:
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs">
                  <span className="font-medium text-white">Full Company Scan (6 Core Reports)</span>
                  <span className="font-mono text-purple-400 font-semibold">180k – 300k tokens</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs">
                  <span className="font-medium text-white">Targeted Section Focused Edit</span>
                  <span className="font-mono text-purple-400 font-semibold">5k – 15k tokens</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs">
                  <span className="font-medium text-white">AI CMO Interactive Conversation Turn</span>
                  <span className="font-mono text-purple-400 font-semibold">2k – 8k tokens</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs">
                  <span className="font-medium text-white">Specialist Agent Content Generation Task</span>
                  <span className="font-mono text-purple-400 font-semibold">10k – 30k tokens</span>
                </div>
              </div>
            </section>

            {/* Section 10: FAQs & Troubleshooting */}
            <section
              id="faqs"
              className="scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-purple-400">
                <HelpCircle className="size-4" />
                <span>Section 10</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">FAQs & Troubleshooting</h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                  <h4 className="text-sm font-bold text-white">Why is my analysis taking longer than 3 minutes?</h4>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    Very large websites with extensive sitemaps require additional seconds to capture network latency baselines. The first foundation report normally appears within 2–3 minutes, and the remaining 5 reports complete asynchronously.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                  <h4 className="text-sm font-bold text-white">Can I white-label reports for agency clients?</h4>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    Yes. All PDF, PPTX, and XLSX downloads can be branded with your custom agency logo, colors, and client disclaimers from the workspace settings pane.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                  <h4 className="text-sm font-bold text-white">Is my company data shared with LLM providers?</h4>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    No. When you bring your own enterprise API key (OpenAI, Anthropic, Google), your prompts and extracted website text are subject to standard zero-data-retention enterprise API terms and are never used to train public models.
                  </p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Final Call to Action */}
      <section className="border-t border-white/10 bg-[#07070a] py-24 px-6 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
            START BUILDING YOUR STRATEGY
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
