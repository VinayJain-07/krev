import { describe, expect, it } from "vitest";
import { normalizeQlooEntities, normalizeQlooInsights } from "./normalize";

describe("Qloo response normalization", () => {
  it("normalizes nested entity results without inventing missing records", () => {
    expect(normalizeQlooEntities({ results: { entities: [{ id: "urn:entity:artist:1", name: "Aster" }] } })).toEqual([
      { id: "urn:entity:artist:1", name: "Aster", type: undefined, subtype: undefined, imageUrl: undefined, disambiguation: undefined, source: "qloo" },
    ]);
    expect(normalizeQlooEntities({ results: [{ name: "No id" }] })).toEqual([]);
  });

  it("keeps affinity, tags, and explainability when present", () => {
    expect(normalizeQlooInsights({ results: [{ id: "urn:entity:place:1", name: "Cafe", score: 0.84, tags: ["cozy"], explanation: { reason: "taste" } }] })).toEqual([
      { id: "urn:entity:place:1", name: "Cafe", type: undefined, imageUrl: undefined, tags: ["cozy"], explainability: { reason: "taste" }, affinity: 0.84 },
    ]);
  });
});
