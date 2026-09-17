# Canva — integration & connection guide

**What it is:** the brand-aware design platform (editor + Sheets + Code + Video 2.0 + Affinity) this stack uses
to render on-brand social assets at scale. **Canva renders; WoopSocial publishes.** Skill: `skills/canva/`.
Everything below is volatile — **verify-quarterly** against https://www.canva.dev and the in-app plan pages.

## Connection layers (use the highest one available)
1. **Canva MCP server / AI Connector** — the agent operates Canva conversationally from inside Claude (since Jul
   2025), ChatGPT, or Copilot: create designs, resize, adapt, summarize; **Brand-Kit-aware since Jan 2026** (it
   reads the Brand Kit when generating). Best for: agent-driven creation/adaptation in a chat workflow.
2. **Connect APIs** (https://www.canva.dev) — programmatic integration: **Design Editing API** (GA — read/update
   layout + elements), **Resize API**, **Assets API** (incl. video import), **Design Import by URL**, **Data
   Connectors** ("Magic Studio at Scale" — live data → bulk on-brand output), Get User Capabilities (gate features
   by plan). OAuth-based; build only what the workflow needs.
3. **In-app (human executes)** — no connector? The agent writes exact specs/steps (template intent, fields, copy,
   sizes); the human executes in Canva. Never pretend automation that isn't connected.

## Plan gates that matter for this stack (≈, verify-quarterly)
- **Free:** tight AI limits; 1 Brand Kit (3 colors); fine for evaluation, not production volume.
- **Pro (≈$12–15/mo):** full Magic Studio, deep Brand Kit, **Bulk Create**, Magic Resize, Affinity AI features.
- **Teams/Business (≈$10/seat, 3-seat min+):** brand controls, **template locking + approvals** (how scale stays
  on-brand across people), higher AI allowances; upper tiers bundle Leonardo.Ai + Flourish.
- **Credits:** figures conflict across sources (flat-500 vs tiered allowances) — **trust only the in-app credit
  tracker** (added Mar 2026). Ultra-tier AI (Canva AI 2.0) burns allowance fastest.

## Feature availability cautions
- **Magic Layers**: staged rollout (US/UK/CA/AU as of mid-2026) — check availability before promising it.
- Dream Lab image quality < dedicated generators (Midjourney-class); route pure-quality hero imagery to
  `image-prompt` + the image tools and drop results into Canva.
- Magic Write = second-pass editor; the voice comes from `voice-builder`.

## The stack workflow (canonical)
`brand-profile`/`design-and-templates` → Canva (Brand Kit → master template → Bulk Create/Resize) → human
approves → export (correct format/size per platform) → `scheduling-and-queue` → **WoopSocial** (upload media → attach → validate → create post; per-platform required fields validate atomically — see `woopsocial.md`). Canva's own Content
Planner exists; this stack publishes via WoopSocial for the 10-platform set + validation + one queue — a stated
choice, not a Canva limitation.

## Hard lines
Human approves every visual · no watermark-stripping / template-ripping / license evasion · no brand
impersonation or unpermitted likeness (real or AI lookalike) · AI-disclosure for generated visuals where required
(EU AI Act; C2PA) · accessibility floor before export (WCAG contrast, sizes, ≤2 fonts, alt text) · never fabricate
credits, availability, or capabilities — verify in-app · WoopSocial does not generate or edit designs.
