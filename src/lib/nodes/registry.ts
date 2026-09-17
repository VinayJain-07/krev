import type { AgentType, DocumentType } from "@prisma/client";

export type NodeRepository = "smark-node-1" | "smark-node-2" | "smark-node-3" | "local";
export type SkillRepository = NodeRepository;
export type NodePhase = "foundation" | "research" | "analysis" | "production" | "reporting" | "quality";
export type SkillPhase = NodePhase;

export type NodeRef = {
  repository: NodeRepository;
  node: string;
  skill: string;
  phase: NodePhase;
  reason: string;
};
export type SkillRef = NodeRef;

export type CoreDocumentDefinition = {
  type: DocumentType;
  title: string;
  agentType: AgentType;
  purpose: string;
  instructions: string;
  nodes: NodeRef[];
  skills: NodeRef[];
};

export type AgentDefinition = {
  type: AgentType;
  label: string;
  description: string;
  optional: boolean;
  nodes: NodeRef[];
  skills: NodeRef[];
  instructions: string;
};

export type InternalOperation = "ai-cmo-chat" | "ai-cmo-synthesis" | "document-edit";

export function node(repository: NodeRepository, name: string, phase: NodePhase, reason: string): NodeRef {
  return { repository, node: name, skill: name, phase, reason };
}
export const skill = node;

export function nodeLabel(ref: NodeRef): string {
  return `${ref.repository}/${ref.node ?? ref.skill}`;
}
export const skillLabel = nodeLabel;

export function mergeNodeChains(...chains: NodeRef[][]): NodeRef[] {
  return chains.flat().filter((ref, index, values) => values.findIndex((candidate) => candidate.repository === ref.repository && (candidate.node ?? candidate.skill) === (ref.node ?? ref.skill)) === index);
}
export const mergeSkillChains = mergeNodeChains;

const companyIntelligenceSkills = [
  skill("local", "source-triangulation", "foundation", "Triangulate company positioning and offer claims across multiple sources."),
  skill("smark-node-2", "product-marketing-context", "foundation", "Extract the offer, category, positioning, proof, and commercial context."),
  skill("smark-node-3", "brand-profile", "analysis", "Turn observed brand signals into a reusable brand foundation."),
  skill("smark-node-3", "voice-builder", "analysis", "Define evidence-backed voice and messaging guardrails."),
  skill("local", "citation-and-claim-qa", "quality", "Verify customer-facing claims against factual proof and evidence boundaries."),
  skill("smark-node-3", "content-research-and-sourcing", "quality", "Verify claims, label assumptions, and preserve source provenance."),
];

const seoAuditSkills = [
  skill("smark-node-1", "seo-audit", "foundation", "Use the main SEO audit skill as the governing audit workflow and report structure."),
  skill("smark-node-1", "seo-technical", "analysis", "Assess crawlability, indexability signals, performance, and technical risk."),
  skill("local", "core-web-vitals-diagnostics", "analysis", "Diagnose Core Web Vitals (LCP, CLS, INP, TTFB) performance constraints."),
  skill("smark-node-1", "seo-page", "analysis", "Inspect page-level titles, descriptions, headings, links, and intent alignment."),
  skill("smark-node-1", "seo-content", "analysis", "Evaluate content quality, depth, trust, and search usefulness."),
  skill("smark-node-1", "seo-schema", "analysis", "Audit structured-data evidence and valid schema opportunities."),
  skill("smark-node-1", "seo-sitemap", "analysis", "Evaluate sitemap coverage and information-discovery paths."),
  skill("smark-node-1", "seo-sxo", "analysis", "Connect search findings to user journeys and experience."),
  skill("smark-node-2", "seo-audit", "quality", "Apply a second audit lens for prioritization and actionability."),
];

const geoAuditSkills = [
  skill("smark-node-1", "seo-geo", "foundation", "Use the SEO/GEO workflow for AI-search readiness and citability."),
  skill("smark-node-2", "ai-seo", "analysis", "Assess answer coverage, authority signals, and AI discovery opportunities."),
  skill("smark-node-3", "ai-search-optimization", "analysis", "Evaluate the wider answer-engine source layer."),
  skill("local", "citation-and-claim-qa", "quality", "Enforce fact-checking, citations, and answer-engine citability proof."),
  skill("smark-node-3", "content-research-and-sourcing", "quality", "Require source-linked claims and explicit evidence boundaries."),
];

const competitorAnalysisSkills = [
  skill("smark-node-3", "brand-profile", "foundation", "Anchor comparison in the company's actual positioning and proof."),
  skill("smark-node-3", "audience-research", "research", "Frame competitors around the target customer's jobs and alternatives."),
  skill("smark-node-3", "competitor-analysis", "analysis", "Run the public-data SCOUT competitive landscape workflow."),
  skill("local", "competitive-landscape-matrix", "analysis", "Structure comprehensive side-by-side alternative and feature matrices."),
  skill("local", "swot-tows-analysis", "analysis", "Assess relative strengths, weaknesses, and defensible whitespace vs competitors."),
  skill("smark-node-2", "competitor-alternatives", "analysis", "Evaluate alternative categories and comparison-page opportunities."),
  skill("smark-node-1", "seo-competitor-pages", "analysis", "Assess search-facing competitor and alternative page opportunities."),
  skill("smark-node-3", "analytics-and-reporting", "reporting", "Turn sourced observations into an honest, decision-led competitor report."),
];

const competitorComparisonSkills = [
  skill("smark-node-2", "competitor-alternatives", "foundation", "Structure high-intent comparison and alternative page architectures."),
  skill("smark-node-1", "seo-competitor-pages", "analysis", "Target 'Alternative to [Competitor]' and '[Brand] vs [Competitor]' search queries."),
  skill("smark-node-2", "page-cro", "production", "Design feature matrix layouts, pricing contrast tables, and switch CTAs."),
  skill("smark-node-3", "voice-builder", "quality", "Maintain professional, objective, and defensible comparison copy."),
];

const audienceAnalysisSkills = [
  skill("smark-node-3", "brand-profile", "foundation", "Establish the brand, offer, and initial audience sketch."),
  skill("smark-node-2", "product-marketing-context", "foundation", "Connect audiences to offers, use cases, and buying questions."),
  skill("local", "live-conversation-mining", "research", "Mine live social and community conversations for genuine buyer intent and anxieties."),
  skill("smark-node-3", "audience-research", "research", "Build evidence-backed ICPs, JTBD, objections, and voice-of-customer language."),
  skill("smark-node-3", "data-and-original-research", "analysis", "Separate observed customer evidence from research hypotheses."),
  skill("smark-node-3", "content-research-and-sourcing", "quality", "Validate customer-language sources and flag missing first-party evidence."),
];

const contentAuditSkills = [
  skill("smark-node-3", "content-audit", "foundation", "Inventory and score existing content against a consistent audit method."),
  skill("smark-node-3", "content-research-and-sourcing", "research", "Assess source quality, proof, and freshness."),
  skill("smark-node-2", "content-strategy", "analysis", "Connect findings to business goals and funnel needs."),
  skill("smark-node-1", "seo-cluster", "analysis", "Map topic clusters and internal relationships."),
  skill("smark-node-1", "seo-content-brief", "production", "Convert verified gaps into actionable briefs."),
  skill("smark-node-3", "content-pillars", "production", "Create a focused, audience-led pillar system."),
  skill("smark-node-3", "analytics-and-reporting", "reporting", "Define honest measurement and refresh decisions."),
];

const marketingStrategySkills = [
  skill("smark-node-2", "product-marketing-context", "foundation", "Anchor strategy in the offer and market context."),
  skill("local", "pestel-analysis", "research", "Evaluate macro-environmental market forces (Political, Economic, Social, Tech, Legal)."),
  skill("smark-node-3", "audience-research", "research", "Prioritize the audience and buying jobs."),
  skill("local", "swot-tows-analysis", "analysis", "Synthesize SWOT findings into offensive and defensive TOWS strategic initiatives."),
  skill("smark-node-2", "marketing-ideas", "analysis", "Generate strategy options from the evidence."),
  skill("smark-node-2", "launch-strategy", "production", "Sequence campaigns and launch phases."),
  skill("smark-node-3", "campaign-and-launch-planning", "production", "Map channels, deliverables, dependencies, and ownership."),
  skill("smark-node-3", "goals-and-kpis", "reporting", "Tie the strategy to measurable outcomes and decision rules."),
];

