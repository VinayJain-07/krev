"use client";

import * as React from "react";
import { ArrowRight, RotateCcw, SlidersHorizontal } from "lucide-react";

type ScoreLab = {
  kind: "score";
  title: string;
  intro: string;
  factors: readonly { label: string; hint: string }[];
};

type VisibilityLab = { kind: "visibility"; title: string; intro: string };

type AuditLab = {
  kind: "audit";
  title: string;
  intro: string;
  checks: readonly { label: string; action: string }[];
};

type ScenarioLab = {
  kind: "scenario";
  title: string;
  intro: string;
  unit: string;
  period: string;
  baselineLabel: string;
  proposedLabel: string;
  volumeLabel: string;
  overheadLabel: string;
  defaults: readonly [number, number, number, number];
};

type PerformanceLab = { kind: "performance"; title: string; intro: string };
type JobLab = { kind: "job"; title: string; intro: string };
type LabConfig = ScoreLab | VisibilityLab | AuditLab | ScenarioLab | PerformanceLab | JobLab;

const LABS: Record<number, LabConfig> = {
  1: { kind: "visibility", title: "Build a small answer-visibility panel", intro: "Change the counts to see how mentions, links, and accurate citations tell different stories. Use your own repeated query observations, not a market estimate." },
  2: { kind: "score", title: "Qualify a public buying signal", intro: "Move the evidence sliders for a conversation you have reviewed. The result is an illustrative triage aid, not permission to contact someone or a validated lead model.", factors: [
    { label: "Buyer and workflow fit", hint: "Is the situation relevant to the offer?" },
    { label: "Specificity of need", hint: "Does the person describe a concrete problem?" },
    { label: "Timing", hint: "Is there evidence of an active decision?" },
    { label: "Evidence confidence", hint: "Can a reviewer inspect the full context?" },
  ] },
  3: { kind: "audit", title: "Check a handoff before it runs", intro: "Mark the controls you have in place. The next open gate becomes the first item to resolve with the campaign owner.", checks: [
    { label: "Approved facts have owners and dates", action: "Assign an owner and review date to each product or pricing claim." },
    { label: "The specialist receives a scoped brief", action: "Remove irrelevant pages and pass only task-specific evidence." },
    { label: "Unknowns stay explicit", action: "Add an unknown field rather than letting a draft fill gaps by inference." },
    { label: "Output links back to source facts", action: "Require a source reference for every substantive claim." },
    { label: "A human checks the final adaptation", action: "Name the reviewer responsible for channel fit and accuracy." },
  ] },
  4: { kind: "scenario", title: "Explore campaign handoff effort", intro: "Enter hypothetical planning hours to compare a fragmented process with a shared-brief process. This estimates time only; it does not predict savings for a real company.", unit: "hours", period: "quarter", baselineLabel: "Current hours per campaign", proposedLabel: "Planned hours per campaign", volumeLabel: "Campaigns per quarter", overheadLabel: "Extra review hours per quarter", defaults: [24, 16, 4, 12] },
  5: { kind: "audit", title: "Walk through a crawler-access check", intro: "Mark each layer only after inspecting a real URL and a specific user agent. Access and inclusion are separate outcomes.", checks: [
    { label: "The intended bot policy is documented", action: "Decide which provider and crawler purpose your organization permits." },
    { label: "Robots rules match that policy", action: "Test the live robots file against the exact user agent and URL." },
    { label: "The URL returns the expected content", action: "Inspect status, redirects, authentication, and rendered HTML." },
    { label: "WAF and logs agree with the test", action: "Check edge rules and request logs before changing security controls." },
    { label: "Markup matches visible page facts", action: "Compare structured data with what a visitor can read." },
  ] },
  6: { kind: "scenario", title: "Explore tutorial production capacity", intro: "Compare editorial effort at two processes and include the monthly verification work. Time released is only useful if tutorials still run correctly.", unit: "minutes", period: "month", baselineLabel: "Current minutes per tutorial", proposedLabel: "Planned minutes per tutorial", volumeLabel: "Tutorials per month", overheadLabel: "Extra QA minutes per month", defaults: [240, 170, 8, 180] },
  7: { kind: "scenario", title: "Explore board-report preparation", intro: "Model preparation time for a repeatable reporting cycle. Keep anomaly review and narrative judgment in the planned time.", unit: "hours", period: "year", baselineLabel: "Current hours per deck", proposedLabel: "Planned hours per deck", volumeLabel: "Decks per year", overheadLabel: "Extra validation hours per year", defaults: [24, 15, 4, 12] },
  8: { kind: "visibility", title: "Compare answer observations", intro: "Use counts from a fixed question panel. A named brand, linked source, and accurate linked claim are three different observations." },
  9: { kind: "audit", title: "Check entity clarity on a product page", intro: "Mark what a reader can verify in the rendered page and its markup. The count is an editorial checklist, not a search-engine score.", checks: [
    { label: "Product identity is explicit", action: "Name the product and organization consistently in visible copy." },
    { label: "Audience and use case are concrete", action: "Explain who the page serves and what task they need to complete." },
    { label: "Capabilities are current and qualified", action: "Confirm plan, region, and release limitations with product." },
    { label: "Important claims have visible proof", action: "Link to current docs, examples, or approved evidence." },
    { label: "JSON-LD agrees with the page", action: "Remove stale or unsupported properties from the template." },
  ] },
  10: { kind: "audit", title: "Test a case-study claim", intro: "Check a proposed outcome before publication. A complete ladder needs evidence and customer permission, not just a compelling number.", checks: [
    { label: "The customer approved the story", action: "Confirm permissions, anonymity, quotations, and final review owner." },
    { label: "The starting condition is documented", action: "Record the baseline and its measurement period." },
    { label: "The implementation is described", action: "Show what changed and when it was introduced." },
    { label: "The outcome has units and dates", action: "Use comparable periods and explain the data source." },
    { label: "The interpretation names limitations", action: "Distinguish observed change from a causal conclusion." },
  ] },
  11: { kind: "score", title: "Try an explainable intent rubric", intro: "Adjust four dimensions for a sample conversation. Equal weights are illustrative; calibrate any real rubric against labeled outcomes before using it to route work.", factors: [
    { label: "Account and workflow fit", hint: "Does this team plausibly need the solution?" },
    { label: "Specificity of need", hint: "Is there a stated problem or requirement?" },
    { label: "Decision timing", hint: "Is evaluation active rather than hypothetical?" },
    { label: "Evidence confidence", hint: "Is the source direct, recent, and in context?" },
  ] },
  12: { kind: "audit", title: "Review a cross-channel voice system", intro: "Mark the governance elements you can demonstrate with actual copy samples. The result is a review list, not a tone-consistency percentage.", checks: [
    { label: "Voice traits have before-and-after examples", action: "Turn abstract adjectives into observable editorial choices." },
    { label: "Approved product facts are separate", action: "Give product claims an owner independent of the style guide." },
    { label: "Each channel has suitable examples", action: "Show how the same voice adapts to documentation, email, and social." },
    { label: "Editors sample real outputs", action: "Compare judgments on a small set of drafts or published pieces." },
    { label: "Recurring corrections feed the guide", action: "Add repeated edits as approved and rejected examples." },
  ] },
  13: { kind: "audit", title: "Validate a positioning gap", intro: "Tick a gate when you have evidence. A missing competitor phrase alone is not a validated market opportunity.", checks: [
    { label: "Buyers have described the need", action: "Collect interviews, evaluation criteria, or repeated sales objections." },
    { label: "Competitor claims are dated and sourced", action: "Inspect relevant pages and documentation, not only homepages." },
    { label: "Your product can deliver the difference", action: "Get a current capability review from product." },
    { label: "The claim has public proof", action: "Prepare a demo, guide, or approved customer example." },
    { label: "The message has been tested", action: "Ask buyers whether this difference changes their decision." },
  ] },
  14: { kind: "performance", title: "Try a Core Web Vitals triage", intro: "Enter 75th-percentile field values for one device segment. This compares them with current recommended thresholds; it does not run a Lighthouse audit." },
  15: { kind: "scenario", title: "Explore repeated token use", intro: "Compare a current and proposed run, then add any extra context or retry overhead. Check accepted-output quality before adopting a lower-cost setup.", unit: "thousand tokens", period: "month", baselineLabel: "Current thousand tokens per run", proposedLabel: "Planned thousand tokens per run", volumeLabel: "Runs per month", overheadLabel: "Extra thousand tokens per month", defaults: [60, 42, 30, 90] },
  16: { kind: "job", title: "Draft a buyer job statement", intro: "Fill in a real situation, desired progress, outcome, and worry. The statement is a research hypothesis until buyers confirm it." },
};

