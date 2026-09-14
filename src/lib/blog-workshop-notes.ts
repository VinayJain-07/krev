/** Reusable field questions and templates that turn each guide into a workshop reference. */
export const BLOG_WORKSHOP_NOTES: Record<number, string> = {
  1: `## Questions to settle before reporting visibility

### How large should the question set be?

There is no universal number. Start with a panel small enough that someone can inspect every answer and large enough to cover the important buyer stages. Twelve carefully chosen questions can reveal content gaps, but they cannot estimate a market-wide citation share. As the panel grows, keep a stable core for comparison and a separate exploratory group for new language from buyers. Publish the question list and sampling conditions internally so a change in methodology is visible.

### What counts as an improvement?

Define the hierarchy before seeing results. A linked, accurate answer to a relevant buyer question is different from a vague name mention. A correction to a previously inaccurate answer can be valuable even if the overall mention count stays flat. Pair the panel with qualified page behavior: did visitors reach the cited section, continue to documentation, or ask a better-informed sales question? No single metric captures all of that.

## Copy this observation record

For each run, record **question ID**, exact wording, buyer stage, engine and configuration, date, market, full answer, brand mention, cited URLs, claim accuracy, and reviewer note. Add the owned page that ought to answer the question and a proposed improvement. Keep the raw answer separate from your interpretation. On the next review, compare like with like, flag changes to the prompt set, and close each editorial action only after checking the published page itself.`,
  2: `## Questions to settle before acting on a signal

### Does a public question invite a vendor response?

Not automatically. A person may be seeking peer experience, venting frustration, or asking a technical question unrelated to purchasing. Read the community rules and the full thread. If a vendor contribution is acceptable, make it useful on its own: answer the question, state any affiliation, and link only when the resource truly helps. If the context does not support participation, record the learning without contacting the author.

### What if the account looks ideal but timing is unknown?

Keep fit and timing as separate fields. An ideal account can be doing exploratory research with no active project; a smaller organization can have an urgent, well-defined need. An unknown should not be silently converted into a high score. A reviewer can investigate the company context or leave the record in a research queue. The goal is to allocate attention, not manufacture certainty.

## Copy this review note

Use a compact entry: **source and date**, exact problem statement, buyer role if directly known, evidence of timing, relevance to the offer, confidence level, channel rules, and the most appropriate next action. Add one sentence explaining why a different action would be inappropriate. When sales reports an outcome, attach it to the note so future calibration is based on real decisions rather than the original classifier's confidence.`,
  3: `## Questions to settle before expanding the agent system

### What happens when two sources disagree?

Do not ask downstream writers to choose whichever sounds better. Mark the claim unresolved and route it to the accountable owner. Product documentation may govern availability, while a campaign brief governs framing; a dated source can supersede an older one only when its authority is clear. Record the resolution and invalidate outputs that used the old fact. The system should prefer a visible pause over a polished contradiction.

### How much context should each specialist receive?

Enough to complete the task and defend its claims, but not every document in the workspace. Start with approved facts and relevant source passages, then include the audience, goal, exclusions, and output format. Ask the specialist to cite its source facts and list unknowns. Reviewers can request more context when the draft exposes a gap. This is easier to audit than a huge prompt whose useful facts are buried among unrelated pages.

## Copy this handoff contract

Write **task owner**, requested output, audience, approved-facts revision, source links, prohibited claims, required evidence, unknowns, and reviewer. Define what the next step may change and what it must preserve. On completion, store the draft with the source revision and approval decision. If the brief changes, search for all dependent assets and notify their owners before any stale copy reaches a channel.`,
  4: `## Questions to settle in a multi-channel launch

### Should every channel repeat the same message?

They should agree on the product reality and campaign thesis, but each should answer a different buyer question. Repetition without progression creates a journey that feels crowded yet unhelpful. A search guide may explain implementation; a social post may surface the overlooked problem; a follow-up email may link to a precise answer. Review the sequence from the buyer's perspective, including what happens after the click.

### What if a team cannot support the lead claim?

Narrow it, supply evidence, or change the angle. A capability can be true for one plan, region, or workflow without being a universal promise. The campaign brief should state those boundaries, and every channel owner should know where to check them. If the strongest differentiator is still unverified, it is a product or research question, not copy that needs a more persuasive adjective.

## Copy this campaign brief

Use one page with **buyer situation**, decision to support, product promise, three approved proof points, limitations, primary action, and channel roles. Add the source owner and review date for each claim. For each asset, write one buyer question it answers and one link to the next useful piece. Before publishing, ask a reviewer to traverse that journey and note where an offer, timeline, or implementation claim changes without explanation.`,
  5: `## Questions to settle before changing access

### Which bot are we discussing?

Do not treat “AI crawler” as one identity. Providers may distinguish a search-discovery bot, a user-triggered fetcher, and a training crawler. Their published controls and user agents can change. Name the provider, purpose, and exact agent in the access record. Then ask whether the organization wants that purpose to reach the selected page class. A security exception should be scoped to verified traffic, not to any request that happens to claim a familiar user-agent string.

### Why is a page still absent after access is fixed?

The page may be low quality, duplicate another URL, change frequently, be excluded by a different setting, or simply not be selected by the provider. A successful fetch proves that one access barrier has been removed. It does not prove indexing or citation. Continue the audit with the page's visible answer, canonical URL, internal links, and the provider's available diagnostics.

## Copy this URL test record

Record **URL and template**, intended public status, provider and agent, robots result, HTTP status and redirect chain, WAF behavior, rendered main content, structured-data parity, test date, and owner. Attach a log excerpt or test output where possible. Classify the issue as policy, delivery, content, or unknown. After a change, rerun the same request and separately monitor whether discovery behavior changes over time.`,
  6: `## Questions to settle before increasing output

### Can AI draft a tutorial from documentation alone?

It can help organize material, but a draft is not a working tutorial until someone runs it against a supported release. Documentation may omit prerequisites that an experienced engineer supplies unconsciously. Ask the reviewer to begin from a clean account or project and follow only the published steps. If the task requires private access or unreleased behavior, say so rather than inventing a convenient public example.

### How do we avoid duplicate articles?

Group content by developer task and search intent. If two posts both explain the same configuration, improve the canonical guide and redirect the weaker one. A troubleshooting page can coexist when it answers a distinct failure condition. Link between the guide, reference documentation, and migration notes. A content inventory with version and owner makes these relationships visible before a publishing quota creates redundant pages.

## Copy this tutorial acceptance checklist

Include **task and audience**, supported version, prerequisites, exact commands, expected output, one failure case, security considerations, source documentation, technical reviewer, and last verified date. Require a clean-environment run before publishing. After release, watch support tickets and broken-link reports. When an API changes, review every article that names it and record whether the example was rerun or retired.`,
  7: `## Questions to settle before the board meeting

### Which metric belongs on the opening slide?

The one that helps explain the decision, not necessarily the largest number. If the board must approve an acquisition investment, qualified pipeline and its uncertainty may matter more than raw traffic. If the decision concerns retention, existing-customer behavior may be central. Put the conclusion and tradeoff first, then the smallest set of measures that could support or overturn it. The remaining channel diagnostics can live in an appendix.

### How do we show uncertain attribution?

Name the model, window, and limits. A campaign may influence a deal without being its sole cause. Show an observed trend and a plausible contribution separately. If the CRM definition changed or a segment is small, display that caveat beside the chart rather than in an inaccessible data sheet. Directors can make decisions under uncertainty when they can see its shape.

## Copy this slide test

For each slide, write **decision supported**, headline conclusion, source and date, denominator, comparison period, caveat, and owner. Remove a chart if it cannot answer its stated question. Ask an uninvolved reviewer to explain the slide in one sentence and name what would make the conclusion wrong. If they cannot, revise the visual or the claim before the deck is frozen.`,
  8: `## Questions to settle in a combined SEO and AEO review

### Is a mention without a link useful?

It may create awareness, but it does not give a buyer a clear route to verification. Track it separately from a citation. Check whether the mention describes the product accurately and whether a source page exists for the claim. If the answer is inaccurate, correcting the underlying public information can be more important than increasing the number of mentions.

### What if search clicks decline while answer mentions rise?

The two observations can coexist and do not establish cause. Segment by query class, page, and time. Look for changes in search-result presentation, answer format, seasonality, and buyer behavior. A high-level chart may hide that implementation guides gained qualified visits while broad informational pages lost clicks. Report the evidence and remaining uncertainty rather than declaring that one channel replaced another.

## Copy this cross-surface comparison

For each fixed question, record **buyer stage**, owned target page, conventional result and click signal, answer-engine mention, cited URL, factual accuracy, date, and next editorial action. Keep the denominator visible when summarizing. Review the same question across surfaces in one row so the team can see whether a page serves the buyer even when one interface changes its presentation.`,
  9: `## Questions to settle when a page feels vague

### Should we add more schema properties?

Only when they truthfully describe content on the page and serve a supported purpose. A page with unclear product copy will not become clear to buyers because its JSON-LD is longer. Improve the visible explanation first. Then choose an appropriate type and required properties, validate the markup, and compare it with the rendered page. Optional fields should remain empty rather than be filled from guesswork.

### How should we handle planned features?

Separate current capabilities from roadmap statements. State availability, plan, region, and limitations near the visible claim. If a feature is not released, do not list it as an existing capability in structured data or a comparison table. When it ships, update the source fact, page copy, and templates together. This is a governance problem as much as a technical one.

## Copy this page-parity audit

Create rows for **identity**, audience, workflow, capability, offer, and proof. For each, record the visible wording, current approved source, structured-data property if any, and contradiction found. Have product approve factual changes and engineering validate rendered output across representative templates. Mark the audit complete when readers and machine-readable markup receive the same accurate information, not when a proprietary checklist reaches an arbitrary score.`,
  10: `## Questions to settle before a result becomes a headline

### Can we use a customer estimate?

Yes, if it is clearly presented as an estimate, the customer approves the wording, and the method is explained. Do not convert a recollection into a precise before-and-after statistic. If exact data is unavailable, describe the workflow and the customer's qualitative assessment. Readers can still learn whether the situation and intervention resemble their own.

### How much implementation detail should be public?

Enough to make the outcome intelligible without disclosing confidential processes. Name the team, starting problem, major steps, and constraints at an approved level of specificity. A statement such as “we automated reporting” is thin; a sequence showing source collection, review, and sign-off is more useful. Let the customer review operational details before publication.

## Copy this claim ledger

For each proposed sentence, record **claim type**, source, measurement period, unit, customer approver, and limitation. Label it observation, quotation, estimate, or interpretation. A chart requires its own denominator and data owner. Link the final public sentence back to the ledger and set a review date. If the source cannot support the wording, revise the wording before asking design to make the claim visually prominent.`,
  11: `## Questions to settle before a score routes a person

### What does a score of 80 actually mean?

Nothing by itself. It means something only when the dimensions, weights, source quality, and routing action are defined. In the interactive lab, 80 is arithmetic from four equal-weight sliders. It is deliberately not a probability of purchase or a tested precision measure. A real team should compare scores with independently labeled outcomes and inspect false positives by channel before setting operational thresholds.

### Should one weak dimension veto the total?

Sometimes. Evidence confidence is a good example: an apparently urgent statement quoted out of context should trigger verification, not outreach. Eligibility and channel rules can also be hard gates. Define these overrides explicitly so a high aggregate cannot conceal a prohibited action or an unknown identity. Reviewers should see the original source and the reason for every override.

## Copy this scorecard specification

Write **decision being routed**, eligible sources, dimensions and definitions, example evidence for each level, weights, unknown-value handling, hard exclusions, human review step, and feedback fields. Save the first labeled sample before changing weights. On each calibration cycle, report the sample size, reviewer agreement, false positives, qualified outcomes, and what changed in the rubric. Keep the score as a tool for allocating attention rather than a substitute for judgment.`,
  12: `## Questions to settle when copy sounds inconsistent

### Is the problem voice or message?

Ask whether the sentence is factually true before debating tone. “Our platform supports every integration” is a claim problem if the product has limits, even when the sentence matches the brand's confident style. Once the facts are correct, review whether the phrasing fits the audience and channel. Keep separate annotations for accuracy, clarity, tone, and format so the owner of each issue can act.

### How much variation is acceptable?

Variation is useful when a channel serves a different reader task. A concise social post and a detailed implementation guide should not use identical paragraphs. They should share accurate terms, a recognizable degree of directness, and the same boundaries on claims. Use approved examples to show that family resemblance rather than enforcing a fixed sentence template.

## Copy this editorial review card

List **audience and channel**, intended reader action, approved source facts, voice traits, example of a good opening, prohibited claims, accessibility checks, and reviewer. For a sample of drafts, record the exact edit and its reason. At the next guide revision, turn common edits into a before-and-after example. If two editors disagree often, clarify the rule with real copy rather than inventing a more precise-sounding score.`,
  13: `## Questions to settle before claiming differentiation

### What if a competitor makes the same claim?

Look at the underlying workflow and proof. Two vendors can use the phrase “automated reporting” while differing in setup, source traceability, and review controls. Compare documented behavior and buyer tradeoffs, not just headline wording. If both solve the problem well, acknowledge that and focus on the situation where your approach is a better fit. An honest comparison can be more persuasive than a brittle exclusivity claim.

### What if buyers do not recognize the proposed gap?

Treat that as useful research. The feature may be low priority, the language may be unfamiliar, or the need may arise only in a narrower segment. Ask buyers to describe their evaluation criteria and current workaround without prompting them with your preferred term. Either narrow the audience and test again or redirect effort to a more consequential problem.

## Copy this opportunity statement

Write **buyer and situation**, repeated need, dated competitor evidence, your current capability, public proof, unresolved tradeoff, and one testable message. Add a confidence level and the next interview or content experiment. Assign an owner to revisit the claim after competitor releases. A positioning opportunity is ready for a campaign when the buyer cares and the team can show the difference, not merely when a spreadsheet cell is blank.`,
  14: `## Questions to settle before prioritizing a fix

### Which data should decide whether a page is fast?

Use field data for the visitor experience where enough observations exist. Segment the 75th percentile by mobile and desktop, and by meaningful page groups. Lab Lighthouse runs help find causes and prevent regressions, but their controlled environment cannot represent every device or interaction. If field coverage is insufficient, say so and use the lab result as a diagnostic rather than a population claim.

### Why can a lab score improve while users still struggle?

The lab may not trigger the interaction that causes delay, may run on a different device, or may miss an intermittent third-party script. Compare the exact user journey and trace, including the button, modal, or form that feels slow. Field INP can reveal this gap. Keep a record of the build and environment for each lab run so comparisons are fair.

## Copy this performance ticket

Include **affected template and device**, field metric and sample period, representative lab trace, suspected bottleneck, proposed change, owner, and acceptance check. The acceptance check should cover functionality and visual stability as well as speed. After rollout, review field trends when enough new visits have accumulated. Do not turn a recommended Core Web Vitals threshold into a promise of search placement or AI citation.`,
  15: `## Questions to settle before a cost-cutting change

### Which costs belong in the comparison?

Include input and output usage, tool calls, retries, reviewer time, and rejected drafts. A workflow with half the model usage can be more expensive if editors must repair every result. Define an accepted deliverable before measuring cost per output. For a report, that may require correct sources, approved claims, and a usable conclusion rather than simply a generated file.

### When is a larger model or context justified?

When the task needs it and the quality gain exceeds its full cost. A complex synthesis with conflicting evidence may deserve more reasoning and review. A formatting conversion may not. Compare representative tasks under the same rubric, and keep the source packet consistent. If a compact context drops a critical product limitation, the apparent token saving is a false economy.

## Copy this experiment sheet

Record **workflow**, current and proposed configuration, sample tasks, average tokens, retries, reviewer minutes, accepted outputs, common corrections, and decision owner. Run the comparison before changing production defaults. Use the interactive scenario to see how per-run differences scale with volume and overhead, then use the experiment to decide whether that arithmetic reflects actual quality. Revisit the result when provider prices or model behavior change.`,
  16: `## Questions to settle when writing a job statement

### Is a buyer job the same as a feature request?

No. A feature request describes a possible solution; the job describes progress sought in a situation. “Export to slides” might be requested because the buyer needs to defend a quarterly investment decision. Interview around the event, constraints, and desired outcome before turning the requested feature into the entire strategy. A different solution might satisfy the same job better.

### How do we know a job is shared?

Compare several completed or serious buying journeys. Look for recurring triggers, desired progress, and anxieties across interviews, while preserving meaningful segment differences. A vivid quote from one person is a hypothesis, not a universal pattern. Public reviews can suggest questions but should not replace direct evidence from your buyers.

## Copy this interview synthesis card

Record **recent decision**, triggering event, previous workaround, alternatives, desired progress, people involved, anxiety, proof needed, and verbatim supporting quote. Write a job statement only after linking it to the source notes. Test the wording back with buyers and map it to content that answers the next decision question. The interactive builder can organize language, but it cannot confirm that a statement reflects a market.`,
};