const designGuideSkills = [
  skill("smark-node-3", "brand-profile", "foundation", "Anchor the visual system in observed brand evidence."),
  skill("local", "visual-report-composition", "production", "Guide executive document composition, visual rhythm, and chart hierarchy."),
  skill("smark-node-3", "design-and-templates", "production", "Define reusable layouts, hierarchy, and channel templates."),
  skill("smark-node-3", "infographic-and-data-viz", "production", "Specify honest data-display patterns."),
  skill("smark-node-3", "image-prompt", "production", "Create consistent production-ready visual briefs."),
  skill("smark-node-3", "platform-specs-and-validation", "quality", "Validate channel specifications and accessibility requirements."),
];

const contentStrategySkills = [
  skill("smark-node-3", "brand-profile", "foundation", "Use the approved brand and audience foundation."),
  skill("smark-node-2", "content-strategy", "analysis", "Define the business-led editorial strategy."),
  skill("smark-node-1", "seo-cluster", "analysis", "Create search-connected topic clusters."),
  skill("smark-node-1", "seo-content-brief", "production", "Turn topics into evidence-led production briefs."),
  skill("smark-node-3", "content-pillars", "production", "Create channel-relevant content pillars."),
  skill("smark-node-3", "cross-platform-repurposing", "production", "Design native distribution and repurposing flows."),
  skill("smark-node-3", "content-calendar", "production", "Sequence the plan into an executable calendar."),
  skill("smark-node-3", "analytics-and-reporting", "reporting", "Define outcome-led measurement and refresh rules."),
];

const productInfoSkills = [
  skill("smark-node-2", "product-marketing-context", "foundation", "Build the offer and product source of truth."),
  skill("smark-node-3", "audience-research", "research", "Connect offer details to customer jobs, pains, and objections."),
  skill("smark-node-2", "pricing-strategy", "analysis", "Assess packaging and pricing evidence without invented economics."),
  skill("smark-node-2", "sales-enablement", "production", "Create proof-led narratives and objection handling."),
  skill("smark-node-3", "content-research-and-sourcing", "quality", "Verify commercial claims and preserve known unknowns."),
];

const sourceQuality = skill("smark-node-3", "content-research-and-sourcing", "quality", "Verify public sources, freshness, and claim boundaries before output.");
const companyProductSkills = mergeSkillChains(companyIntelligenceSkills, productInfoSkills);
const contentAuditStrategySkills = mergeSkillChains(contentAuditSkills, contentStrategySkills);
const competitorLandscapeComparisonSkills = [
  ...mergeSkillChains(competitorAnalysisSkills, competitorComparisonSkills).filter((ref) => ref.skill !== "analytics-and-reporting"),
  skill("smark-node-3", "analytics-and-reporting", "reporting", "Turn the combined landscape and comparison research into an honest, decision-led report."),
];

export const CORE_DOCUMENTS: CoreDocumentDefinition[] = [
  { type: "COMPANY_INTELLIGENCE", title: "Company and Product Intelligence", agentType: "AI_CMO", purpose: "One reusable source of truth covering the company, offer, product, positioning, proof, objections, use cases, packaging, and sales enablement.", nodes: companyProductSkills, skills: companyProductSkills, instructions: "Build one company and product intelligence book. Cover company facts, category, business model, offer hierarchy, use cases, differentiators, proof, brand voice, messaging, objections, buying questions, packaging and pricing evidence, sales narratives, validation gaps, and source notes. Separate direct evidence, public discovery, and hypotheses. Include an offer/value stack, positioning constellation, proof ladder, objection/next-step decision tree, and known unknowns. Never invent commercial metrics or scores." },
  { type: "SEO_AUDIT", title: "SEO Audit", agentType: "SEO", purpose: "A prioritized technical, on-page, content, schema, sitemap, SXO, and performance audit governed by the main SEO audit skill.", nodes: seoAuditSkills, skills: seoAuditSkills, instructions: "Follow the main seo-audit skill first, then apply each specialist in chain order. Structure this as a diagnostic, not a generic strategy report. Never claim indexation, rankings, traffic, backlinks, Lighthouse, or Core Web Vitals without the connected source. Include a crawl-to-demand dependency path, a severity/effort decision matrix, an internal-link or template network, and evidence, owner, dependency, and falsifiable success check for every priority." },
  { type: "GEO_AUDIT", title: "GEO and AI Visibility Audit", agentType: "GEO", purpose: "AI-search readiness, entity clarity, citability, and answer coverage grounded in established search fundamentals.", nodes: geoAuditSkills, skills: geoAuditSkills, instructions: "Structure this as an answer-engine visibility map, not a generic strategy report. Evaluate entity clarity, answer passages, question coverage, evidence density, structured-data support, and third-party source opportunities. Include an entity/evidence graph, a citation-readiness ladder, and a buyer-question constellation. Do not invent AI citations, rankings, or readiness scores." },
  { type: "COMPETITOR_ANALYSIS", title: "Competitive Landscape and Comparison Playbook", agentType: "COMPETITOR", purpose: "One source-linked competitive landscape and comparison system covering alternatives, search posture, whitespace, page architecture, feature matrices, and defensible conversion copy.", nodes: competitorLandscapeComparisonSkills, skills: competitorLandscapeComparisonSkills, instructions: "Produce one competitive landscape and comparison playbook. Identify at least six real source-supported direct, adjacent, or indirect alternatives. For each, provide the official website, positioning, competitive attributes, evidence, and relevant comparison angle. Then turn the verified landscape into comparison-page architectures, feature matrices, pricing transparency blocks, migration or switching claims only when evidenced, and objective conversion copy. Include a positioning spectrum, qualitative whitespace map, page templates, shared criteria, and source register. Never fabricate names, metrics, market share, guarantees, or private performance." },
  { type: "AUDIENCE_ANALYSIS", title: "Audience and ICP Research", agentType: "AUDIENCE", purpose: "Evidence-backed ICPs, jobs-to-be-done, pains, objections, triggers, decision roles, and voice-of-customer language.", nodes: audienceAnalysisSkills, skills: audienceAnalysisSkills, instructions: "Create a human decision field guide, not a generic strategy report. Define one to three sharp segments, separating buyer, user, and follower where necessary. Include a jobs/tensions constellation, trigger-to-decision journey, buying-role decision tree, and explicit validation plan. Quote only customer language present in source evidence; mark every inferred audience statement as a hypothesis." },
  { type: "CONTENT_AUDIT", title: "Content Audit and Full-Funnel Strategy", agentType: "CONTENT_AUDIT", purpose: "One evidence-backed content system covering the existing inventory, quality findings, gaps, future editorial choices, search topics, distribution, briefs, calendars, and measurement.", nodes: contentAuditStrategySkills, skills: contentAuditStrategySkills, instructions: "Create one content audit and full-funnel strategy. Start with the supplied inventory: coverage, depth, proof, buyer-stage balance, duplication, freshness, and keep/refresh/consolidate decisions. Then turn verified gaps into pillars, topic clusters, production briefs, native formats, distribution and repurposing flows, owners, KPIs, refresh triggers, and a prioritized 90-day calendar. Do not repeat the inventory in the future plan. Never invent traffic, conversion, engagement, or search-demand values." },
];
const pageCroAuditSkills = [
  skill("smark-node-2", "page-cro", "foundation", "Audit page architecture, layout, above-the-fold clarity, and conversion bottlenecks."),
  skill("smark-node-2", "form-cro", "analysis", "Evaluate input friction, form fields, validation, and micro-conversions."),
  skill("smark-node-2", "marketing-psychology", "analysis", "Apply behavioral triggers, loss aversion, and social proof dynamics."),
  skill("smark-node-2", "copywriting", "production", "Draft high-converting headlines, value propositions, and CTA copy."),
];

const onboardingCroAuditSkills = [
  skill("smark-node-2", "onboarding-cro", "foundation", "Evaluate user onboarding, time-to-first-value, and activation milestones."),
  skill("smark-node-2", "paywall-upgrade-cro", "analysis", "Identify upgrade friction, plan gates, and paywall trigger points."),
  skill("smark-node-2", "churn-prevention", "production", "Define proactive retention touchpoints and re-engagement workflows."),
];

