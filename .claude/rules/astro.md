---
paths:
  - "src/**/*.astro"
  - "src/pages/**"
  - "astro.config.mjs"
---

# Astro rules

Astro 6, static output, Cloudflare Pages target. Pages Functions in `functions/` are separate from Astro's pipeline.

## Page conventions

- `src/pages/*.astro` is the file-based router. Folder = route segment. `[brand]/index.astro` is the dynamic sub-brand route.
- Every page extends `src/layouts/Base.astro` for the HTML shell. Sub-brand pages additionally wrap in `src/layouts/Brand.astro` to apply `[data-brand="<slug>"]`.
- Every page sets a unique `<title>` (pattern: `<Page Title> · Simply Ltd`) and `<meta name="description">` via the Base layout's props.
- `getStaticPaths()` on dynamic routes returns only `visible: true` brands. Lebanese + Pasta stay routed (404) until flipped on.

## Content collections

- `src/content.config.ts` is the single source of truth for content schemas. Zod-validated.
- Use `getCollection("brands", ({ data }) => data.visible)` to filter at query time.
- `<Image />` in `.astro` files prefers content-collection-referenced images so Zod validates their existence at type-check time.

## View Transitions

- `<ClientRouter />` is rendered in `Base.astro` for cross-page transitions.
- Transition names live in `src/styles/transitions.css`. Use only on elements that genuinely transition.
- All transitions degrade to standard navigation when the API is unavailable or when `prefers-reduced-motion: reduce`.

## Fonts

- Anton, Fraunces, Inter loaded via the Astro Fonts API (`astro.config.mjs`). Subsets: Latin.
- Reference the CSS variables (`--ff-display`, `--ff-editorial`, `--ff-body`) — never `font-family` literals.
- Add `<Font cssVariable="--ff-display" preload />` to `Base.astro`'s `<head>` for hero-load fonts.

## Configuration

- `astro.config.mjs` stays minimal. Adapters: none in v1 (static output; Pages Functions live outside Astro).
- Site URL: `https://simplyltd.co.uk` (used for sitemap generation; the active deployment is a `*.pages.dev` preview until cutover).
- No `output: 'server'` or `output: 'hybrid'` — we stay fully static.

## Anti-patterns

- Don't reach for SSR for things static can do (e.g. dynamic OG images — use a build-time generator).
- Don't write inline `<style>` blocks for shared styles; promote to `src/styles/` and cascade.
- Don't put assets in `public/` if they could go in `src/assets/` (loses build-time optimisation).
- Don't introduce a new content collection without an ADR.
