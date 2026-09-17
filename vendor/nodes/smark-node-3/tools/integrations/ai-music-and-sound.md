# Integration: AI music + sound tools

*Connection / license / litigation layer for the `ai-music-and-sound` mini-skill. Volatile + legally live —
**verify-quarterly** at each tool's site + terms before relying on any fact here.*

## What this covers
The **music + SFX** tool landscape for social video. There's no single vendor — it's a category. **WoopSocial
does not generate audio**; the tool makes/licenses it, the creator bakes it into the video, WoopSocial
publishes the finished video.

## The tools (verify-quarterly)
| Tool | Model | Commercial license | Risk | Notes |
|---|---|---|---|---|
| **ElevenLabs Music** | Music (Aug 2025) | **cleanest** — licensed-from-day-one | **low** | + voice/TTS/SFX; the safe default. See `elevenlabs.md` |
| **Suno** | v5.5 | paid = commercial (post-WMG settlement) | moderate Content ID | best quality; 2026 licensed models, old deprecated; **downloads = paid only** |
| **Udio** | v2 | paid = commercial (UMG/WMG settled) | moderate Content ID | **Sony still litigating**; joint UMG platform 2026 |
| **Stable Audio** | 2.5 | licensed (SCL + WMG deals) | lower | adaptive/real-time options |
| **Google Lyria 2 / Meta MusicGen** | — | licensed/synthetic data | lower | embedded in larger suites |
| **Epidemic / Artlist / Soundstripe** | stock/sync libraries | **indemnified**, clean | **low** | not generative — huge cleared catalogs + SFX |

## Litigation (why source choice matters)
**RIAA sued Suno + Udio (June 24, 2024).** **Warner settled Suno (Nov 25, 2025)**; **UMG settled Udio (Oct
29, 2025**, royalty ~$0.002–0.005, licensed 2026 platform); Warner settled Udio (Nov 2025). **Sony still
litigates both; UMG still litigates Suno.** A **fair-use ruling (~summer 2026)** could set precedent. Indie
class actions pending. **Pre-settlement Suno/Udio output = legal limbo.**

## License + copyright facts (load-bearing)
- **Paid tier = commercial-use rights; free tiers do NOT.** **Suno ToS** disclaims that any copyright vests
  in output → **purely AI music may not be copyrightable** (US, no human authorship) — limits royalty
  collection. **Document human contribution.**
- **Indemnification mostly absent** (enterprise tiers may add cleared catalogs + indemnification; **ElevenLabs
  + stock libraries are cleanest**).
- **Content ID can claim even AI audio** (demonetize/redirect). **Keep the tool-license receipt** to dispute.
- **AI-disclosure** per platform/region (EU AI Act enforcement from **Aug 2026**; C2PA). **Never** copyrighted
  or platform **trending** music for a brand without a license — platforms **mute/strip** it (business
  commercial libraries are limited).

## The WoopSocial flow (manual — audio is baked into the video)
```
1. agent briefs music + sound design + picks the safest licensed source (-> ai-music-and-sound mini-skill; paid tier)
2. the TOOL generates/licenses the audio (ElevenLabs/Suno/Udio/Stable Audio or Epidemic/Artlist/Soundstripe)
3. the CREATOR bakes the audio + SFX into the video file (+ AI-disclosure where required; license saved)
4. the finished video enters the WoopSocial flow -> scheduling-and-queue -> WoopSocial PUBLISHES the video
   (audio baked in). WoopSocial does NOT generate music, add native trending audio (not via API), clear
   licenses, or run Content ID.
```

## Cross-links
`ai-music-and-sound` (the brief-craft mini-skill) · `ai-voiceover` + `elevenlabs.md` (voice sibling) ·
`captions-and-clipping` · `reels-script` / `tiktok-script` · `ai-video` (native video audio) ·
`instagram-reels-publishing` / `tiktok-video-publishing` (native trending audio) · `woopsocial.md` (publish
bridge).
