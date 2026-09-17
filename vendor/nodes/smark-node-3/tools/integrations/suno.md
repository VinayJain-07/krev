# Suno — integration & connection guide

**What it is:** the AI music generator (v5.5 + Suno Studio) this stack uses for owned brand sound — themes,
stings, scores, jingles. **Suno generates; the human's ears judge; the track scores the edit; WoopSocial
publishes the content.** Skill: `skills/suno/`; the router is `skills/ai-music-and-sound/`. The legal terms
here changed materially in late 2025 and keep moving — **verify-quarterly** against suno.com's live
Terms/Help Center; treat pre-Warner-deal reviews as stale on rights.

## Connection layers
1. **API (2025 release; Python/Node libraries; Zapier/Make integrations):** the agent can drive generation
   where a key/connection exists — tier gating for API access **conflicts across sources** (Enterprise-only vs
   paid-tier reports): verify before promising automation. No auto-publishing of unheard audio — the human's
   ears approve everything.
2. **In-app (human executes):** the agent supplies the brief (genre + mood anchor + instruments + vocal spec),
   meta-tag structure, exclude-styles, lyrics, the consistency plan, and the archive checklist; the human
   generates, curates, and exports.
3. **Handoff:** WAV/MP3 exports → `capcut` (scoring the edit — replacing its license-trap library music) or
   `podcast-and-audiograms` (stings) → the finished content → `scheduling-and-queue` → **WoopSocial: upload
   media → attach → validate → create post** (see `tools/integrations/woopsocial.md`). WoopSocial does not
   generate audio or mix it into video — score the edit before upload; **trending audio is native-only.**

## Tiers (≈; verify in-app)
**Free:** 50 credits/day (~10 songs) — **strictly non-commercial, forever** (no retroactive rights after
upgrading; regenerate keepers on a paid plan). **Pro ≈ $8/mo annual (~$10 monthly):** 2,500 credits (~500
songs), commercial rights, Personas, Voices, stems, uploads. **Premier ≈ $24/mo annual ($30):** 10,000 credits
+ **Studio** (browser DAW: multitrack, 12 zero-bleed stems, MIDI export) — same legal rights as Pro; the extra
buys volume + tooling. Credits don't roll over; top-ups persist but need an active sub.

## The rights spine (the reason this file exists — attribute; verify-quarterly)
- **Litigation live:** Warner **settled + partnered (Nov 2025)**; **UMG + Sony still suing** (fair-use
  summary-judgment hearing July 2026; GEMA verdict in Germany mid-2026). **No indemnification** — commercial
  rights don't include legal defense; favor **generic style language over artist references.**
- **Post-Warner terms:** "you own it" → **granted commercial rights** (Suno remains functionally the author);
  free commercial downloads removed; paid download caps described as forthcoming; **pre-deal models scheduled
  for deprecation** when licensed models ship — **archive WAVs/stems/MIDI now**; artist **opt-in**
  (compensated, artist-controlled) is the consent path for artist voices — never prompting or cloning.
- **Protectability:** purely-AI music **isn't copyrightable** (prompting ≠ authorship); human elements
  (original lyrics, re-recorded parts over stems, DAW arrangement) strengthen claims and reclassify as
  **AI-assisted** for distributors.
- **Disclosure:** **DDEX AI flag required at distribution** (Spotify/Apple enforcement since late 2025);
  **no PRO registration** (ASCAP/BMI) for pure-AI works; AI-disclosure on content where platform/region
  requires (EU AI Act).

## Known frictions (community-reported; attribute)
Post-May-2026 **Persona/Voice regressions** (voices reverting to genre defaults — test before client promises)
· Studio's **failed stem regenerations still deducting credits** (batch deliberately; export to a DAW) · **ISRC
self-upload blocking** on users' own distributed tracks · performance honesty: one firm's data shows fully-AI
tracks underperform human releases on saves ~25–40%.

## Hard lines
Human ears judge every track · paid tier before anything commercial · never clone a real artist's voice or fake
a collab · litigation-aware prompting (generic styles) · DDEX AI flag at distribution; no PRO registration for
pure-AI · archive keepers ahead of deprecation · never state a tier/legal status as immutable fact ·
WoopSocial does not generate, mix, or license audio; trending audio is native-only.
