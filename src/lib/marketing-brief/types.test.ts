import { describe, it, expect } from "vitest";
import { formatMarketingBriefToMarkdown, MarketingStrategyBrief } from "./types";

describe("formatMarketingBriefToMarkdown", () => {
  it("formats a complete marketing brief into structured markdown", () => {
    const brief: MarketingStrategyBrief = {
      targetGeographies: {
        primary: "United States",
        secondary: ["United Kingdom", "Germany"],
        priorityNotes: "70% focus on US Enterprise, 30% UK expansion",
      },
      targetAudience: {
        segments: ["B2B Enterprise", "Startups"],
        buyerPersonas: ["CMO", "VP Growth"],
        corePainPoints: "High CAC and slow content velocity",
      },
      positioning: {
        valueProposition: "Autonomous AI CMO operating system",
        keyDifferentiator: "Evidence-backed audits with zero-retention privacy",
      },
      competitors: ["Competitor A", "Competitor B"],
      marketingGoals: ["Inbound Pipeline", "SEO & Organic Search"],
      brandVoice: "Authoritative & Data-Driven",
      salesMotion: "Product-Led Growth",
      additionalNotes: "Launching Q4 product update",
    };

    const markdown = formatMarketingBriefToMarkdown(brief);

    expect(markdown).toContain("**Tier 1 (Primary Core Market):** United States");
    expect(markdown).toContain("**Tier 2 (Secondary Expansion Markets):** United Kingdom, Germany");
    expect(markdown).toContain("70% focus on US Enterprise, 30% UK expansion");
    expect(markdown).toContain("B2B Enterprise, Startups");
    expect(markdown).toContain("CMO, VP Growth");
    expect(markdown).toContain("High CAC and slow content velocity");
    expect(markdown).toContain("Autonomous AI CMO operating system");
    expect(markdown).toContain("Competitor A, Competitor B");
    expect(markdown).toContain("Inbound Pipeline, SEO & Organic Search");
    expect(markdown).toContain("Authoritative & Data-Driven");
    expect(markdown).toContain("Product-Led Growth");
  });

  it("handles partial or empty brief gracefully without crashing", () => {
    const markdown = formatMarketingBriefToMarkdown({});
    expect(markdown).toContain("# Strategic Marketing & Geography Intelligence Brief");
    expect(markdown).not.toContain("Tier 1");
  });
});
