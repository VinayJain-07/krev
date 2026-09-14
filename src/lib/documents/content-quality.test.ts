import { describe, expect, it } from "vitest";
import { documentContentIssue } from "./content-quality";

describe("document content quality", () => {
  it("catches the run-on repeated report passage shown in the document preview", () => {
    const corrupted = `# Company and Product Intelligence\n\nThe agency bridges strategy and technology for B2B teams. ${"Context standard format structure valid JSON output schema compliance framework execution trace. ".repeat(35)}`;
    expect(documentContentIssue(corrupted)).toMatch(/repetitive passage/);
  });

  it("accepts substantial readable prose and long evidence tables", () => {
    const prose = Array.from({ length: 12 }, (_, index) => `In section ${index + 1}, the team reviews a distinct buyer question and checks it against available evidence. The next step for this finding is test ${index + 1}, owned by the relevant specialist, with its own success measure and review date.`).join("\n\n");
    const table = `| Evidence | Interpretation |\n|---|---|\n| ${"A sourced observation with useful context. ".repeat(70)} | Review the source. |`;
    expect(documentContentIssue(`# Report\n\n${prose}\n\n${table}`)).toBeNull();
  });
});
