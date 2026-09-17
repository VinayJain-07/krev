import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ALL_DOCUMENTS, AGENT_DEFINITIONS } from "../src/lib/nodes/registry";
import { resolveArtifactManifest } from "../src/lib/artifacts/config";
import { DOCUMENT_SCOPE } from "../src/lib/documents/output-contract";

const skipped = new Set(["node_modules", ".git", ".next", ".venv-report", ".pnpm-store", "tmp", "output", "outputs", ".codex-tmp"]);
async function markdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (skipped.has(entry.name) || entry.isSymbolicLink()) continue;
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await markdownFiles(filename));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(filename);
  }
  return files;
}

async function main() {
  const workspace = path.resolve("..");
  const files = (await markdownFiles(workspace)).filter((filename) => !filename.endsWith("document-output-audit.md"));
  const groups = new Map<string, string[]>();
  for (const filename of files) {
    const digest = createHash("sha256").update((await readFile(filename, "utf8")).replace(/\r\n/g, "\n").trim()).digest("hex");
    groups.set(digest, [...groups.get(digest) ?? [], path.relative(workspace, filename).replaceAll("\\", "/")]);
  }
  const duplicates = [...groups.values()].filter((group) => group.length > 1).sort((a, b) => b.length - a.length);
  const repeatedCopies = duplicates.reduce((sum, group) => sum + group.length - 1, 0);
  const lines = [
    "# Document and skill output audit", "",
    `Reviewed ${files.length} Markdown files across this workspace, ${ALL_DOCUMENTS.length} document definitions and ${AGENT_DEFINITIONS.length} agent definitions.`, "",
    "## Redundant source files", "",
    `Found ${duplicates.length} groups with identical content after newline normalization (${repeatedCopies} repeated copies). These are file copies, not ${repeatedCopies} redundant customer reports.`, "",
    "The runtime reads local skills from smark-connect-app/skills and external skills from smark-connect-app/vendor/skill-repositories. The sibling original repositories and document-framework-push app copy are outside that runtime lookup. Keep the vendored runtime files. Review sibling repositories as snapshots or independent checkouts before archiving them; this audit does not delete them.", "",
    "Examples of repeated files:", "",
    ...duplicates.filter((group) => group.some((file) => file.endsWith("SKILL.md"))).slice(0, 6).map((group) => `- ${group.join("; ")}`), "",
    "## Overlapping deliverables", "",
    ...Object.entries(DOCUMENT_SCOPE).map(([type, boundary]) => `- **${ALL_DOCUMENTS.find((item) => item.type === type)?.title ?? type}:** ${boundary}`), "",
    "Company/offer, content audit/strategy, and competitive research/comparison copy remain separate because they support distinct decisions. The generation and edit contracts now define ownership so their shared introductory research is not repeated. Content Audit is titled Content Inventory and Quality Audit. The duplicate visual-composition entry in the Creative and Visual Agent has been removed.", "",
    "## Format coverage", "",
    "All registered document types have explicit format profiles. XLSX-first plans expose workbooks regardless of how many keywords or rows the model happens to return. Off-page SEO preserves its existing Excel-only contract. Every other type offers PDF.", "",
    "| Document | Recommended | Available from empty input |", "|---|---|---|",
    ...ALL_DOCUMENTS.map((definition) => {
      const manifest = resolveArtifactManifest({ reportType: definition.type });
      return `| ${definition.title} | ${manifest.primaryArtifact.toUpperCase()} | ${Object.values(manifest.decisions).filter((decision) => decision.enabled).map((decision) => decision.format.toUpperCase()).join(", ")} |`;
    }), "",
    "Optional workbooks for narrative reports can become available when structured operational data is present.", "",
    "## Quality changes", "",
    "- Complete governing skill files and final quality steps reach the model. Supplemental references that do not fit the context target are identified as omitted, and manifest character counts describe the actual supplied text. Complete skill files can exceed the soft context target; monitor provider context limits and token usage.",
    "- Per-document instructions require distinct scope, complete working tables, stable record IDs, evidence beside claims, explicit unknowns, accountable actions and readable sections.",
    "- Recommendation sources come from actual inline citations. Uncited actions stay uncited. Dates and list numbers no longer become headline KPI cards; proposed targets are excluded from measured metrics. Presentations no longer attach unrelated recommendations to a finding.",
    "- Workbooks create configured sheets, retain complete drafts, use typed dates and values, freeze/filter tables, size wrapped rows, repeat printed headers and use formula-driven status progress. Missing datasets are labelled unavailable. Internal artifact-manifest and redundant lineage tabs are removed; action evidence is visible in the tracker.",
    "- Newly generated research appendices retain the captured page inventory without repeating every captured excerpt and then every source URL a second time. Existing stored document bodies are preserved.",
    "- PDFs include every referenced source, use clickable links, and label references accurately without claiming automatic verification. Unused static chart templates containing fabricated fixed metrics have been removed.",
    "- The document workspace recommends the intended format, keeps downloads reachable on small screens, shows download failures, and uses an indeterminate PDF preparation state rather than simulated progress percentages.", "",
    "## Validation and scope", "",
    "Run pnpm documents:audit for an updated filesystem inventory. Run pnpm test, pnpm typecheck, pnpm skills:validate and pnpm artifacts:qa for functional and export checks. Detailed duplicate paths are written to tmp/document-system-audit.json.", "",
    "Changes are in smark-connect-app. No saved customer documents, database records, sibling app checkout or original skill repositories were deleted or regenerated. Export improvements apply to existing content immediately; improved authored content requires a future generation or edit with the new contracts. Representative exports can be checked without a live AI provider; those fixtures do not prove the quality of future model responses.", "",
  ];
  await mkdir("docs", { recursive: true });
  await mkdir("tmp", { recursive: true });
  await writeFile("docs/document-output-audit.md", lines.join("\n"));
  await writeFile("tmp/document-system-audit.json", JSON.stringify({ markdownFiles: files.length, repeatedCopies, duplicates }, null, 2));
  process.stdout.write(JSON.stringify({ markdownFiles: files.length, duplicateGroups: duplicates.length, repeatedCopies, documentTypes: ALL_DOCUMENTS.length, report: "docs/document-output-audit.md" }));
}

void main();
