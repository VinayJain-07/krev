export interface TargetGeographies {
  primary: string;
  secondary: string[];
  priorityNotes?: string;
}

export interface TargetAudience {
  segments: string[];
  buyerPersonas: string[];
  corePainPoints?: string;
}

export interface Positioning {
  valueProposition?: string;
  keyDifferentiator?: string;
}

export interface MarketingStrategyBrief {
  targetGeographies: TargetGeographies;
  targetAudience: TargetAudience;
  positioning: Positioning;
  competitors: string[];
  marketingGoals: string[];
  brandVoice?: string;
  salesMotion?: string;
  additionalNotes?: string;
}

export const COMMON_GEOGRAPHIES = [
  "North America (US & Canada)",
  "United States",
  "United Kingdom",
  "Western Europe (DACH & UK)",
  "European Union",
  "India & South Asia",
  "Asia-Pacific (APAC)",
  "Australia & New Zealand",
  "Middle East (GCC)",
  "Latin America (LATAM)",
  "Global / Worldwide",
] as const;

export const COMMON_AUDIENCE_SEGMENTS = [
  "B2B Enterprise (1,000+ emp)",
  "B2B Mid-Market (100–999 emp)",
  "SMBs (10–99 emp)",
  "High-Growth Startups / Scaleups",
  "Direct to Consumer (B2C)",
  "Agencies & Consultancies",
  "Developers & Technical Teams",
] as const;

export const COMMON_BUYER_PERSONAS = [
  "Chief Marketing Officer (CMO)",
  "VP / Head of Growth",
  "VP / Director of Marketing",
  "Founder / CEO / Co-founder",
  "Chief Technology Officer (CTO)",
  "Head of Demand Gen / Performance",
  "VP / Head of Sales",
  "Product Manager / CPO",
] as const;

export const COMMON_MARKETING_GOALS = [
  "Inbound Pipeline & Lead Generation",
  "SEO & Organic Search Dominance",
  "AI Answer Engine & GEO Visibility",
  "Account-Based Marketing (ABM)",
  "Brand Authority & Thought Leadership",
  "Product-Led Growth (PLG) & Free Trial Conversion",
  "Outbound & Multi-Touch Orchestration",
  "Customer Retention & Expansion",
] as const;

export const COMMON_BRAND_VOICES = [
  "Authoritative & Data-Driven",
  "Bold, Disruptive & Contrarian",
  "Conversational, Friendly & Human",
  "Technical, Precise & Engineering-led",
  "Polished, Premium & Executive",
  "Energetic, Vibrant & Creative",
] as const;

export const COMMON_SALES_MOTIONS = [
  "Sales-Led / High-Touch Enterprise",
  "Product-Led Growth (Self-serve + Upgrade)",
  "Hybrid (PLG + Inbound Sales Assisted)",
  "High-Ticket Services / Advisory",
] as const;

export function formatMarketingBriefToMarkdown(brief: Partial<MarketingStrategyBrief>): string {
  const sections: string[] = [];

  sections.push("# Strategic Marketing & Geography Intelligence Brief");
  sections.push("> **Ground Truth Input**: Verified company marketing preferences, prioritized geographic focus, target audience profiles, and strategic goals supplied during onboarding.");

  // 1. Target Geography
  const geo = brief.targetGeographies;
  if (geo && (geo.primary || geo.secondary?.length || geo.priorityNotes)) {
    sections.push("## 1. Target Geography (Priority Ranked)");
    if (geo.primary) {
      sections.push(`- **Tier 1 (Primary Core Market):** ${geo.primary}`);
    }
    if (geo.secondary && geo.secondary.length > 0) {
      sections.push(`- **Tier 2 (Secondary Expansion Markets):** ${geo.secondary.join(", ")}`);
    }
    if (geo.priorityNotes) {
      sections.push(`- **Priority Allocation & Regional Focus:** ${geo.priorityNotes}`);
    }
  }

  // 2. Audience & ICP
  const aud = brief.targetAudience;
  if (aud && (aud.segments?.length || aud.buyerPersonas?.length || aud.corePainPoints)) {
    sections.push("## 2. Ideal Customer Profile (ICP) & Target Audience");
    if (aud.segments && aud.segments.length > 0) {
      sections.push(`- **Target Market Segments:** ${aud.segments.join(", ")}`);
    }
    if (aud.buyerPersonas && aud.buyerPersonas.length > 0) {
      sections.push(`- **Primary Buyer Personas & Decision Makers:** ${aud.buyerPersonas.join(", ")}`);
    }
    if (aud.corePainPoints) {
      sections.push(`- **Critical Customer Pain Points Solved:** ${aud.corePainPoints}`);
    }
  }

  // 3. Positioning & Differentiators
  const pos = brief.positioning;
  if (pos && (pos.valueProposition || pos.keyDifferentiator)) {
    sections.push("## 3. Value Proposition & Core Differentiators");
    if (pos.valueProposition) {
      sections.push(`- **Core Value Proposition:** ${pos.valueProposition}`);
    }
    if (pos.keyDifferentiator) {
      sections.push(`- **Primary Competitive Moat / Differentiator:** ${pos.keyDifferentiator}`);
    }
  }

  // 4. Competitors
  if (brief.competitors && brief.competitors.length > 0) {
    sections.push("## 4. Key Competitors & Alternatives");
    sections.push(`- **Direct Competitors Tracked:** ${brief.competitors.join(", ")}`);
  }

  // 5. Goals & GTM Motion
  const hasGoals = brief.marketingGoals && brief.marketingGoals.length > 0;
  if (hasGoals || brief.brandVoice || brief.salesMotion || brief.additionalNotes) {
    sections.push("## 5. Marketing Objectives & Brand Personality");
    if (hasGoals) {
      sections.push(`- **Top Priority Goals:** ${brief.marketingGoals?.join(", ")}`);
    }
    if (brief.brandVoice) {
      sections.push(`- **Brand Tone & Voice:** ${brief.brandVoice}`);
    }
    if (brief.salesMotion) {
      sections.push(`- **Go-To-Market / Sales Motion:** ${brief.salesMotion}`);
    }
    if (brief.additionalNotes) {
      sections.push(`- **Additional Strategic Context:**\n${brief.additionalNotes}`);
    }
  }

  return sections.join("\n\n");
}
