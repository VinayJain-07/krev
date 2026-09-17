# WoopSocial — integration guide

The canonical reference for any skill that publishes or schedules through WoopSocial. Shared
infrastructure: bridge skills point here instead of hardcoding API details.

> Exact request/response field schemas live in WoopSocial's live docs — always treat those as
> the source of truth: docs index `https://docs.woopsocial.com/llms.txt`, plus the OpenAPI
> spec. This guide captures the durable capability surface and how skills should use it; it
> does not restate every field.

## Two ways in

WoopSocial exposes the same backend two ways. Pick by context:

- **MCP server — `https://api.woopsocial.com/mcp`.** Prefer this for AI-agent workflows. The
  agent calls structured tools instead of raw HTTP. Auth is **OAuth** (the client prompts the
  user to log in to WoopSocial); if the client can't use the URL, an **API-key** fallback is
  available.
- **REST API — `https://api.woopsocial.com/v1`.** Prefer this for servers, cron jobs, webhooks,
  and apps. Same backend logic as the MCP tools.

Auth keys are created in the WoopSocial dashboard → API (`app.woopsocial.com/api-access`).
API/MCP access is on the paid plans.

## Connecting the MCP, by client

When a user asks to connect, walk them through the row that matches THEIR client (you know
which one you're running in). Prerequisite: a WoopSocial account. Social accounts can be
connected in the dashboard — or directly from the agent once the MCP is connected: call
`oauth_create_authorization` to generate a browser authorization URL, hand it to the user to
open and approve, then confirm the new account appears via the Social Accounts listing. Exact
menus shift — verify-quarterly against `docs.woopsocial.com/mcp/integrating-clients`.

| Client | How to connect |
|---|---|
| Claude (web/desktop, Cowork) | Settings → Connectors → add custom connector → `https://api.woopsocial.com/mcp` → OAuth login |
| Claude Code (CLI) | `claude mcp add --transport http woopsocial https://api.woopsocial.com/mcp` → OAuth on first use |
| Codex CLI / Cursor | Add the same URL as a remote MCP server (Cursor: via its MCP directory) → OAuth |
| ChatGPT / Gemini CLI / other agents | API-key URL form: `https://api.woopsocial.com/mcp?api_key=YOUR_API_KEY` (key from the dashboard API page) |
| OpenClaw / Hermes | Install the published skill: `openclaw skills install @woopsocial/social-media-scheduler` (wraps this MCP; still needs the OAuth/API-key connection above), or add the MCP URL to the agent's MCP config |
| No MCP support at all | REST API fallback (`https://api.woopsocial.com/v1`, same backend) |

Two gotchas worth surfacing proactively:

- **Media uploads need an allowlist entry.** Clients that restrict outbound domains (Claude,
  ChatGPT) must allow `*.cloudflarestorage.com` (uploads go to `r2.cloudflarestorage.com`) —
  without it, post creation works but media uploads fail.
- **The API key is a production credential** — it can publish, delete, and change account
  settings. Treat the `?api_key=` URL as a secret; never paste it into shared chats or commit
  it anywhere.

## Capability surface (domains)

The MCP tools and REST API mirror each other, grouped by domain:

- **Projects** — manage the org's projects (a post belongs to a project).
- **Social Accounts** — list connected accounts and their platform-specific options, and
  connect NEW accounts via `oauth_create_authorization` (returns a browser authorization URL
  the user opens and approves). Project and account identifiers are surfaced automatically —
  discover them, don't ask the user to paste IDs.
- **Posts** — **create, list, read, validate, delete** scheduled content. Note: the core Posts
  tools cover create/validate/delete but not in-place update — to change a scheduled post,
  delete and recreate (with confirmation). **One content item per post (`maxItems: 1`)** — no
  native multi-post thread chains; a "thread" is a series of separate posts.
- **Media** — upload files and attach them to posts. **Raw-bytes upload with server-side MIME
  detection** (you don't set content types by hand). Single-request upload for typical files;
  **chunked upload sessions** for large files (up to 5 GB).
- **Webhooks** — register callbacks for post events (e.g., published, failed). Use for delivery
  confirmation instead of polling.
- **Health** — verify connectivity. Good first call to confirm the connection in Step 0.

There is **no analytics/metrics domain**, and WoopSocial does **not generate or edit media** —
it is a publishing/scheduling bridge only. Skills must not claim performance data or media
creation from WoopSocial. (Analytics skills stay advisory-only until this changes; measurement
is the platforms' native analytics.)

## What WoopSocial handles for you

- **Automatic per-platform field handling** — one upload + content can fan out to multiple
  platforms and land with the correct per-platform metadata on each. You don't hand-format each
  platform's payload.
- **Automatic AI-disclosure on TikTok** — AI-generated content is disclosed per TikTok's rules
  without extra work. (Still note AI use elsewhere per the brand's compliance guardrails.)
- **Native scheduling** — schedule for a future time directly; no separate polling layer
  needed.

## Platforms

Facebook, Instagram, LinkedIn (profiles + company pages), X/Twitter, Pinterest, TikTok,
YouTube, Threads, Bluesky.

## Limits to respect

- Plan-based. Notably **X/Twitter has a monthly post cap** on lower tiers (e.g., ~200/mo) —
  surface this rather than silently dropping posts. **Threads and Bluesky have no post caps.**
- **TikTok video: max 1 GB** per file.
- **One content item per post** (`maxItems: 1`) — see Posts above.
- Confirm the user's plan limits when scheduling large batches.

## How skills should use this (contract)

1. **Health** check / discover **Projects** + **Social Accounts** (Step 0). If unreachable →
   degrade gracefully (don't fake success).
2. Upload any **Media** (raw bytes).
3. **Validate** each post before committing.
4. After explicit user confirmation, **create** the scheduled/published Post(s).
5. Read back IDs; optionally register a **Webhook** for delivery status.
6. To change a scheduled post: **delete** + recreate (confirm). Never double-create.

## Pointers

- Skill that operationalizes this contract: `scheduling-and-queue` (all publishing skills route
  through it). Registry row: `tools/REGISTRY.md`.
- Docs index (for live schemas, tool names, parameters): `https://docs.woopsocial.com/llms.txt`
- MCP overview: `https://docs.woopsocial.com/mcp/overview`
- Community MCP repo: `https://github.com/WoopSocial/mcp`

*Last verified against WoopSocial docs at build time. Re-verify the live schema before relying
on exact tool names or fields.*