const abTestRoadmapSkills = [
  skill("smark-node-2", "ab-test-setup", "foundation", "Structure statistically sound A/B test variations and test parameters."),
  skill("smark-node-2", "marketing-ideas", "analysis", "Generate high-leverage growth hypotheses and experimentation angles."),
  skill("smark-node-3", "goals-and-kpis", "reporting", "Rank tests by ICE/PIE score and tie to revenue conversion metrics."),
];

const topicClusterSkills = [
  skill("smark-node-1", "seo-cluster", "foundation", "Map semantic topic clusters, hub-and-spoke architectures, and internal relationships."),
  skill("smark-node-1", "seo-content-brief", "analysis", "Generate production-ready content briefs for each sub-topic node."),
  skill("smark-node-2", "content-strategy", "production", "Connect clusters to full-funnel buyer intent and organic search demand."),
  skill("smark-node-1", "seo-sxo", "quality", "Align search experience optimization with navigation flow."),
];

const pseoBlueprintSkills = [
  skill("smark-node-1", "seo-programmatic", "foundation", "Audit template uniqueness, programmatic URL rules, and index bloat safeguards."),
  skill("smark-node-1", "seo-schema", "analysis", "Design structured-data schemas for scaled entity and database pages."),
  skill("smark-node-1", "seo-page", "production", "Specify dynamic title/meta templates and internal linking rules."),
  skill("smark-node-2", "free-tool-strategy", "quality", "Embed interactive value hooks on programmatic pages."),
];

const backlinkOutreachSkills = [
  skill("local", "off-page-seo-strategy", "foundation", "Apply the evidence, scoring, URL-validation, Excel-only output, and risk-control contract for the off-page program."),
  skill("smark-node-1", "seo-backlinks", "foundation", "Analyze competitor backlink profiles, unlinked brand mentions, and link gaps."),
  skill("smark-node-3", "data-and-original-research", "analysis", "Design linkable assets, benchmark surveys, and original data hooks."),
  skill("smark-node-2", "cold-email", "production", "Draft personalized editorial outreach and digital PR pitches."),
];

const localSeoAuditSkills = [
  skill("smark-node-1", "seo-local", "foundation", "Audit local search visibility, Google Business Profile readiness, and NAP signals."),
  skill("smark-node-1", "seo-maps", "analysis", "Evaluate local map pack ranking factors and review velocity."),
  skill("smark-node-1", "seo-schema", "production", "Design LocalBusiness and GeoCoordinates structured data."),
];

const coldOutboundPlaybookSkills = [
  skill("smark-node-2", "cold-email", "foundation", "Build cold email frameworks with high deliverability and personalization."),
  skill("smark-node-2", "product-marketing-context", "research", "Ground outreach in sharp customer pain points and verified proof points."),
  skill("smark-node-3", "audience-research", "analysis", "Segment messaging by decision maker, power user, and buying trigger."),
  skill("smark-node-2", "marketing-psychology", "production", "Apply curiosity hooks, low-friction asks, and 4-step sequence cadences."),
];

const emailLifecycleSkills = [
  skill("smark-node-2", "email-sequence", "foundation", "Design welcome, nurture, re-engagement, and onboarding email sequences."),
  skill("smark-node-2", "lead-magnets", "analysis", "Align email sequences with opt-in lead magnets and entry channels."),
  skill("smark-node-3", "brand-profile", "production", "Ensure visual and narrative brand alignment across all emails."),
  skill("smark-node-3", "voice-builder", "quality", "Enforce brand voice, tone, and banned phrase guardrails."),
];

const leadMagnetStrategySkills = [
  skill("smark-node-2", "lead-magnets", "foundation", "Design high-converting lead magnets, checklists, and templates."),
  skill("smark-node-2", "free-tool-strategy", "analysis", "Specify interactive calculators, audit widgets, and free tool architectures."),
  skill("smark-node-2", "content-strategy", "production", "Connect lead magnets to organic search and social capture surfaces."),
  skill("smark-node-2", "marketing-ideas", "quality", "Formulate distribution angles and promotional hooks."),
];

const paidAdsPlaybookSkills = [
  skill("smark-node-2", "paid-ads", "foundation", "Structure Google Search, LinkedIn B2B, and Meta performance ad campaigns."),
  skill("smark-node-2", "ad-creative", "production", "Draft search headlines, social display copy, and visual creative briefs."),
  skill("smark-node-2", "ab-test-setup", "analysis", "Design creative and audience split-testing matrices."),
  skill("smark-node-3", "goals-and-kpis", "reporting", "Establish ROAS/CAC benchmarks and stop/scale decision thresholds."),
];

const socialBatchPlanSkills = [
  skill("smark-node-3", "batch-content-plan", "foundation", "Build a 30-day multi-channel content calendar and publishing rhythm."),
  skill("smark-node-3", "content-pillars", "analysis", "Map posts to education, proof, thought leadership, and product pillars."),
  skill("smark-node-3", "carousel-writer", "production", "Draft LinkedIn and Instagram document carousels with slide outlines."),
  skill("smark-node-3", "caption-writer", "production", "Write engaging hooks, body copy, and conversation CTAs."),
];

const shortFormVideoSkills = [
  skill("smark-node-3", "short-form-video-script", "foundation", "Write 15s–60s video scripts for TikTok, Reels, and YouTube Shorts."),
  skill("smark-node-3", "ugc-and-influencer", "analysis", "Structure creator briefs, hook formulas, and visual B-roll directions."),
  skill("smark-node-3", "scripting-and-storyboarding", "production", "Outline visual scene pacing, teleprompter text, and on-screen graphics."),
];

const socialBatchPublishingSkills = mergeSkillChains(socialBatchPlanSkills, [
  skill("smark-node-3", "brand-profile", "foundation", "Apply the approved brand and visual foundation."),
  skill("smark-node-3", "voice-builder", "foundation", "Keep every channel in a consistent, credible voice."),
  skill("local", "live-conversation-mining", "research", "Identify current conversations and audience language worth responding to."),
  skill("smark-node-3", "linkedin-post-writer", "production", "Create native LinkedIn drafts."),
  skill("smark-node-3", "reels-script", "production", "Create short-form video concepts from the batch plan."),
  skill("smark-node-3", "story-writer", "production", "Create interactive Story sequences."),
  skill("smark-node-3", "cross-platform-repurposing", "quality", "Adapt each idea natively across social channels."),
  sourceQuality,
]);
const shortFormVideoUgcSkills = mergeSkillChains(shortFormVideoSkills, [
  skill("smark-node-3", "brand-profile", "foundation", "Apply the approved brand and visual foundation."),
  skill("smark-node-3", "voice-builder", "foundation", "Keep creator scripts natural and on-brand."),
  skill("smark-node-3", "ugc-and-influencer", "analysis", "Apply UGC authenticity, usage rights, and disclosure safeguards."),
  sourceQuality,
]);

const brandStorytellingSkills = [
  skill("smark-node-3", "behind-the-scenes-and-founder", "foundation", "Craft founder journey, build-in-public, and company origin narratives."),
  skill("smark-node-3", "before-after-and-transformation", "analysis", "Structure customer transformation case studies and ROI stories."),
  skill("smark-node-3", "storytelling-and-narrative", "production", "Write compelling case study narratives and customer proof points."),
];

const analyticsTrackingSkills = [
  skill("smark-node-2", "analytics-tracking", "foundation", "Design GA4, PostHog, and CDP event schemas and conversion tagging plans."),
  skill("smark-node-3", "analytics-and-reporting", "analysis", "Define UTM taxonomy, campaign tracking parameters, and channel attribution."),
  skill("smark-node-3", "goals-and-kpis", "reporting", "Map tracking infrastructure to executive marketing OKRs and KPIs."),
];

