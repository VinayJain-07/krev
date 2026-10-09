import type { CompletionParams, LLMProvider } from "../types";
import { providerFetch } from "../shared";
import { ProviderError } from "../types";
import { DEFAULT_MODEL_BY_PROVIDER } from "../model-catalog";

export function sanitizeSchemaForGemini(schema: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!schema || typeof schema !== "object" || schema === null) return undefined;
  if (Array.isArray(schema)) {
    return schema.map((item) => sanitizeSchemaForGemini(item as Record<string, unknown>)) as unknown as Record<string, unknown>;
  }
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(schema)) {
    if (["additionalProperties", "minItems", "maxItems", "minimum", "maximum"].includes(key)) {
      continue;
    }
    if (value && typeof value === "object") {
      clean[key] = sanitizeSchemaForGemini(value as Record<string, unknown>);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export const geminiProvider: LLMProvider = {
  async validateKey(apiKey, model = process.env.SMARK_MODEL_GOOGLE || DEFAULT_MODEL_BY_PROVIDER.google) {
    try {
      await this.complete({ apiKey, model, messages: [{ role: "user", content: "Reply with OK." }], maxTokens: 12 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/requests from referer|referer.*empty|referer.*blocked/i.test(message)) {
        throw new ProviderError(
          "Google rejected this key because it is restricted to browser HTTP referrers. KREV validates Gemini server-side. Create a new Google key with Application restrictions set to None and API restrictions limited to Generative Language API, then try again."
        );
      }
      throw error;
    }
  },
  async complete(params: CompletionParams) {
    const cleanSchema = params.jsonSchema ? sanitizeSchemaForGemini(params.jsonSchema.schema) : undefined;
    const data = (await providerFetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(params.model)}:generateContent?key=${encodeURIComponent(params.apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: params.system ? { parts: [{ text: params.system }] } : undefined,
        contents: params.messages.map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] })),
        generationConfig: {
          maxOutputTokens: params.maxTokens,
          temperature: params.temperature,
          responseMimeType: params.jsonSchema ? "application/json" : undefined,
          responseSchema: cleanSchema,
        },
      }),
    })) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  },
};
