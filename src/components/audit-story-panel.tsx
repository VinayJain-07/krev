"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";

const STORY_SPEED = 21;

const storyBlocks = [
  {
    lead: "Start with what already exists.",
    text: "You built a business, put its thinking on the web, and earned the proof behind it. Yet every new marketing brief can feel like starting from zero. Smark Connect begins by listening to what your company has already made public, so the work starts from your reality instead of a blank prompt.",
  },
  {
    lead: "Read before we recommend.",
    text: "The scan follows public pages and their links, reads the words behind your offers, and checks how the site responds on mobile and desktop. It looks for the signals a customer, a search engine, or an AI answer engine would use to understand you. Those observations become a shared foundation for everything that follows.",
  },
  {
    lead: "Take the time a useful answer needs.",
    text: "The wait comes from gathering pages, checking response timing, and drafting connected analyses one by one. Later reports can draw on the findings that came before them. Sources and your connected AI provider can also take time to respond. We would rather show the work than give you an instant, generic answer that sounds right and changes nothing.",
  },
  {
    lead: "Bring many perspectives into one place.",
    text: "Smark Connect gathers the research into a shared evidence base. Specialist workflows examine your company, competitors, audience, search visibility, AI visibility, and strategy. The AI CMO can then connect those perspectives instead of treating each report as an isolated prompt.",
  },
  {
    lead: "Turn evidence into a next move.",
    text: "When the scan is complete, your workspace brings together the evidence, reports, and specialist agents that can help turn findings into channel-specific work. Explore what to fix, what to say, who to reach, and what to test next. Inspect the reasoning, edit the work, and decide what matters most.",
  },
] as const;

type AuditStoryPanelProps = {
  company: string;
  progress: number;
  isLive: boolean;
  scanActive: boolean;
  onRequestClose: () => void;
};

export function AuditStoryPanel({ company, progress, isLive, scanActive, onRequestClose }: AuditStoryPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [playing, setPlaying] = useState(
    () => typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    titleRef.current?.focus();
    return () => dialog.close();
  }, []);

  useEffect(() => {
    const viewport = scrollRef.current;
    if (!viewport || !playing || finished) return;

    let lastTime = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const delta = Math.min(80, now - lastTime);
      lastTime = now;
      viewport.scrollTop += (delta / 1000) * STORY_SPEED;
      const atEnd = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2;
      if (atEnd) {
        setFinished(true);
        setPlaying(false);
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [playing, finished]);

  function handleScroll() {
    const viewport = scrollRef.current;
    if (!viewport) return;
    const atEnd = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2;
    if (atEnd) {
      setFinished(true);
      setPlaying(false);
    } else if (finished) {
      setFinished(false);
    }
  }

  function togglePlayback() {
    if (finished) return;
    setPlaying((current) => !current);
  }

  const playbackLabel = playing ? "Pause story" : "Play story";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="audit-story-title"
      aria-describedby="audit-story-description"
      onCancel={(event) => { event.preventDefault(); onRequestClose(); }}
      className="fixed inset-0 m-auto h-fit max-h-[calc(100dvh-24px)] w-[min(700px,calc(100vw-24px))] overflow-hidden rounded-[26px] border border-white/20 bg-[#1b1528]/72 p-0 text-left text-white shadow-[0_32px_100px_rgba(0,0,0,0.7)] backdrop-blur-3xl backdrop:bg-[#05030a]/38 backdrop:backdrop-blur-sm"
    >
      <div className="relative flex max-h-[calc(100dvh-24px)] flex-col">
        <div className="shrink-0 px-6 pb-2 pt-6 sm:px-10 sm:pt-8">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-300">The story behind your scan</p>
          <p className="mt-2 text-xs text-slate-400">For <span className="font-medium text-slate-200">{company}</span> · Read while we scan</p>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          tabIndex={0}
          aria-label="Smark Connect story"
          className="min-h-0 max-h-[min(560px,calc(100dvh-174px))] overflow-y-auto overscroll-contain px-6 [scrollbar-width:none] sm:px-10 [&::-webkit-scrollbar]:hidden"
        >
          <div className="mx-auto max-w-[61ch] pb-24 pt-8 sm:pt-12">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.17em] text-purple-300">A clearer way to begin</p>
            <h2 ref={titleRef} id="audit-story-title" tabIndex={-1} className="mt-4 max-w-xl text-[clamp(29px,4vw,43px)] font-semibold leading-[1.1] tracking-[-0.045em] text-white outline-none">
              Your website is already telling a story. We help you hear it.
            </h2>
            <p id="audit-story-description" className="mt-5 max-w-[59ch] text-[15px] leading-[1.75] text-slate-200 sm:text-base">
              This first scan takes a little time because it is building a foundation you can keep using. Let the story play while the research continues.
            </p>

            <div className="mt-12 space-y-12 sm:mt-16 sm:space-y-16">
              {storyBlocks.map((block) => (
                <section key={block.lead} className="max-w-[59ch]">
                  <p className="m-0 text-sm font-semibold leading-relaxed text-purple-200">{block.lead}</p>
                  <p className="mt-3 m-0 text-[15px] leading-[1.78] text-slate-200 sm:text-base">{block.text}</p>
                </section>
              ))}
            </div>

            <p className="mt-14 max-w-[59ch] text-[15px] font-medium leading-[1.78] text-purple-100 sm:mt-20 sm:text-base">
              Your judgment stays in charge. The first difficult pass becomes a foundation you can use, share, and build on.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-[#1b1528]/70 px-6 py-4 sm:px-10 sm:py-5">
          <p className="m-0 text-xs text-slate-400">
            {finished ? "The story is complete" : isLive ? scanActive ? "Your research keeps running while you read" : "Your scan is waiting for attention" : "Previewing the research journey"}
            <span className="ml-2 font-mono text-purple-200">{Math.min(100, Math.max(0, progress))}%</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlayback}
              disabled={finished}
              aria-label={finished ? "Story complete" : playbackLabel}
              title={finished ? "Story complete" : playbackLabel}
              className="grid size-8 place-items-center rounded-full border border-white/10 text-slate-200 transition-colors hover:bg-white/10 disabled:cursor-default disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300"
            >
              {playing ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
            </button>
            {finished && (
              <button type="button" onClick={onRequestClose} className="inline-flex h-8 items-center gap-2 rounded-full bg-purple-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-purple-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300">
                Back to scan <ArrowRight size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
