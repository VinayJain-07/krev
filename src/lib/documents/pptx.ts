import "server-only";
import PptxGenJS from "pptxgenjs";
import type { ArtifactManifest, ReportDataModel, ReportFinding } from "../artifacts/types";

const COLORS = {
  ink: "17151B",
  paper: "FFFDFC",
  purple: "7D2AC7",
  violet: "5B238A",
  pink: "E8447A",
  blush: "F8E5ED",
  lilac: "EDE0F6",
  blue: "DCEFF8",
  slate: "615D68",
  line: "E7D9E2",
  white: "FFFFFF",
  green: "16866D",
  amber: "D88918",
  red: "C8425B",
};

type PresentationArgs = {
  model: ReportDataModel;
  manifest: ArtifactManifest;
};

function shorten(value: string, limit: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length <= limit ? clean : `${clean.slice(0, limit - 1).replace(/[\s,.;:-]+$/, "")}…`;
}

function conclusionTitle(finding: ReportFinding) {
  const firstSentence = finding.narrative.split(/(?<=[.!?])\s+/, 1)[0];
  return shorten(firstSentence.length >= 28 ? firstSentence : `${finding.title}: ${firstSentence}`, 82);
}

function priorityColor(value: string) {
  if (value === "high") return COLORS.red;
  if (value === "medium") return COLORS.amber;
  if (value === "low") return COLORS.green;
  return COLORS.slate;
}

function addFooter(slide: PptxGenJS.Slide, model: ReportDataModel, page: number) {
  slide.addShape("line", { x: 0.65, y: 7.12, w: 12.02, h: 0, line: { color: COLORS.line, width: 0.75 } });
  slide.addText("KREV AI / AI CMO", { x: 0.68, y: 7.18, w: 4.2, h: 0.18, fontFace: "Arial", fontSize: 8, bold: true, color: COLORS.violet, margin: 0, charSpacing: 1.4 });
  slide.addText(`${model.reportPeriod.label}  ·  ${page}`, { x: 10.25, y: 7.18, w: 2.4, h: 0.18, fontFace: "Arial", fontSize: 8, color: COLORS.slate, align: "right", margin: 0 });
}

function addSlideTitle(slide: PptxGenJS.Slide, title: string, kicker: string, model: ReportDataModel, page: number) {
  slide.background = { color: COLORS.paper };
  slide.addText(kicker.toUpperCase(), { x: 0.7, y: 0.42, w: 5.6, h: 0.24, fontFace: "Arial", fontSize: 10, bold: true, color: COLORS.pink, margin: 0, charSpacing: 1.6 });
  slide.addText(shorten(title, 88), { x: 0.68, y: 0.78, w: 11.9, h: 0.78, fontFace: "Arial", fontSize: 35, bold: true, color: COLORS.ink, margin: 0, breakLine: false, fit: "shrink" });
  addFooter(slide, model, page);
}

function addNotes(slide: PptxGenJS.Slide, model: ReportDataModel) {
  const sources = model.sources.length ? model.sources.map((source) => `- ${source.id}: ${source.url}`).join("\n") : "- No external source URL was embedded in the report.";
  slide.addNotes(`[Sources]\n${sources}\n[/Sources]`);
}

function addMetric(slide: PptxGenJS.Slide, x: number, label: string, value: string, accent: string) {
  slide.addShape("line", { x, y: 2.52, w: 2.9, h: 0, line: { color: accent, width: 3 } });
  slide.addText(shorten(value, 18), { x, y: 2.72, w: 2.9, h: 0.6, fontFace: "Arial", fontSize: 28, bold: true, color: COLORS.ink, margin: 0, fit: "shrink" });
  slide.addText(shorten(label, 42), { x, y: 3.42, w: 2.9, h: 0.48, fontFace: "Arial", fontSize: 16, color: COLORS.slate, margin: 0, valign: "top", fit: "shrink" });
}

