# Preloader Design QA

- Source visual truth path: `C:\Users\OrCon\AppData\Local\Temp\codex-clipboard-c10aadc6-c4c9-4ae7-aeba-3f42b4ef3dbb.png`.
- Implementation route: `http://127.0.0.1:3000/index.html` in the Codex in-app Browser.
- Comparison capture: `http://127.0.0.1:3000/qa-preloader-comparison.html`, rendered in-browser and inspected inline. The browser surface does not expose a filesystem screenshot path.
- Reference pixels: 1904 × 1015.
- Primary implementation viewport: 1024 × 768 CSS pixels at device pixel ratio 1.
- Responsive implementation viewport previously verified: 376 × 812 CSS pixels at device pixel ratio 1.
- Density normalization: the reference and implementation are each contained at a matching 1.875:1 ratio on the browser-rendered side-by-side board; browser chrome and board labels are excluded from the visual judgement.
- State: active preloader at 900ms into the one-loop circuit; dismissal and revealed-page states were checked separately.

## Full-view comparison evidence

The reference and refined implementation were opened together on the comparison board. Both retain the near-black canvas, restrained centered lockup, thin inset rounded frame, and a single moving perimeter accent. The intentional differences are the user-requested live text lockup and impact line, plus the longer premium light trail. The implementation remains as sparse as the reference while giving the central identity clearer hierarchy.

## Focused region comparison evidence

The board capture shows one bright head with an extended soft tail on the bottom rail; a later active capture shows the same segment travelling vertically on the right rail. The SVG rounded rectangle carries all three stroke layers through its radii, so the tail bends continuously rather than snapping at corners. The underlying path uses `pathLength="100"` and every animated layer changes `stroke-dashoffset` from `58` to `-42`: one exact 100-unit circuit with a single iteration.

## Required fidelity surfaces

- Fonts and typography: the existing Inter display token is retained. “Your” is deliberately softened while “AI CMO” is 650 weight and near-white; the 24–34px lockup and 11–13px impact line create a calm, premium hierarchy without crowding the reference’s sparse center.
- Spacing and layout rhythm: the message remains optically centered, with a 12px title-to-impact-line gap. The perimeter inset scales from 12px to 28px and its 10–16px radius stays clear at wide and compact viewports.
- Colors and visual tokens: background `#050506`, perimeter `#28282d`, muted lead text `#a6a6af`, near-white focus text, and low-opacity neutral trail layers preserve the black/charcoal/white reference palette.
- Image quality and asset fidelity: no visible raster asset, illustration, or icon is needed. The source logo is intentionally replaced by live requested copy, not an approximation of the mark.
- Copy and content: the title is “Your AI CMO”; the added impact line is “Make your next move the one that matters.” It is concise, motivational, and scoped to the requested preloader.

## Comparison history

1. First browser pass — P1: the short stroke repeated around the perimeter because `vector-effect: non-scaling-stroke` prevented the normalized dash pattern from following `pathLength` as intended.
   - Fix: removed the non-scaling transform, made the SVG use the rendered viewport directly, and set one normalized dash pattern on a `pathLength="100"` rounded rectangle.
   - Post-fix evidence: wide and compact captures show exactly one bright segment.
2. Second browser pass — P2: the underlying document scrollbar remained visible during the full-screen loader.
   - Fix: lock document overflow for the loader duration and restore vertical scrolling immediately after dismissal.
   - Post-fix evidence: the final comparison shows a clean edge-to-edge loader; the revealed landing page scrolls normally afterward.
3. Refinement pass — P2: the original title was a single flat weight and the tracer stopped too abruptly to convey the requested premium trail.
   - Fix: created a two-weight live-text lockup with a delayed impact line, then layered a 6.8-unit diffused tail, 4.2-unit luminous inner tail, and 1.4-unit white head. All layers retain the same one-loop dash-offset animation.
   - Post-fix evidence: the side-by-side board shows readable center hierarchy and one continuous, visibly longer tail with no duplicate stroke segments.

## Findings

No actionable P0, P1, or P2 visual differences remain. The expanded trail and updated copy are intentional refinements requested by the user.

## Verification completed

- One full normalized circuit: passed (`58` to `-42`, a delta of exactly `100`).
- Single non-repeating visible head: passed.
- Extended layered trail and rounded-corner travel: passed.
- Final stop and overlay dismissal: passed.
- Public landing entry and Next.js app-route entry: passed.
- Reduced-motion fallback: implemented as a near-instant single circuit and dismissal.
- Browser console errors and warnings: none after the refinement on a fresh local-preview tab.
- Focused ESLint: passed.

## Follow-up polish

No P3 follow-up is required for this minimal state.

final result: passed
