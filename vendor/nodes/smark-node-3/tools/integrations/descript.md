# Descript — integration & connection guide

**What it is:** the text-based talk-content editor (podcasts, interviews, talking-head, courses) in this stack.
**Descript edits; WoopSocial publishes** the social exports; podcast RSS hosting is separate. Skill:
`skills/descript/`. Plans/credits changed hard in Sept 2025 — **verify-quarterly** at descript.com/pricing and
the in-app meters; treat pre-2025 reviews as stale.

## Connection layers
1. **Public API (2026, open beta) + MCP:** programmatic access to projects, media imports, and **Underlord
   actions — including via Model Context Protocol connections** — so an agent can trigger filler/silence removal,
   clip flagging, show notes, and imports where connected. Actions consume AI credits; batch prompts to conserve.
2. **In-app (human executes):** no connection? The agent writes the cut list (transcript-anchored), Underlord
   prompts, the Overdub decision, and the export/repurpose plan; the human executes on desktop (macOS/Windows) or
   web (near-parity in 2026; cloud sync; **cloud-dependent — no offline editing**).
3. **Publish handoff:** exports (episode, clips, captions) → `scheduling-and-queue` → **WoopSocial** (upload media → attach → validate → create post; per-platform required fields validate atomically — see `woopsocial.md`). RSS/podcast hosts are outside WoopSocial — the human publishes there.

## Plan gates (≈, sources conflict — verify in-app)
- **The Sept 2025 overhaul:** transcription-minutes → **media minutes** (ALL imported media counts) + **AI
  credits** metering Underlord, Studio Sound (~10/use), Overdub, Eye Contact, Green Screen, avatars. Top-ups
  expire in 12 months; documented **bill-shock** pattern and no mid-cycle proration (G2, attributed).
- **Tiers (figures conflict):** Free ≈ 60 media min/1hr + watermark · Hobbyist ≈ $16–24 · Creator ≈ $24–35 ·
  Business ≈ $50–65 (annual ~25–35% cheaper). **Never quote a tier as fact.** SOC 2 Type II; project info
  confidential per Descript.
- **Credit-aware workflow:** import only what you'll edit · Studio Sound once per source · batch Underlord ·
  Overdub words/phrases only · watch the meter.

## The voice-consent spine (the reason this file exists)
**Overdub is consent-verified and own-voice-only by design** — identity verification blocks cloning anyone
else's voice. That is the stack's model for voice cloning generally: never clone a guest, competitor, or public
figure; never type words into a real person's mouth; paid tiers include commercial use of your own consented
clone (verify terms); **AI-disclosure** for synthetic speech where platform/region requires (EU AI Act; C2PA).
Craft limit: words/phrases sound like you; paragraphs drift synthetic — re-record.

## Known limits + routing
Transcription ~92–95% clean English (accuracy pass mandatory; ~75–85% with noise/accents/jargon; ~23 languages) ·
not a beat-synced short-form editor (→ CapCut) · not a cinematic finisher (→ Resolve/Premiere) · not a
transcription-at-scale/compliance service · Automatic Multicam needs separate speaker tracks (record that way on
purpose) · Eye Contact patches an off-camera read, not delivery (→ talking-head-and-piece-to-camera).

## Hard lines
Human verifies by ear + approves every cut (and owns the final cut of anyone else's words) · interview edits
preserve meaning + clip context · own-voice-only cloning, disclosed where required · accuracy pass before
captions ship · never state tiers/credits as fact without in-app verification · WoopSocial does not edit media
or host podcasts.
