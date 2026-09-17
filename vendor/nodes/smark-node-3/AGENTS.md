# Working on this repo (for agents and humans)

This repo is a library of **106 social media skills** (`skills/`) plus **tool integration
guides** (`tools/integrations/` + `tools/REGISTRY.md`). Skills follow the
[Agent Skills](https://agentskills.io) convention: a directory with `SKILL.md`
(frontmatter `name` matching the directory + a long routing `description`), `references/`
deep-dives, and `evals/evals.json`.

## Before committing anything

```bash
./scripts/validate-skills.sh
```

It checks structure, frontmatter, evals JSON, cross-reference resolution, pack integrity, and
banned claim patterns. CI runs the same script on every PR.

## Ground truths (do not contradict these anywhere)

- Skills route publishing through a **scheduling bridge**; its canonical capability surface
  lives in [tools/integrations/woopsocial.md](tools/integrations/woopsocial.md) — treat that
  guide as the source of truth and never restate its specifics (platform list, limits, caps)
  from memory.
- The bridge **publishes/schedules only**: it has no analytics surface and does not generate
  or edit media. House phrasing wherever measurement comes up:
  "(measurement: the platforms' native analytics)."
- One content item per post; changing a scheduled post = delete + recreate, confirmed.
- **Nothing is scheduled, published, or deleted without explicit user confirmation.**
- The validator (`scripts/validate-skills.sh`) enforces the common violations mechanically.

## House style for skills

- One skill = one job-to-be-done; explicit sibling routing in the description (the trigger
  surface); every backticked `skill-name` must resolve to a real `skills/` directory.
- Opinionated, anti-hype, current: teach how top practitioners do the job now. Never fabricate
  stats; attribute volatile figures with a **verify-quarterly** tag. No engagement-bait.
- Reference-file pattern: `scope-and-connections.md`, a `<topic>-2026-reality.md`, a named
  framework file, a recipes/templates file.

## Build tooling

- `scripts/build-skill-zips.sh` — one self-contained ZIP per skill into `dist/` (embeds each
  skill's referenced tool guides under `references/tools/`).
- `scripts/build-packs.sh` — topic-pack bundles into `dist/packs/` from `scripts/packs.json`.
- `dist/` is generated and gitignored; rebuild before each release and attach to it.

## Releases

Bump `version` in `.claude-plugin/plugin.json` **and** `.claude-plugin/marketplace.json`, add a
`VERSIONS.md` entry, tag, and attach fresh `dist/` ZIPs to the GitHub release.
