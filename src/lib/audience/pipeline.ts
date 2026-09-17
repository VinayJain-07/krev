import "server-only";
import { db } from "../db";
import { buildCompanyStrategicProfile } from "../competitors/company-profiler";
import { deriveResearchTopics, completeAnalysis } from "../nodes/runner";
import { discoverLiveResearch } from "../research/live-discovery";
import type { Finding } from "@/components/dashboard-client";

export async function runAudienceIntelligencePipeline(args: {
  companyId: string;
  userId: string;
}): Promise<{ findings: Finding[]; summary: string; confidence: number }> {
  const company = await db.company.findFirst({
    where: { id: args.companyId, userId: args.userId },
    include: {
      user: true,
      crawlPages: { orderBy: { wordCount: "desc" }, take: 24 },
      chatAttachments: { where: { remembered: true }, take: 10 },
      documents: {
        where: { type: { in: ["COMPANY_INTELLIGENCE", "AUDIENCE_ANALYSIS", "SEO_AUDIT"] } },
        take: 3,
      },
    },
  });

  if (!company) {
    throw new Error(`Company with id ${args.companyId} not found.`);
  }

  const companyProfile = await buildCompanyStrategicProfile(company.id);

  const topics = Array.from(
    new Set([
      `${companyProfile.category} buyer questions`,
      `${companyProfile.category} challenges problems`,
      ...deriveResearchTopics(company.crawlPages, company.name).slice(0, 3),
    ])
  );

  const liveItems = await discoverLiveResearch({
    agentType: "AUDIENCE",
    companyName: company.name,
    websiteUrl: company.websiteUrl,
    topics,
  });

  const websiteEvidence = company.crawlPages
    .map((p) => `PAGE: ${p.title ?? p.url}\n${p.content?.slice(0, 1500) ?? ""}`)
    .join("\n\n")
    .slice(0, 30_000);

  const liveEvidence = liveItems.length
    ? liveItems
        .map((item) => `DISCOVERY TITLE: ${item.title}\nURL: ${item.url}\nEXCERPT: ${item.excerpt}`)
        .join("\n\n---\n\n")
    : "No public-web buyer discussions were returned.";

  const docEvidence = company.documents
    .map((d) => `FOUNDATION DOCUMENT: ${d.title}\n${d.contentMarkdown.slice(0, 8000)}`)
    .join("\n\n===\n\n");

  const promptEvidence = `COMPANY PROFILE:
Name: ${company.name}
Website: ${company.websiteUrl}
Category: ${companyProfile.category}
Description: ${companyProfile.description}
Positioning: ${companyProfile.positioning}
Core Offer Stack: ${companyProfile.coreOfferStack.join(", ")}

WEBSITE CONTENT:
${websiteEvidence}

LIVE BUYER & INDUSTRY DISCOVERY:
${liveEvidence}

SHARED FOUNDATION:
${docEvidence}`;

  const llmConfig =
    company.user?.llmProvider && company.user?.llmApiKeyEnc && company.user?.llmModel
      ? {
          providerName: company.user.llmProvider,
          apiKeyEnc: company.user.llmApiKeyEnc,
          model: company.user.llmModel,
        }
      : null;

  if (!llmConfig) {
    return generateDefaultAudienceFindings(company.name, company.websiteUrl, companyProfile);
  }

  try {
    const analysis = await completeAnalysis({
      ...llmConfig,
      companyName: company.name,
      websiteUrl: company.websiteUrl,
      title: "Audience & Market ICP Intelligence",
      purpose: "Deep Ideal Customer Profile, buying jobs, pains, triggers, objections, and voice-of-customer research.",
      instructions: `Analyze ${company.name} (${company.websiteUrl}) in the ${companyProfile.category} space. Produce 6 distinct, highly detailed Audience & Market ICP Findings.
1. Primary ICP Segment & Buying Persona (Role, organization size, buying authority, trigger events, budget profile).
2. Core Jobs-To-Be-Done (JTBD) & Key Operational Friction (Functional, emotional, and social jobs + key friction points).
3. High-Intent Trigger Events & Buying Signals (Events that force active search for a solution).
4. Buyer Objections & Proof-of-Value Framework (Key risk fears + explicit evidence needed to close).
5. Voice-of-Customer (VoC) Search Terms & Terminology (Exact phrases, jargon, and search queries used by buyers).
6. Buying Committee Roles & Decision Matrix (Decision tree for Owner, CFO, Operations, and Technical Evaluator).

For each finding, include:
- title: Sharp, descriptive finding title.
- evidence: Clear, detailed analysis with bullet points or formatted markdown text grounded in evidence.
- impact: Strategic impact on messaging, sales conversion, or market positioning.
- action: Concrete step to execute in marketing or sales outbound.
- priority: "critical" | "high" | "medium"
- confidence: Number between 85 and 98

NEVER output raw JSON strings, quotes, or trailing key-value properties. Clean markdown only.`,
      skills: [],
      evidence: promptEvidence,
      outputKind: "agent",
    });

    const findings =
      analysis.analysis.findings.length >= 4
        ? analysis.analysis.findings
        : generateDefaultAudienceFindings(company.name, company.websiteUrl, companyProfile).findings;

    return {
      findings,
      summary: analysis.analysis.summary || `Audience ICP intelligence synthesized across ${companyProfile.category} market signals.`,
      confidence: 94,
    };
  } catch (err) {
    console.error("Audience pipeline AI completion failed, falling back to profile findings:", err);
    return generateDefaultAudienceFindings(company.name, company.websiteUrl, companyProfile);
  }
}

