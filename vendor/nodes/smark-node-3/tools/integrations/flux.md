# FLUX (Black Forest Labs) — integration & connection guide

**What it is:** the image generation + in-context editing model family this stack uses for photorealistic,
typographically-clean, reference-consistent imagery. **FLUX generates/edits; the human judges; WoopSocial
publishes.** Skill: `skills/flux/`; the model-agnostic router is `skills/image-prompt/`. Variants and license
terms shift per release — **verify-quarterly** at bfl.ai, docs.bfl.ai, and the Hugging Face model cards.

## Connection layers
1. **Hosted APIs (the easiest commercial path):** BFL API (docs.bfl.ai) or third-party endpoints (fal, Replicate,
   Together, Cloudflare) — pay-per-image, commercial license handled, **cryptographically-signed provenance
   metadata applied**, non-removable CSAM/NCII filters (Hive/Microsoft). The agent can call these where an API
   key/connection exists; REST, async webhooks on some providers.
2. **BFL Playground:** browser, zero-setup — for prompt iteration and evaluating fit before committing.
3. **Self-host (ComfyUI / diffusers):** FLUX.2 [dev] 32B (quantized runs on an RTX 4090 w/ remote text encoder),
   [klein] 4B (~13GB VRAM, sub-second), FLUX.1 [schnell]/[dev]/Kontext [dev]. The agent supplies prompts/edit
   instructions; the human runs the pipeline.

## The variant × license map (≈, verify-quarterly)
| Variant | Access | License |
|---|---|---|
| FLUX.2 [pro] / [flex] / [max] | API | Commercial via API terms ([max] adds web-grounded generation) |
| FLUX.2 [dev] (32B) | Open weights | **Non-commercial for self-hosted services; OUTPUTS commercial-OK** |
| FLUX.2 [klein] 4B | Open weights | **Apache 2.0** (9B klein = non-commercial) |
| FLUX.1 [schnell] | Open weights | **Apache 2.0** |
| FLUX.1 [dev] / Kontext [dev] | Open weights | Non-commercial (same outputs-vs-service line) |

**Self-host commercial tiers (bfl.ai/licensing, attributed):** Builder ≈ 10K img/mo, single-domain
internal/marketing, **not client work** · Platform ≈ 100K/mo · **Professional ≈ 100K/mo — up to 3 client
domains included, per-client fees beyond** · Enterprise = custom. **The [dev] license requires content filters or manual review in deployment — BFL
states it may approach known deployers at random to verify.** High-stakes → counsel (not legal advice).

## Capability notes (FLUX.2 era)
Multi-reference: up to ~8–10 images/call → campaign-consistent characters/products with no fine-tuning ·
in-context editing (Kontext line): targeted changes, rest intact, chain small edits · 32k-token prompts (scene
briefs, not tags; [dev] benefits from prompt upsampling) · **hex color codes as parameters** (brand-exact) ·
clean typography (quote exact text; character-verify before shipping) · up to 4MP · photorealistic
lighting/physics.

## The stack workflow (canonical)
`image-prompt` (router/craft) + `brand-profile`/`design-and-templates` (hex codes, type) → FLUX generate →
multi-reference for sets → in-context edits for the last 5% → human judges (side-by-side drift review) → export →
`scheduling-and-queue` → **WoopSocial** (upload media → attach → validate → create post; per-platform required fields validate atomically — see `woopsocial.md`).

## Hard lines
Human judges every render · rights verified for the variant actually used (outputs-vs-service line; filter
obligation on [dev]) · no unpermitted real-person likeness (real or AI lookalike) · no cloned competitor ads/
trade dress or copyrighted characters · **never strip provenance metadata** · AI-disclosure where required (EU AI
Act; C2PA) · rendered text character-verified · no invented statistics (data viz → infographic-and-data-viz
rules) · never state a license/price/benchmark as fact without verification · WoopSocial does not generate or
edit images.
