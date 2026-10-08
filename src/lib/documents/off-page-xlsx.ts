import "server-only";
import ExcelJS, { type Cell, type Fill, type Font, type Worksheet } from "exceljs";
import type { ReportDataModel } from "../artifacts/types";

const NAVY = "172033";
const BLUE = "4967FF";
const SKY = "EAF0FF";
const MINT = "E6F4EF";
const AMBER = "FFF2D8";
const ROSE = "FCE8EC";
const PAPER = "FFFFFF";
const INK = "172033";
const SLATE = "5D6678";
const LINE = "DCE1EA";

type OffPageWorkbookArgs = {
  companyName: string;
  companyWebsite?: string;
  companyCategory?: string | null;
  title: string;
  markdown: string;
  updatedAt: Date;
  reportModel?: ReportDataModel;
};

type MasterResource = {
  name: string;
  category: string;
  role: "prospect" | "tool";
  url: string;
  intendedUse: string;
  allowedHosts?: string[];
};

type ValidationResult = MasterResource & {
  ok: boolean;
  checkedAt: Date;
  statusCode?: number;
  finalUrl?: string;
  finalHost?: string;
  result: string;
};

// Every entry below is named in OffPage_SEO_Master_Workflow (1).xlsx. The source
// workbook has no hyperlinks, so this registry supplies canonical destinations
// and is revalidated before any URL is written to an exported workbook.
export const MASTER_WORKFLOW_RESOURCES: MasterResource[] = [
  { name: "Reddit", category: "Community", role: "prospect", url: "https://www.reddit.com/", intendedUse: "Expert participation in relevant communities; link only when it directly answers the discussion." },
  { name: "Flipboard", category: "Content discovery", role: "prospect", url: "https://flipboard.com/", intendedUse: "Curate original editorial content into useful topic collections." },
  { name: "Pinterest", category: "Visual discovery", role: "prospect", url: "https://www.pinterest.com/", intendedUse: "Distribute original diagrams and visual resources with accurate destination context." },
  { name: "Medium", category: "Publishing", role: "prospect", url: "https://medium.com/", intendedUse: "Publish original or properly canonicalized thought leadership." },
  { name: "LinkedIn", category: "Professional publishing", role: "prospect", url: "https://www.linkedin.com/", intendedUse: "Build company and expert authority through substantive articles and posts." },
  { name: "WordPress.com", category: "Publishing", role: "prospect", url: "https://wordpress.com/", intendedUse: "Use only for a genuine publication or owned editorial property, not a link microsite." },
  { name: "Substack", category: "Newsletter publishing", role: "prospect", url: "https://substack.com/", intendedUse: "Develop an owned newsletter with useful public archives and audience value." },
  { name: "Google Business Profile", category: "Local citation", role: "prospect", url: "https://business.google.com/us/business-profile/", intendedUse: "Claim and maintain an accurate profile when the business is eligible." },
  { name: "Bing Places", category: "Local citation", role: "prospect", url: "https://www.bing.com/forbusiness/", intendedUse: "Maintain an accurate business listing when local eligibility applies." },
  { name: "Yelp for Business", category: "Review and citation", role: "prospect", url: "https://business.yelp.com/", intendedUse: "Claim an accurate business profile and respond to genuine reviews." },
  { name: "Foursquare", category: "Local citation", role: "prospect", url: "https://foursquare.com/products/places/", intendedUse: "Review place data coverage when local citation consistency is relevant." },
  { name: "Better Business Bureau", category: "Business profile", role: "prospect", url: "https://www.bbb.org/", intendedUse: "Evaluate only where market presence and eligibility make the profile useful." },
  { name: "GitHub", category: "Technical profile", role: "prospect", url: "https://github.com/", intendedUse: "Publish and document genuine open-source work, tools, or technical resources." },
  { name: "Crunchbase", category: "Company profile", role: "prospect", url: "https://www.crunchbase.com/", intendedUse: "Maintain accurate company facts where the organization qualifies for a profile." },
  { name: "Behance", category: "Creative portfolio", role: "prospect", url: "https://www.behance.net/", intendedUse: "Publish substantive creative case studies with clear project context." },
  { name: "Dribbble", category: "Creative portfolio", role: "prospect", url: "https://dribbble.com/", intendedUse: "Show original design work and link only as part of a complete professional profile." },
  { name: "Product Hunt", category: "Product community", role: "prospect", url: "https://www.producthunt.com/", intendedUse: "Launch a real product or major update with a complete maker-led story." },
  { name: "Wellfound", category: "Startup profile", role: "prospect", url: "https://wellfound.com/", intendedUse: "Maintain an accurate startup/employer profile where relevant." },
  { name: "Quora", category: "Expert community", role: "prospect", url: "https://www.quora.com/", intendedUse: "Answer relevant questions with original expertise; cite company resources only when useful." },
  { name: "F6S", category: "Startup community", role: "prospect", url: "https://www.f6s.com/", intendedUse: "Use for legitimate startup programs, funding, partnerships, and company presence." },
  { name: "XING", category: "Professional network", role: "prospect", url: "https://www.xing.com/", intendedUse: "Maintain a complete professional presence for relevant European audiences." },
  { name: "Alignable", category: "Business community", role: "prospect", url: "https://www.alignable.com/", intendedUse: "Build genuine small-business relationships and referrals in eligible markets." },
  { name: "YouTube", category: "Video publishing", role: "prospect", url: "https://www.youtube.com/", intendedUse: "Publish useful original video and connect descriptions to the most relevant owned resource." },
  { name: "Vimeo", category: "Video publishing", role: "prospect", url: "https://vimeo.com/", intendedUse: "Host high-quality original video where the audience and presentation fit." },
  { name: "Google Search Console", category: "Measurement", role: "tool", url: "https://search.google.com/search-console/", intendedUse: "Measure organic search performance and discovered links." },
  { name: "Google Analytics", category: "Measurement", role: "tool", url: "https://analytics.google.com/", intendedUse: "Measure qualified referral sessions and conversions." },
  { name: "Bing Webmaster Tools", category: "Measurement", role: "tool", url: "https://www.bing.com/webmasters/", intendedUse: "Review Bing search and inbound-link evidence." },
  { name: "Ahrefs", category: "Backlink intelligence", role: "tool", url: "https://ahrefs.com/", intendedUse: "Research referring domains, link gaps, and lost links when licensed." },
  { name: "Semrush", category: "Backlink intelligence", role: "tool", url: "https://www.semrush.com/", intendedUse: "Research backlinks, competitors, and outreach opportunities when licensed." },
  { name: "Moz Link Explorer", category: "Backlink intelligence", role: "tool", url: "https://moz.com/link-explorer", intendedUse: "Use comparative link metrics as directional evidence, never as a Google ranking fact." },
  { name: "Google Trends", category: "Topic research", role: "tool", url: "https://trends.google.com/", intendedUse: "Time editorial and digital PR angles using observed interest patterns." },
  { name: "AnswerThePublic", category: "Audience research", role: "tool", url: "https://answerthepublic.com/", intendedUse: "Develop audience-question hypotheses that still require validation." },
  { name: "BuzzSumo", category: "Content and PR research", role: "tool", url: "https://buzzsumo.com/", intendedUse: "Research content traction, publishers, journalists, and influencers when licensed." },
  { name: "Exploding Topics", category: "Trend research", role: "tool", url: "https://explodingtopics.com/", intendedUse: "Identify emerging topic hypotheses for research-led assets." },
  { name: "Hunter", category: "Contact verification", role: "tool", url: "https://hunter.io/", intendedUse: "Find and verify professional contact routes; do not treat addresses as consent." },
  { name: "Pitchbox", category: "Outreach workflow", role: "tool", url: "https://pitchbox.com/", intendedUse: "Manage qualified outreach and follow-ups when process scale justifies it." },
  { name: "BuzzStream", category: "Outreach workflow", role: "tool", url: "https://www.buzzstream.com/", intendedUse: "Manage relationship history, outreach status, and placement outcomes." },
];

