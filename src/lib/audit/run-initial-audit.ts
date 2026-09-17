import { db } from "@/lib/db";
import { crawlWebsite } from "@/lib/crawl/crawler";
import { buildEvidencePack, deriveResearchTopics, runAgentAnalysis, runCmoSynthesis, runCoreDocument, saveCoreAnalysis } from "@/lib/nodes/runner";
import { AUDIT_DOCUMENT_QUEUE, AUDIT_PRIORITY_DOCUMENT_TYPES, INITIAL_AGENT_TYPES } from "@/lib/nodes/registry";
import { runPageSpeed } from "./pagespeed";

async function setProgress(jobId: string, companyId: string, progress: number, step: string) {
  await db.$transaction([
    db.auditJob.update({ where: { id: jobId }, data: { progress, step } }),
    db.company.update({ where: { id: companyId }, data: { crawlProgress: progress, crawlStep: step } }),
  ]);
}

export async function runInitialAudit(jobId: string): Promise<void> {
  const claimed = await db.auditJob.updateMany({
    where: { id: jobId, status: "QUEUED" },
    data: { status: "RUNNING", attempts: { increment: 1 }, startedAt: new Date(), error: null },
  });
  if (!claimed.count) return;
  const job = await db.auditJob.findUnique({ where: { id: jobId }, include: { company: { include: { user: true, crawlPages: { orderBy: { fetchedAt: "desc" }, take: 48 }, pageSpeedAudits: { orderBy: { createdAt: "desc" }, take: 2 } } } } });
  if (!job) return;
  const { company } = job;
  try {
    await db.company.update({ where: { id: company.id }, data: { crawlStatus: "RUNNING", crawlError: null } });

    if (company.user.demoMode) throw new Error("Demo Mode cannot run a live company audit. Connect and verify a real AI provider first.");
    if (!company.user.llmVerifiedAt || !company.user.llmProvider || !company.user.llmApiKeyEnc || !company.user.llmModel) throw new Error("A verified AI provider is required before starting an audit.");

    const reuseEvidence = job.progress >= 28 && company.crawlPages.length > 0;
    let pages: Array<{ url: string; title: string | null; description: string | null; content: string; statusCode: number; wordCount: number }> = company.crawlPages;
    let pageSpeed: Array<{
      strategy: string;
      performance: number | null;
      accessibility: number | null;
      bestPractices: number | null;
      seo: number | null;
      lcp: number | null;
      fcp: number | null;
      tbt: number | null;
      cls: number | null;
      statusCode: number | null;
      responseTime: number | null;
      ttfb: number | null;
      transferSize: number | null;
      source: string;
      error: string | null;
    }> = company.pageSpeedAudits;
    let externalFailures = reuseEvidence ? pageSpeed.filter((audit) => Boolean(audit.error)).length : 0;
    if (reuseEvidence) {
      await setProgress(jobId, company.id, 28, `Reusing ${pages.length} saved public pages and response-timing evidence`);
    } else {
      await setProgress(jobId, company.id, 8, "Crawling public website evidence");
      pages = await crawlWebsite(new URL(company.websiteUrl), 48, async (pagesRead, target) => {
        const progress = Math.min(27, 8 + Math.round((pagesRead / Math.max(1, target)) * 19));
        await setProgress(jobId, company.id, progress, `Reading public sources: ${pagesRead} of up to ${target} pages`);
      });

      const uniquePagesMap = new Map<string, (typeof pages)[number]>();
      for (const page of pages) {
        const key = page.url.trim().toLowerCase();
        if (!uniquePagesMap.has(key)) {
          uniquePagesMap.set(key, page);
        }
      }
      pages = Array.from(uniquePagesMap.values());

      await db.$transaction([
        db.crawlPage.deleteMany({ where: { companyId: company.id } }),
        db.crawlPage.createMany({
          data: pages.map((page) => ({
            companyId: company.id,
            url: page.url,
            title: page.title,
            description: page.description,
            content: page.content,
            statusCode: page.statusCode,
            wordCount: page.wordCount,
          })),
          skipDuplicates: true,
        }),
        db.pageSpeedAudit.deleteMany({ where: { companyId: company.id } }),
      ]);

      await setProgress(jobId, company.id, 28, `Read ${pages.length} public pages; running lightweight Python URL timing tests`);
      const pageSpeedSettled = await Promise.allSettled([runPageSpeed(company.websiteUrl, "mobile"), runPageSpeed(company.websiteUrl, "desktop")]);
      pageSpeed = [];
      for (const [index, result] of pageSpeedSettled.entries()) {
        const strategy = index === 0 ? "mobile" : "desktop";
        if (result.status === "fulfilled") {
          const stored = await db.pageSpeedAudit.create({ data: { companyId: company.id, ...result.value } });
          pageSpeed.push(stored);
        } else {
          externalFailures += 1;
          const stored = await db.pageSpeedAudit.create({ data: { companyId: company.id, strategy, source: "Python URL timing test", error: result.reason instanceof Error ? result.reason.message : "URL timing test failed" } });
          pageSpeed.push(stored);
        }
      }
    }

    const evidence = buildEvidencePack({ companyName: company.name, websiteUrl: company.websiteUrl, pages, pageSpeed });
    const researchTopics = deriveResearchTopics(pages, company.name);
    // Reuse the evidence snapshot but regenerate every report. Existing
    // documents can be from another audit and are never evidence that this
    // job completed them.
    const completedDocumentTypes = new Set<typeof AUDIT_DOCUMENT_QUEUE[number]["type"]>();
    const documentFailures: Array<{ title: string; error: unknown }> = [];
    let documentsProcessed = 0;

    await setProgress(jobId, company.id, 34, "Starting the priority report queue with competitor maps and company intelligence");
    for (const [index, definition] of AUDIT_DOCUMENT_QUEUE.entries()) {
      if (completedDocumentTypes.has(definition.type)) continue;
      const startProgress = 34 + Math.round((index / AUDIT_DOCUMENT_QUEUE.length) * 48);
      await setProgress(jobId, company.id, startProgress, `Generating ${index + 1} of ${AUDIT_DOCUMENT_QUEUE.length}: ${definition.title}`);
      try {
        let documentEvidence = evidence;
        if (definition.type === "MARKETING_STRATEGY") {
          const priorityDocuments = await db.document.findMany({
            where: { companyId: company.id, type: { in: AUDIT_PRIORITY_DOCUMENT_TYPES } },
            select: { title: true, contentMarkdown: true },
            orderBy: { createdAt: "asc" },
          });
          const strategicFoundation = priorityDocuments.map((document) => `PRIORITY INTELLIGENCE: ${document.title}\n\n${document.contentMarkdown}`).join("\n\n===\n\n").slice(0, 36_000);
          documentEvidence = `${evidence}\n\n=== PRIORITY INTELLIGENCE FOUNDATION ===\n\n${strategicFoundation}`;
        }
        const result = await runCoreDocument({ definition, company, user: company.user, evidence: documentEvidence, researchTopics });
        await saveCoreAnalysis({ companyId: company.id, userId: company.userId, definition, analysis: result.analysis, tokensUsed: result.tokensUsed, execution: result.execution });
        if (definition.type === "COMPANY_INTELLIGENCE") {
          await db.company.update({ where: { id: company.id }, data: { category: result.analysis.companyCategory || company.category, description: result.analysis.companyDescription || company.description } });
        }
        completedDocumentTypes.add(definition.type);
        if (completedDocumentTypes.size >= 1) {
          await db.company.update({ where: { id: company.id }, data: { status: "ACTIVE" } });
        }
      } catch (error) {
        documentFailures.push({ title: definition.title, error });
      } finally {
        documentsProcessed += 1;
        const endProgress = 34 + Math.round((documentsProcessed / AUDIT_DOCUMENT_QUEUE.length) * 48);
        await setProgress(jobId, company.id, endProgress, `${completedDocumentTypes.size} of ${AUDIT_DOCUMENT_QUEUE.length} reports ready; continuing in the background`);
      }
    }
    if (documentFailures.length === AUDIT_DOCUMENT_QUEUE.length) {
      const firstError = documentFailures[0]?.error;
      throw new Error(firstError instanceof Error ? firstError.message : "All document analyses failed.");
    }

    await setProgress(jobId, company.id, 84, "Reports queued successfully; running channel agents one by one");
    let channelFailures = 0;
    for (const [index, agentType] of INITIAL_AGENT_TYPES.entries()) {
      await setProgress(jobId, company.id, 84 + index * 2, `Running ${index + 1} of ${INITIAL_AGENT_TYPES.length} channel agents: ${agentType}`);
      try {
        await runAgentAnalysis({ companyId: company.id, userId: company.userId, agentType });
      } catch {
        channelFailures += 1;
      }
    }

    await setProgress(jobId, company.id, 96, "Synthesizing the AI CMO executive analysis");
    let cmoFailures = 0;
    await runCmoSynthesis({ companyId: company.id, userId: company.userId }).catch(() => { cmoFailures = 1; });

    const failures = externalFailures + documentFailures.length + channelFailures + cmoFailures;
    const finalStatus = failures ? "PARTIAL" : "DONE";
    const successfulDocuments = AUDIT_DOCUMENT_QUEUE.length - documentFailures.length;
    const successfulAgents = INITIAL_AGENT_TYPES.length - channelFailures;
    const finalStep = failures ? `${successfulDocuments} of ${AUDIT_DOCUMENT_QUEUE.length} skill-generated reports and ${successfulAgents} of ${INITIAL_AGENT_TYPES.length} channel agents completed; failed chains produced no fallback output` : "All ten skill-generated reports and core agents are ready";
    await db.$transaction([
      db.auditJob.update({ where: { id: jobId }, data: { status: finalStatus, progress: 100, step: finalStep, completedAt: new Date() } }),
      db.company.update({ where: { id: company.id }, data: { status: "ACTIVE", crawlStatus: finalStatus, crawlProgress: 100, crawlStep: finalStep, lastAuditedAt: new Date() } }),
    ]);
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "The audit failed unexpectedly.";
    const message = /invalid x-api-key|authentication|unauthorized|api[ -]?key/i.test(rawMessage)
      ? "Your AI provider rejected the saved API key. Reconnect a valid provider in Settings, then retry."
      : rawMessage;
    await db.$transaction([
      db.auditJob.update({ where: { id: jobId }, data: { status: "ERROR", error: message, step: "Audit failed", completedAt: new Date() } }),
      db.company.update({ where: { id: company.id }, data: { status: "ERROR", crawlStatus: "ERROR", crawlError: message, crawlStep: "Audit failed" } }),
    ]);
  }
}
