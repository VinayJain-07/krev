"use client";

import * as React from "react";
import { motion } from "motion/react";

export function LiquidGlassFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
      className="liquid-glass w-full rounded-3xl p-6 md:p-10 text-white/70 mt-32 md:mt-64"
    >
      {/* Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-10">
        {/* First column (Brand & Info) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 256 256"
              fill="currentColor"
            >
              <path d="M 4.688 136 C 68.373 136 120 187.627 120 251.312 C 120 252.883 119.967 254.445 119.905 256 L 0 256 L 0 136.096 C 1.555 136.034 3.117 136 4.688 136 Z M 251.312 136 C 252.883 136 254.445 136.034 256 136.096 L 256 256 L 136.095 256 C 136.032 254.438 136.001 252.875 136 251.312 C 136 187.627 187.627 136 251.312 136 Z M 119.905 0 C 119.967 1.555 120 3.117 120 4.688 C 120 68.373 68.373 120 4.687 120 C 3.117 120 1.555 119.967 0 119.905 L 0 0 Z M 256 119.905 C 254.445 119.967 252.883 120 251.312 120 C 187.627 120 136 68.373 136 4.687 C 136 3.117 136.033 1.555 136.095 0 L 256 0 Z" />
            </svg>
            <span className="text-xl font-medium tracking-wide">LUMINA</span>
          </div>
          <p className="text-sm leading-relaxed max-w-sm">
            Lumina provides premium clarity on global events and cosmic wonders - shared with all for free.
          </p>
        </div>

        {/* Links Section (3 Columns) */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Discover */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-white font-medium mb-4">
              Discover
            </h4>
            <ul className="text-xs space-y-2">
              <li>
                <a href="#labs" className="hover:text-white transition-colors">
                  Labs & Workshops
                </a>
              </li>
              <li>
                <a href="#deep-dive" className="hover:text-white transition-colors">
                  Deep Dive Series
                </a>
              </li>
              <li>
                <a href="#global-circle" className="hover:text-white transition-colors">
                  Global Circle
                </a>
              </li>
              <li>
                <a href="#resource-vault" className="hover:text-white transition-colors">
                  Resource Vault
                </a>
              </li>
              <li>
                <a href="#roadmap" className="hover:text-white transition-colors">
                  Future Roadmap
                </a>
              </li>
            </ul>
          </div>

          {/* The Mission */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-white font-medium mb-4">
              The Mission
            </h4>
            <ul className="text-xs space-y-2">
              <li>
                <a href="#origin" className="hover:text-white transition-colors">
                  Origin Story
                </a>
              </li>
              <li>
                <a href="#collective" className="hover:text-white transition-colors">
                  The Collective
                </a>
              </li>
              <li>
                <a href="#newsroom" className="hover:text-white transition-colors">
                  Newsroom Hub
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:text-white transition-colors">
                  Join the Team
                </a>
              </li>
            </ul>
          </div>

          {/* Concierge */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-white font-medium mb-4">
              Concierge
            </h4>
            <ul className="text-xs space-y-2">
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Get in Touch
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Legal Privacy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">
                  User Agreement
                </a>
              </li>
              <li>
                <a href="#report" className="hover:text-white transition-colors">
                  Report Concern
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 text-xs text-slate-400">
        <p className="text-[11px] uppercase tracking-wider opacity-70">
          &copy; {new Date().getFullYear()} KREV AI Inc. All rights reserved.
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
  );
}