let validationCache: { at: number; results: ValidationResult[] } | null = null;

function allowedHost(resource: MasterResource, hostname: string): boolean {
  const canonical = new URL(resource.url).hostname.toLowerCase();
  const allowed = new Set([canonical, canonical.replace(/^www\./, ""), ...(resource.allowedHosts ?? [])].map((host) => host.toLowerCase()));
  const normalized = hostname.toLowerCase().replace(/^www\./, "");
  return Array.from(allowed).some((host) => normalized === host.replace(/^www\./, "") || normalized.endsWith(`.${host.replace(/^www\./, "")}`));
}

async function validateOne(resource: MasterResource): Promise<ValidationResult> {
  const checkedAt = new Date();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_500);
  try {
    let current = resource.url;
    for (let redirects = 0; redirects <= 4; redirects += 1) {
      const response = await fetch(current, {
        method: "GET",
        redirect: "manual",
        cache: "no-store",
        headers: { "User-Agent": "Smark-Connect-Link-Validator/1.0", Range: "bytes=0-2048" },
        signal: controller.signal,
      });
      void response.body?.cancel();
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) return { ...resource, ok: false, checkedAt, statusCode: response.status, result: "Redirect without a destination" };
        const redirected = new URL(location, current);
        if (redirected.protocol !== "https:" || !allowedHost(resource, redirected.hostname)) {
          return { ...resource, ok: false, checkedAt, statusCode: response.status, result: "Redirected outside the approved official host" };
        }
        current = redirected.toString();
        continue;
      }
      const ok = (response.status >= 200 && response.status < 300) || [401, 403, 405, 429].includes(response.status);
      const final = new URL(current);
      return {
        ...resource,
        ok,
        checkedAt,
        statusCode: response.status,
        finalUrl: ok ? resource.url : undefined,
        finalHost: ok ? final.hostname : undefined,
        result: ok ? (response.status < 300 ? "Validated" : `Official endpoint restricted (${response.status})`) : `Rejected HTTP ${response.status}`,
      };
    }
    return { ...resource, ok: false, checkedAt, result: "Too many redirects" };
  } catch (error) {
    return { ...resource, ok: false, checkedAt, result: error instanceof Error && error.name === "AbortError" ? "Validation timed out" : "Endpoint validation failed" };
  } finally {
    clearTimeout(timeout);
  }
}

