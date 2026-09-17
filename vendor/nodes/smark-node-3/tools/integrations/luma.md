# Luma Dream Machine — integration & connection guide

**What it is:** the cinematic AI video generator (Luma Labs — Ray3 model line) this stack uses for shot
generation, image-to-video, and footage restyling. **Luma generates shots; the human judges; capcut assembles;
WoopSocial publishes.** Skill: `skills/luma/`; the model-agnostic router is `skills/ai-video/`. Models, credit
rates, and tier structures move fast and **sources genuinely conflict — verify-quarterly** at
lumalabs.ai/pricing and the in-app plan pages.

## Connection layers
1. **Dream Machine API + official SDK** (`lumaai-python` — Apache-2.0, Python 3.9+, sync/async): create a
   generation → receive an ID → poll status → download. The agent can drive this where an API key exists. **The
   wallet trap: API credits are billed separately and do NOT transfer from the app subscription** — fund each
   independently. No unreviewed auto-publish regardless of automation.
2. **Web app + iOS (human executes):** no key? The agent supplies shot briefs, reference plans, keyframe
   strategy, and the draft-first credit plan; the human generates in-app.
3. **Publish handoff:** exports → assembly in `capcut` (pace, captions, licensed sound — Luma output is silent)
   → `scheduling-and-queue` → **WoopSocial: upload media → attach → validate → create post** (endpoints/tool
   names live in `tools/integrations/woopsocial.md` — don't hardcode).

## The model line (≈, verify — it moves)
**Ray3** = reasoning model, 16-bit HDR + EXR, keyframes, **character reference**, visual annotation, **Modify**
(V2V) · **Ray3.14** (Jan 2026) = the volume default — native 1080p, ~4× faster, ~3× cheaper at 720p, but **no
character reference or HDR** (fall back to Ray3) · a newer Ray already appears on the official pricing page ·
**Photon** = Luma's image model · **Luma Agents** = the multi-model bundle (Veo 3.1, Kling, image + ElevenLabs
audio models; brief-to-video from DOCX/PDF) — bundle math: worth it at 2–3 models used, overpaying at one.

## Economics (the workflow IS the cost control)
**Draft Mode → Hi-Fi master the winner** — never iterate at delivery quality. Multipliers (≈, attribute): HDR
2×/HDR+EXR 3× the SDR rate; 1080p HDR ≈ **16×** standard 720p; resolution jumps ≈ 4×. Budget ~3 attempts per
usable clip (4–5 for consistency shots). **Monthly credits expire at reset** (plan sessions); top-ups roll over
(~12-month validity reported); Trustpilot skews negative on billing — watch statements.

## Rights + tiers (the reason this file exists)
**Free = watermarked + explicitly NON-commercial.** Whether the cheapest paid tier includes commercial rights
**conflicts across sources**; the uncontested commercial floor is the **Plus-level plan (~$30/mo, annual ~20%
off)** — and **two plan generations coexist** (legacy Dream Machine tiers still billable + 2026 Agents plans
~$30/$90/$300): **verify in-app, never quote a tier as fact.** The overlooked clause: you own outputs, but
**Luma retains a broad license to use your generations for service improvement and marketing** — disclose to
clients where relevant; **Enterprise** adds a data-privacy guarantee (not used for training) — the NDA tier.
High-stakes → counsel (not legal advice).

## Known limits + routing
**No native audio** (sound in post — `ai-music-and-sound`/licensed; sound-native generation → veo-3/kling) ·
5–10s shots (Extend degrades past the initial clip — sequences assemble in capcut) · same-prompt variance >50%
of runs (independent testing) — consistency via references, not re-rolls · avatar/presenter work → heygen/
synthesia · edit-grade control/editing → runway · brand-true stills in → flux/Photon.

## Hard lines
Human judges every clip · no unpermitted real-person likeness (real or AI lookalike) · no photoreal fake-event
footage targeting real people/companies · AI-disclosure where required (EU AI Act; C2PA) · commercial tier
verified before client work; Luma's license-back disclosed where relevant · licensed sound only · never state a
rate/tier as immutable fact · WoopSocial does not generate or edit video.
