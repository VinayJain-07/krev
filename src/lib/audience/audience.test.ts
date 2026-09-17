import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("../db", () => ({ db: {} }));
vi.mock("../nodes/runner", () => ({
  deriveResearchTopics: () => [],
  completeAnalysis: async () => ({ analysis: { findings: [], summary: "" } }),
}));

import { runAudienceIntelligencePipeline } from "./pipeline";

describe("Audience Intelligence Agent Pipeline", () => {
  it("exports runAudienceIntelligencePipeline function", () => {
    expect(typeof runAudienceIntelligencePipeline).toBe("function");
  });
});
