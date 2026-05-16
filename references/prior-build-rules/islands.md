---
paths:
  - "src/islands/**"
---

# Islands (client-side JS)

Anything in this directory ships JS to the client. Treat every byte as a budget item.

## Mount strategies — pick the lightest viable

- `client:idle` — for non-critical islands (footer newsletter, analytics opt-in). Hydrates after the page is idle.
- `client:visible` — **default for almost everything else.** Hydrates when the island scrolls into view. Use for the four-brand showcase, the catering form, the success state.
- `client:media="(prefers-reduced-motion: no-preference)"` — for purely-decorative motion. Pair with a non-motion fallback in the surrounding `.astro` so reduced-motion users get a complete page.
- `client:load` — only for islands that must be interactive before the user can read them. Almost never the right answer on a marketing site.

## Four-brand showcase (BrandShowcase island)

**Direction A — Suspended Plates (R3F + GSAP, 3D-led).** See CLAUDE.md and the Phase 2 plan for the design intent.

Discipline:

- Mount with `client:visible`. The 3D scene must not exist until the section is in view.
- Total scene weight ≤ 4 MB (compressed). Use Draco/Meshopt compression on glTF.
- Lazy-load drei helpers (`React.lazy`).
- Mobile gets a degraded variant — static stylised SVG plates with subtle CSS parallax. Detect with `client:media` or a check inside the island. Do not ship the WebGL bundle to phones.
- `prefers-reduced-motion: reduce` → all rotation halts; stills only.
- The `<canvas>` aspect-ratio is reserved in the surrounding `.astro` with a `min-height` (or `aspect-ratio` CSS) so there's no CLS when the island mounts.

Bundle splits:

- The R3F bundle stays in this island and is not shared with any other route.
- Suspense with a styled fallback that occupies the same space.

## GSAP / Motion conventions

- Prefer **Motion (One)** over GSAP unless we specifically need GSAP's timeline (the four-brand orchestration probably qualifies). Motion is smaller and tree-shakeable.
- Use `gsap.matchMedia()` to gate animations by viewport size and reduced-motion preference.
- Kill timelines on island unmount; tests will catch leaks.

## View transitions

- Use the View Transitions API for cross-page navigation between the homepage and a sub-brand page. Astro 6's `<ClientRouter />` makes this declarative.
- View-transition names live in `src/styles/transitions.css`. Use only on the elements that genuinely transition (typically the brand title and a hero image).
- Provide a fallback for browsers that don't support the API — the navigation must still work without the choreographed transition.

## Reduced motion is a hard floor

Every island that animates must verify a `prefers-reduced-motion: reduce` fallback. The accessibility-auditor subagent runs this check. If your island has no reduced-motion path, it is not finished.
