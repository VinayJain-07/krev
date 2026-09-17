# Veo (Google video) — integration guide

The canonical reference for any skill that generates **video** with Veo — Google DeepMind's
text/image-to-video model. Shared infrastructure: video skills point here instead of restating API
details. (`reels-script` bundles a Veo prompt pack; this guide is the connection layer behind it.)

> Model versions, regions, and pricing change — re-verify quarterly against the official docs, which
> are the source of truth: `https://ai.google.dev/gemini-api/docs/video` and the Gemini Enterprise
> Agent Platform (Vertex) Veo docs.

## What it is

Veo generates high-fidelity short video clips with **natively generated audio** (dialogue, SFX,
ambience) in a single call. As of June 2026 (verify):

- **Veo 3.1** — `veo-3.1-generate-preview`; **Veo 3.1 Fast** — `veo-3.1-fast-generate-preview`.
  Current flagship: **8-second** clips at 720p/1080p/**4K**, native audio, **landscape 16:9 and
  portrait 9:16**, video/scene **extension** (chain Veo clips up to **~148 seconds** total),
  **first/last-frame** control, up to **3 reference images**, and improved **character consistency**
  across scenes. Still **paid preview** on the Gemini API; **GA** endpoints are available via the
  Gemini Enterprise Agent Platform (see Access).
- **Veo 3.1 Lite** — `veo-3.1-lite-generate-preview`. High-efficiency, low-cost lane for
  high-volume/at-scale generation. **No 4K and no Extension** — use the full 3.1 model when you need
  either.
- **Veo 2** — `veo-2.0-generate-001`. Stable GA, **silent** (no native audio); use only if you need
  the older stable lane.

## Access

- **Gemini API** — `https://generativelanguage.googleapis.com/v1beta`, `@google/genai` SDK
  (`generate_videos`). Generation is **asynchronous**: kick off an operation, poll until done, then
  download. (Paid preview — a Gemini API key with billing is required.) The **Interactions API** is
  now GA and is Google's recommended surface for the latest Veo features/models.
- **Google AI Studio** — testing surface (Veo Studio demo app; limited free Veo usage, regional).
- **Gemini Enterprise Agent Platform** (formerly **Vertex AI**) — enterprise/scaled, and where the
  **GA** Veo 3.1 endpoints live; regions include `us-central1`, `us-east4`, `europe-west4`,
  `asia-northeast1` (verify). Consumption-based (per-second) billing. *Migrate any old preview
  endpoints to the GA endpoints to avoid interruptions.*
- **Flow / Gemini app / YouTube Shorts / Google Vids** — no-code surfaces (Veo 3.1 runs in the
  Gemini app and Flow).

API key from **Google AI Studio** or **Google Cloud Console**. Output is **MP4 (H.264 / AAC)**.

## Capabilities & limits relevant to social

- **8s per generation** — the hard limit. For longer, **extend/stitch** clips (each new clip
  continues from the prior one's final second for continuity) up to **~148s** total via Extension.
- **Extension is Veo-only + time-boxed** — you can only extend a video Veo generated; generated
  videos are **stored ~2 days** (referencing one for extension resets its 2-day timer). Not on Lite.
- **9:16 vertical** — native support for Reels / TikTok / Shorts.
- **Native audio** — dialogue and sound without a separate audio pass.
- **Reference images + character consistency** — keep a subject stable across shots.
- **Generation time** ~60-180s per clip (verify); build retries into agentic flows; failed
  generations generally aren't charged.

## How skills use it

`reels-script` writes the script as a production doc (shot · on-screen text · spoken · timing) and
bundles a **Veo prompt pack** mapping beats → 8-second prompts (see
`reels-script/references/veo-prompt-pack.md`). The user generates per beat, then assembles/captions
(CapCut/editor). Hand the finished video to WoopSocial's **Media** domain (raw-bytes upload) to
attach + schedule (see `integrations/woopsocial.md`).

## Compliance — AI-disclosure

All Veo output carries a **SynthID watermark** — it is AI-generated video. WoopSocial
**auto-discloses on TikTok**; for other platforms, follow their AI-content/synthetic-media rules and
the brand's policy. Note EU AI Act synthetic-media disclosure obligations where relevant. Don't put
fabricated claims or fake testimonials in generated video.

## Relationship to other pieces

- **This guide** = the connection/API layer (shared).
- **`veo-3` mini-skill** (Tier 2) = prompt craft for cinematic, audio-aware clips.
- **A skill's bundled pack** (e.g., `reels-script`) = how that skill applies it.

## Skills that use it

`veo-3` (prompt craft, under the `ai-video` router), `reels-script` (veo-prompt-pack),
`tiktok-script`, `youtube-shorts`, `scripting-and-storyboarding`.