export const EXTENDED_DOCUMENTS: CoreDocumentDefinition[] = [
  { type: "MARKETING_STRATEGY", title: "Strategic Intelligence Report", agentType: "CAMPAIGN_PLANNER", purpose: "An executive strategic intelligence report connecting positioning, competitors, priorities, channels, campaigns, measurement, and operating rhythm.", nodes: marketingStrategySkills, skills: marketingStrategySkills, instructions: "Produce the same decision-led strategic intelligence experience as the executive PDF report rather than a generic analysis: an executive thesis, explicit audience and positioning choices, competitive whitespace, a strategy-on-a-page flywheel, channel-role pathway, campaign prioritization matrix, 30/60/90-day plan, KPIs, decision gates, dependencies, risks, confidence, and source register." },
  { type: "DESIGN_GUIDE", title: "Brand and Visual Design Guide", agentType: "CREATIVE_VISUAL", purpose: "A production-ready brand expression and campaign design system grounded in observed brand evidence.", nodes: designGuideSkills, skills: designGuideSkills, instructions: "Produce a brand expression system rather than a generic analysis. Cover aesthetic principles, color and typography roles, spacing, composition, imagery, iconography, data visualization, social templates, accessibility, examples, asset checklist, and production QA. Include a visual spectrum, token/component blueprint, and foundation-to-application stack. Label observed evidence versus proposed extensions." },
  { type: "PAGE_CRO_AUDIT", title: "Landing Page & Hero CRO Audit", agentType: "AI_CMO", purpose: "Evaluation of headline clarity, above-the-fold friction, CTA strength, social proof placement, and form conversion blockers.", nodes: pageCroAuditSkills, skills: pageCroAuditSkills, instructions: "Perform a rigorous CRO audit on the target landing pages. Break down hero section clarity, cognitive load, objection handling, trust placement, form fields, and CTA resonance. Provide before/after copy revisions and priority wireframe recommendations." },
  { type: "ONBOARDING_CRO_AUDIT", title: "Onboarding & Activation Audit", agentType: "AI_CMO", purpose: "Analysis of user sign-up flow, time-to-value friction, activation milestones, and upgrade trigger points.", nodes: onboardingCroAuditSkills, skills: onboardingCroAuditSkills, instructions: "Analyze user onboarding and post-signup activation flows. Map the time-to-first-value friction, drop-off risks, paywall gate timing, and email retention triggers." },
  { type: "AB_TEST_ROADMAP", title: "A/B Testing & Experimentation Roadmap", agentType: "CAMPAIGN_PLANNER", purpose: "Hypotheses, test variations, sample size estimates, and prioritized experiment backlog (ICE/PIE scored).", nodes: abTestRoadmapSkills, skills: abTestRoadmapSkills, instructions: "Formulate an actionable 90-day experimentation backlog. Structure each test with an evidence-backed hypothesis, control vs variation specifications, target metrics, sample size guidance, and ICE priority ranking." },
  { type: "TOPIC_CLUSTER_BLUEPRINT", title: "Topic Cluster & Pillar Architecture", agentType: "SEO", purpose: "Core pillar topics, sub-topic cluster maps, internal linking hierarchy, and content brief templates.", nodes: topicClusterSkills, skills: topicClusterSkills, instructions: "Design a comprehensive semantic topic cluster architecture. Specify pillar pages, 6-12 sub-topic cluster nodes per pillar, anchor text strategies, internal link topologies, and search intent alignment." },
  { type: "PSEO_BLUEPRINT", title: "Programmatic SEO (pSEO) Blueprint", agentType: "PROGRAMMATIC_SEO", purpose: "Template specifications, data schema mapping, URL patterns, and scale architecture for programmatic landing pages.", nodes: pseoBlueprintSkills, skills: pseoBlueprintSkills, instructions: "Design a scalable programmatic SEO system. Specify the database attributes, URL path taxonomy, >=40% unique content rules, JSON-LD schemas, canonical policies, and rollout milestones." },
  { type: "BACKLINK_OUTREACH_BLUEPRINT", title: "Off-Page SEO Strategy & Execution Workbook", agentType: "SEO", purpose: "An Excel-only operating system for validated prospects, digital PR, link earning, citations, outreach, 90-day delivery, and measurement.", nodes: backlinkOutreachSkills, skills: backlinkOutreachSkills, instructions: "Create an evidence-led off-page SEO program and execution workbook. Use the master workflow only as a candidate taxonomy, retain only endpoints that pass the application validation allowlist, and never repeat unverified authority, follow-attribute, traffic, pricing, or automation claims. Connect every action to a business goal, target page, reason, owner, KPI, risk control, and validation step. Include the five-part 0-10 opportunity score, a 30/60/90-day roadmap, outreach CRM, link earnings log, linkable asset backlog, KPI tracker, and validation registry. The only generated artifact for this document is XLSX." },
  { type: "LOCAL_SEO_AUDIT", title: "Local SEO & Google Business Profile Audit", agentType: "SEO", purpose: "Local citations, NAP consistency, Google Maps rank factors, and localized schema.", nodes: localSeoAuditSkills, skills: localSeoAuditSkills, instructions: "Evaluate local organic search and map pack visibility. Specify Google Business Profile optimizations, local schema markup, citation consistency, and geo-targeted landing page architectures." },
  { type: "COLD_OUTBOUND_PLAYBOOK", title: "Cold Outbound & Account-Based Playbook", agentType: "AUDIENCE", purpose: "ICP persona messaging matrices, personalized 4-step cold email sequences, trigger event hooks, and deliverability guardrails.", nodes: coldOutboundPlaybookSkills, skills: coldOutboundPlaybookSkills, instructions: "Build a complete cold outbound playbook. Provide 3 persona-specific 4-step email sequences, subject line variants, trigger-based personalization frameworks, follow-up timelines, and deliverability best practices." },
  { type: "EMAIL_LIFECYCLE_PLAYBOOK", title: "Email Lifecycle & Lead Nurture Architecture", agentType: "EMAIL_NEWSLETTER", purpose: "Welcome sequences, re-engagement workflows, educational nurture cadences, and lead magnet delivery sequences.", nodes: emailLifecycleSkills, skills: emailLifecycleSkills, instructions: "Architect full email lifecycle flows: lead magnet delivery sequence, 5-part welcome & onboarding series, educational nurture cadence, and 30-day re-engagement trigger campaigns with subject lines and preview text." },
  { type: "LEAD_MAGNET_STRATEGY", title: "Lead Magnet & Free Tool Strategy", agentType: "AI_CMO", purpose: "Interactive calculator/tool specs, checklist/template concepts, and high-conversion opt-in architectures.", nodes: leadMagnetStrategySkills, skills: leadMagnetStrategySkills, instructions: "Design high-converting top-of-funnel lead capture assets. Detail specifications for 2 interactive web tools/calculators, 3 downloadable frameworks/templates, and opt-in landing page wireframes." },
  { type: "PAID_ADS_PLAYBOOK", title: "Multi-Channel Paid Ads Playbook", agentType: "PAID_MEDIA", purpose: "Google Search ad copy & keyword intent match, LinkedIn B2B Sponsored Content briefs, and Meta creative variations.", nodes: paidAdsPlaybookSkills, skills: paidAdsPlaybookSkills, instructions: "Create a multi-channel paid acquisition plan. Draft 10 Google Search ad headlines/descriptions, 3 LinkedIn Sponsored Content angles, and 3 Meta visual ad briefs with audience targeting criteria and budget allocation models." },
  { type: "SOCIAL_BATCH_PLAN", title: "Social Batch Publishing Plan and Agent Pack", agentType: "LINKEDIN", purpose: "A 30-day, evidence-led social publishing system combining channel-native drafts, agent-ready opportunity discovery, repurposing, carousels, Reels, Stories, and production tracking.", nodes: socialBatchPublishingSkills, skills: socialBatchPublishingSkills, instructions: "Build a 30-day cross-platform social publishing system. Start from current audience conversations and verified company proof, then create 15 complete native post drafts, LinkedIn and Instagram carousel outlines, Reels concepts, interactive Stories, hooks, CTAs, repurposing instructions, owners, status, and publish timing. Preserve one source register and label hypotheses or missing inputs explicitly." },
  { type: "SHORT_FORM_VIDEO_BLUEPRINT", title: "Short-Form Video and UGC Agent Blueprint", agentType: "UGC_VIDEOS", purpose: "A production-ready short-form video and UGC system combining 15s–60s scripts, creator briefs, shot plans, disclosure safeguards, and multi-platform publishing guidance.", nodes: shortFormVideoUgcSkills, skills: shortFormVideoUgcSkills, instructions: "Draft five native Reels, TikTok, or YouTube Shorts concepts and three UGC creator briefs. Include the 0–3 second hook, on-screen text, teleprompter voiceover, shot list, B-roll, pacing, proof, CTA, creator archetype, usage-rights and disclosure checks, and repurposing notes. Never invent creators, testimonials, performance, or rights." },
  { type: "BRAND_STORYTELLING_GUIDE", title: "Brand Storytelling & Founder Thought Leadership", agentType: "LINKEDIN", purpose: "Founder narrative arcs, customer transformation case study frameworks, and milestone story templates.", nodes: brandStorytellingSkills, skills: brandStorytellingSkills, instructions: "Formulate a brand narrative and founder thought leadership playbook. Define the core origin story, 3 customer transformation case study frameworks, and long-form thought leadership essay outlines." },
  { type: "ANALYTICS_TRACKING_BLUEPRINT", title: "Analytics Tracking & Attribution Blueprint", agentType: "AI_CMO", purpose: "GA4/PostHog event tagging schemas, UTM naming conventions, conversion funnel definitions, and dashboard KPI specifications.", nodes: analyticsTrackingSkills, skills: analyticsTrackingSkills, instructions: "Design a complete marketing analytics and attribution blueprint. Define core tracking events, UTM parameter taxonomy, multi-touch attribution models, and executive dashboard KPIs." },
];

