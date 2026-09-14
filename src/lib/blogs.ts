import { BLOG_DEEP_DIVES } from "./blog-deep-dives";
import { BLOG_WORKSHOP_NOTES } from "./blog-workshop-notes";

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  category: string;
  summary: string;
  takeaway: string;
  date: string;
  tags: string[];
  content: string;
  visual: {
    title: string;
    caption: string;
    steps: { label: string; detail: string }[];
    decision: string;
  };
  practice: {
    prompt: string;
    output: string;
    measure: string;
    caution: string;
  };
  workedExample: {
    title: string;
    situation: string;
    approach: string;
    lesson: string;
  };
  references?: { label: string; url: string }[];
  readTime: string;
}

type BlogDraft = Omit<BlogPost, "readTime" | "workedExample">;

const DRAFTS: BlogDraft[] = [
  {
    id: 1,
    slug: "the-shift-from-search-to-synthesis-benchmarking-geo-in-2026",
    title: "How to Measure Generative Search Visibility",
    category: "Generative Search",
    summary: "A repeatable way to check when your brand appears in AI answers, what those answers cite, and which page improvements deserve attention.",
    takeaway: "Build a query set, record citations, and diagnose gaps",
    date: "Sep 10, 2026",
    tags: ["GEO", "AI search", "Measurement"],
    visual: {
      title: "The answer visibility loop",
      caption: "Use the same questions and scoring rules on every review. This is a method, not a performance benchmark.",
      steps: [
        { label: "Select questions", detail: "Choose buyer questions across discovery, comparison, and validation." },
        { label: "Capture answers", detail: "Record engine, date, answer text, links, and mentions." },
        { label: "Classify evidence", detail: "Separate cited mentions, uncited mentions, and omissions." },
        { label: "Improve pages", detail: "Fix the page that should answer the question, then rerun the set." },
      ],
      decision: "A citation is useful only if the linked page supports the exact claim in the answer.",
    },
    content: `## What should an AI visibility audit measure?

Search rank and answer visibility are related but different observations. A page may rank well in conventional results while an answer engine cites a different source. An answer may also name a company without linking to it. Measure these events separately. Start with a stable set of questions a buyer might ask before choosing a product: problem questions, category questions, comparisons, and requests for proof.

For every question, save the wording, engine, date, market, answer, cited URLs, and whether the answer names your brand. Repeat the run under similar conditions. Responses can vary, so one screenshot is a lead for investigation rather than a trend. Keep the raw answers so someone else can reproduce your classification.

| Observation | What it means | What to inspect next |
| --- | --- | --- |
| Named and cited | A claim is connected to your page | Does the page support the claim? |
| Named without citation | Attribution is unclear | Are supporting facts public and easy to find? |
| Competitor cited | Another page served the question | What evidence or detail does it supply? |
| No relevant answer | The prompt may be poorly served | Recheck the buyer intent before creating content. |

## Improve the source page

Inspect the page a buyer should reach. Does it say who the product serves, what it does, how it works, and what proof supports the claims? Can someone reach the relevant passage without a gated PDF? Are headings and links descriptive? Can a crawler access the page? These questions are useful even if AI visibility never changes.

Do not assume a schema block or arbitrary word count guarantees inclusion. Google's guidance says its AI features build on core Search systems and do not require special schema markup. Structured data can still describe eligible content, but it must match what readers can see. Prioritize original material: a worked example, clear methodology, actual product behavior, or approved customer evidence.

## Turn the audit into an editorial backlog

Group missing answers by buyer question rather than by engine. Write a one-line hypothesis for each gap and attach the query capture and relevant page. Prioritize questions that affect decisions and can be answered with evidence you have. After publishing, rerun the fixed set and review qualified visits and conventional search performance too. A mention alone is not a business outcome; the useful question is whether the content helped a buyer make progress.`,
    practice: {
      prompt: "Choose twelve buyer questions: four discovery, four comparison, and four validation. Run them across the answer engines your buyers use.",
      output: "A dated evidence sheet with raw answers, cited URLs, mention classes, relevant owned pages, and improvement hypotheses.",
      measure: "Review citation accuracy, qualified visits to cited pages, and repeated runs of the same query set.",
      caution: "Prompt, location, and time can change an answer. Do not publish one run as a market-share benchmark.",
    },
    references: [{ label: "Google's guide to generative AI features in Search", url: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide" }],
  },
  {
    id: 2,
    slug: "commercial-intent-mining-turning-social-signals-into-b2b-pipeline",
    title: "Turning Public Buying Signals into a B2B Research Workflow",
    category: "Demand Generation",
    summary: "A method for distinguishing a live buying question from general chatter and responding with useful context.",
    takeaway: "Qualify the situation before treating a post as a lead",
    date: "Sep 10, 2026",
    tags: ["Intent signals", "Social listening", "Outbound"],
    visual: {
      title: "From conversation to useful response",
      caption: "A public post is a starting point for research. Each gate removes a different false positive.",
      steps: [
        { label: "Find", detail: "Collect requests for advice, alternatives, or implementation help." },
        { label: "Interpret", detail: "Read the full thread and identify the actual problem." },
        { label: "Qualify", detail: "Check relevance, recency, company fit, and evidence strength." },
        { label: "Respond", detail: "Answer within the channel's norms; offer a resource when it fits." },
      ],
      decision: "If you cannot describe the buyer's problem in their words, the signal is not ready for outreach.",
    },
    content: `## Why keywords alone produce noisy lead lists

A mention of “analytics software” is not the same as a buying event. It might be a student question, a vendor announcement, or a genuine request for alternatives. Keep the original post and surrounding conversation intact. Record what the person said, what they appear to be trying to do, and what remains uncertain. A salesperson should be able to inspect the evidence rather than receive a score without context.

Start with phrases such as “evaluating,” “switching from,” and “how do teams handle.” Add descriptions of the underlying problem, not just product categories. Review false positives every week. “Switching from spreadsheets” may signal an operational project; “writing about switching” probably does not.

| Signal | Stronger interpretation | Weaker interpretation |
| --- | --- | --- |
| Deadline | Needs to choose this quarter | Might explore someday |
| Constraint | Names a workflow or integration | Uses broad category terms |
| Advice request | Asks peers what they deployed | Shares a promotional link |
| Relevant role | Owns or influences the workflow | Role cannot be established |

## Build a reviewable rubric

Score relevance, evidence strength, timing, and fit separately. Simple high, medium, and low labels are adequate until outcomes justify numerical weights. A priority conversation needs an identifiable problem, plausible company fit, and a reason to act soon. Preserve unknowns rather than silently granting points.

Add a “do not contact” gate. Some communities prohibit solicitation, and some posts seek peer advice rather than vendor messages. The right action may be a helpful public answer, a resource shared when invited, or no action. Avoid transferring personal details into a CRM without a clear business reason.

## Connect the signal to a next step

When a response is welcome, answer the question first. Explain a decision criterion, share a comparison framework, or link to an implementation guide. A message that repeats a complaint and immediately asks for a demo feels automated. Track relevant conversations found, conversations reviewed, helpful replies, invited follow-ups, meetings, and qualified opportunities. A large lead count without buyer progress points to a data-quality problem.`,
    practice: {
      prompt: "Review twenty public conversations from one community and classify each as active evaluation, problem discovery, general discussion, or irrelevant.",
      output: "A rubric with examples of true positives, false positives, and an appropriate response for each useful thread.",
      measure: "Track reviewer agreement, invited follow-ups, and qualified opportunities rather than scraped mentions.",
      caution: "Respect community rules and privacy. A public post is not blanket permission for automated direct outreach.",
    },
  },
  {
    id: 3,
    slug: "multi-agent-ai-architecture-in-enterprise-marketing-shared-context-vs-prompts",
    title: "Shared Context for Multi-Agent Marketing Workflows",
    category: "Marketing Operations",
    summary: "Give specialist workflows a common evidence base, clear handoffs, and a review trail without spreading a stale brief everywhere.",
    takeaway: "Make evidence and ownership explicit at every handoff",
    date: "Sep 9, 2026",
    tags: ["AI agents", "Governance", "Workflow design"],
    visual: {
      title: "A governed agent handoff",
      caption: "Shared context is a versioned set of approved facts, not one giant prompt for every agent.",
      steps: [
        { label: "Source", detail: "Collect approved product, audience, and campaign evidence." },
        { label: "Scope", detail: "Pass each specialist the facts and task it needs." },
        { label: "Produce", detail: "Require assumptions and source references in the output." },
        { label: "Review", detail: "Check claims, voice, and channel fit before publication." },
      ],
      decision: "When two outputs disagree, resolve the source fact before editing either draft.",
    },
    content: `## The problem is an inconsistent source of truth

Independent prompts can produce contradictory campaigns even when every draft sounds plausible. A content workflow may describe a feature that has not shipped; a social workflow may target a different buyer from the landing page. Identify which statements are approved, where they came from, who owns them, and when they should be reviewed. A modest, maintained brief is useful before building a large knowledge system.

Separate durable facts from campaign choices. Product capabilities, pricing, security claims, and customer proof need accountable owners. Audience hypotheses and channel experiments may change more often. Each specialist should receive a task-specific slice of context, relevant brand rules, and facts it must not invent. Giving every step every scraped page increases noise and hides stale information.

| Context layer | Example | Review owner |
| --- | --- | --- |
| Approved facts | Features, pricing, legal wording | Product or operations |
| Audience evidence | Interviews and objections | Research lead |
| Campaign choices | Offer, segment, channel | Marketing lead |
| Output history | Draft, source links, edits | Publishing owner |

## Design handoffs as contracts

Define what each specialist receives and returns. Research can provide an evidence table with URLs and dates. Content can turn that into an outline with claims mapped to evidence. Social can adapt approved points to the channel. A reviewer checks tone and links. Include an explicit “unknown” value so a missing fact gets flagged rather than filled with a guess.

For a launch, approve the product brief, extract buyer objections, draft the landing page, create channel adaptations, run claim checks, then publish. If the offer changes midstream, mark prior drafts stale. Versioning can begin with a document revision and timestamp. What matters is that downstream work can identify the facts it used.

## Evaluate the system

Sample outputs across channels. Do they agree on the buyer, offer, product limitations, and proof? Track time spent fixing unsupported claims, the share of drafts requiring major correction, and the age of source facts. This is more useful than claiming “zero drift” from a few examples. A good workflow makes disagreement visible early and gives a human a clear way to correct the source.`,
    practice: {
      prompt: "Write a one-page approved-facts brief for an active campaign and trace it through three channel drafts.",
      output: "A source-to-draft map showing each substantive claim, its owner, review date, and approval status.",
      measure: "Count unsupported claims, conflicting statements, and correction time in the next campaign cycle.",
      caution: "A shared brief can spread an error faster. Version evidence and notify downstream owners of corrections.",
    },
  },
  {
    id: 4,
    slug: "how-fintech-ramp-unified-14-marketing-channels-with-ai-cmo-synthesis",
    title: "Unifying Fintech Marketing Channels: An Illustrative Scenario",
    category: "Planning Scenarios",
    summary: "A worked example of turning fragmented channel plans into one evidence-backed campaign brief.",
    takeaway: "Use one campaign thesis with channel-specific execution",
    date: "Sep 9, 2026",
    tags: ["Fintech", "Campaign planning", "Scenario"],
    visual: {
      title: "One thesis, several channel jobs",
      caption: "This is an illustrative planning scenario, not a named customer result or measured case study.",
      steps: [
        { label: "Buyer problem", detail: "Finance leaders need confidence in controls and rollout effort." },
        { label: "Proof", detail: "Confirm behavior, limitations, and approved evidence." },
        { label: "Channel roles", detail: "Give search, social, email, and sales distinct jobs." },
        { label: "Review", detail: "Check every asset against the same offer and decision." },
      ],
      decision: "A channel asset should serve its own purpose while keeping the same verified product claims.",
    },
    content: `## Scenario: a finance platform preparing a launch

Imagine a fintech company that helps finance teams manage spending policies. Search content describes administrative controls, social posts emphasize employee convenience, sales decks lead with savings, and outbound email promises a rapid rollout. Each angle may be reasonable, but together they create an unclear offer. The launch needs one thesis: who the product serves, which problem it solves now, what proof it can show, and what the buyer should do next.

Begin with the buyer decision rather than the channel list. A finance leader may ask whether policies are flexible, how implementation affects staff, and whether the product works with existing processes. Gather current documentation, approved demonstrations, objections from sales calls, and publishable customer evidence. Mark uncertainties. “Integration planned” must never become “integration available.”

| Asset | Job in the journey | Evidence to use |
| --- | --- | --- |
| Search guide | Explain workflow and requirements | Documentation and implementation steps |
| Comparison page | Clarify tradeoffs | Dated capability checks |
| Social post | Surface a specific problem | One defensible insight |
| Sales deck | Support a buying conversation | Approved demo and limitations |
| Follow-up email | Answer an objection | Link to the relevant section |

## Build a brief that survives adaptation

State the audience, problem, promise, proof, and exclusions in plain language. Add approved terms and a list of claims requiring review. Ask each channel owner which question their asset answers. Search may need an implementation guide while social distills one objection into a concise post. Neither should invent a different value proposition for the format.

Keep a claim register beside the plan. If an asset says “connects to the finance stack,” name the integrations and link to the source. If a claim cannot be verified, narrow or remove it. This matters particularly for financial products, where vague wording can become a buyer misunderstanding.

## Review the connected journey

Follow a buyer from a search query through the landing page, social profile, email, and sales deck. Can they tell the same product story? Do implementation details agree? Does each step answer a new question? After launch, examine qualified conversations and objections alongside traffic. The useful outcome is a clearer buying experience; this hypothetical scenario implies no particular revenue or time-savings result.`,
    practice: {
      prompt: "Audit five channel assets for one launch offer as though you were a new buyer. Highlight every promise, limitation, and call to action.",
      output: "A campaign thesis, channel-role map, and claim register showing the source for each promise.",
      measure: "Review buyer questions answered, conflicting claims found, and qualified conversations after launch.",
      caution: "This scenario is hypothetical. Never present illustrative outcomes or a real company's name as customer evidence.",
    },
  },
  {
    id: 5,
    slug: "state-of-ai-crawler-access-analyzing-10000-robotstxt-schema-architectures",
    title: "A Practical Audit of AI Crawler Access and Structured Data",
    category: "Technical SEO",
    summary: "Check how crawl rules, server responses, and page markup affect access without assuming that one bot controls every AI answer.",
    takeaway: "Audit crawler policy, accessibility, and page content separately",
    date: "Sep 8, 2026",
    tags: ["Robots.txt", "Crawlers", "Structured data"],
    visual: {
      title: "The access diagnostic",
      caption: "Each layer answers a different question. A successful request alone does not guarantee indexing or citation.",
      steps: [
        { label: "Policy", detail: "Read robots rules for the specific user agent." },
        { label: "Delivery", detail: "Check status codes, redirects, WAF rules, and rendered HTML." },
        { label: "Meaning", detail: "Compare visible copy with titles and structured data." },
        { label: "Evidence", detail: "Review logs and test tools before changing policy." },
      ],
      decision: "Choose crawler access deliberately; different bots serve different purposes.",
    },
    content: `## Begin with the access decision

A robots file communicates which URLs a named crawler may request. It is a policy tool, not a universal switch for all AI products. Providers use different user agents for search discovery, user-initiated fetching, and model training. An organization may allow one purpose and disallow another. Before editing rules, agree with legal, security, and content owners on the policy you intend to express.

Inspect the live robots file at the site's root, then test important URLs against each relevant user agent. Check the page response too: redirects, authentication, JavaScript rendering, and web application firewall rules can block content even when robots allows it. Conversely, an allowed URL may still be omitted from an index or answer for other reasons. Do not equate “crawlable” with “will be cited.”

| Layer | Check | Typical failure |
| --- | --- | --- |
| Robots policy | Rules for the actual user agent | Broad disallow overrides an intended allow |
| HTTP delivery | Status and final URL | Redirect loop, login page, or 403 response |
| Page content | Main text in rendered HTML | Critical answer exists only in a script or download |
| Structured data | Markup matches visible facts | Old price or unsupported feature in JSON-LD |

## Keep schema accurate and modest

Structured data helps describe a page and can support eligible rich results in Google Search. It is not a guaranteed AI citation mechanism. Use a type that fits the page, supply required properties, and keep values aligned with visible content. A product feature listed in markup but absent from the page is a quality problem. Test templates after releases, especially when pricing or availability changes.

For Google AI search features, Google's current guidance emphasizes core SEO and says no special schema is required. OpenAI and Perplexity document their own crawlers and controls; read the provider's current documentation before setting a rule. Keep a dated access inventory because user-agent definitions and IP guidance can change.

## Turn findings into a safe change set

Group affected URLs by template and business importance. Propose the smallest change that expresses the intended policy. Test on staging when possible, then verify production responses and logs after release. Capture before-and-after examples. If a WAF exception is needed, coordinate with security rather than broadly disabling protection. Continue to monitor access and search outcomes separately: technical access is only the first step in being useful to a reader.`,
    practice: {
      prompt: "Select a homepage, product page, pricing page, and article. Check the live robots rules, HTTP response, rendered copy, and structured data for each.",
      output: "A URL-by-URL audit with intended policy, observed behavior, owner, and a narrowly scoped fix.",
      measure: "Verify the intended fetch behavior in logs and retest page content after deployment.",
      caution: "Do not remove a crawler block until the access purpose and organizational policy are clear.",
    },
    references: [
      { label: "OpenAI crawler documentation", url: "https://developers.openai.com/api/docs/bots" },
      { label: "Perplexity crawler documentation", url: "https://docs.perplexity.ai/docs/resources/perplexity-crawlers" },
      { label: "Google structured data guidelines", url: "https://developers.google.com/search/docs/appearance/structured-data/sd-policies" },
    ],
  },
  {
    id: 6,
    slug: "scaling-devtools-content-from-10-to-100-articlesmonth-without-voice-drift",
    title: "Scaling DevTools Content Without Losing Technical Accuracy",
    category: "Developer Marketing",
    summary: "Design a documentation-led publishing workflow that can grow while preserving correct code, clear authorship, and developer trust.",
    takeaway: "Scale the review system before scaling the article count",
    date: "Sep 8, 2026",
    tags: ["DevTools", "Technical content", "Editorial QA"],
    visual: {
      title: "A code-aware publishing path",
      caption: "The diagram shows quality gates. It does not imply a specific publication volume or accuracy rate.",
      steps: [
        { label: "Source", detail: "Start from released docs, examples, and API contracts." },
        { label: "Draft", detail: "Write for a concrete developer task and environment." },
        { label: "Execute", detail: "Run snippets against supported versions." },
        { label: "Review", detail: "Have an owner verify claims, steps, and maintenance dates." },
      ],
      decision: "If a snippet cannot be reproduced, keep the article in draft.",
    },
    content: `## Choose tasks before topics

Developers arrive with a task: authenticate a client, handle retries, migrate an SDK, or debug a response. A calendar built only around high-volume keywords tends to produce generic articles that repeat documentation without solving the next problem. Build a task inventory from support tickets, search queries, community questions, and product telemetry. Prioritize tasks that are common, costly when done wrong, and supported by a stable product release.

For each proposed tutorial, write the audience, prerequisites, expected result, supported versions, and failure modes before drafting. This makes an article testable. It also prevents a broad topic such as “getting started with APIs” from hiding several different workflows. If two posts solve the same task, consolidate them and redirect the older one.

| Quality gate | Reviewer question | Evidence |
| --- | --- | --- |
| Version | Which release does this apply to? | Versioned docs or changelog |
| Execution | Does the code run as shown? | Test output or reproducible example |
| Completeness | Can a reader reach the stated result? | Step-by-step dry run |
| Maintenance | Who updates it when the API changes? | Named owner and review trigger |

## Treat examples as product code

Code snippets should come from maintained examples or be executed in a small test project. Pin dependencies where necessary, show required environment variables without exposing secrets, and include expected output. A syntax check is useful but insufficient: code can compile and still call an obsolete endpoint or teach an unsafe pattern. Technical review should cover behavior and compatibility, not only style.

AI can help outline a tutorial, summarize a changelog, or suggest edge cases. The final article still needs a person who understands the product to check every command and claim. Label illustrative pseudocode clearly. Avoid invented SDK names, functions, or return fields. If a real example depends on private infrastructure, explain the dependency instead of pretending readers can run it locally.

## Build a maintenance loop

Publishing is the start of the article's lifecycle. Monitor documentation changes, broken links, search terms, support escalations, and comments. Add an owner and “last verified against” version to each technical article. Archive obsolete instructions or update them with a clear migration note. A smaller library of correct, maintained guides is more useful than a much larger library of plausible but unreliable posts.`,
    practice: {
      prompt: "Take one common support question and draft a tutorial with prerequisites, runnable steps, expected output, and two failure cases.",
      output: "A tested article brief and an executable example tied to a supported product version.",
      measure: "Track successful task completion, support deflection, corrections, and time since last technical review.",
      caution: "Do not treat generated code or a passing syntax check as proof that a tutorial works.",
    },
  },
  {
    id: 7,
    slug: "the-executive-cmos-guide-to-automated-board-decks-c-suite-reporting",
    title: "A Practical Guide to Marketing Board Decks",
    category: "Executive Reporting",
    summary: "Turn scattered channel data into a concise decision narrative with sources, caveats, and clear ownership.",
    takeaway: "Lead with decisions and evidence, then show supporting metrics",
    date: "Sep 7, 2026",
    tags: ["Board reporting", "Attribution", "Marketing operations"],
    visual: {
      title: "The board narrative spine",
      caption: "Each layer should support the decision above it, with assumptions visible rather than buried in speaker notes.",
      steps: [
        { label: "Decision", detail: "State what leadership needs to approve or change." },
        { label: "Conclusion", detail: "Summarize what the evidence suggests." },
        { label: "Drivers", detail: "Show the few factors that changed the result." },
        { label: "Evidence", detail: "Link charts to dated definitions and source data." },
      ],
      decision: "If a metric does not change a decision, move it to the appendix.",
    },
    content: `## Start with the question the board must answer

A board deck is not a monthly dashboard pasted into slides. It should help leadership decide where to invest, what risk to accept, and what to investigate. Before pulling data, write the three or four decisions the meeting must support. For each, identify the conclusion, the evidence that would change it, and the owner who can explain the numbers.

A useful opening might say: “Pipeline contribution from the mid-market segment improved, but the sales cycle lengthened; we recommend keeping the current acquisition mix while testing a narrower qualification rule.” The following slides then show why. This is more informative than opening with traffic, impressions, and follower growth without a decision context.

| Slide | Purpose | Typical evidence |
| --- | --- | --- |
| Executive decision | State recommendation and tradeoff | One-page synthesis |
| Outcome | Show business progress | Qualified pipeline, revenue, retention |
| Drivers | Explain movement | Segment and channel breakdowns |
| Risks | Name uncertainty | Data gaps, lag, experiment limits |
| Next quarter | Assign actions | Owner, milestone, expected learning |

## Make definitions and caveats visible

Marketing metrics often vary by system. A “lead” in an ad platform may not match a CRM-qualified opportunity. Define the funnel stages, attribution window, currency, and cohort. Keep a source sheet behind every chart. If a pipeline figure was revised after the last board meeting, say so. A small footnote is better than an unexplained discrepancy during the discussion.

Use visuals to make comparisons easy: trend lines for time, bars for segments, and compact tables for commitments. Label units and time periods. Avoid stacked charts with too many categories or percentages without denominators. When an outcome is lagging, include leading indicators but explain the relationship you expect rather than treating them as revenue.

## Automate collection, preserve judgment

Automation can reduce copy-and-paste errors by pulling data into a consistent model and generating first-draft charts. The narrative still needs a human to check anomalies, interpret causes, and choose a recommendation. Set a reporting cut-off, freeze the data used for the deck, and record any later corrections. Reusing the same slide outline each quarter makes changes easier to compare, but the conclusion should reflect current evidence.`,
    practice: {
      prompt: "Rewrite the first five slides of your latest marketing report around one decision. Identify the evidence and caveat required for each slide.",
      output: "A decision-led outline plus a source sheet with metric definitions, dates, and owners.",
      measure: "Review how often the meeting produces a clear decision and how many numbers require post-meeting correction.",
      caution: "A polished automated chart can make weak attribution look certain. Show uncertainty where it affects the decision.",
    },
  },
  {
    id: 8,
    slug: "aeo-vs-seo-measuring-generative-engine-share-across-500-saas-brands",
    title: "AEO and SEO: Measuring Search and Answer Visibility Together",
    category: "Generative Search",
    summary: "A measurement framework for conventional search, AI answers, and the buyer actions that follow both.",
    takeaway: "Compare visibility with a stable query set and clear definitions",
    date: "Sep 7, 2026",
    tags: ["AEO", "SEO", "AI visibility"],
    visual: {
      title: "Two surfaces, one buyer journey",
      caption: "Search listings and generated answers create different observations, but both should be connected to buyer intent.",
      steps: [
        { label: "Question", detail: "Define the buyer need and query class." },
        { label: "Search", detail: "Record ranking, snippet, and click behavior." },
        { label: "Answer", detail: "Record mentions, citations, and factual accuracy." },
        { label: "Outcome", detail: "Look for qualified visits and useful buyer actions." },
      ],
      decision: "A visibility gain matters most when it serves a relevant question accurately.",
    },
    content: `## Define the terms without creating a false divide

SEO covers the work that helps people and search systems discover and understand useful pages. “AEO” often refers to visibility inside generated answers. The terms describe different ways to observe discovery, but they are not separate foundations. Google's guidance for its AI search features points back to core Search practices: crawlable pages, original content, technical clarity, and a good page experience. A special AI-only schema or rewritten “machine language” is not required for Google.

Measure the surfaces separately because they present different evidence. A conventional result can be ranked and clicked. A generated answer can mention a brand, cite a URL, describe it accurately or inaccurately, and sometimes send a visit. Record each observation with the same buyer question so the team can compare what changed.

| Buyer question class | Search observation | Answer observation |
| --- | --- | --- |
| Problem discovery | Relevant page and click-through | Whether the answer uses a useful explanation |
| Category evaluation | Listing for the category | Whether the brand appears in options |
| Vendor comparison | Position and snippet quality | Whether claims are accurate and cited |
| Implementation | Guide findability | Whether the answer links to current docs |

## Build a measurement panel

Select questions from real sales calls, site search, support tickets, and query data. Fix the wording and market for a reporting period. For search, retain impressions, clicks, and landing-page engagement. For answer engines, retain raw responses, links, engine, and date. Classify mentions with a written rubric. If a brand appears in a list without a link, do not count it as a citation.

Review changes at the question level before rolling them into a summary. A few highly variable prompts can distort a percentage. Show the sample size and avoid implying that a private query panel represents the whole market. Also inspect the quality of the linked page: a citation to outdated documentation may create more friction than a missing citation.

## Prioritize changes that help users

Map each weak question to a page and an owner. Improve explanations, examples, evidence, navigation, or freshness based on the actual gap. Ensure the page can be fetched and contains the answer in visible content. Then rerun the panel and compare qualified behavior. The goal is not to win a label such as “AEO”; it is to make a buyer's decision easier across both search experiences.`,
    practice: {
      prompt: "Choose six questions from sales conversations and compare how your site appears in conventional results and two answer experiences.",
      output: "A side-by-side query panel with links, citations, accuracy notes, page owners, and improvement actions.",
      measure: "Track relevant search clicks, accurate citations, and qualified landing-page actions over repeated runs.",
      caution: "A small query sample is a diagnostic tool, not a statistically representative share-of-market study.",
    },
    references: [{ label: "Google's guide to generative AI features in Search", url: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide" }],
  },
  {
    id: 9,
    slug: "entity-clarity-scoring-structuring-json-ld-for-chatgpt-perplexity",
    title: "Entity Clarity: Writing Product Pages and JSON-LD That Agree",
    category: "Technical SEO",
    summary: "Make a product's identity, audience, capabilities, and proof easy to understand in visible copy and appropriate structured data.",
    takeaway: "Use markup to describe truthful page content, not to invent it",
    date: "Sep 6, 2026",
    tags: ["Entities", "JSON-LD", "Product content"],
    visual: {
      title: "The entity clarity check",
      caption: "The four nodes are an editorial audit, not a search-engine scoring formula.",
      steps: [
        { label: "Identity", detail: "Name the product and organization consistently." },
        { label: "Audience", detail: "State who the page helps and in which situation." },
        { label: "Capabilities", detail: "Describe what is available, with limits." },
        { label: "Proof", detail: "Link each important claim to visible support." },
      ],
      decision: "If a reader cannot verify a statement on the page, do not add it to markup.",
    },
    content: `## Clarity begins in visible copy

A visitor should be able to answer four questions after scanning a product page: What is this product? Who is it for? What can it do today? What evidence supports the important claims? A page full of broad slogans may fail this test even if its schema validates perfectly. Write a short, precise description above the fold, then explain primary workflows with examples and limitations.

Use the same product name, category, and canonical URL across the site. When a capability differs by plan or region, say so near the claim. If the page compares alternatives, date the comparison and explain how it was checked. Internal links should connect feature claims to documentation, pricing, and proof so a buyer can follow the thread.

| Question | Visible evidence | Markup check |
| --- | --- | --- |
| What is it? | Plain-language product description | Name and type match the page |
| Who uses it? | Audience and use-case section | Do not overstate audience in properties |
| What does it do? | Current feature details | Do not list unshipped features |
| Why trust it? | Docs, examples, approved proof | Never invent ratings or reviews |

## Use structured data for its supported job

Structured data is a standardized way to describe page content. For Google Search, choose a supported type and follow the specific requirements if you want eligibility for a rich result. JSON-LD is often convenient, but valid syntax alone is not enough. The properties must be accurate, relevant, and visible to users. Google's guidelines explicitly warn that markup does not guarantee a particular display.

There is no universal “entity clarity score” that predicts placement in ChatGPT or Perplexity. A team can use its own checklist to find ambiguous pages, but it should not report the checklist as an external ranking metric. Test the rendered page and the markup after each product release because templates can preserve stale features or prices.

## Make the audit repeatable

Review a small set of important templates: homepage, product, feature, pricing, and case study. Record missing answers, contradictory wording, unsupported claims, and markup errors. Assign owners based on the source of the problem. A content editor fixes unclear copy; product approves capability wording; engineering fixes template generation. Recheck the page after release, not only the code in a pull request.`,
    practice: {
      prompt: "Audit one product page using the identity, audience, capability, and proof questions. Compare every major markup property with the rendered page.",
      output: "An issue list with exact claim, page location, markup field, owner, and approved correction.",
      measure: "Track contradictory claims resolved, valid markup on key templates, and buyer questions answered.",
      caution: "Do not promise AI-answer inclusion from a schema change; no provider guarantees that outcome.",
    },
    references: [{ label: "Google structured data guidelines", url: "https://developers.google.com/search/docs/appearance/structured-data/sd-policies" }],
  },
  {
    id: 10,
    slug: "building-a-proof-ladder-converting-case-studies-into-machine-readable-nodes",
    title: "Building a Proof Ladder for Customer Case Studies",
    category: "Content Strategy",
    summary: "Structure a case study so readers can trace the problem, intervention, outcome, and limits of the evidence.",
    takeaway: "Make every outcome traceable to a source and timeframe",
    date: "Sep 6, 2026",
    tags: ["Case studies", "Evidence", "Conversion"],
    visual: {
      title: "The proof ladder",
      caption: "Move upward only when the underlying evidence supports the next claim.",
      steps: [
        { label: "Baseline", detail: "Describe the starting situation and measurement period." },
        { label: "Change", detail: "Show what the customer actually implemented." },
        { label: "Outcome", detail: "Report observed results with units and timing." },
        { label: "Interpretation", detail: "Explain what can and cannot be attributed." },
      ],
      decision: "A strong narrative does not turn correlation into an unqualified causal claim.",
    },
    content: `## Start with permission and a clear evidence trail

A case study has two jobs: help a buyer recognize a relevant situation and give them reason to trust the outcome. Neither job is served by a dramatic percentage with no baseline. Before writing, confirm which customer details may be published, who can approve quotations, and which data has a reliable definition. If the customer wants anonymity, describe the industry and problem without adding identifying details by accident.

Build a source packet: interview notes, implementation timeline, metric definitions, baseline and follow-up periods, and written approvals. Distinguish observed outcomes from estimates and customer opinions. If the team changed several things at once, say so. A useful case study can still report an improvement without claiming one product caused all of it.

| Claim level | Example form | Required support |
| --- | --- | --- |
| Situation | “The team reviewed reports manually” | Customer interview or process record |
| Intervention | “They introduced an approval workflow” | Rollout timeline and product configuration |
| Outcome | “Review time fell over the next quarter” | Comparable before-and-after data |
| Interpretation | “The workflow likely reduced handoffs” | Customer explanation and stated caveats |

## Publish the story where it can be read

An HTML page can make the core story easier to discover and navigate than a download-only PDF. Use a descriptive title, a brief context block, clear section headings, an outcome table with units, and links to related product details. Keep the downloadable version if buyers need it, but do not hide the useful evidence behind a form unless there is a strong reason.

Write quotations for the specific point they support. A quote about ease of use should not be used to support a numerical ROI claim. A chart should show the timeframe, denominator, and source. If exact figures cannot be shared, use approved qualitative evidence rather than inventing precision. Keep the page current when the product changes; otherwise a case study can become proof for a workflow that no longer exists.

## Use proof in the buyer journey

Map each case study to a buyer objection: implementation effort, operational control, adoption, or cost. Link the relevant section from comparison pages and sales follow-ups. Watch whether qualified visitors reach the proof and whether sales teams find it useful. The best case study is not simply the one with the biggest number; it is the one that answers a real decision with honest, inspectable context.`,
    practice: {
      prompt: "Take an existing customer story and label every sentence as situation, intervention, outcome, interpretation, or unsupported.",
      output: "A source packet and revised outline with approved metrics, dates, quotes, and caveats.",
      measure: "Review proof-page engagement, use in qualified sales conversations, and post-publication corrections.",
      caution: "Get customer approval and do not imply causation when several changes occurred together.",
    },
  },
  {
    id: 11,
    slug: "the-100-point-intent-lead-scoring-algorithm-a-technical-deep-dive",
    title: "Designing an Explainable B2B Intent Scoring Rubric",
    category: "Demand Generation",
    summary: "Build a transparent way to prioritize signals while showing evidence, uncertainty, and the action each score should trigger.",
    takeaway: "Start with interpretable criteria, then calibrate with outcomes",
    date: "Sep 5, 2026",
    tags: ["Lead scoring", "Intent", "Sales operations"],
    visual: {
      title: "The signal review funnel",
      caption: "Scores help route review. They should never hide the original evidence or act as a verified precision claim.",
      steps: [
        { label: "Eligibility", detail: "Remove irrelevant, duplicate, and prohibited records." },
        { label: "Evidence", detail: "Read the source and note what the buyer actually said." },
        { label: "Priority", detail: "Rate fit, timing, specificity, and confidence." },
        { label: "Action", detail: "Match the response to the signal and channel." },
      ],
      decision: "A high score with weak evidence should be sent to review, not directly to outreach.",
    },
    content: `## Decide what the score is for

A scoring system is useful only when it changes a decision: which conversations deserve research, which accounts need a follow-up, or which records should be discarded. Define that decision before assigning points. Keep eligibility rules separate from priority. A duplicate, a prohibited contact, or a conversation unrelated to the product should not become actionable simply because it matches a keyword.

Start with four dimensions that a reviewer can explain: fit, specificity of need, timing, and evidence confidence. Give each a short definition and positive and negative examples. A buyer who states a concrete migration problem may be more useful than someone at a perfect-fit company who shared a general industry article. Unknown information should remain unknown rather than default to a favorable score.

| Dimension | Strong evidence | Weak evidence |
| --- | --- | --- |
| Fit | Workflow and organization match the offer | Only a broad industry match |
| Need | Specific pain or required capability | Category name with no problem |
| Timing | Active project or stated deadline | No sign of an evaluation |
| Confidence | Direct source and clear context | Inferred intent from a fragment |

## Choose weights from outcomes, not intuition alone

An initial rubric can use ordinal labels rather than a 100-point formula. Once reviewers have labeled a sample and outcomes have matured, compare scores with qualified opportunities and false positives. Adjust criteria that fail to discriminate. Keep a holdout sample for evaluation, and recheck results by source and segment; a model that works for one community may perform poorly elsewhere.

Record why a record received its priority. A short evidence note should include the source, date, relevant quote, assumptions, and reviewer. This allows sales to choose an appropriate response and makes errors correctable. If automated classification is used, sample its decisions regularly and let reviewers override them with a reason.

## Connect thresholds to responsible actions

A high-priority record may trigger human review, not automatic email. Medium priority might become an account research task. Low confidence might need more evidence or no action. Define suppression and privacy rules alongside the threshold. Monitor precision among reviewed records, reviewer agreement, opportunity quality, and negative feedback from the channel. These measures are more meaningful than an unverified “99% precision” headline.`,
    practice: {
      prompt: "Label thirty recent signals using fit, need, timing, and confidence. Have a second reviewer score ten without seeing the first labels.",
      output: "A rubric with disagreements, examples, routing actions, and an evidence field for each record.",
      measure: "Compare reviewer agreement, false positives, and qualified outcomes by signal source.",
      caution: "Do not publish a precision percentage without a defined sample, ground truth, and evaluation method.",
    },
  },
  {
    id: 12,
    slug: "eliminating-brand-voice-drift-across-12-execution-agents",
    title: "Keeping Brand Voice Consistent Across AI-Assisted Channels",
    category: "Brand Operations",
    summary: "Translate a brand guide into examples, review criteria, and correction loops that work across social, email, and long-form content.",
    takeaway: "Teach the voice through examples and review real outputs",
    date: "Sep 5, 2026",
    tags: ["Brand voice", "AI content", "Governance"],
    visual: {
      title: "The voice control loop",
      caption: "A shared style brief establishes direction; sampled human review catches what rules miss.",
      steps: [
        { label: "Define", detail: "Describe voice traits with approved and rejected examples." },
        { label: "Adapt", detail: "Set the channel's format and audience expectations." },
        { label: "Review", detail: "Check claims, tone, accessibility, and usefulness." },
        { label: "Learn", detail: "Record recurring edits in the shared guidance." },
      ],
      decision: "Consistent voice does not mean identical copy in every channel.",
    },
    content: `## Describe the voice in observable terms

Instructions such as “sound innovative” or “be human” are too vague to guide writers or AI tools. Write a short voice guide with three to five traits and show each one in action. For example, “direct” can mean opening with the reader's problem and avoiding abstract slogans. Include before-and-after rewrites, approved product terms, words to avoid, and a few examples of how to explain uncertainty.

Separate voice from message. Voice describes how the brand speaks; the message describes what the product claims and offers. A draft can sound perfectly on-brand and still promise an unavailable feature. Both require review. Keep the facts in an approved brief and the voice guidance in a separate, reusable layer so each can be updated by its owner.

| Review dimension | Question | Example correction |
| --- | --- | --- |
| Clarity | Can the reader understand the point quickly? | Replace a slogan with a concrete benefit |
| Tone | Does the wording fit the audience? | Reduce hype in an executive report |
| Accuracy | Is each product claim approved? | Narrow a feature statement |
| Channel fit | Does the format suit the platform? | Turn a dense paragraph into a short series |

## Allow the channel to shape the expression

A board report may be concise and measured; a social reply may be conversational; documentation should favor precision and direct instructions. They can still share vocabulary, honesty, and a recognizable point of view. Provide channel examples instead of forcing one template everywhere. If an AI workflow creates first drafts, include audience, job, approved facts, and two or three representative examples in its task context.

Review a sample of actual published or near-published work. Have two editors independently note deviations, then compare judgments. This exposes ambiguous rules. Store recurring corrections as examples in the guide and update prompts or templates from them. Do not claim a numerical consistency rate unless the team has a defined rubric and reliable scoring process.

## Keep the system maintainable

Assign a brand owner, a product-claim owner, and a review cadence. When positioning changes, update the source guidance and identify assets that need revision. A useful system helps people write faster while still letting them exercise judgment. The goal is recognizable, accurate communication, not a rigid sameness that makes every channel feel automated.`,
    practice: {
      prompt: "Collect six pieces of copy from different channels and annotate voice, message accuracy, and channel fit independently.",
      output: "A concise voice guide with approved examples, rejected examples, and the top recurring correction patterns.",
      measure: "Track editor agreement, repeat corrections, and time spent bringing a draft to publication quality.",
      caution: "A style rule cannot validate a product claim; keep factual review as a separate gate.",
    },
  },
  {
    id: 13,
    slug: "competitor-whitespace-mining-finding-positioning-gaps-in-saturated-b2b-markets",
    title: "Finding Real Positioning Gaps in Crowded B2B Markets",
    category: "Competitive Strategy",
    summary: "Compare competitor claims with customer needs, then validate a gap before building a campaign around it.",
    takeaway: "A missing competitor claim is only an opportunity if buyers care",
    date: "Sep 4, 2026",
    tags: ["Competitor research", "Positioning", "Messaging"],
    visual: {
      title: "The positioning gap test",
      caption: "Whitespace appears where a meaningful buyer need meets a credible advantage that competitors under-address.",
      steps: [
        { label: "Buyer need", detail: "Collect the questions, jobs, and objections that affect choice." },
        { label: "Competitor claims", detail: "Map what rivals actually say on dated public pages." },
        { label: "Your proof", detail: "Check whether your product can credibly answer the need." },
        { label: "Validation", detail: "Test the message in buyer conversations and content." },
      ],
      decision: "If the need is not validated or the advantage cannot be proved, the gap is not ready for a claim.",
    },
    content: `## Compare needs before counting competitor features

Competitor pages often use similar language, but absence of a phrase is not proof of a strategic opening. A rival may offer a capability under another name, may serve a different segment, or may deliberately omit a low-value feature. Begin with buyer interviews, sales objections, support patterns, and evaluation criteria. Identify the decisions buyers actually struggle to make.

Then review a focused competitor set. Capture each claim with its URL and date, the page's target audience, and the evidence offered. Distinguish a claimed capability from a documented workflow and a published customer outcome. Avoid a simple checkmark matrix that treats every feature as equally important or verified.

| Question | Evidence to collect | Why it matters |
| --- | --- | --- |
| Do buyers ask for it? | Interviews, RFPs, sales calls | Establishes demand |
| Do competitors address it? | Dated pages and demos | Establishes relative visibility |
| Can we deliver it? | Product and implementation review | Establishes credibility |
| Can we prove it? | Docs, examples, approved customers | Supports a public claim |

## Turn a gap into a testable position

A useful position has a specific buyer, problem, differentiated approach, and proof. For example, “marketing operations teams can trace report conclusions back to source evidence” is more testable than “the most intelligent AI platform.” Draft a comparison page or a focused guide that explains the tradeoff honestly. If a competitor also supports the need, say how the approaches differ rather than claiming exclusivity.

Validate the message in buyer conversations. Ask whether the gap matters, how teams solve it now, and what proof they would need. Watch for the possibility that buyers care about implementation effort more than the feature itself. Revise the claim based on what you learn instead of forcing the original matrix into every channel.

## Maintain the map

Competitor claims change. Assign an owner and review date to each important comparison. Preserve screenshots or notes for internal analysis but link readers to live sources where practical. Update public claims when a rival releases a feature. The defensible advantage is often not a permanent empty cell in a matrix; it is a clearer, better-supported answer to a buyer problem.`,
    practice: {
      prompt: "Choose one buyer objection and three competitors. Compare each public claim, its supporting evidence, and your own product response.",
      output: "A dated claim matrix and a one-sentence positioning hypothesis ready for customer validation.",
      measure: "Review buyer agreement with the hypothesis, qualified engagement with the new content, and accuracy of the comparison over time.",
      caution: "Do not infer a competitor lacks a feature merely because one page does not mention it.",
    },
  },
  {
    id: 14,
    slug: "self-hosted-lighthouse-auditing-tracking-core-web-vitals-for-ai-search-rank",
    title: "Using Lighthouse and Field Data to Improve Page Experience",
    category: "Technical SEO",
    summary: "Run repeatable lab audits, compare them with real-user Core Web Vitals, and prioritize fixes that improve the visitor experience.",
    takeaway: "Use Lighthouse for diagnosis and field data for lived performance",
    date: "Sep 4, 2026",
    tags: ["Lighthouse", "Core Web Vitals", "Performance"],
    visual: {
      title: "The performance diagnosis loop",
      caption: "Lab and field data answer different questions; use both before declaring a page fixed.",
      steps: [
        { label: "Baseline", detail: "Capture field metrics and representative page types." },
        { label: "Diagnose", detail: "Run Lighthouse with consistent device and network settings." },
        { label: "Fix", detail: "Target the largest verified bottleneck first." },
        { label: "Verify", detail: "Recheck lab runs and later field trends." },
      ],
      decision: "A perfect lab score is not a substitute for real-user performance.",
    },
    content: `## Understand what each measurement can tell you

Lighthouse runs a page in a controlled lab setting and offers diagnostic opportunities. Real-user data reflects the variety of devices, networks, and interactions visitors experience. Core Web Vitals focus on loading, responsiveness, and visual stability through Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS). Review the 75th percentile of field visits where data is available, segmented by device and page type.

Lab runs can be noisy. Run them under consistent settings and compare several samples rather than celebrating one score. A self-hosted run can help automate diagnostics, but its hardware and network settings still affect the result. Keep the exact URL, device profile, date, and build version with each report.

| Symptom | Lab clue | Field check |
| --- | --- | --- |
| Slow main content | LCP element and resource timing | LCP trend by device |
| Sluggish interactions | Long tasks and high blocking time | INP from real users |
| Jumping layout | Layout shift trace | CLS trend and affected pages |

## Fix the bottleneck behind the score

For slow LCP, inspect server response, render-blocking resources, image discovery, and the size of the main visual. For poor responsiveness, look at large scripts and expensive event handlers. For layout shift, reserve space for images, embeds, and late-loading UI. Test the actual page template, not just the homepage; a pricing or article page may have different third-party scripts and images.

Prioritize fixes by user impact and effort. A small change to a shared template can improve many URLs. A visually impressive score increase on a low-traffic page may matter less than a modest improvement on a core buying path. After release, check errors, accessibility, and visual rendering so a performance optimization does not damage the experience.

## Avoid unsupported search claims

Fast, usable pages are valuable to visitors and align with search quality guidance. They do not guarantee an AI citation, and a three-second threshold is not a universal crawler timeout. Report the observed performance change and any later search or conversion trend separately. This keeps the technical work accountable without attributing every downstream movement to one audit.`,
    practice: {
      prompt: "Audit one product, one pricing, and one article page. Pair repeatable Lighthouse runs with available field data and identify the largest shared bottleneck.",
      output: "A prioritized fix list with affected templates, supporting traces, owner, and verification plan.",
      measure: "Track LCP, INP, and CLS field trends alongside consistent lab diagnostics after release.",
      caution: "Lighthouse cannot measure field INP in a non-interactive run; use real-user data for that metric.",
    },
    references: [{ label: "web.dev: Core Web Vitals and measurement", url: "https://web.dev/articles/vitals" }],
  },
  {
    id: 15,
    slug: "the-token-budget-optimization-guide-for-enterprise-marketing-workspaces",
    title: "Managing AI Token Budgets in Marketing Workflows",
    category: "Marketing Operations",
    summary: "Allocate model usage to valuable work, reduce repeated context, and measure quality alongside cost.",
    takeaway: "Optimize useful output per unit of cost, not tokens alone",
    date: "Sep 3, 2026",
    tags: ["AI costs", "Workflow design", "Operations"],
    visual: {
      title: "The budget allocation cycle",
      caption: "Spend should follow the value and review burden of each workflow, not an arbitrary equal split.",
      steps: [
        { label: "Inventory", detail: "List recurring tasks, run frequency, and average usage." },
        { label: "Prioritize", detail: "Fund high-value, evidence-sensitive work first." },
        { label: "Reduce waste", detail: "Trim duplicate context and use focused revisions." },
        { label: "Evaluate", detail: "Compare cost with quality, time saved, and corrections." },
      ],
      decision: "A cheaper draft that needs extensive correction may cost more overall.",
    },
    content: `## Establish a cost baseline by workflow

A total token bill does not explain where value was created. Break usage down by task: research summaries, article drafts, report synthesis, social adaptations, and revisions. Record model, input and output usage, number of runs, human review time, and whether the output was used. This reveals waste that a top-line budget cannot show.

Large context packages are a common source of unnecessary cost. Before a task runs, ask what evidence it needs. Pass approved summaries or retrieved passages with source links rather than full site dumps when that is sufficient. Keep product facts and instructions versioned so the same boilerplate does not have to be rediscovered in every step. Some platforms offer caching or batch pricing, but the right choice depends on latency and provider terms.

| Workflow | Potential efficiency change | Quality check |
| --- | --- | --- |
| Research synthesis | Retrieve only relevant source passages | Are key facts still covered? |
| Article revision | Edit a section rather than regenerate all | Does the full article remain coherent? |
| Channel adaptation | Reuse the approved claim brief | Are message and channel fit intact? |
| Report generation | Separate data preparation from narrative | Can every conclusion be traced? |

## Use the right model and review level

Not every task needs the same model or amount of context. A deterministic formatting step may be handled without a large model. A high-stakes executive conclusion needs stronger reasoning and careful human review. Test changes on representative examples before switching an entire workflow. Measure whether cheaper settings increase factual corrections or time spent editing.

Set a practical budget with room for retries and human-triggered revisions. Add alerts for sudden usage spikes, but do not make a hard token target the definition of success. A workflow that produces fewer tokens but more unusable drafts is not more efficient. Conversely, an expensive task may be worth keeping if it materially shortens a valuable process.

## Close the loop monthly

Review spend, accepted outputs, correction rates, and business use. Retire workflows that generate volume without adoption. Improve prompts, retrieval, or templates where reviewers make the same correction repeatedly. Keep cost assumptions current when model prices or task patterns change. The aim is a reliable operating system with visible tradeoffs, not a heroic reduction in token count.`,
    practice: {
      prompt: "Sample one month of AI runs from three recurring marketing workflows and connect usage to accepted outputs and review effort.",
      output: "A workflow cost table and one controlled experiment to reduce repeated context or full regenerations.",
      measure: "Compare cost per accepted deliverable, correction time, and task completion quality before and after the change.",
      caution: "Do not reuse a fixed cost-per-token assumption indefinitely; provider prices and caching rules change.",
    },
  },
  {
    id: 16,
    slug: "jobs-to-be-done-jtbd-frameworks-in-ai-powered-customer-intelligence",
    title: "Using Jobs-to-Be-Done to Understand B2B Buyers",
    category: "Customer Research",
    summary: "Translate interviews and observed behavior into buyer jobs, progress triggers, anxieties, and useful messaging hypotheses.",
    takeaway: "Research the progress buyers seek, then test the message",
    date: "Sep 3, 2026",
    tags: ["Jobs-to-be-Done", "Customer research", "Messaging"],
    visual: {
      title: "The buyer progress map",
      caption: "The framework organizes interview evidence; it is not a formula that predicts every purchase.",
      steps: [
        { label: "Situation", detail: "Describe the context in which a need becomes urgent." },
        { label: "Progress", detail: "Identify the outcome the buyer is trying to achieve." },
        { label: "Friction", detail: "Record constraints, habits, and worries." },
        { label: "Choice", detail: "Learn what proof makes a new approach acceptable." },
      ],
      decision: "A job statement should be grounded in what buyers did and said, not a persona stereotype.",
    },
    content: `## Interview for the decision, not the demographic profile

A job is the progress someone wants in a particular situation. “VP of Marketing at a mid-market SaaS company” describes a role, but it does not explain why that person changes tools this month. A useful interview reconstructs a recent decision: what made the old way inadequate, what alternatives were considered, who had to agree, and what remained risky.

Ask for specific events instead of opinions about ideal products. “Tell me about the last board report that was difficult to prepare” is more informative than “Would you use an AI board-report tool?” Follow the timeline from first frustration to shortlisting, purchase, rollout, and later evaluation. Capture exact language, but distinguish what one person said from a pattern across interviews.

| Research lens | Interview prompt | Possible content use |
| --- | --- | --- |
| Trigger | What happened before you looked for a change? | Problem-focused opening |
| Desired progress | What would be different if it worked? | Outcome explanation |
| Anxiety | What made a new option feel risky? | Proof and implementation detail |
| Existing habit | What kept the current process in place? | Migration guidance |

## Synthesize carefully

Group interview notes by situation and desired progress, not only by job title. Look for recurring triggers, constraints, and decision criteria. A researcher should keep links to the original notes so a strong quote does not become a universal claim. Public discussions and reviews can add hypotheses, but they may overrepresent unusually vocal users. Validate important patterns in direct conversations.

Write job statements in a concrete form: “When [situation], I want to [make progress] so I can [outcome].” Pair each with the anxieties and evidence needed to move forward. For example, a team preparing executive reports may want traceable recommendations, but worry that automated synthesis will hide assumptions. The message should show the evidence trail and review process, not simply promise “instant strategy.”

## Use jobs to improve the journey

Map each job to an article, product explanation, proof page, or sales conversation. Check whether the content answers the buyer's next question and reduces uncertainty. Test messages in interviews or small campaigns, then revise them. Jobs-to-be-Done is useful because it keeps the team close to buying context; it does not guarantee that every job or objection has been discovered.`,
    practice: {
      prompt: "Interview five recent buyers or evaluators about one completed decision. Reconstruct the trigger, alternatives, constraints, and proof they needed.",
      output: "A set of evidence-linked job statements and a content map for the most repeated questions and anxieties.",
      measure: "Review interview pattern strength, buyer feedback on the message, and engagement with the mapped content.",
      caution: "Do not turn one vivid quote or a public-forum sample into a claim about all buyers.",
    },
  },
];

const WORKED_EXAMPLES: Record<number, BlogPost["workedExample"]> = {
  1: {
    title: "A missing comparison answer",
    situation: "A software team repeatedly sees competitors cited for questions about implementation effort, even though its own comparison page ranks in conventional search. The page says the product is easy to deploy but gives no sequence, prerequisites, or estimated work by role.",
    approach: "The team logs the raw AI answers, checks the cited competitor pages, and interviews two recent buyers about what they needed to know. It adds a dated implementation walkthrough, a list of dependencies, and links to the current setup guide. The original query panel is rerun after publication.",
    lesson: "The action comes from a documented buyer-information gap. If citations do not change, the improved page can still help qualified visitors evaluate rollout effort.",
  },
  2: {
    title: "A thread that looks hotter than it is",
    situation: "A post says a team is “looking at alternatives” to its analytics setup. The phrase matches a high-intent keyword rule, but the full thread shows the author is preparing an internal benchmark for next year, with no active purchase project.",
    approach: "A reviewer marks the timing as unknown and the need as exploratory. Instead of routing the person to sales, the team contributes a neutral evaluation checklist where community rules allow. It records whether the discussion later becomes a concrete request.",
    lesson: "The same phrase can describe research or purchase. Context and an appropriate response matter more than a keyword match.",
  },
  3: {
    title: "A launch claim changes mid-workflow",
    situation: "A product team delays a planned integration after a campaign brief has already fed landing-page, email, and social drafts. Without a source version, each owner assumes a different launch state.",
    approach: "The product owner updates the approved-facts brief, marks the old integration claim withdrawn, and identifies drafts produced from the earlier revision. Channel owners replace the claim with the supported capability and record the source version in their final review.",
    lesson: "Shared context helps only when downstream outputs can be traced and corrected. The handoff contract should surface stale facts immediately.",
  },
  4: {
    title: "A finance buyer follows the campaign",
    situation: "In the hypothetical fintech launch, a buyer finds a search guide about policy controls, clicks a product page, then receives a follow-up email. The guide mentions flexible approvals, but the email implies every approval route can be automated without configuration.",
    approach: "The team checks current product documentation and rewrites the email to describe the supported routes and setup requirements. It links to the relevant section of the guide and updates the campaign brief so future assets use the same explanation.",
    lesson: "The journey review catches a contradiction that a channel-by-channel quality check might miss. No numerical business outcome is implied by this scenario.",
  },
  5: {
    title: "Robots allows, the server refuses",
    situation: "A company expects a public documentation page to be accessible to a search crawler. The robots file has no disallow rule for that path, but requests from the provider's documented bot receive a 403 response at the edge.",
    approach: "The team checks access logs, verifies the bot using the provider's current guidance, and asks security to create a narrow rule for the affected path and verified traffic. It retests the response and confirms that the rendered HTML contains the documentation text.",
    lesson: "Robots is one layer of access. WAF and delivery behavior must be investigated separately, and successful fetching still cannot promise inclusion in an answer.",
  },
  6: {
    title: "A tutorial passes syntax but fails users",
    situation: "A new article shows a valid command for creating an API token. The code parses, yet it assumes an older CLI version and skips a required permissions step. Readers get an authorization error after following the guide.",
    approach: "An engineer runs the steps from a clean environment, records the supported CLI version, adds the missing permission, and includes the expected success and failure output. The documentation owner links article review to future CLI release notes.",
    lesson: "A runnable task from start to finish is the unit of quality. Syntax validation alone cannot certify a technical tutorial.",
  },
  7: {
    title: "A traffic slide cannot answer the investment question",
    situation: "A quarterly deck opens with an impressive traffic increase, but the board needs to decide whether to continue funding a new segment. The slide does not separate existing customers, unqualified visits, or pipeline from the target segment.",
    approach: "The marketing lead rewrites the opening as a decision, then shows qualified pipeline and conversion for the segment with definitions and period comparisons. Traffic remains as a supporting diagnostic. A caveat explains the sales-cycle lag.",
    lesson: "The number was not useless; it was placed above the decision it should support. A better narrative makes the tradeoff legible.",
  },
  8: {
    title: "A brand appears without a useful citation",
    situation: "A team sees its product named in several answer-engine responses and announces a visibility gain. Closer review shows the answers cite an outdated partner listing rather than the current product documentation.",
    approach: "The team records mention and citation as separate fields, checks the accuracy of the description, and updates the owned page that should answer the buyer's question. It also asks the partner to correct the stale listing and monitors qualified visits to both sources.",
    lesson: "A raw mention count can conceal an inaccurate buyer experience. Attribution and factual quality deserve their own measures.",
  },
  9: {
    title: "A feature exists only in markup",
    situation: "A product page's JSON-LD lists an integration that was removed during a pricing update. The visible page no longer mentions it, but the template still emits the old feature list for every plan.",
    approach: "The team compares rendered copy and structured data across plan variants, removes the stale property, and connects both to the approved product source. Product reviews the current capability wording while engineering adds a template-level check for future releases.",
    lesson: "Valid markup can still be misleading. The audit succeeds when the page and structured representation tell the same truthful story.",
  },
  10: {
    title: "An impressive outcome without a baseline",
    situation: "A draft case study says a customer “cut reporting time by half.” The interview notes confirm the customer felt faster, but no before-and-after timing was recorded and several process changes happened together.",
    approach: "The editor replaces the percentage with the customer's approved qualitative description, documents the new workflow, and adds a caveat about the other changes. The team creates a measurement plan for a later follow-up rather than inventing a baseline now.",
    lesson: "A credible qualitative story is stronger than a precise number the organization cannot substantiate.",
  },
  11: {
    title: "A high score built from missing fields",
    situation: "A lead-scoring rule gives a public post a high priority because the company matches the target segment. The post says little about the person's role or purchase timing, but unknown fields were silently treated as positive.",
    approach: "The sales-operations owner separates fit from need and confidence. The record moves to human research, and the reviewer can see which dimensions are unknown. After several weeks, the team compares similar records with qualified outcomes and revises the routing threshold.",
    lesson: "Explainability changes behavior. A score should show why a person needs review, not camouflage the absence of evidence.",
  },
  12: {
    title: "One voice, three expressions",
    situation: "A brand guide calls for calm, precise language. An AI-assisted workflow turns that into identical formal sentences for documentation, LinkedIn, and support replies. The copy is consistent but awkward in two of the channels.",
    approach: "Editors preserve the core traits—plain claims, no hype, explicit limits—while adding channel examples. Documentation gives direct steps, LinkedIn leads with one observation, and support answers the immediate question. They review samples together and add the corrections to the guide.",
    lesson: "Voice consistency is a pattern of choices, not duplicate phrasing across every format.",
  },
  13: {
    title: "A blank matrix cell is not a market gap",
    situation: "A team spots that competitors do not mention audit trails on their homepages and plans a campaign claiming exclusive traceability. Sales calls, however, show buyers care more about exportability, and one competitor documents audit trails deeper in its help center.",
    approach: "Researchers update the competitor evidence and interview buyers about the actual evaluation task. The revised message focuses on easily exporting evidence for review, a capability the team can demonstrate, rather than asserting exclusivity.",
    lesson: "Whitespace needs demand and credible proof. A missing homepage phrase is merely a research lead.",
  },
  14: {
    title: "A fast lab run masks a mobile problem",
    situation: "A product page scores well in a local Lighthouse run, yet mobile users report that the primary call to action reacts slowly. Real-user data shows poor interaction responsiveness on the same template.",
    approach: "The engineering team reproduces the interaction on a mid-range device, finds a heavy script tied to the button, and reduces main-thread work. It keeps lab diagnostics for regression checks while monitoring field INP after rollout.",
    lesson: "Lab scores help locate bottlenecks, but field data reveals the experience visitors actually had.",
  },
  15: {
    title: "A cheaper prompt increases review time",
    situation: "A team shortens the context sent to a report-writing workflow and cuts model usage. Reviewers then spend extra time correcting product claims because the retrieved brief no longer includes important limitations.",
    approach: "Operations restores the required limitations, removes duplicated background text instead, and compares total model cost with human correction time across a sample of reports. The team keeps the change only if accepted-output cost improves without reducing quality.",
    lesson: "Token reduction is an input metric. The economic unit that matters is a reliable deliverable.",
  },
  16: {
    title: "The job behind an executive title",
    situation: "A persona says the ideal buyer is a CMO at a growing software company. Interviews reveal two different purchase situations: one leader needs defensible board reporting, while another needs to coordinate a new product launch. Their titles are similar, but their anxieties and proof needs differ.",
    approach: "Researchers write separate job statements from the decision timelines, then test distinct landing-page explanations. The reporting path emphasizes source traceability; the launch path emphasizes cross-channel consistency. Both remain hypotheses until buyers confirm them.",
    lesson: "A role can help with targeting, but the situation and desired progress explain the message a buyer needs.",
  },
};

export const BLOG_POSTS: BlogPost[] = DRAFTS.map((post) => {
  const workedExample = WORKED_EXAMPLES[post.id];
  const content = `${post.content}\n\n${BLOG_DEEP_DIVES[post.id]}\n\n${BLOG_WORKSHOP_NOTES[post.id]}`;
  const words = [content, post.summary, ...post.visual.steps.map((step) => step.detail), ...Object.values(post.practice), ...Object.values(workedExample)]
    .join(" ")
    .trim()
    .split(/\s+/).length;

  return { ...post, content, workedExample, readTime: `${Math.max(4, Math.ceil(words / 200))} min read` };
});

export function getAllBlogs(): BlogPost[] {
  return BLOG_POSTS;
}

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getRelatedBlogs(currentSlug: string, count = 3): BlogPost[] {
  const current = getBlogBySlug(currentSlug);
  return BLOG_POSTS.filter((post) => post.slug !== currentSlug)
    .sort((a, b) => Number(b.category === current?.category) - Number(a.category === current?.category))
    .slice(0, count);
}

export function getAllCategories(): string[] {
  return [...new Set(BLOG_POSTS.map((post) => post.category))];
}
