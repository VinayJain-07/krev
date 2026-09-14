import { describe, expect, it } from "vitest";
import { reportStudioFrameworks } from "./studio-frameworks";

describe("report framework studio adapter", () => {
  it("uses report text without inventing numeric values", () => {
    const markdown = `# Analysis\n\n## SWOT analysis\n\n| Dimension | Evidence |\n|---|---|\n| Strengths | Published case studies |\n| Weaknesses | No public pricing |\n| Opportunities | New industry page |\n| Threats | Rival has a comparison page |`;
    const frameworks = reportStudioFrameworks([{ id: "report-1", title: "Company Analysis", contentMarkdown: markdown }]);
    expect(frameworks).toHaveLength(1);
    expect(frameworks[0].config.primitive).toBe("matrix");
    expect(JSON.stringify(frameworks[0].config)).toContain("Published case studies");
    expect(JSON.stringify(frameworks[0].config)).not.toContain("value\":");
  });

  it("turns saved priority findings into an evidence board", () => {
    const markdown = `# Company\n\n## Priority findings\n\n### Clarify positioning\n\n**Observed basis:** The current site uses three offer descriptions.\n\n**Next action:** Approve one source of truth.\n\n### Add proof\n\n**Observed basis:** The case page has no named outcome.\n\n**Next action:** Review publishable customer evidence.\n\n## Sources\n\n- https://example.com`;
    const frameworks = reportStudioFrameworks([{ id: "report-2", title: "Company Intelligence", contentMarkdown: markdown }]);
    expect(frameworks).toHaveLength(1);
    expect(frameworks[0].config.primitive).toBe("matrix");
    expect(JSON.stringify(frameworks[0].config)).toContain("Approve one source of truth");
    expect(JSON.stringify(frameworks[0].config)).not.toContain("https://example.com");
  });

  it("does not turn visibly corrupted report text into a visual", () => {
    const repeated = "context standard output schema payload structure valid parseable json ".repeat(35);
    const markdown = `# Report\n\n${repeated}\n\n## Priority findings\n\n### One\n\n**Observed basis:** Basis one\n\n### Two\n\n**Observed basis:** Basis two`;
    expect(reportStudioFrameworks([{ id: "bad", title: "Bad", contentMarkdown: markdown }])).toEqual([]);
  });
});
