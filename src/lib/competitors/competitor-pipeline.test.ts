import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("../company-logo", () => ({ resolveCompanyLogo: async () => null }));

import { analyzeCompetitorLandscape, rankLiveCompetitorCandidates } from "./analyzer";
import { synthesizeSkillsAndFindings } from "./nodes-synthesizer";
import type { CompanyStrategicProfile } from "./types";

const mockProfile: CompanyStrategicProfile = {
  companyName: "The Smarketers",
  websiteUrl: "https://thesmarketers.com",
  category: "B2B Marketing & Demand Generation",
  tagline: "High-growth B2B demand generation",
  description: "A B2B marketing agency that handles account-based marketing (ABM) and automated SEO client reporting.",
  coreOfferStack: [
    "Full-Funnel Demand Generation",
    "Account-Based Marketing (ABM)",
    "Automated Technical Audits & SEO Reporting",
  ],
  productServiceCategories: [
    "Full-Funnel Demand Generation (B2B Marketing)",
    "Automated Technical Audits & SEO Reporting (B2B Marketing)",
  ],
  icpsAndPersonas: [
    {
      title: "B2B Marketing Agency Owner",
      role: "Agency Founder / CEO",
      description: "Runs an agency looking to scale client reporting and audits.",
      painPoints: ["Spending 5+ hours per client compiling SEO reports manually"],
      buyingTriggers: ["Scaling client base beyond current capacity"],
    },
  ],
  painPoints: [
    "Manual client SEO reporting takes 5+ hours per client every month",
    "Legacy SEO tools are too expensive and lack white-label features",
  ],
  useCases: ["Automating agency client SEO reporting"],
  positioning: "The Smarketers is an automated agency client reporting and technical audit platform.",
  differentiators: [
    "Evidence-led architecture that never hallucinates metrics",
    "Built specifically for agencies with white-label outputs",
  ],
  proofPoints: [
    "Verified 65% reduction in client report generation time",
  ],
  commercialModel: {
    pricingStructure: "Tiered monthly subscription",
    monetizationType: "B2B SaaS / Agency Retainer",
    tierHighlights: ["Core Tier: $99/mo", "Agency Pro: $299/mo"],
  },
  brandProfile: {
    pillars: ["Operational Precision", "Evidence-Led Transparency"],
    messagingThemes: ["Automate manual reporting toil"],
  },
  voice: {
    tone: "Authoritative, practical, concise, transparent.",
    principles: ["Lead with direct answers", "Disclose facts clearly"],
    forbiddenPhrases: ["#1 in the world", "Guaranteed 10x ROI"],
  },
  contentThemes: ["Agency scaling frameworks", "Automated client reporting benchmarks"],
  goalsAndKpis: [
    {
      goal: "Accelerate customer acquisition and demo conversion",
      targetKpi: "Increase qualified demo conversion rate by 25%",
      strategicWeight: "high",
    },
  ],
};