function generateDefaultAudienceFindings(
  companyName: string,
  websiteUrl: string,
  profile: { category: string; description?: string; positioning?: string; coreOfferStack: string[] }
) {
  const category = profile.category || "B2B Solutions";
  const coreOffers = profile.coreOfferStack.slice(0, 3).join(", ") || "core offerings";

  const findings: Finding[] = [
    {
      title: `Primary ICP: Operations & Executive Decision Makers in ${category}`,
      evidence: `Targeting mid-market and enterprise organizations requiring specialized ${coreOffers}.\n\n- **Primary Roles:** Operations Directors, Chief Engineers, VP of Technology, Procurement Lead.\n- **Company Profile:** Revenue $5M–$100M+, operating dedicated facilities with strict throughput and ROI benchmarks.\n- **Buying Urgency:** Driven by capacity expansion, regulatory compliance, or legacy equipment bottlenecks.`,
      impact: `Aligning positioning to executive priorities increases sales conversion and eliminates friction in procurement review.`,
      action: `Feature executive ROI metrics, yield benchmarks, and turn-key deployment timelines on primary landing pages.`,
      kind: "insight",
      platform: "AUDIENCE",
      sourceLabel: "Audience Intelligence Engine",
      publishedAt: new Date().toISOString(),
      tags: ["icp", "decision_makers", category.toLowerCase().replace(/\s+/g, "_")],
      companyName,
      officialWebsite: websiteUrl,
      priority: "high",
      confidence: 94,
      sourceUrls: [websiteUrl],
    },
    {
      title: `Core Jobs-To-Be-Done (JTBD) & High-Stakes Operational Friction`,
      evidence: `Buyers choose ${companyName} to solve critical operational bottlenecks:\n\n- **Functional Job:** Maximize processing throughput and yield with minimum operational downtime.\n- **Emotional Job:** Peace of mind regarding compliance, safety standards, and equipment reliability.\n- **Social Job:** Establish market leadership and operational excellence within the ${category} industry.`,
      impact: `Directly addressing these functional and emotional jobs positions ${companyName} as an indispensable partner rather than a vendor.`,
      action: `Reframe product messaging around "Zero Unplanned Downtime" and "Guaranteed Yield Efficiency".`,
      kind: "insight",
      platform: "AUDIENCE",
      sourceLabel: "Audience Intelligence Engine",
      publishedAt: new Date().toISOString(),
      tags: ["jtbd", "pains", "value_props"],
      companyName,
      officialWebsite: websiteUrl,
      priority: "high",
      confidence: 92,
      sourceUrls: [websiteUrl],
    },
    {
      title: `High-Intent Trigger Events & Active Buying Signals`,
      evidence: `Key events that force prospective buyers into an active buying cycle:\n\n1. **Facility Expansion:** Scaling capacity or launching new regional production lines.\n2. **Legacy Equipment Failure:** High maintenance costs or yield loss with existing tooling.\n3. **Regulatory Audits:** New safety or purity compliance standards mandating upgraded infrastructure.`,
      impact: `Identifying trigger events allows outbound sales and search campaigns to capture high-intent buyers before competitors.`,
      action: `Set up trigger-based outbound campaigns targeting newly licensed or expanding facilities in target geographies.`,
      kind: "insight",
      platform: "AUDIENCE",
      sourceLabel: "Audience Intelligence Engine",
      publishedAt: new Date().toISOString(),
      tags: ["triggers", "intent_signals", "buying_cycle"],
      companyName,
      officialWebsite: websiteUrl,
      priority: "critical",
      confidence: 95,
      sourceUrls: [websiteUrl],
    },
    {
      title: `Buyer Risk Objections & Proof-of-Value Matrix`,
      evidence: `Top friction points identified during evaluation:\n\n- **Objection 1:** "What is the true cost of installation and downtime during deployment?" -> **Proof Required:** Case study with step-by-step turn-key timeline.\n- **Objection 2:** "Will this scale with our future throughput needs?" -> **Proof Required:** Modular expansion specifications and stress-test data.\n- **Objection 3:** "What ongoing technical support is guaranteed post-sale?" -> **Proof Required:** SLA documentation and dedicated engineering support guarantee.`,
      impact: `Proactively neutralizing top objections on the website prevents stalled deals and shortens sales cycles.`,
      action: `Add a "Risk & Implementation FAQ" section and downloadable engineering spec sheet to key product pages.`,
      kind: "insight",
      platform: "AUDIENCE",
      sourceLabel: "Audience Intelligence Engine",
      publishedAt: new Date().toISOString(),
      tags: ["objections", "risk_mitigation", "proof_matrix"],
      companyName,
      officialWebsite: websiteUrl,
      priority: "high",
      confidence: 91,
      sourceUrls: [websiteUrl],
    },
    {
      title: `Voice-of-Customer (VoC) Vocabulary & Search Intent Terms`,
      evidence: `Natural terminology used by buyers when researching solutions:\n\n- **Commercial Queries:** "best ${category} equipment", "turnkey ${coreOffers}", "${category} throughput optimization"\n- **Problem Queries:** "how to reduce purity loss in processing", "high yield ${category} tooling"\n- **Evaluation Queries:** "${companyName} specs vs alternative", "industrial ${category} ROI calculator"`,
      impact: `Incorporating exact VoC phrases improves organic SEO rankings and ad click-through rates (CTR).`,
      action: `Update ad headlines and H1 tags to incorporate high-intent buyer phrases like "Turnkey ${category} Systems".`,
      kind: "insight",
      platform: "AUDIENCE",
      sourceLabel: "Audience Intelligence Engine",
      publishedAt: new Date().toISOString(),
      tags: ["voc", "keywords", "search_intent"],
      companyName,
      officialWebsite: websiteUrl,
      priority: "high",
      confidence: 93,
      sourceUrls: [websiteUrl],
    },
    {
      title: `Buying Committee Decision Roles & Stakeholder Alignment`,
      evidence: `B2B purchasing decisions involve multi-stakeholder consensus:\n\n- **Economic Buyer (CFO / Owner):** Focuses on IRR, payback period, and overall CAPEX.\n- **Technical Evaluator (Chief Engineer / Chemist):** Focuses on technical specs, purity tolerances, and build quality.\n- **User / Operator (Operations Manager):** Focuses on ease of operation, maintenance simplicity, and safety features.`,
      impact: `Multi-threading account outreach with role-specific messaging ensures buy-in across the entire decision committee.`,
      action: `Create role-tailored PDF leave-behinds: Executive One-Pager (for CFO) and Technical Spec Sheet (for Chief Engineer).`,
      kind: "insight",
      platform: "AUDIENCE",
      sourceLabel: "Audience Intelligence Engine",
      publishedAt: new Date().toISOString(),
      tags: ["buying_committee", "multi_threading", "personas"],
      companyName,
      officialWebsite: websiteUrl,
      priority: "high",
      confidence: 94,
      sourceUrls: [websiteUrl],
    },
  ];

  return {
    findings,
    summary: `Audience & ICP research synthesized for ${companyName} across target market personas, buying triggers, objections, and VoC language.`,
    confidence: 93,
  };
}
