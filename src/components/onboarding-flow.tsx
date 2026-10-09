"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BorderBeam } from "@/components/ui/border-beam";
import { AIModelSelect } from "@/components/ai-model-select";
import { getRecommendedModel } from "@/lib/llm/model-catalog";
import {
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Key,
  Sparkles,
  Search,
  Bot,
  Compass,
  FileText,
  BarChart3,
  Users,
  Check,
  UploadCloud,
  Trash2,
  Paperclip,
  Target,
} from "lucide-react";
import {
  COMMON_GEOGRAPHIES,
  COMMON_AUDIENCE_SEGMENTS,
  COMMON_BUYER_PERSONAS,
  COMMON_MARKETING_GOALS,
  COMMON_BRAND_VOICES,
  MarketingStrategyBrief,
} from "@/lib/marketing-brief/types";

interface ProviderOption {
  id: string;
  name: string;
  models: string;
  logo: string;
  hint: string;
}

const PROVIDERS: ProviderOption[] = [
  {
    id: "openai",
    name: "OpenAI",
    models: "GPT-5.1, GPT-5 mini, and more",
    logo: "/provider-logos/openai.svg",
    hint: "Fast parallel JSON completion",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: "Claude Opus 5, Sonnet 5, and more",
    logo: "/provider-logos/anthropic.svg",
    hint: "Exceptional strategic reasoning",
  },
  {
    id: "google",
    name: "Google Gemini",
    models: "Gemini 3.8, 3.7, and 3.6 Flash",
    logo: "/provider-logos/google-gemini.svg",
    hint: "Massive context & multimodal",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    models: "Access 100+ routed models",
    logo: "/provider-logos/openrouter.svg",
    hint: "Unified key with smart routing",
  },
];

type VerifiedProvider = { provider: string; preview: string; model: string } | null;

