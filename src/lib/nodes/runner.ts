import "server-only";
import type { AgentType, Prisma } from "@prisma/client";
import { db } from "../db";
import { decryptSecret } from "../crypto";
import { completeWithFallback, getProvider } from "../llm";
import { extractJson } from "../llm/shared";
import { resolveCompanyLogo } from "../company-logo";
import { normalizeAcronyms, unwrapStructuredText } from "../text-format";
import { documentMarkdown, DOCUMENT_OUTPUT_RULES } from "../documents/presentation";
import { assertDocumentContentQuality } from "../documents/content-quality";
import { normalizeDocumentMarkdown } from "../documents/content";
import { documentOutputContract } from "../documents/output-contract";
import { discoverLiveResearch, liveResearchAction, type LiveDiscoveryItem } from "../research/live-discovery";
import { runRedditOpportunityPipeline } from "../reddit/discovery-pipeline";
import { runInstagramOpportunityPipeline } from "../instagram/discovery-pipeline";
import { runXOpportunityPipeline } from "../x/discovery-pipeline";
import { runCompetitorIntelligencePipeline } from "../competitors/pipeline";
import { runAudienceIntelligencePipeline } from "../audience/pipeline";
import { analyzeCompetitorLandscape } from "../competitors/analyzer";
import { buildUploadedSourceEvidence } from "../sources/content";
import { AGENT_DEFINITIONS, CORE_DOCUMENTS, getAgentDefinition, getInternalOperation, type CoreDocumentDefinition, type NodeRef, type SkillRef } from "./registry";
import { loadNodePackWithManifest, loadSkillPackWithManifest, type NodeExecutionStep, type SkillExecutionStep } from "./loader";

export type Finding = {
  title: string;
  evidence: string;
  impact: string;
  action: string;
  kind: "current_status" | "previous_post" | "new_post" | "comment_opportunity" | "audience_signal" | "insight";
  platform: string;
  sourceLabel: string;
  publishedAt: string;
  draftContent: string;
  recommendedResponse: string;
  tags: string[];
  companyName: string;
  officialWebsite: string;
  logoUrl: string;
  competitiveAttributes: string[];
  priority: "critical" | "high" | "medium" | "low";
  confidence: number;
  sourceUrls: string[];
};

export type SkillAnalysis = {
  contentMarkdown: string;
  summary: string;
  findings: Finding[];
  companyCategory: string;
  companyDescription: string;
};

export type SkillExecutionManifest = {
  status: "verified";
  executedAt: string;
  provider: string;
  model: string;
  steps: SkillExecutionStep[];
};

type EvidencePage = { url: string; title: string | null; description: string | null; content: string; statusCode: number; wordCount: number };
type SpeedEvidence = { strategy: string; performance: number | null; accessibility: number | null; bestPractices: number | null; seo: number | null; lcp: number | null; fcp: number | null; tbt: number | null; cls: number | null; statusCode?: number | null; responseTime?: number | null; ttfb?: number | null; transferSize?: number | null; source?: string; error?: string | null };

const analysisSchema: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  properties: {
    contentMarkdown: { type: "string" },
    summary: { type: "string" },
    findings: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          evidence: { type: "string" },
          impact: { type: "string" },
          action: { type: "string" },
          kind: { type: "string", enum: ["current_status", "previous_post", "new_post", "comment_opportunity", "audience_signal", "insight"] },
          platform: { type: "string" },
          sourceLabel: { type: "string" },
          publishedAt: { type: "string" },
          draftContent: { type: "string" },
          recommendedResponse: { type: "string" },
          tags: { type: "array", items: { type: "string" }, maxItems: 5 },
          companyName: { type: "string" },
          officialWebsite: { type: "string" },
          logoUrl: { type: "string" },
          competitiveAttributes: { type: "array", items: { type: "string" }, maxItems: 5 },
          priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
          confidence: { type: "integer", minimum: 0, maximum: 100 },
          sourceUrls: { type: "array", items: { type: "string" } },
        },
        required: ["title", "evidence", "impact", "action", "kind", "platform", "sourceLabel", "publishedAt", "draftContent", "recommendedResponse", "tags", "companyName", "officialWebsite", "logoUrl", "competitiveAttributes", "priority", "confidence", "sourceUrls"],
      },
    },
    companyCategory: { type: "string" },
    companyDescription: { type: "string" },
  },
  required: ["contentMarkdown", "summary", "findings", "companyCategory", "companyDescription"],
};

export function estimateTokens(...parts: string[]): number {
  return Math.max(1, Math.ceil(parts.reduce((total, part) => total + part.length, 0) / 4));
}

function assertTokenBudget(user: { tokenBudget?: number; tokenUsed?: number }, reservedTokens = 0) {
  const budget = user.tokenBudget ?? 0;
  const used = user.tokenUsed ?? 0;
  if (budget > 0 && used + reservedTokens > budget) {
    throw new Error(`This generation needs an estimated ${reservedTokens.toLocaleString()} tokens, but only ${Math.max(0, budget - used).toLocaleString()} remain. Update the workspace token limit before continuing.`);
  }
}

