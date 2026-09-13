# Sign-in screen design QA

**Source visual truth:** `C:/Users/OrCon/AppData/Local/Temp/codex-clipboard-f847e4b1-03a5-4e5b-bcc3-98a7da88af01.png` (1024 × 768 px). The original Smark Connect screen is `C:/Users/OrCon/Pictures/Screenshots/Screenshot 2026-09-13 144137.png`.

**Implementation:** `http://127.0.0.1:3400/login`, captured in Codex's in-app browser, tab 2, and displayed inline in this task next to the source. The browser tool did not expose a local screenshot path. CSS viewport: 1024 × 768; emitted screenshot: 1024 × 768 px, with the app canvas displayed at about 0.91 scale inside the browser capture. Compared the app canvas after normalizing that surrounding whitespace. State: signed out, empty form, desktop. Also captured a 390 × 844 mobile viewport.

**Full-view comparison:** Both views use a dark purple cosmic background, a small brand mark in the upper left, and one central, translucent sign-in card with a purple rim and glowing primary action. The implementation uses the existing Smark Connect brand and a newly generated nebula asset; the reference uses a different product logo and a softer nebula crop. Card width and top alignment are close after normalizing the embedded browser canvas. The implementation card is shorter because the app has no Facebook/Apple authentication or password-reset route, and Google sign-in appears only when configured. Those are intentional functional constraints, not decorative omissions to fill with dead controls.

**Focused region comparison:** The icon, title, explanatory line, dark inputs, field icons, and neon button are legible in the full-size comparison capture; a separate crop was unnecessary. The title hierarchy and control rhythm track the reference. The reference's field text is slightly smaller and its card blur is more pronounced; both are minor differences. The implementation's stronger field contrast supports readability.

**Required fidelity surfaces:**

- Fonts and typography: single-line heading, compact supporting copy, and small field text follow the reference hierarchy; the app retains its own font stack.
- Spacing and layout: centered 370px card, rounded corners, compact field gaps, and upper-left brand placement match the composition. Mobile keeps the full form visible without horizontal overflow.
- Colors and tokens: near-black purple card, lavender outlines, muted input fill, white text, and magenta button glow match the intended palette.
- Image quality: generated 1672 × 941 nebula raster is sharp at both checked widths and maintains a dark center for form contrast.
- Copy and content: app-specific Smark Connect sign-in copy and the real account-creation link replace Ebolt text and unsupported provider choices.

**Comparison history:** First browser capture showed a card wider and lower than the reference. Reduced card width from 390px to 370px and adjusted vertical padding; the second desktop capture aligns the card's top and horizontal footprint. The subsequent mobile capture shows no clipped controls or horizontal overflow.

**Findings:** No actionable P0, P1, or P2 issues remain. Optional P3: soften the upper-left nebula glow if a closer match to the source image is desired.

**Interaction and runtime checks:** Password visibility toggles correctly. "Create an account" reaches the existing onboarding flow and its sign-in link returns to login. Browser console reported no errors. TypeScript, targeted ESLint, 164 tests, and production build passed.

**Implementation checklist:** Keep the working sign-in and onboarding routes, conditional Google provider, responsive card, and generated background asset together in the change.

final result: passed
