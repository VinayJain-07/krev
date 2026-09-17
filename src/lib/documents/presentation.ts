import { ALL_DOCUMENTS, AGENT_DEFINITIONS } from "../nodes/registry";

// Internal provenance remains in metadata; it is never report content.
const identifiers = Array.from(new Set([
  "claude-main", "claude-seo-main", "claude-seo", "openclaw-marketing-skills-main",
  "openclaw-marketing-skills", "social-media-skills", "skills-main", "SKILL.md",
  ...[...ALL_DOCUMENTS, ...AGENT_DEFINITIONS].flatMap((item) => item.skills.flatMap((ref) => [
    `${ref.repository}/${ref.skill}`, ...(ref.skill.includes("-") ? [ref.skill] : []),
  ])),
])).sort((a, b) => b.length - a.length);
const internalName = new RegExp(`(?<![\\w-])(?:${identifiers.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![\\w-])`, "gi");
const provenanceLabel = /^(?:(?:used|applied|embedded(?:\s+local)?|local|source)\s+skills?(?:\s+files?)?|skills?\s+(?:used|applied|provenance|sources?|guidance)|methodology\s*(?:\/|and|&)\s*skills?)(?:\s*[:—-]|\s*$)/i;

export function unwrapMarkdown(value: string): string {
  const text = value.trim();
  // Only unwrap a complete outer Markdown envelope. A report ending in a
  // diagram fence must keep that closing fence.
  const wrapper = text.match(/^(`{3,}|~{3,})(?:markdown|md)\s*\n([\s\S]*)\n\1\s*$/i);
  return wrapper ? wrapper[2].trim() : text;
}

export function documentMarkdown(value: string): string {
  let hiddenLevel = 0;
  const lines = unwrapMarkdown(value).split(/\r?\n/).filter((line) => {
    if (/^\s*(?:SKILL|EMBEDDED LOCAL SKILL FILES?)\s*:/i.test(line)) return false;
    if (/^\s*SOURCE\s*:\s*(?:[^\s]+\/)?(?:skills?|references?)\//i.test(line) || /\.codex|SKILL\.md/i.test(line)) return false;
    const heading = line.match(/^\s*(#{1,6})\s+(.+?)\s*#*$/);
    const label = (heading?.[2] ?? line).replace(/[*_`]/g, "").replace(/^\s*[-+]\s+/, "").trim();
    if (heading && hiddenLevel && heading[1].length <= hiddenLevel) hiddenLevel = 0;
    if (hiddenLevel) return false;
    if (provenanceLabel.test(label)) {
      if (heading) hiddenLevel = heading[1].length;
      return false;
    }
    return true;
  });
  // Source URLs are evidence and must never be changed just because a path
  // happens to contain a local skill name (for example /seo-audit).
  const urls: string[] = [];
  const protectedText = lines.join("\n").replace(/https?:\/\/[^\s)\]>]+/gi, (url) => {
    const token = `\u0000URL${urls.length}\u0000`;
    urls.push(url);
    return token;
  });
  return protectedText
    .replace(internalName, "analysis methodology")
    .replace(/\u0000URL(\d+)\u0000/g, (_, index) => urls[Number(index)] ?? "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const DOCUMENT_OUTPUT_RULES = "Keep internal skill names, repository names, file paths, and skill provenance out of all report content. Cite external evidence, never the internal instruction files. Present frameworks under explicit headings (SWOT, PESTEL, TOWS, Funnel, Customer Journey, 30/60/90-day Roadmap, Prioritization Matrix, or Competitive Comparison). For SWOT, PESTEL, and TOWS use a Markdown table with a first column identifying the category, followed by evidence, implications, and actions, or use category subheadings with bullets. For funnels, journeys, and roadmaps use a Markdown table whose first column is Stage, Phase, or Period and subsequent columns contain objectives, evidence, actions, and measures. For prioritization and comparison frameworks use a Markdown table with a first column named Initiative, Option, Dimension, Competitor, Vendor, Segment, Quadrant, or Priority. The application converts these structures into framework visuals. Preserve source URLs and uncertainty. Never invent numerical values. Do not use ASCII art, Mermaid, raw SVG, or HTML for these frameworks.";
