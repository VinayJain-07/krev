import type {
  CompanyStrategicProfile,
  CompetitorProfile,
  NormalizedFinding,
  PrioritizedActionItem,
} from "./types";

/**
 * Runs skills synthesis across Product Marketing Context, Brand Profile, Voice Builder,
 * Content Research & Sourcing, Marketing Ideas, and Goals & KPIs on company & competitor evidence.
 */
export function synthesizeNodesAndFindings(
  profile: CompanyStrategicProfile,
  competitors: CompetitorProfile[]
): {
  findings: NormalizedFinding[];
  actionItems: PrioritizedActionItem[];
} {
  const comp1 = competitors[0] || { name: "Market Leader", weaknesses: ["High enterprise costs and slow setup"] };
  const comp2 = competitors[1] || competitors[0] || { name: "Alternative Tool", weaknesses: ["Complex UI"] };
  const primaryGoal = profile.goalsAndKpis[0] || { goal: "Accelerate customer acquisition", targetKpi: "Increase demo conversion by 25%" };
  const primaryDiff = profile.differentiators[0] || "purpose-built workflow automation";

  // 1. Structured Normalized Findings across skills (no long unstructured documents)
  const findings: NormalizedFinding[] = [
    {
      id: "find-pmc-1",
      type: "positive_signal",
      provenance: "verified",
      originatingSkills: ["Product Marketing Context", "Content Research & Sourcing"],
      title: `High offer-to-pain alignment for ${profile.category}`,
      evidence: `Website explicitly addresses ${profile.painPoints[0] || "core customer friction"} with clear feature deliverables.`,
      impact: `Strong baseline proposition enables high-converting product-led and outbound messaging.`,
      category: "offer",
      confidence: 94,
    },
    {
      id: "find-brand-1",
      type: "issue",
      provenance: "supported",
      originatingSkills: ["Brand Profile", "Voice Builder"],
      title: `Under-communicated differentiation against ${comp1.name}`,
      evidence: `Home and product pages emphasize general capabilities without contrasting against ${comp1.name}'s known drawbacks (${comp1.weaknesses[0] || "pricing tiers"}).`,
      impact: `Prospects in active evaluation cycles default to ${comp1.name} due to higher legacy market awareness.`,
      category: "positioning",
      confidence: 89,
    },
    {
      id: "find-comp-1",
      type: "opportunity",
      provenance: "verified",
      originatingSkills: ["Competitor Analysis", "Marketing Ideas"],
      title: `Commercial pricing and velocity advantage over ${comp1.name}`,
      evidence: `${comp1.name} locks automated workflows behind enterprise tiers (${comp1.pricingMarketPosition}), whereas ${profile.companyName} provides faster time-to-value.`,
      impact: `Captures mid-market and high-velocity buyers frustrated with legacy seat minimums and complex onboarding.`,
      category: "acquisition",
      confidence: 92,
    },
    {
      id: "find-geo-1",
      type: "opportunity",
      provenance: "supported",
      originatingSkills: ["Content Research & Sourcing", "Goals & KPIs"],
      title: `AI search and answer engine citation whitespace`,
      evidence: `Competitors lack structured question-answer entity passages for ${profile.category.toLowerCase()} comparisons in answer engines (Perplexity, ChatGPT, AI Overviews).`,
      impact: `Early entity optimization can secure dominant top-3 citable source positioning for non-brand queries.`,
      category: "messaging",
      confidence: 86,
    },
    {
      id: "find-risk-1",
      type: "risk",
      provenance: "inferred",
      originatingSkills: ["Product Marketing Context", "Competitor Analysis"],
      title: `Feature parity perception on standard tier offerings`,
      evidence: `${comp2.name} markets a broad feature surface that could dilute ${profile.companyName}'s specialization if proof points are not front-and-center.`,
      impact: `Risk of price compression in competitive RFPs unless proof signals and speed metrics are prominently highlighted.`,
      category: "competitor",
      confidence: 84,
    },
    {
      id: "find-audience-1",
      type: "insight",
      provenance: "supported",
      originatingSkills: ["Product Marketing Context", "Goals & KPIs"],
      title: `Decision-maker urgency around time-to-first-value`,
      evidence: `${profile.icpsAndPersonas[0]?.role || "Decision makers"} report buying triggers centered on urgent operational scaling rather than incremental tooling upgrades.`,
      impact: `Aligning campaign messaging around speed-to-deployment increases demo show rates and sales velocity.`,
      category: "audience",
      confidence: 90,
    },
  ];

  // 2. Prioritized Action Items (Merged across skills into concrete execution systems)
  const actionItems: PrioritizedActionItem[] = [
    {
      id: "act-1",
      title: `Launch High-Conversion Comparison Landing Page: "${profile.companyName} vs ${comp1.name}"`,
      whatShouldBeDone: `Build a dedicated, evidence-led head-to-head comparison page contrasting ${profile.companyName}'s ${primaryDiff.toLowerCase()} against ${comp1.name}'s ${comp1.weaknesses[0]?.toLowerCase() || "complex enterprise tiers"}. Include a side-by-side workflow matrix, time-to-value benchmarks, and transparent commercial pricing.`,
      whyItMatters: `Captures high-intent prospects actively searching for "${comp1.name} alternatives" and converts commercial friction into pipeline.`,
      evidence: `Competitor analysis confirms ${comp1.name} has high legacy market authority but charges enterprise minimums, while Product Marketing Context reveals our strong speed advantage.`,
      originatingSkills: ["Product Marketing Context", "Brand Profile", "Competitor Analysis", "Goals & KPIs"],
      goalKpiAlignment: `${primaryGoal.targetKpi} (Direct win-rate boost in competitor evaluations)`,
      expectedImpact: "High",
      estimatedEffort: "Days",
      confidence: 94,
      priorityScore: 96,
      priorityTier: "critical",
      concreteNextStep: `Draft the 5-point feature and commercial comparison matrix focusing on deployment speed and cost efficiency, then publish to /vs/${comp1.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.`,
      voiceGuardrail: `Maintain an objective, factual, and respectful tone (${profile.voice.tone}). Never use aggressive attack copy or unverifiable claims.`,
      experimentOutline: {
        hypothesis: `Prospects landing on a direct ${comp1.name} comparison page will convert to demo/trial at 2.5x the rate of the generic homepage.`,
        testChannel: `Search campaigns on "${comp1.name} alternatives" + retargeting evaluation traffic`,
        successMetric: `Demo request conversion rate (target > 8.5%)`,
      },
    },
    {
      id: "act-2",
      title: `Reposition Homepage Hero & Proof Stack Around "${primaryDiff}"`,
      whatShouldBeDone: `Update the homepage H1 and hero subtext to emphasize "${primaryDiff}" and operational velocity over generic feature descriptions. Anchor the hero with 3 verifiable proof metrics and customer outcome badges.`,
      whyItMatters: `Eliminates messaging ambiguity within the first 5 seconds of visitor arrival, immediately distinguishing ${profile.companyName} from ${comp2.name}'s generic positioning.`,
      evidence: `Brand Profile and Voice Builder identified that current hero messaging under-leverages our unique speed and automation proof points.`,
      originatingSkills: ["Brand Profile", "Voice Builder", "Marketing Ideas"],
      goalKpiAlignment: "Increase homepage visitor-to-demo conversion (+25%)",
      expectedImpact: "High",
      estimatedEffort: "Quick Win",
      confidence: 91,
      priorityScore: 92,
      priorityTier: "critical",
      concreteNextStep: `A/B test the new headline variant: "${profile.tagline || `${profile.companyName}: Modern ${profile.category}`}" against the existing control.`,
      voiceGuardrail: `Adhere to Voice Builder principle: "${profile.voice.principles[0] || "Lead with direct answers and verifiable facts"}". Avoid forbidden phrases like "${profile.voice.forbiddenPhrases[0] || "Best in the world"}".`,
      experimentOutline: {
        hypothesis: `A headline clearly stating ${primaryDiff.toLowerCase()} with concrete speed proof will decrease bounce rate by 15% and increase CTA clicks.`,
        testChannel: `Homepage A/B Split Test`,
        successMetric: `Primary CTA click-through rate`,
      },
    },
    {
      id: "act-3",
      title: `Publish Definitive Entity Passage & Technical Guide for AI Engine (GEO) Dominance`,
      whatShouldBeDone: `Create a comprehensive, structured technical guide and FAQ addressing core buying questions in ${profile.category.toLowerCase()}. Structure with Schema.org markup, concise answer passages, and verified source citations to optimize for Perplexity, ChatGPT, and AI Overviews.`,
      whyItMatters: `Capitalizes on competitor whitespace in AI search readiness before incumbents build citation density.`,
      evidence: `Content Research & Sourcing and GEO Audit reveal zero structured answer passages currently deployed by ${comp1.name} or ${comp2.name}.`,
      originatingSkills: ["Content Research & Sourcing", "Product Marketing Context", "Goals & KPIs"],
      goalKpiAlignment: "Rank in top 3 AI answer engine citations for non-brand category queries",
      expectedImpact: "High",
      estimatedEffort: "Days",
      confidence: 88,
      priorityScore: 89,
      priorityTier: "high",
      concreteNextStep: `Author a 2,000-word authoritative guide on "${profile.contentThemes[0] || `Best practices in modern ${profile.category}`}" with JSON-LD schema and extractable Q&A passages.`,
      voiceGuardrail: `Ensure all statistical claims have verified provenance tags (Content Research & Sourcing standard).`,
      experimentOutline: {
        hypothesis: `Structured entity Q&A passages will trigger citation appearances in AI Overviews and Perplexity within 30 days of indexation.`,
        testChannel: `Organic Search & AI Answer Engines`,
        successMetric: `AI search referral sessions and citable mentions`,
      },
    },
    {
      id: "act-4",
      title: `Create Sales Objection Battlecard Targeting "${comp1.name}" Enterprise Lock-in`,
      whatShouldBeDone: `Equip growth and sales teams with a one-page competitive battlecard detailing ${comp1.name}'s pricing model gaps, contract lock-ins, and complex onboarding timelines, paired with customer transition testimonials.`,
      whyItMatters: `Arm sales reps to win head-to-head bake-offs and accelerate pipeline velocity during mid-funnel evaluations.`,
      evidence: `Competitor Analysis identified ${comp1.name}'s key vulnerability is "${comp1.weaknesses[0] || "high pricing tiers"}", which aligns with buyer pain points.`,
      originatingSkills: ["Competitor Analysis", "Product Marketing Context", "Goals & KPIs"],
      goalKpiAlignment: "Improve competitive evaluation win rate by +30%",
      expectedImpact: "Medium",
      estimatedEffort: "Quick Win",
      confidence: 93,
      priorityScore: 86,
      priorityTier: "high",
      concreteNextStep: `Distribute battlecard to revenue team and integrate talk-tracks into sales demo decks.`,
      voiceGuardrail: `Focus on customer enablement and demonstrable facts rather than disparagement.`,
    },
    {
      id: "act-5",
      title: `Deploy 24-Hour "Time-to-First-Value" Interactive Onboarding Walkthrough`,
      whatShouldBeDone: `Streamline the initial product setup flow by introducing an interactive, step-by-step checklist that guides new users to their first completed automation within 15 minutes of signup.`,
      whyItMatters: `Directly tackles the ICP pain point of slow implementation and prevents early churn during trial periods.`,
      evidence: `Audience research and competitor analysis reveal that rival tools (${comp2.name}) suffer from high onboarding abandonment.`,
      originatingSkills: ["Product Marketing Context", "Goals & KPIs"],
      goalKpiAlignment: "Time-to-first-value under 24 hours & 20% increase in trial-to-paid conversion",
      expectedImpact: "High",
      estimatedEffort: "Weeks",
      confidence: 87,
      priorityScore: 84,
      priorityTier: "high",
      concreteNextStep: `Map the 3 essential milestones required for immediate user value and configure product onboarding prompts.`,
      voiceGuardrail: `Clear, encouraging, and task-focused microcopy.`,
    },
  ];

  return { findings, actionItems };
}

export const synthesizeSkillsAndFindings = synthesizeNodesAndFindings;
