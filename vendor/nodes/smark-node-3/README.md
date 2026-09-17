# Social Media Skills

**Give your AI agent the skills of a top-1% social media team. 106 of them, free.**

Install these and your agent stops giving generic social media advice and starts doing the
actual work: it learns your brand and voice, plans your content calendar, writes LinkedIn
posts that win the "see more" tap, scripts Reels that hold watch-through, briefs your
thumbnails and pins, grows each platform the way that platform actually works — and when
everything's ready, gets it posted, on your explicit go.

- **It sounds like you.** Every skill reads your brand profile and voice guide before writing
  a word — no interchangeable AI-slop, no engagement bait, no fabricated stats.
- **It knows this year's playbook, not 2023's.** Each skill encodes how top practitioners work
  right now — the algorithms, formats, and platform mechanics — fact-checked and kept current.
- **It covers the whole job.** Strategy, planning, writing, video, design, growth, community,
  analytics: 106 skills across 14 topics that know about each other and hand work to the right
  specialist, from brand foundation to published post.

> ⭐ **If this is useful, star the repo** — it's how these skills reach more agents.

## Quick start

**One command (recommended)** — the [skills CLI](https://github.com/vercel-labs/skills). For
Claude Code, this installs all 106 skills globally, no prompts:

```bash
npx skills add social-media-skills/skills -g -a claude-code -s '*' -y
```

For a different agent, swap `-a claude-code` (or `-a '*'` for every agent you have; run plain
`npx skills add social-media-skills/skills` for the interactive picker). One skill only: use
`-s reels-script` instead of `-s '*'`. Alternatively,
[SkillKit](https://www.npmjs.com/package/skillkit) installs across 40+ agents:

```bash
npx skillkit install social-media-skills/skills
```

**Claude Code plugin** — install once, get updates automatically:

```
/plugin marketplace add social-media-skills/skills
/plugin install social-media-skills@social-media-skills
```

**Manual copy (Claude Code / Claude Desktop)**

```bash
git clone https://github.com/social-media-skills/skills.git social-media-skills
cp -r social-media-skills/skills/* ~/.claude/skills/
```

Downloaded the ZIP instead? Unzip it, then copy the same way. Prefer a lighter install? Copy
just the starter set and add more as you need them:

```bash
cd social-media-skills/skills
cp -r brand-profile voice-builder audience-research content-pillars content-calendar \
      hook-writer caption-writer short-form-video-script cross-platform-repurposing \
      engagement-routine platform-specs-and-validation scheduling-and-queue ~/.claude/skills/
```

**Keep it updated** — plugin installs update themselves; for a copied install, `git pull` and
re-copy, or add the repo as a git submodule. Prefer your own tweaks? Fork it — the license is
MIT and [CONTRIBUTING.md](CONTRIBUTING.md) documents the house pattern.

**Claude app (claude.ai on web or mobile — no terminal needed)**

Custom skills work on every Claude plan, uploaded one skill at a time. The easy path is a
**topic pack** — one download with ready-to-upload ZIPs for a complete job, plus step-by-step
instructions inside:

| Pack | What it covers |
|---|---|
| **Social Media Starter Kit** | Brand setup, voice, calendar, first posts, scheduling |
| **Content Calendar & Planning** | The living calendar, batch planning, campaigns, seasonal moments |
| **Post Writing Essentials** | Hooks, captions, text posts, threads, carousels |
| **LinkedIn Growth** | The growth system, posts, company pages, strategic commenting |
| **Instagram & Reels Growth** | Growth, Reels scripts, Stories, carousels, keyword SEO |
| **TikTok Growth** | Growth, scripts, photo mode, publishing config, trends |
| **YouTube Creator Kit** | Long-form, Shorts, metadata, thumbnails |
| **X / Twitter Growth** | Growth system, threads, posts, replies, trends |
| **Facebook Growth** | Page strategy, Groups, short-form video, community |
| **Pinterest Growth** | Growth, keyword SEO, fresh-pin design, traffic |
| **Threads Growth** | Conversation-first growth, posts, the reply flywheel |
| **Video Creation Studio** | Script → on-camera or AI video → clipped and published |
| **Visual & Design** | Brand template system + AI image tools, cards, thumbnails |
| **AI Voice & Music** | AI voiceover, narration, owned brand music and stings |
| **Engagement & Community** | Daily engagement routine, community, collabs, creators, DMs |
| **Analytics & Optimization** | Honest goals, reporting, audits, testing |
| **Agency & Client Management** | Running social for clients end to end |

Every pack bundles the connection guide each tool skill needs (e.g. the WoopSocial guide with
the scheduling skill), so each skill works self-contained once uploaded.

1. Download a pack from the **Releases** page (or grab individual skill ZIPs there).
2. In Claude, open **Customize → Skills → + Create skill** and upload each ZIP inside the pack
   (requires code execution enabled in Settings). Toggle them on.
3. Follow the README inside the pack — a few minutes of uploads, once.

On **Team/Enterprise** plans, one person can upload the skills and share them with the whole
organization — no per-seat setup. (Maintainers: `./scripts/build-packs.sh` rebuilds all packs
and per-skill ZIPs into `dist/`.)

**OpenClaw** — copy skill folders into your workspace `skills/` directory (or
`~/.openclaw/skills` for all agents). Skills follow the same `SKILL.md` standard OpenClaw uses.

**Hermes Agent** — drop skill folders into `~/.hermes/skills/` (or your project's `skills/`),
or find these skills in the Hermes marketplace (`hermes skills search social media`).

**Any other agent framework** — skills are plain Markdown following the
[Agent Skills](https://agentskills.io) convention (`SKILL.md` + frontmatter `name` /
`description`), the same ecosystem used by Claude Code, Cursor, Codex CLI, OpenClaw, Hermes,
and 20+ other agents. Point your loader at `skills/` or copy individual skill folders into
your agent's skills directory.

## Your first 15 minutes

The skills read and write a small set of brand files, so **work in a dedicated folder per
brand** (`mkdir my-brand && cd my-brand` before starting your agent). Then say, in order:

1. **"Set up my brand profile."** The agent interviews you (or mines your site/existing
   posts) and writes `brand-profile.md` — the source of truth every other skill reads first.
   Add **"build my voice guide"** and it derives `voice.md` from your actual writing.
2. **"Build my content pillars and a two-week content calendar."** You'll get the 3–5 themes
   and a concrete plan mapped to your platforms.
3. **"Write this week's posts."** The format writers produce platform-native drafts in your
   voice — captions, a LinkedIn post, a Reels script, whatever the calendar calls for.
4. **"Schedule them."** The publishing skill validates every post against platform rules,
   shows you exactly what will go out where and when, and — the first time — walks you
   through connecting a scheduler. Nothing is ever posted without your explicit yes.

From there it compounds: ask for a launch plan, a competitor teardown, a month of content in
one sitting, or "why did this post flop?" — the skills route to each other automatically.
Running multiple brands? One folder per brand; the profile in each folder keeps them separate.

## How the skills chain

```
FOUNDATION            brand-profile → voice-builder → audience-research → social-strategy
     │                (every content skill reads these first)
     ▼
PLAN                  content-pillars → idea-generation-and-ideation → content-calendar
     │                → batch-content-plan → campaign-and-launch-planning
     ▼
CREATE                hook-writer + the format writers (caption-writer, linkedin-post-writer,
     │                reels-script, tiktok-script, thread-writer, carousel-writer, …)
     ▼                × the content angles (educational, storytelling, contrarian, BTS, …)
MEDIA                 image-prompt/ai-video routers → nano-banana, ideogram, flux,
     │                veo-3, kling, luma, heygen, synthesia, ai-voiceover, suno
     │                → edited in capcut / descript / opus-clip / canva
     ▼
PUBLISH               scheduling-and-queue  (validate → confirm → schedule/post)
     ▼
GROW & ENGAGE         engagement-routine, reply-and-comment-writer, community-management,
     │                the platform growth playbooks (linkedin-growth, tiktok-growth, …)
     ▼
MEASURE & RECYCLE     analytics-and-reporting → content-audit → experimentation-and-ab-testing
                      → content-recycling / cross-platform-repurposing  (feeds PLAN again)
```

An agent with the full set routes between them automatically — ask for "a launch plan for my
app" and it will walk foundation → plan → create → publish, offering to set up scheduling
when it's time to post.

## Skill catalog

### Foundation (start here)
| Skill | Job |
|---|---|
| [brand-profile](skills/brand-profile/SKILL.md) | The single source of truth every other skill reads first |
| [voice-builder](skills/voice-builder/SKILL.md) | Define a voice that survives any format |
| [writing-style-and-tone](skills/writing-style-and-tone/SKILL.md) | Style rules at the sentence level |
| [audience-research](skills/audience-research/SKILL.md) | Who you're actually talking to |
| [social-strategy](skills/social-strategy/SKILL.md) | Platform mix, positioning, cadence |
| [content-pillars](skills/content-pillars/SKILL.md) | The 3–5 themes everything maps to |
| [goals-and-kpis](skills/goals-and-kpis/SKILL.md) | Targets that aren't vanity metrics |
| [profile-optimization](skills/profile-optimization/SKILL.md) | Bios and profiles as landing pages |

### Research & planning
| Skill | Job |
|---|---|
| [idea-generation-and-ideation](skills/idea-generation-and-ideation/SKILL.md) | A repeatable idea system, not a brainstorm |
| [content-research-and-sourcing](skills/content-research-and-sourcing/SKILL.md) | Verified source material |
| [competitor-analysis](skills/competitor-analysis/SKILL.md) | Learn from the field without copying it |
| [viral-reverse-engineering](skills/viral-reverse-engineering/SKILL.md) | Why a post worked, structurally |
| [audience-research](skills/audience-research/SKILL.md) | Segments, pains, language |
| [content-calendar](skills/content-calendar/SKILL.md) | The living plan |
| [batch-content-plan](skills/batch-content-plan/SKILL.md) | A month of content in one sitting |
| [campaign-and-launch-planning](skills/campaign-and-launch-planning/SKILL.md) | Launches as multi-week arcs |
| [seasonal-and-moment-marketing](skills/seasonal-and-moment-marketing/SKILL.md) | Own the calendar moments |
| [trend-jacking](skills/trend-jacking/SKILL.md) | Ride trends without embarrassment |
| [data-and-original-research](skills/data-and-original-research/SKILL.md) | Original data as content |

### Writing: the format writers
| Skill | Job |
|---|---|
| [hook-writer](skills/hook-writer/SKILL.md) | The first line / first 3 seconds |
| [caption-writer](skills/caption-writer/SKILL.md) | Captions for any platform |
| [linkedin-post-writer](skills/linkedin-post-writer/SKILL.md) | LinkedIn posts without the cringe |
| [thread-writer](skills/thread-writer/SKILL.md) | X threads |
| [threads-post](skills/threads-post/SKILL.md) | Meta Threads posts |
| [text-post-and-microblog](skills/text-post-and-microblog/SKILL.md) | Short text posts |
| [carousel-writer](skills/carousel-writer/SKILL.md) | Slide-by-slide carousels |
| [story-writer](skills/story-writer/SKILL.md) | Stories (IG/FB) |
| [short-form-video-script](skills/short-form-video-script/SKILL.md) | The master short-form scripting craft |
| [reels-script](skills/reels-script/SKILL.md) | Instagram Reels scripts |
| [tiktok-script](skills/tiktok-script/SKILL.md) | TikTok scripts |
| [scripting-and-storyboarding](skills/scripting-and-storyboarding/SKILL.md) | Longer video scripts and boards |
| [reply-and-comment-writer](skills/reply-and-comment-writer/SKILL.md) | Replies and strategic comments |

### Content angles
| Skill | Job |
|---|---|
| [educational-content-and-how-to](skills/educational-content-and-how-to/SKILL.md) | Teach to build authority |
| [storytelling-and-narrative](skills/storytelling-and-narrative/SKILL.md) | Narrative craft |
| [contrarian-and-opinion](skills/contrarian-and-opinion/SKILL.md) | Argued positions that earn attention |
| [behind-the-scenes-and-founder](skills/behind-the-scenes-and-founder/SKILL.md) | BTS, build-in-public, founder story |
| [before-after-and-transformation](skills/before-after-and-transformation/SKILL.md) | Honest transformation content |
| [social-proof-and-testimonials](skills/social-proof-and-testimonials/SKILL.md) | Proof as content |
| [listicle-and-roundup](skills/listicle-and-roundup/SKILL.md) | Lists and roundups |
| [meme-and-culture](skills/meme-and-culture/SKILL.md) | Memes without brand damage |
| [interactive-content](skills/interactive-content/SKILL.md) | Polls, quizzes, challenges |
| [livestream-and-realtime](skills/livestream-and-realtime/SKILL.md) | Live formats |
| [podcast-and-audiograms](skills/podcast-and-audiograms/SKILL.md) | Podcast-to-social |
| [email-and-newsletter](skills/email-and-newsletter/SKILL.md) | The owned-audience companion |

### Platform playbooks
| Platform | Skills |
|---|---|
| Instagram | [instagram-growth](skills/instagram-growth/SKILL.md) · [instagram-seo](skills/instagram-seo/SKILL.md) · [instagram-reels-publishing](skills/instagram-reels-publishing/SKILL.md) |
| TikTok | [tiktok-growth](skills/tiktok-growth/SKILL.md) · [tiktok-script](skills/tiktok-script/SKILL.md) · [tiktok-photo-mode](skills/tiktok-photo-mode/SKILL.md) · [tiktok-video-publishing](skills/tiktok-video-publishing/SKILL.md) |
| LinkedIn | [linkedin-growth](skills/linkedin-growth/SKILL.md) · [linkedin-post-writer](skills/linkedin-post-writer/SKILL.md) · [linkedin-company-pages](skills/linkedin-company-pages/SKILL.md) |
| X / Twitter | [x-growth](skills/x-growth/SKILL.md) · [thread-writer](skills/thread-writer/SKILL.md) |
| Threads | [threads-growth](skills/threads-growth/SKILL.md) · [threads-post](skills/threads-post/SKILL.md) |
| Facebook | [facebook-strategy](skills/facebook-strategy/SKILL.md) · [facebook-groups](skills/facebook-groups/SKILL.md) |
| Pinterest | [pinterest-growth](skills/pinterest-growth/SKILL.md) · [pinterest-seo](skills/pinterest-seo/SKILL.md) · [pinterest-pin-design](skills/pinterest-pin-design/SKILL.md) |
| YouTube | [youtube-long-form](skills/youtube-long-form/SKILL.md) · [youtube-shorts](skills/youtube-shorts/SKILL.md) · [youtube-publishing-and-metadata](skills/youtube-publishing-and-metadata/SKILL.md) · [thumbnail-design](skills/thumbnail-design/SKILL.md) |
| Reddit | [reddit-marketing](skills/reddit-marketing/SKILL.md) — advisory-only: the agent drafts, you post natively |

### Visual & design
| Skill | Job |
|---|---|
| [design-and-templates](skills/design-and-templates/SKILL.md) | The reusable on-brand template system |
| [thumbnail-design](skills/thumbnail-design/SKILL.md) | YouTube thumbnails |
| [pinterest-pin-design](skills/pinterest-pin-design/SKILL.md) | Pinterest pin visuals |
| [quote-cards-and-text-graphics](skills/quote-cards-and-text-graphics/SKILL.md) | Text graphics |
| [infographic-and-data-viz](skills/infographic-and-data-viz/SKILL.md) | Data as visuals |
| [image-prompt](skills/image-prompt/SKILL.md) | Router: brief → the right image tool |

### AI media tools (each pairs with a guide in `tools/integrations/`)
| Cluster | Skills |
|---|---|
| Image generation | [nano-banana](skills/nano-banana/SKILL.md) · [ideogram](skills/ideogram/SKILL.md) · [flux](skills/flux/SKILL.md) |
| Image editing | [ai-image-editing](skills/ai-image-editing/SKILL.md) |
| Video generation | [ai-video](skills/ai-video/SKILL.md) (router) · [veo-3](skills/veo-3/SKILL.md) · [kling](skills/kling/SKILL.md) · [luma](skills/luma/SKILL.md) · [runway](skills/runway/SKILL.md) · [heygen](skills/heygen/SKILL.md) · [synthesia](skills/synthesia/SKILL.md) |
| Voice & music | [ai-voiceover](skills/ai-voiceover/SKILL.md) · [suno](skills/suno/SKILL.md) · [ai-music-and-sound](skills/ai-music-and-sound/SKILL.md) (router) |
| Editing & clipping | [capcut](skills/capcut/SKILL.md) · [descript](skills/descript/SKILL.md) · [opus-clip](skills/opus-clip/SKILL.md) · [captions-and-clipping](skills/captions-and-clipping/SKILL.md) |
| Design platform | [canva](skills/canva/SKILL.md) |
| On-camera delivery | [talking-head-and-piece-to-camera](skills/talking-head-and-piece-to-camera/SKILL.md) |

### Distribution, growth & monetization
| Skill | Job |
|---|---|
| [hashtag-strategy](skills/hashtag-strategy/SKILL.md) | Hashtags in the keyword era |
| [social-seo](skills/social-seo/SKILL.md) | Search inside the platforms |
| [ai-search-optimization](skills/ai-search-optimization/SKILL.md) | Show up in AI answers |
| [cross-platform-repurposing](skills/cross-platform-repurposing/SKILL.md) | One idea, every platform, natively |
| [content-recycling](skills/content-recycling/SKILL.md) | Repurposing across time |
| [link-in-bio-and-traffic](skills/link-in-bio-and-traffic/SKILL.md) | Social → site traffic |
| [lead-magnets-and-funnels](skills/lead-magnets-and-funnels/SKILL.md) | Followers → leads |
| [social-selling-and-dm](skills/social-selling-and-dm/SKILL.md) | Selling in DMs without spam |
| [collabs-and-cross-promotion](skills/collabs-and-cross-promotion/SKILL.md) | Organic partnerships |
| [ugc-and-influencer](skills/ugc-and-influencer/SKILL.md) | Paid creators, UGC, disclosure done right |
| [creator-monetization](skills/creator-monetization/SKILL.md) | The creator's revenue stack |

### Community & operations
| Skill | Job |
|---|---|
| [engagement-routine](skills/engagement-routine/SKILL.md) | The daily/weekly engagement block |
| [community-management](skills/community-management/SKILL.md) | Audience → community |
| [crisis-and-moderation](skills/crisis-and-moderation/SKILL.md) | When things go wrong |

### Publishing & measurement
| Skill | Job |
|---|---|
| [scheduling-and-queue](skills/scheduling-and-queue/SKILL.md) | **The bridge:** validate → confirm → publish/schedule to your connected accounts |
| [platform-specs-and-validation](skills/platform-specs-and-validation/SKILL.md) | Current specs and limits per platform |
| [analytics-and-reporting](skills/analytics-and-reporting/SKILL.md) | What's working and why (advisory) |
| [content-audit](skills/content-audit/SKILL.md) | Audit the library, rebalance |
| [experimentation-and-ab-testing](skills/experimentation-and-ab-testing/SKILL.md) | Test, don't guess |

## Repo layout

```
skills/                  106 skills; each: SKILL.md + references/ + evals/
tools/
  REGISTRY.md            index of agent-usable tool integrations
  integrations/          per-tool connection guides (publishing, image, video, audio, editing)
```

## Design principles

1. **One skill = one job-to-be-done**, with explicit boundaries and routing to its neighbors.
2. **Foundation first** — content skills read `brand-profile` and `voice-builder` before writing.
3. **The agent drafts, the human judges, then it publishes** — never the other way around.
4. **No fabrication** — no invented stats, no fake engagement tactics, no "guaranteed virality."
5. **Confirmation before side effects** — nothing is posted, scheduled, or deleted without an
   explicit yes.
6. **Volatile facts are marked** — platform specs and tool pricing carry a *verify-quarterly*
   flag rather than pretending to be timeless.

## Contributing

The fastest useful PR: add a tool integration (`tools/integrations/<name>.md` + a row in
[`tools/REGISTRY.md`](tools/REGISTRY.md)) or a skill following the house pattern — study
[skills/x-growth/](skills/x-growth/SKILL.md) for the structure (SKILL.md + 4 references +
evals). Every skill-name mention must resolve to a real skill directory.

## License

MIT — maintained by Frank Heijdenrijk and the team behind
[WoopSocial](https://woopsocial.com).

⭐ **Made it this far? Star the repo** — it helps more people find these skills.
