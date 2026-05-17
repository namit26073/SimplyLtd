---
paths:
  - "src/styles/**"
  - "src/**/*.astro"
  - "src/**/*.tsx"
---

# Styles

## Token system

Design tokens are the canon — components reference tokens, not literal values.

- `src/styles/tokens.css` — `:root` custom properties for colour, type scale, spacing, motion, radii.
- `src/styles/brands/<slug>.css` — per-brand overrides scoped to `[data-brand="<slug>"]`. Each defines `--color-accent` and `--color-accent-contrast`.
- `src/styles/reset.css` — minimal reset; no Normalize.css; modern browser baseline.
- `src/styles/typography.css` — font-family bindings, type scale CSS, prose styles.
- `src/styles/transitions.css` — `view-transition-name` declarations, scoped per element that transitions.

## Naming

- CSS classes: `kebab-case`, BEM-ish where helpful (`hero__heading`, `hero__heading--accent`). Avoid deep nesting.
- Custom properties: `--<group>-<value>` (e.g. `--sp-4`, `--fs-700`, `--ease-out`).
- Scope component styles to the component file's `<style>` block when they're not shared; promote to `src/styles/` when shared.

## Modern CSS we lean on

- `@layer` for cascade order (`reset` → `tokens` → `base` → `components` → `utilities` → `overrides`).
- `:has()` for conditional parent styling.
- `@scope` for component-local cascades when scoping is needed.
- Container queries (`@container`) when a component cares about its own container size, not the viewport.
- `color-mix()` for derived shades.
- `light-dark()` (where Lighthouse permits) for future dark-mode pivots; not implemented in v1.

## What's forbidden

- **Tailwind / Bootstrap / utility-class frameworks** — see CLAUDE.md and ADR 0001.
- **CSS-in-JS** — fights Astro's critical-CSS inlining.
- **Inline `style="..."` attributes** for anything beyond truly one-off positions (e.g. an SVG inline transform); shared styles always promote to CSS files.
- **`!important`** without a comment naming the constraint that forced it.
- **CSS resets that touch typographic defaults** (margin reset is OK; font-size reset is not).

## Reduced-motion

`@media (prefers-reduced-motion: reduce)` overrides `--dur-*` tokens to `0ms`. Any animation that uses `var(--dur-*)` automatically becomes no-op — no per-component reduced-motion handling needed.
