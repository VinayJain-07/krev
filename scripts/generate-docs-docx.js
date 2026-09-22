const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  BorderStyle,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
} = require("docx");

const PURPLE = "7C34BC";
const DARK_PURPLE = "581C87";
const TEXT_DARK = "1E293B";
const TEXT_MUTED = "64748B";
const BG_HEADER = "F3E8FF";
const BG_ZEBRA = "F8FAFC";
const BORDER_COLOR = "CBD5E1";
const CALLOUT_BG = "F5F3FF";

function createTitle(title, subtitle) {
  return [
    new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: "SMARK CONNECT",
          bold: true,
          size: 24,
          color: PURPLE,
          font: "Arial",
          characterSpacing: 80,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 80, after: 120 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 52,
          color: DARK_PURPLE,
          font: "Arial",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 300 },
      border: { bottom: { color: PURPLE, style: BorderStyle.SINGLE, size: 24 } },
      children: [
        new TextRun({
          text: subtitle,
          size: 24,
          color: TEXT_MUTED,
          font: "Arial",
          italics: true,
        }),
      ],
    }),
  ];
}

function createH1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 140 },
    keepNext: true,
    children: [
      new TextRun({
        text,
        bold: true,
        size: 32,
        color: DARK_PURPLE,
        font: "Arial",
      }),
    ],
  });
}

function createH2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 100 },
    keepNext: true,
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26,
        color: PURPLE,
        font: "Arial",
      }),
    ],
  });
}

function createH3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    keepNext: true,
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22,
        color: TEXT_DARK,
        font: "Arial",
      }),
    ],
  });
}

function createP(text, options = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 280 },
    children: [
      new TextRun({
        text,
        size: 20,
        color: options.color || TEXT_DARK,
        font: "Arial",
        bold: options.bold || false,
        italics: options.italics || false,
      }),
    ],
  });
}

function createBullet(text, boldPrefix = "") {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix, bold: true, size: 20, color: TEXT_DARK, font: "Arial" }));
  }
  children.push(new TextRun({ text, size: 20, color: TEXT_DARK, font: "Arial" }));

  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80, line: 260 },
    indent: { left: 360, hanging: 240 },
    children,
  });
}

function createNumbered(num, text, boldPrefix = "") {
  const children = [
    new TextRun({ text: `${num}. `, bold: true, size: 20, color: PURPLE, font: "Arial" }),
  ];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix, bold: true, size: 20, color: TEXT_DARK, font: "Arial" }));
  }
  children.push(new TextRun({ text, size: 20, color: TEXT_DARK, font: "Arial" }));

  return new Paragraph({
    spacing: { after: 90, line: 260 },
    indent: { left: 400, hanging: 280 },
    children,
  });
}

function createCallout(title, text) {
  return new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: CALLOUT_BG },
    border: { left: { color: PURPLE, style: BorderStyle.SINGLE, size: 24 } },
    spacing: { before: 140, after: 160, line: 270 },
    indent: { left: 240, right: 180 },
    children: [
      new TextRun({ text: `${title}: `, bold: true, size: 20, color: DARK_PURPLE, font: "Arial" }),
      new TextRun({ text, size: 20, color: TEXT_DARK, font: "Arial" }),
    ],
  });
}

function createTable(headers, rows) {
  const colCount = headers.length;
  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: headers.map((h) =>
        new TableCell({
          shading: { type: ShadingType.CLEAR, fill: PURPLE },
          margins: { top: 120, bottom: 120, left: 140, right: 140 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: h, bold: true, size: 18, color: "FFFFFF", font: "Arial" })],
            }),
          ],
        })
      ),
    }),
    ...rows.map((row, rIdx) =>
      new TableRow({
        children: row.map((cell, cIdx) =>
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: rIdx % 2 === 1 ? BG_ZEBRA : "FFFFFF" },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            border: {
              top: { color: BORDER_COLOR, style: BorderStyle.SINGLE, size: 4 },
              bottom: { color: BORDER_COLOR, style: BorderStyle.SINGLE, size: 4 },
              left: { color: BORDER_COLOR, style: BorderStyle.SINGLE, size: 4 },
              right: { color: BORDER_COLOR, style: BorderStyle.SINGLE, size: 4 },
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: cell,
                    size: 18,
                    color: cIdx === 0 ? DARK_PURPLE : TEXT_DARK,
                    bold: cIdx === 0,
                    font: "Arial",
                  }),
                ],
              }),
            ],
          })
        ),
      })
    ),
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
  });
}

