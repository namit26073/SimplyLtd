---
paths:
  - "src/components/**/*.astro"
  - "src/components/**/*.tsx"
  - "src/layouts/**/*.astro"
---

# Components

## .astro vs React island — pick the right one

Default to `.astro`. Use a React island (under `src/islands/`, not `src/components/`) **only** when the component genuinely needs client-side interactivity that can't be done with HTML + CSS + small scripts.

- `.astro` is correct for: layouts, sections, navs, footers, cards, menu listings, location pins, anything where the interactivity is a CSS hover or a `<details>` element.
- React island is correct for: the four-brand showcase (R3F + GSAP), the catering form (form state + Turnstile), the franchising form, the catering success state (custom post-submit animation).

If a component is wavering, default `.astro`. JS shipped to clients is a budget item.

## Naming & structure

- `PascalCase.astro` for components.
- Co-locate component-local styles in the `<style>` block; pull shared styles into `src/styles/`.
- One component per file; default-export from `.tsx` islands; `.astro` files don't need explicit exports.
- If a component has more than one variant (e.g. `Button`), use a single component with prop variants — do not proliferate one file per variant.

## Props

- Type props with `interface Props { ... }` at the top of `.astro` files; for `.tsx` islands use a standalone `type Props = { ... }`.
- Optional props get a default in the destructure, not in the type.
- Avoid prop-driven layout decisions deep in the tree — pass intent (`variant="quiet"`), not implementation (`paddingTop="16px"`).

## Accessibility per component class

- **Anything interactive** (link, button, form control): visible focus state, keyboard accessible, accessible name. No `outline: none` without a replacement focus indicator.
- **Images**: meaningful `alt`; decorative images get `alt=""`. Astro `<Image />` is preferred — it enforces width/height which prevents CLS.
- **Headings**: maintain a sensible h1–h6 outline per page. Don't pick heading levels for typographic size.
- **Colour**: text on photography needs an overlay or text-shadow that guarantees ≥4.5:1 contrast; do not eyeball.

## Style approach

- Design tokens live in `src/styles/tokens.css` (custom properties). Per-brand overrides live in `src/styles/brands/<slug>.css` and are scoped to the `[data-brand="<slug>"]` selector applied by `src/layouts/Brand.astro`.
- No utility-class framework (no Tailwind). The project's aesthetic stance is anti-generic; bespoke CSS gives the right control. If a utility pattern emerges three times, extract a class or a token, don't reach for Tailwind.
- Use modern CSS: `:has()`, `@layer`, `@scope`, container queries, `light-dark()`. Browser baseline is 2024+.