export async function validateMasterWorkflowResources(): Promise<ValidationResult[]> {
  if (validationCache && Date.now() - validationCache.at < 10 * 60_000) return validationCache.results;
  const results = await Promise.all(MASTER_WORKFLOW_RESOURCES.map(validateOne));
  validationCache = { at: Date.now(), results };
  return results;
}

const headerFill: Fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
const headerFont: Partial<Font> = { name: "Aptos", color: { argb: PAPER }, bold: true, size: 9 };

function baseSheet(sheet: Worksheet, freezeRow = 6, freezeColumn = 0) {
  sheet.properties.defaultRowHeight = 20;
  sheet.views = [{ state: "frozen", ySplit: freezeRow, xSplit: freezeColumn, showGridLines: false }];
  sheet.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.25, right: 0.25, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 } };
  sheet.headerFooter.oddHeader = `&L&8KREV AI / OFF-PAGE SEO&R&8${sheet.name}`;
  sheet.headerFooter.oddFooter = "&L&8Validated workflow workbook&R&8Page &P of &N";
}

function applyCell(cell: Cell) {
  cell.font = { name: "Aptos", size: 10, color: { argb: SLATE } };
  cell.alignment = { vertical: "top", wrapText: true };
  cell.border = { bottom: { style: "hair", color: { argb: LINE } } };
}

function widths(sheet: Worksheet, values: number[]) {
  values.forEach((value, index) => { sheet.getColumn(index + 1).width = value; });
}

function sheetHeader(sheet: Worksheet, args: OffPageWorkbookArgs, title: string, subtitle: string, lastColumn = 12) {
  sheet.mergeCells(1, 1, 1, lastColumn);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { name: "Aptos Display", size: 20, bold: true, color: { argb: INK } };
  titleCell.alignment = { vertical: "middle" };
  sheet.getRow(1).height = 32;
  sheet.mergeCells(2, 1, 2, lastColumn);
  const subtitleCell = sheet.getCell(2, 1);
  subtitleCell.value = subtitle;
  subtitleCell.font = { name: "Aptos", size: 10, color: { argb: SLATE } };
  subtitleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SKY } };
  subtitleCell.alignment = { vertical: "middle", wrapText: true };
  sheet.getRow(2).height = 28;
  sheet.mergeCells(3, 1, 3, lastColumn);
  const meta = sheet.getCell(3, 1);
  meta.value = `${args.companyName}  |  ${args.companyWebsite ?? "Website not supplied"}  |  Updated ${args.updatedAt.toISOString().slice(0, 10)}`;
  meta.font = { name: "Aptos", size: 8, bold: true, color: { argb: BLUE } };
  meta.alignment = { vertical: "middle" };
}

function styleTable(sheet: Worksheet, headerRow: number, columns: number, rows: number) {
  for (let column = 1; column <= columns; column += 1) {
    const cell = sheet.getCell(headerRow, column);
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: "middle", wrapText: true };
  }
  sheet.getRow(headerRow).height = 28;
  for (let index = 0; index < rows; index += 1) {
    const row = sheet.getRow(headerRow + index + 1);
    row.height = 38;
    row.eachCell({ includeEmpty: true }, (cell, column) => {
      if (column <= columns) {
        applyCell(cell);
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: index % 2 ? PAPER : "F7F9FC" } };
      }
    });
  }
}

