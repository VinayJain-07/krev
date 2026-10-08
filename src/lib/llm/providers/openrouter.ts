import type { CompletionParams, LLMProvider } from "../types";
import { extractJson, providerFetch } from "../shared";
import { ProviderError } from "../types";

type OpenRouterResponse = {
  choices?: Array<{ message?: { content?: string | null } }> | null;
  error?: { message?: string } | string;
};

function responseText(data: OpenRouterResponse | null | undefined): string {
  return data?.choices?.[0]?.message?.content?.trim() ?? "";
}

export const openRouterProvider: LLMProvider = {
  async validateKey(apiKey, model = process.env.SMARK_MODEL_OPENROUTER || "openai/gpt-5.4-mini") {
    const output = await this.complete({
      apiKey,
      model,
      messages: [{ role: "user", content: "Return a compact JSON object confirming structured report support." }],
      maxTokens: 256,
      temperature: 0,
      jsonSchema: { name: "provider_capability_check", schema: { type: "object", additionalProperties: false, properties: { ok: { type: "boolean" }, summary: { type: "string" } }, required: ["ok", "summary"] } },
    });
    const result = extractJson<{ ok?: boolean }>(output);
    if (result.ok !== true) throw new ProviderError("OpenRouter accepted the key, but this model did not confirm structured report support. Choose another model.");
  },
  async complete(params: CompletionParams) {
    const messages = params.system ? [{ role: "system", content: params.system }, ...params.messages] : params.messages;
    const request = (responseFormat?: Record<string, unknown>, model = params.model) => providerFetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${params.apiKey}`, "Content-Type": "application/json", "HTTP-Referer": process.env.AUTH_URL ?? "http://localhost:3000", "X-Title": "KREV AI" },
      body: JSON.stringify({ model, messages, max_tokens: params.maxTokens, temperature: params.temperature, reasoning: { exclude: true }, response_format: responseFormat }),
    }) as Promise<OpenRouterResponse | null>;

    let first: OpenRouterResponse | null = null;
    try {
      first = await request(params.jsonSchema ? { type: "json_schema", json_schema: { name: params.jsonSchema.name, strict: true, schema: params.jsonSchema.schema } } : undefined);
      const content = responseText(first);
      if (content) return content;
    } catch (error) {
      if (!params.jsonSchema || (error instanceof ProviderError && [401, 403, 429].includes(error.status ?? 0))) throw error;
    }

    if (params.jsonSchema) {
      const fallback = await request();
      const content = responseText(fallback);
      if (content) return content;
      if (params.model.endsWith(":free") && params.model !== "openrouter/free") {
        const routed = await request({ type: "json_schema", json_schema: { name: params.jsonSchema.name, strict: true, schema: params.jsonSchema.schema } }, "openrouter/free");
        const routedContent = responseText(routed);
        if (routedContent) return routedContent;
      }
      const nested = fallback?.error;
      const message = typeof nested === "string" ? nested : nested?.message;
      throw new ProviderError(message ?? "The selected OpenRouter model returned no usable content. Choose a model that supports long structured responses.");
    }
    const nested = first?.error;
    const message = typeof nested === "string" ? nested : nested?.message;
    throw new ProviderError(message ?? "The selected OpenRouter model returned no usable content.");
  },
};
