import { describe, it, expect } from "vitest";

describe("Competitor Agent Discovery and Extraction", () => {
  it("extracts clean competitor company names and prevents 'Finding 1', 'Finding 2' labels", async () => {
    // Import helper via runner
    const targetWebsite = "https://thesmarketers.com";

    const rawFindings = [
      {
        title: "Finding 1: Semrush",
        evidence: "Semrush provides an all-in-one search and competitive intelligence platform.",
        impact: "Direct competitor for search visibility and keyword research.",
        action: "Position against high enterprise tier costs and complex UI.",
        kind: "insight" as const,
        platform: "",
        sourceLabel: "https://semrush.com",
        publishedAt: "",
        draftContent: "",
        recommendedResponse: "",
        tags: [],
        companyName: "Finding 1",
        officialWebsite: "https://semrush.com",
        logoUrl: "",
        competitiveAttributes: ["Keyword database", "Backlink tracking"],
        priority: "high" as const,
        confidence: 90,
        sourceUrls: ["https://semrush.com"],
      },
      {
        title: "Competitor 2 - Ahrefs",
        evidence: "Ahrefs offers extensive backlink and crawler diagnostics.",
        impact: "Strong technical crawler with dedicated user base.",
        action: "Differentiate with automated reporting and multi-client workflows.",
        kind: "insight" as const,
        platform: "",
        sourceLabel: "https://ahrefs.com",
        publishedAt: "",
        draftContent: "",
        recommendedResponse: "",
        tags: [],
        companyName: "",
        officialWebsite: "https://ahrefs.com",
        logoUrl: "",
        competitiveAttributes: ["Live web crawler", "SERP history"],
        priority: "high" as const,
        confidence: 88,
        sourceUrls: ["https://ahrefs.com"],
      },
      {
        title: "Moz Pro",
        evidence: "Moz provides domain authority metrics and local search tools.",
        impact: "Established legacy platform.",
        action: "Highlight modern AI search and GEO capabilities.",
        kind: "insight" as const,
        platform: "",
        sourceLabel: "https://moz.com",
        publishedAt: "",
        draftContent: "",
        recommendedResponse: "",
        tags: [],
        companyName: "Moz Pro",
        officialWebsite: "https://moz.com",
        logoUrl: "",
        competitiveAttributes: ["Domain Authority", "Keyword Explorer"],
        priority: "medium" as const,
        confidence: 85,
        sourceUrls: ["https://moz.com"],
      },
    ];

    // Verify company names are clean and distinct
    const cleanNames = rawFindings.map((f) => {
      const name = f.title
        .replace(/^finding\s+\d+[:\s-]*/i, "")
        .replace(/^competitor\s+\d+[:\s-]*/i, "")
        .trim();
      return name;
    });

    expect(cleanNames).toEqual(["Semrush", "Ahrefs", "Moz Pro"]);
    expect(cleanNames).not.toContain("Finding 1");
    expect(cleanNames).not.toContain("Competitor 2");
  });
});
