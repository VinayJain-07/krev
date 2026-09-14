# Smark Connect

Smark Connect is a multi-company, BYOK AI CMO application. A user connects a supported AI-provider key, adds a public company URL, and receives six evidence-led analyses plus a specialist agent workspace.

## What runs for each company

The first audit crawls up to 20 public pages, captures a lightweight Python HTTP timing baseline, and runs these six documents concurrently:

1. Company Intelligence
2. SEO Audit
3. GEO and AI Visibility Audit
4. Competitor Analysis
5. Audience Analysis
6. Content Audit and Strategy

X, Reddit, Articles, and LinkedIn agents then run concurrently against the shared company foundation. The AI CMO produces a final cross-document synthesis. Campaign Planner, Instagram, YouTube, Creative and Visual, UGC and Influencer, Email and Newsletter, Paid Media, and Community agents are available on demand.

The orchestration registry embeds 55 skill files from the sibling `claude-seo-main`, `openclaw-marketing-skills-main`, and `skills-main` repositories. Referenced skill dependencies are loaded within a bounded prompt budget, and every run stores its skill and source provenance.

## Documents

Each core document includes:

- An in-app professional reading view
- A focused-edit toggle that limits context and reduces token use
- A full-regeneration option that reloads website evidence and embedded skills
- Version history in PostgreSQL
- A deterministic artifact manifest based on report type and structured-data signals
- A branded source-of-truth PDF with in-app preview
- A native, editable executive PPTX with conclusion-led slides and source notes
- An operational XLSX when the report contains reusable records, schedules, URLs, scores, competitors, ownership, or tracking data

PDF preview generation uses an in-page report skeleton with matching report geometry, progressive construction stages, a reduced-motion mode, an explicit ready state, and a recoverable retry state. Every PDF type has its own visual report profile and is quality-checked for at least 30% visualized analysis sections. The same concise company brief and skill typography hierarchy appear in the web report and exported PDF.

All three formats originate from one normalized report data model. Source IDs, finding IDs, and recommendation IDs are reused across the PDF roadmap, PPTX priorities, and XLSX action tracker. Report profiles in `src/lib/artifacts/config.ts` determine compulsory artifacts, primary format, visual theme, target slide count, required visuals, and workbook sheets; auto-detection enables optional workbooks only when the report contains operational value. Company-wide XLSX export remains available explicitly with `scope=company`, while normal downloads stay report-specific.

## Self-hosted Lighthouse audits

The Analytics pane automatically runs the saved company website through local Chromium using Puppeteer Core and Lighthouse, covering performance, accessibility, SEO, and best practices. There is no second URL-entry dialog.

### API

`POST /api/lighthouse/audit`

```json
{
  "url": "https://example.com",
  "strategy": "mobile",
  "fresh": false
}
```

The authenticated endpoint validates a public HTTP(S) URL, blocks local/private/reserved destinations, revalidates redirect targets, prevents active duplicates, applies a per-user rate limit, checks the 24-hour PostgreSQL cache, creates a job, and returns `202` with a job ID. Set `fresh` to `true` to bypass only the completed-result cache.

`GET /api/lighthouse/audit/:jobId` returns `queued`, `running`, `completed`, or `failed`, plus the completed report or a stable error code. The browser client polls this endpoint every 2.5 seconds.

The worker is an in-process, concurrency-one queue intended for one Render web-service instance. Multiple instances require a distributed queue and worker lock. Jobs and cached results are stored in PostgreSQL; no audit result depends on Render's ephemeral filesystem.

Exports follow the approved Smarketers cream, blush, violet, and Arial visual system.

## Token planning

The default workspace budget is 2,000,000 tokens. A complete company run is estimated at roughly 180,000–300,000 tokens depending on page volume, skill dependencies, provider tokenization, and generated depth. Plan for about 6–8 full company scans, with focused document edits consuming substantially less. The dashboard tracks actual application estimates across all companies.

## Run locally

Requires Node 20+ and pnpm 10+.

1. Install packages: `pnpm install`
2. Start local Postgres: `pnpm db:dev`
3. Create `.env` and `.env.local` with the printed database URL plus:

   ```env
   AUTH_SECRET="replace-with-a-long-random-value"
   AUTH_URL="http://localhost:3000"
   SECRET_ENCRYPTION_KEY="base64-encoded-32-byte-key"
   ```