export const ALL_DOCUMENTS = [...CORE_DOCUMENTS, ...EXTENDED_DOCUMENTS];

export const AUDIT_PRIORITY_DOCUMENT_TYPES: DocumentType[] = ["COMPETITOR_ANALYSIS", "COMPANY_INTELLIGENCE"];

const AUDIT_DOCUMENT_ORDER: DocumentType[] = [
  ...AUDIT_PRIORITY_DOCUMENT_TYPES,
  "MARKETING_STRATEGY",
  "SEO_AUDIT",
  "GEO_AUDIT",
  "AUDIENCE_ANALYSIS",
  "CONTENT_AUDIT",
  "DESIGN_GUIDE",
];

export const LEGACY_DOCUMENT_ALIASES: Partial<Record<DocumentType, DocumentType>> = {
  PRODUCT_INFO: "COMPANY_INTELLIGENCE",
  CONTENT_STRATEGY: "CONTENT_AUDIT",
  COMPETITOR_COMPARISON_PLAYBOOK: "COMPETITOR_ANALYSIS",
};

export const AUDIT_DOCUMENT_QUEUE: CoreDocumentDefinition[] = AUDIT_DOCUMENT_ORDER.map((type) => {
  const definition = ALL_DOCUMENTS.find((document) => document.type === type);
  if (!definition) throw new Error(`Missing audit document definition for ${type}.`);
  return definition;
});

export function getDocumentDefinition(type: DocumentType): CoreDocumentDefinition | undefined {
  const canonicalType = LEGACY_DOCUMENT_ALIASES[type] ?? type;
  return ALL_DOCUMENTS.find((document) => document.type === canonicalType);
}

