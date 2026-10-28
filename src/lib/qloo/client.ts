import "server-only";

import type { QlooEntityType, QlooInsightsResponse } from "./types";
import { normalizeQlooEntities, normalizeQlooInsights } from "./normalize";
export { normalizeQlooEntities, normalizeQlooInsights } from "./normalize";

const DEFAULT_BASE_URL = "https://api.qloo.com";
const MAX_TAKE = 20;
const MAX_SEEDS = 8;

export class QlooConfigurationError extends Error {
  constructor() {
    super("Qloo is not configured. Add QLOO_API_KEY to the server environment.");
    this.name = "QlooConfigurationError";
  }
}
export class QlooRequestError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "QlooRequestError";
    this.status = status;
  }
}

function qlooConfig() {
  const apiKey = process.env.QLOO_API_KEY?.trim();
  if (!apiKey) throw new QlooConfigurationError();
  return {
    apiKey,
    baseUrl: (process.env.QLOO_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/$/, ""),
  };
}

async function qlooRequest<T>(path: string, params: URLSearchParams, timeoutMs = 20_000): Promise<T> {
  const { apiKey, baseUrl } = qlooConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl}${path}?${params.toString()}`, {
      headers: { Accept: "application/json", "X-Api-Key": apiKey },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new QlooRequestError(`Qloo returned ${response.status}${detail ? `: ${detail.slice(0, 180)}` : ""}`, response.status);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof QlooRequestError) throw error;
    if (error instanceof Error && error.name === "AbortError") throw new QlooRequestError("Qloo request timed out.", 504);
    throw new QlooRequestError("Qloo could not be reached.", 502);
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchEntities(input: { query: string; type?: QlooEntityType; take?: number }) {
  const params = new URLSearchParams({ query: input.query.trim().slice(0, 120), take: String(Math.min(Math.max(input.take ?? 8, 1), 10)) });
  if (input.type) params.set("types", `urn:entity:${input.type}`);
  const payload = await qlooRequest<unknown>("/search", params);
  return normalizeQlooEntities(payload);
}

export async function getInsights(input: {
  filterType: QlooEntityType;
  entityIds?: string[];
  tags?: string[];
  audience?: string;
  location?: string;
  take?: number;
  explainability?: boolean;
}) {
  const params = new URLSearchParams({
    "filter.type": `urn:entity:${input.filterType}`,
    take: String(Math.min(Math.max(input.take ?? 10, 1), MAX_TAKE)),
    "feature.explainability": String(input.explainability ?? true),
  });
  const entityIds = (input.entityIds ?? []).filter(Boolean).slice(0, MAX_SEEDS);
  const tags = (input.tags ?? []).filter(Boolean).slice(0, 8);
  if (entityIds.length) params.set("signal.interests.entities", entityIds.join(","));
  if (tags.length) params.set("signal.interests.tags", tags.join(","));
  if (input.audience?.trim()) params.set("signal.demographics.audiences", input.audience.trim().slice(0, 120));
  if (input.location?.trim()) params.set("signal.location.query", input.location.trim().slice(0, 120));
  const payload = await qlooRequest<QlooInsightsResponse>("/v2/insights/", params);
  return { payload, insights: normalizeQlooInsights(payload) };
}

