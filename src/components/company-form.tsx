"use client";

import { FormEvent, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BorderBeam } from "@/components/ui/border-beam";
import {
  Globe,
  UploadCloud,
  FileText,
  Trash2,
  Paperclip,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Target,
  Sparkles,
  Check,
} from "lucide-react";
import {
  COMMON_GEOGRAPHIES,
  COMMON_MARKETING_GOALS,
  COMMON_AUDIENCE_SEGMENTS,
  MarketingStrategyBrief,
} from "@/lib/marketing-brief/types";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function CompanyForm({ additional = false }: { additional?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [requiresProvider, setRequiresProvider] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Marketing & Document State
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [primaryGeo, setPrimaryGeo] = useState<string>("North America (US & Canada)");
  const [secondaryGeos, setSecondaryGeos] = useState<string[]>(["United Kingdom", "Western Europe (DACH & UK)"]);
  const [priorityNotes, setPriorityNotes] = useState("");
  const [selectedAudience, setSelectedAudience] = useState<string[]>([
    "B2B Mid-Market (100–999 emp)",
  ]);
  const [valueProp, setValueProp] = useState("");
  const [differentiator, setDifferentiator] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "Inbound Pipeline & Lead Generation",
    "SEO & Organic Search Dominance",
  ]);

  const handleFilesAdded = (newFiles: FileList | File[]) => {
    const valid: File[] = [];
    const maxBytes = 15 * 1024 * 1024;
    let errorMessage = "";

    Array.from(newFiles).forEach((file) => {
      if (file.size > maxBytes) {
        errorMessage = `${file.name} exceeds the 15MB limit.`;
      } else if (files.length + valid.length >= 10) {
        errorMessage = "You can upload up to 10 source documents.";
      } else {
        valid.push(file);
      }
    });

    if (errorMessage) setError(errorMessage);
    else setError("");
    if (valid.length > 0) setFiles((prev) => [...prev, ...valid]);
  };

  const toggleGoal = (g: string) => {
    setSelectedGoals((prev) => (prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]));
  };

  const toggleAudience = (a: string) => {
    setSelectedAudience((prev) => (prev.includes(a) ? prev.filter((item) => item !== a) : [...prev, a]));
  };

  const toggleSecondaryGeo = (geo: string) => {
    setSecondaryGeos((prev) => (prev.includes(geo) ? prev.filter((g) => g !== geo) : [...prev, geo]));
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setRequiresProvider(false);

    const form = new FormData(event.currentTarget);
    const companyName = String(form.get("companyName") ?? "").trim();
    const websiteUrl = String(form.get("websiteUrl") ?? "").trim();

    try {
      const formData = new FormData();
      formData.append("companyName", companyName);
      formData.append("websiteUrl", websiteUrl);

      const brief: MarketingStrategyBrief = {
        targetGeographies: {
          primary: primaryGeo,
          secondary: secondaryGeos,
          priorityNotes: priorityNotes.trim() || undefined,
        },
        targetAudience: {
          segments: selectedAudience,
          buyerPersonas: [],
        },
        positioning: {
          valueProposition: valueProp.trim() || undefined,
          keyDifferentiator: differentiator.trim() || undefined,
        },
        competitors: competitors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        marketingGoals: selectedGoals,
      };

      formData.append("marketingBrief", JSON.stringify(brief));

      for (const file of files) {
        formData.append("files", file);
      }

      const response = await fetch("/api/companies", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { error?: string; jobId?: string; requiresProvider?: boolean };
      setRequiresProvider(Boolean(data.requiresProvider));
      if (!response.ok || !data.jobId) throw new Error(data.error ?? "The company could not be added.");
      router.push(`/onboarding/audit/${data.jobId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The company could not be added.");
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl shadow-2xl text-slate-100">
      <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
        {additional ? "NEW COMPANY WORKSPACE" : "COMPANY FOUNDATION"}
      </span>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {additional ? "Add another company" : "Where should we start?"}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">
        Add the company website. KREV AI will crawl its public pages and synthesize your custom documents & marketing priorities in parallel.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-6">
        <div>
          <label htmlFor="company-name" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Company name
          </label>
          <input
            id="company-name"
            name="companyName"
            placeholder="Acme, Inc."
            autoComplete="organization"
            required
            minLength={2}
            className="mt-2 h-12 w-full rounded-xl border border-white/15 !bg-transparent px-4 text-sm text-white placeholder-slate-400 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            style={{ backgroundColor: "transparent" }}
          />
        </div>

        <div>
          <label htmlFor="website-url" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Company website URL
          </label>
          <div className="relative mt-2">
            <BorderBeam size="md" colorVariant="colorful" borderRadius={16} className="w-full">
              <div className="group/field relative flex w-full items-center rounded-2xl border border-white/15 bg-[#0d0d16]/40 p-1 backdrop-blur-2xl transition-all hover:bg-[#0d0d16]/50 focus-within:border-purple-400/50 focus-within:bg-[#0d0d16]/60 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)]">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl">
                  <div className="absolute -top-3 -left-3 size-12 rounded-full bg-purple-500/25 blur-md" />
                  <div className="absolute -top-3 -right-3 size-12 rounded-full bg-indigo-500/20 blur-md" />
                  <div className="absolute -bottom-3 -left-3 size-12 rounded-full bg-purple-600/20 blur-md" />
                  <div className="absolute -bottom-3 -right-3 size-12 rounded-full bg-cyan-400/25 blur-md" />
                </div>

                <div className="pointer-events-none relative z-10 pl-3 pr-2 text-purple-400 flex items-center">
                  <Globe className="size-4.5" />
                </div>

                <input
                  id="website-url"
                  name="websiteUrl"
                  type="text"
                  inputMode="url"
                  placeholder="Enter your website URL (e.g. stripe.com)"
                  autoComplete="url"
                  required
                  className="relative z-10 h-11 w-full flex-1 border-0 !bg-transparent px-2 text-sm text-white placeholder-slate-400 outline-none transition-all"
                  style={{ backgroundColor: "transparent" }}
                />
              </div>
            </BorderBeam>
          </div>
        </div>

        {/* Collapsible / Expandable Marketing & Custom Docs */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-between text-left text-xs font-semibold text-purple-300 hover:text-purple-200 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 text-purple-400" />
              Target Geography, Custom Documents & Strategy (Optional)
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              {files.length > 0 && `(${files.length} docs attached) `}
              {showAdvanced ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </span>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-6 pt-4 border-t border-white/10 text-xs">
              {/* Document Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Custom Company Documents (Pitch decks, ICP docs, collateral)
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files?.length) handleFilesAdded(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-all ${
                    dragActive
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-white/15 bg-white/[0.02] hover:border-purple-400/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.pptx,.xlsx,.txt,.md,.csv,.tsv,.json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) handleFilesAdded(e.target.files);
                    }}
                  />
                  <UploadCloud className="size-6 text-purple-400" />
                  <span className="mt-1 font-semibold text-white">Click to browse or drop documents</span>
                  <span className="text-[10px] text-slate-400">PDF, Word, PPTX, Excel, Markdown (up to 15MB)</span>
                </div>

                {files.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {files.map((file, idx) => (
                      <div
                        key={file.name + idx}
                        className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5 text-[11px]"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="size-3.5 text-purple-400 shrink-0" />
                          <span className="truncate text-white">{file.name}</span>
                          <span className="text-slate-400">({formatBytes(file.size)})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Target Geography */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300">
                  Tier 1 Primary Market (Priority Target)
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {COMMON_GEOGRAPHIES.slice(0, 6).map((geo) => (
                    <button
                      key={geo}
                      type="button"
                      onClick={() => setPrimaryGeo(geo)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium cursor-pointer ${
                        primaryGeo === geo
                          ? "border-purple-500 bg-purple-600/30 text-white ring-1 ring-purple-500/50"
                          : "border-white/10 bg-white/5 text-slate-300"
                      }`}
                    >
                      {primaryGeo === geo && <Check className="inline-block size-3 mr-1" />}
                      {geo}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={primaryGeo}
                  onChange={(e) => setPrimaryGeo(e.target.value)}
                  placeholder="Or enter custom geography"
                  className="mt-2 h-9 w-full rounded-xl border border-white/15 !bg-transparent px-3 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              {/* Secondary Geographies */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Tier 2 Secondary Markets
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {COMMON_GEOGRAPHIES.slice(0, 7)
                    .filter((g) => g !== primaryGeo)
                    .map((geo) => (
                      <button
                        key={geo}
                        type="button"
                        onClick={() => toggleSecondaryGeo(geo)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium cursor-pointer ${
                          secondaryGeos.includes(geo)
                            ? "border-indigo-500 bg-indigo-600/30 text-white"
                            : "border-white/10 bg-white/5 text-slate-400"
                        }`}
                      >
                        {secondaryGeos.includes(geo) && <Check className="inline-block size-3 mr-1" />}
                        {geo}
                      </button>
                    ))}
                </div>
              </div>

              {/* Key Competitors */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Known Competitors (Comma-separated)
                </label>
                <input
                  type="text"
                  value={competitors}
                  onChange={(e) => setCompetitors(e.target.value)}
                  placeholder="e.g. Acme, Competitor B, Competitor C"
                  className="mt-2 h-9 w-full rounded-xl border border-white/15 !bg-transparent px-3 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              {/* Marketing Objectives */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Strategic Goals
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {COMMON_MARKETING_GOALS.slice(0, 5).map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium cursor-pointer ${
                        selectedGoals.includes(goal)
                          ? "border-purple-500 bg-purple-600/30 text-white"
                          : "border-white/10 bg-white/5 text-slate-400"
                      }`}
                    >
                      {selectedGoals.includes(goal) && <Check className="inline-block size-3 mr-1" />}
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300" role="alert">
            {error}
          </div>
        )}

        {requiresProvider && (
          <Link
            className="block text-center text-xs font-semibold text-purple-400 hover:text-purple-300"
            href="/settings/credits"
          >
            Connect provider &rarr;
          </Link>
        )}

        <button
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:bg-purple-500 disabled:opacity-50 cursor-pointer"
          type="submit"
          disabled={pending}
        >
          {pending && (
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          <span>{pending ? "Starting secure audit…" : additional ? "Add and analyze company" : "Analyze my company"}</span>
          <span>&rarr;</span>
        </button>

        <p className="text-center text-xs text-slate-400">
          Usually takes 1–3 minutes. Grounded in your custom documents and priority geographies.
        </p>
      </form>
    </div>
  );
}