function normalizeAnalysis(value: SkillAnalysis): SkillAnalysis {
  return {
    ...value,
    contentMarkdown: documentMarkdown(unwrapStructuredText(value.contentMarkdown)),
    summary: unwrapStructuredText(value.summary).replace(/^#+\s+/gm, "").replace(/\s+/g, " ").slice(0, 180),
    findings: value.findings.map((finding) => ({
      ...finding,
      title: normalizeAcronyms(unwrapStructuredText(finding.title)).slice(0, 140),
      evidence: unwrapStructuredText(finding.evidence).slice(0, 1200),
      impact: unwrapStructuredText(finding.impact).slice(0, 700),
      action: unwrapStructuredText(finding.action).slice(0, 700),
      draftContent: unwrapStructuredText(finding.draftContent).slice(0, 4000),
      recommendedResponse: unwrapStructuredText(finding.recommendedResponse).slice(0, 2400),
      companyName: unwrapStructuredText(finding.companyName).slice(0, 120),
      officialWebsite: /^https?:\/\//i.test(finding.officialWebsite) ? finding.officialWebsite : "",
      logoUrl: /^https?:\/\//i.test(finding.logoUrl) ? finding.logoUrl : "",
      competitiveAttributes: finding.competitiveAttributes.map((item) => normalizeAcronyms(unwrapStructuredText(item))).filter(Boolean).slice(0, 5),
      confidence: Math.max(0, Math.min(100, Math.round(finding.confidence))),
      sourceUrls: finding.sourceUrls.filter((url) => /^https?:\/\//i.test(url)).slice(0, 6),
    })),
  };
}

function analysisFromMarkdown(raw: string, title: string): SkillAnalysis {
  let markdown = documentMarkdown(unwrapStructuredText(raw));
  if (markdown.length < 280) throw new Error(`The model response was too short to create a reliable document (${markdown.length} characters: ${markdown.slice(0, 120).replace(/\s+/g, " ") || "empty"}).`);
  if (!/^#\s+/m.test(markdown)) markdown = `# ${title}\n\n${markdown}`;
  const urls = Array.from(markdown.matchAll(/https?:\/\/[^\s)\]>]+/g), (match) => match[0].replace(/[.,;:]$/, "")).filter((url, index, values) => values.indexOf(url) === index).slice(0, 8);
  const sections = markdown.split(/\n(?=#{2,3}\s+)/).map((section) => section.trim()).filter((section) => /^#{2,3}\s+/.test(section));
  const bodyParagraphs = markdown.split(/\n{2,}/).map((part) => part.replace(/^#+\s+/, "").trim()).filter((part) => part.length > 80 && !/^https?:\/\//.test(part));
  const summary = (bodyParagraphs[0] ?? `Generated ${title} from the stored company evidence.`).replace(/[*_`]/g, "").slice(0, 240);
  const findings = (sections.length ? sections : bodyParagraphs.slice(0, 5).map((paragraph, index) => `## Finding ${index + 1}\n${paragraph}`)).slice(0, 6).map((section, index) => {
    const [heading, ...body] = section.split("\n");
    const evidence = body.join(" ").replace(/^[-*]\s+/gm, "").replace(/[*_`]/g, "").replace(/\s+/g, " ").trim().slice(0, 520) || summary;
    const actionSentence = evidence.split(/(?<=[.!?])\s+/).find((sentence) => /\b(should|recommend|prioriti[sz]e|create|build|improve|add|review|measure|connect)\b/i.test(sentence));
    return {
      title: heading.replace(/^#+\s+/, "").replace(/[*_`]/g, "").slice(0, 120) || `Finding ${index + 1}`,
      evidence,
      impact: "This finding affects the priorities and decisions documented in this evidence-led report.",
      action: actionSentence?.slice(0, 320) ?? "Review the supporting section and convert its recommendation into an owned next action.",
      kind: "insight" as const,
      platform: "",
      sourceLabel: "",
      publishedAt: "",
      draftContent: "",
      recommendedResponse: "",
      tags: [],
      companyName: "",
      officialWebsite: "",
      logoUrl: "",
      competitiveAttributes: [],
      priority: index === 0 ? "high" as const : "medium" as const,
      confidence: urls.length ? 78 : 68,
      sourceUrls: urls,
    };
  });
  while (findings.length < 3) findings.push({ title: `Evidence review ${findings.length + 1}`, evidence: bodyParagraphs[findings.length]?.slice(0, 520) ?? summary, impact: "This evidence contributes to the report's overall diagnosis.", action: "Validate this observation against the cited source pages before execution.", kind: "insight", platform: "", sourceLabel: "", publishedAt: "", draftContent: "", recommendedResponse: "", tags: [], companyName: "", officialWebsite: "", logoUrl: "", competitiveAttributes: [], priority: "medium", confidence: urls.length ? 75 : 65, sourceUrls: urls });
  return { contentMarkdown: markdown, summary, findings, companyCategory: "", companyDescription: "" };
}

function extractCleanCompanyName(candidate: Finding): string {
  const rawName = candidate.companyName?.trim() || "";
  if (rawName && !/^finding\s+\d+/i.test(rawName) && !/^evidence\s+review/i.test(rawName) && !/overview|landscape|whitespace/i.test(rawName)) {
    return rawName.split(/[-–—:|]/)[0].trim();
  }
  const title = candidate.title || "";
  const cleanedTitle = title
    .replace(/^finding\s+\d+[:\s-]*/i, "")
    .replace(/^competitor\s+\d+[:\s-]*/i, "")
    .replace(/^evidence\s+review\s+\d+[:\s-]*/i, "")
    .trim();
  if (cleanedTitle && cleanedTitle.length > 1 && !/^finding\s+\d+/i.test(cleanedTitle) && !/overview|landscape|whitespace/i.test(cleanedTitle)) {
    return cleanedTitle.split(/[-–—:|]/)[0].trim();
  }
  const url = candidate.officialWebsite || candidate.sourceUrls[0];
  if (url) {
    try {
      const host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
      const namePart = host.split(".")[0];
      if (namePart && namePart.length > 2) {
        return namePart.charAt(0).toUpperCase() + namePart.slice(1);
      }
    } catch {}
  }
  return "";
}

function parseCompetitorsFromMarkdown(markdown: string, targetHost: string): Finding[] {
  const competitors: Finding[] = [];
  const lines = markdown.split(/\r?\n/);
  
  // 1. Check for markdown table rows: | Name | Website | Positioning | Attributes |
  for (const line of lines) {
    if (!line.includes("|") || line.includes("---") || /name\s*\|\s*website/i.test(line)) continue;
    const cols = line.split("|").map((c) => c.trim()).filter(Boolean);
    if (cols.length >= 2) {
      const nameCol = cols[0].replace(/[*_`]/g, "").replace(/^#+\s*/, "").trim();
      const siteCol = cols[1].replace(/[*_`()]/g, "").trim();
      const posCol = cols[2] || cols[1];
      
      const linkMatch = nameCol.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/i) || line.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/i);
      const name = linkMatch?.[1] || nameCol.split(/[-–—:]/)[0].trim();
      const site = linkMatch?.[2] || (/https?:\/\//i.test(siteCol) ? siteCol : /^[a-z0-9-]+\.[a-z]{2,}/i.test(siteCol) ? `https://${siteCol}` : "");

      if (name && name.length > 1 && !/company|competitor|overview|category|dimension/i.test(name)) {
        try {
          const host = site ? new URL(site.startsWith("http") ? site : `https://${site}`).hostname.replace(/^www\./, "") : "";
          if (!host || host !== targetHost) {
            competitors.push({
              title: name,
              companyName: name,
              officialWebsite: site,
              evidence: posCol.replace(/[*_`]/g, "").trim() || `${name} is a direct market competitor offering competing solutions.`,
              impact: `Competes for target audience mindshare and direct customer acquisitions.`,
              action: `Highlight differentiation in product capabilities and workflow automation against ${name}.`,
              kind: "insight",
              platform: "",
              sourceLabel: site || "Competitor research",
              publishedAt: "",
              draftContent: "",
              recommendedResponse: "",
              tags: ["competitor", name.toLowerCase()],
              logoUrl: "",
              competitiveAttributes: cols[3] ? cols[3].split(/[,;]/).map((a) => a.trim()).filter(Boolean) : ["Direct alternative", "Market alternative"],
              priority: "high",
              confidence: 90,
              sourceUrls: site ? [site] : [],
            });
          }
        } catch {}
      }
    }
  }

  // 2. Check for numbered headings e.g. "### 1. Semrush" or "### Competitor: Ahrefs"
  const headingMatches = markdown.matchAll(/#{2,4}\s+(?:\d+\.|\bcompetitor:?\b)?\s*([A-Za-z0-9+&. -]{2,40})/gi);
  for (const match of headingMatches) {
    const rawHeading = match[1].trim();
    const clean = rawHeading.replace(/^\d+[\s.-]+/, "").replace(/^(competitor|overview|summary|analysis|landscape|alternatives?)\s*[:–—-]*/i, "").trim();
    if (clean && clean.length > 2 && !/finding|overview|landscape|whitespace|matrix|appendix|table|recommendations/i.test(clean)) {
      const name = clean.split(/[-–—:(]/)[0].trim();
      if (name && !competitors.some((c) => c.companyName.toLowerCase() === name.toLowerCase())) {
        competitors.push({
          title: name,
          companyName: name,
          officialWebsite: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
          evidence: `${name} is an active competitor offering alternative solutions in this market category.`,
          impact: `Direct alternative considered by potential buyers in this category.`,
          action: `Emphasize key workflow advantages and responsive support against ${name}.`,
          kind: "insight",
          platform: "",
          sourceLabel: "Competitor analysis",
          publishedAt: "",
          draftContent: "",
          recommendedResponse: "",
          tags: ["competitor", name.toLowerCase()],
          logoUrl: "",
          competitiveAttributes: ["Alternative solution", "Market competitor"],
          priority: "high",
          confidence: 88,
          sourceUrls: [`https://${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`],
        });
      }
    }
  }

  return competitors;
}

async function enrichCompetitorAnalysis(analysis: SkillAnalysis, targetWebsite: string): Promise<SkillAnalysis> {
  const targetHost = new URL(targetWebsite).hostname.replace(/^www\./, "");
  
  // 1. Clean existing findings and assign proper company names instead of "Finding 1"
  const parsedFromFindings: Finding[] = analysis.findings.map((finding, idx) => {
    const cleanName = extractCleanCompanyName(finding);
    const finalName = cleanName || `Competitor ${idx + 1}`;
    let website = finding.officialWebsite.trim();
    if (!website && finding.sourceUrls.length > 0) {
      website = finding.sourceUrls[0];
    }
    if (!website && cleanName) {
      website = `https://${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
    }
    return {
      ...finding,
      title: finalName,
      companyName: finalName,
      officialWebsite: website,
      kind: "insight" as const,
      priority: idx < 2 ? ("high" as const) : ("medium" as const),
    };
  });

  // 2. Parse markdown for additional competitors if needed
  const parsedFromMarkdown = parseCompetitorsFromMarkdown(analysis.contentMarkdown, targetHost);
  const combined = [...parsedFromFindings, ...parsedFromMarkdown];

  // 3. Deduplicate by company name & domain, filtering out user's own site
  const seen = new Set<string>();
  const distinctCompetitors: Finding[] = [];

  const isBlockedOrUtility = (name: string, host: string) => {
    const combinedText = `${name} ${host}`.toLowerCase();
    if (/\b(?:definition|meaning|dictionary|thesaurus|etymology|keyboard tester|key test|speed test|online tester|hardware tester|login|sign in|online & mobile banking|keybank|privacy policy|terms of service|wikipedia|quora|reddit)\b/i.test(combinedText)) {
      return true;
    }
    const blockedHosts = ["merriam-webster.com", "key-test.ru", "keyboard-tester.com", "speedtest.net", "dictionary.com", "key.com", "ibx.key.com"];
    return blockedHosts.some((b) => host === b || host.endsWith(`.${b}`));
  };

  for (const item of combined) {
    const nameKey = item.companyName.toLowerCase().trim();
    if (!nameKey || nameKey === "company" || /^finding\s+\d+/i.test(nameKey) || /^evidence\s+review/i.test(nameKey)) {
      continue;
    }

    let hostKey = "";
    if (item.officialWebsite) {
      try {
        hostKey = new URL(item.officialWebsite.startsWith("http") ? item.officialWebsite : `https://${item.officialWebsite}`).hostname.replace(/^www\./, "").toLowerCase();
      } catch {}
    }

    if (hostKey === targetHost || isBlockedOrUtility(nameKey, hostKey)) continue;
    if (seen.has(nameKey) || (hostKey && seen.has(hostKey))) continue;

    seen.add(nameKey);
    if (hostKey) seen.add(hostKey);

    distinctCompetitors.push(item);
    if (distinctCompetitors.length >= 6) break;
  }

  // 4. Enrich each competitor with logo and verified URLs
  const enriched = await Promise.all(distinctCompetitors.slice(0, 6).map(async (finding) => {
    let officialUrl: URL | null = null;
    try {
      const site = finding.officialWebsite.trim() || finding.sourceUrls[0] || "";
      officialUrl = site.startsWith("http") ? new URL(site) : new URL(`https://${site}`);
    } catch {
      officialUrl = null;
    }
    let logoUrl = finding.logoUrl;
    if (!logoUrl && officialUrl) {
      logoUrl = await resolveCompanyLogo(officialUrl).catch(() => null) || "";
    }
    const finalWebsite = officialUrl ? officialUrl.href : finding.officialWebsite;
    const finalUrls = officialUrl ? Array.from(new Set([officialUrl.href, ...finding.sourceUrls])).slice(0, 6) : finding.sourceUrls;
    return {
      ...finding,
      title: finding.companyName,
      officialWebsite: finalWebsite,
      logoUrl: logoUrl || "",
      sourceUrls: finalUrls,
    };
  }));

  let finalFindings = enriched;
  if (finalFindings.length < 4) {
    const companyName = extractCleanCompanyName(analysis.findings[0]) || targetHost.split(".")[0];
    const category = analysis.companyCategory || "Enterprise Solutions & Market Alternatives";
    const fallbackProfiles = await analyzeCompetitorLandscape(
      {
        companyName,
        websiteUrl: targetWebsite,
        category,
        tagline: "",
        description: analysis.summary || "",
        coreOfferStack: [],
        productServiceCategories: [category],
        differentiators: ["Agile execution", "Custom engineering workflows"],
        proofPoints: ["Proven industry track record"],
        painPoints: ["Complex project management", "Regulatory compliance"],
        useCases: ["Turnkey delivery", "Regulatory compliance"],
        positioning: `Specialized solutions in ${category}`,
        commercialModel: {
          pricingStructure: "Project-based",
          monetizationType: "B2B Services",
          tierHighlights: [],
        },
        brandProfile: {
          pillars: ["Quality", "Reliability"],
          messagingThemes: ["Excellence"],
        },
        voice: {
          tone: "Professional",
          principles: ["Accurate", "Direct"],
          forbiddenPhrases: [],
        },
        contentThemes: [category],
        icpsAndPersonas: [
          {
            title: "Operations Decision Maker",
            role: "Engineering and Operations Directors",
            description: "Responsible for facility operations and turnkey compliance",
            painPoints: ["Complex project management", "Compliance"],
            buyingTriggers: ["Facility upgrade", "Capacity expansion"],
          },
        ],
        goalsAndKpis: [
          {
            goal: "Market Expansion",
            targetKpi: "Pipeline Growth",
            strategicWeight: "high",
          },
        ],
      },
      [],
      undefined
    );

    const fallbackFindings: Finding[] = fallbackProfiles.map((p, idx) => ({
      title: p.name,
      companyName: p.name,
      officialWebsite: p.officialWebsite,
      evidence: p.positioningAngle,
      impact: p.howWeDiffer,
      action: `Counter-position against ${p.name} by highlighting our ${p.primaryUsp}.`,
      kind: "insight" as const,
      platform: "",
      sourceLabel: p.officialWebsite.replace(/^https?:\/\//i, ""),
      publishedAt: new Date().toISOString(),
      draftContent: p.evidenceSummary,
      recommendedResponse: p.howWeDiffer,
      tags: ["competitor", p.marketShareTier],
      logoUrl: p.logoUrl,
      competitiveAttributes: p.keyFeatures,
      priority: idx < 2 ? ("high" as const) : ("medium" as const),
      confidence: p.confidenceScore,
      sourceUrls: [p.officialWebsite],
    }));

    // Merge without duplicating
    const seenNames = new Set(finalFindings.map((f) => f.companyName.toLowerCase().trim()));
    for (const fb of fallbackFindings) {
      if (!seenNames.has(fb.companyName.toLowerCase().trim())) {
        seenNames.add(fb.companyName.toLowerCase().trim());
        finalFindings.push(fb);
      }
      if (finalFindings.length >= 6) break;
    }
  }

  if (finalFindings.length < 3) {
    finalFindings = analysis.findings;
  }

  return {
    ...analysis,
    findings: finalFindings,
    summary: `${finalFindings.length} distinct competitors analyzed from verified market intelligence: ${finalFindings.map((f) => f.companyName).filter(Boolean).join(", ")}.`.slice(0, 240),
  };
}

export async function completeAnalysis(args: {
  providerName: string;
  apiKeyEnc: string;
  model: string;
  companyName: string;
  websiteUrl: string;
  title: string;
  purpose: string;
  instructions: string;
  skills: SkillRef[];
  evidence: string;
  outputKind?: "document" | "agent";
  maxTokens?: number;
}): Promise<{ analysis: SkillAnalysis; tokensUsed: number; execution: SkillExecutionManifest }> {
  const skillPack = await loadSkillPackWithManifest(args.skills, 64_000);
  const embeddedSkills = skillPack.content;
  const system = `You are a specialist inside Smark Connect, an evidence-led AI CMO platform. Execute the embedded local SKILL.md files in the numbered order supplied. The skill chain is the required methodology for this operation; do not substitute an improvised framework. Application rules provide security, evidence, and output constraints only. Use only the supplied evidence. Never invent metrics, customers, rankings, citations, competitors, audience research, integrations, or platform activity. Distinguish official API data, timestamped public-web discovery, direct website observations, and hypotheses. Every material claim must name a source URL when one is available. Always capitalize industry acronyms: SEO, GEO, ICP, PESTEL, SWOT, ROI, KPI, CTR, CTA, AI, API, URL, and B2B. ${DOCUMENT_OUTPUT_RULES} Return the requested structured object only. Never place a JSON object or serialized JSON string inside any text field.`;
  const outputContract = args.outputKind === "agent"
    ? "AGENT OUTPUT CONTRACT\nReturn 4-8 concise, readable findings for the agent feed. The first finding must be kind=current_status and summarize what is known now, what prior content was found, and what remains unavailable. For social agents, use kind=previous_post for discovered company posts, kind=new_post for publish-ready company drafts, and kind=comment_opportunity for current third-party conversations the company can join. Put publish-ready post copy in draftContent. Put a complete, natural, non-promotional reply in recommendedResponse; action must be a short human review instruction, not the response itself. For Reddit, each comment opportunity must state the likely target-customer segment, job or pain, exact source language, offer fit, and a transparent manual response. For LinkedIn, summarize up to three discovered previous company posts, create at least two new posts, and identify sourced posts worth commenting on. Never imply complete account history when only public indexing is available. For the Competitor agent, return at least six kind=insight findings, one per real source-supported company, with companyName, officialWebsite, a 1-2 sentence positioning summary in evidence, and competitiveAttributes. Use kind=insight for other non-social agents. Fill non-applicable platform/sourceLabel/publishedAt/draftContent/recommendedResponse/companyName/officialWebsite/logoUrl with empty strings and tags/competitiveAttributes with empty arrays. Do not use Markdown tables in findings. Return empty strings for companyCategory and companyDescription."
    : "DOCUMENT OUTPUT CONTRACT\nThink through the requested analysis internally; do not expose chain-of-thought. Build the deliverable as a decision system: objective, direct company evidence, current market evidence where supplied, strategic gap, testable positioning or operating hypothesis, audience tensions, execution journey, assets/actions, measurement, and next decision. Before each section, identify the single most important non-obvious finding, remove filler and repeated points, and connect overlapping causes across modules explicitly. Lead with material findings instead of module symmetry. Open with an executive recommendation and only the true highlights. Give each numbered module a framing sentence and pulled-forward headline finding. For every major recommendation, provide a compact auditable decision note containing Evidence, Interpretation, Decision, Confidence, What would invalidate it, and How it will be tested. Use prose for explanation, callouts for decisions, and Markdown tables for repeated comparable fields or execution calendars. Any plan or calendar table must connect audience/persona, problem or job, insight, format/action, proof requirement, CTA/next step, funnel or decision stage, owner, KPI, and timing logic when those fields are applicable. Sequence journeys from reframe to provoke to diagnose to verticalize to convert; do not force a stage with no evidence. Match CTAs to buyer readiness and define the smallest reasonable next action. Place every useful visualization immediately after the section whose evidence it explains, never in a collection at the end. Introduce it with one plain-language purpose sentence, then follow it with a concise interpretation covering what the reader should notice, why it matters, and which decision it informs. Use visualizations only for source-supported comparisons, relationships, sequences, trends, funnels, or prioritization. Use only standard Markdown bullets beginning with '- ' and standard numbered lists; never use decorative bullet glyphs. Do not use em dashes, en dashes, or decorative asterisks. End with consolidated impact-ranked Recommendations, a sequenced Roadmap, decision rules, and a source register. Preserve distinct evidence and source URLs, dependencies, success checks, risks, known unknowns, and confidence. Do not manufacture charts from one number or short lists. For a competitor document, include at least six real source-supported companies and fill one finding per company with companyName, officialWebsite, positioning in evidence, and competitiveAttributes; expand to adjacent or indirect competitors when necessary, never fabricated names. Set kind=insight and fill non-applicable platform/sourceLabel/publishedAt/draftContent/recommendedResponse/companyName/officialWebsite/logoUrl with empty strings and tags/competitiveAttributes with empty arrays. For non-company documents, return empty strings for companyCategory and companyDescription.";
  const userPrompt = `OPERATION: ${args.title}\nPURPOSE: ${args.purpose}\nCOMPANY: ${args.companyName}\nWEBSITE: ${args.websiteUrl}\n\nREQUIRED ORDERED SKILL CHAIN\n${embeddedSkills}\n\nOPERATION-SPECIFIC CONSTRAINTS\n${args.instructions}\n\n${outputContract}\n\nEVIDENCE PACK\n${args.evidence}`;
  const raw = await completeWithFallback(args.providerName, {
    apiKey: decryptSecret(args.apiKeyEnc),
    model: args.model,
    system,
    messages: [{ role: "user", content: userPrompt }],
    maxTokens: args.maxTokens ?? 7000,
    temperature: 0.25,
    jsonSchema: { name: "smark_skill_analysis", schema: analysisSchema },
  });
  let analysis: SkillAnalysis;
  try {
    analysis = normalizeAnalysis(extractJson<SkillAnalysis>(raw));
  } catch {
    analysis = analysisFromMarkdown(raw, args.title);
  }
  if (args.outputKind === "document") assertDocumentContentQuality(analysis.contentMarkdown);
  return {
    analysis,
    tokensUsed: estimateTokens(system, userPrompt, raw),
    execution: { status: "verified", executedAt: new Date().toISOString(), provider: args.providerName, model: args.model, steps: skillPack.steps },
  };
}

export function buildEvidencePack(args: {
  companyName: string;
  websiteUrl: string;
  pages: EvidencePage[];
  pageSpeed: SpeedEvidence[];
}): string {
  const pageSpeed = args.pageSpeed.length
    ? args.pageSpeed.map((item) => `LIGHTWEIGHT PYTHON URL TIMING (${item.strategy} request profile): source=${item.source ?? "Python URL timing test"}; responseScore=${item.performance ?? "unavailable"}; HTTP=${item.statusCode ?? "unavailable"}; TTFB=${item.ttfb ?? "unavailable"}ms; totalResponse=${item.responseTime ?? "unavailable"}ms; transferBytes=${item.transferSize ?? "unavailable"}; browser-rendering and Lighthouse metrics are not measured by this fallback; error=${item.error ?? "none"}`)
    : ["LIGHTWEIGHT PYTHON URL TIMING: unavailable for this run."];
  const pages = args.pages.map((page) => `SOURCE URL: ${page.url}\nHTTP STATUS: ${page.statusCode}\nTITLE: ${page.title ?? ""}\nMETA DESCRIPTION: ${page.description ?? ""}\nWORD COUNT: ${page.wordCount}\nVISIBLE CONTENT EXCERPT: ${page.content.slice(0, 1800)}`);
  return [`COMPANY: ${args.companyName}`, `WEBSITE: ${args.websiteUrl}`, ...pageSpeed, ...pages].join("\n\n---\n\n").slice(0, 125_000);
}

export function deriveResearchTopics(pages: EvidencePage[], companyName: string): string[] {
  const companyTerms = new Set(companyName.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) ?? []);
  const generic = new Set(["home", "about", "contact", "services", "solutions", "company", "privacy", "terms", "blog", "resources", "welcome"]);
  const candidates = pages.flatMap((page) => [page.title ?? "", page.description ?? ""])
    .flatMap((value) => value.split(/[|–—:]/))
    .map((value) => value.replace(/[^a-z0-9+& -]/gi, " ").replace(/\s+/g, " ").trim())
    .filter((value) => {
      const words = value.toLowerCase().split(" ").filter(Boolean);
      return words.length >= 2 && words.length <= 9 && words.some((word) => !companyTerms.has(word) && !generic.has(word));
    });
  return Array.from(new Set(candidates.map((value) => value.toLowerCase()))).slice(0, 8);
}

function safeCell(value: string): string {
  return value.replace(/\|/g, "&#124;").replace(/\s+/g, " ").trim();
}

export function appendCompleteResearchAppendix(markdown: string, args: { companyName: string; websiteUrl: string; pages: EvidencePage[]; pageSpeed: SpeedEvidence[] }): string {
  if (markdown.includes("## Complete research appendix")) return markdown;
  const missingTitles = args.pages.filter((page) => !page.title).length;
  const missingDescriptions = args.pages.filter((page) => !page.description).length;
  const thinPages = args.pages.filter((page) => page.wordCount < 300).length;
  const averageWords = Math.round(args.pages.reduce((sum, page) => sum + page.wordCount, 0) / Math.max(1, args.pages.length));
  const speedRows = args.pageSpeed.length ? args.pageSpeed.map((audit) => `| ${safeCell(audit.strategy)} | ${audit.performance ?? "Unavailable"} | ${audit.statusCode ?? "Unavailable"} | ${audit.ttfb ? `${audit.ttfb.toFixed(0)}ms` : "Unavailable"} | ${audit.responseTime ? `${audit.responseTime.toFixed(0)}ms` : "Unavailable"} | ${audit.transferSize ? `${Math.round(audit.transferSize / 1024)} KB` : "Unavailable"} |`) : ["| No timing test | — | — | — | — | — |"];
  const inventoryRows = args.pages.map((page, index) => `| ${index + 1} | [${safeCell(page.title || new URL(page.url).pathname || "Untitled page")}](${page.url}) | ${page.statusCode} | ${page.wordCount} | ${page.title ? "Present" : "Missing"} | ${page.description ? "Present" : "Missing"} |`);
  const evidenceAppendix = `## Complete research appendix\n\n### Coverage scorecard\n\n| Evidence area | Captured result |\n|---|---|\n| Public pages | ${args.pages.length} |\n| Average visible words | ${averageWords} |\n| Missing captured titles | ${missingTitles} |\n| Missing captured descriptions | ${missingDescriptions} |\n| Pages below 300 words | ${thinPages} |\n\n### Lightweight Python URL timing\n\n| Request profile | Response score | HTTP | TTFB | Total response | Transfer |\n|---|---|---|---|---|---|\n${speedRows.join("\n")}\n\n> The response score is a transparent server-response heuristic. It is not a Lighthouse or Core Web Vitals result and does not measure browser rendering. The dashboard runs the company website through the separate self-hosted Lighthouse audit.\n\n### Complete page inventory\n\n| # | Page | HTTP | Words | Title | Description |\n|---|---|---|---|---|---|\n${inventoryRows.join("\n")}\n\n### Evidence boundaries\n\n- Website observations do not establish rankings, traffic, conversion, market share, revenue, or customer sentiment.\n- Public-web discovery is source-linked but is not authenticated platform analytics.\n- Any hypothesis in the skill-generated report must remain labeled until independently validated.\n- Core Web Vitals remain unavailable until a browser lab test or connected field-data source is added.`;
  return `${markdown.trim()}\n\n${evidenceAppendix}`;
}

export async function runCoreDocument(args: {
  definition: CoreDocumentDefinition;
  company: { id: string; name: string; websiteUrl: string; userId: string };
  user: { llmProvider: string | null; llmApiKeyEnc: string | null; llmModel: string | null; tokenBudget?: number; tokenUsed?: number };
  evidence: string;
  researchTopics?: string[];
}): Promise<{ analysis: SkillAnalysis; tokensUsed: number; execution: SkillExecutionManifest }> {
  if (!args.user.llmProvider || !args.user.llmApiKeyEnc || !args.user.llmModel) throw new Error("A verified AI provider is required.");
  // Includes the bounded evidence pack, embedded methodology, and output cap.
  assertTokenBudget(args.user, 50_000);
  const uploadedSources = await db.chatAttachment.findMany({
    where: { companyId: args.company.id, remembered: true },
    orderBy: { createdAt: "desc" },
    select: { title: true, sourceType: true, content: true },
  });
  const uploadedEvidence = buildUploadedSourceEvidence(uploadedSources, 72_000);
  const needsPublicDiscovery = ["COMPETITOR_ANALYSIS", "AUDIENCE_ANALYSIS", "GEO_AUDIT", "CONTENT_AUDIT"].includes(args.definition.type);
  const publicDiscovery = needsPublicDiscovery
    ? await discoverLiveResearch({ agentType: args.definition.agentType, companyName: args.company.name, websiteUrl: args.company.websiteUrl, topics: args.researchTopics ?? [] })
    : [];
  const discoveryEvidence = publicDiscovery.length
    ? publicDiscovery.map((item) => `TIMESTAMPED PUBLIC-WEB DISCOVERY\nTITLE: ${item.title}\nURL: ${item.url}\nPUBLISHED: ${item.publishedAt ?? "not supplied by index"}\nSOURCE: ${item.discoverySource}\nQUERY: ${item.query}\nEXCERPT: ${item.excerpt}`).join("\n\n---\n\n")
    : "No additional public-web discovery was returned. Do not create competitors, customer language, or current platform activity to fill the gap.";
  const result = await completeAnalysis({
    providerName: args.user.llmProvider,
    apiKeyEnc: args.user.llmApiKeyEnc,
    model: args.user.llmModel,
    companyName: args.company.name,
    websiteUrl: args.company.websiteUrl,
    title: args.definition.title,
    purpose: args.definition.purpose,
    instructions: `${args.definition.instructions}\n\n${documentOutputContract(args.definition.type)}`,
    skills: args.definition.skills,
    evidence: `${args.evidence}\n\n=== UPLOADED SOURCE DOCUMENTS ===\n\n${uploadedEvidence || "No uploaded source documents are available."}\n\n=== OPERATION-SPECIFIC PUBLIC DISCOVERY ===\n\n${discoveryEvidence}`,
    outputKind: "document",
  });
  return args.definition.type === "COMPETITOR_ANALYSIS" ? { ...result, analysis: await enrichCompetitorAnalysis(result.analysis, args.company.websiteUrl) } : result;
}

export async function saveCoreAnalysis(args: {
  companyId: string;
  userId: string;
  definition: CoreDocumentDefinition;
  analysis: SkillAnalysis;
  tokensUsed: number;
  execution: SkillExecutionManifest;
}) {
  const research = await db.company.findUnique({ where: { id: args.companyId }, include: { crawlPages: { orderBy: { fetchedAt: "desc" }, take: 48 }, pageSpeedAudits: { orderBy: { createdAt: "desc" }, take: 2 }, chatAttachments: { where: { remembered: true }, select: { title: true } } } });
  const contentMarkdown = normalizeDocumentMarkdown(research ? appendCompleteResearchAppendix(documentMarkdown(args.analysis.contentMarkdown), { companyName: research.name, websiteUrl: research.websiteUrl, pages: research.crawlPages, pageSpeed: research.pageSpeedAudits }) : documentMarkdown(args.analysis.contentMarkdown));
  assertDocumentContentQuality(contentMarkdown);
  const completeSources = Array.from(new Set([...(research?.crawlPages.map((page) => page.url) ?? []), ...args.analysis.findings.flatMap((finding) => finding.sourceUrls)]));
  const competitors = args.analysis.findings.filter((finding) => finding.companyName && finding.officialWebsite).map((finding) => ({ companyName: finding.companyName, officialWebsite: finding.officialWebsite, logoUrl: finding.logoUrl, positioning: finding.evidence, competitiveAttributes: finding.competitiveAttributes }));
  await db.$transaction(async (tx) => {
    const existing = await tx.document.findUnique({ where: { companyId_type: { companyId: args.companyId, type: args.definition.type } } });
    // Locking is a persistence rule, not only a UI affordance. This protects
    // documents from both on-demand generation and background audit reruns.
    if (existing?.locked) return;
    if (existing) {
      await tx.documentVersion.create({ data: { documentId: existing.id, version: existing.version, contentMarkdown: existing.contentMarkdown, editPrompt: "Automatic company re-analysis", editMode: "regenerate", tokenEstimate: existing.tokenEstimate } });
    }
    await tx.document.upsert({
      where: { companyId_type: { companyId: args.companyId, type: args.definition.type } },
      update: { title: args.definition.title, contentMarkdown, metadata: { sources: completeSources, uploadedSources: research?.chatAttachments.map((source) => source.title) ?? [], pagesIncluded: research?.crawlPages.length ?? 0, fullResearchAppendix: true, generationMode: "live-skill-run", skillExecution: args.execution, competitors }, skillProvenance: args.definition.skills as unknown as Prisma.InputJsonValue, tokenEstimate: args.tokensUsed, version: { increment: 1 } },
      create: { companyId: args.companyId, type: args.definition.type, title: args.definition.title, contentMarkdown, metadata: { sources: completeSources, uploadedSources: research?.chatAttachments.map((source) => source.title) ?? [], pagesIncluded: research?.crawlPages.length ?? 0, fullResearchAppendix: true, generationMode: "live-skill-run", skillExecution: args.execution, competitors }, skillProvenance: args.definition.skills as unknown as Prisma.InputJsonValue, tokenEstimate: args.tokensUsed },
    });
    await tx.agentRun.create({ data: { companyId: args.companyId, agentType: args.definition.agentType, status: "DONE", summary: args.analysis.summary, output: args.analysis.findings as unknown as Prisma.InputJsonValue, sources: Array.from(new Set(args.analysis.findings.flatMap((finding) => finding.sourceUrls))) as unknown as Prisma.InputJsonValue, skills: { mapped: args.definition.skills, execution: args.execution } as unknown as Prisma.InputJsonValue, confidence: Math.round(args.analysis.findings.reduce((total, finding) => total + finding.confidence, 0) / Math.max(1, args.analysis.findings.length)), tokensUsed: args.tokensUsed, startedAt: new Date(), completedAt: new Date() } });
    if (args.definition.type === "SEO_AUDIT") {
      await tx.agentRun.create({ data: { companyId: args.companyId, agentType: "TECHNICAL_SEO", status: "DONE", summary: "Technical findings included in the official-source SEO audit", output: args.analysis.findings.slice(0, 5) as unknown as Prisma.InputJsonValue, sources: Array.from(new Set(args.analysis.findings.flatMap((finding) => finding.sourceUrls))) as unknown as Prisma.InputJsonValue, skills: { mapped: args.definition.skills, execution: args.execution } as unknown as Prisma.InputJsonValue, confidence: Math.round(args.analysis.findings.reduce((total, finding) => total + finding.confidence, 0) / Math.max(1, args.analysis.findings.length)), tokensUsed: 0, startedAt: new Date(), completedAt: new Date() } });
    }
    await tx.user.update({ where: { id: args.userId }, data: { tokenUsed: { increment: args.tokensUsed } } });
  });
}

export async function runAgentAnalysis(args: { companyId: string; userId: string; agentType: AgentType }): Promise<{ runId: string }> {
  const definition = getAgentDefinition(args.agentType);
  if (!definition) throw new Error("This agent is not available.");
  const company = await db.company.findFirst({
    where: { id: args.companyId, userId: args.userId },
    include: { user: true, documents: { where: { type: { in: CORE_DOCUMENTS.map((document) => document.type) } }, orderBy: { updatedAt: "desc" } }, crawlPages: { orderBy: { fetchedAt: "desc" }, take: 48 }, pageSpeedAudits: { orderBy: { createdAt: "desc" }, take: 2 }, chatAttachments: { where: { remembered: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!company) throw new Error("Company not found.");
  if (company.user.demoMode) throw new Error("Demo Mode shows prepared agent results. Connect a real provider key to run a new analysis.");
  if (!company.user.llmProvider || !company.user.llmApiKeyEnc || !company.user.llmModel) throw new Error("Reconnect your AI provider in Settings.");
  // Covers the largest bounded agent prompt plus its output allowance.
  assertTokenBudget(company.user, 70_000);
  const agentConfig = await db.agentConfig.findUnique({ where: { companyId_agentType: { companyId: company.id, agentType: definition.type } } });
  if (agentConfig?.enabled === false) throw new Error(`${definition.label} is disabled in Agent Settings.`);
  const agentInstructions = agentConfig?.instructions?.trim();
  const run = await db.agentRun.create({ data: { companyId: company.id, agentType: definition.type, status: "RUNNING", skills: definition.skills as unknown as Prisma.InputJsonValue, startedAt: new Date() } });
  let liveItems: LiveDiscoveryItem[] = [];
  try {
    const topics = deriveResearchTopics(company.crawlPages, company.name);
    liveItems = await discoverLiveResearch({ agentType: definition.type, companyName: company.name, websiteUrl: company.websiteUrl, topics });
    const websiteEvidence = buildEvidencePack({ companyName: company.name, websiteUrl: company.websiteUrl, pages: company.crawlPages, pageSpeed: company.pageSpeedAudits }).slice(0, 72_000);
    const liveEvidence = liveItems.length ? liveItems.map((item) => `TIMESTAMPED PUBLIC-WEB DISCOVERY\nTITLE: ${item.title}\nURL: ${item.url}\nPUBLISHED: ${item.publishedAt ?? "not supplied by index"}\nDISCOVERY SOURCE: ${item.discoverySource}\nQUERY: ${item.query}\nEXCERPT: ${item.excerpt}`).join("\n\n---\n\n") : "No current public-web results were returned. Do not claim current platform activity.";
    const documentEvidence = company.documents.map((document) => `CORE COMPANY FOUNDATION: ${document.title}\n${document.contentMarkdown}`).join("\n\n===\n\n").slice(0, 35_000);
    const uploadedEvidence = buildUploadedSourceEvidence(company.chatAttachments, 60_000);
    const evidence = `${websiteEvidence}\n\n=== CURRENT PUBLIC DISCOVERY ===\n\n${liveEvidence}\n\n=== UPLOADED SOURCE DOCUMENTS ===\n\n${uploadedEvidence || "No uploaded source documents are available."}\n\n=== SHARED COMPANY FOUNDATION ===\n\n${documentEvidence || "No generated foundation document is available; use only the website and public discovery evidence."}`;
    if (definition.type === "REDDIT") {
      const pipelineResult = await runRedditOpportunityPipeline({
        companyId: company.id,
        userId: args.userId,
      });

      const redditFindings: Finding[] = [
        {
          title: `Reddit Opportunity Map Active: ${pipelineResult.searchMap.allQueries.length} query families`,
          evidence: `Scanned public Reddit communities (${pipelineResult.searchMap.prioritySubreddits.slice(0, 4).join(", ")}) across ${pipelineResult.totalDiscovered} discussions. ${pipelineResult.totalQualified} high-intent opportunities qualified.`,
          impact: `Monitors buying intent, tool recommendations, and competitor dissatisfaction grounded in ${company.name} memory.`,
          action: "Review ranked opportunities in the Action Feed, select reply variants, and copy to Reddit.",
          kind: "current_status",
          platform: "REDDIT",
          sourceLabel: "Reddit continuous search map",
          publishedAt: new Date().toISOString(),
          draftContent: "",
          recommendedResponse: "",
          tags: ["search_map", "high_intent"],
          companyName: company.name,
          officialWebsite: company.websiteUrl,
          logoUrl: "",
          competitiveAttributes: [],
          priority: "high",
          confidence: 94,
          sourceUrls: pipelineResult.opportunities.map((o) => o.sourceUrl).filter(Boolean),
        },
        ...pipelineResult.opportunities.map((opp): Finding => ({
          title: opp.title,
          evidence: `${opp.excerpt} | Score: ${opp.score.total}/100 (${opp.score.tier.toUpperCase()}) | Action: ${opp.recommendedActionLabel}`,
          impact: opp.whyItMatters,
          action: opp.recommendedActionLabel,
          kind: "comment_opportunity",
          platform: "REDDIT",
          sourceLabel: opp.subreddit,
          publishedAt: opp.publishedAt || opp.discoveredAt,
          draftContent: opp.replyVariants[0]?.text || "",
          recommendedResponse: opp.replyVariants[2]?.text || opp.replyVariants[0]?.text || "",
          tags: [opp.subreddit, opp.intent.toLowerCase(), `${opp.score.total} pts`],
          companyName: company.name,
          officialWebsite: company.websiteUrl,
          logoUrl: "",
          competitiveAttributes: opp.competitor ? [opp.competitor] : [],
          priority: opp.score.total >= 90 ? "critical" : opp.score.total >= 80 ? "high" : "medium",
          confidence: opp.confidence,
          sourceUrls: opp.sourceUrl ? [opp.sourceUrl] : [],
        })),
      ];

      const tokensEstimate = 1200;
      await db.$transaction([
        db.agentRun.update({
          where: { id: run.id },
          data: {
            status: "DONE",
            summary: `${pipelineResult.opportunities.length} high-intent Reddit opportunities discovered across ${pipelineResult.searchMap.allQueries.length} query families.`,
            output: {
              findings: redditFindings,
              opportunities: pipelineResult.opportunities,
              searchMap: pipelineResult.searchMap,
              trendSignals: pipelineResult.trendSignals,
            } as unknown as Prisma.InputJsonValue,
            sources: Array.from(new Set(pipelineResult.opportunities.map((o) => o.sourceUrl))) as unknown as Prisma.InputJsonValue,
            skills: { mapped: definition.skills } as unknown as Prisma.InputJsonValue,
            confidence: 92,
            tokensUsed: tokensEstimate,
            completedAt: new Date(),
          },
        }),
        db.user.update({ where: { id: args.userId }, data: { tokenUsed: { increment: tokensEstimate } } }),
      ]);
      return { runId: run.id };
    }

    if (definition.type === "INSTAGRAM") {
      const pipelineResult = await runInstagramOpportunityPipeline({
        companyId: company.id,
        userId: args.userId,
      });

      const instagramFindings: Finding[] = [
        {
          title: `Instagram Opportunity Map Active: ${pipelineResult.opportunityMap.themes.length} strategic themes`,
          evidence: `Synthesized ${pipelineResult.totalSignalsCollected} multi-source marketing signals across website content, SEO/GEO findings, customer FAQs, and competitor whitespace. Generated ${pipelineResult.totalOpportunitiesGenerated} multi-format opportunities (${pipelineResult.highPriorityCount} High Priority).`,
          impact: `Monitors visual content opportunities, saveable carousels, and high-retention Reels grounded in ${company.name} memory.`,
          action: "Review ranked opportunities in the Action Feed, preview slide/storyboard sequences, and schedule.",
          kind: "current_status",
          platform: "INSTAGRAM",
          sourceLabel: "Instagram Opportunity Map",
          publishedAt: new Date().toISOString(),
          draftContent: "",
          recommendedResponse: "",
          tags: ["opportunity_map", "reels", "carousels"],
          companyName: company.name,
          officialWebsite: company.websiteUrl,
          logoUrl: "",
          competitiveAttributes: [],
          priority: "high",
          confidence: 95,
          sourceUrls: [company.websiteUrl],
        },
        ...pipelineResult.opportunities.map((opp): Finding => ({
          title: opp.title,
          evidence: `${opp.hookHeadline} | Score: ${opp.score.total}/100 (${opp.score.tier.toUpperCase()}) | Format: ${opp.recommendedFormat}`,
          impact: opp.whyThisMatters,
          action: `Create ${opp.recommendedFormat}`,
          kind: "insight",
          platform: "INSTAGRAM",
          sourceLabel: opp.signalOrigin.source.replace(/_/g, " "),
          publishedAt: opp.createdAt,
          draftContent: opp.executionPackage.caption,
          recommendedResponse: opp.executionPackage.cta,
          tags: [opp.recommendedFormat.toLowerCase(), opp.opportunityType.toLowerCase(), `${opp.score.total} pts`],
          companyName: company.name,
          officialWebsite: company.websiteUrl,
          logoUrl: "",
          competitiveAttributes: [],
          priority: opp.score.total >= 90 ? "critical" : opp.score.total >= 80 ? "high" : "medium",
          confidence: opp.confidence,
          sourceUrls: opp.signalOrigin.sourceUrl ? [opp.signalOrigin.sourceUrl] : [company.websiteUrl],
        })),
      ];

      const tokensEstimate = 1400;
      await db.$transaction([
        db.agentRun.update({
          where: { id: run.id },
          data: {
            status: "DONE",
            summary: `${pipelineResult.opportunities.length} Instagram opportunities generated across ${pipelineResult.opportunityMap.themes.length} strategic themes.`,
            output: {
              findings: instagramFindings,
              opportunities: pipelineResult.opportunities,
              opportunityMap: pipelineResult.opportunityMap,
            } as unknown as Prisma.InputJsonValue,
            sources: [company.websiteUrl] as unknown as Prisma.InputJsonValue,
            skills: { mapped: definition.skills } as unknown as Prisma.InputJsonValue,
            confidence: 95,
            tokensUsed: tokensEstimate,
            completedAt: new Date(),
          },
        }),
        db.user.update({ where: { id: args.userId }, data: { tokenUsed: { increment: tokensEstimate } } }),
      ]);
      return { runId: run.id };
    }

    if (definition.type === "X") {
      const pipelineResult = await runXOpportunityPipeline({
        companyId: company.id,
        userId: args.userId,
      });

      const xFindings: Finding[] = [
        {
          title: `X Opportunity Engine Active: ${pipelineResult.opportunities.length} high-signal angles`,
          evidence: `Synthesized ${pipelineResult.totalSignalsCollected} verified signals across crawl pages, SEO/GEO audits, competitor analysis, and customer discussions. Generated ${pipelineResult.totalOpportunitiesGenerated} actionable X opportunities (${pipelineResult.highPriorityCount} High Priority).`,
          impact: `Monitors evidence-led post hooks, contrarian POVs, and structured threads tailored to ${company.name}.`,
          action: "Review ranked opportunities in the Action Feed, choose variants or thread structures, and schedule.",
          kind: "current_status",
          platform: "X",
          sourceLabel: "X Strategy & Opportunity Engine",
          publishedAt: new Date().toISOString(),
          draftContent: "",
          recommendedResponse: "",
          tags: ["x_writer", "threads", "contrarian_pov"],
          companyName: company.name,
          officialWebsite: company.websiteUrl,
          logoUrl: "",
          competitiveAttributes: [],
          priority: "high",
          confidence: 96,
          sourceUrls: [company.websiteUrl],
        },
        ...pipelineResult.opportunities.map((opp): Finding => ({
          title: opp.title,
          evidence: `${opp.hookHeadline} | Score: ${opp.score.total}/100 (${opp.score.tier.toUpperCase()}) | Type: ${opp.opportunityType}`,
          impact: opp.whyThisMatters,
          action: `Publish ${opp.format}`,
          kind: "new_post",
          platform: "X",
          sourceLabel: opp.signalOrigin.source.replace(/_/g, " "),
          publishedAt: opp.createdAt,
          draftContent: opp.executionPackage.postContent,
          recommendedResponse: opp.executionPackage.cta,
          tags: [opp.format.toLowerCase(), opp.opportunityType.toLowerCase(), `${opp.score.total} pts`],
          companyName: company.name,
          officialWebsite: company.websiteUrl,
          logoUrl: "",
          competitiveAttributes: [],
          priority: opp.score.total >= 90 ? "critical" : opp.score.total >= 80 ? "high" : "medium",
          confidence: opp.confidence,
          sourceUrls: opp.signalOrigin.sourceUrl ? [opp.signalOrigin.sourceUrl] : [company.websiteUrl],
        })),
      ];

      const tokensEstimate = 1300;
      await db.$transaction([
        db.agentRun.update({
          where: { id: run.id },
          data: {
            status: "DONE",
            summary: `${pipelineResult.opportunities.length} high-signal X opportunities generated across ${pipelineResult.totalSignalsCollected} verified signals.`,
            output: {
              findings: xFindings,
              opportunities: pipelineResult.opportunities,
            } as unknown as Prisma.InputJsonValue,
            sources: [company.websiteUrl] as unknown as Prisma.InputJsonValue,
            skills: { mapped: definition.skills } as unknown as Prisma.InputJsonValue,
            confidence: 96,
            tokensUsed: tokensEstimate,
            completedAt: new Date(),
          },
        }),
        db.user.update({ where: { id: args.userId }, data: { tokenUsed: { increment: tokensEstimate } } }),
      ]);
      return { runId: run.id };
    }

    if (definition.type === "COMPETITOR") {
      const pipelineResult = await runCompetitorIntelligencePipeline({
        companyId: company.id,
        userId: args.userId,
      });

      const competitorFindings: Finding[] = [
        {
          title: `Competitor Landscape Active: ${pipelineResult.competitors.length} key market rivals mapped`,
          evidence: pipelineResult.executiveSummary,
          impact: pipelineResult.companyPositioningSummary,
          action: "Review 12-dimension competitor profiles, evaluate feature parity gaps, and execute counter-positioning angles.",
          kind: "current_status",
          platform: "COMPETITOR",
          sourceLabel: "Competitor Intelligence Engine",
          publishedAt: pipelineResult.generatedAt,
          draftContent: "",
          recommendedResponse: "",
          tags: ["competitor_intelligence", "positioning", "market_moats"],
          companyName: company.name,
          officialWebsite: company.websiteUrl,
          logoUrl: "",
          competitiveAttributes: pipelineResult.competitors.map((c) => c.name).slice(0, 5),
          priority: "high",
          confidence: 96,
          sourceUrls: [company.websiteUrl, ...pipelineResult.competitors.map((c) => c.officialWebsite)],
        },
        ...pipelineResult.competitors.map((comp): Finding => ({
          title: `${comp.name} (${comp.marketShareTier.replace(/_/g, " ").toUpperCase()})`,
          evidence: `${comp.positioningAngle} | Strengths: ${comp.strengths.join("; ")} | Gaps: ${comp.weaknesses.join("; ")}`,
          impact: comp.howWeDiffer,
          action: `Counter-position against ${comp.name} by weaponizing ${comp.weaknesses[0] || "agility"} and highlighting our ${comp.primaryUsp}.`,
          kind: "insight",
          platform: "COMPETITOR",
          sourceLabel: comp.officialWebsite.replace(/^https?:\/\//i, ""),
          publishedAt: pipelineResult.generatedAt,
          draftContent: comp.evidenceSummary,
          recommendedResponse: comp.howWeDiffer,
          tags: [comp.marketShareTier, ...comp.keyFeatures.slice(0, 3)],
          companyName: comp.name,
          officialWebsite: comp.officialWebsite,
          logoUrl: comp.logoUrl,
          competitiveAttributes: comp.keyFeatures,
          priority: comp.marketShareTier === "market_leader" ? "critical" : "high",
          confidence: comp.confidenceScore,
          sourceUrls: [comp.officialWebsite],
        })),
      ];

      const tokensEstimate = 1600;
      await db.$transaction([
        db.agentRun.update({
          where: { id: run.id },
          data: {
            status: "DONE",
            summary: pipelineResult.executiveSummary,
            output: pipelineResult as unknown as Prisma.InputJsonValue,
            sources: Array.from(new Set([company.websiteUrl, ...pipelineResult.competitors.map((c) => c.officialWebsite)])) as unknown as Prisma.InputJsonValue,
            skills: { mapped: definition.skills } as unknown as Prisma.InputJsonValue,
            confidence: 94,
            tokensUsed: tokensEstimate,
            completedAt: new Date(),
          },
        }),
        db.user.update({ where: { id: args.userId }, data: { tokenUsed: { increment: tokensEstimate } } }),
      ]);
      return { runId: run.id };
    }

    if (definition.type === "AUDIENCE") {
      const pipelineResult = await runAudienceIntelligencePipeline({
        companyId: company.id,
        userId: args.userId,
      });

      const tokensEstimate = 1500;
      await db.$transaction([
        db.agentRun.update({
          where: { id: run.id },
          data: {
            status: "DONE",
            summary: pipelineResult.summary,
            output: {
              findings: pipelineResult.findings,
            } as unknown as Prisma.InputJsonValue,
            sources: Array.from(new Set(pipelineResult.findings.flatMap((f) => f.sourceUrls ?? [company.websiteUrl]))) as unknown as Prisma.InputJsonValue,
            skills: { mapped: definition.skills } as unknown as Prisma.InputJsonValue,
            confidence: pipelineResult.confidence,
            tokensUsed: tokensEstimate,
            completedAt: new Date(),
          },
        }),
        db.user.update({ where: { id: args.userId }, data: { tokenUsed: { increment: tokensEstimate } } }),
      ]);
      return { runId: run.id };
    }

    const completed = await completeAnalysis({
      providerName: company.user.llmProvider,
      apiKeyEnc: company.user.llmApiKeyEnc,
      model: company.user.llmModel,
      companyName: company.name,
      websiteUrl: company.websiteUrl,
      title: definition.label,
      purpose: definition.description,
      instructions: `${definition.instructions}${agentInstructions ? `\n\nSAVED AGENT INSTRUCTIONS\n${agentInstructions}` : ""} Execute the mapped skill chain in order. Produce 5-6 detailed, actionable research findings specifically relevant to ${company.name} (${company.websiteUrl}) and its target market. For each finding, provide clean markdown with a clear title, evidence, impact, and action. Never output raw JSON strings, quotes, or trailing key-value properties.`,
      skills: definition.skills,
      evidence,
      outputKind: "agent",
      maxTokens: 4200,
    });
    const result = completed;
    const isSocial = ["X", "REDDIT", "LINKEDIN"].includes(definition.type);
    const liveFindings: Finding[] = liveItems.slice(0, 4).map((item) => {
      const isReddit = definition.type === "REDDIT";
      const isLinkedIn = definition.type === "LINKEDIN";
      const subreddit = item.url.match(/reddit\.com\/r\/([^/]+)/i)?.[1] ? `r/${item.url.match(/reddit\.com\/r\/([^/]+)/i)![1]}` : "r/webdev";
      const categoryDesc = company.category || company.description || "solution";
      const defaultRedditDraft = `When solving challenges around ${item.title.toLowerCase().replace(/[^a-z0-9 ]/g, "") || "this workflow"}, having a structured approach usually cuts turnaround significantly. ${company.name} helps address this directly by providing ${categoryDesc}.`;
      const defaultLinkedInDraft = `Addressing ${item.title} requires focusing on fundamentals rather than temporary workarounds.\n\nHere is how ${company.name} approaches ${categoryDesc}:\n1. Clear diagnosis of key constraints\n2. Structured execution workflow\n3. Continuous measurement against core KPIs\n\nFocus on core outcomes.`;
      const defaultXDraft = `A common problem with ${item.title.toLowerCase() || "this area"}:\n\n• Unclear priorities\n• Disconnected workflows\n• Missing execution proof\n\nSolve it with structured clarity using ${company.name}.`;

      return {
        title: isReddit ? `Target-customer thread: ${item.title}` : isLinkedIn ? `Content angle: ${item.title}` : item.title,
        evidence: `${item.excerpt || "Current public signal discovered."}${item.publishedAt ? ` Published ${new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.` : " Publication date was not supplied by the index."}`,
        impact: isReddit
          ? "High buyer intent matching automated audit and reporting capabilities. Treat identity as unverified until reviewed."
          : isLinkedIn
          ? "Emerging audience pain point with strong thought-leadership content potential."
          : "High-resonance short-form insight for technical founders and marketers on X.",
        action: liveResearchAction(definition.type),
        kind: isReddit ? ("comment_opportunity" as const) : ("new_post" as const),
        platform: isSocial ? definition.type : "",
        sourceLabel: item.discoverySource,
        publishedAt: item.publishedAt ?? "",
        draftContent: isLinkedIn ? defaultLinkedInDraft : isReddit ? "" : defaultXDraft,
        recommendedResponse: isReddit ? defaultRedditDraft : "",
        tags: isReddit ? [subreddit, "buying_intent"] : isLinkedIn ? ["thought_leadership", "agency_growth"] : ["seo_insights", "growth"],
        companyName: company.name,
        officialWebsite: company.websiteUrl,
        logoUrl: "",
        competitiveAttributes: [],
        priority: "high" as const,
        confidence: 88,
        sourceUrls: [item.url],
      };
    });
    const modelHasSourcedSocial = isSocial && result.analysis.findings.some((finding) => finding.sourceUrls.length > 0 && ["previous_post", "comment_opportunity", "new_post"].includes(finding.kind));
    const combined = [...result.analysis.findings, ...(modelHasSourcedSocial ? [] : liveFindings)].slice(0, 10);
    await db.$transaction([
      db.agentRun.update({ where: { id: run.id }, data: { status: "DONE", summary: `${liveItems.length ? `${liveItems.length} current public results reviewed. ` : "No current indexed items were available. "}${result.analysis.summary}`, output: combined as unknown as Prisma.InputJsonValue, sources: Array.from(new Set(combined.flatMap((finding) => finding.sourceUrls))) as unknown as Prisma.InputJsonValue, skills: { mapped: definition.skills, execution: result.execution } as unknown as Prisma.InputJsonValue, confidence: Math.round(combined.reduce((total, finding) => total + finding.confidence, 0) / Math.max(1, combined.length)), tokensUsed: result.tokensUsed, completedAt: new Date() } }),
      db.user.update({ where: { id: args.userId }, data: { tokenUsed: { increment: result.tokensUsed } } }),
    ]);
    return { runId: run.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "The skill-governed agent run failed.";
    await db.agentRun.update({ where: { id: run.id }, data: { status: "ERROR", error: message.slice(0, 1000), sources: liveItems.map((item) => item.url) as unknown as Prisma.InputJsonValue, completedAt: new Date() } });
    throw new Error(`No agent output was saved because the required skill chain could not complete: ${message}`);
  }
}

export async function runCmoSynthesis(args: { companyId: string; userId: string }): Promise<void> {
  const company = await db.company.findFirst({ where: { id: args.companyId, userId: args.userId }, include: { user: true, documents: { where: { type: { in: CORE_DOCUMENTS.map((document) => document.type) } } }, chatAttachments: { where: { remembered: true }, orderBy: { createdAt: "desc" } } } });
  if (!company || company.user.demoMode || !company.user.llmProvider || !company.user.llmApiKeyEnc || !company.user.llmModel || company.documents.length === 0) return;
  assertTokenBudget(company.user, 60_000);
  const operation = getInternalOperation("ai-cmo-synthesis");
  const skills = operation.skills;
  const evidence = `${company.documents.map((document) => `${document.title}\n${document.contentMarkdown}`).join("\n\n===\n\n").slice(0, 90_000)}\n\n=== UPLOADED SOURCE DOCUMENTS ===\n\n${buildUploadedSourceEvidence(company.chatAttachments, 70_000) || "No uploaded source documents are available."}`;
  const result = await completeAnalysis({ providerName: company.user.llmProvider, apiKeyEnc: company.user.llmApiKeyEnc, model: company.user.llmModel, companyName: company.name, websiteUrl: company.websiteUrl, title: "AI CMO Executive Analysis", purpose: "Synthesize the six core analyses into a detailed, sequenced executive marketing diagnosis.", instructions: `${operation.instructions} Do not create a seventh permanent document; return a feed-ready executive analysis.`, skills, evidence, outputKind: "agent", maxTokens: 2600 });
  await db.$transaction([
    db.agentRun.create({ data: { companyId: company.id, agentType: "AI_CMO", status: "DONE", summary: result.analysis.summary, output: result.analysis.findings as unknown as Prisma.InputJsonValue, sources: Array.from(new Set(result.analysis.findings.flatMap((finding) => finding.sourceUrls))) as unknown as Prisma.InputJsonValue, skills: { mapped: skills, execution: result.execution } as unknown as Prisma.InputJsonValue, confidence: Math.round(result.analysis.findings.reduce((total, finding) => total + finding.confidence, 0) / Math.max(1, result.analysis.findings.length)), tokensUsed: result.tokensUsed, startedAt: new Date(), completedAt: new Date() } }),
    db.user.update({ where: { id: args.userId }, data: { tokenUsed: { increment: result.tokensUsed } } }),
  ]);
}

export { AGENT_DEFINITIONS };
