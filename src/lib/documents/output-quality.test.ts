import ExcelJS from "exceljs";
import { describe, expect, it, vi } from "vitest";
import { ALL_DOCUMENTS } from "../nodes/registry";
import { ARTIFACT_PROFILES, resolveArtifactManifest } from "../artifacts/config";
import { buildReportDataModel } from "../artifacts/model";
import { documentOutputContract } from "./output-contract";
import { createBrandedXlsx } from "./xlsx";
import { workbookCellValue, uniqueTableHeaders } from "./workbook-layout";

vi.mock("server-only", () => ({}));

describe("document output quality", () => {
  it.each(ALL_DOCUMENTS)("defines an explicit, usable export for $type", (definition) => {
    expect(ARTIFACT_PROFILES[definition.type]).toBeDefined();
    const manifest = resolveArtifactManifest({ reportType: definition.type });
    expect(manifest.decisions[manifest.primaryArtifact].enabled).toBe(true);
    if (definition.type !== "BACKLINK_OUTREACH_BLUEPRINT") expect(manifest.decisions.pdf.enabled).toBe(true);
    expect(documentOutputContract(definition.type)).toContain("Cite evidence beside the claim");
    expect(new Set(manifest.requiredSheets).size).toBe(manifest.requiredSheets.length);
    expect(manifest.requiredSheets.every((name) => name.length <= 31)).toBe(true);
  });

  it.each(["AB_TEST_ROADMAP", "TOPIC_CLUSTER_BLUEPRINT", "PSEO_BLUEPRINT", "CONTENT_AUDIT", "SOCIAL_BATCH_PLAN", "PAID_ADS_PLAYBOOK", "ANALYTICS_TRACKING_BLUEPRINT"])("defaults %s to XLSX regardless of prose length", (reportType) => {
    expect(resolveArtifactManifest({ reportType }).primaryArtifact).toBe("xlsx");
  });

  it("normalizes legacy merged document types for export", () => {
    expect(resolveArtifactManifest({ reportType: "PRODUCT_INFO" }).reportType).toBe("COMPANY_INTELLIGENCE");
    expect(resolveArtifactManifest({ reportType: "CONTENT_STRATEGY" }).reportType).toBe("CONTENT_AUDIT");
    expect(resolveArtifactManifest({ reportType: "COMPETITOR_COMPARISON_PLAYBOOK" }).reportType).toBe("COMPETITOR_ANALYSIS");
  });

  it("preserves typed working data, full drafts, sheet contracts and missing values on round trip", async () => {
    const draft = "Explain the customer's evidence and the next useful decision. ".repeat(18);
    const markdown = `# Social plan\n\n## Executive summary\n\nPublish only after proof review.\n\n## Content Calendar\n\n| Post ID | Publish date | Draft | Progress | Evidence URL |\n|---|---|---|---|---|\n| 001 | 2026-09-10 | ${draft} | 0% | https://example.com/proof |\n\n## Recommendations\n\n- High priority: review proof. https://example.com/proof\n- Assign a reviewer; no priority is supplied.\n`;
    const manifest = resolveArtifactManifest({ reportType: "SOCIAL_BATCH_PLAN", markdown });
    const model = buildReportDataModel({ reportType: manifest.reportType, companyName: "Example", title: "Social plan", markdown, updatedAt: new Date("2026-09-08"), sourceCount: 1, manifest });
    const buffer = await createBrandedXlsx({ companyName: "Example", title: "Social plan", markdown, updatedAt: new Date("2026-09-08"), sourceCount: 1, reportModel: model, manifest });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    expect(workbook.worksheets.slice(0, manifest.requiredSheets.length).map((sheet) => sheet.name)).toEqual(manifest.requiredSheets);
    expect(workbook.getWorksheet("Artifact Manifest")).toBeUndefined();
    const calendar = workbook.getWorksheet("02_Content_Calendar")!;
    expect(calendar.getCell("A6").value).toBe("001");
    expect(calendar.getCell("B6").value).toEqual(new Date("2026-09-10"));
    expect(calendar.getCell("C6").value).toBe(draft.trim());
    expect(calendar.getRow(6).height).toBeGreaterThan(200);
    expect(calendar.getCell("D6").value).toBe(0);
    expect(calendar.getCell("E6").hyperlink).toBe("https://example.com/proof");
    expect(calendar.views[0]).toMatchObject({ state: "frozen", ySplit: 5 });
    expect(calendar.pageSetup.printTitlesRow).toBe("1:5");
    expect(workbook.getWorksheet("03_Post_Drafts")!.getCell("A5").value).toBe("Data unavailable");
    const tracker = workbook.getWorksheet("90_Action_Tracker")!;
    expect(tracker.getCell("H6").value).toBe("https://example.com/proof");
    expect(tracker.getCell("H7").value ?? "").toBe("");
    expect(tracker.getCell("I6").result).toBe(3);
    expect(tracker.getCell("I7").result ?? "").toBe("");
    expect(tracker.getCell("J6").formula).toContain("Complete");
  });

  it("keeps identifiers, unknowns and formula-like source text literal", () => {
    expect(workbookCellValue("001", "Post ID").value).toBe("001");
    expect(workbookCellValue("Unavailable", "Budget").value).toBe("Unavailable");
    expect(workbookCellValue("=HYPERLINK(\"https://example.com\")", "Draft").value).toBe('=HYPERLINK("https://example.com")');
    expect(workbookCellValue("0", "Budget").value).toBe(0);
    expect(uniqueTableHeaders(["Status", "status", "", "Column 3"])).toEqual(["Status", "status 2", "Column 3", "Column 3 2"]);
  });
});
