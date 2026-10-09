import type { ProviderName } from "./types";

export type ModelOption = {
  id: string;
  label: string;
  description: string;
};

/**
 * Curated model choices shown in the connection UI. The provider APIs still
 * receive the model ID, while users see a readable name and short purpose.
 * Custom IDs remain supported for newly released or provider-specific models.
 */
export const MODEL_CATALOG: Record<ProviderName, readonly ModelOption[]> = {
  google: [
    { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash", description: "Fast multimodal analysis" },
    { id: "gemini-3.7-flash", label: "Gemini 3.7 Flash", description: "Balanced speed and reasoning" },
    { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash", description: "Recommended for KREV reports" },
    { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash", description: "Reliable structured output" },
    { id: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash Lite", description: "Lower-latency generation" },
    { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", description: "Deep reasoning and long context" },
  ],
  openai: [
    { id: "gpt-5.1", label: "GPT-5.1", description: "Advanced reasoning and synthesis" },
    { id: "gpt-5-mini", label: "GPT-5 mini", description: "Fast, capable report generation" },
    { id: "gpt-4.1", label: "GPT-4.1", description: "Strong instruction following" },
    { id: "gpt-4o-mini", label: "GPT-4o mini", description: "Fast and cost-conscious" },
  ],
  anthropic: [
    { id: "claude-opus-5", label: "Claude Opus 5", description: "Highest-depth strategic reasoning" },
    { id: "claude-sonnet-5", label: "Claude Sonnet 5", description: "Balanced analysis and speed" },
    { id: "claude-opus-4-8", label: "Claude Opus 4.8", description: "Deep reasoning and synthesis" },
    { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", description: "Fast, reliable analysis" },
    { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", description: "Lowest-latency responses" },
  ],
  openrouter: [
    { id: "openai/gpt-5.1", label: "OpenAI GPT-5.1", description: "Advanced reasoning via OpenRouter" },
    { id: "anthropic/claude-sonnet-5", label: "Claude Sonnet 5", description: "Balanced strategic analysis" },
    { id: "google/gemini-3.6-flash", label: "Gemini 3.6 Flash", description: "Fast multimodal generation" },
    { id: "openrouter/auto", label: "OpenRouter Auto", description: "Automatic model routing" },
  ],
};

export const DEFAULT_MODEL_BY_PROVIDER: Record<ProviderName, string> = {
  google: "gemini-3.6-flash",
  openai: "gpt-5-mini",
  anthropic: "claude-sonnet-5",
  openrouter: "openai/gpt-5.1",
};

export function getModelOptions(provider: string): readonly ModelOption[] {
  return MODEL_CATALOG[provider as ProviderName] ?? MODEL_CATALOG.anthropic;
}

export function getRecommendedModel(provider: string): string {
  return DEFAULT_MODEL_BY_PROVIDER[provider as ProviderName] ?? DEFAULT_MODEL_BY_PROVIDER.anthropic;
}
