import "server-only";

import { extname } from "node:path";

export const MAX_SOURCE_FILE_BYTES = 15 * 1024 * 1024;
export const MAX_SOURCE_FILES_PER_UPLOAD = 10;
export const MAX_SOURCE_CONTENT_CHARS = 400_000;

const OFFICE_EXTENSIONS = new Set([
  ".pdf",
  ".docx",
  ".pptx",
  ".xlsx",
  ".odt",
  ".odp",
  ".ods",
  ".rtf",
  ".epub",
]);

const TEXT_EXTENSIONS = new Set([
  ".md",
  ".markdown",
  ".txt",
  ".csv",
  ".tsv",
  ".json",
  ".jsonl",
  ".html",
  ".htm",
  ".xml",
  ".yaml",
  ".yml",
  ".log",
  ".sql",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".java",
  ".css",
]);

export const SOURCE_FILE_ACCEPT = Array.from(new Set([...OFFICE_EXTENSIONS, ...TEXT_EXTENSIONS])).join(",");

export type StoredAnalysisSource = {
  id?: string;
  title: string;
  sourceType: string;
  content: string;
  createdAt?: Date | string;
};

function normalizeExtractedText(value: string): string {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, MAX_SOURCE_CONTENT_CHARS);
}

function extensionFor(name: string): string {
  return extname(name).toLowerCase();
}

export function isSupportedSourceFilename(name: string): boolean {
  const extension = extensionFor(name);
  return OFFICE_EXTENSIONS.has(extension) || TEXT_EXTENSIONS.has(extension);
}

export function sourceTypeForFilename(name: string): string {
  return extensionFor(name).replace(/^\./, "") || "text";
}

export async function extractSourceContent(file: File): Promise<string> {
  if (!isSupportedSourceFilename(file.name)) {
    throw new Error(`${file.name} is not a supported document type.`);
  }
  if (file.size === 0) throw new Error(`${file.name} is empty.`);
  if (file.size > MAX_SOURCE_FILE_BYTES) throw new Error(`${file.name} exceeds the 15 MB limit.`);

  const extension = extensionFor(file.name);
  if (TEXT_EXTENSIONS.has(extension)) {
    const text = normalizeExtractedText(await file.text());
    if (!text) throw new Error(`No readable text was found in ${file.name}.`);
    return text;
  }

  if (extension === ".xlsx") {
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    const bytes = Buffer.from(await file.arrayBuffer());
    await workbook.xlsx.load(bytes as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    const sheets = workbook.worksheets.map((worksheet) => {
      const rows: string[] = [];
      worksheet.eachRow({ includeEmpty: false }, (row) => {
        const cells: string[] = [];
        row.eachCell({ includeEmpty: false }, (cell) => {
          const value = cell.text || (cell.value == null ? "" : String(cell.value));
          cells.push(value.replace(/\s+/g, " ").trim());
        });
        if (cells.some(Boolean)) rows.push(cells.join(" | "));
      });
      return `# Sheet: ${worksheet.name}\n\n${rows.join("\n")}`;
    });
    const text = normalizeExtractedText(sheets.join("\n\n"));
    if (!text) throw new Error(`No readable text was found in ${file.name}.`);
    return text;
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 30_000);
  try {
    const officeModule = await import("officeparser");
    const fileType = extension.slice(1) as "pdf" | "docx" | "pptx" | "xlsx" | "odt" | "odp" | "ods" | "rtf" | "epub";
    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedRaw = "";

    // 1. Try OfficeParser.parseOffice or parseOffice AST parser
    if (typeof officeModule.parseOffice === "function") {
      const ast = await officeModule.parseOffice(buffer, {
        abortSignal: abortController.signal,
        extractAttachments: false,
      });
      extractedRaw = typeof ast?.toText === "function" ? ast.toText() : String(ast ?? "");
    } else if (officeModule.OfficeParser && typeof officeModule.OfficeParser.parseOffice === "function") {
      const ast = await officeModule.OfficeParser.parseOffice(buffer, {
        abortSignal: abortController.signal,
        extractAttachments: false,
      });
      extractedRaw = typeof ast?.toText === "function" ? ast.toText() : String(ast ?? "");
    } else if (officeModule.OfficeConverter && typeof officeModule.OfficeConverter.convert === "function") {
      // 2. Try OfficeConverter.convert
      const result = await officeModule.OfficeConverter.convert(buffer, "md", {
        parseConfig: {
          fileType,
          abortSignal: abortController.signal,
          ignoreComments: true,
          extractAttachments: false,
        },
        generatorConfig: {
          includeImages: false,
        },
      });
      extractedRaw = String(result?.value ?? "");
    }

    const text = normalizeExtractedText(extractedRaw);
    if (!text) throw new Error(`No readable text was found in ${file.name}. Scanned documents need selectable text.`);
    return text;
  } catch (error) {
    if (abortController.signal.aborted) throw new Error(`${file.name} took too long to read.`);
    throw new Error(`Could not read ${file.name}: ${error instanceof Error ? error.message : "unknown parser error"}`);
  } finally {
    clearTimeout(timeout);
  }
}

export function buildUploadedSourceEvidence(sources: StoredAnalysisSource[], maxChars = 60_000): string {
  if (!sources.length || maxChars <= 0) return "";
  const blocks: string[] = [];
  let remaining = maxChars;

  for (const source of sources) {
    const heading = `UPLOADED SOURCE DOCUMENT\nFILE: ${source.title}\nTYPE: ${source.sourceType.toUpperCase()}\n`;
    if (remaining <= heading.length + 80) break;
    const content = normalizeExtractedText(source.content).slice(0, remaining - heading.length);
    if (!content) continue;
    const block = `${heading}CONTENT:\n${content}`;
    blocks.push(block);
    remaining -= block.length + 9;
  }

  return blocks.join("\n\n---\n\n");
}
