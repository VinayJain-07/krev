import * as cheerio from "cheerio";

export type AeoCheck = {
  id: string;
  label: string;
  status: "pass" | "fail" | "unknown";
  detail: string;
  sourceUrl?: string;
};

export type AnswerPassage = {
  heading: string;
  passage: string;
  type: "definition" | "procedure" | "comparison" | "faq";
  sourceUrl: string;
  path: string;
  query: string;
  wordCount: number;
};

export type GeoCitabilityReport = {
  readinessScore: number | null;
  citationReadinessStage: "Insufficient evidence" | "Foundational" | "Developing" | "Ready for review";
  answerPassages: AnswerPassage[];
  checks: AeoCheck[];
  entitySignals: {
    totalAuditedPages: number;
    totalAuditedWords: number;
    brandEntityFound: boolean;
    categoryDeclared: boolean;
    clearValueProp: boolean;
    structuredListsCount: number;
    tablesCount: number;
    externalReferenceDomains: number;
    schemaTypes: string[];
    titleDescriptionPages: number;
    headingPages: number;
    canonicalPages: number;
    indexablePages: number;
  };
  strategicActions: string[];
};

export type AeoScanReport = GeoCitabilityReport & {
  scannedAt: string;
  attemptedPages: number;
  failedPages: Array<{ url: string; reason: string }>;
  savedCrawlPages: Array<{ url: string; title: string | null; description: string | null; wordCount: number; fetchedAt: string }>;
};

type Company = { name: string; websiteUrl: string; category?: string | null };
type Page = { url: string; html: string };

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function wordCount(value: string) {
  return clean(value).split(/\s+/).filter(Boolean).length;
}

function schemaItems(value: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(value)) return value.flatMap(schemaItems);
  if (!value || typeof value !== "object") return [];
  const item = value as Record<string, unknown>;
  return [item, ...schemaItems(item["@graph"])];
}

function hasSchemaContext(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasSchemaContext);
  if (!value || typeof value !== "object") return false;
  const context = (value as Record<string, unknown>)["@context"];
  return typeof context === "string" && /^https?:\/\/schema\.org\/?$/i.test(context);
}

function passageType(heading: string): AnswerPassage["type"] {
  if (/\?$/.test(heading) || /^(what|who|which|when|where|can|does|is)\b/i.test(heading)) return "faq";
  if (/^(how|steps|process|guide|ways)\b/i.test(heading)) return "procedure";
  if (/\b(vs\.?|versus|compare|comparison|alternatives?)\b/i.test(heading)) return "comparison";
  return "definition";
}

