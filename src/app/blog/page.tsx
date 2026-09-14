"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Search, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getAllBlogs, getAllCategories } from "@/lib/blogs";

export default function BlogIndexPage() {
  const posts = React.useMemo(() => getAllBlogs(), []);
  const categories = React.useMemo(() => ["All topics", ...getAllCategories()], []);
  const [category, setCategory] = React.useState("All topics");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    return posts.filter((post) => {
      const categoryMatches = category === "All topics" || post.category === category;
      const textMatches = !term || [post.title, post.summary, post.takeaway, post.category, ...post.tags]
        .some((value) => value.toLowerCase().includes(term));
      return categoryMatches && textMatches;
    });
  }, [posts, category, query]);

  const featured = posts[0];

  return (
    <div className="min-h-screen bg-[#07070a] font-sans text-slate-100 selection:bg-violet-600/30 selection:text-white">
      <SiteHeader activeNav="blog" />
      <main>
        <section className="relative overflow-hidden border-b border-white/10 px-6 pb-14 pt-32 sm:px-8">
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-180px] h-[540px] w-[900px] -translate-x-1/2 rounded-full bg-violet-700/15 blur-[120px]" />
          <div className="relative mx-auto max-w-6xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-200">
              <BookOpen className="size-3.5" /> Smark Connect Blog
            </div>
            <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
              <div>
                <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Better marketing decisions start with <span className="bg-gradient-to-r from-violet-300 to-indigo-200 bg-clip-text text-transparent">clear evidence.</span>
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  In-depth guides to generative search, content, research, and marketing operations. Explore the methods, then try a hands-on lab inside every article.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <span className="text-3xl font-bold text-white">{posts.length}</span>
                <span className="ml-2 text-sm text-slate-400">field guides</span>
                <div className="mt-4 h-px bg-white/10" />
                <p className="mt-4 text-xs leading-6 text-slate-400">Focused on repeatable processes and transparent evidence, with illustrative diagrams clearly labeled.</p>
              </div>
            </div>

            <div className="mt-11 flex flex-col gap-4 lg:flex-row lg:items-center">
              <label className="relative block min-w-0 flex-1">
                <span className="sr-only">Search articles</span>
                <Search aria-hidden="true" className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search guides, topics, and frameworks"
                  className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.045] pl-11 pr-10 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/15"
                />
                {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"><X className="size-4" /></button>}
              </label>
              <span className="text-xs text-slate-500">Find a question. Follow the method. Test the result.</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter by topic">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${category === item ? "bg-violet-500 text-white" : "border border-white/10 bg-white/[0.025] text-slate-400 hover:border-violet-400/30 hover:text-white"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        {!query && category === "All topics" && featured && (
          <section className="border-b border-white/10 px-6 py-14 sm:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
                <span className="size-1.5 rounded-full bg-violet-400" /> Start here
              </div>
              <Link href={`/blog/${featured.slug}`} className="group grid overflow-hidden rounded-[28px] border border-violet-400/25 bg-gradient-to-br from-violet-950/40 via-[#10101b] to-[#0b0b11] transition-colors hover:border-violet-300/45 lg:grid-cols-2">
                <div className="flex flex-col justify-center p-7 sm:p-10">
                  <div className="flex items-center gap-3 text-xs text-violet-300"><span>{featured.category}</span><span aria-hidden="true">·</span><Clock className="size-3.5" />{featured.readTime}</div>
                  <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white group-hover:text-violet-100 sm:text-4xl">{featured.title}</h2>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300">{featured.summary}</p>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-violet-300">Read the guide <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                </div>
                <div className="border-t border-white/10 bg-[#0c0c16] p-7 sm:p-9 lg:border-l lg:border-t-0">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Framework preview</span>
                  <h3 className="mt-2 text-lg font-semibold text-white">{featured.visual.title}</h3>
                  <div className="mt-6 space-y-3">
                    {featured.visual.steps.map((step, index) => (
                      <div key={step.label} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[11px] font-bold text-violet-200">{index + 1}</span>
                        <div><strong className="block text-xs text-white">{step.label}</strong><span className="mt-1 block text-xs leading-5 text-slate-400">{step.detail}</span></div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-[11px] leading-5 text-slate-500">{featured.visual.caption}</p>
                </div>
              </Link>
            </div>
          </section>
        )}

        <section className="px-6 py-16 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-5">
              <div>
                <h2 className="text-2xl font-bold text-white">{category === "All topics" ? "Explore all guides" : category}</h2>
                <p className="mt-1 text-sm text-slate-400">{filtered.length} {filtered.length === 1 ? "guide" : "guides"} available</p>
              </div>
              <span className="text-xs text-slate-500">Methods, diagrams, examples, and interactive labs</span>
            </div>
            {filtered.length ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex min-h-[325px] flex-col rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition-colors hover:border-violet-400/40 hover:bg-violet-500/[0.055]">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]"><span className="font-semibold text-violet-300">{post.category}</span><span className="inline-flex items-center gap-1 text-slate-500"><Clock className="size-3" />{post.readTime}</span></div>
                    <h3 className="mt-5 text-lg font-bold leading-7 text-white group-hover:text-violet-200">{post.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">{post.summary}</p>
                    <div className="mt-auto border-t border-white/10 pt-5">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">What you will learn</span>
                      <p className="mt-2 text-xs leading-5 text-slate-300">{post.takeaway}</p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300">Read guide <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" /></span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-12 text-center">
                <Search className="mx-auto size-7 text-slate-500" />
                <h3 className="mt-4 text-base font-semibold text-white">No matching guides</h3>
                <p className="mt-2 text-sm text-slate-400">Try another topic or a broader search term.</p>
                <button type="button" onClick={() => { setQuery(""); setCategory("All topics"); }} className="mt-5 text-sm font-semibold text-violet-300 hover:text-white">Clear filters</button>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
