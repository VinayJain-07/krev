# Sign-in screen design QA

**Source visual truth:** `C:/Users/OrCon/AppData/Local/Temp/codex-clipboard-f847e4b1-03a5-4e5b-bcc3-98a7da88af01.png` (1024 × 768 px). The original Smark Connect screen is `C:/Users/OrCon/Pictures/Screenshots/Screenshot 2026-09-13 144137.png`.

**Implementation:** `http://127.0.0.1:3400/login`, captured in Codex's in-app browser, tab 2, and displayed inline in this task next to the source. The browser tool did not expose a local screenshot path. CSS viewport: 1024 × 768; emitted screenshot: 1024 × 768 px, with the app canvas displayed at about 0.91 scale inside the browser capture. Compared the app canvas after normalizing that surrounding whitespace. State: signed out, empty form, desktop. Also captured a 390 × 844 mobile viewport.

**Full-view comparison:** The reference and implementation both use a dark purple cosmic background, a small brand mark in the upper left, and one central sign-in card. The implementation uses the existing Smark Connect brand and a generated nebula asset; the reference uses a different product logo. The user requested a quieter version aligned with the main site, so the latest implementation leaves the nebula faintly visible behind a restrained dark card and uses the site's solid purple CTA instead of the reference's neon outline. The 36-second background drift remains while the card stays fixed. Card width and top alignment are close after normalizing the embedded browser canvas. The implementation card is shorter because the app has no Facebook/Apple authentication or password-reset route, and Google sign-in appears only when configured. Those are intentional functional constraints, not decorative omissions to fill with dead controls.

**Focused region comparison:** The icon, title, explanatory line, dark inputs, field icons, and neon button are legible in the full-size comparison capture; a separate crop was unnecessary. The title hierarchy and control rhythm track the reference. The reference's field text is slightly smaller and its card blur is more pronounced; both are minor differences. The implementation's stronger field contrast supports readability.

**Required fidelity surfaces:**

- Fonts and typography: single-line heading, compact supporting copy, and small field text follow the reference hierarchy; the app retains its own font stack.
- Spacing and layout: centered 370px card, rounded corners, compact field gaps, and upper-left brand placement match the composition. Mobile keeps the full form visible without horizontal overflow.
- Colors and tokens: near-black purple card, understated lavender outlines, muted input fill, white text, and a solid `#8b2ce0` CTA match the main site's palette. Background opacity `.56`, brightness `.78`, and saturation `.58` make the image quieter without dimming the form.
- Image quality: generated 1672 × 941 nebula raster is sharp at both checked widths and maintains a dark center for form contrast. A 36-second transform animation moves the image subtly behind the stationary content.
- Copy and content: app-specific Smark Connect sign-in copy and the real account-creation link replace Ebolt text and unsupported provider choices.

**Comparison history:** First browser capture showed a card wider and lower than the reference. Reduced card width from 390px to 370px and adjusted vertical padding; the second desktop capture aligns the card's top and horizontal footprint. The subsequent mobile capture shows no clipped controls or horizontal overflow. The next user-requested refinement reduced the nebula's intensity and added a 36-second drift; browser captures showed intact contrast and computed animation styles changing over time. The latest refinement compared the reference, the Smark Connect landing page, and the revised login in one browser observation. It reduced the image and card glow and adopted the site's purple CTA. Desktop and 390px mobile captures show a more minimal hierarchy with no clipped controls or horizontal overflow.

**Findings:** No actionable P0, P1, or P2 issues remain. The static, brighter source and the quieter animated implementation differ intentionally per the user's follow-up requests.

**Interaction and runtime checks:** Password visibility toggles correctly. "Create an account" reaches the existing onboarding flow and its sign-in link returns to login. The latest desktop and mobile captures keep the form readable; mobile document width equals viewport width. The animated layer has `pointer-events: none`, and the reduced-motion media rule disables animation. Browser console reported no errors. TypeScript, targeted ESLint, 164 tests, and production build passed before this CSS-only refinement.

## Scan story panel design QA

**Source visual truth:** `C:/Users/OrCon/AppData/Local/Temp/codex-clipboard-d8b72c47-4574-4a7a-bad3-013166950e8c.png` (1904 × 1015 px). This is the scan/loading view the story panel overlays.

**Implementation:** `http://127.0.0.1:3400/audit-loading?company=JDP%20%26%20Co&url=https%3A%2F%2Fexample.com`, captured in Codex's in-app browser, tab 4. Checked at the default desktop viewport and a 390 × 844 mobile viewport. State: the scan is active and the story panel is open from the first render.

**Full-view comparison:** The underlying scan keeps its near-black purple canvas, centered research state, live status chip, and footer progress rail from the supplied screen. A semi-opaque purple glass panel now sits above it with a blurred backdrop, so the scan remains present without competing with the story.

**Focused region comparison:** The panel uses one readable, continuous scroll track rather than chapter navigation. Its copy explains what is researched, why the scan takes time, how the evidence base is assembled, and what the workspace helps a user do next. Text begins moving automatically; the only in-story control is a small pause/play icon. At the end of the scroll, a single “Back to scan” action appears.

**Responsive and interaction checks:** Desktop and 390px mobile captures keep the panel inside the viewport with readable type and no horizontal overflow. Pausing changes the icon and stops the scroll. Scrolling to the end reveals “The story is complete” and “Back to scan”; activating the action closes the panel and returns to the loading view. Reloading the route opens the panel automatically. Escape remains available as a keyboard dismissal path.

**Findings:** No actionable P0, P1, or P2 issues remain for the requested scan story treatment.

**Implementation checklist:** Keep the scan route, live polling, pause/resume behavior, automatic story opening, semi-opaque glass treatment, and final Back to scan action together in the change.

final result: passed
