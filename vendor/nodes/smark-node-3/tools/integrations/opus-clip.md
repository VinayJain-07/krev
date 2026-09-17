# OpusClip — integration & connection guide

**What it is:** the AI clip-finder (opus.pro) this stack uses to turn long video into short-clip candidates.
**OpusClip finds + cuts candidates; the human approves; WoopSocial publishes.** Skill: `skills/opus-clip/`;
the general craft lives in `skills/captions-and-clipping/` (`clipping.md` covers the multi-tool clipping
layer; this file goes deep on OpusClip itself). Tiers/gates shift and sources conflict — **verify-quarterly**, confirm in-app.

## Connection layers
1. **API — reported Business-tier (custom pricing) only.** Below that, no direct agent automation of OpusClip
   itself; never claim it. **Zapier/Make integrations** exist for parts of the flow (e.g. new-clip triggers) —
   usable on lower tiers, **always with human review in the loop** (no unreviewed auto-post pipelines on any
   tier; a ~40% discard rate makes review non-negotiable).
2. **In-app (human executes):** the agent supplies the pipeline plan — genre/length settings, negative prompts
   ("exclude intros, audio checks, sponsor reads"), moment-search phrasing, the triage plan, the per-clip QA
   checklist, caption fixes, the drip schedule — and the human runs it.
3. **Publish handoff:** approved exports → `scheduling-and-queue` → **WoopSocial** (upload media → attach → validate → create post; per-platform required fields validate atomically — see `woopsocial.md`). OpusClip's own scheduler exists; the WoopSocial split
   (10 platforms, validation, one queue; measurement stays in the platforms' native analytics) is a stated stack choice.

## Credit mechanics (the billing trap — attribute)
**1 credit = 1 minute of SOURCE video processed, regardless of clips out.** +1 credit per direct X post (refunded
on failure). Trim sources before upload; don't process what you won't clip; map monthly source-minutes to the
tier first (weekly 60-min show ≈ 240 min/mo). Reported patterns (Trustpilot, attributed): failed processing
eating credits before refunds; **projects vanishing after subscription ends — download exports promptly**;
cancellation friction — manage billing deliberately.

## Tiers (≈, conflicts noted — verify in-app)
**Free** = evaluation only: 60 min/mo, watermark, 3-day clip expiry, 9:16 only, **no score, no editor.**
**Starter ≈ $15/mo:** 150 min, score, basic posting. **Pro ≈ $29/mo (~$14.50 annual):** 300 min, all aspect
ratios, scheduler, AI B-roll, XML export to Premiere/Resolve, team workspace — the real production tier.
**Business:** custom; API access. **Editor gating conflicts across 2026 sources** (Starter-included vs Pro-gated)
— confirm in-app before subscribing.

## Feature + reliability cautions
The **Virality Score (0–99)** is a proprietary prediction: the one independent test (BIGVU) found **~40% of
clips discarded** and the score **regularly mispredicting** — triage only, never truth, never quoted as a metric.
Captions ~97% **vendor-claimed** — QA names/jargon. No burned-in-subtitle sources (overlap). Prefer auto-music
OFF → licensed or platform-native audio at publish. Reported processing hangs ("stuck at 96%"), **no public
status page or SLA** — build slack into deadlines. SOC 2 Type II.

## Hard lines
Human reviews every clip (stands alone / fair to the speaker / serves the audience) before publish · no
unreviewed auto-post pipelines · no out-of-context clips or manufactured endorsements (deception/defamation;
consent + likeness rules) · the score is never a guarantee or an auto-delete threshold · never state a
tier/gate/capability as fact without in-app verification · WoopSocial does not clip, edit, or score video.
