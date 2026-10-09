import type { CompletionParams, LLMProvider } from "../types";
import { providerFetch } from "../shared";
import { DEFAULT_MODEL_BY_PROVIDER } from "../model-catalog";

export const openAIProvider: LLMProvider = {
  async validateKey(apiKey, model = process.env.SMARK_MODEL_OPENAI || DEFAULT_MODEL_BY_PROVIDER.openai) {
    await this.complete({ apiKey, model, messages: [{ role: "user", content: "Reply with OK." }], maxTokens: 12 });
  },
  async complete(params: CompletionParams) {
    const messages = [
      ...(params.system ? [{ role: "system" as const, content: params.system }] : []),
      ...params.messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];
    const body: Record<string, unknown> = {
      model: params.model,
      messages,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
    };
    if (params.jsonSchema) {
      body.response_format = {
        type: "json_schema",
        json_schema: { name: params.jsonSchema.name, schema: params.jsonSchema.schema, strict: true },
      };
    }
    const data = (await providerFetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${params.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })) as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content ?? "";
  },
};
