"use client";

import type { CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Download, Presentation } from "lucide-react";
import type { ArtifactTheme } from "@/lib/artifacts/types";

type PreviewSlide = {
  kind: "cover" | "summary" | "metrics" | "finding" | "priorities" | "roadmap" | "close";
  kicker: string;
  title: string;
  body?: string;
  items?: string[];
  metrics?: Array<{ value: string; label: string }>;
};

const THEME_COLORS: Record<ArtifactTheme, { accent: string; deep: string; soft: string }> = {
  "executive-strategy": { accent: "#7c3aed", deep: "#3b0764", soft: "#f3e8ff" },
  "search-intelligence": { accent: "#0284c7", deep: "#0c4a6e", soft: "#e0f2fe" },
  "technical-diagnostic": { accent: "#0369a1", deep: "#082f49", soft: "#e0f2fe" },
  "customer-intelligence": { accent: "#db2777", deep: "#831843", soft: "#fce7f3" },
  "competitive-intelligence": { accent: "#d97706", deep: "#78350f", soft: "#fef3c7" },
  "growth-strategy": { accent: "#4f46e5", deep: "#312e81", soft: "#e0e7ff" },
  "performance-analytics": { accent: "#059669", deep: "#064e3b", soft: "#d1fae5" },
};

function clean(value: string) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#|]/g, " ")
    .replace(/^[-+\d.)\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shorten(value: string, limit: number) {
  const normalized = clean(value);
  return normalized.length <= limit ? normalized : `${normalized.slice(0, limit - 1).replace(/[\s,.;:-]+$/, "")}…`;
}

function parseSections(markdown: string) {
  const sections: Array<{ title: string; lines: string[] }> = [];
  let current = { title: "Executive summary", lines: [] as string[] };
  for (const rawLine of markdown.replace(/\r/g, "").split("\n")) {
    const heading = rawLine.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      if (current.lines.some((line) => clean(line))) sections.push(current);
      current = { title: clean(heading[1]), lines: [] };
    } else if (clean(rawLine)) current.lines.push(rawLine);
  }
  if (current.lines.some((line) => clean(line))) sections.push(current);
  return sections;
}

function unique(values: string[]) {
  return values.filter((value, index) => value.length > 18 && values.indexOf(value) === index);
}

export function buildPresentationPreview(title: string, markdown: string, theme: ArtifactTheme): PreviewSlide[] {
  const sections = parseSections(markdown);
  const allLines = sections.flatMap((section) => section.lines.map(clean)).filter(Boolean);
  const summarySection = sections.find((section) => /executive|summary|overview/i.test(section.title)) ?? sections[0];
  const summaryItems = unique((summarySection?.lines ?? allLines).flatMap((line) => clean(line).split(/(?<=[.!?])\s+/))).slice(0, 4);
  const metrics = Array.from(markdown.matchAll(/(?<![A-Za-z])([$£€]?\d[\d,]*(?:\.\d+)?\s*%?)/g), (match) => match[1])
    .filter((value, index, values) => values.indexOf(value) === index)
    .slice(0, 3)
    .map((value) => ({ value, label: shorten(allLines.find((line) => line.includes(value)) ?? "Reported measure", 58) }));
  const actionLines = unique(sections
    .filter((section) => /recommend|action|priority|roadmap|next step|opportunit|plan/i.test(section.title))
    .flatMap((section) => section.lines.map(clean)))
    .slice(0, 9);
  const fallbackActions = unique(allLines.filter((line) => /\b(?:should|must|recommend|prioriti[sz]e|build|fix|launch|improve|create|validate|measure)\b/i.test(line))).slice(0, 9);
  const actions = actionLines.length ? actionLines : fallbackActions;
  const findings = sections
    .filter((section) => !/executive|summary|overview|recommend|action|priority|roadmap|appendix|source|methodolog/i.test(section.title))
    .filter((section) => section.lines.join(" ").length > 45)
    .slice(0, 7);
  const slides: PreviewSlide[] = [
    { kind: "cover", kicker: theme.replace(/-/g, " "), title },
    { kind: "summary", kicker: "Executive summary", title: "Leadership can act on a focused set of evidence-backed priorities", items: summaryItems.length ? summaryItems : unique(allLines).slice(0, 4) },
  ];
  if (metrics.length) slides.push({ kind: "metrics", kicker: "Current position", title: "The evidence establishes the scale and decision boundary", metrics });
  findings.forEach((section, index) => {
    const sentences = unique(section.lines.flatMap((line) => clean(line).split(/(?<=[.!?])\s+/)));
    slides.push({ kind: "finding", kicker: `Major finding ${index + 1}`, title: shorten(sentences[0] || section.title, 92), body: shorten(sentences.slice(1).join(" ") || section.lines.join(" "), 410), items: sentences.slice(1, 4) });
  });
  slides.push({ kind: "priorities", kicker: "Strategic priorities", title: "A small number of recommendations should lead the execution sequence", items: (actions.length ? actions : summaryItems).slice(0, 6) });
  slides.push({ kind: "roadmap", kicker: "Roadmap", title: "Move from blockers to system-building, then scale what proves out", items: (actions.length ? actions : summaryItems).slice(0, 9) });
  slides.push({ kind: "close", kicker: "Next decision", title: "Choose the first accountable owner and start with the highest-confidence priority." });
  return slides;
}