function addDashboard(workbook: ExcelJS.Workbook, args: OffPageWorkbookArgs) {
  const sheet = workbook.addWorksheet("01_Executive_Dashboard", { properties: { tabColor: { argb: BLUE } } });
  baseSheet(sheet, 4);
  sheetHeader(sheet, args, "Off-Page SEO Executive Dashboard", "A live operating view of validated opportunities, relationship activity, earned placements, and 90-day delivery.", 12);
  widths(sheet, [18, 18, 18, 18, 4, 18, 18, 18, 18, 4, 18, 18]);
  const cards = [
    ["VALIDATED RESOURCES", '=COUNTA(Validated_Prospects[Platform])', "Passed endpoint validation"],
    ["A-PRIORITY PROSPECTS", '=COUNTIF(Validated_Prospects[Priority Band],"A*")', "After human scoring"],
    ["OUTREACH REPLIES", '=COUNTIF(Outreach_CRM[Status],"Replied")', "Relationship outcomes"],
    ["LIVE PLACEMENTS", '=COUNTIF(Link_Earnings_Log[Placement Status],"Live")', "Editorially confirmed"],
    ["ROADMAP COMPLETE", '=COUNTIF(Roadmap[Status],"Complete")/MAX(1,COUNTA(Roadmap[Action]))', "90-day execution"],
  ];
  cards.forEach(([label, formula, note], index) => {
    const start = 1 + index * 2 + Math.floor(index / 4) * 2;
    const row = index < 4 ? 5 : 9;
    const column = index < 4 ? start : 1;
    sheet.mergeCells(row, column, row, column + 1);
    sheet.mergeCells(row + 1, column, row + 1, column + 1);
    sheet.mergeCells(row + 2, column, row + 2, column + 1);
    sheet.getCell(row, column).value = label;
    sheet.getCell(row, column).fill = headerFill;
    sheet.getCell(row, column).font = { ...headerFont, size: 8 };
    sheet.getCell(row, column).alignment = { horizontal: "center", vertical: "middle" };
    sheet.getCell(row + 1, column).value = { formula };
    sheet.getCell(row + 1, column).fill = { type: "pattern", pattern: "solid", fgColor: { argb: index % 2 ? MINT : SKY } };
    sheet.getCell(row + 1, column).font = { name: "Aptos Display", size: 20, bold: true, color: { argb: INK } };
    sheet.getCell(row + 1, column).alignment = { horizontal: "center", vertical: "middle" };
    if (label === "ROADMAP COMPLETE") sheet.getCell(row + 1, column).numFmt = "0%";
    sheet.getCell(row + 2, column).value = note;
    sheet.getCell(row + 2, column).font = { name: "Aptos", size: 8, color: { argb: SLATE } };
    sheet.getCell(row + 2, column).alignment = { horizontal: "center", vertical: "middle" };
  });
  sheet.mergeCells("A13:L13");
  sheet.getCell("A13").value = "Decision note";
  sheet.getCell("A13").fill = headerFill;
  sheet.getCell("A13").font = headerFont;
  sheet.mergeCells("A14:L17");
  sheet.getCell("A14").value = "A validated platform is a usable destination, not an automatic recommendation. Prioritize only after a human confirms topical relevance, editorial fit, business value, and an ethical reason to participate.";
  sheet.getCell("A14").fill = { type: "pattern", pattern: "solid", fgColor: { argb: AMBER } };
  sheet.getCell("A14").font = { name: "Aptos", size: 11, color: { argb: INK } };
  sheet.getCell("A14").alignment = { vertical: "middle", wrapText: true };
}

function addStrategy(workbook: ExcelJS.Workbook, args: OffPageWorkbookArgs) {
  const sheet = workbook.addWorksheet("02_Strategy_On_A_Page", { properties: { tabColor: { argb: NAVY } } });
  baseSheet(sheet, 5);
  sheetHeader(sheet, args, "Strategy on a Page", "Business goal → SEO goal → priority topic → target page → off-page mechanism → KPI.", 8);
  widths(sheet, [24, 72, 24, 24, 24, 24, 24, 24]);
  const summary = args.reportModel?.executiveSummary ?? [];
  const findings = args.reportModel?.findings ?? [];
  const rows = [
    ["Business objective", summary[0] ?? "Confirm the commercial outcome this program must influence."],
    ["SEO objective", summary[1] ?? "Define the authority and demand signal required for priority pages."],
    ["Priority audience", args.companyCategory ? `${args.companyCategory} buyers, practitioners, publishers, and partners` : "Define the audiences that can validate, cite, recommend, or refer qualified demand."],
    ["Authority diagnosis", findings[0]?.narrative ?? "Complete a current authority baseline before assigning targets."],
    ["Opportunity thesis", findings[1]?.narrative ?? "Prioritize relevant editorial relationships, original evidence, and useful community participation."],
    ["Risk controls", "No paid-link assumptions, mass submission, fabricated contacts, invented metrics, duplicate outreach, or links without editorial purpose."],
    ["90-day outcome", "A qualified prospect pipeline, repeatable outreach rhythm, evidence-led assets, verified placements, and referral/business measurement."],
    ["Primary KPI", "Qualified referral outcomes and visibility gains for priority topics/pages; backlink count is diagnostic only."],
  ];
  sheet.addTable({ name: "Strategy_On_A_Page", ref: "A5", headerRow: true, totalsRow: false, style: { theme: "TableStyleMedium2", showRowStripes: true }, columns: [{ name: "Decision" }, { name: "Current direction" }], rows });
  styleTable(sheet, 5, 2, rows.length);
  sheet.getColumn(1).width = 24;
  sheet.getColumn(2).width = 90;
  sheet.getRows(6, rows.length)?.forEach((row) => { row.height = 52; });
}

