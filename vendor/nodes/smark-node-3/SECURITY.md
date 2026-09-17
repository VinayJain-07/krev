# Security Policy

This repository contains Markdown skill files and small build scripts — no runtime code,
no dependencies, no credentials. The main security consideration for users is that skills
instruct AI agents: review any skill before installing it, exactly as you would a script.

## Reporting

Found something concerning — a skill that could induce unsafe agent behavior, a prompt-injection
vector, or an issue in the build scripts? Please report it privately via
[GitHub Security Advisories](https://github.com/social-media-skills/skills/security/advisories/new)
rather than a public issue. We aim to respond within 72 hours.

## Scope

- Skills that could cause an agent to act without user confirmation, exfiltrate data, or
  follow instructions embedded in fetched content — highest priority.
- Build/validation script issues (`scripts/`).
- Out of scope: the behavior of third-party tools the skills describe (report those upstream).
