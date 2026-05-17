---
paths:
  - "**/*.{ts,tsx,astro,css,mjs}"
---

# Performance budget — Lighthouse ≥95 mobile

This is a **hard constraint of the project**, not a stretch goal. Every page must hit ≥95 on Performance / Accessibility / Best Practices / SEO at mobile throttling. The design-reviewer subagent runs the audit; do not mark a slice complete until it passes.

## Budgets

- **Total JS per route**: ≤ 70 KB transferred (gzip). Catering / franchising form pages may go to ≤ 100 KB and defend it.
- **LCP image**: ≤ 200 KB after responsive selection. Use Astro `<Image />` or `<Picture />` for AVIF/WebP fallback.
- **Font CSS critical path**: ≤ 30 KB. Subset fonts to Latin via Astro's Fonts API; no Google Fonts CDN.
- **CLS**: 0. Every image and embed has explicit `width` and `height`. Every island has an aspect-ratio reservation in its surrounding markup.

## Image rules

- Source images live in `src/assets/` (build-time optimised) — not `public/`.
- `public/` is for fonts (handled by Fonts API), favicons, robots.txt, and assets that must be served as-is.
- Every `<Image />` declares `widths` + `sizes`. Hero images use `priority`.
- Decorative images: `alt=""` + `role="presentation"`.
- Re-encode owner-provided videos to H.264 + WebM at sub-2MB each; lazy-load (no autoplay unless reduced-motion is `no-preference` AND the user has scrolled to it).

## JS rules

- No `client:load` unless justified in a code comment with the constraint that forced it.
- Tree-shake aggressively. Import from package subpaths where libraries support it (e.g. `lodash-es/debounce`, not `lodash`).
- Polyfills are forbidden by default; if a feature isn't in the 2024 baseline, find an alternative.

## CSS rules

- Critical CSS is inlined by Astro automatically. Don't fight it.
- Use design tokens (`src/styles/tokens.css`) for colour/space/type scale; per-brand overrides scope via `[data-brand="<slug>"]`.
- Container queries > viewport queries when a component cares about its own container size.
- No global resets beyond `src/styles/reset.css`.

## Verification before "done"

A vertical slice is not done until:

1. `astro check` passes (no TS errors).
2. The design-reviewer subagent's Lighthouse run is ≥95 across all four categories on mobile throttling.
3. The accessibility-auditor subagent passes (incl. `prefers-reduced-motion` fallback verified).
4. There are no console errors or warnings on a clean page load.
