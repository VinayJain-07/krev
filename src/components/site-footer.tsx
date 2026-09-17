"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

export function SiteFooter() {
  return (
    <div className="relative w-full overflow-hidden bg-[#07070c] pt-10 pb-14 px-4 sm:px-6 lg:px-8">
      {/* Ambient background glow to illuminate the liquid glass frost without video */}
      <div 
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[850px] h-[340px] bg-gradient-to-t from-purple-900/15 via-indigo-950/10 to-transparent blur-3xl" 
      />

      <motion.footer
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="liquid-glass relative z-10 mx-auto max-w-7xl rounded-3xl p-6 sm:p-10 md:p-12 text-white/70"
      >
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-12">
          {/* Brand & Overview Column */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <Link href="/" className="group flex items-center gap-3 text-white">
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-md shadow-purple-500/40 transition-transform group-hover:scale-105">
                <span className="size-2 rounded-full bg-white" />
              </div>
              <span className="text-xl font-semibold tracking-wide">SMARK CONNECT</span>
            </Link>
            <p className="text-xs sm:text-sm font-normal leading-relaxed text-slate-300/85 max-w-sm tracking-[0.012em]">
              Autonomous AI marketing intelligence. Transforming your digital footprint into 6 verified evidence reports, AI CMO strategic direction, and 12 execution agents.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-wider text-emerald-300">
                SYSTEM TELEMETRY ONLINE • v2.4.0
              </span>
            </div>
          </div>

          {/* Links Section (3 Columns) */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Column 1: Platform & Engines */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.16em] text-white font-medium mb-4">
                Platform
              </h4>
              <ul className="text-xs space-y-2.5">
                <li>
                  <Link href="/#features" className="hover:text-white transition-colors">
                    Intelligence Suite
                  </Link>
                </li>
                <li>
                  <Link href="/#insights" className="hover:text-white transition-colors">
                    AI CMO Synthesis
                  </Link>
                </li>
                <li>
                  <Link href="/docs#reports" className="hover:text-white transition-colors">
                    6 Core Reports
                  </Link>
                </li>
                <li>
                  <Link href="/docs#agents" className="hover:text-white transition-colors">
                    12 Specialist Agents
                  </Link>
                </li>
                <li>
                  <Link href="/docs#mining" className="hover:text-white transition-colors">
                    Live Intent Mining
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Research & Articles */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white font-semibold mb-4">
                Research & Blog
              </h4>
              <ul className="text-xs space-y-2.5">
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors flex items-center gap-1 font-medium text-purple-300 hover:text-purple-200">
                    <span>All Articles (16)</span>
                    <ArrowUpRight className="size-3" />
                  </Link>
                </li>
                <li>
                  <Link href="/blog/the-shift-from-search-to-synthesis-benchmarking-geo-in-2026" className="hover:text-white transition-colors">
                    Generative Search Visibility
                  </Link>
                </li>
                <li>
                  <Link href="/blog/the-100-point-intent-lead-scoring-algorithm-a-technical-deep-dive" className="hover:text-white transition-colors">
                    Intent Scoring Guide
                  </Link>
                </li>
                <li>
                  <Link href="/blog/entity-clarity-scoring-structuring-json-ld-for-chatgpt-perplexity" className="hover:text-white transition-colors">
                    Entity Clarity & JSON-LD
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-white transition-colors">
                    Documentation Hub
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Workspace */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white font-semibold mb-4">
                Workspace
              </h4>
              <ul className="text-xs space-y-2.5">
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Pricing & Plans
                  </Link>
                </li>
                <li>
                  <Link href="/onboarding" className="hover:text-white transition-colors text-purple-300 hover:text-purple-200 font-medium">
                    Start Workspace
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/docs#workspace" className="hover:text-white transition-colors">
                    Security & BYO-Key
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-white transition-colors">
                    Privacy & Terms
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-white transition-colors opacity-70 hover:opacity-100">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 text-xs text-slate-400">
          <p className="text-[11px] uppercase tracking-wider opacity-70">
            &copy; {new Date().getFullYear()} Smark Connect Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-[10px] uppercase tracking-widest opacity-60">
              CONNECT:
            </span>
            <div className="flex items-center gap-2.5">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="group relative flex size-6 items-center justify-center rounded-full overflow-hidden border border-white/20 bg-black/50 transition-all hover:scale-115 hover:border-white/60 hover:shadow-md hover:shadow-white/10"
                aria-label="X (Twitter)"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/agent-logos/x.svg"
                  alt="X (Twitter)"
                  className="size-full object-cover transition-transform group-hover:scale-110"
                />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="group relative flex size-6 items-center justify-center rounded-full overflow-hidden border border-sky-500/30 bg-black/50 transition-all hover:scale-115 hover:border-sky-400 hover:shadow-md hover:shadow-sky-500/20"
                aria-label="LinkedIn"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/agent-logos/linkedin.svg"
                  alt="LinkedIn"
                  className="size-full object-cover transition-transform group-hover:scale-110"
                />
              </a>

              <a
                href="https://reddit.com"
                target="_blank"
                rel="noreferrer"
                className="group relative flex size-6 items-center justify-center rounded-full overflow-hidden border border-orange-500/30 bg-black/50 transition-all hover:scale-115 hover:border-orange-400 hover:shadow-md hover:shadow-orange-500/20"
                aria-label="Reddit"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/agent-logos/reddit.svg"
                  alt="Reddit"
                  className="size-full object-cover transition-transform group-hover:scale-110"
                />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="group relative flex size-6 items-center justify-center rounded-full overflow-hidden border border-pink-500/30 bg-black/50 transition-all hover:scale-115 hover:border-pink-400 hover:shadow-md hover:shadow-pink-500/20"
                aria-label="Instagram"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/agent-logos/instagram.svg"
                  alt="Instagram"
                  className="size-full object-cover transition-transform group-hover:scale-110"
                />
              </a>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default SiteFooter;
