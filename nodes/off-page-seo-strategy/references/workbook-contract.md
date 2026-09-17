# Off-Page SEO Workbook Contract

## Required sheets

1. `01_Executive_Dashboard`: formula-driven pipeline, placement, score, and roadmap summaries with a concise decision note.
2. `02_Strategy_On_A_Page`: objective, audience, priority themes/pages, authority gaps, opportunity thesis, risk controls, and success measures.
3. `03_Validated_Prospects`: master-derived platforms that passed endpoint validation, with official URL, category, intended use, validation result, score inputs, total score, band, owner, and next action.
4. `04_90_Day_Roadmap`: sequenced actions for days 1–30, 31–60, and 61–90 with owners, due dates, dependencies, KPIs, automation boundary, status, and progress.
5. `05_Outreach_CRM`: relationship-led outreach pipeline with prospect, page/topic, contact state, pitch angle, status, dates, reply outcome, and placement state. Do not fabricate email addresses.
6. `06_Link_Earnings_Log`: live placements, destination page, anchor type, editorial context, first seen, last checked, referral sessions, conversions, and notes.
7. `07_Linkable_Assets`: evidence-led asset ideas with audience need, unique evidence, distribution angle, target publishers, owner, stage, and KPI.
8. `08_KPI_Tracker`: monthly primary, secondary, and diagnostic KPIs with baseline, target, actual, variance, source, and interpretation.
9. `09_Validation_Registry`: successful and failed master-workflow candidate checks. Failed candidates must not contain clickable invalid URLs.

## Opportunity score

Use editable integer inputs and a formula total:

- Relevance: 0–3
- Authority/trust: 0–2
- Editorial value: 0–2
- Business value: 0–2
- Achievability: 0–1
- Total: sum of the five components, maximum 10

Bands:

- 9–10: A — prioritize
- 7–8: B — strong
- 5–6: C — selective
- 0–4: Do not prioritize
- Blank inputs: Needs review

Never substitute an unverified third-party domain metric for this score.

## Link validation

- Candidate names must originate from the approved master workflow.
- Use only canonical official HTTPS destinations from the application allowlist.
- Validate with a time-bounded HTTP request and follow safe redirects.
- Accept successful responses and access-controlled official endpoints. Reject DNS/TLS failures, timeouts, 404/410 responses, parked domains, unrelated redirects, and destinations outside the allowlist.
- Record canonical URL, checked time, response status, and final host for successful checks.
- The active prospect and outreach tables may reference only successful checks.

## Workbook behavior

- Freeze table headers and enable filters.
- Use table formatting, restrained status colors, and consistent typography.
- Add list validation for status, opportunity type, score inputs, priority band, outreach result, and owner fields where applicable.
- Use formulas for total score, priority band, progress, variances, and dashboard rollups. Do not hardcode calculated totals.
- Use ISO dates for operational tables and human-readable month labels for summaries.
- Hyperlink only validated destinations.
- Keep a visible note that platform inclusion is not a recommendation until relevance and editorial fit are reviewed.