const socialFoundation = [
  skill("smark-node-3", "brand-profile", "foundation", "Apply the approved brand, audience, proof, and positioning context."),
  skill("smark-node-3", "voice-builder", "foundation", "Keep the output in the brand's credible human voice."),
];

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  { type: "AI_CMO", label: "AI CMO Director", optional: false, description: "Cross-functional diagnosis and decision sequencing from the company evidence.", nodes: [...companyIntelligenceSkills, skill("local", "source-triangulation", "research", "Triangulate cross-functional findings across multiple audit lenses."), skill("local", "swot-tows-analysis", "analysis", "Formulate cross-channel strategic initiatives using TOWS matrices."), skill("smark-node-2", "marketing-ideas", "analysis", "Generate evidence-led strategic options."), skill("smark-node-3", "goals-and-kpis", "reporting", "Turn recommendations into measurable decisions.")], skills: [...companyIntelligenceSkills, skill("local", "source-triangulation", "research", "Triangulate cross-functional findings across multiple audit lenses."), skill("local", "swot-tows-analysis", "analysis", "Formulate cross-channel strategic initiatives using TOWS matrices."), skill("smark-node-2", "marketing-ideas", "analysis", "Generate evidence-led strategic options."), skill("smark-node-3", "goals-and-kpis", "reporting", "Turn recommendations into measurable decisions.")], instructions: "Resolve contradictions across evidence, choose the highest-leverage priorities, and define dependencies, owners, 30/60/90-day actions, success checks, risks, and missing evidence." },
  { type: "SEO", label: "SEO Agent", optional: false, description: "Search opportunities governed by the main SEO audit workflow.", nodes: [...seoAuditSkills], skills: [...seoAuditSkills], instructions: "Apply the ordered SEO skill chain to the latest website and official-source evidence. Return prioritized, source-linked actions without invented rankings or traffic." },
  { type: "TECHNICAL_SEO", label: "Technical SEO Agent", optional: false, description: "Crawlability, page experience, schema, and technical search diagnostics.", nodes: [seoAuditSkills[0], seoAuditSkills[1], skill("local", "core-web-vitals-diagnostics", "analysis", "Diagnose Core Web Vitals lab and field metrics."), seoAuditSkills[5], seoAuditSkills[6], seoAuditSkills[7]], skills: [seoAuditSkills[0], seoAuditSkills[1], skill("local", "core-web-vitals-diagnostics", "analysis", "Diagnose Core Web Vitals lab and field metrics."), seoAuditSkills[5], seoAuditSkills[6], seoAuditSkills[7]], instructions: "Focus on observable technical evidence, impact, reproduction or validation steps, and a concrete success check. Distinguish Lighthouse lab data from field metrics." },
  { type: "GEO", label: "GEO Agent", optional: false, description: "AI-search citability, entity clarity, and answer-readiness opportunities.", nodes: [...geoAuditSkills], skills: [...geoAuditSkills], instructions: "Return source-linked answer-engine readiness findings and content actions. Do not claim live citations without monitoring evidence." },
  { type: "COMPETITOR", label: "Competitor Agent", optional: false, description: "One consolidated, source-grounded summary card for every verified competitor.", nodes: [...competitorAnalysisSkills], skills: [...competitorAnalysisSkills], instructions: "Use the complete ordered competitor-analysis skill chain and current public discovery to identify at least six real relevant companies. Expand into genuine adjacent or indirect alternatives when a narrow niche has fewer direct competitors. Return exactly one consolidated finding per company—never split one competitor across multiple findings. Every finding must include companyName, officialWebsite, a concise paragraph-style positioning summary, competitiveAttributes, strategic relevance, recommended response, and source URLs from that company's official site. Keep the prose executive-readable and avoid tables, fragments, or repeated sections. Never fabricate a company or private performance." },
  { type: "AUDIENCE", label: "Audience Agent", optional: false, description: "ICP, buying jobs, objections, and voice-of-customer research.", nodes: [...audienceAnalysisSkills], skills: [...audienceAnalysisSkills], instructions: "Mine only supplied and current public evidence for customer jobs, pains, desired outcomes, objections, and language. Clearly label hypotheses and validation needs." },
  { type: "CONTENT_AUDIT", label: "Content Strategy Agent", optional: false, description: "Content gaps, pillars, briefs, and measurable next actions.", nodes: [...contentAuditSkills], skills: [...contentAuditSkills], instructions: "Turn the current content inventory and public research into explicit keep, refresh, consolidate, and create decisions with briefs and measurement." },
  { type: "X", label: "X Agent", optional: false, description: "Evidence-led opportunity discovery, high-velocity hooks, contrarian POVs, and structured thread creation.", nodes: [skill("smark-node-2", "product-marketing-context", "foundation", "Extract the commercially important message, offer architecture, and proof points."), skill("smark-node-3", "brand-profile", "foundation", "Define visual and verbal brand consistency."), skill("smark-node-3", "voice-builder", "foundation", "Enforce concise, human tone, vocabulary, and banned phrasing guardrails."), skill("local", "live-conversation-mining", "research", "Mine live public discussions and trending conversations for high-intent hooks."), skill("smark-node-2", "marketing-ideas", "analysis", "Create strategic content angles and contrarian experiments."), skill("smark-node-3", "goals-and-kpis", "analysis", "Rank opportunities according to commercial and conversation KPIs."), skill("smark-node-3", "x-growth", "analysis", "Apply current X-native engagement and distribution mechanics."), skill("smark-node-3", "thread-writer", "production", "Create structured 5-tweet high-retention threads."), skill("smark-node-3", "hook-writer", "production", "Generate scroll-stopping hooks without clickbait."), skill("smark-node-3", "cross-platform-repurposing", "quality", "Design native repurposing flows for LinkedIn and Instagram."), sourceQuality], skills: [skill("smark-node-2", "product-marketing-context", "foundation", "Extract the commercially important message, offer architecture, and proof points."), skill("smark-node-3", "brand-profile", "foundation", "Define visual and verbal brand consistency."), skill("smark-node-3", "voice-builder", "foundation", "Enforce concise, human tone, vocabulary, and banned phrasing guardrails."), skill("local", "live-conversation-mining", "research", "Mine live public discussions and trending conversations for high-intent hooks."), skill("smark-node-2", "marketing-ideas", "analysis", "Create strategic content angles and contrarian experiments."), skill("smark-node-3", "goals-and-kpis", "analysis", "Rank opportunities according to commercial and conversation KPIs."), skill("smark-node-3", "x-growth", "analysis", "Apply current X-native engagement and distribution mechanics."), skill("smark-node-3", "thread-writer", "production", "Create structured 5-tweet high-retention threads."), skill("smark-node-3", "hook-writer", "production", "Generate scroll-stopping hooks without clickbait."), skill("smark-node-3", "cross-platform-repurposing", "quality", "Design native repurposing flows for LinkedIn and Instagram."), sourceQuality], instructions: "Build continuous opportunity-discovery and content-generation packages grounded in company memory. Follow the strategist flow: evidence/opportunity first → angle second → writing third. Generate sharp, natural copy, multi-angle scored hooks, 3 distinct variants, structured threads, and cross-channel repurposing plans." },
  { type: "REDDIT", label: "Reddit Customer Research", optional: false, description: "A concise customer-signal readout with sourced threads and safe, useful response drafts.", nodes: [...socialFoundation, skill("smark-node-3", "audience-research", "research", "Identify target-customer jobs, pains, objections, and actual language."), skill("local", "live-conversation-mining", "research", "Mine live Reddit discussions for unfiltered customer pains and trigger events."), skill("smark-node-3", "reddit-marketing", "analysis", "Apply the advisory-only CRED framework and subreddit safeguards."), skill("smark-node-3", "community-management", "production", "Recommend credible manual participation and escalation boundaries."), skill("smark-node-3", "ai-search-optimization", "analysis", "Assess source-layer relevance without fabricated citation claims."), sourceQuality], skills: [...socialFoundation, skill("smark-node-3", "audience-research", "research", "Identify target-customer jobs, pains, objections, and actual language."), skill("local", "live-conversation-mining", "research", "Mine live Reddit discussions for unfiltered customer pains and trigger events."), skill("smark-node-3", "reddit-marketing", "analysis", "Apply the advisory-only CRED framework and subreddit safeguards."), skill("smark-node-3", "community-management", "production", "Recommend credible manual participation and escalation boundaries."), skill("smark-node-3", "ai-search-optimization", "analysis", "Assess source-layer relevance without fabricated citation claims."), sourceQuality], instructions: "You are the Reddit Opportunity Hunter. Evaluate candidate public discussions for genuine commercial relevance, intent (solution_search, recommendation_request, pain_expression), and promotion safety. For each candidate, determine the exact customer problem, explain why this matters with ICP and product fit, assess spam risk, extract verbatim quote evidence, and generate a natural, transparent, non-promotional response draft in recommendedResponse." },
  { type: "ARTICLES", label: "Articles Agent", optional: false, description: "Evidence-led article opportunities, briefs, and outlines.", nodes: [skill("smark-node-1", "seo-content-brief", "foundation", "Use the SEO brief workflow."), skill("smark-node-1", "seo-content", "analysis", "Apply quality and search-usefulness standards."), skill("smark-node-2", "content-strategy", "analysis", "Connect topics to business and funnel needs."), skill("smark-node-3", "educational-content-and-how-to", "production", "Create useful educational structures."), sourceQuality], skills: [skill("smark-node-1", "seo-content-brief", "foundation", "Use the SEO brief workflow."), skill("smark-node-1", "seo-content", "analysis", "Apply quality and search-usefulness standards."), skill("smark-node-2", "content-strategy", "analysis", "Connect topics to business and funnel needs."), skill("smark-node-3", "educational-content-and-how-to", "production", "Create useful educational structures."), sourceQuality], instructions: "Create three article briefs with intent, audience, buyer stage, evidence requirement, angle, outline, internal-link targets, and source register." },
  { type: "LINKEDIN", label: "LinkedIn Agent", optional: false, description: "A concise page readout, previous-post summary, new drafts, and comment opportunities.", nodes: [...socialFoundation, skill("local", "live-conversation-mining", "research", "Mine peer and customer discussions for relevant thought-leadership debate angles."), skill("smark-node-3", "linkedin-growth", "analysis", "Apply personal-profile LinkedIn growth strategy."), skill("smark-node-3", "linkedin-company-pages", "analysis", "Route company-page work appropriately."), skill("smark-node-3", "linkedin-post-writer", "production", "Create native LinkedIn drafts."), skill("smark-node-3", "carousel-writer", "production", "Create a document-carousel brief."), sourceQuality], skills: [...socialFoundation, skill("local", "live-conversation-mining", "research", "Mine peer and customer discussions for relevant thought-leadership debate angles."), skill("smark-node-3", "linkedin-growth", "analysis", "Apply personal-profile LinkedIn growth strategy."), skill("smark-node-3", "linkedin-company-pages", "analysis", "Route company-page work appropriately."), skill("smark-node-3", "linkedin-post-writer", "production", "Create native LinkedIn drafts."), skill("smark-node-3", "carousel-writer", "production", "Create a document-carousel brief."), sourceQuality], instructions: "You are the LinkedIn Content Opportunity Hunter. Synthesize signals across company memory, SEO/GEO audit discoveries, customer complaints, and competitor gaps. Cluster repeated audience pain points into thought-leadership topics. For each opportunity, define the angle, hook, recommended format (text_post or carousel), why this fits the company's ICP, and generate a complete, publish-ready native post in draftContent." },
  { type: "CAMPAIGN_PLANNER", label: "Campaign Planner", optional: true, description: "A goal-led multi-channel campaign and execution sequence.", nodes: [skill("smark-node-3", "campaign-and-launch-planning", "foundation", "Use the campaign planning framework."), skill("smark-node-2", "launch-strategy", "analysis", "Structure launch phases and dependencies."), skill("smark-node-3", "goals-and-kpis", "reporting", "Map the campaign to decision-ready KPIs."), sourceQuality], skills: [skill("smark-node-3", "campaign-and-launch-planning", "foundation", "Use the campaign planning framework."), skill("smark-node-2", "launch-strategy", "analysis", "Structure launch phases and dependencies."), skill("smark-node-3", "goals-and-kpis", "reporting", "Map the campaign to decision-ready KPIs."), sourceQuality], instructions: "Plan one coherent campaign with one goal, audience, proposition, phases, channel roles, deliverables, measurement, and dependencies." },
  { type: "INSTAGRAM", label: "Instagram Agent", optional: true, description: "Continuous opportunity discovery, multi-format planning, Reels, Carousels, Stories, and engagement intelligence.", nodes: [skill("smark-node-2", "product-marketing-context", "foundation", "Extract the commercially important message, offer architecture, and proof points."), skill("smark-node-3", "brand-profile", "foundation", "Define visual and verbal brand consistency."), skill("smark-node-3", "voice-builder", "foundation", "Enforce caption, hook, and CTA guardrails."), skill("local", "live-conversation-mining", "research", "Extract live audience discussions, comments, and sentiment for creative hooks."), skill("smark-node-2", "marketing-ideas", "analysis", "Create strategic concepts and experimental angles."), skill("smark-node-3", "goals-and-kpis", "analysis", "Determine whether the opportunity supports acquisition, awareness, engagement, or leads."), skill("smark-node-3", "instagram-growth", "analysis", "Apply current Instagram growth mechanics."), skill("smark-node-3", "instagram-seo", "analysis", "Map discoverability, search tags, and keyword surfaces."), skill("smark-node-3", "carousel-writer", "production", "Create slide-by-slide saveable carousel briefs."), skill("smark-node-3", "reels-script", "production", "Create native 0-3s hook to CTA Reel storyboards."), skill("smark-node-3", "story-writer", "production", "Design interactive Story sequences with stickers and polls."), skill("smark-node-3", "caption-writer", "production", "Draft high-converting captions with clear CTAs."), skill("smark-node-3", "hook-writer", "production", "Generate multi-angle scroll-stopping hooks."), skill("smark-node-3", "social-proof-and-testimonials", "quality", "Structure verified customer transformation and proof posts."), skill("smark-node-3", "cross-platform-repurposing", "quality", "Design native repurposing flows for Stories, LinkedIn, and X."), sourceQuality], skills: [skill("smark-node-2", "product-marketing-context", "foundation", "Extract the commercially important message, offer architecture, and proof points."), skill("smark-node-3", "brand-profile", "foundation", "Define visual and verbal brand consistency."), skill("smark-node-3", "voice-builder", "foundation", "Enforce caption, hook, and CTA guardrails."), skill("local", "live-conversation-mining", "research", "Extract live audience discussions, comments, and sentiment for creative hooks."), skill("smark-node-2", "marketing-ideas", "analysis", "Create strategic concepts and experimental angles."), skill("smark-node-3", "goals-and-kpis", "analysis", "Determine whether the opportunity supports acquisition, awareness, engagement, or leads."), skill("smark-node-3", "instagram-growth", "analysis", "Apply current Instagram growth mechanics."), skill("smark-node-3", "instagram-seo", "analysis", "Map discoverability, search tags, and keyword surfaces."), skill("smark-node-3", "carousel-writer", "production", "Create slide-by-slide saveable carousel briefs."), skill("smark-node-3", "reels-script", "production", "Create native 0-3s hook to CTA Reel storyboards."), skill("smark-node-3", "story-writer", "production", "Design interactive Story sequences with stickers and polls."), skill("smark-node-3", "caption-writer", "production", "Draft high-converting captions with clear CTAs."), skill("smark-node-3", "hook-writer", "production", "Generate multi-angle scroll-stopping hooks."), skill("smark-node-3", "social-proof-and-testimonials", "quality", "Structure verified customer transformation and proof posts."), skill("smark-node-3", "cross-platform-repurposing", "quality", "Design native repurposing flows for Stories, LinkedIn, and X."), sourceQuality], instructions: "Build continuous opportunity-discovery, content-planning, and engagement-intelligence packages grounded in company memory. Generate multi-angle scored opportunities, complete slide-by-slide Carousels, Reel storyboards (0-3s Hook to CTA), interactive Stories, and cross-channel repurposing plans." },
  { type: "YOUTUBE", label: "YouTube Agent", optional: true, description: "Long-form, Shorts, packaging, retention, and metadata opportunities.", nodes: [...socialFoundation, skill("smark-node-3", "youtube-long-form", "analysis", "Create long-form packaging and retention structure."), skill("smark-node-3", "youtube-shorts", "production", "Create Shorts concepts."), skill("smark-node-3", "youtube-publishing-and-metadata", "production", "Create honest metadata and publishing guidance."), skill("smark-node-3", "thumbnail-design", "production", "Brief the thumbnail concept."), sourceQuality], skills: [...socialFoundation, skill("smark-node-3", "youtube-long-form", "analysis", "Create long-form packaging and retention structure."), skill("smark-node-3", "youtube-shorts", "production", "Create Shorts concepts."), skill("smark-node-3", "youtube-publishing-and-metadata", "production", "Create honest metadata and publishing guidance."), skill("smark-node-3", "thumbnail-design", "production", "Brief the thumbnail concept."), sourceQuality], instructions: "Create one long-form concept, two Shorts, packaging, thumbnail direction, retention plan, and metadata. Do not claim search volume without data." },
  { type: "CREATIVE_VISUAL", label: "Creative and Visual Agent", optional: true, description: "On-brand campaign visual systems and production briefs.", nodes: designGuideSkills, skills: designGuideSkills, instructions: "Define one cohesive visual direction and three production-ready asset briefs grounded in observed brand evidence and validated platform specifications." },
  { type: "UGC_VIDEOS", label: "UGC Video Agent", optional: true, description: "Authentic UGC concepts, scripts, shot lists, and disclosure guidance.", nodes: [...socialFoundation, skill("smark-node-3", "ugc-and-influencer", "analysis", "Apply UGC authenticity, rights, and disclosure requirements."), skill("smark-node-3", "short-form-video-script", "production", "Create native short-form scripts."), skill("smark-node-3", "scripting-and-storyboarding", "production", "Create usable shot and story plans."), sourceQuality], skills: [...socialFoundation, skill("smark-node-3", "ugc-and-influencer", "analysis", "Apply UGC authenticity, rights, and disclosure requirements."), skill("smark-node-3", "short-form-video-script", "production", "Create native short-form scripts."), skill("smark-node-3", "scripting-and-storyboarding", "production", "Create usable shot and story plans."), sourceQuality], instructions: "Create three authentic UGC concepts with creator archetype, hook, script, shots, proof, usage rights, and disclosure. Do not invent creators or testimonials." },
  { type: "INFLUENCER", label: "Influencer Research Agent", optional: true, description: "Creator archetypes, qualification, outreach logic, and risk controls.", nodes: [...socialFoundation, skill("smark-node-3", "ugc-and-influencer", "analysis", "Define fit, rights, disclosure, and creator safeguards."), skill("smark-node-3", "collabs-and-cross-promotion", "analysis", "Assess audience and partnership fit."), skill("smark-node-3", "social-proof-and-testimonials", "quality", "Keep proof and permissions accurate."), sourceQuality], skills: [...socialFoundation, skill("smark-node-3", "ugc-and-influencer", "analysis", "Define fit, rights, disclosure, and creator safeguards."), skill("smark-node-3", "collabs-and-cross-promotion", "analysis", "Assess audience and partnership fit."), skill("smark-node-3", "social-proof-and-testimonials", "quality", "Keep proof and permissions accurate."), sourceQuality], instructions: "Recommend creator archetypes and qualification criteria, not invented people. Include outreach angles, deliverables, rights, disclosure, brand-safety checks, and measurement." },
  { type: "UGC_INFLUENCER", label: "UGC and Influencer Planner", optional: true, description: "Combined creator and UGC campaign architecture.", nodes: [...socialFoundation, skill("smark-node-3", "ugc-and-influencer", "analysis", "Plan the creator and UGC system."), skill("smark-node-3", "campaign-and-launch-planning", "production", "Sequence the program."), skill("smark-node-3", "goals-and-kpis", "reporting", "Define outcome-led measurement."), sourceQuality], skills: [...socialFoundation, skill("smark-node-3", "ugc-and-influencer", "analysis", "Plan the creator and UGC system."), skill("smark-node-3", "campaign-and-launch-planning", "production", "Sequence the program."), skill("smark-node-3", "goals-and-kpis", "reporting", "Define outcome-led measurement."), sourceQuality], instructions: "Create a disclosure-aware UGC and influencer program with archetypes, briefs, outreach, rights, campaign phases, KPIs, and approval gates." },
  { type: "EMAIL_NEWSLETTER", label: "Email and Newsletter Agent", optional: true, description: "Lifecycle, newsletter, and campaign-email opportunities.", nodes: [skill("smark-node-2", "product-marketing-context", "foundation", "Anchor messages in the offer and audience."), skill("smark-node-2", "email-sequence", "analysis", "Design the sequence and triggers."), skill("smark-node-3", "email-and-newsletter", "production", "Apply newsletter-native craft."), skill("smark-node-2", "copywriting", "production", "Create clear conversion copy."), sourceQuality], skills: [skill("smark-node-2", "product-marketing-context", "foundation", "Anchor messages in the offer and audience."), skill("smark-node-2", "email-sequence", "analysis", "Design the sequence and triggers."), skill("smark-node-3", "email-and-newsletter", "production", "Apply newsletter-native craft."), skill("smark-node-2", "copywriting", "production", "Create clear conversion copy."), sourceQuality], instructions: "Create an email opportunity map with audience, trigger, objective, sequence, subject angles, proof, CTA, and measurement. Distinguish lifecycle from cold outbound." },
  { type: "PAID_MEDIA", label: "Paid Media Agent", optional: true, description: "Channel, audience, creative, landing-page, and testing recommendations.", nodes: [skill("smark-node-2", "paid-ads", "foundation", "Choose channels and structure from evidence."), skill("smark-node-2", "ad-creative", "production", "Create compliant creative concepts."), skill("smark-node-2", "ab-test-setup", "analysis", "Design valid tests and decision rules."), skill("smark-node-3", "goals-and-kpis", "reporting", "Map spend decisions to available KPIs."), sourceQuality], skills: [skill("smark-node-2", "paid-ads", "foundation", "Choose channels and structure from evidence."), skill("smark-node-2", "ad-creative", "production", "Create compliant creative concepts."), skill("smark-node-2", "ab-test-setup", "analysis", "Design valid tests and decision rules."), skill("smark-node-3", "goals-and-kpis", "reporting", "Map spend decisions to available KPIs."), sourceQuality], instructions: "Recommend a paid test plan with channel rationale, audiences, messages, creative variants, landing-page dependencies, success metrics, and stop/scale rules. Never invent CPC, CPA, or ROAS." },
  { type: "COMMUNITY", label: "Community and Engagement Agent", optional: true, description: "A sustainable engagement, response, and escalation operating rhythm.", nodes: [...socialFoundation, skill("local", "live-conversation-mining", "research", "Extract real-time community discussions and sentiment signals."), skill("smark-node-3", "engagement-routine", "analysis", "Create a sustainable human engagement cadence."), skill("smark-node-3", "reply-and-comment-writer", "production", "Create useful response patterns."), skill("smark-node-3", "community-management", "quality", "Apply moderation and escalation safeguards.")], skills: [...socialFoundation, skill("local", "live-conversation-mining", "research", "Extract real-time community discussions and sentiment signals."), skill("smark-node-3", "engagement-routine", "analysis", "Create a sustainable human engagement cadence."), skill("smark-node-3", "reply-and-comment-writer", "production", "Create useful response patterns."), skill("smark-node-3", "community-management", "quality", "Apply moderation and escalation safeguards.")], instructions: "Create a weekly engagement system, conversation priorities, response principles, escalation rules, and reusable reply patterns." },
  { type: "PROGRAMMATIC_SEO", label: "Programmatic SEO Agent", optional: true, description: "Template-driven pages, content uniqueness gates, hub-and-spoke linking, and index bloat safeguards.", nodes: [skill("smark-node-1", "seo-programmatic", "foundation", "Audit scaled and template-generated page structures against Google quality guidelines."), skill("smark-node-1", "seo-cluster", "analysis", "Map topic cluster architectures and internal relationship graphs."), skill("smark-node-2", "content-strategy", "analysis", "Connect scaled page assets to intent and conversion value."), sourceQuality], skills: [skill("smark-node-1", "seo-programmatic", "foundation", "Audit scaled and template-generated page structures against Google quality guidelines."), skill("smark-node-1", "seo-cluster", "analysis", "Map topic cluster architectures and internal relationship graphs."), skill("smark-node-2", "content-strategy", "analysis", "Connect scaled page assets to intent and conversion value."), sourceQuality], instructions: "Audit existing URL patterns, template uniqueness, and data-driven page expansion opportunities. Enforce the >=40% unique content threshold to guard against scaled content penalties, recommend hub-and-spoke internal linking density, and outline programmatic rollout gates with canonical safeguards." },
];

