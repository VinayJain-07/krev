"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Loader2, Sparkles, Target, TriangleAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CULTURAL_CATEGORIES } from "@/lib/qloo/catalog";
import type { QlooEntity, QlooEntityType, QlooInsight } from "@/lib/qloo/types";

type Result = {
  seeds: QlooEntity[];
  recommendations: Array<{ category: QlooEntityType; insights: QlooInsight[] }>;
  synthesisInputs: { campaignGoal: string; audience: string; geography?: string; evidenceCount: number; groundedBy: string };
  planDraft?: string | null;
};

export function CulturalIntelligencePanel({ companyId, companyName }: { companyId: string; companyName: string }) {
  const [campaignGoal, setCampaignGoal] = useState("Launch a campaign people will remember and share");
  const [audience, setAudience] = useState("");
  const [geography, setGeography] = useState("");
  const [seedInput, setSeedInput] = useState("");
  const [seeds, setSeeds] = useState<string[]>([]);
  const [categories, setCategories] = useState<QlooEntityType[]>(["brand", "artist", "place"]);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const selectedLabels = useMemo(() => new Map(CULTURAL_CATEGORIES.map((category) => [category.value, category.label])), []);
  const addSeed = () => {
    const value = seedInput.trim();
    if (value && !seeds.includes(value) && seeds.length < 5) setSeeds((items) => [...items, value]);
    setSeedInput("");
  };

  const runAnalysis = async () => {
    setError(null);
    setResult(null);
    setRunning(true);
    try {
      const response = await fetch("/api/cultural-intelligence/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, campaignGoal, audience, geography: geography || undefined, seedQueries: seeds, categories }),
      });
      const body = await response.json().catch(() => null) as { ok?: boolean; error?: string } & Partial<Result>;
      if (!response.ok || !body.ok) throw new Error(body.error || "Cultural profile could not be built.");
      setResult(body as Result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Cultural profile could not be built.");
    } finally {
      setRunning(false);
    }
  };

  return <section className="culture-panel">
    <div className="culture-panel-heading"><div><p className="eyebrow">QLOO CULTURAL INTELLIGENCE</p><h1>Make {companyName} feel like it belongs.</h1><p>Ground audience and campaign decisions in cultural affinities across music, film, brands, places, travel, and more. This is evidence for your KREV plan, not generic LLM guesswork.</p></div><div className="culture-mark"><Sparkles size={22} /></div></div>
    <div className="culture-form-grid">
      <label>Campaign goal<input value={campaignGoal} onChange={(event) => setCampaignGoal(event.target.value)} maxLength={240} placeholder="What should this campaign achieve?" /></label>
      <label>Audience<input value={audience} onChange={(event) => setAudience(event.target.value)} maxLength={240} placeholder="e.g. design-conscious first-time homeowners" /></label>
      <label>Geography <span>(optional)</span><input value={geography} onChange={(event) => setGeography(event.target.value)} maxLength={120} placeholder="e.g. Mumbai, India" /></label>
      <label className="culture-seed-label">Cultural seeds <span>(add 1–5)</span><div className="culture-seed-input"><input value={seedInput} onChange={(event) => setSeedInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addSeed(); } }} maxLength={120} placeholder="A brand, artist, film, place…" /><button type="button" onClick={addSeed} disabled={!seedInput.trim() || seeds.length >= 5}>Add</button></div></label>
    </div>
    <div className="culture-seeds" aria-label="Selected cultural seeds">{seeds.map((seed) => <button type="button" key={seed} onClick={() => setSeeds((items) => items.filter((item) => item !== seed))}>{seed} <span aria-hidden="true">×</span></button>)}</div>
    <fieldset className="culture-categories"><legend>What should Qloo connect?</legend><div>{CULTURAL_CATEGORIES.map((category) => <label key={category.value} className={categories.includes(category.value) ? "selected" : ""}><input type="checkbox" checked={categories.includes(category.value)} onChange={() => setCategories((items) => items.includes(category.value) ? items.filter((item) => item !== category.value) : items.length < 4 ? [...items, category.value] : items)} /><span>{category.label}</span>{categories.includes(category.value) && <Check size={14} />}</label>)}</div></fieldset>
    <div className="culture-actions"><p><Target size={15} /> Qloo results are taste-graph signals and should be reviewed with your strategy team.</p><button type="button" className="primary-button" onClick={runAnalysis} disabled={running || !audience.trim() || !campaignGoal.trim() || !seeds.length || !categories.length}>{running ? <><Loader2 className="spin" size={16} /> Building profile…</> : <>Build cultural profile <ArrowRight size={16} /></>}</button></div>
    {error && <div className="culture-error" role="alert"><TriangleAlert size={17} />{error}</div>}
    {result && <div className="culture-results"><div className="culture-result-summary"><div><p className="eyebrow">EVIDENCE READY</p><h2>{result.synthesisInputs.evidenceCount} cultural signals for your next plan</h2><p>These results are ready to feed the KREV audience analysis and campaign synthesis workflow.</p></div><span className="culture-source-badge">Qloo taste graph</span></div><div className="culture-result-seeds"><strong>Resolved seeds</strong>{result.seeds.length ? result.seeds.map((seed) => <span key={seed.id}>{seed.name}</span>) : <em>No matching entities returned.</em>}</div><div className="culture-result-grid">{result.recommendations.map((recommendation) => <article key={recommendation.category}><h3>{selectedLabels.get(recommendation.category) ?? recommendation.category}</h3>{recommendation.insights.length ? recommendation.insights.slice(0, 6).map((insight) => <div className="culture-insight" key={insight.id ?? insight.name}><strong>{insight.name ?? "Unnamed signal"}</strong>{typeof insight.affinity === "number" && <span>{Math.round(insight.affinity * 100)}% affinity</span>}{insight.tags?.length ? <small>{insight.tags.slice(0, 3).join(" · ")}</small> : null}</div>) : <p className="culture-empty">No recommendation signals returned for this category.</p>}</article>)}</div>{result.planDraft && <article className="culture-plan"><div><p className="eyebrow">KREV PLAN DRAFT</p><h2>Qloo-grounded campaign direction</h2><p>Generated from the evidence above with your connected AI provider.</p></div><div className="clean-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{result.planDraft}</ReactMarkdown></div></article>}</div>}
  </section>;
}
