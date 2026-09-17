import { describe, expect, it, vi } from "vitest";
import { loadNodePackWithManifest } from "./loader";
import { AGENT_DEFINITIONS } from "./registry";
vi.mock("server-only", () => ({}));

describe("complete node instructions", () => {
  it(
    "keeps every main node and final quality step even under a small reference budget",
    async () => {
      const refs = (AGENT_DEFINITIONS.find((agent) => agent.type === "INSTAGRAM")!.nodes ?? AGENT_DEFINITIONS.find((agent) => agent.type === "INSTAGRAM")!.skills);
      const result = await loadNodePackWithManifest(refs, 1000);
      expect(result.steps.length).toBe(refs.length);
      const parts = result.content.split("\n\n===== NEXT EMBEDDED NODE =====\n\n");
      expect(parts).toHaveLength(refs.length);
      parts.forEach((part, index) => expect(part.length).toBe(result.steps[index].charactersProvided));
      const lastRef = refs.at(-1)!;
      expect(parts.at(-1)).toContain(`NODE: ${lastRef.repository}/${lastRef.node ?? lastRef.skill}`);
      expect(result.steps.some((step) => step.omittedReferences?.length)).toBe(true);
      expect(result.content).toContain("Do not claim to have read them");
    },
    15000
  );
});