async function buildTechnicalDocx() {
  const children = [
    ...createTitle("System Architecture & Technical Manual", "Comprehensive Developer & Engineering Documentation for Smark Connect"),

    createH1("1. System Overview & Architectural Tenets"),
    createP(
      "Smark Connect is an enterprise-grade AI CMO and autonomous marketing operating system designed by The Smarketers. It transforms public digital evidence and proprietary customer knowledge assets into 6 parallel foundation strategy documents, 12+ channel specialist agents, real-time social opportunity mining (Reddit, X, Instagram), and multi-format client deliverables (PDF, DOCX, XLSX, PPTX)."
    ),
    createCallout(
      "Core Architecture Tenet",
      "Evidence-Led Synthesis Over Hallucination: The platform strictly anchors all strategy in verified crawl pages, speed heuristics, and user-provided ground-truth documents. Zero hallucinated competitors, fake analytics, or ungrounded claims are tolerated."
    ),
    createBullet(
      "Full BYOK (Bring Your Own Key) zero-trust architecture ensuring proprietary API keys and workspace documents are never shared or stored in plaintext.",
      "Zero-Retention Privacy: "
    ),
    createBullet(
      "Combines Cheerio web crawling, Python URL timing heuristics, self-hosted Lighthouse audits, and multi-format document parsing into a unified 6-engine analysis.",
      "Multi-Engine Evidence Ingestion: "
    ),
    createBullet(
      "A modular, type-safe execution system utilizing 25 distinct document types, 21 specialist agent definitions, and structured JSON output validation.",
      "Intelligence Node Architecture: "
    ),

    createH1("2. Technology Stack & Framework Specifications"),
    createTable(
      ["Subsystem Layer", "Technologies Selected", "Architectural Purpose"],
      [
        ["Frontend & SSR", "Next.js 16 (App Router), React 19", "Server components, streaming, route handlers, high-velocity UX"],
        ["Design & UI", "Tailwind CSS, Framer Motion, BorderBeam, Lucide", "Hardware-accelerated dark UI, glassmorphic HUD, interactive feedback"],
        ["Database & ORM", "PostgreSQL, Prisma Client 6.x", "Relational ground truth, foreign keys, version tracking, atomic txns"],
        ["Multi-LLM Gateway", "Anthropic, OpenAI, Google Gemini, OpenRouter", "Parallel execution, structured JSON, AES-256 encrypted keys at rest"],
        ["Document Parsing", "OfficeParser, custom stream extractors", "Ingests PDF, DOCX, PPTX, XLSX, TXT, MD, CSV up to 15MB/file"],
        ["Performance Auditing", "Lightweight Python timing heuristics, Lighthouse", "Deterministic HTTP/TTFB metrics + full lab rendering benchmarks"],
        ["Reporting Pipeline", "docx, exceljs, html-to-image", "Programmatic generation of enterprise DOCX, XLSX, and presentation decks"],
        ["Security & Governance", "Git pre-push hook, AGENTS.md, SECURITY.md", "Strict enforcement blocking unauthorized autonomous agent commits/pushes"]
      ]
    ),

    createH1("3. Database Schema & Relational Architecture"),
    createP(
      "The relational model is maintained via Prisma ORM on PostgreSQL. Key models govern the end-to-end lifecycle from user account creation to continuous signal monitoring:"
    ),
    createNumbered(1, "Stores credentials, AES-256 encrypted provider keys (llmApiKeyEnc), key preview, selected model, and token usage budgets (default 2,000,000 tokens).", "User: "),
    createNumbered(2, "Represents a company workspace with unique domain normalization, status, crawl progress, and direct foreign key links to all generated documents.", "Company: "),
    createNumbered(3, "Tracks long-running asynchronous audit executions with attempts, percentage progress (0-100), and stage descriptions.", "AuditJob: "),
    createNumbered(4, "Persists raw public website pages extracted during crawl with URLs, HTTP status codes, word counts, and cleaned text.", "CrawlPage: "),
    createNumbered(5, "Stores response profiles (TTFB, total response time, payload size, HTTP status) for mobile and desktop viewports.", "PageSpeedAudit: "),
    createNumbered(6, "Stores the 6 foundation intelligence reports and on-demand blueprints with Markdown content, JSON skill provenance, and version tracking.", "Document & DocumentVersion: "),
    createNumbered(7, "Logs specialist agent executions, tokens used, confidence scores, and structured finding outputs.", "AgentRun & AgentConfig: "),
    createNumbered(8, "Stores custom uploaded files (PDF, DOCX, etc.) and formatted onboarding marketing strategy briefs with remembered=true for workspace-wide ingestion.", "ChatAttachment: "),

    createH1("4. Ingestion Pipeline: Web Crawl, Documents & Marketing Briefs"),
    createH2("4.1 Safe Public Web Crawler"),
    createP(
      "The crawler (src/lib/crawl/crawler.ts) performs safe recursion across up to 48 public website pages. It incorporates SSRF protection (assertPublicUrl) preventing access to localhost, private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16), and AWS/GCP metadata endpoints. Pages are sanitized using Cheerio to strip scripts, styles, navigations, and SVG noise."
    ),
    createH2("4.2 Multi-Format Custom Document Ingestion"),
    createP(
      "Users can upload up to 10 files (up to 15MB each) during onboarding or within the workspace. Supported formats include PDF, DOCX, PPTX, XLSX, TXT, MD, and CSV. The ingestion engine (src/lib/sources/content.ts) parses each file and saves it to ChatAttachment with remembered=true, making it available as ground truth across all AI nodes."
    ),
    createH2("4.3 Strategic Marketing Questionnaire Ingestion"),
    createP(
      "The onboarding flow captures structured strategic parameters: priority-ranked target geographies (Tier 1 Core, Tier 2 Secondary, priority notes), Ideal Customer Profile (segments, buyer personas, pain points), core differentiators, competitors, and marketing goals. This is serialized into a Markdown brief titled 'Strategic Marketing & Geography Brief.md' and attached as persistent company memory."
    ),

    createH1("5. Intelligence Node & Agent Execution Engine"),
    createP(
      "All AI generation flows through src/lib/nodes/runner.ts. The execution engine follows a strict sequence:"
    ),
    createBullet(
      "Gathers crawl pages, response timing, uploaded documents, and the marketing strategy brief into a bounded context string.",
      "1. Evidence Pack Assembly: "
    ),
    createBullet(
      "Ensures the user has sufficient balance before invoking models (assertTokenBudget).",
      "2. Token Budget Assertion: "
    ),
    createBullet(
      "Fetches verified API credentials, decrypts the key via AES-256, and calls the chosen provider with system prompts and JSON schema constraints.",
      "3. Provider Dispatch: "
    ),
    createBullet(
      "Extracts contentMarkdown, executive summary, actionable findings, and source references. Normalizes typography, repairs malformed JSON, and asserts quality.",
      "4. JSON Validation & Quality Gate: "
    ),
    createBullet(
      "Saves Document records, increments versions, logs AgentRun records, and triggers CMO synthesis.",
      "5. Atomic Persistence: "
    ),

    createH1("6. Security, Governance & Agent Restrictions"),
    createP(
      "To prevent accidental or unauthorized code modifications, the repository implements strict governance rules:"
    ),
    createCallout(
      "Repository Protection Policy",
      "Under SECURITY.md and AGENTS.md, AI coding agents are strictly forbidden from running autonomous git commit or git push commands. All remote repository updates must be performed manually by verified human developers."
    ),
    createBullet(
      "Installed at .git/hooks/pre-push, this script physically blocks non-interactive git push attempts unless confirmed with MANUAL_PUSH_CONFIRMED=1 or an interactive terminal prompt.",
      "Git Pre-Push Hook Guard: "
    ),
    createBullet(
      "Zero API keys, session tokens, or credentials are committed. Environment files (.env*) are strictly ignored in .gitignore.",
      "Secrets Management: "
    ),
    createBullet(
      "Administrative routes and API endpoints require authenticated sessions backed by bcrypt password hashing and auth throttling.",
      "Authentication & Rate Throttling: "
    ),

    createH1("7. Deliverables Generation & Reporting Pipeline"),
    createP(
      "Smark Connect includes dedicated generator engines for creating polished client-ready assets:"
    ),
    createBullet(
      "Uses the docx package to build executive Word reports complete with cover styling, tables, callouts, and page numbering.",
      "DOCX Reports: "
    ),
    createBullet(
      "Uses exceljs to create operational workbooks with dedicated sheets for keyword clusters, technical SEO audits, and content roadmaps.",
      "XLSX Workbooks: "
    ),
    createBullet(
      "Provides structured slide layouts for executive presentations and board-level strategy decks.",
      "PPTX & PDF Decks: "
    ),
  ];

  const doc = new Document({
    creator: "The Smarketers",
    title: "Smark Connect - Technical Documentation",
    description: "Engineering and Architecture Manual for Smark Connect",
    sections: [
      {
        properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: "Smark Connect | Technical Documentation", size: 16, color: PURPLE, font: "Arial" })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "The Smarketers  •  Page ", size: 16, color: TEXT_MUTED, font: "Arial" }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: TEXT_MUTED, font: "Arial" }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.resolve("C:/Users/OrCon/Desktop/Smarketers - AI Automation/Smark Connect/smark-connect-app/docs/Smark_Connect_Technical_Documentation.docx");
  fs.writeFileSync(outPath, buffer);
  console.log("Created:", outPath);
}