const inputClass = "mt-2 w-full rounded-xl border border-white/15 bg-[#0b0b14] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20";

function LabShell({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <section id="interactive-lab" className="mt-16 scroll-mt-28 overflow-hidden rounded-[28px] border border-fuchsia-400/25 bg-[#11101c] shadow-[0_25px_80px_-50px_rgba(192,38,211,0.35)]">
      <div className="border-b border-white/10 bg-gradient-to-r from-fuchsia-950/45 via-violet-950/25 to-transparent px-6 py-6 sm:px-8">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-fuchsia-300"><SlidersHorizontal className="size-3.5" /> Interactive lab</span>
        <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{intro}</p>
      </div>
      <div className="p-6 sm:p-8">{children}</div>
    </section>
  );
}

function ResultBar({ value, label }: { value: number; label: string }) {
  return <div className="h-2 overflow-hidden rounded-full bg-white/10" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-[width] duration-300" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

function ScoreWorksheet({ config }: { config: ScoreLab }) {
  const [values, setValues] = React.useState([2, 2, 2, 2]);
  const total = values.reduce((sum, value) => sum + value, 0) * 5;
  const weakest = values.indexOf(Math.min(...values));
  const status = values[3] < 3 ? "Verify the source first" : total >= 75 ? "Review as a priority" : total >= 50 ? "Research the missing context" : "Keep in research";

  return <LabShell title={config.title} intro={config.intro}>
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div className="space-y-6">
        {config.factors.map((factor, index) => <div key={factor.label}>
          <div className="flex items-center justify-between gap-3"><label htmlFor={`score-${index}`} className="text-sm font-semibold text-white">{factor.label}</label><span className="rounded-lg bg-fuchsia-500/15 px-2 py-1 text-xs font-semibold text-fuchsia-200">{values[index]} / 5</span></div>
          <p className="mt-1 text-xs text-slate-400">{factor.hint}</p>
          <input id={`score-${index}`} type="range" min="0" max="5" step="1" value={values[index]} onChange={(event) => setValues((current) => current.map((value, i) => i === index ? Number(event.target.value) : value))} className="mt-3 w-full accent-fuchsia-400" />
          <div className="flex justify-between text-[10px] text-slate-500"><span>No evidence</span><span>Strong evidence</span></div>
        </div>)}
      </div>
      <div className="self-start rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/[0.06] p-5" aria-live="polite">
        <p className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-300">Illustrative total</p>
        <p className="mt-2 text-4xl font-bold text-white">{total}<span className="ml-1 text-base font-normal text-slate-400">/ 100</span></p>
        <div className="mt-4"><ResultBar value={total} label="Illustrative evidence total" /></div>
        <p className="mt-5 text-sm font-semibold text-white">{status}</p>
        <p className="mt-2 text-xs leading-5 text-slate-400">First inspect: {config.factors[weakest].label.toLowerCase()}. A human should read the original conversation before deciding what, if anything, to do.</p>
        <button type="button" onClick={() => setValues([2, 2, 2, 2])} className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-fuchsia-300 hover:text-white"><RotateCcw className="size-3.5" /> Reset example</button>
      </div>
    </div>
  </LabShell>;
}

function VisibilityWorksheet({ config }: { config: VisibilityLab }) {
  const [counts, setCounts] = React.useState({ questions: 12, mentioned: 5, cited: 3, accurate: 2 });
  const update = (key: keyof typeof counts, value: number) => {
    const next = { ...counts, [key]: Math.max(key === "questions" ? 1 : 0, Math.min(500, value || 0)) };
    next.mentioned = Math.min(next.mentioned, next.questions);
    next.cited = Math.min(next.cited, next.mentioned);
    next.accurate = Math.min(next.accurate, next.cited);
    setCounts(next);
  };
  const fields: { key: keyof typeof counts; label: string; help: string }[] = [
    { key: "questions", label: "Questions tested", help: "Repeated prompts in one fixed panel" },
    { key: "mentioned", label: "Brand mentioned", help: "Named anywhere in the answer" },
    { key: "cited", label: "Owned page cited", help: "A link to your source page" },
    { key: "accurate", label: "Citation supports claim", help: "The linked page verifies the answer" },
  ];
  return <LabShell title={config.title} intro={config.intro}>
    <div className="grid gap-6 sm:grid-cols-2">
      {fields.map((field) => <label key={field.key} className="text-sm font-semibold text-white">{field.label}<span className="mt-1 block text-xs font-normal text-slate-400">{field.help}</span><input className={inputClass} type="number" min={field.key === "questions" ? 1 : 0} max={field.key === "questions" ? 500 : counts[field.key === "mentioned" ? "questions" : field.key === "cited" ? "mentioned" : "cited"]} value={counts[field.key]} onChange={(event) => update(field.key, Number(event.target.value))} /></label>)}
    </div>
    <div className="mt-7 grid gap-3 sm:grid-cols-3" aria-live="polite">
      {([ ["Mention rate", counts.mentioned], ["Citation rate", counts.cited], ["Accurate citation rate", counts.accurate] ] as const).map(([label, count]) => {
        const rate = Math.round(count / counts.questions * 100);
        return <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-white">{rate}%</p><p className="mb-3 text-xs text-slate-500">{count} of {counts.questions} questions</p><ResultBar value={rate} label={label} /></div>;
      })}
    </div>
    <p className="mt-5 text-xs leading-5 text-slate-400">These are descriptive rates for the questions you entered. Keep the raw answers and avoid treating a small panel as a market-wide estimate.</p>
  </LabShell>;
}

function AuditWorksheet({ config }: { config: AuditLab }) {
  const [checked, setChecked] = React.useState<boolean[]>(() => config.checks.map(() => false));
  const count = checked.filter(Boolean).length;
  const next = checked.findIndex((value) => !value);
  return <LabShell title={config.title} intro={config.intro}>
    <div className="space-y-2">
      {config.checks.map((check, index) => <label key={check.label} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4 transition-colors hover:border-fuchsia-400/30">
        <input type="checkbox" checked={checked[index]} onChange={() => setChecked((current) => current.map((value, i) => i === index ? !value : value))} className="mt-0.5 size-4 shrink-0 accent-fuchsia-400" />
        <span className="text-sm leading-6 text-slate-200">{check.label}</span>
      </label>)}
    </div>
    <div className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/[0.06] p-5" aria-live="polite">
      <div className="mb-3 flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">Evidence gates checked</span><span className="text-sm font-semibold text-white">{count} / {config.checks.length}</span></div>
      <ResultBar value={count / config.checks.length * 100} label="Evidence gates checked" />
      <p className="mt-4 text-sm font-semibold text-white">{next === -1 ? "Ready for a human review" : "Next: " + config.checks[next].label}</p>
      <p className="mt-1 text-xs leading-5 text-slate-400">{next === -1 ? "Confirm each item against source evidence before publishing or acting." : config.checks[next].action}</p>
      <button type="button" onClick={() => setChecked(config.checks.map(() => false))} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-fuchsia-300 hover:text-white"><RotateCcw className="size-3.5" /> Clear checks</button>
    </div>
  </LabShell>;
}

function ScenarioWorksheet({ config }: { config: ScenarioLab }) {
  const [values, setValues] = React.useState<number[]>([...config.defaults]);
  const [baseline, proposed, volume, overhead] = values;
  const currentTotal = baseline * volume;
  const plannedTotal = proposed * volume + overhead;
  const difference = currentTotal - plannedTotal;
  const labels = [config.baselineLabel, config.proposedLabel, config.volumeLabel, config.overheadLabel];
  return <LabShell title={config.title} intro={config.intro}>
    <div className="grid gap-4 sm:grid-cols-2">
      {labels.map((label, index) => <label key={label} className="text-sm font-semibold text-white">{label}<input className={inputClass} type="number" min="0" max="1000000" value={values[index]} onChange={(event) => setValues((current) => current.map((value, i) => i === index ? Math.max(0, Math.min(1000000, Number(event.target.value) || 0)) : value))} /></label>)}
    </div>
    <div className="mt-7 grid gap-3 sm:grid-cols-3" aria-live="polite">
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs text-slate-400">Current total / {config.period}</p><p className="mt-2 text-2xl font-bold text-white">{currentTotal.toLocaleString()}</p><p className="text-xs text-slate-500">{config.unit}</p></div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs text-slate-400">Planned total / {config.period}</p><p className="mt-2 text-2xl font-bold text-white">{plannedTotal.toLocaleString()}</p><p className="text-xs text-slate-500">{config.unit}, including overhead</p></div>
      <div className="rounded-2xl border border-fuchsia-400/25 bg-fuchsia-500/[0.08] p-4"><p className="text-xs text-fuchsia-300">Illustrative difference</p><p className="mt-2 text-2xl font-bold text-white">{Math.abs(difference).toLocaleString()}</p><p className="text-xs text-slate-400">{config.unit} {difference >= 0 ? "released" : "added"} / {config.period}</p></div>
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="max-w-xl text-xs leading-5 text-slate-400">This is arithmetic on your inputs, not a forecast. Include quality, corrections, and adoption in the real decision.</p><button type="button" onClick={() => setValues([...config.defaults])} className="inline-flex items-center gap-1.5 text-xs font-semibold text-fuchsia-300 hover:text-white"><RotateCcw className="size-3.5" /> Reset example</button></div>
  </LabShell>;
}

function PerformanceWorksheet({ config }: { config: PerformanceLab }) {
  const [values, setValues] = React.useState([2.8, 260, 0.14]);
  const metrics = [
    { label: "LCP", unit: "seconds", threshold: 2.5, step: 0.1, hint: "Main content loading" },
    { label: "INP", unit: "milliseconds", threshold: 200, step: 10, hint: "Interaction responsiveness" },
    { label: "CLS", unit: "score", threshold: 0.1, step: 0.01, hint: "Visual stability" },
  ];
  const priority = metrics.reduce((worst, metric, index) => values[index] / metric.threshold > values[worst] / metrics[worst].threshold ? index : worst, 0);
  return <LabShell title={config.title} intro={config.intro}>
    <div className="grid gap-3 sm:grid-cols-3">
      {metrics.map((metric, index) => <label key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-white">{metric.label}<span className="mt-1 block text-xs font-normal text-slate-400">{metric.hint}</span><input type="number" min="0" max="10000" step={metric.step} value={values[index]} onChange={(event) => setValues((current) => current.map((value, i) => i === index ? Math.max(0, Number(event.target.value) || 0) : value))} className={inputClass} /><span className="mt-2 block text-xs font-normal text-slate-500">Recommended: ≤ {metric.threshold} {metric.unit}</span></label>)}
    </div>
    <div className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/[0.06] p-5" aria-live="polite">
      <div className="flex flex-wrap gap-2">{metrics.map((metric, index) => <span key={metric.label} className={`rounded-full px-3 py-1 text-xs font-semibold ${values[index] <= metric.threshold ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>{metric.label}: {values[index] <= metric.threshold ? "on target" : "above target"}</span>)}</div>
      <p className="mt-4 text-sm font-semibold text-white">{metrics.every((metric, index) => values[index] <= metric.threshold) ? "All entered values meet the recommended thresholds" : `Investigate ${metrics[priority].label} first, then check the other affected metrics.`}</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">Use 75th-percentile field values split by device. Lab Lighthouse runs cannot directly measure field INP. Thresholds follow <a href="https://web.dev/articles/vitals" target="_blank" rel="noopener noreferrer" className="text-fuchsia-300 underline underline-offset-2">web.dev&apos;s Core Web Vitals guidance</a>.</p>
    </div>
  </LabShell>;
}

function JobWorksheet({ config }: { config: JobLab }) {
  const [fields, setFields] = React.useState({ situation: "preparing a quarterly board report", progress: "trace recommendations to evidence", outcome: "explain the investment decision clearly", anxiety: "an automated summary might hide assumptions" });
  const entries: { key: keyof typeof fields; label: string }[] = [ { key: "situation", label: "When..." }, { key: "progress", label: "I want to..." }, { key: "outcome", label: "So I can..." }, { key: "anxiety", label: "But I worry that..." } ];
  return <LabShell title={config.title} intro={config.intro}>
    <div className="grid gap-4 sm:grid-cols-2">{entries.map(({ key, label }) => <label key={key} className="text-sm font-semibold text-white">{label}<input type="text" maxLength={180} className={inputClass} value={fields[key]} onChange={(event) => setFields((current) => ({ ...current, [key]: event.target.value }))} /></label>)}</div>
    <div className="mt-6 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/[0.06] p-5" aria-live="polite"><p className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-300">Draft job statement</p><p className="mt-3 text-base leading-7 text-white">When {fields.situation || "[situation]"}, I want to {fields.progress || "[progress]"} so I can {fields.outcome || "[outcome]"}.</p><p className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-300"><ArrowRight className="mt-1 size-4 shrink-0 text-fuchsia-300" />Proof to investigate: {fields.anxiety || "[buyer anxiety]"}.</p></div>
    <p className="mt-4 text-xs leading-5 text-slate-400">Compare this wording with interview notes. Do not publish an invented buyer quote as research.</p>
  </LabShell>;
}

export function BlogInteractiveLab({ postId }: { postId: number }) {
  const config = LABS[postId];
  if (!config) return null;
  switch (config.kind) {
    case "score": return <ScoreWorksheet config={config} />;
    case "visibility": return <VisibilityWorksheet config={config} />;
    case "audit": return <AuditWorksheet config={config} />;
    case "scenario": return <ScenarioWorksheet config={config} />;
    case "performance": return <PerformanceWorksheet config={config} />;
    case "job": return <JobWorksheet config={config} />;
  }
}
