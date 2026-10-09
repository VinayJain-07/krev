"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AIModelSelect } from "@/components/ai-model-select";
import { getRecommendedModel } from "@/lib/llm/model-catalog";

const providers = [
  { value: "anthropic", label: "Anthropic", hint: "Claude models", icon: "/provider-logos/anthropic.svg" },
  { value: "openai", label: "OpenAI", hint: "GPT models", icon: "/provider-logos/openai.svg" },
  { value: "openrouter", label: "OpenRouter", hint: "Multi-provider routing", icon: "/provider-logos/openrouter.svg" },
  { value: "google", label: "Google Gemini", hint: "Gemini models", icon: "/provider-logos/google-gemini.svg" },
] as const;

export function AIConnectionForm({ returnTo = "/onboarding/company", initialProvider = "anthropic", initialModel, currentPreview, recoveryReason }: { returnTo?: string; initialProvider?: string; initialModel?: string | null; currentPreview?: string | null; recoveryReason?: "model" | null }) {
  const router = useRouter();
  const [provider, setProvider] = useState(initialProvider);
  const initialDefinition = providers.find((item) => item.value === initialProvider) ?? providers[0];
  const [model, setModel] = useState(initialModel || getRecommendedModel(initialDefinition.value));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const selectedDefinition = providers.find((item) => item.value === provider) ?? providers[0];
  const canReuseSavedKey = Boolean(currentPreview && provider === initialProvider);

  function selectProvider(value: string) {
    const definition = providers.find((item) => item.value === value) ?? providers[0];
    setProvider(definition.value);
    setModel(definition.value === initialProvider && initialModel ? initialModel : getRecommendedModel(definition.value));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const apiKey = String(data.get("apiKey") ?? "").trim();
      const response = await fetch("/api/llm/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider, apiKey: apiKey || undefined, model }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "The provider could not be connected.");
      router.push(returnTo);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The provider could not be connected.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="ai-connection-form rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl shadow-2xl text-slate-100">
      <span className="text-xs font-bold uppercase tracking-widest text-purple-400">BRING YOUR OWN AI</span>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Connect your preferred provider.</h2>
      <p className="mt-3 text-xs leading-relaxed text-slate-400">
        {recoveryReason === "model"
          ? "Choose a model that supports long structured reports. Your saved key stays encrypted and will be reused for validation."
          : `We make one live request to verify the key and structured-output support. Once accepted, it is encrypted and used only for your workspace.${currentPreview ? ` Current key: ${currentPreview}` : ""}`}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            Choose Provider
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="LLM provider">
            {providers.map((item) => (
              <button
                className={`ai-provider-option flex min-h-[84px] items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all ${
                  provider === item.value
                    ? "border-purple-500 bg-purple-950/20 shadow-md shadow-purple-500/10 ring-1 ring-purple-500/50"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                }`}
                type="button"
                role="radio"
                aria-checked={provider === item.value}
                onClick={() => selectProvider(item.value)}
                key={item.value}
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white/10 p-2 border border-white/10">
                  <Image src={item.icon} alt={`${item.label} logo`} width={28} height={28} className="size-full object-contain" />
                </div>
                <div className="min-w-0">
                  <strong className="block text-xs font-bold text-white">{item.label}</strong>
                  <small className="block text-[11px] leading-4 text-purple-300 font-medium">{item.hint}</small>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="api-key" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            API Key
          </label>
          <input
            id="api-key"
            name="apiKey"
            type="password"
            autoComplete="off"
            required={!canReuseSavedKey}
            minLength={10}
            placeholder={canReuseSavedKey ? `Leave blank to reuse ${currentPreview}` : "Paste your provider key"}
            className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-white/[0.05] px-4 font-mono text-xs text-white placeholder-slate-500 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
          {canReuseSavedKey && <p className="mt-1.5 text-[11px] text-slate-400">Your saved key will be reused unless you enter a replacement.</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="model" className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Model
            </label>
            <button
              type="button"
              onClick={() => setModel(getRecommendedModel(selectedDefinition.value))}
              className="text-[11px] text-purple-400 hover:text-purple-300 font-medium"
            >
              Use recommended
            </button>
          </div>
          <AIModelSelect id="model" provider={provider} value={model} onChange={setModel} />
          <p className="mt-1.5 text-[11px] text-slate-400">
            Recommended: <span className="text-purple-300 font-mono">{getRecommendedModel(selectedDefinition.value)}</span>
            {provider === "openrouter" ? " &bull; Free models may not support long structured reports." : ""}
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300" role="alert">
            {error}
          </div>
        )}

        <button
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:bg-purple-500 disabled:opacity-50 cursor-pointer"
          type="submit"
          disabled={pending}
        >
          <span>{pending ? "Verifying with provider…" : "Verify and continue"}</span>
          <span>&rarr;</span>
        </button>

        <p className="text-center text-[11px] text-slate-500">
          Your key is sent directly from our server to the selected provider for validation.
        </p>
      </form>
    </div>
  );
}
