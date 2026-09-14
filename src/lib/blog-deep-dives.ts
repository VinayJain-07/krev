/** Additional editorial depth kept separate from the article summaries used by the index. */
export const BLOG_DEEP_DIVES: Record<number, string> = {
  1: `## Design a query panel that survives the next review

The hardest part of an answer-visibility program is defining the questions before seeing the results. If a team keeps replacing difficult prompts with favorable ones, its trend line becomes meaningless. Write down the buyer stage, intended audience, exact query, and reason for including each question. A balanced panel should contain some questions where your brand is expected, some where a competitor is likely, and some where no vendor recommendation is appropriate. Keep a separate exploratory list for new questions discovered during sales calls.

Set a reporting cadence and a consistent capture process. If the answer interface personalizes by account or market, use a documented testing environment. Record whether the engine cited your site, another owned property, a partner, or a third party. A citation to a partner page may be useful, but it is not the same as a citation to your current product explanation. Reviewers should classify the claim, not merely count links.

### When a change is meaningful

Compare several runs before calling an apparent improvement a trend. One answer might change because the engine updated, the source page changed, a query was interpreted differently, or a new competitor article appeared. Keep these possibilities in a change log. When the panel is small, show counts alongside percentages: “three of twelve questions” is more honest than a percentage standing alone.

The editorial team should close each cycle by selecting a few specific page actions. Examples include publishing a transparent implementation section, correcting stale partner descriptions, or making product limitations visible. Assign an owner and review date. The next cycle should test whether the answer became more accurate and whether a buyer reaching the page could complete the intended task. This creates a useful feedback loop even when the answer engine does not cite the page.`,
  2: `## Build an evidence note that sales can actually use

For every potentially relevant conversation, retain the source URL, date, short description of the problem, and the sentence that led to the classification. Add separate fields for what is directly stated and what the team inferred. “The author is evaluating vendors this month” is direct only if the conversation says so. A job title guessed from a profile or a company size inferred from a handle should be marked uncertain.

Reviewers can use a small calibration set to agree on labels. Have two people classify the same posts independently, then discuss disagreements. The resulting examples are more valuable than an elaborate scoring formula built before anyone has checked false positives. Add examples of posts the team should ignore, including recruitment, academic research, recycled news, and conversations in channels that prohibit vendor responses.

### Route the next action, not just the record

The output should tell a teammate what useful action is appropriate. One thread may deserve a public answer with no commercial link. Another may justify a short research task for an account owner. A direct message should be considered only when the person's context and channel norms make it welcome. If a salesperson cannot explain why the message is relevant without quoting a surveillance-style data trail, the team should reconsider the approach.

Keep a weekly feedback loop with sales and community owners. Review which classifications led to useful conversations, which were awkward or irrelevant, and whether the source community still welcomes participation. A growing count of captured posts can reflect a noisier filter rather than a stronger pipeline. Preserve the original evidence so the rubric can be revised when outcomes disagree with the initial label.`,
  3: `## Decide what belongs in shared memory

The common brief should be small enough to audit. Begin with a product fact sheet, approved positioning, audience evidence, current offer, exclusions, and source links. Each item needs an owner and a freshness rule. A permanent product constraint may be reviewed on release; a campaign claim may expire at the end of the quarter. Store experimental insights as hypotheses so they cannot silently become approved facts.

When a specialist begins work, assemble a task packet rather than dumping the entire memory into its prompt. A landing-page writer needs the buyer problem, approved claims, proof, and page objective. A technical auditor needs URLs, performance criteria, and environment details. Both need the same rules for identifying unknowns and attaching evidence, but they do not need all the same source passages. This makes output easier to review and reduces irrelevant context.

### Test the handoff with failure cases

Run a tabletop exercise before trusting the workflow at scale. Change a product feature in the source brief and check which drafts become stale. Remove a citation and see whether the next step flags the unsupported claim. Give two agents conflicting audience assumptions and see whether the supervisor asks for resolution. These tests reveal more than a demonstration in which every input is clean.

Record a small audit trail: source revision, task request, generated draft, human edits, and publication decision. Reviewers should be able to answer why a statement appeared and who approved it. If a downstream asset cannot be traced, pause that asset and repair the handoff contract. Shared context is useful when it makes correction cheap and visible, not when it makes all channels repeat the same mistake.`,
  4: `## Run a short campaign operating cadence

In the illustrative finance-platform scenario, the campaign team could begin with a one-hour decision meeting. Product confirms the available policy controls and implementation requirements. Sales brings the questions most often raised by finance buyers. Marketing names one audience and one next action. The group leaves with a brief containing approved wording, evidence links, unresolved questions, and owners. That brief is a working contract, not a long presentation.

Channel owners then draft against specific buyer questions. Search explains the process in depth. Social introduces one insight and points to the guide. Email responds to a known objection. Sales material supports a live evaluation with a current demo. Before launch, one reviewer follows every path from the first claim to the supporting page. This catches a promise that sounds harmless in isolation but conflicts with another asset.

### Handle changes after publication

Suppose the rollout estimate changes because a new integration step is required. The brief owner updates the source and flags every asset that mentions timing. The search guide receives the detailed change; shorter channel copy is narrowed; sales receives an explicit note. A public correction is better than letting the old promise persist while teams debate wording.

Report on the quality of the journey rather than an invented cross-channel efficiency number. Look at qualified questions, repeated objections, content-assisted conversations, and the effort required to correct inconsistencies. A campaign may have more assets and still serve buyers poorly if each one repeats a vague promise. The goal is a coherent sequence in which each channel adds information the buyer needs next.`,
  5: `## Test access in a controlled sequence

Start with a URL inventory rather than a single homepage check. Select the templates that carry important answers: product details, pricing, documentation, and editorial pages. For each URL, note its canonical destination and whether it is public by design. Then inspect the robots file for the exact user agent and path. A broad rule for all bots may interact with a more specific rule, so test the resolved behavior instead of reading one line in isolation.

Next, request the URL and inspect the final status, redirect chain, response headers, and rendered content. A 200 response that contains an empty shell or a consent wall may not give a crawler the answer the business expects. Check logs for actual requests, but remember that a lack of requests during a short window is not proof of a block. If a WAF rule appears responsible, work with security on a narrow exception and verify the provider's bot identity using current documentation.

### Separate the three decisions

The organization has at least three distinct decisions: whether a provider may fetch the page, whether the page should be indexed or surfaced, and whether the content is good enough to support an answer. Robots and access controls address the first. Indexing settings and provider behavior affect the second. Clear, useful, current content affects the third. Treating them as one switch leads to overconfident conclusions.

Keep a dated policy record with the reason for each crawler rule and the person who approved it. Revisit the record when providers change their user agents or when new content types are published. After any technical fix, check the page as a human visitor too. A technically accessible page with contradictory pricing or hidden documentation still creates a poor discovery experience.`,
  6: `## Create a repeatable tutorial brief

Before drafting, ask a technical owner to define the task in one sentence and identify the supported product version. List the starting environment, required permissions, expected result, and known failure states. This brief forces a decision about whether the article is a tutorial, a conceptual explanation, or a troubleshooting guide. Mixing those formats often leaves readers without a clear path to completion.

Write the smallest executable example that demonstrates the task. Use realistic but non-sensitive placeholders for credentials and explain where each value comes from. Run the commands in a clean environment that resembles the reader's. Capture output, note operating-system differences, and verify that the example uses a released API rather than an internal branch. If an SDK snippet depends on a service response, include the relevant response shape and error behavior.

### Review for developer trust

A technical reviewer should follow the article without help from its author. When a step fails, record whether the problem is in the code, a missing prerequisite, a version mismatch, or an assumed product state. An editor then checks that the explanation is concise, navigable, and honest about tradeoffs. Both reviews matter. A technically correct wall of text can be hard to use; a polished article with incorrect commands is worse.

Set maintenance triggers instead of a vague promise to revisit every article someday. A CLI release, renamed endpoint, changed authentication flow, or support spike should create a review task. Track the last verified version and link to the canonical documentation. If the product cannot support a promised workflow anymore, retire or redirect the article. Content scale should be measured by completed developer tasks and sustained correctness, not raw publishing volume.`,
  7: `## Build the source sheet before the slides

Create one row for every material number that may enter the deck. Include metric name, business definition, time period, source system, extraction date, owner, and known caveats. This source sheet makes it possible to reconcile two charts that appear to disagree. It also reveals when a metric is unavailable before the narrative is locked. Freeze a reporting snapshot for the board cycle and note later revisions explicitly.

Draft the story as headlines before designing charts. A headline should be a conclusion the evidence can support, such as “Segment A created more qualified pipeline but required a longer sales cycle.” Under it, place the chart that tests the conclusion and a small note about uncertainty. Keep channel metrics in the appendix unless they explain an outcome or support a requested decision.

### Rehearse the difficult questions

Ask someone who did not assemble the deck to challenge the causal story. Could seasonality explain the movement? Did the definition of a qualified opportunity change? Is the attribution window long enough to include the current campaign? What would make the recommendation wrong? Put the important answers in the deck or speaker notes before the meeting.

Afterward, record the actual decision and any follow-up data requested. This improves the next report. If the board repeatedly asks the same question, adjust the standing outline or source sheet. Automation can prepare charts and tables, but a reporting system matures when its definitions, caveats, and decisions remain connected from quarter to quarter.`,
  8: `## Keep the comparison at the question level

A headline “share of AI answers” can hide very different buyer tasks. A product may be visible for broad category prompts but absent when people ask how to implement it. Another may receive citations for a tutorial but not appear in vendor comparisons. Tag every query by stage, use case, and intended page. Report counts within those groups rather than only one blended percentage.

For conventional search, retain the result page, snippet, rank range, and qualified click behavior. For answers, capture the full response, the mentioned brands, linked sources, and factual accuracy. Note whether the source is your current page, an old blog post, a review site, or a partner listing. These distinctions turn “visibility” into a set of editorial and technical actions.

### Do not optimize a measurement artifact

Teams can accidentally design content around a tiny fixed panel rather than around buyers. Keep a separate exploratory stream from real customer conversations and site searches. Add a question to the formal panel only at a planned revision, preserving a record of the old panel for comparison. An answer engine may change its format, so document any classification rule changes too.

When a question underperforms, inspect the actual page and the competing source. If the difference is an original example or a clearer tradeoff, improve the content. If the issue is an inaccessible page, fix delivery. If the engine simply chooses another credible source, report that honestly. The long-term aim is an accurate, useful answer and a sensible route for the buyer, not a synthetic victory on one prompt.`,
  9: `## Make a claim inventory before editing JSON-LD

Choose a representative product page and list every substantial claim a buyer might rely on: audience, capabilities, availability, integration, pricing, and proof. For each, record the visible sentence, the source owner, and whether the same fact appears in metadata or structured data. This inventory often reveals a copy problem before it reveals a markup problem. The page may say “flexible integrations” without naming a supported integration or showing how it works.

Rewrite ambiguous copy in terms a buyer can test. Name the workflow and its limitations. Then review markup against the final rendered page. Use a type appropriate to the page and avoid filling optional fields with guessed values. A property that describes an unshipped feature does not become true because a validator accepts it. Keep product facts in a maintained source so a release can update both copy and templates.

### Test several page variants

Templates can behave differently across plans, locales, and feature pages. Inspect a sample of each variant after a change. A pricing template may pull an old offer into markup while the visible price is current. A translated page may use the default-language description. A canonical URL may point to a page whose content describes a different product. These are consistency bugs, not a mysterious “entity score.”

Use technical validation as one quality gate and a human page review as another. Record the observed issue, approved correction, and retest result. The outcome you can confidently report is that a page gives clearer, more accurate information and its markup matches. Any change in search presentation should be measured separately, because eligibility is never a guarantee of display.`,
  10: `## Interview for the sequence of change

Ask the customer to reconstruct the decision and rollout in order. What problem made the old process insufficient? Which alternatives were considered? What did the team implement first, and what changed later? This sequence helps readers judge whether the situation resembles their own. It also prevents a case study from implying that a product alone caused an outcome when staffing, process, or market conditions changed at the same time.

Request raw measures before drafting the headline. Check that the baseline and outcome use the same definition, unit, cohort, and period. If they do not, use qualitative language with an explicit explanation. A graph with an unlabeled axis or a percentage without a denominator can make a story less credible, even when the underlying work was valuable.

### Build the page for different buyer questions

An executive may scan for the business problem and outcome. An implementation owner may need the steps, dependencies, and time to value. A skeptical buyer may seek caveats and the customer's own words. Use a concise summary, a visible proof table, a narrative of the change, and links to related product documentation. Make the PDF optional rather than the only place the evidence exists.

Before publication, send the complete page to the customer approver, including headlines, charts, quotation context, and any social snippets planned for promotion. Record approval and a review date. If the relationship or product changes, revisit the public story. The strongest proof ladder is one that can withstand a buyer asking, “How do you know, and would this apply to us?”`,
  11: `## Calibrate the rubric with labeled examples

Gather a sample of past signals that reached an actual review decision. Include successful and unsuccessful examples from each source rather than choosing only obvious wins. Two reviewers should read the full source context and label fit, stated need, timing, and confidence independently. Where they disagree, refine the definitions and keep the disputed examples. This process exposes whether “strong intent” is a shared concept or merely a persuasive phrase.

Only then consider numerical weights. Start with a transparent baseline, such as equal weights, and compare its routing decisions with outcomes. A high score that mainly reflects company fit may route too many curious but inactive accounts. A timing weight that depends on a single phrase may miss slower enterprise evaluations. Adjust one rule at a time and keep a holdout sample so improvements are not judged on the same examples used to tune the rubric.

### Define actions for uncertainty

Priority is not the same as permission. A high score should first tell a person which evidence to review. A medium score might prompt account research or a helpful public response. An unclear source should remain in research, even if other dimensions look promising. Add a suppression rule for prohibited channels, duplicate records, and people who have declined contact.

Revisit the rubric every reporting cycle. Compare reviewer agreement, the fraction of routed records that become qualified, missed opportunities found later, and negative feedback. Slice results by channel because the meaning of a signal differs between a technical forum and a professional network. Report the sample size and labeling method with any performance figure. An explainable system earns trust by making mistakes visible and correctable, not by claiming near-perfect precision.`,
  12: `## Write examples that show judgment

A useful voice guide contains more than adjectives. Take real pieces of copy and show an approved rewrite with a short reason. Explain why a sentence feels inflated, too casual, inaccessible, or vague for the intended audience. Include examples of acknowledging uncertainty without sounding evasive. Give writers a small vocabulary of preferred terms for the product, but allow natural variation where meaning remains clear.

Build channel guidance from the reader's task. In documentation, clarity means a direct instruction and expected result. In a board report, it means a conclusion with evidence and caveats. In a social conversation, it means answering the point without turning every reply into a pitch. These are different expressions of the same underlying commitments.

### Measure revision patterns

Sample a set of drafts from several channels and ask two editors to annotate deviations independently. Separate tone changes from factual corrections; otherwise a serious product-claim issue can be hidden inside a general “voice” score. Compare the most frequent edits and update the guide with before-and-after examples. If reviewers disagree often, the rule may be too subjective to apply reliably.

Review published work periodically as well. A prompt can perform well on test drafts and drift when campaign context changes. Assign an owner to update the voice guide when positioning shifts and notify channel owners of the revision. Consistency should help the audience recognize the brand and understand the offer, while leaving enough room for the context and writer's judgment.`,
  13: `## Distinguish a claim gap from a capability gap

A competitor may not discuss a feature on its homepage but may document it elsewhere. Search the relevant product, pricing, help, and release pages before labeling a cell absent. Record what the competitor actually claims, the URL, date, and any ambiguity. Separately record whether your own product can deliver the proposed difference today and what evidence you can publish. A positioning map should never substitute a marketing phrase for a verified product comparison.

Overlay buyer evidence next. How often did the need appear in recent evaluations? Did the buyer rank it as decisive, merely useful, or irrelevant? What existing workaround do they use? A gap becomes strategically interesting when the need affects a buying decision, competing responses are weak or unclear, and your team can demonstrate a better approach.

### Test the message before scaling it

Draft a concise claim and a proof asset, then test them in a limited setting: a few buyer interviews, a sales conversation, or one focused article. Ask what the buyer understands, which tradeoff they still need explained, and whether the difference would change their shortlist. If the answer is no, revise the position rather than multiplying campaign assets.

Keep public comparisons dated and fair. Competitors change quickly, and overstating a rival's weakness can damage credibility. Assign a refresh owner and watch for release notes that alter the comparison. The durable opportunity may be a better explanation of a workflow, a clearer implementation path, or stronger proof—not permanent ownership of a feature name.`,
  14: `## Segment the performance question

Start with the pages and visitors that matter. A mobile pricing page can have a different experience from a desktop documentation page. Group URLs by template, device, and geography where enough field data exists. Record the observation window and sample coverage. If there is too little field data for a particular URL, use a broader template-level signal and say so.

Run lab diagnostics under consistent conditions to identify likely causes. For LCP, inspect the main element and the timing of its resource request. For responsiveness, find long tasks and expensive event handlers, then verify the real interaction with field INP. For CLS, inspect late-arriving media, fonts, and dynamic panels. A single synthetic score should not become the only acceptance criterion.

### Verify a fix in two phases

Before release, check that the optimized page still works and looks right at relevant widths. Repeat lab runs and examine the specific trace that motivated the change. After release, monitor field metrics as new visits enter the reporting window. The field result can lag because it reflects actual users over time. Keep an eye on conversions and errors so a fast page does not become a broken page.

Use the interactive triage in this guide with 75th-percentile field values, not with a one-off Lighthouse score. A threshold comparison suggests where to investigate; it does not diagnose the cause. Document the source of every value and prioritize improvements by affected journeys. There is no valid shortcut from a Core Web Vitals number to a guaranteed AI-answer ranking.`,
  15: `## Model the entire accepted-output cost

Token usage is only one part of the cost of an AI-assisted workflow. Add model charges, retries, tool calls, human review time, and the cost of correcting or discarding an unusable result. For a report process, the denominator should be reports that passed review and were actually used, not every generation attempt. This prevents a cheap but error-prone setup from looking artificially efficient.

Inspect a representative sample before optimizing. Which prompts resend the same background material? Where does retrieval return irrelevant passages? Which reports are regenerated because a small section needs revision? Address one pattern at a time. A focused edit may be cheaper than a full rewrite, but it still needs a final coherence review. A compact context may reduce usage, but it must preserve constraints and source facts.

### Run a controlled comparison

Choose a small set of real tasks and compare the current and proposed configurations under the same review rubric. Record tokens, wall-clock time, factual corrections, reviewer effort, and accepted outputs. If the lower-cost run loses important caveats or requires more editing, improve the retrieval or brief before rolling it out. Keep the sample and decision rule so the team can revisit it when model prices or capabilities change.

Set spend alerts and an owner for unusual spikes, but leave room for retries and high-value work. Use the scenario tool below to understand arithmetic sensitivity: volume can make a small per-run reduction meaningful, while review overhead can erase it. The number is a planning aid. The decision should follow output quality and useful work completed.`,
  16: `## Reconstruct a recent buying journey

Interview someone who has already made or seriously evaluated a choice. Begin before the vendor search: what changed in their organization, and why did the old approach stop being adequate? Trace the first conversation, alternatives considered, constraints raised by colleagues, and the moment a new option became plausible. Ask what they actually did rather than inviting a prediction about what they might do next year.

Take notes in the buyer's language and separate observation from interpretation. “Our board asked for source links” is evidence; “all CMOs prioritize auditability” is an unsupported leap. Compare several journeys to find recurring situations. People with the same title may be solving different jobs, while people in different functions may share one urgent workflow.

### Turn a job into a content hypothesis

Write a job statement with the triggering situation, desired progress, and outcome. Pair it with the habits and anxieties that keep the buyer in the current process. Then map the next question to content: a walkthrough for implementation risk, a comparison for tradeoffs, or a proof page for credibility. The interactive builder below can help draft wording, but it cannot replace an interview.

Test the language back with buyers. Ask whether it describes their decision accurately, which part feels generic, and what evidence they would need to move forward. Update the job statement when a new segment or buying situation emerges. A JTBD map is a working research artifact, not a claim that the team has found every motive or objection.`,
};