function addProspects(workbook: ExcelJS.Workbook, args: OffPageWorkbookArgs, validated: ValidationResult[]) {
  const sheet = workbook.addWorksheet("03_Validated_Prospects", { properties: { tabColor: { argb: BLUE } } });
  baseSheet(sheet, 6, 2);
  sheetHeader(sheet, args, "Validated Prospect Registry", "Only master-workflow platforms that passed a live endpoint check. Score editorial fit before outreach or publishing.", 18);
  const resources = validated.filter((item) => item.ok && item.role === "prospect");
  const columns = ["Platform", "Official URL", "Category", "Intended use", "Validation result", "Checked at", "Relevance 0-3", "Authority 0-2", "Editorial 0-2", "Business 0-2", "Achievability 0-1", "Total score", "Priority Band", "Target page", "Owner", "Status", "Next action", "Review notes"];
  const rows = resources.length ? resources.map((item) => [item.name, item.url, item.category, item.intendedUse, item.result, item.checkedAt, "", "", "", "", "", "", "Needs review", "", "", "Not reviewed", "Assess relevance and editorial fit", ""]) : [["No validated platform available", "", "", "Reconnect and export again when endpoint validation is available.", "No successful checks", new Date(), "", "", "", "", "", "", "Needs review", "", "", "Blocked", "Run validation again", ""]];
  sheet.addTable({ name: "Validated_Prospects", ref: "A6", headerRow: true, totalsRow: false, style: { theme: "TableStyleMedium2", showRowStripes: true }, columns: columns.map((name) => ({ name })), rows });
  styleTable(sheet, 6, columns.length, rows.length);
  widths(sheet, [22, 34, 22, 58, 22, 19, 14, 14, 14, 14, 16, 14, 18, 34, 18, 18, 38, 38]);
  resources.forEach((item, index) => {
    const row = 7 + index;
    const link = sheet.getCell(row, 2);
    link.value = { text: item.url, hyperlink: item.url };
    link.font = { name: "Aptos", size: 10, color: { argb: BLUE }, underline: true };
    sheet.getCell(row, 6).numFmt = "yyyy-mm-dd hh:mm";
    sheet.getCell(row, 12).value = { formula: `IF(COUNT(G${row}:K${row})<5,"",SUM(G${row}:K${row}))` };
    sheet.getCell(row, 13).value = { formula: `IF(L${row}="","Needs review",IF(L${row}>=9,"A · Prioritize",IF(L${row}>=7,"B · Strong",IF(L${row}>=5,"C · Selective","Do not prioritize"))))` };
  });
  for (let row = 7; row < 7 + rows.length; row += 1) {
    sheet.getCell(row, 7).dataValidation = { type: "whole", operator: "between", formulae: [0, 3], allowBlank: true };
    [8, 9, 10].forEach((column) => { sheet.getCell(row, column).dataValidation = { type: "whole", operator: "between", formulae: [0, 2], allowBlank: true }; });
    sheet.getCell(row, 11).dataValidation = { type: "whole", operator: "between", formulae: [0, 1], allowBlank: true };
    sheet.getCell(row, 16).dataValidation = { type: "list", allowBlank: false, formulae: ['"Not reviewed,Qualified,Relationship building,Ready for outreach,Active,Won,Rejected,Blocked"'] };
  }
  sheet.addConditionalFormatting({ ref: `L7:M${6 + rows.length}`, rules: [
    { type: "cellIs", operator: "greaterThan", formulae: [8], priority: 1, style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: MINT }, fgColor: { argb: MINT } }, font: { color: { argb: "176B52" }, bold: true } } },
    { type: "cellIs", operator: "lessThan", formulae: [5], priority: 2, style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: ROSE }, fgColor: { argb: ROSE } } } },
  ] });
}

