import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { Launcher } from "chrome-launcher";
import type { ArtifactManifest, ReportDataModel } from "../artifacts/types";
import { normalizeDocumentMarkdown } from "./content";
import { prepareFrameworks } from "./frameworks";
import { assertDocumentContentQuality } from "./content-quality";

export type VisualReportCompetitor = { companyName: string; officialWebsite: string; logoUrl?: string; logoDataUrl?: string; positioning: string; competitiveAttributes: string[] };
export type VisualReportModule = { type: string; title: string; markdown: string; competitors?: VisualReportCompetitor[] };
export type VisualReportSkill = { repository: string; skill: string; phase?: string; reason?: string };
export type VisualReportArgs = { companyName: string; companyWebsite?: string; companyCategory?: string | null; companyBrief?: string; title: string; documentType?: string; markdown: string; updatedAt: Date; sourceCount: number; skills?: VisualReportSkill[]; modules?: VisualReportModule[]; reportModel?: ReportDataModel; manifest?: ArtifactManifest };
export type VisualReportResult = { pdf: Buffer; html: Buffer; qa: { passes: number; final: { pageCount: number; issues: string[]; visualizationCount?: number; visualSectionShare?: number; reportProfile?: string } } };

const reportCache = new Map<string, VisualReportResult>();

function pythonExecutable() {
  if (process.env.SMARK_REPORT_PYTHON) return process.env.SMARK_REPORT_PYTHON;
  if (process.env.NODE_ENV === "production") return "python3";
  const projectPython = process.platform === "win32"
    ? path.join(process.cwd(), ".venv-report", "Scripts", "python.exe")
    : path.join(process.cwd(), ".venv-report", "bin", "python");
  return existsSync(projectPython) ? projectPython : process.platform === "win32" ? "python" : "python3";
}

const REPORT_RENDER_TIMEOUT_MS = 120_000;

function runRenderer(executable: string, script: string, payload: Record<string, unknown>, timeoutMs = REPORT_RENDER_TIMEOUT_MS) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const child = spawn(executable, [script], { cwd: process.cwd(), stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => { stdout += chunk; });
    child.stderr.on("data", (chunk: string) => { stderr += chunk; });
    child.on("error", (error) => { clearTimeout(timer); reject(error); });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) return reject(new Error("Visual report rendering exceeded the 120-second limit."));
      if (code !== 0) return reject(new Error(`Visual report renderer failed${stderr.trim() ? `: ${stderr.trim().slice(-1600)}` : ` with exit code ${code}`}`));
      try { resolve(JSON.parse(stdout.trim().split(/\r?\n/).filter(Boolean).at(-1) ?? "") as Record<string, unknown>); }
      catch { reject(new Error(`Visual report renderer returned an invalid receipt: ${stdout.slice(-800)}`)); }
    });
    child.stdin.end(JSON.stringify(payload));
  });
}

function printWithChromium(htmlPath: string, pdfPath: string) {
  const chrome = Launcher.getInstallations()[0];
  if (!chrome) throw new Error("Chromium fallback is unavailable. Install Chrome or provide the native WeasyPrint runtime.");
  return new Promise<void>((resolve, reject) => {
    const child = spawn(chrome, ["--headless=new", "--disable-gpu", "--no-sandbox", "--no-pdf-header-footer", `--print-to-pdf=${pdfPath}`, pathToFileURL(htmlPath).href], { cwd: process.cwd(), stdio: ["ignore", "ignore", "pipe"], windowsHide: true });
    let stderr = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`Chromium PDF fallback failed${stderr.trim() ? `: ${stderr.trim().slice(-1200)}` : ` with exit code ${code}`}`)));
  });
}

export async function createVisualReport(args: VisualReportArgs): Promise<VisualReportResult> {
  assertDocumentContentQuality(args.markdown);
  for (const reportModule of args.modules ?? []) assertDocumentContentQuality(reportModule.markdown);
  const cacheKey = createHash("sha256").update(JSON.stringify({ ...args, updatedAt: args.updatedAt.toISOString() })).digest("hex");
  const cached = reportCache.get(cacheKey);
  if (cached) return cached;
  const directory = await mkdtemp(path.join(tmpdir(), "smark-visual-report-"));
  const outputPdf = path.join(directory, "report.pdf");
  const outputHtml = path.join(directory, "report.html");
  try {
    const executable = pythonExecutable();
    const script = path.join(process.cwd(), "scripts", "render-visual-report.py");
    const payload = { ...args, skills: [], markdown: prepareFrameworks(normalizeDocumentMarkdown(args.markdown)), modules: args.modules?.map((module) => ({ ...module, markdown: prepareFrameworks(normalizeDocumentMarkdown(module.markdown)) })), updatedAt: args.updatedAt.toISOString(), outputPdf, outputHtml };
    const receipt = await runRenderer(executable, script, payload);
    let qa = receipt.qa as VisualReportResult["qa"] | undefined;
    if (!qa) {
      await printWithChromium(outputHtml, outputPdf);
      const inspectReceipt = await runRenderer(executable, script, { inspectPdf: outputPdf });
      const final = inspectReceipt.qa as { pageCount: number; issues: string[] };
      qa = { passes: 1, final };
    }
    if (qa.final.pageCount < 1) throw new Error("Visual report QA did not produce any pages.");
    if (qa.final.issues.length) throw new Error(`Visual report QA failed: ${qa.final.issues.join("; ")}`);
    const result = { pdf: await readFile(outputPdf), html: await readFile(outputHtml), qa };
    if (reportCache.size >= 8) reportCache.delete(reportCache.keys().next().value ?? "");
    reportCache.set(cacheKey, result);
    return result;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

export async function createBrandedPdf(args: VisualReportArgs): Promise<Buffer> {
  return (await createVisualReport(args)).pdf;
}

export async function createBrandedHtml(args: VisualReportArgs): Promise<Buffer> {
  return (await createVisualReport(args)).html;
}