async function buildUserDocx() {
  const children = [
    ...createTitle("User Guide & Operating Manual", "Complete Guide to Navigating, Auditing, and Growing with Smark Connect"),

    createH1("1. Welcome to Smark Connect"),
    createP(
      "Smark Connect is your 24/7 AI Chief Marketing Officer (CMO) and autonomous marketing intelligence operating system. Built by The Smarketers, it replaces subjective guesswork with verifiable digital evidence—crawling your public web assets, ingesting your proprietary strategy documents, and giving your team an unfair competitive advantage."
    ),
    createCallout(
      "Why Smark Connect is Different",
      "Traditional AI tools hallucinate generic advice based on internet averages. Smark Connect grounds every single analysis in real digital proof: your live website content, response-timing benchmarks, customer research documents, and priority target geographies."
    ),

    createH1("2. Onboarding: 5 Simple Steps to Launch"),
    createP(
      "Setting up your company intelligence workspace takes less than 2 minutes through our streamlined 5-step onboarding flow:"
    ),
    createNumbered(1, "Create your secure workspace account with your name, work email, and a strong password.", "Create Your Account: "),
    createNumbered(2, "Enter your company website domain (e.g., yourcompany.com). Smark Connect will queue a crawl across public pages to extract live digital evidence.", "Company Website: "),
    createNumbered(3, "Attach your pitch decks, brand books, case studies, or ICP docs (PDF, DOCX, PPTX, XLSX up to 15MB). Select your priority target geographies (Tier 1 Primary market & Tier 2 Expansion markets), buyer personas, differentiators, competitors, and strategic marketing goals.", "Marketing Brief & Custom Documents: "),
    createNumbered(4, "Bring your own API key (BYOK) from OpenAI, Anthropic, Google Gemini, or OpenRouter. Your key is encrypted with AES-256 at rest and used only for your workspace.", "AI Inference Provider: "),
    createNumbered(5, "Review your strategic setup and launch the 6-engine intelligence analysis. All foundation reports and channel agents will initialize automatically.", "Review & Launch Engine: "),

    createH1("3. Understanding Your 6 Foundation Strategy Documents"),
    createP(
      "Once initialized, Smark Connect synthesizes six core strategic intelligence documents that serve as your company's permanent marketing ground truth:"
    ),
    createTable(
      ["Foundation Document", "Strategic Purpose", "Key Deliverables Included"],
      [
        ["1. Company Intelligence", "Core brand positioning & market category", "Value proposition, category framing, key offers, brand narrative"],
        ["2. Technical SEO Audit", "Search visibility & crawl health", "Indexability, metadata gaps, internal linking, response-time heuristics"],
        ["3. GEO & AI Answer Engines", "Visibility in ChatGPT, Perplexity & Claude", "Citation readiness, conversational queries, AI answer positioning"],
        ["4. Competitor Landscape", "Direct market benchmarks & gap analysis", "Feature matrices, messaging gaps, competitor strengths & vulnerabilities"],
        ["5. Audience ICP Profiling", "Target buyer personas & decision makers", "Firmographics, decision-maker pain points, objection-handling scripts"],
        ["6. Content Strategy Roadmap", "High-intent topic clusters & editorial plan", "Organic search cluster blueprint, content velocity plan, editorial calendar"]
      ]
    ),

    createH1("4. Uploading Custom Knowledge Documents"),
    createP(
      "Your company has unique insights that don't exist on public web pages. Smark Connect allows you to upload these proprietary knowledge assets so every AI agent is fully aligned with your business reality."
    ),
    createBullet("Pitch decks, investor presentations, and sales overviews.", "Pitch Decks & Sales Collateral: "),
    createBullet("Brand style guides, tone-of-voice playbooks, and messaging guidelines.", "Brand Books & Style Guides: "),
    createBullet("Customer interview transcripts, ICP surveys, and user research summaries.", "Customer & User Research: "),
    createBullet("Product release notes, technical whitepapers, and pricing sheets.", "Product & Technical Docs: "),
    createCallout(
      "Universal Memory",
      "Any document you upload with 'Remember' enabled is automatically fed into every specialist agent, conversation mining query, and chat session across your workspace."
    ),

    createH1("5. Specialist Channel Agents & Action Feed"),
    createP(
      "In addition to foundation strategy documents, Smark Connect deploys specialized AI agents that monitor platforms and generate actionable marketing plays:"
    ),
    createH2("5.1 Reddit Conversation Mining"),
    createP(
      "Monitors high-intent subreddits relevant to your category. Identifies active discussions where prospective buyers are complaining about competitors or seeking tool recommendations, and generates 3 tailored response variants ready to copy and post."
    ),
    createH2("5.2 Social Signals (X/Twitter & Instagram)"),
    createP(
      "Collects social signals, monitors industry conversation angles, and drafts high-engagement posts that reflect your company's ground truth and chosen brand tone."
    ),
    createH2("5.3 The Action Feed"),
    createP(
      "Consolidates findings from all agents into a prioritized backlog ranked by impact (Critical, High, Medium, Low) and confidence score (0-100), giving your marketing team clear daily priorities."
    ),

    createH1("6. Framework Studio: Visual Strategic Models"),
    createP(
      "Framework Studio transforms text-heavy strategy into client-ready visual models that can be embedded into presentations or shared with stakeholders:"
    ),
    createBullet("Visualizes top-of-funnel acquisition through bottom-of-funnel conversion stages.", "Conversion Funnels: "),
    createBullet("Plots your company against competitors across price, velocity, and capability axes.", "Competitor Positioning Maps: "),
    createBullet("Maps audience personas to channel touchpoints and content types.", "Audience Strategy Networks: "),
    createBullet("Displays multi-quarter marketing roadmaps and campaign horizons.", "Strategic Timelines: "),

    createH1("7. Client-Ready Reporting & Deliverables"),
    createP(
      "With one click, turn your workspace intelligence into branded, professional files ready to send to clients, executives, or team members:"
    ),
    createNumbered(1, "Full editorial layouts with cover designs, formatted tables, framework visuals, and source indexes.", "Word Documents (.docx): "),
    createNumbered(2, "Operational workbooks containing complete keyword lists, technical audit logs, and cluster plans.", "Excel Workbooks (.xlsx): "),
    createNumbered(3, "Board-ready decks summarizing positioning, competitive battlecards, and growth roadmaps.", "Presentation Decks (.pptx): "),

    createH1("8. Security, Privacy & Account Settings"),
    createP(
      "Smark Connect is built with enterprise privacy at its core:"
    ),
    createBullet(
      "Your API keys (OpenAI, Anthropic, Gemini, OpenRouter) are encrypted at rest with AES-256-GCM. Smark Connect never shares your keys with third parties or uses your data for AI training.",
      "Zero-Trust Encryption: "
    ),
    createBullet(
      "Set strict monthly token spending limits in Settings to prevent unexpected model usage.",
      "Token Budget Controls: "
    ),
    createBullet(
      "Easily invite team members and control read/write permissions per workspace.",
      "Team Collaboration: "
    ),

    createH1("9. Frequently Asked Questions (FAQ)"),
    createH3("Q: How long does the initial 6-engine audit take?"),
    createP("A: The complete evidence crawl and parallel analysis typically takes between 2 to 4 minutes depending on your chosen AI provider."),
    createH3("Q: Can I edit generated documents?"),
    createP("A: Yes! You can edit any document directly or use the AI Prompt Assistant to revise specific sections. You can also lock documents to protect finalized strategy from being overwritten."),
    createH3("Q: What file types can I upload as custom documents?"),
    createP("A: Smark Connect supports PDF, Microsoft Word (.docx), PowerPoint (.pptx), Excel (.xlsx), Markdown (.md), Plain Text (.txt), and CSV files up to 15MB each."),
    createH3("Q: How do I add another company to my account?"),
    createP("A: Click the company switcher in the top navigation or sidebar, select 'Add another company', and enter the new domain.")
  ];

  const doc = new Document({
    creator: "The Smarketers",
    title: "Smark Connect - User Guide & Manual",
    description: "User documentation and operating handbook for Smark Connect",
    sections: [
      {
        properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: "Smark Connect | User Documentation", size: 16, color: PURPLE, font: "Arial" })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "The Smarketers  •  Page ", size: 16, color: TEXT_MUTED, font: "Arial" }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: TEXT_MUTED, font: "Arial" }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.resolve("C:/Users/OrCon/Desktop/Smarketers - AI Automation/Smark Connect/smark-connect-app/docs/Smark_Connect_User_Documentation.docx");
  fs.writeFileSync(outPath, buffer);
  console.log("Created:", outPath);
}

async function main() {
  console.log("Generating technical documentation .docx...");
  await buildTechnicalDocx();
  console.log("Generating user documentation .docx...");
  await buildUserDocx();
  console.log("Both documentation files generated successfully!");
}

main().catch((err) => {
  console.error("Error generating documentation:", err);
  process.exit(1);
});
