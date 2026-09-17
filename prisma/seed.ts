import { PrismaClient, type AgentType, type DocumentType } from "@prisma/client";
import { hash } from "bcryptjs";
import { encryptSecret } from "../src/lib/crypto-core";
import { getAgentDefinition, getDocumentDefinition } from "../src/lib/nodes/registry";

process.loadEnvFile?.(".env.local");
const db = new PrismaClient();

const sourceUrls = ["https://thesmarketers.com/", "https://thesmarketers.com/services/", "https://thesmarketers.com/about/"];
const skill = (repository: string, name: string) => ({ repository, skill: name });
const finding = (title: string, evidence: string, impact: string, action: string, priority = "high", confidence = 88) => ({ title, evidence, impact, action, priority, confidence, sourceUrls: sourceUrls.slice(0, 2) });

const demoDocuments = [
  {
    type: "COMPANY_INTELLIGENCE",
    title: "Company Intelligence",
    skills: [skill("openclaw-marketing-skills", "product-marketing-context"), skill("social-media-skills", "brand-profile"), skill("social-media-skills", "voice-builder")],
    markdown: `# Company Intelligence

## Executive readout

The Smarketers presents itself as a B2B growth partner spanning account-based marketing, inbound demand generation, HubSpot implementation, revenue operations, and AI-assisted lead generation. The strongest commercial story is not a single service: it is the ability to connect strategy, execution, and revenue infrastructure around pipeline outcomes.

## Offer architecture

- **Core category:** B2B marketing agency and growth consultancy.
- **Primary motions:** ABM, inbound demand generation, content, paid media, HubSpot, and RevOps.
- **Delivery model:** Strategic programs, scoped implementations, and campaign execution.
- **Observed promise:** More coordinated marketing activity tied to measurable pipeline outcomes.

## Positioning opportunity

Lead with the operating-system advantage: one partner aligning the buyer narrative, campaigns, content, marketing operations, and reporting. Support the claim with named proof, quantified outcomes, and vertical context wherever the evidence is available.

## Known unknowns

Current public evidence does not establish pricing, retention, average engagement length, win rate, or a complete customer roster. These should be supplied as first-party inputs before financial forecasting.

## Sources

- https://thesmarketers.com/
- https://thesmarketers.com/services/
- https://thesmarketers.com/about/`,
  },
  {
    type: "SEO_AUDIT",
    title: "SEO Audit",
    skills: [skill("claude-seo", "seo-audit"), skill("claude-seo", "seo-technical"), skill("claude-seo", "seo-page"), skill("claude-seo", "seo-content"), skill("claude-seo", "seo-schema"), skill("claude-seo", "seo-sitemap"), skill("openclaw-marketing-skills", "seo-audit")],
    markdown: `# SEO Audit

## Executive readout

The demo crawl confirms indexable public service content and a clear B2B category. The immediate opportunity is to deepen decision-stage relevance and connect service, industry, proof, and educational pages into coherent topic clusters.

## Lightweight URL response timing

- Mobile request profile: response score 78, HTTP 200, TTFB 620ms, total HTML response 840ms.
- Desktop request profile: response score 91, HTTP 200, TTFB 310ms, total HTML response 490ms.
- Source: Python URL timing demo fixture. This is not Lighthouse or Core Web Vitals evidence.

## Priority findings

### Strengthen service-page intent

Give each major service one canonical page with a buyer problem, operating approach, proof, FAQs, and a decisive next step. Keep titles and descriptions specific to the commercial query.

### Build vertical proof clusters

Connect relevant service pages to industry-specific case evidence and expert articles. Use descriptive internal links so the relationship is legible to buyers and crawlers.

### Technical follow-through

Review the best-practices score before pursuing marginal performance gains. Preserve the already-strong observed lab loading metrics while checking the full live site and Search Console separately.

## Success checks

- Every priority service has unique query intent and proof.
- Orphaned commercial pages are eliminated.
- Search Console impressions and qualified organic conversions are tracked by cluster.

## Sources

- https://thesmarketers.com/
- https://thesmarketers.com/services/`,
  },
  {
    type: "GEO_AUDIT",
    title: "GEO and AI Visibility Audit",
    skills: [skill("claude-seo", "seo-geo"), skill("openclaw-marketing-skills", "ai-seo"), skill("social-media-skills", "ai-search-optimization")],
    markdown: `# GEO and AI Visibility Audit

## Executive readout

The public site states the core capabilities, but AI answer engines benefit from more explicit entity descriptions, verifiable expertise, and compact answer-ready passages. This audit reports website evidence only; it does not claim live citation share without a connected answer-engine monitoring source.

## Entity clarity

Publish one consistent company description across the home page, about page, author bios, organization markup, and owned profiles. Name the industries, services, geography, and evidence boundaries directly.

## Citation readiness

- Add named experts and review dates to strategic content.
- Turn repeatable frameworks into concise definitions and step sequences.
- Add primary proof and methodology near quantitative claims.
- Use organization, service, article, and breadcrumb structured data where eligible.

## Measurement plan

Track a fixed set of buyer questions across approved AI search tools, record cited domains, and compare changes monthly. Treat unsupported platform observations as hypotheses until a connector is added.

## Sources

- https://thesmarketers.com/
- https://thesmarketers.com/about/`,
  },
  {
    type: "COMPETITOR_ANALYSIS",
    title: "Competitor Analysis",
    skills: [skill("social-media-skills", "competitor-analysis"), skill("openclaw-marketing-skills", "competitor-alternatives"), skill("claude-seo", "seo-competitor-pages")],
    markdown: `# Competitor Analysis

## Executive readout

The observed competitive categories are specialist ABM agencies, inbound growth consultancies, HubSpot partners, and RevOps firms. Named competitor rankings or feature claims are intentionally excluded because this demo evidence pack does not contain a verified competitor crawl.

## Category comparison

### Specialist agencies

Often lead with depth in one motion. The Smarketers can counter with coordinated execution across targeting, content, campaign delivery, and revenue operations.

### Platform implementation partners

Often lead with technical implementation. The differentiation opportunity is to connect the system build to market strategy, demand programs, and adoption.

### Generalist digital agencies

Often offer channel breadth. The stronger Smarketers position is B2B buying-cycle expertise and pipeline accountability.

## Next evidence to collect

Build a verified set of five to eight competitors from search results, sales call notes, lost-deal reasons, and customer interviews. Capture source URL and observation date for every comparison.

## Sources

- https://thesmarketers.com/
- https://thesmarketers.com/services/`,
  },
  {
    type: "AUDIENCE_ANALYSIS",
    title: "Audience Analysis",
    skills: [skill("social-media-skills", "audience-research"), skill("social-media-skills", "brand-profile"), skill("openclaw-marketing-skills", "product-marketing-context")],
    markdown: `# Audience Analysis

## Executive readout

The public offer is most relevant to B2B leaders who need predictable demand but face fragmented campaigns, weak sales handoffs, or underused marketing technology. These segments are hypotheses inferred from the service mix and require first-party validation.

## Priority buying roles

- **CMO or VP Marketing:** Needs pipeline accountability, a clear operating model, and executive reporting.
- **Demand Generation leader:** Needs campaign throughput, account coordination, and better conversion paths.
- **Marketing Operations or RevOps leader:** Needs lifecycle governance, attribution, automation, and adoption.
- **Founder or growth leader:** Needs an experienced external team without building every capability in-house.

## Decision criteria

Buyers are likely to evaluate B2B expertise, strategic depth, execution capacity, platform fluency, proof, operating cadence, and measurable impact. Validate the order through win-loss interviews.

## Research backlog

Interview recent wins, losses, and active customers. Capture triggering event, alternatives considered, objections, approval path, desired outcome, and exact language used.

## Sources

- https://thesmarketers.com/
- https://thesmarketers.com/services/`,
  },
  {
    type: "CONTENT_AUDIT",
    title: "Content Audit and Strategy",
    skills: [skill("social-media-skills", "content-audit"), skill("social-media-skills", "content-pillars"), skill("social-media-skills", "content-research-and-sourcing"), skill("openclaw-marketing-skills", "content-strategy"), skill("claude-seo", "seo-cluster"), skill("claude-seo", "seo-content-brief")],
    markdown: `# Content Audit and Strategy

## Executive readout

The public content establishes service breadth. The next layer should make buying decisions easier: sharper service narratives, vertical proof, objection handling, and expert points of view connected to conversion paths.

## Content system

### Decision content

Build service pages, comparison pages, implementation guides, FAQs, and case evidence for buyers already evaluating an approach or partner.

### Authority content

Publish expert-led frameworks on ABM orchestration, HubSpot governance, demand quality, and AI-assisted lead generation. Every article should include an evidence boundary and a commercial continuation.

### Distribution

Turn each evidence-led article into a LinkedIn post, X thread, Reddit-ready discussion contribution, email insight, short video brief, and sales enablement excerpt. Adapt the argument to the channel instead of copying it.

## 90-day priorities

1. Upgrade the three highest-value service pages.
2. Publish one vertical proof cluster.
3. Create two expert-led pillar articles and their channel packs.
4. Measure qualified conversions and assisted pipeline by content cluster.

## Sources

- https://thesmarketers.com/
- https://thesmarketers.com/services/`,
  },
] as const;