function suggestedName(websiteUrl: string) {
  const hostname = websiteUrl.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0];
  const stem = hostname.split(".")[0] ?? "";
  return stem ? stem.charAt(0).toUpperCase() + stem.slice(1) : "";
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function OnboardingContent({ authenticated, verifiedProvider }: { authenticated: boolean; verifiedProvider: VerifiedProvider }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialUrl = searchParams.get("url") || "";
  const [currentStep, setCurrentStep] = React.useState(authenticated ? 2 : 1);

  // Form State - Step 2 (Company & Website)
  const [url, setUrl] = React.useState(initialUrl);
  const [companyName, setCompanyName] = React.useState("");
  const [accountReady, setAccountReady] = React.useState(authenticated);

  // Form State - Step 3 (Marketing Brief & Custom Documents)
  const [files, setFiles] = React.useState<File[]>([]);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [primaryGeo, setPrimaryGeo] = React.useState<string>("North America (US & Canada)");
  const [secondaryGeos, setSecondaryGeos] = React.useState<string[]>(["United Kingdom", "Western Europe (DACH & UK)"]);
  const [customGeoInput, setCustomGeoInput] = React.useState("");
  const [priorityNotes, setPriorityNotes] = React.useState("");

  const [selectedAudience, setSelectedAudience] = React.useState<string[]>([
    "B2B Mid-Market (100–999 emp)",
    "High-Growth Startups / Scaleups",
  ]);
  const [buyerPersonas, setBuyerPersonas] = React.useState<string[]>([
    "Chief Marketing Officer (CMO)",
    "VP / Head of Growth",
  ]);
  const [corePainPoints, setCorePainPoints] = React.useState("");
  const [valueProposition, setValueProposition] = React.useState("");
  const [keyDifferentiator, setKeyDifferentiator] = React.useState("");
  const [competitors, setCompetitors] = React.useState("");
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([
    "Inbound Pipeline & Lead Generation",
    "SEO & Organic Search Dominance",
    "AI Answer Engine & GEO Visibility",
  ]);
  const [brandVoice, setBrandVoice] = React.useState<string>("Authoritative & Data-Driven");
  const [salesMotion, setSalesMotion] = React.useState<string>("Product-Led Growth (Self-serve + Upgrade)");
  const [additionalNotes, setAdditionalNotes] = React.useState("");

  // Form State - Step 4 (Provider)
  const [selectedProvider, setSelectedProvider] = React.useState(verifiedProvider?.provider ?? "anthropic");
  const [apiKey, setApiKey] = React.useState("");
  const [model, setModel] = React.useState(
    verifiedProvider?.model ||
    getRecommendedModel(verifiedProvider?.provider ?? PROVIDERS[1].id)
  );
  const [connectedProvider, setConnectedProvider] = React.useState(verifiedProvider?.provider ?? "");
  const [connectedModel, setConnectedModel] = React.useState(verifiedProvider?.model ?? "");

  // Submission State
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState("");

  const normalizeUrl = (raw: string) => {
    let trimmed = raw.trim();
    if (!trimmed) return "";
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleAccountSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Your account could not be created.");
      const session = await signIn("credentials", { email, password, redirect: false });
      if (session?.error) throw new Error("Your account was created, but automatic sign-in failed. Please sign in to continue.");
      setAccountReady(true);
      setCurrentStep(2);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your account could not be created.");
    } finally {
      setPending(false);
    }
  };

  const handleWebsiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountReady) return;
    if (!url.trim()) return;
    setCompanyName(companyName.trim() || suggestedName(url));
    setUrl(normalizeUrl(url));
    setError("");
    setCurrentStep(3);
  };

  const handleMarketingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCurrentStep(4);
  };

  const handleFilesAdded = (newFiles: FileList | File[]) => {
    const valid: File[] = [];
    const maxBytes = 15 * 1024 * 1024; // 15MB
    let errorMessage = "";

    Array.from(newFiles).forEach((file) => {
      if (file.size > maxBytes) {
        errorMessage = `${file.name} exceeds the 15MB size limit.`;
      } else if (files.length + valid.length >= 10) {
        errorMessage = "You can upload up to 10 source documents.";
      } else {
        valid.push(file);
      }
    });

    if (errorMessage) {
      setError(errorMessage);
    } else {
      setError("");
    }
    if (valid.length > 0) {
      setFiles((prev) => [...prev, ...valid]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSecondaryGeo = (geo: string) => {
    if (secondaryGeos.includes(geo)) {
      setSecondaryGeos(secondaryGeos.filter((g) => g !== geo));
    } else {
      setSecondaryGeos([...secondaryGeos, geo]);
    }
  };

  const addCustomSecondaryGeo = () => {
    const trimmed = customGeoInput.trim();
    if (trimmed && !secondaryGeos.includes(trimmed)) {
      setSecondaryGeos([...secondaryGeos, trimmed]);
      setCustomGeoInput("");
    }
  };

  const toggleAudienceSegment = (seg: string) => {
    if (selectedAudience.includes(seg)) {
      setSelectedAudience(selectedAudience.filter((s) => s !== seg));
    } else {
      setSelectedAudience([...selectedAudience, seg]);
    }
  };

  const toggleBuyerPersona = (persona: string) => {
    if (buyerPersonas.includes(persona)) {
      setBuyerPersonas(buyerPersonas.filter((p) => p !== persona));
    } else {
      setBuyerPersonas([...buyerPersonas, persona]);
    }
  };

  const toggleMarketingGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      if (connectedProvider !== selectedProvider || connectedModel !== model.trim() || apiKey.trim()) {
        const response = await fetch("/api/llm/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider: selectedProvider, apiKey: apiKey.trim() || undefined, model: model.trim() }),
        });
        const result = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(result.error ?? "The provider could not be connected.");
        setConnectedProvider(selectedProvider);
        setConnectedModel(model.trim());
        setApiKey("");
      }
      setCurrentStep(5);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The provider could not be connected.");
    } finally {
      setPending(false);
    }
  };

  const handleFinalLaunch = async () => {
    setPending(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("companyName", companyName.trim() || suggestedName(url));
      formData.append("websiteUrl", normalizeUrl(url));

      const brief: MarketingStrategyBrief = {
        targetGeographies: {
          primary: primaryGeo,
          secondary: secondaryGeos,
          priorityNotes: priorityNotes.trim() || undefined,
        },
        targetAudience: {
          segments: selectedAudience,
          buyerPersonas: buyerPersonas,
          corePainPoints: corePainPoints.trim() || undefined,
        },
        positioning: {
          valueProposition: valueProposition.trim() || undefined,
          keyDifferentiator: keyDifferentiator.trim() || undefined,
        },
        competitors: competitors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        marketingGoals: selectedGoals,
        brandVoice: brandVoice || undefined,
        salesMotion: salesMotion || undefined,
        additionalNotes: additionalNotes.trim() || undefined,
      };

      formData.append("marketingBrief", JSON.stringify(brief));

      for (const file of files) {
        formData.append("files", file);
      }

      const response = await fetch("/api/companies", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { error?: string; jobId?: string };
      if (!response.ok || !result.jobId) throw new Error(result.error ?? "The analysis could not be started.");
      router.push(`/onboarding/audit/${result.jobId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The analysis could not be started.");
      setPending(false);
    }
  };

  const currentProviderObj = PROVIDERS.find((p) => p.id === selectedProvider) || PROVIDERS[1];

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0f] font-sans text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* Sticky Main Menu Header */}
      <SiteHeader activeNav="get-started" accountReady={accountReady} />

      <main className="relative mx-auto max-w-4xl px-6 pt-28 pb-24 md:pt-32">
        {/* Step Progress Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 backdrop-blur-md">
            <Sparkles className="size-3.5 text-purple-400" />
            <span>STEP 0{currentStep} OF 05 &bull; GET STARTED</span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            {currentStep === 1 && "Create your account"}
            {currentStep === 2 && "What website are we analyzing?"}
            {currentStep === 3 && "Marketing brief & custom documents"}
            {currentStep === 4 && "Choose your AI inference provider"}
            {currentStep === 5 && "Review & launch intelligence engine"}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
            {currentStep === 1 && "Create one secure account to save your company intelligence and return to your workspace."}
            {currentStep === 2 && "KREV AI crawls public pages to extract verified digital evidence before running strategy."}
            {currentStep === 3 && "Attach your own pitch decks or strategy docs and rank your priority target geography and audience."}
            {currentStep === 4 && "Bring your own API key. Your credentials are encrypted at rest and used for your workspace."}
            {currentStep === 5 && "Your evidence baseline and strategic brief are ready. All analyses will run concurrently."}
          </p>

          {/* Stepper Progress Bar */}
          <div className="mx-auto mt-8 flex max-w-md items-center justify-between gap-2">
            {[1, 2, 3, 4, 5].map((step) => {
              const isDone = currentStep > step;
              const isCurrent = currentStep === step;
              return (
                <div key={step} className="flex flex-1 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentStep > step && (step !== 1 || !accountReady)) {
                        setError("");
                        setCurrentStep(step);
                      }
                    }}
                    disabled={currentStep <= step || (step === 1 && accountReady)}
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isDone
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 cursor-pointer"
                        : isCurrent
                        ? "border-2 border-purple-500 bg-purple-500/20 text-purple-300"
                        : "border border-white/10 bg-white/5 text-slate-500"
                    }`}
                  >
                    {isDone ? <Check className="size-4 stroke-[3]" /> : step}
                  </button>
                  {step < 5 && (
                    <div
                      className={`h-0.5 flex-1 rounded-full transition-all ${
                        currentStep > step ? "bg-purple-500" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: ACCOUNT */}
        {currentStep === 1 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl md:p-10">
            <form onSubmit={handleAccountSubmit} className="mx-auto max-w-lg space-y-5">
              <div>
                <label htmlFor="account-name" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Your name
                </label>
                <input
                  id="account-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Your full name"
                  className="mt-2 h-12 w-full rounded-xl border border-white/15 !bg-transparent px-4 text-sm text-white placeholder-slate-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label htmlFor="account-email" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Work email
                </label>
                <input
                  id="account-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                  className="mt-2 h-12 w-full rounded-xl border border-white/15 !bg-transparent px-4 text-sm text-white placeholder-slate-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label htmlFor="account-password" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <input
                  id="account-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,128}"
                  title="Use at least 8 characters with a letter and a number."
                  placeholder="At least 8 characters, a letter and a number"
                  className="mt-2 h-12 w-full rounded-xl border border-white/15 !bg-transparent px-4 text-sm text-white placeholder-slate-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              {error && (
                <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={pending}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-7 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 disabled:opacity-50"
              >
                <span>{pending ? "Creating account…" : "Create account & continue"}</span>
                <ArrowRight className="size-4" />
              </button>
              <p className="text-center text-xs text-slate-400">
                Already have an account?{" "}
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/onboarding${initialUrl ? `?url=${encodeURIComponent(initialUrl)}` : ""}`)}`}
                  className="font-semibold text-purple-300 hover:text-purple-200"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        )}

        {/* STEP 2: TARGET DOMAIN */}
        {currentStep === 2 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleWebsiteSubmit} className="space-y-6">
              <div>
                <label htmlFor="website-url" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Company or Product Website URL
                </label>

                {/* Translucent BorderBeam URL Search Bar with Corner Lighting */}
                <div className="relative mt-3">
                  <BorderBeam size="md" colorVariant="colorful" borderRadius={20} className="w-full">
                    <div className="group/field relative flex w-full items-center rounded-[20px] border border-white/15 bg-[#0d0d16]/40 p-1.5 backdrop-blur-2xl transition-all hover:bg-[#0d0d16]/50 focus-within:border-purple-400/50 focus-within:bg-[#0d0d16]/60 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)]">
                      {/* Corner Lighting */}
                      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[20px]">
                        <div className="absolute -top-3 -left-3 size-12 rounded-full bg-purple-500/25 blur-md" />
                        <div className="absolute -top-3 -right-3 size-12 rounded-full bg-indigo-500/20 blur-md" />
                        <div className="absolute -bottom-3 -left-3 size-12 rounded-full bg-purple-600/20 blur-md" />
                        <div className="absolute -bottom-3 -right-3 size-12 rounded-full bg-cyan-400/25 blur-md" />
                      </div>

                      {/* Globe Icon */}
                      <div className="pointer-events-none relative z-10 pl-3.5 pr-2 text-purple-400 flex items-center">
                        <Globe className="size-5" />
                      </div>

                      {/* URL Input */}
                      <input
                        id="website-url"
                        type="text"
                        required
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter your website URL (e.g. stripe.com)"
                        className="relative z-10 h-12 w-full flex-1 border-0 !bg-transparent px-2 text-sm sm:text-base font-normal text-white placeholder-slate-400 outline-none transition-all tracking-[0.012em]"
                        style={{ backgroundColor: "transparent" }}
                      />

                      {/* CTA button inside the capsule */}
                      <button
                        type="submit"
                        className="relative z-10 group inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 px-5 sm:px-6 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:brightness-110 active:scale-95 shrink-0"
                      >
                        <span>Continue</span>
                        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </button>
                    </div>
                  </BorderBeam>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                  <span>Quick pick:</span>
                  {["stripe.com", "linear.app", "ramp.com", "vercel.com"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setUrl(`https://${d}`)}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300 hover:border-purple-500/50 hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="company-name" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Company / organization name
                </label>
                <input
                  id="company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  minLength={2}
                  maxLength={120}
                  placeholder={suggestedName(url) || "Your company name"}
                  className="mt-2 h-12 w-full rounded-xl border border-white/15 !bg-transparent px-4 text-sm text-white placeholder-slate-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
                <p className="mt-2 text-xs text-slate-400">Leave blank to extract automatically from the website.</p>
              </div>

              {/* What will be analyzed */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">6-Engine Evidence Crawl Queue</h3>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3 text-xs">
                    <Search className="size-4 text-purple-400 shrink-0" />
                    <span>Company Intelligence</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3 text-xs">
                    <BarChart3 className="size-4 text-purple-400 shrink-0" />
                    <span>Technical SEO Audit</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3 text-xs">
                    <Bot className="size-4 text-purple-400 shrink-0" />
                    <span>GEO & AI Answer Engines</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3 text-xs">
                    <Compass className="size-4 text-purple-400 shrink-0" />
                    <span>Competitor Landscape</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3 text-xs">
                    <Users className="size-4 text-purple-400 shrink-0" />
                    <span>Audience ICP Profiling</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3 text-xs">
                    <FileText className="size-4 text-purple-400 shrink-0" />
                    <span>Content Strategy Roadmap</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-purple-600 px-7 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:bg-purple-500 active:scale-95 cursor-pointer"
                >
                  <span>Continue to Marketing Brief & Docs</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: MARKETING BRIEF & CUSTOM DOCUMENTS (NEW) */}
        {currentStep === 3 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl shadow-2xl space-y-8">
            <form onSubmit={handleMarketingSubmit} className="space-y-8">
              {/* SECTION A: Custom Document Upload */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <UploadCloud className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Upload Custom Documents & Collateral (Optional)</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Add pitch decks, brand books, ICP research, case studies, or product docs (PDF, DOCX, PPTX, XLSX, TXT, MD, CSV up to 15MB each).
                    </p>
                  </div>
                </div>

                {/* Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files?.length) {
                      handleFilesAdded(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                    dragActive
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-white/15 bg-white/[0.02] hover:border-purple-400/50 hover:bg-white/[0.04]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.pptx,.xlsx,.txt,.md,.csv,.tsv,.json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        handleFilesAdded(e.target.files);
                      }
                    }}
                  />
                  <div className="flex size-11 items-center justify-center rounded-full bg-purple-600/20 text-purple-300">
                    <Paperclip className="size-5" />
                  </div>
                  <p className="mt-3 text-xs font-semibold text-white">
                    Click to browse files or drag and drop here
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Supported: PDF, Word, PowerPoint, Excel, Markdown, Plain Text, CSV (max 10 files)
                  </p>
                </div>

                {/* Selected Files List */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="size-3.5" />
                        {files.length} {files.length === 1 ? "document" : "documents"} attached to workspace memory
                      </span>
                      <button
                        type="button"
                        onClick={() => setFiles([])}
                        className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        Remove all
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {files.map((file, idx) => (
                        <div
                          key={`${file.name}-${idx}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="size-4 shrink-0 text-purple-400" />
                            <div className="min-w-0">
                              <p className="font-medium text-white truncate text-xs">{file.name}</p>
                              <span className="text-[10px] text-slate-400">{formatBytes(file.size)}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(idx);
                            }}
                            className="text-slate-400 hover:text-rose-400 p-1 shrink-0 cursor-pointer"
                            title="Remove file"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION B: Priority-Wise Target Geographies */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Globe className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Target Geographies (Priority Ranked)</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Agents use these prioritized markets to calibrate search volumes, SERP competitors, local intent, and cultural messaging.
                    </p>
                  </div>
                </div>

                {/* Primary Core Market (Tier 1) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-300">
                    Tier 1: Primary Core Market (70%+ Focus)
                  </label>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {COMMON_GEOGRAPHIES.map((geo) => {
                      const isSelected = primaryGeo === geo;
                      return (
                        <button
                          key={geo}
                          type="button"
                          onClick={() => setPrimaryGeo(geo)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "border-purple-500 bg-purple-600/30 text-white shadow-sm ring-1 ring-purple-500/50"
                              : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                          }`}
                        >
                          {isSelected && <Check className="inline-block size-3 mr-1 stroke-[3]" />}
                          {geo}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    value={primaryGeo}
                    onChange={(e) => setPrimaryGeo(e.target.value)}
                    placeholder="Or type custom primary market (e.g. United Kingdom, Singapore)"
                    className="mt-3 h-10 w-full rounded-xl border border-white/15 !bg-transparent px-3 text-xs text-white placeholder-slate-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                {/* Secondary Expansion Markets (Tier 2) */}
                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Tier 2: Secondary / Expansion Markets (Select all that apply)
                  </label>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {COMMON_GEOGRAPHIES.filter((g) => g !== primaryGeo).map((geo) => {
                      const isSelected = secondaryGeos.includes(geo);
                      return (
                        <button
                          key={geo}
                          type="button"
                          onClick={() => toggleSecondaryGeo(geo)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-600/30 text-white shadow-sm"
                              : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-slate-200"
                          }`}
                        >
                          {isSelected && <Check className="inline-block size-3 mr-1 stroke-[3]" />}
                          {geo}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={customGeoInput}
                      onChange={(e) => setCustomGeoInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomSecondaryGeo();
                        }
                      }}
                      placeholder="Add custom secondary region (e.g. Nordics, Japan)"
                      className="h-10 flex-1 rounded-xl border border-white/15 !bg-transparent px-3 text-xs text-white placeholder-slate-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                    <button
                      type="button"
                      onClick={addCustomSecondaryGeo}
                      className="rounded-xl border border-white/10 bg-white/10 px-4 text-xs font-medium text-white hover:bg-white/15 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Priority Notes */}
                <div className="pt-2">
                  <label htmlFor="priority-notes" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Regional Priority Nuances & Notes (Optional)
                  </label>
                  <input
                    id="priority-notes"
                    type="text"
                    value={priorityNotes}
                    onChange={(e) => setPriorityNotes(e.target.value)}
                    placeholder="e.g. 70% pipeline focus on US Enterprise, 30% UK mid-market inbound"
                    className="mt-2 h-10 w-full rounded-xl border border-white/15 !bg-transparent px-3 text-xs text-white placeholder-slate-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              {/* SECTION C: Ideal Customer Profile & Personas */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Ideal Customer Profile (ICP) & Decision Makers</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Specifies who has buying power and budget to ensure every piece of content resonates.
                    </p>
                  </div>
                </div>

                {/* Target Segments */}
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Target Customer Segments
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COMMON_AUDIENCE_SEGMENTS.map((seg) => {
                      const isSelected = selectedAudience.includes(seg);
                      return (
                        <button
                          key={seg}
                          type="button"
                          onClick={() => toggleAudienceSegment(seg)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "border-purple-500 bg-purple-600/30 text-white shadow-sm"
                              : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                          }`}
                        >
                          {isSelected && <Check className="inline-block size-3 mr-1 stroke-[3]" />}
                          {seg}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Key Buyer Personas */}
                <div className="pt-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Primary Buyer Personas & Roles
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COMMON_BUYER_PERSONAS.map((persona) => {
                      const isSelected = buyerPersonas.includes(persona);
                      return (
                        <button
                          key={persona}
                          type="button"
                          onClick={() => toggleBuyerPersona(persona)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-600/30 text-white shadow-sm"
                              : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                          }`}
                        >
                          {isSelected && <Check className="inline-block size-3 mr-1 stroke-[3]" />}
                          {persona}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Core Pain Point */}
                <div className="pt-2">
                  <label htmlFor="pain-points" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Core Problem / Customer Pain Points Solved
                  </label>
                  <input
                    id="pain-points"
                    type="text"
                    value={corePainPoints}
                    onChange={(e) => setCorePainPoints(e.target.value)}
                    placeholder="e.g. High customer acquisition costs, slow marketing execution, poor conversion from organic traffic"
                    className="mt-2 h-11 w-full rounded-xl border border-white/15 !bg-transparent px-3 text-xs text-white placeholder-slate-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              {/* SECTION D: Value Proposition & Competitors */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Target className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Value Proposition & Key Competitors</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Give the AI the exact reasons why customers choose you over existing market alternatives.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="val-prop" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Core Value Proposition
                    </label>
                    <input
                      id="val-prop"
                      type="text"
                      value={valueProposition}
                      onChange={(e) => setValueProposition(e.target.value)}
                      placeholder="e.g. The unified AI CMO operating system for marketing teams"
                      className="mt-2 h-11 w-full rounded-xl border border-white/15 !bg-transparent px-3 text-xs text-white placeholder-slate-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="differentiator" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Primary Competitive Moat / Unfair Advantage
                    </label>
                    <input
                      id="differentiator"
                      type="text"
                      value={keyDifferentiator}
                      onChange={(e) => setKeyDifferentiator(e.target.value)}
                      placeholder="e.g. Real evidence-backed audits with BYOK zero-retention privacy"
                      className="mt-2 h-11 w-full rounded-xl border border-white/15 !bg-transparent px-3 text-xs text-white placeholder-slate-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="competitors-list" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Known Competitors & Alternatives (Comma-separated)
                  </label>
                  <input
                    id="competitors-list"
                    type="text"
                    value={competitors}
                    onChange={(e) => setCompetitors(e.target.value)}
                    placeholder="e.g. Semrush, Jasper, Copy.ai, HubSpot"
                    className="mt-2 h-11 w-full rounded-xl border border-white/15 !bg-transparent px-3 text-xs text-white placeholder-slate-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    KREV AI will compare your positioning, content gaps, and search rankings against these domains.
                  </p>
                </div>
              </div>

              {/* SECTION E: Marketing Priorities & Brand Tone */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Compass className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Strategic Marketing Focus & Brand Tone</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tailor the recommendations and creative angle generated by your specialist agents.
                    </p>
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Top Marketing Objectives
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COMMON_MARKETING_GOALS.map((goal) => {
                      const isSelected = selectedGoals.includes(goal);
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleMarketingGoal(goal)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "border-purple-500 bg-purple-600/30 text-white shadow-sm"
                              : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                          }`}
                        >
                          {isSelected && <Check className="inline-block size-3 mr-1 stroke-[3]" />}
                          {goal}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tone and Sales Motion Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                  <div>
                    <label htmlFor="brand-voice" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Brand Tone & Voice
                    </label>
                    <select
                      id="brand-voice"
                      value={brandVoice}
                      onChange={(e) => setBrandVoice(e.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-white/15 bg-[#0d0d16] px-3 text-xs text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    >
                      {COMMON_BRAND_VOICES.map((tone) => (
                        <option key={tone} value={tone} className="bg-slate-900 text-white">
                          {tone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sales-motion" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      GTM / Sales Motion
                    </label>
                    <select
                      id="sales-motion"
                      value={salesMotion}
                      onChange={(e) => setSalesMotion(e.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-white/15 bg-[#0d0d16] px-3 text-xs text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="Product-Led Growth (Self-serve + Upgrade)">Product-Led Growth (Self-serve + Upgrade)</option>
                      <option value="Sales-Led / High-Touch Enterprise">Sales-Led / High-Touch Enterprise</option>
                      <option value="Hybrid (PLG + Inbound Sales Assisted)">Hybrid (PLG + Inbound Sales Assisted)</option>
                      <option value="High-Ticket Services / Advisory">High-Ticket Services / Advisory</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {error}
                </p>
              )}

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setCurrentStep(2);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 cursor-pointer"
                >
                  <ArrowLeft className="size-4" />
                  <span>Back to Website</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setCurrentStep(4);
                    }}
                    className="text-xs text-slate-400 hover:text-white px-3 py-2 cursor-pointer transition-colors"
                  >
                    Skip to AI Provider
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-purple-600 px-7 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:bg-purple-500 active:scale-95 cursor-pointer"
                  >
                    <span>Continue to AI Provider</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: PROVIDER SELECTION */}
        {currentStep === 4 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleProviderSubmit} className="space-y-8">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Select Your AI Provider (Bring Your Own Key)
                </label>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" role="radiogroup" aria-label="AI provider">
                  {PROVIDERS.map((prov) => {
                    const isSelected = selectedProvider === prov.id;
                    return (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => {
                          setSelectedProvider(prov.id);
                          setModel(getRecommendedModel(prov.id));
                          setApiKey("");
                          setError("");
                        }}
                        role="radio"
                        aria-checked={isSelected}
                        className={`relative flex min-h-[136px] cursor-pointer items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                          isSelected
                            ? "border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/50"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                        }`}
                      >
                        {/* Real Provider SVG Logo Container */}
                        <div className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-white/10 p-2.5 backdrop-blur-md border border-white/10">
                          <Image
                            src={prov.logo}
                            alt={`${prov.name} logo`}
                            width={34}
                            height={34}
                            className="size-full object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex min-w-0 items-center justify-between gap-3">
                            <h3 className="text-sm font-bold text-white">{prov.name}</h3>
                            {isSelected && (
                              <span className="flex size-4 items-center justify-center rounded-full bg-purple-500 text-white">
                                <Check className="size-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs leading-5 text-purple-300 font-medium">{prov.models}</p>
                          <p className="mt-1 text-[11px] leading-4 text-slate-400">{prov.hint}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* API Key Input */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                <div>
                  <label htmlFor="api-key" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {currentProviderObj.name} API Key
                  </label>
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Key className="size-4 text-purple-400" />
                  </div>
                  <input
                    id="api-key"
                    type="password"
                    autoComplete="off"
                    required={connectedProvider !== selectedProvider}
                    minLength={10}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      connectedProvider === selectedProvider
                        ? `Leave blank to reuse ${verifiedProvider?.preview ?? "your verified key"}`
                        : `Paste your ${currentProviderObj.name} key`
                    }
                    className="h-12 w-full rounded-xl border border-white/15 !bg-transparent px-4 pl-11 text-xs font-mono text-white placeholder-slate-400 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    style={{ backgroundColor: "transparent" }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="ai-model" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Model
                    </label>
                    <span className="text-right text-[11px] font-medium text-purple-400">
                      Recommended: {getRecommendedModel(currentProviderObj.id)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <AIModelSelect id="ai-model" provider={selectedProvider} value={model} onChange={setModel} />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Lock className="size-3.5 text-emerald-400 shrink-0" />
                  <span>
                    Zero-Trust: Your key is AES-256 encrypted at rest in your workspace and never shared with anyone.
                  </span>
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setCurrentStep(3);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 cursor-pointer"
                >
                  <ArrowLeft className="size-4" />
                  <span>Back to Brief</span>
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-purple-600 px-7 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:bg-purple-500 active:scale-95 cursor-pointer"
                >
                  <span>
                    {pending
                      ? "Verifying provider…"
                      : connectedProvider === selectedProvider && connectedModel === model && !apiKey
                      ? "Continue with saved provider"
                      : "Verify & continue"}
                  </span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 5: REVIEW & LAUNCH */}
        {currentStep === 5 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl shadow-2xl">
            <div className="space-y-6">
              <div className="rounded-xl border border-purple-500/30 bg-purple-950/15 p-6 backdrop-blur-md">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="size-4 text-purple-400" />
                  Ready to Synthesize Marketing Intelligence
                </h3>
                <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                  We will crawl {url} across public endpoints, synthesize your custom documents & marketing priorities, and initialize your AI CMO workspace powered by {currentProviderObj.name}.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 border-t border-white/10 pt-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Website</span>
                    <p className="mt-1 text-xs font-semibold text-white truncate">{url}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Provider</span>
                    <div className="mt-1 flex items-center gap-2">
                      <Image
                        src={currentProviderObj.logo}
                        alt={currentProviderObj.name}
                        width={18}
                        height={18}
                        className="object-contain"
                      />
                      <span className="text-xs font-semibold text-white truncate">{currentProviderObj.name}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Geography</span>
                    <p className="mt-1 text-xs font-semibold text-white truncate">{primaryGeo}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Custom Documents</span>
                    <p className="mt-1 text-xs font-semibold text-purple-300">
                      {files.length > 0 ? `${files.length} attached` : "None (Web only)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Strategic Snapshot */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Strategic Brief Overview
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                  <div className="rounded-lg bg-white/5 p-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Secondary Geographies</span>
                    <p className="text-white mt-1">
                      {secondaryGeos.length > 0 ? secondaryGeos.join(", ") : "None specified"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Primary Focus</span>
                    <p className="text-white mt-1">
                      {selectedGoals.length > 0 ? selectedGoals.slice(0, 2).join(", ") : "General GTM Acceleration"}
                    </p>
                  </div>
                  {files.length > 0 && (
                    <div className="rounded-lg bg-white/5 p-3 sm:col-span-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Attached Knowledge Assets</span>
                      <p className="text-purple-300 mt-1 truncate">
                        {files.map((f) => f.name).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Deliverables generated in this workspace
                </h4>
                <ul className="mt-3 space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-purple-400" />
                    <span>6 Foundation Intelligence Documents (Positioning, SEO, GEO, Competitors, ICPs, Content)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-purple-400" />
                    <span>12+ Specialist Agents grounded in your custom documents and priority geographies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-purple-400" />
                    <span>Branded PDF, PPTX presentation decks, and operational XLSX workbooks</span>
                  </li>
                </ul>
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 cursor-pointer"
                >
                  <ArrowLeft className="size-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={pending}
                  onClick={handleFinalLaunch}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 px-8 text-sm font-semibold text-white shadow-xl shadow-purple-600/30 transition-all hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <span>{pending ? "Starting analysis…" : "Launch Workspace Analysis"}</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Standard Footer */}
      <SiteFooter />
    </div>
  );
}

export function OnboardingFlow({ authenticated, verifiedProvider }: { authenticated: boolean; verifiedProvider: VerifiedProvider }) {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <OnboardingContent authenticated={authenticated} verifiedProvider={verifiedProvider} />
    </React.Suspense>
  );
}