function addRoadmap(workbook: ExcelJS.Workbook, args: OffPageWorkbookArgs) {
  const sheet = workbook.addWorksheet("04_90_Day_Roadmap", { properties: { tabColor: { argb: "5BA98C" } } });
  baseSheet(sheet, 6, 2);
  sheetHeader(sheet, args, "90-Day Roadmap", "A practical sequence from evidence and qualification to relationship-led execution and compounding measurement.", 13);
  const actions = [
    ["Days 1-30", "Foundation", "Confirm business/SEO goals and priority target pages", "Strategy on a Page", "Priority page list", "Human decision", "Strategy owner"],
    ["Days 1-30", "Foundation", "Baseline referring domains, anchors, mentions, citations, and referral outcomes", "Analytics and backlink evidence", "Authority baseline", "Analysis can be assisted; interpretation is human", "SEO lead"],
    ["Days 1-30", "Foundation", "Validate and score master-workflow candidates", "Validated Prospects", "Qualified prospect set", "Endpoint validation automated; fit review human", "SEO lead"],
    ["Days 1-30", "Foundation", "Define linkable asset evidence and production briefs", "Linkable Assets", "Approved asset briefs", "Human review required", "Content lead"],
    ["Days 31-60", "Authority building", "Build relationships with A/B prospects before asking", "Outreach CRM", "Meaningful interactions", "Reminders can be automated", "Outreach owner"],
    ["Days 31-60", "Authority building", "Launch original research or practitioner-led asset", "Linkable Assets", "Published evidence asset", "Research and claims require human QA", "Content lead"],
    ["Days 31-60", "Authority building", "Run editorial, resource-page, unlinked-mention, and broken-link outreach where fit is proven", "Outreach CRM", "Qualified replies and placements", "Personalization and send approval human", "Outreach owner"],
    ["Days 31-60", "Authority building", "Participate in relevant communities without promotional quotas", "Validated Prospects", "Useful contributions", "Human participation required", "Subject expert"],
    ["Days 61-90", "Scale and compound", "Measure referral quality, assisted conversions, topic visibility, and earned links", "KPI Tracker", "Monthly performance view", "Data collection can be automated", "Analytics owner"],
    ["Days 61-90", "Scale and compound", "Double down on opportunity types with verified outcomes", "Executive Dashboard", "Next-quarter allocation", "Human decision required", "Strategy owner"],
    ["Days 61-90", "Scale and compound", "Refresh winning assets and reclaim lost/unlinked mentions", "Link Earnings Log", "Recovered or strengthened placements", "Discovery assisted; outreach human", "SEO lead"],
    ["Days 61-90", "Scale and compound", "Audit risk, duplicate outreach, link context, and source freshness", "Validation Registry", "Quality-gate sign-off", "Human QA required", "SEO lead"],
  ];
  const columns = ["Period", "Workstream", "Action", "Dependency", "Output", "Automation boundary", "Suggested owner", "Owner", "Start date", "Due date", "Status", "Progress", "KPI"];
  const rows = actions.map((item) => [...item, "", "", "", "Not started", "", ""]);
  sheet.addTable({ name: "Roadmap", ref: "A6", headerRow: true, totalsRow: false, style: { theme: "TableStyleMedium2", showRowStripes: true }, columns: columns.map((name) => ({ name })), rows });
  styleTable(sheet, 6, columns.length, rows.length);
  widths(sheet, [16, 22, 58, 25, 28, 34, 20, 18, 16, 16, 18, 14, 30]);
  for (let row = 7; row < 7 + rows.length; row += 1) {
    sheet.getCell(row, 9).numFmt = "yyyy-mm-dd";
    sheet.getCell(row, 10).numFmt = "yyyy-mm-dd";
    sheet.getCell(row, 11).dataValidation = { type: "list", allowBlank: false, formulae: ['"Not started,In progress,Blocked,Complete"'] };
    sheet.getCell(row, 12).value = { formula: `IF(K${row}="Complete",1,IF(K${row}="In progress",0.5,0))` };
    sheet.getCell(row, 12).numFmt = "0%";
  }
}

function addBlankOperationalTable(workbook: ExcelJS.Workbook, args: OffPageWorkbookArgs, options: { name: string; table: string; title: string; subtitle: string; columns: string[]; widths: number[] }) {
  const sheet = workbook.addWorksheet(options.name, { properties: { tabColor: { argb: BLUE } } });
  baseSheet(sheet, 6, 2);
  sheetHeader(sheet, args, options.title, options.subtitle, options.columns.length);
  sheet.addTable({ name: options.table, ref: "A6", headerRow: true, totalsRow: false, style: { theme: "TableStyleMedium2", showRowStripes: true }, columns: options.columns.map((name) => ({ name })), rows: [options.columns.map(() => "")] });
  styleTable(sheet, 6, options.columns.length, 8);
  widths(sheet, options.widths);
  for (let row = 7; row <= 14; row += 1) {
    for (let column = 1; column <= options.columns.length; column += 1) applyCell(sheet.getCell(row, column));
  }
  return sheet;
}

