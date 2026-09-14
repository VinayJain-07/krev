import { normalizeDocumentMarkdown } from "./content";
import { documentContentIssue } from "./content-quality";
import { prepareFrameworks, readFramework, type Framework } from "./frameworks";
import type { CompleteFramework, FlowConfig, MatrixConfig } from "@/visuals/engine/types/schema";

type SourceDocument = { id: string; title: string; contentMarkdown: string };

function priorityFindings(markdown: string): Framework | undefined {
  const start = markdown.search(/^##\s+Priority findings\s*$/im);
  if (start < 0) return;
  const section = markdown.slice(start).split(/\n##\s+/)[0];
  const headings = [...section.matchAll(/^###\s+(.+)$/gm)];
  const cards = headings.map((heading, index) => {
    const body = section.slice(heading.index! + heading[0].length, headings[index + 1]?.index ?? section.length);
    const lines = [...body.matchAll(/^\*\*([^*]+):\*\*\s*(.+)$/gm)].map((match) => `${match[1]}: ${match[2]}`);
    return { title: heading[1].trim(), lines };
  }).filter((card) => card.lines.length);
  return cards.length >= 2 ? { kind: "priority", cards } : undefined;
}

function toStudioFramework(document: SourceDocument, framework: Framework, index: number): CompleteFramework {
  const staged = ["funnel", "journey", "roadmap"].includes(framework.kind);
  const meta = {
    id: `report-${document.id}-${index}`,
    name: `${document.title}: ${framework.kind.toUpperCase()}`,
    category: staged ? "Customer & Marketing" as const : "Strategy & Positioning" as const,
    primitive: staged ? "flow" as const : "matrix" as const,
    description: "Derived from this saved report. Changes in the studio stay in this browser session.",
    strategicQuestion: "What does the report evidence suggest, and what should we test next?",
    tags: [document.title, framework.kind, "Report"],
  };

  if (staged) {
    const config: FlowConfig = {
      primitive: "flow",
      phases: framework.cards.map((card, cardIndex) => ({ id: `phase-${cardIndex}`, name: card.title })),
      lanes: [{ id: "report-evidence", label: "Report evidence", field: "customerAction" }],
      steps: framework.cards.map((card, cardIndex) => ({
        id: `step-${cardIndex}`,
        title: card.title,
        phaseId: `phase-${cardIndex}`,
        customerAction: card.lines.join(" "),
      })),
      options: { flowType: framework.kind === "journey" ? "journey" : "process", showSentimentCurve: false },
    };
    return { meta, config };
  }

  const cols = 2;
  const config: MatrixConfig = {
    primitive: "matrix",
    gridType: framework.cards.length === 4 ? "2x2" : "custom-grid",
    rows: Math.ceil(framework.cards.length / cols),
    cols,
    quadrants: framework.cards.map((card, cardIndex) => ({ id: `cell-${cardIndex}`, title: card.title, row: Math.floor(cardIndex / cols), col: cardIndex % cols })),
    items: framework.cards.flatMap((card, cardIndex) => card.lines.map((line, lineIndex) => {
      const separator = line.indexOf(": ");
      return {
        id: `item-${cardIndex}-${lineIndex}`,
        quadrantId: `cell-${cardIndex}`,
        label: separator > 0 && separator < 35 ? line.slice(0, separator) : line,
        description: separator > 0 && separator < 35 ? line.slice(separator + 2) : undefined,
      };
    })),
    options: { cellLayout: "cards" },
  };
  return { meta, config };
}

export function reportStudioFrameworks(documents: SourceDocument[]): CompleteFramework[] {
  return documents.flatMap((document) => {
    const markdown = normalizeDocumentMarkdown(document.contentMarkdown);
    if (documentContentIssue(markdown)) return [];
    const prepared = prepareFrameworks(markdown);
    const candidates = [...prepared.matchAll(/```framework\s*\n([\s\S]*?)\n```/g)].slice(0, 12);
    const recognized = candidates.flatMap((match, index) => {
      const framework = readFramework(match[1]);
      return framework ? [toStudioFramework(document, framework, index)] : [];
    });
    const findings = priorityFindings(markdown);
    return findings ? [toStudioFramework(document, findings, recognized.length), ...recognized] : recognized;
  });
}
