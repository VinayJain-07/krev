import type { CompletionParams, LLMProvider } from "../types";
import { providerFetch } from "../shared";
import { DEFAULT_MODEL_BY_PROVIDER } from "../model-catalog";

export const anthropicProvider: LLMProvider = {
  async validateKey(apiKey, model = process.env.SMARK_MODEL_ANTHROPIC || DEFAULT_MODEL_BY_PROVIDER.anthropic) {
    await this.complete({ apiKey, model, messages: [{ role: "user", content: "Reply with OK." }], maxTokens: 12 });
  },
  async complete(params: CompletionParams) {
    const schemaInstruction = params.jsonSchema ? `\nReturn only JSON matching this schema:\n${JSON.stringify(params.jsonSchema.schema)}` : "";
    const data = (await providerFetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": params.apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: params.model,
        system: `${params.system ?? ""}${schemaInstruction}`.trim() || undefined,
        messages: params.messages,
        max_tokens: params.maxTokens,
        temperature: params.temperature,
      }),
    })) as { content?: Array<{ type?: string; text?: string }> };
    return data.content?.find((part) => part.type === "text")?.text ?? "";
  },
};
