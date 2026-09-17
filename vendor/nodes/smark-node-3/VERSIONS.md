# Versions

Version numbers track the plugin/marketplace release (`.claude-plugin/plugin.json`). Bump the
version in `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, AND
`gemini-extension.json` (Gemini CLI extension gallery reads it; keep it matching the release
tag) on every release so plugin users receive updates; attach freshly built `dist/` ZIPs to
each GitHub release.

## v1.0.1 — July 2026

- **Fixed: 70 of 106 skill descriptions exceeded the Agent Skills spec's 1024-character limit**,
  causing claude.ai's skill uploader to reject them ("field 'description' in SKILL.md must be at
  most 1024 characters"). All 106 descriptions are now ≤1000 characters; every skill's trigger
  phrases and sibling routing were preserved (the cut material duplicated content already in
  each skill's body). Added a validator check (`scripts/validate-skills.sh`, check 5/8) so this
  can't regress silently again.
- Rebuilt all 106 skill ZIPs and 17 packs against the compressed descriptions.

## v1.0.0 — July 2026

Initial public release.

- **106 skills across 14 topics** — strategy & foundation, ideas & content angles, copy &
  captions, video scripts, AI video, visual & design, voice & music, editing & clipping,
  platform growth (all 9 platforms), planning & publishing, hashtags & SEO, community,
  influencer & monetization, analytics & optimization.
- Every skill: `SKILL.md` + 3–5 reference files + evals. All facts editorially reviewed and
  web-verified July 2026.
- **19 tool integration guides** (`tools/integrations/`) + registry.
- **17 topic packs** (`scripts/packs.json`) with per-skill ZIPs for claude.ai web upload;
  referenced tool guides are embedded into each skill ZIP at build time.
- Installable via `npx skills add`, Claude Code plugin marketplace, direct copy, ZIP upload
  (claude.ai), OpenClaw, and Hermes.
