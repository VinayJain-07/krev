import { AgentType, DocumentType } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { buildResearchQueries } from "../research/live-discovery";
import { AGENT_DEFINITIONS, ALL_DOCUMENTS, AUDIT_DOCUMENT_QUEUE, AUDIT_PRIORITY_DOCUMENT_TYPES, INTERNAL_OPERATIONS, LEGACY_DOCUMENT_ALIASES, getDocumentDefinition } from "./registry";

vi.mock("server-only", () => ({}));

describe("skill operation registry", () => {
  it("maps every document, agent, and internal operation to ordered real skill steps", () => {
    const visibleDocumentTypes = ALL_DOCUMENTS.map((item) => item.type);
    const legacyTypes = Object.keys(LEGACY_DOCUMENT_ALIASES) as DocumentType[];
    expect([...visibleDocumentTypes, ...legacyTypes].sort()).toEqual(Object.values(DocumentType).sort());
    expect(visibleDocumentTypes).not.toContain("PRODUCT_INFO");
    expect(visibleDocumentTypes).not.toContain("CONTENT_STRATEGY");
    expect(visibleDocumentTypes).not.toContain("COMPETITOR_COMPARISON_PLAYBOOK");
    expect(getDocumentDefinition("PRODUCT_INFO")).toMatchObject({ type: "COMPANY_INTELLIGENCE" });
    expect(getDocumentDefinition("CONTENT_STRATEGY")).toMatchObject({ type: "CONTENT_AUDIT" });
    expect(getDocumentDefinition("COMPETITOR_COMPARISON_PLAYBOOK")).toMatchObject({ type: "COMPETITOR_ANALYSIS" });
    expect(AGENT_DEFINITIONS.map((item) => item.type).sort()).toEqual(Object.values(AgentType).sort());
    const operations = [...ALL_DOCUMENTS, ...AGENT_DEFINITIONS, ...Object.values(INTERNAL_OPERATIONS)];
    for (const operation of operations) {
      expect(operation.skills.length).toBeGreaterThan(0);
      for (const step of operation.skills) {
        expect(["smark-node-1", "smark-node-2", "smark-node-3", "local"]).toContain(step.repository);
        expect(step.phase.length).toBeGreaterThan(0);
        expect(step.reason.length).toBeGreaterThan(10);
      }
    }
  });

  it("uses the main SEO audit first and a reporting skill last for competitor analysis", () => {
    const seo = ALL_DOCUMENTS.find((item) => item.type === "SEO_AUDIT")!;
    const competitor = ALL_DOCUMENTS.find((item) => item.type === "COMPETITOR_ANALYSIS")!;
    expect(seo.nodes[0]).toMatchObject({ repository: "smark-node-1", node: "seo-audit", phase: "foundation" });
    expect(competitor.nodes.at(-1)).toMatchObject({ repository: "smark-node-3", node: "analytics-and-reporting", phase: "reporting" });
  });

  it("keeps the five requested merged experiences complete", () => {
    const company = ALL_DOCUMENTS.find((item) => item.type === "COMPANY_INTELLIGENCE")!;
    const content = ALL_DOCUMENTS.find((item) => item.type === "CONTENT_AUDIT")!;
    const competitor = ALL_DOCUMENTS.find((item) => item.type === "COMPETITOR_ANALYSIS")!;
    const social = ALL_DOCUMENTS.find((item) => item.type === "SOCIAL_BATCH_PLAN")!;
    const video = ALL_DOCUMENTS.find((item) => item.type === "SHORT_FORM_VIDEO_BLUEPRINT")!;
    const skills = (item: typeof company) => item.skills.map((step) => step.skill);
    expect(skills(company)).toEqual(expect.arrayContaining(["pricing-strategy", "sales-enablement"]));
    expect(skills(content)).toEqual(expect.arrayContaining(["content-audit", "content-calendar"]));
    expect(skills(competitor)).toEqual(expect.arrayContaining(["competitor-analysis", "competitor-alternatives"]));
    expect(skills(social)).toEqual(expect.arrayContaining(["batch-content-plan", "linkedin-post-writer", "reels-script", "story-writer"]));
    expect(skills(video)).toEqual(expect.arrayContaining(["short-form-video-script", "ugc-and-influencer", "scripting-and-storyboarding"]));
  });

  it("queues every report sequentially with competitor and company intelligence first", () => {
    expect(AUDIT_PRIORITY_DOCUMENT_TYPES).toEqual(["COMPETITOR_ANALYSIS", "COMPANY_INTELLIGENCE"]);
    expect(AUDIT_DOCUMENT_QUEUE.map((document) => document.type)).toEqual([
      "COMPETITOR_ANALYSIS",
      "COMPANY_INTELLIGENCE",
      "MARKETING_STRATEGY",
      "SEO_AUDIT",
      "GEO_AUDIT",
      "AUDIENCE_ANALYSIS",
      "CONTENT_AUDIT",
      "DESIGN_GUIDE",
    ]);
    expect(AUDIT_DOCUMENT_QUEUE[2]).toMatchObject({ type: "MARKETING_STRATEGY", title: "Strategic Intelligence Report" });
  });
});

describe("Reddit target-customer discovery", () => {
  it("builds multiple pain, recommendation, and alternative queries from website topics", () => {
    const queries = buildResearchQueries("REDDIT", "Acme", "acme.example", ["revenue operations", "account based marketing"]);
    expect(queries).toHaveLength(6);
    expect(queries.join(" ")).toContain("help recommend");
    expect(queries.join(" ")).toContain("problem struggling");
    expect(queries.join(" ")).toContain("alternative looking for");
    expect(queries.every((query) => query.includes("revenue operations") || query.includes("account based marketing"))).toBe(true);
  });
});

describe("Competitor discovery", () => {
  it("builds focused category and offer queries instead of one oversized topic string", () => {
    const queries = buildResearchQueries("COMPETITOR", "Acme", "acme.example", [
      "Warehouse Robotics Automation",
      "Autonomous Picking Robots",
      "Warehouse Orchestration Software",
    ]);

    expect(queries).toHaveLength(6);
    expect(queries).toContain('"Warehouse Robotics Automation" "Autonomous Picking Robots" companies');
    expect(queries).toContain('"Autonomous Picking Robots" "Warehouse Orchestration Software" companies');
    expect(queries.every((query) => query.length < 180)).toBe(true);
  });
});
