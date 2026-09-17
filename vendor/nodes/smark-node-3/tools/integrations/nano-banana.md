# Nano Banana (Gemini Image) — integration guide

The canonical reference for any skill that generates **images** with Nano Banana — Google's native
image generation in the Gemini models. Shared infrastructure: image skills point here instead of
restating API details. (`carousel-writer` bundles a Nano Banana / Ideogram prompt pack; this guide
is the connection layer behind it.)

> Models, IDs, and pricing move fast — re-verify quarterly against the official docs, which are the
> source of truth: `https://ai.google.dev/gemini-api/docs` (image generation). This guide captures
> the durable surface and how skills use it, not every parameter.

## What it is

"Nano Banana" is **not a separate product** — it's the name for **Gemini's native image
generation**, a small family of image-capable Gemini models. As of mid-2026 (verify):

- **Nano Banana** — `gemini-2.5-flash-image`. Fast, cheap, high-volume.
- **Nano Banana 2** — `gemini-3.1-flash-image` (GA; a `-preview` variant also exists). Launched Feb 2026; adds
  up to 4K; the high-efficiency default for most work.
- **Nano Banana Pro** — `gemini-3-pro-image` (GA June 2026). Best **legible in-image text**
  (multilingual), multi-image composition (blend up to ~14 reference images), complex-instruction
  following, up to 4K. Use when text fidelity or brand consistency matters.

## Access

Treat "Nano Banana API" as a **Gemini API** question:

- **Gemini API** — `https://generativelanguage.googleapis.com/v1beta`, `@google/genai` SDK
  (`generateContent`). The programmatic path. Image returns as base64 `inline_data` inside
  `candidates[0].content.parts` — iterate parts, don't assume an index.
- **Google AI Studio** — testing surface; a free tier (~500 images/day, verify) for prototyping.
- **Gemini Enterprise Agent Platform** (formerly Vertex AI) — enterprise/scaled use.
- **Gemini app / Workspace / Google Ads** — no-code surfaces.

API key from **Google AI Studio** or **Google Cloud Console** (enable the Gemini API; new Cloud
accounts often get trial credit).

## Capabilities relevant to social

- **Text-to-image** for posts, carousel slides, thumbnails, quote graphics, backgrounds.
- **Legible in-image text** (Pro is best-in-class, multilingual) — useful for slides/captions
  baked into the image.
- **Multi-image composition & brand consistency** — blend reference images; keep a product/character
  consistent across a set (key for a cohesive carousel).
- **Conversational editing** — iterate ("change the background", "make the headline bigger").
- **Up to 4K**; Search-grounding for factual/real-world accuracy.

## How skills use it

A skill produces the **slide/image text + a design brief**, fills the prompt skeleton (see
`carousel-writer/references/image-prompt-pack.md`), and either hands the user a ready-to-paste
prompt or, in an agentic setup, calls the API. For a consistent set, reuse one prompt skeleton +
the model's reference/consistency features. Then **hand the media to WoopSocial**: download the
output and upload via WoopSocial's **Media** domain (raw-bytes upload) to attach to a post (see
`integrations/woopsocial.md`).

## Compliance — AI-disclosure

All Nano Banana output carries an invisible (and often visible) **SynthID watermark** — it is
AI-generated media. WoopSocial **auto-discloses on TikTok**; for other platforms, follow each
platform's AI-content rules and the brand's disclosure policy. Never bake **fabricated stats** into
an image.

## Relationship to other pieces

- **This guide** = the connection/API layer (shared).
- **`nano-banana` mini-skill** (Tier 2, under the `image-prompt` router) = prompt craft / driving
  the model well.
- **A skill's bundled pack** (e.g., `carousel-writer`) = how that skill applies it.

## Skills that use it

`carousel-writer` (and `image-prompt`, `thumbnail-design`, `quote-cards-and-text-graphics`,
`infographic-and-data-viz`). Alternative text-in-image engine: `integrations/ideogram.md`.
