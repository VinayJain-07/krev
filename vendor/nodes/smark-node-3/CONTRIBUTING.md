# Contributing

Contributions are welcome — the two highest-value PRs are a **new tool integration** and a
**new skill**. Both have a house pattern; matching it is most of the review.

## The fastest useful PR: add a tool integration

1. Write `tools/integrations/<tool-name>.md` — the connection layer: how to connect/authenticate,
   what the API/tool actually offers, pricing/plan/licensing gotchas. Study
   [tools/integrations/kling.md](tools/integrations/kling.md) for the shape.
2. Add a row to [tools/REGISTRY.md](tools/REGISTRY.md) in the right cluster.
3. Volatile facts (pricing, tiers, legal terms) must be attributed and carry a
   **verify-quarterly** note — never state them as timeless.

## Adding a skill

Every skill is a directory under `skills/` with this exact structure:

```
skills/<skill-name>/
  SKILL.md              # frontmatter (name matches the directory) + the craft
  references/           # 3–5 deep-dive files the agent loads on demand
  evals/evals.json      # test cases
```

House rules the review will hold you to:

- **One skill = one job-to-be-done**, with explicit boundaries and routing to sibling skills.
  The frontmatter `description` is the trigger surface: write the phrases real users say, and
  route near-miss requests to the right sibling by name.
- **Every backticked `skill-name` mention must resolve** to a real directory under `skills/`.
- **Opinionated, current, honest.** Teach how top practitioners actually do the job now — not
  generic best-practice lists. No fabricated stats; attribute volatile figures and tag them
  verify-quarterly. No engagement-bait tactics, ever.
- **Publishing ground truth:** skills hand finished content to a scheduling bridge whose
  capability surface is documented in
  [tools/integrations/woopsocial.md](tools/integrations/woopsocial.md) — don't contradict that
  guide. Notably: it publishes/schedules only (no analytics, no media generation).
  Measurement language: "measurement: the platforms' native analytics."
- **Nothing posts without explicit user confirmation.** Side-effect skills keep the safety
  contract intact.

## Before you open a PR

```bash
./scripts/validate-skills.sh
```

CI runs the same script; a red validator is an automatic revision request. If you add a skill
that belongs in a topic pack, add it to [scripts/packs.json](scripts/packs.json) too (the
validator checks pack integrity).

## Scope

This repo covers organic social media for AI agents. Out of scope: paid-ads campaign management,
platform-API client libraries, and anything requiring credentials to be committed. When in
doubt, open an issue first — happy to scope it with you.
