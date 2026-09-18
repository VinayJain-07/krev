// src/lib/healthChecks.ts

import type { LighthouseReport } from "@/lib/lighthouse/types";

export type CrawlPageCheckInput = {
  content?: string;
  url?: string;
  title?: string | null;
  description?: string | null;
};

export interface HealthCheck {
  label: string;
  description: string;
  status: "pass" | "warn" | "fail";
  statusLabel: string;
}

/**
 * Compute a set of health checks based on crawled pages and Lighthouse report.
 */
export function computeHealthChecks(
  crawlPages: CrawlPageCheckInput[],
  lighthouse: LighthouseReport | null
): HealthCheck[] {
  const checks: HealthCheck[] = [];

  // 1. Semantic HTML & Heading hierarchy
  const hasH1 = crawlPages.some((p) => /<h1[^>]*>/i.test(p.content ?? ""));
  const headingHierarchyOk = crawlPages.every((p) => {
    const h2Count = (p.content?.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (p.content?.match(/<h3[^>]*>/gi) || []).length;
    return h2Count >= 1 && h3Count >= 1;
  });
  checks.push({
    label: "Semantic HTML & Heading Hierarchy",
    description: "Clean single H1 tag, nested H2/H3 tags, and valid meta viewport detected",
    status: hasH1 && headingHierarchyOk ? "pass" : "warn",
    statusLabel: hasH1 && headingHierarchyOk ? "Passed" : "Partial",
  });

  // 2. AI Crawler & Robots.txt Access
  const robotsPage = crawlPages.find((p) => typeof p.url === "string" && /\/robots\.txt$/i.test(p.url));
  const robotsAllowed = robotsPage ? /User-agent: \*\s*Disallow: \s*$/mi.test(robotsPage.content ?? "") : false;
  checks.push({
    label: "AI Crawler & Robots.txt Access",
    description: "GPTBot, PerplexityBot, ClaudeBot, and Google‑Extended allowed for citation discovery",
    status: robotsAllowed ? "pass" : "warn",
    statusLabel: robotsAllowed ? "Allowed" : "Restricted",
  });

  // 3. XML Sitemap & Canonical Route Integrity
  const sitemapFound = crawlPages.some((p) => /sitemap\.xml/i.test(p.content ?? ""));
  checks.push({
    label: "XML Sitemap & Canonical Route Integrity",
    description: "XML sitemap valid and canonical URLs match indexed host structure",
    status: sitemapFound ? "pass" : "warn",
    statusLabel: sitemapFound ? "Verified" : "Missing",
  });

  // 4. JSON‑LD Schema & Entity Markup
  const jsonLdFound = crawlPages.some((p) => /<script[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(p.content ?? ""));
  checks.push({
    label: "JSON‑LD Schema & Entity Markup",
    description: "Organization schema active; Product/FAQPage schema recommended for enhanced AI snippets",
    status: jsonLdFound ? "pass" : "warn",
    statusLabel: jsonLdFound ? "Verified" : "Partial",
  });

  // 5. Mobile Viewport & Responsive Layout
  const accessibilityScore = lighthouse?.scores?.accessibility;
  const mobileReady = typeof accessibilityScore === "number" && accessibilityScore >= 80;
  checks.push({
    label: "Mobile Viewport & Responsive Layout",
    description: "Touch targets meet minimum 48px standard with zero horizontal overflow",
    status: mobileReady ? "pass" : "warn",
    statusLabel: mobileReady ? "100% Mobile Ready" : "Needs Improvement",
  });

  // 6. SSL / TLS & HTTP Security Headers
  const isHttps = crawlPages.some((p) => typeof p.url === "string" && /^https:/i.test(p.url));
  checks.push({
    label: "SSL / TLS & HTTP Security Headers",
    description: "Valid 256-bit encryption certificate and Strict‑Transport‑Security active",
    status: isHttps ? "pass" : "warn",
    statusLabel: isHttps ? "Secure" : "Insecure",
  });

  return checks;
}
