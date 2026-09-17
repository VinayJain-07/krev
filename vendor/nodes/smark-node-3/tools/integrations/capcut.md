# CapCut — integration & connection guide

**What it is:** the short-form video editor (ByteDance) this stack uses to cut, caption, and pace TikTok/Reels/
Shorts content. **CapCut edits; WoopSocial publishes.** Skill: `skills/capcut/`. Plans, gated features, and terms
shift fast — **verify-quarterly** against capcut.com/pricing and the in-app tier labels.

## Connection layers
1. **No agent connector.** CapCut has no public MCP/API for agent-driven editing — the **agent plans** (cut plan,
   caption spec, sound plan, export spec) and the **human executes** in-app (mobile / desktop / web; cloud sync
   between them). Never pretend automation; never claim to see or judge footage.
2. **Publish handoff:** export MP4 (H.264/H.265; 4K on Pro) → `scheduling-and-queue` → **WoopSocial** (upload media → attach → validate → create post; per-platform required fields validate atomically — see `woopsocial.md`) (TikTok requires privacyLevel, allowComment/Duet/Stitch, isYourBrand, isBrandedContent,
   autoAddMusic — validated atomically). CapCut's direct-to-TikTok publish exists; the WoopSocial split
   (10 platforms, validation, one queue; measurement stays in the platforms' native analytics) is a stated stack choice.

## Plan gates (≈, sources conflict — verify in-app)
- **Free:** core editor + basic AI; ~10-min auto-caption cap/project; free-library assets **personal-use only**;
  export limits vary by surface.
- **Standard ≈ $9.99/mo** (early-2026 restructure; monthly-only) · **Pro ≈ $19.99/mo (~$15 annual):** 4K export,
  full AI suite (~1,200 AI points/mo), vocal isolation, flicker removal, 1TB cloud, commercial asset license.
- **Known frictions (attribute):** features migrate behind Pro over time (**check an asset's tier BEFORE building
  the edit**), and documented billing/cancellation complaints — manage via app store, mind trial windows.

## The two safety spines (the reason this file exists)
1. **The uploaded-content license (June 2025 ToS):** content uploaded/synced to CapCut's servers grants ByteDance
   a nonexclusive, **perpetual, royalty-free, worldwide, transferable, sublicensable** license, plus use of your
   name/image/likeness to identify you incl. sponsored content. Copyright stays yours — it's a license, not
   ownership (state it precisely). It attaches to **uploaded** content → **client/NDA/confidential material:
   local editing only, cloud sync/backup OFF**, or use a licensing-safe editor (Resolve/Premiere). High-stakes →
   counsel (not legal advice). Verify the current terms at capcut.com/clause/terms-of-service.
2. **The music/asset trap:** free-library music/templates = personal-use only; paid tiers broaden the license,
   **but "Commercial use"-labeled tracks are reported cleared for TikTok/CapCut platforms only** — YouTube/IG
   claims still occur. **Verify per track**; safer routes: platform-native licensed audio added in-app at
   publish, licensed external music, or `ai-music-and-sound`. Users are responsible for (and indemnify CapCut
   against) what they upload.

## Hard lines
Human executes + approves every cut · accuracy pass on all auto-captions before shipping · no pirated template
packs or unlicensed songs · no non-consensual lip-sync/deepfake of a real person (real or AI lookalike) ·
AI-disclosure for TTS/avatar voices where required (EU AI Act; C2PA) · long-form (>~15 min) routes to Descript/
Resolve, not CapCut · never state a price/feature gate as fact without in-app verification · WoopSocial does not
edit video.
