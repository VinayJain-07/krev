# Core Web Vitals Diagnostics

## Purpose

Translate performance evidence into engineering actions while keeping lab diagnostics, field experience, and search guidance separate.

## Process

1. Identify the source and context for every measurement: PageSpeed or Lighthouse lab run, CrUX field data, Search Console, or another authenticated first-party source.
2. Record strategy, device assumptions, URL, timestamp, and the exact values for LCP, CLS, INP when available, FCP, and TBT.
3. Use LCP, CLS, and INP for field Core Web Vitals assessment. Treat TBT as a lab responsiveness proxy, never as field INP.
4. Compare values with the applicable current thresholds and state whether the result is good, needs improvement, or poor.
5. Map each failed signal to likely causes such as server response, render-blocking resources, image or font weight, JavaScript execution, layout instability, or third-party code.
6. Name affected templates, a reproducible validation method, expected user impact, owner, and a measurable success check.

## Output standard

Label lab versus field evidence in every section. A single lab run may identify a diagnostic opportunity but cannot prove a passing field assessment.
