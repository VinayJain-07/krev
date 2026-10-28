import type { QlooEntity, QlooInsight } from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function firstString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) if (typeof record[key] === "string" && record[key]) return record[key] as string;
  return undefined;
}

function extractItems(payload: unknown, keys: string[]): unknown[] {
  const root = asRecord(payload);
  if (!root) return [];
  for (const key of keys) {
    const direct = asArray(root[key]);
    if (direct.length) return direct;
    const nested = asRecord(root[key]);
    if (nested) {
      for (const nestedKey of ["items", "entities", "results", "data"]) {
        const values = asArray(nested[nestedKey]);
        if (values.length) return values;
      }
    }
  }
  return [];
}

export function normalizeQlooEntities(payload: unknown): QlooEntity[] {
  return extractItems(payload, ["entities", "results", "data"]).flatMap((item) => {
    const record = asRecord(item);
    if (!record) return [];
    const id = firstString(record, ["id", "entity_id", "entityId", "urn"]);
    const name = firstString(record, ["name", "title", "label"]);
    if (!id || !name) return [];
    return [{ id, name, type: firstString(record, ["type", "entity_type", "entityType"]), subtype: firstString(record, ["subtype", "entity_subtype"]), imageUrl: firstString(record, ["image_url", "imageUrl", "image"]), disambiguation: firstString(record, ["disambiguation", "description"]), source: "qloo" as const }];
  });
}

export function normalizeQlooInsights(payload: unknown): QlooInsight[] {
  return extractItems(payload, ["entities", "results", "data", "recommendations"]).flatMap((item) => {
    const record = asRecord(item);
    if (!record) return [];
    const insight: QlooInsight = {
      id: firstString(record, ["id", "entity_id", "entityId", "urn"]),
      name: firstString(record, ["name", "title", "label"]),
      type: firstString(record, ["type", "entity_type", "entityType"]),
      imageUrl: firstString(record, ["image_url", "imageUrl", "image"]),
      tags: asArray(record.tags).filter((tag): tag is string => typeof tag === "string").slice(0, 12),
      explainability: record.explainability ?? record.explanation,
      affinity: typeof record.affinity === "number" ? record.affinity : typeof record.score === "number" ? record.score : null,
    };
    return insight.id || insight.name ? [insight] : [];
  });
}

