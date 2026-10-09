"use client";

import { getModelOptions } from "@/lib/llm/model-catalog";

const CUSTOM_MODEL = "__custom__";

type AIModelSelectProps = {
  id: string;
  name?: string;
  provider: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
};

export function AIModelSelect({ id, name = "model", provider, value, onChange, required = true, className = "" }: AIModelSelectProps) {
  const options = getModelOptions(provider);
  const knownModel = options.some((option) => option.id === value);
  const selection = knownModel ? value : CUSTOM_MODEL;

  function handleSelection(next: string) {
    if (next === CUSTOM_MODEL) {
      onChange(knownModel ? "" : value);
      return;
    }
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <select
        id={id}
        name={name}
        value={selection}
        onChange={(event) => handleSelection(event.target.value)}
        required={required && selection !== CUSTOM_MODEL}
        className={`ai-model-select-control h-12 w-full appearance-none rounded-xl border border-white/15 bg-white/[0.05] px-4 text-sm font-medium text-white outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 ${className}`}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id} className="bg-slate-900 text-white">
            {option.label} · {option.description}
          </option>
        ))}
        <option value={CUSTOM_MODEL} className="bg-slate-900 text-white">Custom model ID…</option>
      </select>
      {selection === CUSTOM_MODEL && (
        <input
          aria-label="Custom model ID"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          minLength={2}
          maxLength={120}
          placeholder="Enter the provider's model ID"
          className="ai-model-custom-input h-11 w-full rounded-xl border border-white/15 bg-white/[0.05] px-4 font-mono text-xs text-white placeholder-slate-500 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
        />
      )}
    </div>
  );
}