function addOperationalSheets(workbook: ExcelJS.Workbook, args: OffPageWorkbookArgs) {
  const crm = addBlankOperationalTable(workbook, args, {
    name: "05_Outreach_CRM", table: "Outreach_CRM", title: "Outreach CRM", subtitle: "Relationship history and editorial outreach. Do not add a contact until the prospect and reason are qualified.",
    columns: ["Prospect", "Validated platform", "Prospect page", "Audience fit", "Contact name", "Role", "Contact route", "Pitch angle", "Target page", "Status", "First contact", "Follow-up", "Reply outcome", "Placement state", "Owner", "Notes"],
    widths: [24, 22, 36, 30, 22, 20, 32, 42, 34, 18, 16, 16, 24, 20, 18, 38],
  });
  for (let row = 7; row <= 14; row += 1) {
    crm.getCell(row, 10).dataValidation = { type: "list", allowBlank: true, formulae: ['"Researching,Relationship building,Ready,Contacted,Follow-up due,Replied,Won,Closed,Do not contact"'] };
    [11, 12].forEach((column) => { crm.getCell(row, column).numFmt = "yyyy-mm-dd"; });
  }

  const log = addBlankOperationalTable(workbook, args, {
    name: "06_Link_Earnings_Log", table: "Link_Earnings_Log", title: "Link Earnings Log", subtitle: "Record confirmed editorial placements and the business outcomes they influence.",
    columns: ["Placement URL", "Source domain", "Destination page", "Opportunity type", "Editorial context", "Anchor type", "First seen", "Last checked", "Placement Status", "Referral sessions", "Conversions", "Assisted outcome", "Owner", "Notes"],
    widths: [42, 28, 38, 22, 45, 20, 16, 16, 20, 18, 14, 28, 18, 38],
  });
  for (let row = 7; row <= 14; row += 1) {
    log.getCell(row, 9).dataValidation = { type: "list", allowBlank: true, formulae: ['"Pending verification,Live,Changed,Lost,Rejected"'] };
    [7, 8].forEach((column) => { log.getCell(row, column).numFmt = "yyyy-mm-dd"; });
  }
}

function addAssets(workbook: ExcelJS.Workbook, args: OffPageWorkbookArgs) {
  const sheet = workbook.addWorksheet("07_Linkable_Assets", { properties: { tabColor: { argb: "7A63D2" } } });
  baseSheet(sheet, 6, 2);
  sheetHeader(sheet, args, "Linkable Asset Backlog", "Asset hypotheses require unique evidence, an audience need, and a distribution reason before production.", 12);
  const rows = [
    ["Original research benchmark", "A decision-relevant industry question", "First-party or commissioned data", "Methodology + findings + downloadable table", "Editors, analysts, practitioners", "Validate data access", "Not started", "", "Earned citations and qualified referrals", "", "", ""],
    ["Practitioner framework", "A recurring operational problem", "Named process, examples, and expert review", "Guide + worksheet + annotated example", "Operators and specialist publishers", "Interview subject experts", "Not started", "", "Qualified mentions and assisted conversions", "", "", ""],
    ["Evidence-led comparison", "A difficult category decision", "Transparent criteria and sourced observations", "Interactive matrix + methodology", "Buyers and category publishers", "Confirm defensible comparison set", "Not started", "", "Referral engagement on priority pages", "", "", ""],
  ];
  const columns = ["Asset concept", "Audience need", "Unique evidence", "Format", "Distribution audience", "Next validation", "Stage", "Owner", "Primary KPI", "Target date", "Asset URL", "Notes"];
  sheet.addTable({ name: "Linkable_Assets", ref: "A6", headerRow: true, totalsRow: false, style: { theme: "TableStyleMedium2", showRowStripes: true }, columns: columns.map((name) => ({ name })), rows });
  styleTable(sheet, 6, columns.length, rows.length);
  widths(sheet, [28, 38, 42, 34, 34, 34, 18, 18, 30, 16, 38, 36]);
  for (let row = 7; row < 7 + rows.length; row += 1) {
    sheet.getCell(row, 7).dataValidation = { type: "list", allowBlank: false, formulae: ['"Hypothesis,Validated,Briefed,In production,Published,Refreshing,Stopped"'] };
    sheet.getCell(row, 10).numFmt = "yyyy-mm-dd";
  }
}

