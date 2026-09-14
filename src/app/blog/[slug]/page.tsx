import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BlogInteractiveLab } from "@/components/blog-interactive-lab";
import { getAllBlogs, getBlogBySlug, getRelatedBlogs, type BlogPost } from "@/lib/blogs";

const headingId = (heading: string) =>
  heading.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

export function generateStaticParams() {
  return getAllBlogs().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) return { title: "Article Not Found | Smark Connect" };

  return {
    title: `${post.title} | Smark Connect Blog`,
    description: post.summary,
    openGraph: { title: post.title, description: post.summary, type: "article" },
  };
}

function FrameworkVisual({ post }: { post: BlogPost }) {
  return (
    <figure className="mt-10 overflow-hidden rounded-[28px] border border-violet-400/20 bg-[#10101b] shadow-[0_28px_90px_-50px_rgba(124,58,237,0.5)]">
      <div className="border-b border-white/10 bg-gradient-to-r from-violet-950/70 via-indigo-950/40 to-transparent px-6 py-6 sm:px-8">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-300">
          <span className="size-1.5 rounded-full bg-violet-400" />
          Framework visual
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{post.visual.title}</h2>
        <figcaption className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{post.visual.caption}</figcaption>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-4">
        {post.visual.steps.map((step, index) => (
          <div key={step.label} className="relative min-h-40 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-5 flex items-center justify-between">
              <span className="flex size-8 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/15 text-xs font-bold text-violet-200">
                {String(index + 1).padStart(2, "0")}
              </span>
              {index < post.visual.steps.length - 1 && <ArrowRight aria-hidden="true" className="size-4 text-violet-400/70" />}
            </div>
            <h3 className="text-sm font-semibold text-white">{step.label}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">{step.detail}</p>
          </div>
        ))}
      </div>
      <div className="mx-5 mb-5 flex gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.07] px-4 py-3 sm:mx-7 sm:mb-7">
        <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-300" />
        <p className="text-xs leading-5 text-emerald-100/90"><strong className="text-emerald-200">Decision gate:</strong> {post.visual.decision}</p>
      </div>
    </figure>
  );
}