4. Apply the local schema: `pnpm db:push`
5. Seed the full demo workspace: `pnpm seed`
6. Start development: `pnpm dev`

Open [http://localhost:3000](http://localhost:3000).

The private activity dashboard is at `/admin`. Set `ADMIN_PASSWORD_HASH` in `.env.local` to a bcrypt hash of the admin password, then sign in there. Generate a hash with `node -e 'console.log(require("bcryptjs").hashSync("YOUR_ADMIN_PASSWORD", 12))'`. In `.env.local`, escape each `$` in the hash as `\$` so Next.js does not expand it as a variable; managed hosting environment fields accept the hash unchanged. Keep the hash out of Git. The dashboard shows registered users and their companies, plus sign-ins and company views recorded after activity tracking was enabled.

For a conventional PostgreSQL database with migration history, use `pnpm db:deploy` in production.

## Demo account

- Email: `demo@thesmarketers.com`
- Password: `Demo@123`

Demo mode displays the populated workspace but never sends the placeholder provider credential to an external AI service. Create a normal user and connect a real provider key to run fresh analyses and edits.

## Quality checks

```bash
pnpm skills:validate
pnpm artifacts:qa
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm smoke # requires the built app to be running on AUTH_URL
```

The Lighthouse test suite covers URL safety, cache reuse and expiry, duplicate jobs, overall timeout behavior, Chromium cleanup on success and failure, unreachable websites, mobile and desktop configuration, and completed report rendering.

## Production requirements

- Managed PostgreSQL `DATABASE_URL`
- Unique `AUTH_SECRET` and `SECRET_ENCRYPTION_KEY`
- `ADMIN_PASSWORD_HASH` for the private activity dashboard
- The three skill repositories available as sibling directories, or an equivalent packaged skill volume
- Provider API keys supplied by each user
- Chromium at `PUPPETEER_EXECUTABLE_PATH` or `CHROME_PATH` (the Docker image configures `/usr/bin/chromium`)
- Optional `LIGHTHOUSE_RATE_LIMIT_PER_HOUR` (default `5`) and `LIGHTHOUSE_MAX_QUEUE_DEPTH` (default `5`)
- Approved OAuth applications before enabling external publishing or first-party platform connectors

## Container deployment

The production image is Linux-based and includes Chromium plus the Python report renderer used by PDF exports. The required skill repositories are vendored under `vendor/skill-repositories` so runtime file loading does not depend on sibling folders outside the application.

Build and test the image locally with Docker Desktop:

```bash
docker build -t smark-connect .
```

For Render, create a PostgreSQL database and a Docker web service from this repository. Set `DATABASE_URL`, `AUTH_SECRET`, `SECRET_ENCRYPTION_KEY`, `ADMIN_PASSWORD_HASH`, and the public Render URL as `AUTH_URL`. For the Google-hosted audit provider, also set `PAGESPEED_INSIGHTS_API_KEY` and optionally `SPEED_AUDIT_PROVIDER=pagespeed`; when the key is present, PageSpeed Insights is selected automatically. The Docker `CMD` runs `pnpm start`; its `prestart` lifecycle automatically runs `prisma migrate deploy` before Next.js starts, so the free tier does not need a pre-deploy command. The server reads `process.env.PORT` and binds through `HOSTNAME=0.0.0.0`. Configure `/api/health` as the health-check path. The image includes Chromium, its Linux dependencies, and the Python PDF renderer. No API key is required when using the self-hosted provider.

On Render's free tier, Chromium cold starts and constrained CPU/memory can make audits slow, and the service may spin down between requests. The one-audit worker protects the instance, but queued in-process work is not durable across a restart; job records remain in PostgreSQL and may need a retry after an interrupted deployment or spin-down. Use one instance with the current queue design.

The Python URL timing result remains visible as a basic fallback. It reports HTTP status, response timing, and HTML transfer size, and is explicitly not labeled as Lighthouse.

Never commit `.env`, `.env.local`, database credentials, or provider keys.

Backlink counts, Search Console index coverage, live social threads, and answer-engine citation share are never fabricated. Their interfaces explicitly remain unavailable until an approved official or first-party source is connected.
