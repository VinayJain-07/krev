# Synthesia — integration & connection guide

**What it is:** the enterprise avatar-video platform (Express-2 engine) this stack uses for training,
explainers, and localization at scale. **Synthesia renders the presenter; the human approves; WoopSocial
publishes.** Skill: `skills/synthesia/`. Tiers/gates shift — **verify-quarterly** at synthesia.io +
docs.synthesia.io; check gates in-app before committing.

## Connection layers
1. **API (Creator tier and up):** programmatic video generation from templates + scripts — the agent can drive
   it where a key/connection exists (script in, video out; webhook/poll for completion). **No unreviewed
   auto-publish** — the human approves every render.
2. **In-app (human executes):** the agent supplies the fit-test verdict, the locked spoken-word script (SSML
   included), scene/brand-kit plan, localization chain + QA gates, and the plan math; the human generates.
3. **Publish handoff:** export MP4 → `capcut` if captions/pace need work → `scheduling-and-queue` →
   **WoopSocial: upload media → attach → validate → create post** (see `tools/integrations/woopsocial.md`). Training
   content → the LMS via SCORM (Enterprise; human). WoopSocial does not generate avatars or edit video.

## Tiers + gates (≈; verify in-app)
**Free:** 10 min/mo, watermark, ~9 avatars — evaluation only. **Starter ≈ $18/mo annual ($29 monthly):** ~120
min/yr, 125+ avatars, no watermark. **Creator ≈ $64/mo annual ($89):** ~360 min/yr, 180+ avatars, **API**,
interactive video, voice cloning. **Enterprise (custom; low five figures/yr typical):** unlimited minutes, full
library (240+), **SCORM, 1-click translation, Video Agents,** SSO, brand enforcement. **Traps:** minutes/credits
**don't roll over**; largely **non-refundable annual**; custom/Studio avatars ≈ **$1,000/yr per avatar**
(~10-day processing); **comma-level script edits force a full re-render (~8–12 min)** off the cap — lock copy
before generating; reported render/audio-sync failures near deadlines — build buffer.

## The consent architecture (the reason this file exists — from Synthesia's docs)
Stock avatars = **real, paid, consenting actors.** Personal avatars = **identity-verified live consent
recording**; source media is a **single continuous take (1–5 min), never spliced/manipulated**; the consenting
person must match the source. **No celebrities/politicians without authorization; deepfakes, misinformation,
and impersonation prohibited.** Sharing governance: outfits/spaces shareable (use ≠ edit); voice shared
separately. Certifications: SOC 2 Type II, GDPR, ISO 42001, ISO 27701, C2PA membership (Enterprise); customer
data not used for base-model training without written approval. The governance cost: **moderation over-flags
legitimate regulated content** (healthcare/pharma) with 12–24h manual reviews reported — budget for it.

## Fit + routing (honest)
Wins: multilingual L&D/training/onboarding, explainers, FAQ/support, faceless educational series (disclosed),
localization (one master → 140+ languages + AI dubbing + native-speaker QA). Loses: trust-led founder content,
testimonials, emotional persuasion (avatars read clinical) → `talking-head-and-piece-to-camera`; casual
TikTok-native feel → compare `heygen`; cinematic footage → `ai-video`/`luma` (the AI Playground embeds Veo 3.1 for B-roll in-editor — its
Sora 2 lane dies with OpenAI's Sora API on Sept 24 2026); voice-only → `ai-voiceover` (ElevenLabs,
`tools/integrations/elevenlabs.md`).

## Hard lines
Human approves every video · fit test before rendering · consented likeness only — no impersonation or fake
endorsements · **disclosure always** (YouTube altered-content, TikTok AI tag, EU AI Act from Aug 2026, C2PA) ·
locked copy before generation (the re-render trap) · native-speaker QA per localized language · YMYL claims keep
sourcing regardless of the presenter · never state a tier/gate/render-time as immutable fact · WoopSocial does
not generate avatars.
