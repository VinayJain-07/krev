const acronyms = new Set(["abm", "ai", "api", "b2b", "b2c", "geo", "html", "icp", "kpi", "pdf", "roi", "seo", "ugc", "url", "xlsx"]);
const specialAcronyms: Record<string, string> = { kpis: "KPIs" };

export function formatNodeName(value: string) {
  return value
    .trim()
    .replace(/[\/_-]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => specialAcronyms[word.toLowerCase()] ?? (acronyms.has(word.toLowerCase()) ? word.toUpperCase() : `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`))
    .join(" ");
}
export const formatSkillName = formatNodeName;