function addKpis(workbook: ExcelJS.Workbook, args: OffPageWorkbookArgs) {
  const sheet = workbook.addWorksheet("08_KPI_Tracker", { properties: { tabColor: { argb: "5BA98C" } } });
  baseSheet(sheet, 6, 2);
  sheetHeader(sheet, args, "KPI Tracker", "Primary outcomes first; backlink counts and third-party metrics remain diagnostic.", 12);
  const metrics = [
    ["Primary", "Qualified referral conversions", "Count", "Analytics + CRM"],
    ["Primary", "Qualified referral sessions", "Sessions", "Analytics"],
    ["Primary", "Priority-topic organic conversions", "Count", "Search Console + Analytics"],
    ["Secondary", "Earned editorial placements", "Count", "Link Earnings Log"],
    ["Secondary", "Unlinked mentions reclaimed", "Count", "Link Earnings Log"],
    ["Secondary", "Outreach reply rate", "%", "Outreach CRM"],
    ["Diagnostic", "New relevant referring domains", "Count", "Backlink intelligence"],
    ["Diagnostic", "Lost relevant referring domains", "Count", "Backlink intelligence"],
    ["Diagnostic", "Anchor and destination-page concentration", "%", "Backlink intelligence"],
  ];
  const columns = ["Level", "KPI", "Unit", "Source", "Period", "Baseline", "Target", "Actual", "Variance", "Trend", "Interpretation", "Owner"];
  const rows = metrics.map((metric) => [...metric, args.updatedAt.toISOString().slice(0, 7), "", "", "", "", "", "", ""]);
  sheet.addTable({ name: "KPI_Tracker", ref: "A6", headerRow: true, totalsRow: false, style: { theme: "TableStyleMedium2", showRowStripes: true }, columns: columns.map((name) => ({ name })), rows });
  styleTable(sheet, 6, columns.length, rows.length);
  widths(sheet, [16, 34, 14, 28, 14, 16, 16, 16, 16, 16, 46, 18]);
  for (let row = 7; row < 7 + rows.length; row += 1) {
    sheet.getCell(row, 9).value = { formula: `IF(OR(G${row}="",H${row}=""),"",H${row}-G${row})` };
    sheet.getCell(row, 10).value = { formula: `IF(I${row}="","",IF(I${row}>0,"Improving",IF(I${row}<0,"Declining","Flat")))` };
  }
}

function addValidationRegistry(workbook: ExcelJS.Workbook, args: OffPageWorkbookArgs, results: ValidationResult[]) {
  const sheet = workbook.addWorksheet("09_Validation_Registry", { properties: { tabColor: { argb: "78849A" } } });
  baseSheet(sheet, 6, 2);
  sheetHeader(sheet, args, "Master Workflow Validation Registry", "Successful endpoints may be used elsewhere in this workbook. Failed candidates are named without exposing an invalid hyperlink.", 9);
  const columns = ["Candidate", "Role", "Category", "Validation", "Checked at", "HTTP", "Final host", "Validated official URL", "Intended use"];
  const rows = results.map((item) => [item.name, item.role, item.category, item.result, item.checkedAt, item.statusCode ?? "", item.finalHost ?? "", item.ok ? item.url : "", item.intendedUse]);
  sheet.addTable({ name: "Validation_Registry", ref: "A6", headerRow: true, totalsRow: false, style: { theme: "TableStyleMedium2", showRowStripes: true }, columns: columns.map((name) => ({ name })), rows });
  styleTable(sheet, 6, columns.length, rows.length);
  widths(sheet, [24, 14, 24, 30, 19, 12, 28, 40, 58]);
  results.forEach((item, index) => {
    const row = 7 + index;
    sheet.getCell(row, 5).numFmt = "yyyy-mm-dd hh:mm";
    if (item.ok) {
      const cell = sheet.getCell(row, 8);
      cell.value = { text: item.url, hyperlink: item.url };
      cell.font = { name: "Aptos", size: 10, color: { argb: BLUE }, underline: true };
    }
  });
  sheet.addConditionalFormatting({ ref: `D7:D${6 + rows.length}`, rules: [
    { type: "containsText", operator: "containsText", text: "Validated", priority: 1, style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: MINT }, fgColor: { argb: MINT } }, font: { color: { argb: "176B52" }, bold: true } } },
    { type: "containsText", operator: "containsText", text: "failed", priority: 2, style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: ROSE }, fgColor: { argb: ROSE } } } },
  ] });
}

export async function createOffPageSeoXlsx(args: OffPageWorkbookArgs): Promise<Buffer> {
  const results = await validateMasterWorkflowResources();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "KREV AI";
  workbook.company = "KREV AI";
  workbook.title = `${args.companyName} - Off-Page SEO Strategy & Execution Workbook`;
  workbook.subject = "Evidence-led off-page SEO strategy and operating workbook";
  workbook.description = "Excel-only off-page SEO workbook using master-derived resources that passed endpoint validation.";
  workbook.created = args.updatedAt;
  workbook.modified = args.updatedAt;
  workbook.calcProperties.fullCalcOnLoad = true;

  addDashboard(workbook, args);
  addStrategy(workbook, args);
  addProspects(workbook, args, results);
  addRoadmap(workbook, args);
  addOperationalSheets(workbook, args);
  addAssets(workbook, args);
  addKpis(workbook, args);
  addValidationRegistry(workbook, args, results);

  workbook.eachSheet((sheet) => {
    sheet.getCell("A1").note = "Generated from the KREV AI evidence model and the approved master-workflow candidate registry. Validate strategic fit before execution.";
  });
  const output = await workbook.xlsx.writeBuffer();
  return Buffer.from(output);
}
