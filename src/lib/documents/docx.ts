import "server-only";
import { AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel, ImageRun, PageNumber, Packer, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType } from "docx";
import { parseVisualMarkdown } from "./visual-content";
import { frameworkImages } from "./framework-images";

const PURPLE = "8B2CE0";
const DEEP_VIOLET = "7C34BC";
const INK = "1A1A1A";
const SLATE = "5B5B63";
const MUTED = "8E8E97";
const BLUSH = "FCE9F0";
const CREAM = "FFF4F0";

export async function createBrandedDocx(args: { companyName: string; title: string; markdown: string; updatedAt: Date; sourceCount: number }): Promise<Buffer> {
  const blocks = parseVisualMarkdown(args.markdown);
  const content = blocks.filter((block, index) => !(index === 0 && block.type === "h1"));
  let number = 0;
  const children: Array<Paragraph | Table> = [
    new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: CREAM },
      spacing: { before: 0, after: 80 },
      border: { bottom: { color: "E8447A", style: BorderStyle.SINGLE, size: 16 } },
      children: [new TextRun({ text: "KREV AI  /  AI CMO REPORT", bold: true, size: 18, color: PURPLE, font: "Arial", characterSpacing: 80 })],
    }),
    new Paragraph({ spacing: { before: 100, after: 80 }, keepNext: true, children: [new TextRun({ text: args.title, bold: true, size: 48, color: INK, font: "Arial" })] }),
    new Paragraph({ spacing: { after: 220 }, children: [new TextRun({ text: `${args.companyName}  |  Updated ${args.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}  |  ${args.sourceCount} sources`, size: 19, color: SLATE, font: "Arial" })] }),
  ];

  for (const block of content) {
    if (block.type === "framework") {
      for (const visual of await frameworkImages(block.framework)) {
        const scale = Math.min(700 / visual.width, 820 / visual.height);
        children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 160 }, children: [new ImageRun({ type: "png", data: visual.data, transformation: { width: Math.round(visual.width * scale), height: Math.round(visual.height * scale) }, altText: { title: `${block.framework.kind.toUpperCase()} framework`, description: block.framework.cards.map((card) => `${card.title}: ${card.lines.join("; ")}`).join("\n"), name: "Framework visualization" } })] }));
      }
    } else if (block.type === "table") {
      const columnCount = Math.max(1, ...block.rows.map((row) => row.length));
      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: block.rows.map((row, rowIndex) => new TableRow({
          tableHeader: rowIndex === 0,
          children: Array.from({ length: columnCount }, (_, cellIndex) => new TableCell({
            shading: { type: ShadingType.CLEAR, fill: rowIndex === 0 ? PURPLE : rowIndex % 2 ? "FBF4F8" : "FFFFFF" },
            margins: { top: 90, bottom: 90, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: row[cellIndex] ?? "", bold: rowIndex === 0, size: 16, color: rowIndex === 0 ? "FFFFFF" : SLATE, font: "Arial" })] })],
          })),
        })),
      }));
      children.push(new Paragraph({ spacing: { after: 100 } }));
    } else if (block.type === "h1" || block.type === "h2") {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, keepNext: true, spacing: { before: 260, after: 90 }, children: [new TextRun({ text: block.text, bold: true, size: 30, color: DEEP_VIOLET, font: "Arial" })] }));
    } else if (block.type === "h3") {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, spacing: { before: 180, after: 60 }, children: [new TextRun({ text: block.text, bold: true, size: 23, color: INK, font: "Arial" })] }));
    } else if (block.type === "bullet") {
      children.push(new Paragraph({ bullet: { level: 0 }, spacing: { after: 70, line: 276 }, indent: { left: 420, hanging: 220 }, children: [new TextRun({ text: block.text, size: 20, color: SLATE, font: "Arial" })] }));
    } else if (block.type === "number") {
      number += 1;
      children.push(new Paragraph({ spacing: { after: 80, line: 276 }, indent: { left: 420, hanging: 300 }, children: [new TextRun({ text: `${String(number).padStart(2, "0")}  `, bold: true, size: 20, color: PURPLE, font: "Arial" }), new TextRun({ text: block.text, size: 20, color: SLATE, font: "Arial" })] }));
    } else if (block.type === "quote") {
      children.push(new Paragraph({ shading: { type: ShadingType.CLEAR, fill: BLUSH }, border: { left: { color: PURPLE, style: BorderStyle.SINGLE, size: 20 } }, spacing: { before: 80, after: 120, line: 280 }, indent: { left: 240, right: 160 }, children: [new TextRun({ text: block.text, italics: true, size: 20, color: INK, font: "Arial" })] }));
    } else {
      children.push(new Paragraph({ spacing: { after: 110, line: 282 }, children: [new TextRun({ text: block.text, size: 20, color: SLATE, font: "Arial" })] }));
    }
  }

  const document = new Document({
    creator: "KREV AI",
    title: `${args.companyName} - ${args.title}`,
    description: "AI CMO analysis generated by KREV AI",
    styles: { default: { document: { run: { font: "Arial", size: 20, color: SLATE }, paragraph: { spacing: { after: 110, line: 282 } } } } },
    sections: [{
      properties: { page: { margin: { top: 760, right: 820, bottom: 760, left: 820 }, size: { width: 12240, height: 15840 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "KREV AI", bold: true, size: 16, color: PURPLE, font: "Arial" })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "KREV AI  /  ", size: 15, color: MUTED, font: "Arial" }), new TextRun({ children: [PageNumber.CURRENT], size: 15, color: MUTED, font: "Arial" })] })] }) },
      children,
    }],
  });
  return Buffer.from(await Packer.toBuffer(document));
}
