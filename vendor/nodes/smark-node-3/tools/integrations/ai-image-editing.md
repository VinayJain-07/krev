# AI image editing — integration & engine guide

**What it is:** the edit-routing layer of the stack — inpainting, background removal, upscaling, expand,
restoration — mapped task-first to the right engine. **The engines edit; the human judges at 100%; WoopSocial
publishes.** Skill: `skills/ai-image-editing/`. Engines shift per release — **verify-quarterly**; test on your
own images, not benchmarks.

## The engine map (route by task; verify terms per engine)
| Engine | Lane | Connection | The routing fact |
|---|---|---|---|
| FLUX Kontext / FLUX.1 Fill | complex-mask inpainting, expand, text edits | BFL/fal/Replicate APIs (see flux.md) | best raw quality on large/irregular masks; outputs-vs-service license line applies |
| Adobe Firefly Generative Fill | client/agency deliverables | Firefly API / Photoshop | trained exclusively on licensed content → **IP indemnification** |
| nano-banana (Gemini-class) | conversational multi-step edits | see nano-banana.md | iterate by instruction |
| Canva Magic Eraser/Expand/Grab | quick fixes inside designs | Canva MCP/Connect (see canva.md) | already in the workflow; don't leave it for small jobs |
| Claid-class product tools | e-commerce batch bg-removal/cleanup | vendor APIs | consistent specs across 80-image sets |
| Topaz Gigapixel / Photo AI | **faithful** upscaling, restoration, face recovery | desktop (local processing = privacy) | preserves what's there — the accuracy lane |
| Magnific (Freepik rebranded as Magnific, Apr 2026) | **creative** upscaling — art/renders only | web/API | *hallucinates* detail by design; never products/documents |
| Clipdrop (Stability → Jasper) | bundled utilities (bg, inpaint, denoise) | web/API | breadth over per-task peak quality |

## The canonical chain (order matters)
Best source (reshoot beats repair) → repairs/inpainting at native res (upscale FIRST if the source is low-res)
→ background/object edits → **then** upscale (faithful for real photos; creative for art) → master as
**PNG/TIFF** → platform derivatives → `scheduling-and-queue` → **WoopSocial** (upload media → attach → validate → create post — see `woopsocial.md`).
WoopSocial does not edit, upscale, or remove backgrounds.

## The honesty gates (the reason this file exists)
- **The upscaler split:** creative/diffusion upscalers **invent detail that wasn't in the original** — a
  misrepresentation engine if pointed at products, documents, or evidence. Faithful mode + low creativity for
  anything accuracy-critical; in-image text re-typeset, never upscaled.
- **An edited real photo is an edited claim:** no defect concealment (FTC net-impression); results/comparison
  imagery obeys `before-after-and-transformation`'s rules.
- **People:** commercial body-shape retouching is **label-required** in several markets (France's retouch
  decree; Norway's Marketing Act incl. influencer posts; Israel's 2012 law — verify per market); face
  enhancement on real people stays conservative (identity drift); consent for edits to others' images.
- **Provenance:** no watermark removal, no metadata stripping; AI-disclosure where platform/region requires
  (EU AI Act); source-image license confirmed before editing.

## QA card (run at 100% zoom before anything ships)
Edges/halos · light + shadow direction · perspective/scale of replacements · faces (eyes/teeth/skin) ·
in-image text · batch consistency · identity vs the original on face work · provenance intact · disclosure
applied.

## Hard lines
Human judges every result · task defines the tool · faithful upscaling for accuracy-critical images · no
defect concealment, undisclosed body retouching, watermark removal, or provenance stripping · conservative
face work on real people (the person who knew them judges likeness) · never state an engine capability or term
as fact without verification · WoopSocial does not edit images.