function ArticleContent({ content }: { content: string }) {
  return (
    <div className="blog-article-content max-w-none text-[15px] leading-[1.85] text-slate-300 sm:text-base [&_p]:mb-6 [&_p]:leading-[1.85] [&_h2]:mb-5 [&_h2]:mt-14 [&_h2]:scroll-mt-28 [&_h2]:border-b [&_h2]:border-white/10 [&_h2]:pb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-white [&_h3]:mb-3 [&_h3]:mt-9 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-violet-200 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_strong]:font-semibold [&_strong]:text-slate-100 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-violet-200 [&_pre]:mb-8 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-white/10 [&_pre]:bg-[#0c0c14] [&_pre]:p-5 [&_pre_code]:bg-transparent [&_pre_code]:p-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => <h2 id={headingId(String(children))}>{children}</h2>,
          h3: ({ children }) => <h3 id={headingId(String(children))}>{children}</h3>,
          table: ({ children }) => (
            <div className="mb-9 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.025]">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border-b border-white/15 bg-violet-500/10 px-4 py-3 text-xs font-semibold text-violet-100">{children}</th>,
          td: ({ children }) => <td className="border-b border-white/[0.06] px-4 py-3 align-top text-xs leading-5 text-slate-300 sm:text-sm">{children}</td>,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-300 underline decoration-violet-400/40 underline-offset-4 hover:text-white">{children}</a>,
          blockquote: ({ children }) => <blockquote className="my-8 border-l-2 border-violet-400 bg-violet-500/[0.06] px-5 py-4 italic text-slate-200">{children}</blockquote>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) notFound();

  const related = getRelatedBlogs(post.slug, 3);
  const toc = [...post.content.matchAll(/^## (.+)$/gm)].map((match) => ({ label: match[1], id: headingId(match[1]) }));

  return (
    <div className="min-h-screen bg-[#07070a] font-sans text-slate-100 selection:bg-violet-600/30 selection:text-white">
      <SiteHeader activeNav="blog" />
      <main className="relative overflow-hidden pb-24 pt-28">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[440px] w-[900px] -translate-x-1/2 rounded-full bg-violet-700/10 blur-[110px]" />
        <article className="relative mx-auto max-w-6xl px-6 sm:px-8">
          <nav className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 text-xs text-slate-400" aria-label="Breadcrumb">
            <Link href="/blog" className="inline-flex items-center gap-2 hover:text-white"><ArrowLeft className="size-4" /> Back to the blog</Link>
            <span className="inline-flex items-center gap-2"><span className="text-violet-300">{post.category}</span><span aria-hidden="true">·</span><Clock className="size-3.5" />{post.readTime}</span>
          </nav>

          <header className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-200">
              <BookOpen className="size-3.5" /> Practical field guide
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">{post.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{post.summary}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Smark Connect Editorial Team</span>
              <span aria-hidden="true">·</span><time>{post.date}</time>
              <span aria-hidden="true">·</span><span>{post.readTime}</span>
            </div>
          </header>

          <div className="mt-10 rounded-2xl border border-violet-400/20 bg-gradient-to-r from-violet-500/10 to-transparent px-5 py-5 sm:px-7">
            <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-violet-300">What you will take away</span>
            <p className="mt-2 text-base font-medium text-white">{post.takeaway}</p>
            <a href="#interactive-lab" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-violet-200 underline decoration-violet-400/50 underline-offset-4 hover:text-white">
              Try the interactive lab <ArrowRight aria-hidden="true" className="size-3.5" />
            </a>
          </div>

          <FrameworkVisual post={post} />

          <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-14">
            <div className="min-w-0">
              <ArticleContent content={post.content} />

              <BlogInteractiveLab postId={post.id} />

              <section id="worked-example" className="mt-14 scroll-mt-28 overflow-hidden rounded-[28px] border border-sky-400/20 bg-[#0d1420]">
                <div className="border-b border-white/10 bg-gradient-to-r from-sky-500/10 to-transparent px-6 py-6 sm:px-8">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-300">Illustrative example</span>
                  <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">{post.workedExample.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{post.workedExample.situation}</p>
                </div>
                <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300">How the team responds</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{post.workedExample.approach}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300">What this illustrates</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{post.workedExample.lesson}</p>
                  </div>
                </div>
              </section>

              <section id="put-it-to-work" className="mt-16 scroll-mt-28 overflow-hidden rounded-[28px] border border-violet-400/25 bg-gradient-to-br from-violet-950/50 via-[#11101d] to-[#0b0b11] p-6 sm:p-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-300">Put it to work</span>
                <h2 className="mt-2 text-2xl font-bold text-white">A practical exercise</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">{post.practice.prompt}</p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {([
                    ["Make", post.practice.output],
                    ["Measure", post.practice.measure],
                    ["Watch for", post.practice.caution],
                  ] as const).map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300">{label}</h3>
                      <p className="mt-2 text-xs leading-6 text-slate-300">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {post.references && post.references.length > 0 && (
                <section id="further-reading" className="mt-12 scroll-mt-28 border-t border-white/10 pt-9">
                  <h2 className="text-xl font-bold text-white">Further reading</h2>
                  <p className="mt-2 text-sm text-slate-400">Primary documentation for the technical guidance in this article.</p>
                  <ul className="mt-5 space-y-2">
                    {post.references.map((reference) => (
                      <li key={reference.url}>
                        <a href={reference.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-violet-300 hover:text-white">
                          {reference.label}<ExternalLink className="size-3.5" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <aside className="hidden lg:block" aria-label="Article navigation">
              <div className="sticky top-28 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">In this guide</h2>
                <ol className="mt-5 space-y-3 border-l border-white/10 pl-4">
                  {toc.map((item) => <li key={item.id}><a href={`#${item.id}`} className="text-xs leading-5 text-slate-400 transition-colors hover:text-violet-200">{item.label}</a></li>)}
                  <li><a href="#interactive-lab" className="text-xs text-slate-400 hover:text-violet-200">Interactive lab</a></li>
                  <li><a href="#worked-example" className="text-xs text-slate-400 hover:text-violet-200">Illustrative example</a></li>
                  <li><a href="#put-it-to-work" className="text-xs text-slate-400 hover:text-violet-200">Put it to work</a></li>
                  {post.references && <li><a href="#further-reading" className="text-xs text-slate-400 hover:text-violet-200">Further reading</a></li>}
                </ol>
              </div>
            </aside>
          </div>

          <section className="mt-20 border-t border-white/10 pt-10">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white">Keep exploring</h2>
              <Link href="/blog" className="text-xs font-semibold text-violet-300 hover:text-white">All guides <ArrowRight className="inline size-3.5" /></Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((item) => (
                <Link key={item.slug} href={`/blog/${item.slug}`} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition-colors hover:border-violet-400/40 hover:bg-violet-500/[0.06]">
                  <span className="text-[11px] font-semibold text-violet-300">{item.category}</span>
                  <h3 className="mt-3 text-sm font-bold leading-6 text-white group-hover:text-violet-200">{item.title}</h3>
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-400">{item.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