export function analyzeGeoCitability(company: Company, pages: Page[], supportingChecks: AeoCheck[] = []): GeoCitabilityReport {
  const brand = company.name.toLowerCase();
  const category = company.category?.trim().toLowerCase() ?? "";
  const officialHost = new URL(company.websiteUrl).hostname.replace(/^www\./, "");
  const passages: AnswerPassage[] = [];
  const schemaTypes = new Set<string>();
  const outboundDomains = new Set<string>();
  let totalWords = 0;
  let titleDescriptionPages = 0;
  let headingPages = 0;
  let canonicalPages = 0;
  let indexablePages = 0;
  let lists = 0;
  let tables = 0;
  let brandEntityFound = false;
  let categoryDeclared = false;
  let clearValueProp = false;

  for (const page of pages) {
    const $ = cheerio.load(page.html);
    const title = clean($("title").first().text());
    const description = clean($('meta[name="description"]').attr("content") ?? "");
    if (title && description) titleDescriptionPages++;
    if ($("h1").filter((_, element) => Boolean(clean($(element).text()))).length) headingPages++;
    if ($('link[rel="canonical"][href]').length) canonicalPages++;
    const robots = [
      $('meta[name="robots"]').attr("content") ?? "",
      $('meta[name="googlebot"]').attr("content") ?? "",
    ].join(",").toLowerCase();
    if (!/(?:^|[,\s])noindex(?:[,\s]|$)/.test(robots)) indexablePages++;

    $("script[type='application/ld+json']").each((_, element) => {
      try {
        const parsed: unknown = JSON.parse($(element).html() ?? "");
        if (!hasSchemaContext(parsed)) return;
        for (const item of schemaItems(parsed)) {
          const value = item["@type"];
          for (const type of Array.isArray(value) ? value : [value]) {
            if (typeof type === "string" && type.trim()) schemaTypes.add(type.trim());
          }
        }
      } catch { /* Invalid JSON-LD is not counted as evidence. */ }
    });

    $("a[href]").each((_, element) => {
      try {
        const destination = new URL($(element).attr("href") ?? "", page.url);
        const host = destination.hostname.replace(/^www\./, "");
        if (destination.protocol.startsWith("http") && host !== officialHost) outboundDomains.add(host);
      } catch { /* Ignore malformed links. */ }
    });

    $("script, style, noscript, svg, canvas, iframe, template, nav, footer").remove();
    lists += $("main ul, main ol, article ul, article ol").length;
    tables += $("main table, article table").length;
    const bodyText = clean($("main").first().text() || $("body").text());
    totalWords += wordCount(bodyText);
    if (bodyText.toLowerCase().includes(brand)) brandEntityFound = true;
    if (category && bodyText.toLowerCase().includes(category)) categoryDeclared = true;

    $("h1, h2, h3").each((_, element) => {
      const heading = clean($(element).text());
      if (heading.length < 6 || heading.length > 140) return;
      const sibling = $(element).next();
      const paragraph = clean(
        sibling.is("p") ? sibling.text() :
        sibling.find("p").first().text(),
      );
      const words = wordCount(paragraph);
      if (words < 12 || words > 130) return;
      const lower = paragraph.toLowerCase();
      if (lower.includes(brand) && /\b(is|are|helps?|provides?|offers?|enables?|builds?)\b/.test(lower)) clearValueProp = true;
      const type = passageType(heading);
      passages.push({
        heading,
        passage: paragraph,
        type,
        sourceUrl: page.url,
        path: new URL(page.url).pathname || "/",
        query: heading,
        wordCount: words,
      });
    });
  }

  const uniquePassages = [...new Map(passages.map((passage) => [`${passage.sourceUrl}:${passage.heading}:${passage.passage}`, passage])).values()].slice(0, 20);
  const total = pages.length;
  const check = (id: string, label: string, matched: number, detail: string): AeoCheck => ({
    id, label, status: total === 0 ? "unknown" : matched === total ? "pass" : "fail", detail,
  });
  const checks: AeoCheck[] = [
    check("metadata", "Titles and descriptions", titleDescriptionPages, `${titleDescriptionPages} of ${total} pages have both`),
    check("headings", "Page H1 headings", headingPages, `${headingPages} of ${total} pages have an H1`),
    check("canonical", "Canonical links", canonicalPages, `${canonicalPages} of ${total} pages declare a canonical URL`),
    check("indexability", "On-page indexability", indexablePages, `${indexablePages} of ${total} pages have no meta noindex`),
    { id: "answers", label: "Direct answer passages", status: total === 0 ? "unknown" : uniquePassages.length > 0 ? "pass" : "fail", detail: `${uniquePassages.length} heading-and-answer pairs extracted` },
    { id: "schema", label: "Schema.org JSON-LD", status: total === 0 ? "unknown" : schemaTypes.size > 0 ? "pass" : "fail", detail: schemaTypes.size ? [...schemaTypes].join(", ") : "No parseable Schema.org JSON-LD found" },
    ...supportingChecks,
  ];

  const readinessScore = total === 0 ? null : Math.round(100 * (
    (titleDescriptionPages / total) * 0.15 +
    (headingPages / total) * 0.15 +
    (canonicalPages / total) * 0.10 +
    (indexablePages / total) * 0.15 +
    Math.min(1, uniquePassages.length / Math.max(2, total)) * 0.25 +
    (schemaTypes.size > 0 ? 0.15 : 0) +
    (lists + tables > 0 ? 0.05 : 0)
  ));
  const citationReadinessStage = readinessScore === null ? "Insufficient evidence" : readinessScore >= 75 ? "Ready for review" : readinessScore >= 45 ? "Developing" : "Foundational";
  const strategicActions: string[] = [];
  if (total === 0) strategicActions.push("Retry the live scan after confirming the website is reachable.");
  if (total > 0 && uniquePassages.length === 0) strategicActions.push("Add concise answers beneath descriptive H2 headings on your key pages.");
  if (total > 0 && titleDescriptionPages < total) strategicActions.push("Add unique page titles and meta descriptions to the pages missing them.");
  if (total > 0 && headingPages < total) strategicActions.push("Add a clear H1 heading to each page missing one.");
  if (total > 0 && canonicalPages < total) strategicActions.push("Declare canonical URLs on the pages missing them.");
  if (total > 0 && indexablePages < total) strategicActions.push("Review noindex directives on public pages you want discovered.");
  if (total > 0 && schemaTypes.size === 0) strategicActions.push("Publish valid Organization or product/service JSON-LD where the facts are verified.");
  for (const item of supportingChecks) if (item.status === "fail") strategicActions.push(item.detail);

  return {
    readinessScore,
    citationReadinessStage,
    answerPassages: uniquePassages,
    checks,
    entitySignals: {
      totalAuditedPages: total,
      totalAuditedWords: totalWords,
      brandEntityFound,
      categoryDeclared,
      clearValueProp,
      structuredListsCount: lists,
      tablesCount: tables,
      externalReferenceDomains: outboundDomains.size,
      schemaTypes: [...schemaTypes],
      titleDescriptionPages,
      headingPages,
      canonicalPages,
      indexablePages,
    },
    strategicActions: strategicActions.slice(0, 6),
  };
}
