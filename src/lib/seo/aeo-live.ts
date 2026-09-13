import { assertPublicUrl, normalizeWebsiteUrl, normalizedDomain } from "../crawl/url-safety";
import { analyzeGeoCitability, type AeoCheck, type AeoScanReport } from "./geo-citability";

const MAX_PAGES = 6;
const MAX_HTML_BYTES = 1_500_000;
const REQUEST_TIMEOUT_MS = 12_000;
const BROWSER_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

type SavedCrawlPage = AeoScanReport["savedCrawlPages"][number];
type CompanySource = { name: string; websiteUrl: string; category?: string | null; savedCrawlPages: SavedCrawlPage[] };

function sameCompanyHost(url: URL, companyHost: string) {
  return normalizedDomain(url) === companyHost;
}

export function candidateAeoUrls(websiteUrl: string, crawlUrls: string[]): string[] {
  const official = normalizeWebsiteUrl(websiteUrl);
  const host = normalizedDomain(official);
  const urls = [official.href, ...crawlUrls]
    .map((value) => { try { return normalizeWebsiteUrl(value); } catch { return null; } })
    .filter((value): value is URL => Boolean(value && sameCompanyHost(value, host)))
    .map((value) => { value.search = ""; value.hash = ""; return value.href; });
  const unique = [...new Set(urls)];
  const [home, ...others] = unique;
  others.sort((left, right) => {
    const priority = (url: string) => /\b(faq|pricing|product|service|feature|about)\b/i.test(new URL(url).pathname) ? 1 : 0;
    return priority(right) - priority(left);
  });
  return [home, ...others].slice(0, MAX_PAGES);
}

async function readLimitedText(response: Response, maxBytes: number) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (bytes < maxBytes) {
      const chunk = await reader.read();
      if (chunk.done) break;
      const remaining = maxBytes - bytes;
      text += decoder.decode(chunk.value.subarray(0, remaining), { stream: true });
      bytes += Math.min(chunk.value.length, remaining);
      if (chunk.value.length > remaining) break;
    }
    text += decoder.decode();
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  return text;
}

async function fetchSameSite(url: URL, host: string, accept: string): Promise<Response> {
  let current = url;
  for (let redirect = 0; redirect < 4; redirect++) {
    if (!sameCompanyHost(current, host)) throw new Error("Page redirected outside the company website.");
    await assertPublicUrl(current);
    const response = await fetch(current, { cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), headers: { Accept: accept, "User-Agent": BROWSER_USER_AGENT } });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Redirect response has no location.");
      await response.body?.cancel();
      current = new URL(location, current);
      continue;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  }
  throw new Error("Page redirected too many times.");
}

export function fullSiteAeoBlocks(robotsText: string): string[] {
  const groups: Array<{ agents: string[]; blocked: boolean; allowed: boolean }> = [];
  let agents: string[] = [];
  let blocked = false;
  let allowed = false;
  let hasDirective = false;
  const flush = () => { if (agents.length) groups.push({ agents, blocked, allowed }); agents = []; blocked = false; allowed = false; hasDirective = false; };
  for (const raw of robotsText.split(/\r?\n/)) {
    const line = raw.split("#", 1)[0]?.trim() ?? "";
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).toLowerCase().trim();
    const value = line.slice(separator + 1).trim().toLowerCase();
    if (key === "user-agent") {
      if (hasDirective) flush();
      agents.push(value);
    } else if (agents.length && key === "disallow") {
      hasDirective = true;
      if (value === "/") blocked = true;
    } else if (agents.length && key === "allow") {
      hasDirective = true;
      if (value === "/") allowed = true;
    }
  }
  flush();
  return ["gptbot", "perplexitybot"].filter((bot) => {
    const specific = groups.filter((group) => group.agents.includes(bot));
    const applicable = specific.length ? specific : groups.filter((group) => group.agents.includes("*"));
    return applicable.some((group) => group.blocked && !group.allowed);
  });
}

async function supportingChecks(official: URL): Promise<AeoCheck[]> {
  const host = normalizedDomain(official);
  const [robots, sitemap] = await Promise.allSettled([
    (async () => {
      const url = new URL("/robots.txt", official);
      const response = await fetchSameSite(url, host, "text/plain");
      const text = await readLimitedText(response, 100_000);
      const blocked = fullSiteAeoBlocks(text);
      return {
        id: "robots", label: "AI crawler full-site rules", status: blocked.length ? "fail" : "pass",
        detail: blocked.length ? `robots.txt has Disallow: / for ${blocked.join(" and ")}. Review crawler access.` : "No full-site Disallow: / found for GPTBot or PerplexityBot.",
        sourceUrl: url.href,
      } satisfies AeoCheck;
    })(),
    (async () => {
      const url = new URL("/sitemap.xml", official);
      const response = await fetchSameSite(url, host, "application/xml,text/xml");
      const text = await readLimitedText(response, 100_000);
      const valid = /<\s*(?:urlset|sitemapindex)\b/i.test(text);
      return {
        id: "sitemap", label: "XML sitemap", status: valid ? "pass" : "fail",
        detail: valid ? "sitemap.xml returned an XML sitemap." : "sitemap.xml did not contain a sitemap index or URL set.",
        sourceUrl: url.href,
      } satisfies AeoCheck;
    })(),
  ]);
  return [
    robots.status === "fulfilled" ? robots.value : { id: "robots", label: "AI crawler full-site rules", status: "unknown", detail: "robots.txt could not be verified.", sourceUrl: new URL("/robots.txt", official).href },
    sitemap.status === "fulfilled" ? sitemap.value : { id: "sitemap", label: "XML sitemap", status: "unknown", detail: "sitemap.xml could not be verified.", sourceUrl: new URL("/sitemap.xml", official).href },
  ];
}

export async function scanAeoWebsite(company: CompanySource): Promise<AeoScanReport> {
  const urls = candidateAeoUrls(company.websiteUrl, company.savedCrawlPages.map((page) => page.url));
  const official = normalizeWebsiteUrl(company.websiteUrl);
  const host = normalizedDomain(official);
  const settled = await Promise.allSettled(urls.map(async (value) => {
    const response = await fetchSameSite(new URL(value), host, "text/html,application/xhtml+xml");
    const contentType = response.headers.get("content-type") ?? "";
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) throw new Error("Page did not return HTML.");
    const html = await readLimitedText(response, MAX_HTML_BYTES);
    if (!html.trim()) throw new Error("Page returned empty HTML.");
    return { url: response.url || value, html };
  }));
  const pages = settled.flatMap((outcome) => outcome.status === "fulfilled" ? [outcome.value] : []);
  const failedPages = settled.flatMap((outcome, index) => outcome.status === "rejected" ? [{ url: urls[index], reason: outcome.reason instanceof Error ? outcome.reason.message : "Page could not be fetched." }] : []);
  const checks = await supportingChecks(official);
  const analysis = analyzeGeoCitability(company, pages, checks);
  if (pages.length === 0 && failedPages.some((page) => page.reason === "HTTP 403")) {
    analysis.strategicActions[0] = "Review website firewall rules: public pages returned HTTP 403 to this scan.";
  }
  return {
    ...analysis,
    scannedAt: new Date().toISOString(),
    attemptedPages: urls.length,
    failedPages,
    savedCrawlPages: company.savedCrawlPages,
  };
}
