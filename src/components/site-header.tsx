"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { KrevLogo } from "./krev-logo";

export function SiteHeader({ activeNav, accountReady = false }: { activeNav?: string; accountReady?: boolean }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path: string, key?: string) => {
    if (activeNav && key) return activeNav === key;
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#0a0a0f]/85 px-6 backdrop-blur-xl md:px-12">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="group flex items-center gap-3">
          <KrevLogo inverse compact className="transition-transform group-hover:scale-[1.03]" />
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden items-center gap-8 text-sm font-normal tracking-wide md:flex">
        <Link
          href="/#features"
          className={`transition-colors hover:text-white ${
            isActive("/#features", "features") ? "text-white font-semibold" : "text-slate-300"
          }`}
        >
          Features
        </Link>
        <Link
          href="/#insights"
          className={`transition-colors hover:text-white ${
            isActive("/#insights", "insights") ? "text-white font-semibold" : "text-slate-300"
          }`}
        >
          Insights
        </Link>
        <Link
          href="/#comparison"
          className={`transition-colors hover:text-white ${
            isActive("/#comparison", "comparison") ? "text-white font-semibold" : "text-slate-300"
          }`}
        >
          Compare
        </Link>
        <Link
          href="/pricing"
          className={`relative transition-colors hover:text-white ${
            isActive("/pricing", "pricing")
              ? "text-white font-semibold after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-purple-500"
              : "text-slate-300"
          }`}
        >
          Pricing
        </Link>
        <Link
          href="/docs"
          className={`relative transition-colors hover:text-white ${
            isActive("/docs", "docs")
              ? "text-white font-semibold after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-purple-500"
              : "text-slate-300"
          }`}
        >
          Docs
        </Link>
        <Link
          href="/blog"
          className={`relative transition-colors hover:text-white ${
            isActive("/blog", "blog")
              ? "text-white font-semibold after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-purple-500"
              : "text-slate-300"
          }`}
        >
          Blog
        </Link>
      </nav>

      {/* Header Action Buttons */}
      <div className="flex items-center gap-3">
        {accountReady ? (
          <span className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold text-purple-200">Account ready</span>
        ) : (
          <>
        <Link
          href="/login"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-95"
        >
          Sign In
        </Link>
        <Link
          href="/onboarding"
          className="hidden rounded-xl bg-purple-600 px-4.5 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/30 transition-all hover:bg-purple-500 active:scale-95 sm:inline-flex"
        >
          Get Started
        </Link>
          </>
        )}
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white md:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 border-b border-white/10 bg-[#0c0c14]/95 px-6 py-6 backdrop-blur-2xl md:hidden">
          <nav className="flex flex-col gap-4 text-sm font-medium">
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white"
            >
              Features
            </Link>
            <Link
              href="/#insights"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white"
            >
              Insights
            </Link>
            <Link
              href="/#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white"
            >
              Compare
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className={isActive("/pricing", "pricing") ? "font-semibold text-purple-400" : "text-slate-300 hover:text-white"}
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className={isActive("/docs", "docs") ? "font-semibold text-purple-400" : "text-slate-300 hover:text-white"}
            >
              Docs
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className={isActive("/blog", "blog") ? "font-semibold text-purple-400" : "text-slate-300 hover:text-white"}
            >
              Blog
            </Link>
            {!accountReady && <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
              <Link
                href="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-full items-center justify-center rounded-xl bg-purple-600 text-xs font-semibold text-white shadow-md shadow-purple-600/30 hover:bg-purple-500"
              >
                Get Started
              </Link>
            </div>}
          </nav>
        </div>
      )}
    </header>
  );
}