describe("Competitor Intelligence Pipeline & Skills Synthesizer", () => {
  it("prioritizes direct SAP service peers over noisy directory search results", async () => {
    const sapProfile = {
      ...mockProfile,
      companyName: "Praeemineo",
      websiteUrl: "https://praeemineo.com",
      category: "SAP Consulting & Enterprise Transformation",
    };
    const noisyResults = ["datanyze.com", "tracxn.com", "partnerfinder.sap.com", "payroll.zoho.in", "falconebiz.com"].map((host) => ({
      url: `https://${host}`,
      title: host,
      excerpt: "Search directory result",
      discoverySource: "Search Engine",
      query: "competitor alternatives",
      publishedAt: null,
    }));

    const competitors = await analyzeCompetitorLandscape(sapProfile, noisyResults);

    expect(competitors.map((competitor) => competitor.name)).toEqual([
      "DEBCOR Engineering",
      "sapworks",
      "Full On Consulting",
      "Accely",
      "AWAIS",
      "RS Integrators",
    ]);
  });

  it("uses the same direct-overlap method for a B2B ABM, HubSpot, and RevOps agency", async () => {
    const smarketersProfile = {
      ...mockProfile,
      companyName: "The Smarketers",
      websiteUrl: "https://thesmarketers.com",
      category: "B2B Marketing Agency",
      description: "B2B agency combining account-based marketing, inbound demand generation, HubSpot implementation, and RevOps for global technology clients.",
      coreOfferStack: ["Account-Based Marketing", "Inbound Demand Generation", "HubSpot Implementation", "RevOps"],
      productServiceCategories: ["B2B ABM", "HubSpot and RevOps"],
    };
    const noisyResults = ["hubspot.com", "salesforce.com", "clutch.co", "linkedin.com", "gartner.com"].map((host) => ({
      url: `https://${host}`,
      title: host,
      excerpt: "Generic marketing search result",
      discoverySource: "Search Engine",
      query: "B2B marketing agency competitors",
      publishedAt: null,
    }));

    const competitors = await analyzeCompetitorLandscape(smarketersProfile, noisyResults);

    expect(competitors.map((competitor) => competitor.name)).toEqual([
      "Vajra Global",
      "Oxper Martech",
      "TransFunnel",
      "Niswey",
      "Straight Growth",
      "FatFunnel Media",
    ]);
  });

  it("ranks relevant official companies for a future category and rejects directories and self-like domains", () => {
    const roboticsProfile = {
      ...mockProfile,
      companyName: "Forge Robotics",
      websiteUrl: "https://forgerobotics.example",
      category: "Warehouse Robotics Automation",
      description: "Robotics software provider for autonomous warehouse picking and fulfillment automation.",
      coreOfferStack: ["Autonomous picking robots", "Warehouse orchestration software"],
      productServiceCategories: ["Warehouse robotics", "Fulfillment automation"],
    };
    const items = [
      { url: "https://g2.com/categories/warehouse-automation", title: "Best Warehouse Automation Software", excerpt: "Compare warehouse robotics platforms", discoverySource: "Search", query: "warehouse robotics", publishedAt: null },
      { url: "https://forgerobotic.example", title: "Forge Robotic", excerpt: "Warehouse robotics automation", discoverySource: "Search", query: "warehouse robotics", publishedAt: null },
      { url: "https://axisrobotics.example/solutions", title: "Axis Robotics | Warehouse Automation", excerpt: "Autonomous picking robots and warehouse orchestration software for fulfillment teams.", discoverySource: "Search", query: "warehouse robotics", publishedAt: null },
      { url: "https://generic-consulting.example", title: "Generic Consulting", excerpt: "General business consulting services.", discoverySource: "Search", query: "warehouse robotics", publishedAt: null },
    ];

    expect(rankLiveCompetitorCandidates(roboticsProfile, items)).toEqual([
      expect.objectContaining({ name: "Axis Robotics", website: "https://axisrobotics.example" }),
    ]);
  });

  it("generates 5–6 distinct Competitor Profiles with all 12 dimensions and 'How we differ' contrast", async () => {
    const liveItems = [
      {
        url: "https://semrush.com",
        title: "Semrush All-in-One Marketing Suite",
        excerpt: "Enterprise search marketing and competitor analytics platform.",
        discoverySource: "Search Engine",
        query: "competitor alternatives",
        publishedAt: new Date().toISOString(),
      },
      {
        url: "https://ahrefs.com",
        title: "Ahrefs SEO Tools & Resources",
        excerpt: "Backlink index and site audit crawler.",
        discoverySource: "Search Engine",
        query: "competitor alternatives",
        publishedAt: new Date().toISOString(),
      },
    ];

    const competitors = await analyzeCompetitorLandscape(mockProfile, liveItems);

    expect(competitors.length).toBeGreaterThanOrEqual(5);
    expect(competitors.length).toBeLessThanOrEqual(6);

    const first = competitors[0];
    expect(first.name).toBeDefined();
    expect(first.officialWebsite).toMatch(/^https?:\/\//);
    expect(first.category).toBe(mockProfile.category);
    expect(first.targetAudience).toBeDefined();
    expect(first.coreOffer).toBeDefined();
    expect(first.keyFeatures.length).toBeGreaterThanOrEqual(2);
    expect(first.pricingMarketPosition).toBeDefined();
    expect(first.primaryUsp).toBeDefined();
    expect(first.strengths.length).toBeGreaterThanOrEqual(2);
    expect(first.weaknesses.length).toBeGreaterThanOrEqual(2);
    expect(first.positioningAngle).toBeDefined();
    expect(first.proofSignals.length).toBeGreaterThanOrEqual(1);
    expect(first.howWeDiffer).toContain("The Smarketers");
    expect(first.howWeDiffer).toMatch(/Unlike/i);
    expect(first.evidenceSummary).toBeDefined();
  });

  it("synthesizes skills into normalized findings with verified provenance labels", () => {
    const mockCompetitors = [
      {
        id: "comp-semrush",
        name: "Semrush",
        officialWebsite: "https://semrush.com",
        logoUrl: "",
        category: mockProfile.category,
        targetAudience: "Enterprise teams",
        coreOffer: "Semrush Suite",
        keyFeatures: ["Keyword tracking", "Backlinks"],
        pricingMarketPosition: "Enterprise tiered ($400 - $1,200+/mo)",
        primaryUsp: "Industry standard data scale",
        strengths: ["Brand recognition", "Data scale"],
        weaknesses: ["High enterprise costs", "Complex UI"],
        positioningAngle: "All-in-one search suite",
        proofSignals: ["Market authority"],
        howWeDiffer: "Unlike Semrush, The Smarketers offers automated reporting.",
        evidenceSummary: "Semrush provides all-in-one search tooling.",
        marketShareTier: "market_leader" as const,
        confidenceScore: 92,
      },
    ];

    const { findings, actionItems } = synthesizeSkillsAndFindings(mockProfile, mockCompetitors);

    expect(findings.length).toBeGreaterThanOrEqual(4);
    for (const f of findings) {
      expect(["positive_signal", "issue", "risk", "opportunity", "insight", "action_candidate"]).toContain(f.type);
      expect(["verified", "supported", "inferred", "assumed"]).toContain(f.provenance);
      expect(f.originatingSkills.length).toBeGreaterThanOrEqual(1);
      expect(f.title).toBeDefined();
      expect(f.evidence).toBeDefined();
      expect(f.impact).toBeDefined();
    }

    expect(actionItems.length).toBeGreaterThanOrEqual(4);
    for (const act of actionItems) {
      expect(act.priorityScore).toBeGreaterThan(0);
      expect(act.priorityScore).toBeLessThanOrEqual(100);
      expect(act.originatingSkills.length).toBeGreaterThanOrEqual(2); // Cross-skill merged
      expect(act.goalKpiAlignment).toBeDefined();
      expect(act.concreteNextStep).toBeDefined();
      expect(act.voiceGuardrail).toBeDefined();
    }

    // Critical actions should be ranked top
    expect(actionItems[0].priorityTier).toBe("critical");
    expect(actionItems[0].priorityScore).toBeGreaterThanOrEqual(actionItems[actionItems.length - 1].priorityScore);
  });

  it("strictly filters out dictionary definitions, utility testers, and banking portals", () => {
    const garbageResults = [
      { url: "https://www.merriam-webster.com/dictionary/key", title: "KEY Definition & Meaning - Merriam-Webster", excerpt: "The meaning of KEY is an instrument by which the bolt of a lock is turned." },
      { url: "https://en.key-test.ru/", title: "Key Test - keyboard test online", excerpt: "Online keyboard test to check keyboard keys functioning." },
      { url: "https://keyboard-tester.com/", title: "Keyboard Tester - Test your keys online", excerpt: "Free keyboard testing tool for desktop and laptop." },
      { url: "https://ibx.key.com/", title: "KeyBank Online Banking - Sign In", excerpt: "Sign in to your KeyBank online banking account." },
      { url: "https://key.com/", title: "Online & Mobile Banking - KeyBank", excerpt: "Personal banking, loans, mortgages, and commercial accounts." },
    ].map((item) => ({
      ...item,
      discoverySource: "Search Engine",
      query: "key competitors alternatives",
      publishedAt: null,
    }));

    const keyProfile = {
      ...mockProfile,
      companyName: "Keyfactor",
      websiteUrl: "https://keyfactor.com",
      category: "Machine Identity & Cryptographic Security",
      description: "Enterprise certificate lifecycle management and PKI automation.",
      coreOfferStack: ["Certificate Lifecycle Management", "PKI as a Service"],
    };

    const ranked = rankLiveCompetitorCandidates(keyProfile, garbageResults);
    expect(ranked).toHaveLength(0);
  });

  it("resolves exact research compliance peers for Key Solutions (keyusa.com) and never SEO tools", async () => {
    const keyUsaProfile = {
      ...mockProfile,
      companyName: "Key Solutions",
      websiteUrl: "https://keyusa.com",
      category: "Research Administration & Compliance Software",
      description: "eProtocol management system for IRB, IACUC, and IBC research compliance automation.",
      coreOfferStack: ["eProtocol IRB Management", "IACUC Protocol Automation", "IBC Biosafety Compliance"],
    };

    const competitors = await analyzeCompetitorLandscape(keyUsaProfile, []);
    expect(competitors.map((c) => c.name)).toEqual([
      "Cayuse",
      "Huron Research Suite",
      "Kuali Research",
      "InfoEd Global",
      "Streamlyne",
      "A Tune (tick@lab)",
    ]);
  });

  it("resolves exact FinOps and cloud cost management peers for Finopsly (finopsly.com)", async () => {
    const finopslyProfile = {
      ...mockProfile,
      companyName: "Finopsly",
      websiteUrl: "https://finopsly.com",
      category: "Cloud Cost Management & FinOps Platform",
      description: "Automated multi-cloud cost optimization, anomaly detection, and Kubernetes resource allocation.",
      coreOfferStack: ["Multi-Cloud Cost Intelligence", "Kubernetes Allocation", "Autonomous Rate Optimization"],
    };

    const competitors = await analyzeCompetitorLandscape(finopslyProfile, []);
    expect(competitors.map((c) => c.name)).toEqual([
      "CloudZero",
      "Kubecost",
      "Cast AI",
      "ProsperOps",
      "Spot by NetApp",
      "Vantage",
    ]);
  });

  it("dynamically resolves live competitors for any arbitrary new account (e.g. Drone Mapping)", async () => {
    const droneProfile = {
      ...mockProfile,
      companyName: "DroneDeploy",
      websiteUrl: "https://dronedeploy.com",
      category: "Enterprise Drone Mapping & Reality Capture Software",
      description: "Cloud-based aerial drone mapping, 3D photogrammetry, and construction site reality capture.",
      coreOfferStack: ["3D Photogrammetry", "Construction Site Inspection", "Drone Fleet Management"],
    };

    const liveDroneResults = [
      { url: "https://www.pix4d.com/", title: "Pix4D - Professional Drone Photogrammetry and Mapping Software", excerpt: "Pix4D develops photogrammetry software for drone mapping, 3D modeling, and reality capture." },
      { url: "https://www.propelleraero.com/", title: "Propeller Aero - Drone Surveying and 3D Mapping for Earthwork", excerpt: "Propeller drone mapping platform for earthwork construction and quarry volumetric surveys." },
      { url: "https://www.skycatch.com/", title: "Skycatch - High Precision Drone Mapping and Autonomous Data Capture", excerpt: "Enterprise high-precision drone photogrammetry and construction analytics software." },
      { url: "https://wingtra.com/", title: "Wingtra - High Precision Surveying and Mapping VTOL Drones", excerpt: "Commercial VTOL mapping drones and aerial survey reality capture solutions." },
      { url: "https://www.esri.com/en-us/arcgis/products/site-scan-for-arcgis/", title: "Site Scan for ArcGIS - Drone Flight and Cloud Processing", excerpt: "Complete cloud-based drone mapping and photogrammetry application for construction and AEC." },
    ].map((item) => ({
      ...item,
      discoverySource: "Search Engine",
      query: "dronedeploy competitors alternatives",
      publishedAt: null,
    }));

    const competitors = await analyzeCompetitorLandscape(droneProfile, liveDroneResults);
    expect(competitors.length).toBeGreaterThanOrEqual(5);
    expect(competitors.map((c) => c.name)).toContain("Pix4D");
    expect(competitors.map((c) => c.name)).toContain("Propeller Aero");
    expect(competitors.map((c) => c.name)).toContain("Skycatch");
  });
});