function SlideContent({ slide }: { slide: PreviewSlide }) {
  if (slide.kind === "cover") return <>
    <div className="deck-cover-copy"><span>{slide.kicker}</span><h2>{slide.title}</h2><p>EXECUTIVE DECISION PRESENTATION</p></div>
    <div className="deck-cover-visual" aria-hidden="true"><i /><i /><i /><b /></div>
  </>;
  if (slide.kind === "summary") return <><div className="deck-kicker">{slide.kicker}</div><h2>{slide.title}</h2><ol className="deck-summary-list">{slide.items?.map((item, index) => <li key={`${index}-${item}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{shorten(item, 190)}</p></li>)}</ol></>;
  if (slide.kind === "metrics") return <><div className="deck-kicker">{slide.kicker}</div><h2>{slide.title}</h2><div className="deck-metric-grid">{slide.metrics?.map((metric) => <article key={`${metric.value}-${metric.label}`}><strong>{metric.value}</strong><p>{metric.label}</p></article>)}</div></>;
  if (slide.kind === "finding") return <><div className="deck-kicker">{slide.kicker}</div><h2>{slide.title}</h2><div className="deck-finding-layout"><p>{slide.body}</p><aside><strong>WHAT LEADERSHIP SHOULD RETAIN</strong>{(slide.items?.length ? slide.items : [slide.body ?? "Validate this finding against the next available first-party data source."]).slice(0, 3).map((item) => <span key={item}>{shorten(item, 120)}</span>)}</aside></div></>;
  if (slide.kind === "priorities") return <><div className="deck-kicker">{slide.kicker}</div><h2>{slide.title}</h2><div className="deck-priority-list">{slide.items?.map((item, index) => <article key={`${index}-${item}`}><b>{String(index + 1).padStart(2, "0")}</b><p>{shorten(item, 150)}</p><em>{index < 2 ? "HIGH" : index < 4 ? "MEDIUM" : "VALIDATE"}</em></article>)}</div></>;
  if (slide.kind === "roadmap") {
    const items = slide.items ?? [];
    return <><div className="deck-kicker">{slide.kicker}</div><h2>{slide.title}</h2><div className="deck-roadmap">{["NOW", "NEXT", "LATER"].map((phase, phaseIndex) => <article key={phase}><strong>{phase}</strong><small>{["Resolve blockers", "Build the system", "Scale what works"][phaseIndex]}</small>{items.slice(phaseIndex * 3, phaseIndex * 3 + 3).map((item) => <p key={item}>{shorten(item, 92)}</p>)}</article>)}</div></>;
  }
  return <><div className="deck-close-copy"><span>{slide.kicker}</span><h2>{slide.title}</h2><p>PDF for evidence · PPTX for decisions · XLSX for execution</p></div></>;
}

export function PresentationPreview({ title, markdown, theme, slideIndex, onSlideChange, downloadHref }: { title: string; markdown: string; theme: ArtifactTheme; slideIndex: number; onSlideChange: (index: number) => void; downloadHref: string }) {
  const slides = buildPresentationPreview(title, markdown, theme);
  const safeIndex = Math.min(slideIndex, slides.length - 1);
  const colors = THEME_COLORS[theme];
  const style = { "--deck-accent": colors.accent, "--deck-deep": colors.deep, "--deck-soft": colors.soft } as CSSProperties;
  return <section className="deck-preview" style={style}>
    <header className="deck-preview-toolbar"><div><Presentation size={15} /><span><strong>Executive deck preview</strong><small>One message per slide · derived from the report evidence</small></span></div><a href={downloadHref}><Download size={13} /> Download editable PPTX</a></header>
    <div className="deck-canvas"><article className={`deck-slide deck-slide-${slides[safeIndex].kind}`}><SlideContent slide={slides[safeIndex]} /><footer><span>KREV AI / KREV AI</span><span>{safeIndex + 1}</span></footer></article></div>
    <nav className="deck-navigation" aria-label="Presentation slides"><button type="button" disabled={safeIndex === 0} onClick={() => onSlideChange(safeIndex - 1)}><ChevronLeft size={14} /> Previous</button><div>{slides.map((slide, index) => <button type="button" className={index === safeIndex ? "active" : ""} aria-label={`Open slide ${index + 1}: ${slide.kicker}`} onClick={() => onSlideChange(index)} key={`${slide.kind}-${index}`} />)}</div><span>Slide {safeIndex + 1} of {slides.length}</span><button type="button" disabled={safeIndex === slides.length - 1} onClick={() => onSlideChange(safeIndex + 1)}>Next <ChevronRight size={14} /></button></nav>
  </section>;
}