export const INITIAL_AGENT_TYPES: AgentType[] = ["X", "REDDIT", "ARTICLES", "LINKEDIN", "INSTAGRAM"];

export const INTERNAL_OPERATIONS: Record<InternalOperation, { label: string; nodes: NodeRef[]; skills: SkillRef[]; instructions: string }> = {
  "ai-cmo-chat": { label: "AI CMO conversation", nodes: [skill("smark-node-2", "product-marketing-context", "foundation", "Interpret requests against the company and offer context."), skill("smark-node-2", "marketing-psychology", "analysis", "Evaluate buyer behavior without manipulation."), skill("smark-node-2", "marketing-ideas", "production", "Generate practical strategic options."), skill("smark-node-3", "goals-and-kpis", "quality", "Connect advice to measurable decisions."), sourceQuality], skills: [skill("smark-node-2", "product-marketing-context", "foundation", "Interpret requests against the company and offer context."), skill("smark-node-2", "marketing-psychology", "analysis", "Evaluate buyer behavior without manipulation."), skill("smark-node-2", "marketing-ideas", "production", "Generate practical strategic options."), skill("smark-node-3", "goals-and-kpis", "quality", "Connect advice to measurable decisions."), sourceQuality], instructions: "Every answer must follow a structured two-phase synthesis: 1) First, answer using the exact methodology and strategic frameworks from the installed repository skills (product marketing context, behavioral psychology, CRO, SEO/GEO principles, campaign planning). 2) Second, ground and apply the recommendations directly against the latest company news, recent product updates, crawled website pages, and live competitive discoveries." },
  "ai-cmo-synthesis": { label: "AI CMO synthesis", nodes: [skill("smark-node-2", "product-marketing-context", "foundation", "Use the shared commercial foundation."), skill("local", "pestel-analysis", "research", "Incorporate macro-environmental context into executive decision sequencing."), skill("smark-node-1", "seo-plan", "analysis", "Sequence search and site priorities."), skill("smark-node-2", "marketing-ideas", "analysis", "Generate cross-channel strategic options."), skill("smark-node-3", "goals-and-kpis", "reporting", "Turn priorities into measurable decisions."), skill("local", "source-triangulation", "quality", "Triangulate strategic recommendations against multiple independent audit sources."), skill("smark-node-3", "analytics-and-reporting", "quality", "Close the loop with honest reporting rules.")], skills: [skill("smark-node-2", "product-marketing-context", "foundation", "Use the shared commercial foundation."), skill("local", "pestel-analysis", "research", "Incorporate macro-environmental context into executive decision sequencing."), skill("smark-node-1", "seo-plan", "analysis", "Sequence search and site priorities."), skill("smark-node-2", "marketing-ideas", "analysis", "Generate cross-channel strategic options."), skill("smark-node-3", "goals-and-kpis", "reporting", "Turn priorities into measurable decisions."), skill("local", "source-triangulation", "quality", "Triangulate strategic recommendations against multiple independent audit sources."), skill("smark-node-3", "analytics-and-reporting", "quality", "Close the loop with honest reporting rules.")], instructions: "Resolve contradictions across specialist outputs and produce a sequenced executive decision set with dependencies, KPIs, risks, and evidence gaps." },
  "document-edit": { label: "Skill-governed document editing", nodes: [skill("smark-node-2", "copy-editing", "production", "Apply the requested edit without damaging meaning."), skill("smark-node-3", "writing-style-and-tone", "production", "Preserve a consistent professional voice."), skill("local", "source-triangulation", "quality", "Ensure revised statements maintain rigorous multi-source corroboration."), skill("local", "visual-report-composition", "production", "Maintain clean document visual rhythm, structure, and executive presentation."), sourceQuality], skills: [skill("smark-node-2", "copy-editing", "production", "Apply the requested edit without damaging meaning."), skill("smark-node-3", "writing-style-and-tone", "production", "Preserve a consistent professional voice."), skill("local", "source-triangulation", "quality", "Ensure revised statements maintain rigorous multi-source corroboration."), skill("local", "visual-report-composition", "production", "Maintain clean document visual rhythm, structure, and executive presentation."), sourceQuality], instructions: "Preserve all supported facts, citations, tables, and unrelated sections while applying the requested edit." },
};

export function getAgentDefinition(type: AgentType): AgentDefinition | undefined {
  return AGENT_DEFINITIONS.find((agent) => agent.type === type);
}

export function getInternalOperation(operation: InternalOperation) {
  return INTERNAL_OPERATIONS[operation];
}
