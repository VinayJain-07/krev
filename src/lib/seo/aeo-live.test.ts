import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../crawl/url-safety", async (importOriginal) => ({
  ...await importOriginal<typeof import("../crawl/url-safety")>(),
  assertPublicUrl: vi.fn(async (url: URL) => url),
}));

import { scanAeoWebsite } from "./aeo-live";

const savedCrawlPages = [{
  url: "https://example.com/",
  title: "Saved page title",
  description: "Saved description",
  wordCount: 42,
  fetchedAt: "2026-09-01T00:00:00.000Z",
}];

afterEach(() => vi.unstubAllGlobals());

describe("live AEO scanning", () => {
  it("builds the report from fetched HTML and keeps saved crawl data distinct", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: URL) => {
      if (input.pathname === "/robots.txt") return new Response("User-agent: *\nAllow: /", { headers: { "Content-Type": "text/plain" } });
      if (input.pathname === "/sitemap.xml") return new Response("<urlset></urlset>", { headers: { "Content-Type": "application/xml" } });
      return new Response(`<html><head><title>Example</title><meta name="description" content="An example"><link rel="canonical" href="https://example.com/"></head><body><main><h1>Example</h1><h2>What is Example?</h2><p>Example is a public test site that provides a clear explanation for people who want to understand how this service works.</p></main></body></html>`, { headers: { "Content-Type": "text/html" } });
    }));

    const report = await scanAeoWebsite({ name: "Example", websiteUrl: "https://example.com", savedCrawlPages });
    expect(report.attemptedPages).toBe(1);
    expect(report.entitySignals.totalAuditedPages).toBe(1);
    expect(report.answerPassages).toHaveLength(1);
    expect(report.checks.find((check) => check.id === "metadata")?.status).toBe("pass");
    expect(report.checks.find((check) => check.id === "sitemap")?.status).toBe("pass");
    expect(report.savedCrawlPages).toEqual(savedCrawlPages);
  });

  it("reports blocked pages without inventing a readiness score", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("Forbidden", { status: 403 })));

    const report = await scanAeoWebsite({ name: "Example", websiteUrl: "https://example.com", savedCrawlPages });
    expect(report.entitySignals.totalAuditedPages).toBe(0);
    expect(report.readinessScore).toBeNull();
    expect(report.failedPages).toEqual([{ url: "https://example.com/", reason: "HTTP 403" }]);
    expect(report.savedCrawlPages).toEqual(savedCrawlPages);
    expect(report.strategicActions[0]).toContain("HTTP 403");
  });
});