const demoAgents = [
  ["AI_CMO", "The six analyses point to one priority: prove the integrated B2B operating model.", [finding("Make the integrated operating model the lead narrative", "The home and services evidence spans ABM, demand, content, HubSpot, and RevOps.", "A coherent promise can reduce category confusion and improve sales continuity.", "Build the next campaign around one revenue problem, one proof set, and one operating model.", "critical", 92)]],
  ["SEO", "Commercial intent and proof clusters are the strongest organic opportunity.", [finding("Strengthen service-page intent", "The service evidence covers broad capabilities, but each motion needs deeper decision support.", "More specific pages can improve relevance and conversion quality.", "Upgrade the three highest-value service pages with proof, FAQs, and internal links.")]],
  ["TECHNICAL_SEO", "Lightweight Python response timing is visible with explicit evidence boundaries.", [finding("Validate browser rendering with Lighthouse", "The demo timing fixture measures HTTP response and HTML transfer only.", "Server response is useful context but cannot establish rendering quality or Core Web Vitals.", "Use the self-hosted Lighthouse audit or connected field data before making browser-performance claims.", "medium", 90)]],
  ["GEO", "Entity clarity and citation-ready proof are the main AI visibility gaps.", [finding("Create a consistent entity statement", "Services are clear, but the evidence pack does not contain one reusable entity definition.", "Consistency helps answer engines resolve what the company does.", "Publish and reuse an approved company description with expert and proof references.")]],
  ["COMPETITOR", "Differentiate against four categories; verify named brands before comparison.", [finding("Compete on orchestration", "The service mix combines strategy, campaigns, content, HubSpot, and RevOps.", "This is more defensible than a generic full-service claim.", "Create a sourced comparison matrix after collecting verified competitor evidence.", "high", 84)]],
  ["AUDIENCE", "Four likely buying roles need first-party validation.", [finding("Prioritize the CMO and demand generation journey", "The offer is structured around B2B pipeline and cross-functional execution.", "Role-specific proof can improve message resonance.", "Interview recent wins and losses before finalizing personas.", "high", 82)]],
  ["CONTENT_AUDIT", "Decision content, authority content, and channel adaptation form the core system.", [finding("Build one vertical proof cluster", "Public content establishes breadth but limited vertical proof is present in the demo crawl.", "Proof clusters can support both discovery and sales evaluation.", "Combine a service page, case evidence, FAQ, and two expert articles.")]],
  ["X", "Two evidence-led X angles are ready.", [finding("Thread: activity is not orchestration", "The core documents identify coordination as the differentiator.", "A contrarian, useful argument can earn qualified attention.", "Write a five-post thread using one operational example and a sourced conclusion.", "medium", 86)]],
  ["REDDIT", "Two discussion-first opportunities are ready.", [finding("Lifecycle handoff discussion", "The service mix includes HubSpot and RevOps.", "A practical answer can establish expertise without promotional behavior.", "Draft a transparent, non-promotional response and disclose affiliation when relevant.", "medium", 84)]],
  ["ARTICLES", "One authority pillar and its evidence requirements are ready.", [finding("ABM without orchestration is expensive outbound", "The service evidence connects ABM with content, paid media, and RevOps.", "The topic can articulate the integrated operating-model advantage.", "Build an evidence-led brief with practitioner examples and proof placeholders.", "high", 88)]],
  ["LINKEDIN", "A proof-led LinkedIn content pack is ready.", [finding("Hook: your campaign is not your operating model", "The company intelligence report identifies orchestration as the positioning opportunity.", "This can attract senior B2B marketing operators.", "Write one insight post, one carousel brief, and three alternate hooks.", "medium", 87)]],
] as const;