export async function createExecutivePptx({ model, manifest }: PresentationArgs): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "KREV AI";
  pptx.company = "KREV AI";
  pptx.subject = `${manifest.theme} executive decision presentation`;
  pptx.title = `${model.company.name} - ${model.title}`;
  pptx.theme = {
    headFontFace: "Arial",
    bodyFontFace: "Arial",
  };
  let page = 0;

  const cover = pptx.addSlide();
  page += 1;
  cover.background = { color: COLORS.violet };
  cover.addShape("rect", { x: 9.5, y: 0, w: 3.83, h: 7.5, line: { transparency: 100 }, fill: { color: COLORS.purple } });
  cover.addShape("arc", { x: 8.5, y: 0.55, w: 4.1, h: 4.1, rotate: 22, line: { color: COLORS.pink, width: 5, transparency: 5 }, fill: { color: COLORS.purple, transparency: 100 } });
  cover.addText("KREV AI / AI CMO", { x: 0.78, y: 0.72, w: 4.8, h: 0.3, fontFace: "Arial", fontSize: 11, bold: true, color: COLORS.blush, charSpacing: 2, margin: 0 });
  cover.addText(shorten(model.title, 70), { x: 0.75, y: 2.0, w: 8.2, h: 1.55, fontFace: "Arial", fontSize: 50, bold: true, color: COLORS.white, margin: 0, breakLine: false, fit: "shrink", valign: "middle" });
  cover.addText(`${model.company.name}\n${manifest.theme.replace(/-/g, " ").toUpperCase()} · ${model.reportPeriod.label}`, { x: 0.78, y: 4.05, w: 7.8, h: 0.88, fontFace: "Arial", fontSize: 18, color: COLORS.blush, breakLine: false, margin: 0 });
  cover.addText("PDF = KNOW   ·   PPTX = DECIDE   ·   XLSX = OPERATE", { x: 0.8, y: 6.72, w: 8.0, h: 0.25, fontFace: "Arial", fontSize: 10, bold: true, color: COLORS.blush, charSpacing: 1.2, margin: 0 });
  addNotes(cover, model);

  const summary = pptx.addSlide();
  page += 1;
  addSlideTitle(summary, "Leadership can act on a focused set of evidence-backed priorities", "Executive summary", model, page);
  const summaryItems = [...model.executiveSummary, ...model.findings.map((finding) => finding.narrative.split(/(?<=[.!?])\s+/, 1)[0]), ...model.recommendations.map((item) => item.detail)]
    .filter((item, index, values) => item.length > 20 && values.indexOf(item) === index)
    .slice(0, 4);
  summaryItems.forEach((item, index) => {
    const y = 1.9 + index * 1.12;
    summary.addText(String(index + 1).padStart(2, "0"), { x: 0.78, y, w: 0.55, h: 0.32, fontFace: "Arial", fontSize: 11, bold: true, color: COLORS.pink, margin: 0 });
    summary.addShape("line", { x: 1.42, y: y + 0.12, w: 0.72, h: 0, line: { color: COLORS.line, width: 1 } });
    summary.addText(shorten(item, 210), { x: 2.3, y: y - 0.12, w: 9.8, h: 0.78, fontFace: "Arial", fontSize: 20, color: COLORS.ink, margin: 0, fit: "shrink", breakLine: false });
  });
  addNotes(summary, model);

  const position = pptx.addSlide();
  page += 1;
  addSlideTitle(position, "The evidence base establishes the current position and decision scope", "Current position", model, page);
  const metricSet = model.metrics.length >= 3
    ? model.metrics.slice(0, 3).map((metric) => ({ label: shorten(metric.context, 45), value: metric.value }))
    : [
      { label: "Analytical findings", value: String(model.findings.length) },
      { label: "Prioritized recommendations", value: String(model.recommendations.length) },
      { label: "Traceable source URLs", value: String(model.sources.length) },
    ];
  metricSet.forEach((metric, index) => addMetric(position, 0.82 + index * 4.05, metric.label, metric.value, [COLORS.purple, COLORS.pink, COLORS.green][index]));
  position.addText("Decision boundary", { x: 0.82, y: 4.62, w: 2.2, h: 0.3, fontFace: "Arial", fontSize: 16, bold: true, color: COLORS.violet, margin: 0 });
  position.addText(shorten(model.assumptions[0] ?? "Recommendations stay inside the evidence available in the source report; unsupported metrics remain explicitly unclaimed.", 260), { x: 0.82, y: 5.05, w: 11.55, h: 0.82, fontFace: "Arial", fontSize: 18, color: COLORS.slate, margin: 0, fit: "shrink" });
  addNotes(position, model);

  const decisionFindings = model.findings.filter((finding) => !/\b(?:recommend|roadmap|next step|methodolog|sources?|appendix)\b/i.test(finding.title)).slice(0, 8);
  for (const [index, finding] of decisionFindings.entries()) {
    const slide = pptx.addSlide();
    page += 1;
    addSlideTitle(slide, conclusionTitle(finding), `Major finding ${index + 1}`, model, page);
    slide.addText(shorten(finding.narrative, 520), { x: 0.78, y: 1.92, w: 7.25, h: 3.65, fontFace: "Arial", fontSize: 21, color: COLORS.ink, margin: 0.04, breakLine: false, fit: "shrink", valign: "top", paraSpaceAfter: 10 });
    slide.addShape("line", { x: 8.55, y: 1.94, w: 3.65, h: 0, line: { color: COLORS.pink, width: 3 } });
    slide.addText("WHAT LEADERSHIP SHOULD RETAIN", { x: 8.55, y: 2.2, w: 3.65, h: 0.55, fontFace: "Arial", fontSize: 16, bold: true, color: COLORS.violet, margin: 0, fit: "shrink" });
    const linked = model.recommendations.filter((recommendation) => recommendation.findingIds.includes(finding.id)).slice(0, 3);
    const implications = linked.map((item) => `${item.id}  ${shorten(item.detail, 115)}`);
    slide.addText(implications.length ? implications.map((text) => ({ text, options: { bullet: { indent: 16 }, breakLine: true } })) : [{ text: "Validate the finding against the next available first-party data source.", options: { bullet: { indent: 16 } } }], { x: 8.48, y: 3.0, w: 3.8, h: 2.45, fontFace: "Arial", fontSize: 17, color: COLORS.slate, margin: 0.06, breakLine: false, fit: "shrink", paraSpaceAfter: 12 });
    slide.addText(`CONFIDENCE  ${finding.confidence.toUpperCase()}`, { x: 8.55, y: 5.82, w: 3.45, h: 0.28, fontFace: "Arial", fontSize: 10, bold: true, color: priorityColor(finding.confidence), margin: 0, charSpacing: 1.2 });
    addNotes(slide, model);
  }

  if (model.competitors.length) {
    const competitors = pptx.addSlide();
    page += 1;
    addSlideTitle(competitors, "Competitive whitespace becomes visible when every rival is judged on shared criteria", "Market and competition", model, page);
    const rows = [["Competitor", "Positioning", "Competes on"], ...model.competitors.slice(0, 6).map((item) => [item.companyName, shorten(item.positioning, 115), shorten(item.competitiveAttributes.join(", "), 70)])].map((row) => row.map((text) => ({ text })));
    competitors.addTable(rows, { x: 0.75, y: 1.85, w: 11.85, h: 4.65, border: { color: COLORS.line, pt: 0.75 }, fill: { color: COLORS.white }, color: COLORS.slate, fontFace: "Arial", fontSize: 14, margin: 0.08, rowH: 0.62, bold: false, breakLine: false, valign: "middle", colW: [2.2, 6.2, 3.45] });
    addNotes(competitors, model);
  }

  const priorities = pptx.addSlide();
  page += 1;
  addSlideTitle(priorities, "A small number of recommendations should lead the execution sequence", "Strategic priorities", model, page);
  const priorityItems = model.recommendations.slice(0, 6);
  priorityItems.forEach((item, index) => {
    const y = 1.86 + index * 0.76;
    priorities.addShape("line", { x: 0.82, y: y + 0.18, w: 0.5, h: 0, line: { color: priorityColor(item.priority), width: 4 } });
    priorities.addText(item.id, { x: 1.5, y, w: 1.2, h: 0.35, fontFace: "Arial", fontSize: 15, bold: true, color: COLORS.violet, margin: 0 });
    priorities.addText(shorten(item.detail, 185), { x: 2.75, y: y - 0.08, w: 8.95, h: 0.55, fontFace: "Arial", fontSize: 18, color: COLORS.ink, margin: 0, fit: "shrink" });
    priorities.addText(item.priority.toUpperCase(), { x: 11.78, y, w: 0.8, h: 0.25, fontFace: "Arial", fontSize: 9, bold: true, color: priorityColor(item.priority), align: "right", margin: 0 });
  });
  addNotes(priorities, model);

  const roadmap = pptx.addSlide();
  page += 1;
  addSlideTitle(roadmap, "The roadmap converts recommendation IDs into a sequenced operating rhythm", "Roadmap", model, page);
  const phases = [
    { label: "NOW", subtitle: "Resolve blockers", items: model.recommendations.slice(0, 3) },
    { label: "NEXT", subtitle: "Build the system", items: model.recommendations.slice(3, 6) },
    { label: "LATER", subtitle: "Scale what proves out", items: model.recommendations.slice(6, 9) },
  ];
  phases.forEach((phase, index) => {
    const x = 0.78 + index * 4.12;
    roadmap.addText(phase.label, { x, y: 1.92, w: 3.5, h: 0.4, fontFace: "Arial", fontSize: 17, bold: true, color: [COLORS.pink, COLORS.purple, COLORS.green][index], margin: 0, charSpacing: 1.4 });
    roadmap.addText(phase.subtitle, { x, y: 2.43, w: 3.5, h: 0.38, fontFace: "Arial", fontSize: 20, bold: true, color: COLORS.ink, margin: 0, fit: "shrink" });
    roadmap.addShape("line", { x, y: 2.98, w: 3.48, h: 0, line: { color: COLORS.line, width: 1.2 } });
    const items = phase.items.length ? phase.items : [{ id: "VALIDATE", detail: "Validate assumptions before expanding the plan." }];
    roadmap.addText(items.map((item) => ({ text: `${item.id}  ${shorten(item.detail, 88)}`, options: { bullet: { indent: 15 }, breakLine: true } })), { x: x - 0.04, y: 3.28, w: 3.62, h: 2.42, fontFace: "Arial", fontSize: 16, color: COLORS.slate, margin: 0.04, fit: "shrink", paraSpaceAfter: 13 });
  });
  addNotes(roadmap, model);

  const close = pptx.addSlide();
  page += 1;
  close.background = { color: COLORS.ink };
  close.addText("NEXT DECISION", { x: 0.78, y: 0.72, w: 3.0, h: 0.28, fontFace: "Arial", fontSize: 11, bold: true, color: COLORS.pink, margin: 0, charSpacing: 2 });
  close.addText("Choose the first accountable owner and start with the highest-confidence priority.", { x: 0.78, y: 1.88, w: 10.7, h: 1.8, fontFace: "Arial", fontSize: 44, bold: true, color: COLORS.white, margin: 0, fit: "shrink" });
  close.addText("Use the PDF for full evidence and reasoning. Use the XLSX action tracker to assign ownership, dates, status, and validation results.", { x: 0.82, y: 4.62, w: 9.4, h: 0.9, fontFace: "Arial", fontSize: 20, color: COLORS.blush, margin: 0, fit: "shrink" });
  close.addText(`${model.company.name}  ·  ${model.title}`, { x: 0.82, y: 6.78, w: 7.8, h: 0.24, fontFace: "Arial", fontSize: 9, color: COLORS.blush, margin: 0, charSpacing: 1 });
  addNotes(close, model);

  const output = await pptx.write({ outputType: "nodebuffer", compression: true });
  const buffer = Buffer.isBuffer(output) ? output : Buffer.from(output as ArrayBuffer);
  if (buffer.subarray(0, 2).toString() !== "PK" || page < 5) throw new Error("PPTX QA failed: the generated deck is incomplete or invalid.");
  return buffer;
}