async function main() {
  const user = await db.user.upsert({
    where: { email: "demo@thesmarketers.com" },
    update: { name: "Demo User", passwordHash: await hash("Demo@123", 12), llmProvider: "anthropic", llmApiKeyEnc: encryptSecret("demo-mock-key-not-live"), llmKeyPreview: "demo••••live", llmModel: "claude-haiku-4-5", llmVerifiedAt: new Date(), demoMode: true, tokenBudget: 2_000_000, tokenUsed: 184_000 },
    create: { name: "Demo User", email: "demo@thesmarketers.com", passwordHash: await hash("Demo@123", 12), llmProvider: "anthropic", llmApiKeyEnc: encryptSecret("demo-mock-key-not-live"), llmKeyPreview: "demo••••live", llmModel: "claude-haiku-4-5", llmVerifiedAt: new Date(), demoMode: true, tokenBudget: 2_000_000, tokenUsed: 184_000 },
  });
  const company = await db.company.upsert({
    where: { userId_normalizedDomain: { userId: user.id, normalizedDomain: "thesmarketers.com" } },
    update: { name: "The Smarketers", websiteUrl: "https://thesmarketers.com/", status: "ACTIVE", category: "B2B marketing agency", description: "The Smarketers is a B2B-focused marketing agency combining account-based marketing, inbound demand generation, HubSpot implementation, and AI-assisted lead generation to build and convert pipeline.", crawlStatus: "DONE", crawlProgress: 100, crawlStep: "Demo audit complete", crawlError: null, lastAuditedAt: new Date() },
    create: { userId: user.id, name: "The Smarketers", websiteUrl: "https://thesmarketers.com/", normalizedDomain: "thesmarketers.com", status: "ACTIVE", category: "B2B marketing agency", description: "The Smarketers is a B2B-focused marketing agency combining account-based marketing, inbound demand generation, HubSpot implementation, and AI-assisted lead generation to build and convert pipeline.", crawlStatus: "DONE", crawlProgress: 100, crawlStep: "Demo audit complete", lastAuditedAt: new Date() },
  });

  await db.$transaction([
    db.auditJob.deleteMany({ where: { companyId: company.id } }),
    db.chatSession.deleteMany({ where: { companyId: company.id } }),
    db.document.deleteMany({ where: { companyId: company.id } }),
    db.crawlPage.deleteMany({ where: { companyId: company.id } }),
    db.pageSpeedAudit.deleteMany({ where: { companyId: company.id } }),
    db.agentRun.deleteMany({ where: { companyId: company.id } }),
    db.integration.deleteMany({ where: { companyId: company.id } }),
    db.report.deleteMany({ where: { companyId: company.id } }),
    db.chatAttachment.deleteMany({ where: { companyId: company.id } }),
  ]);

  await db.document.createMany({ data: demoDocuments.map((document, index) => ({ companyId: company.id, type: document.type, title: document.title, contentMarkdown: document.markdown, metadata: { sources: sourceUrls, generationMode: "prepared-demo", notice: "Prepared sample content. Connect a live provider and run a new audit to create a verified skill execution receipt." }, skillProvenance: getDocumentDefinition(document.type as DocumentType)?.skills ?? [], tokenEstimate: 7600 + (index * 420) })) });

  await db.crawlPage.createMany({ data: [
    { companyId: company.id, url: "https://thesmarketers.com/", title: "The Smarketers", description: "B2B marketing agency", content: "Account based marketing, inbound marketing, HubSpot implementation, and AI lead generation for B2B teams.", statusCode: 200, wordCount: 780 },
    { companyId: company.id, url: "https://thesmarketers.com/services/", title: "B2B Marketing Services", description: "Demand generation services", content: "Strategy, campaigns, content, paid media, RevOps, and HubSpot services.", statusCode: 200, wordCount: 920 },
    { companyId: company.id, url: "https://thesmarketers.com/about/", title: "About The Smarketers", description: "Your growth catalyst", content: "A B2B growth team focused on measurable marketing outcomes.", statusCode: 200, wordCount: 430 },
  ] });

  await db.pageSpeedAudit.createMany({ data: [
    { companyId: company.id, strategy: "mobile", performance: 78, statusCode: 200, ttfb: 620, responseTime: 840, transferSize: 184000, source: "Python URL timing test" },
    { companyId: company.id, strategy: "desktop", performance: 91, statusCode: 200, ttfb: 310, responseTime: 490, transferSize: 184000, source: "Python URL timing test" },
  ] });

  for (const [agentType, summary, output] of demoAgents) await db.agentRun.create({ data: { companyId: company.id, agentType, status: "DONE", summary, output: output as never, sources: sourceUrls, skills: getAgentDefinition(agentType as AgentType)?.skills ?? [], confidence: 88, tokensUsed: 5400, startedAt: new Date(), completedAt: new Date() } });
  for (const provider of ["google", "github", "x", "linkedin", "whatsapp", "telegram"]) await db.integration.create({ data: { companyId: company.id, provider, status: "demo_connected", accessTokenEnc: "demo-mock-token", connectedAt: new Date() } });
  await db.chatAttachment.create({ data: { companyId: company.id, userId: user.id, sourceType: "pasted_text", title: "Sample client brief", content: "A mid-market SaaS client wants five qualified enterprise conversations per day without increasing paid-media dependence.", remembered: true } });
  await db.report.create({ data: { companyId: company.id, template: "Monthly Summary", format: "html", fileUrl: "/demo-monthly-summary.html" } });
  await db.auditJob.create({ data: { companyId: company.id, status: "DONE", progress: 100, step: "Demo audit complete", startedAt: new Date(), completedAt: new Date() } });
}

main().then(() => db.$disconnect()).catch(async (error) => { console.error(error); await db.$disconnect(); process.exit(1); });
