# Pre-launch: Smash Me Up + stats + domains — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the four client-approved pre-cutover changes — Smash Me Up coming-soon card + standalone smashmeup.com page, franchising stats 7/4 with a live people-fed counter, site-wide copy consistency, and the Porkbun domain-cutover runbook.

**Architecture:** Everything stays static. The counter is arithmetic from a fixed epoch (`src/lib/peopleFed.ts`, unit-tested) rendered by a small bundled `<script>` on the franchising page. The Smash Me Up card is a dedicated `.astro` component (not a brands-collection entry). smashmeup.com is one hand-written HTML file in `sites/smashmeup/`, deployed as a second Cloudflare Pages project by direct upload. Spec: `docs/superpowers/specs/2026-08-24-prelaunch-smash-stats-domains-design.md`.

**Tech Stack:** Astro 6 (static), Vitest, sharp (one-off asset script; transitive dep of Astro), wrangler (Pages direct upload).

**Branch:** `feat/prelaunch` (stacked on unmerged `feat/instagram-grid`).

**Pre-flight / external inputs:**
1. Owner's original logo at `assets-inbox/logos/SmashMeUpLogo.png` (Namit drops it in; never recreate logo art). Blocks Tasks 4–6.
2. Cloudflare auth for wrangler (`npx wrangler whoami`; if not logged in, Namit runs `npx wrangler login`). Blocks Tasks 6 (URL lookup) and 8.
3. Owner's full domain list + smashmeup.com registration confirmation. Blocks only the runbook's mapping table (Task 7 leaves a marked fill-in row) and the eventual Porkbun execution — not this build.

---

### Task 1: `peopleFed` library (TDD)

**Files:**
- Test: `tests/lib/peopleFed.test.ts`
- Create: `src/lib/peopleFed.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/lib/peopleFed.test.ts
import { describe, expect, it } from "vitest";
import {
  PEOPLE_FED_BASE,
  PEOPLE_FED_EPOCH,
  PEOPLE_FED_PER_DAY,
  peopleFed,
} from "../../src/lib/peopleFed";

const MS_PER_DAY = 86_400_000;
// One person every 288 seconds at 300/day.
const MS_PER_PERSON = MS_PER_DAY / PEOPLE_FED_PER_DAY;

describe("peopleFed", () => {
  it("returns the base figure at the epoch", () => {
    expect(peopleFed(PEOPLE_FED_EPOCH)).toBe(PEOPLE_FED_BASE);
  });

  it("adds the daily rate after one full day", () => {
    expect(peopleFed(PEOPLE_FED_EPOCH + MS_PER_DAY)).toBe(PEOPLE_FED_BASE + PEOPLE_FED_PER_DAY);
  });

  it("floors partial persons", () => {
    expect(peopleFed(PEOPLE_FED_EPOCH + MS_PER_PERSON - 1)).toBe(PEOPLE_FED_BASE);
    expect(peopleFed(PEOPLE_FED_EPOCH + MS_PER_PERSON)).toBe(PEOPLE_FED_BASE + 1);
  });

  it("clamps clocks set before the epoch to the base", () => {
    expect(peopleFed(PEOPLE_FED_EPOCH - MS_PER_DAY)).toBe(PEOPLE_FED_BASE);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/peopleFed.test.ts`
Expected: FAIL — cannot resolve `../../src/lib/peopleFed`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/peopleFed.ts
export const PEOPLE_FED_BASE = 400_000;
/** 2026-08-24T00:00:00Z — the day the owner gave the ~400k figure. */
export const PEOPLE_FED_EPOCH = Date.UTC(2026, 7, 24);
/** Fleet-wide rough average, owner-confirmed 2026-08-24. */
export const PEOPLE_FED_PER_DAY = 300;

const MS_PER_DAY = 86_400_000;

/** People fed at `nowMs` (epoch ms). Clamped so early client clocks never dip below base. */
export function peopleFed(nowMs: number): number {
  const elapsed = Math.max(0, nowMs - PEOPLE_FED_EPOCH);
  return PEOPLE_FED_BASE + Math.floor((elapsed / MS_PER_DAY) * PEOPLE_FED_PER_DAY);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/peopleFed.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add tests/lib/peopleFed.test.ts src/lib/peopleFed.ts
git commit -m "feat(franchising): peopleFed counter arithmetic + tests"
```

---

### Task 2: Franchising page — stats 7/4 + live counter

**Files:**
- Modify: `src/pages/franchising.astro` (meta line 10, dek line 35, stats lines 52–69, styles ~line 373, script appended at end of file)

- [ ] **Step 1: Update meta description (line 10)**

Old: `description="Run a Simply truck of your own. Three concepts, one operating model, six years on Paddington Basin. Apply to franchise Simply Ltd."`
New: `description="Run a Simply truck of your own. Four concepts, seven trucks, one operating model. Apply to franchise Simply Ltd."`

- [ ] **Step 2: Update dek (line 35)**

Old: `Three concepts. One operating model. Six years on Paddington Basin.`
New: `Four concepts. Seven trucks. One operating model.`
(The stale "six years" claim dies; the `2019 Founded` stat carries that signal.)

- [ ] **Step 3: Replace the stats block (lines 52–69)**

```astro
        <div class="track__stats">
          <div class="stat">
            <p class="t-display stat__figure">2019</p>
            <p class="t-caption stat__label">Founded</p>
          </div>
          <div class="stat">
            <p class="t-display stat__figure">7</p>
            <p class="t-caption stat__label">Trucks operating</p>
          </div>
          <div class="stat">
            <p class="t-display stat__figure">4</p>
            <p class="t-caption stat__label">Operating concepts</p>
          </div>
          <div class="stat">
            <p class="t-display stat__figure stat__figure--live" data-people-fed>400,000+</p>
            <p class="t-caption stat__label">People fed</p>
          </div>
        </div>
```

- [ ] **Step 4: Add the counter style** — in the `<style>` block, directly after the `.stat__label` rule (~line 376):

```css
  /* Live people-fed counter — tabular digits stop the figure jittering as it ticks. */
  .stat__figure--live {
    font-variant-numeric: tabular-nums;
  }
```

- [ ] **Step 5: Append the counter script at the end of the file** (after the closing `</style>`):

```astro
<script>
  import { peopleFed } from "../lib/peopleFed";

  // Static markup ships "400,000+" so the no-JS page stays truthful; this
  // swaps in the live figure, counts up on first view (skipped under
  // prefers-reduced-motion), then re-renders every 30s so lingering
  // visitors see it tick (+1 roughly every 4.8 minutes).
  const COUNT_UP_MS = 1200;
  const COUNT_UP_RUNWAY = 150;

  function initPeopleFed() {
    const el = document.querySelector("[data-people-fed]");
    if (!(el instanceof HTMLElement) || el.dataset.ready) return;
    el.dataset.ready = "true";

    const render = (n: number) => {
      el.textContent = n.toLocaleString("en-GB");
    };
    const live = () => render(peopleFed(Date.now()));

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      live();
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io.disconnect();
          const target = peopleFed(Date.now());
          const from = target - COUNT_UP_RUNWAY;
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / COUNT_UP_MS);
            const eased = 1 - Math.pow(1 - p, 3);
            render(Math.round(from + (target - from) * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        },
        { threshold: 0.3 },
      );
      io.observe(el);
    }

    const interval = window.setInterval(() => {
      if (!el.isConnected) {
        window.clearInterval(interval);
        return;
      }
      live();
    }, 30_000);
  }

  initPeopleFed();
  // ClientRouter (view transitions) swaps the DOM without re-running module
  // scripts — re-init on every client-side navigation.
  document.addEventListener("astro:page-load", initPeopleFed);
</script>
```

- [ ] **Step 6: Type-check + eyeball**

Run: `npm run check` — expected: 0 errors.
Run: `npm run dev`, open `http://localhost:4321/franchising` — stats read 2019 / 7 / 4 / live figure; counter counts up on scroll-into-view; with OS reduced-motion emulated (DevTools → Rendering) the figure appears instantly.

- [ ] **Step 7: Commit**

```bash
git add src/pages/franchising.astro
git commit -m "feat(franchising): 7 trucks / 4 concepts + live people-fed counter"
```

---

### Task 3: Copy consistency sweep + ADR 0012 amendment

**Files:**
- Modify: `src/layouts/Base.astro:20`, `src/pages/about.astro:18-19,50,97`, `src/pages/catering.astro:10,51`, `src/pages/locations.astro:30-33` (+ its `<style>` block), `docs/decisions/0012-truck-count.md`

Principle (from spec): fleet-wide numbers (7 trucks / 4 concepts) live on franchising + about; Paddington copy stays three-trucks-two-pitches but framed as home base. Geographic "250 metres" facts unchanged.

- [ ] **Step 1: `src/layouts/Base.astro` line 20** — default description:

Old: `"Simply Ltd — street food from Paddington Basin. Catering, franchising, and three trucks on the canal."`
New: `"Simply Ltd — street food from Paddington Basin. Catering, franchising, and our trucks on the canal."`

- [ ] **Step 2: `src/pages/about.astro`** — three edits:

Lines 18–19 (hero dek), old: `What started with one wrap has grown into three\n trucks, multiple concepts, and a queue that doesn't stop.` → new: `What started with one wrap has grown into seven trucks, four concepts, and a queue that doesn't stop.`

Line 50, old: `Three trucks, two pitches, one canal. The standards are the same on every menu.` → new: `Seven trucks, four concepts — and the standards are the same on every menu.`

Line 97, old: `<p class="t-caption">Three concepts, one parent</p>` → new: `<p class="t-caption">Four concepts, one parent</p>`

- [ ] **Step 3: `src/pages/catering.astro`** — two edits:

Line 10 meta, old: `…Three food-truck concepts, one team, on-site cooking…` → new: `…Four food-truck concepts, one team, on-site cooking…`

Line 51, old: `Three concepts, one team.` → new: `Four concepts, one team.`

- [ ] **Step 4: `src/pages/locations.astro`** — append a home-base line to the dek (lines 30–33 become):

```astro
        <p class="t-editorial t-editorial--italic locations-intro__dek">
          We're on Paddington Basin every weekday. Falafel and Shawarma share Merchant Square;
          Burgers is on Canal Side Walk, about 250 metres east. Home base is Paddington —
          <a href="/catering/">our trucks also cook across London for events</a>.
        </p>
```

And in the page's `<style>` block, next to the existing `.locations-intro__dek` rule, add:

```css
  .locations-intro__dek a {
    color: inherit;
    text-underline-offset: 0.15em;
  }
```

(If no `.locations-intro__dek` rule exists, add the anchor rule at the end of the intro section's styles.)

- [ ] **Step 5: Amend `docs/decisions/0012-truck-count.md`**

Change `**Status:** Accepted` → `**Status:** Amended 2026-08-24`, and append:

```markdown

## Amendment — 2026-08-24

The owner confirms **seven trucks / four operating concepts** fleet-wide. Fleet-wide
numbers now appear on the franchising and about pages. The locations page continues to
list only the confirmed Paddington pitches (three trucks, two pitches); where the other
four trucks operate is not stated on-site until the owner provides detail.
```

- [ ] **Step 6: Verify no stray claims**

Run: `npx rg -i "three trucks|three concepts|3 trucks" src/`
Expected: hits only in `src/pages/locations.astro` (Paddington-scoped hero + meta) and `src/content/instagram-fallback/manifest.json` (placeholder social captions — deliberately untouched).

Run: `npm run check` — 0 errors.

- [ ] **Step 7: Commit**

```bash
git add src/layouts/Base.astro src/pages/about.astro src/pages/catering.astro src/pages/locations.astro docs/decisions/0012-truck-count.md
git commit -m "fix(copy): fleet-wide 7 trucks / 4 concepts; scope three-trucks copy to Paddington"
```

---

### Task 4: Smash Me Up logo intake + asset generation  ⛔ needs `assets-inbox/logos/SmashMeUpLogo.png`

**Files:**
- Create: `scripts/build-smashmeup-assets.mjs`
- Create (generated): `sites/smashmeup/logo-800.webp`, `sites/smashmeup/favicon.png`, `sites/smashmeup/apple-touch-icon.png`, `sites/smashmeup/og.png`
- Create (copy): `src/assets/smash-me-up-logo.png`

- [ ] **Step 1: Confirm inputs**

Run: `node -e "import('sharp').then(() => console.log('sharp ok'))"` — expected `sharp ok` (sharp ships with Astro).
Confirm `assets-inbox/logos/SmashMeUpLogo.png` exists (Namit provides). Record its pixel size — expected ≥800×800.

- [ ] **Step 2: Copy the original for the homepage card**

```powershell
Copy-Item assets-inbox/logos/SmashMeUpLogo.png src/assets/smash-me-up-logo.png
```

- [ ] **Step 3: Write the generation script**

```js
// scripts/build-smashmeup-assets.mjs
// One-off: builds the smashmeup.com static assets from the owner's original logo.
// Usage: node scripts/build-smashmeup-assets.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "assets-inbox/logos/SmashMeUpLogo.png";
const OUT = "sites/smashmeup";

await mkdir(OUT, { recursive: true });

await sharp(SRC)
  .resize(800, 800, { fit: "inside" })
  .webp({ quality: 82 })
  .toFile(`${OUT}/logo-800.webp`);

await sharp(SRC).resize(64, 64).png().toFile(`${OUT}/favicon.png`);

await sharp(SRC)
  .resize(180, 180)
  .flatten({ background: "#000000" })
  .png()
  .toFile(`${OUT}/apple-touch-icon.png`);

const logo = await sharp(SRC).resize(500, 500, { fit: "inside" }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#000000" } })
  .composite([{ input: logo, gravity: "centre" }])
  .png({ compressionLevel: 9 })
  .toFile(`${OUT}/og.png`);

console.log("smashmeup assets written to", OUT);
```

- [ ] **Step 4: Run it and check budgets**

Run: `node scripts/build-smashmeup-assets.mjs` then `Get-ChildItem sites/smashmeup | Select-Object Name, Length`
Expected: 4 files; `logo-800.webp` ≤ 80 KB (raise `quality` down if over).

- [ ] **Step 5: Commit**

```bash
git add scripts/build-smashmeup-assets.mjs sites/smashmeup src/assets/smash-me-up-logo.png
git commit -m "feat(smashmeup): logo intake + generated static assets"
```

---

### Task 5: `ComingSoonPanel` + BrandShowcase wiring  ⛔ needs Task 4

**Files:**
- Create: `src/components/ComingSoonPanel.astro`
- Modify: `src/components/BrandShowcase.astro` (import, heading line 24, rail contents line 28–36, grid line 90)

- [ ] **Step 1: Create the component**

```astro
---
import { Image } from "astro:assets";
import logo from "../assets/smash-me-up-logo.png";

interface Props {
  /** Pre-cutover this points at the pages.dev preview; the cutover runbook flips it to smashmeup.com. */
  href?: string;
}

const { href = "https://smashmeup.pages.dev" } = Astro.props;
---

<a
  href={href}
  target="_blank"
  rel="noopener noreferrer"
  class="coming-panel"
  aria-label="Smash Me Up — coming soon"
>
  <Image
    src={logo}
    alt=""
    class="coming-panel__logo"
    widths={[400, 600, 800]}
    sizes="(min-width: 900px) 25vw, 80vw"
    loading="lazy"
    quality={80}
  />
  <div class="coming-panel__content">
    <p class="t-caption coming-panel__kicker">Coming soon</p>
    <p class="t-body coming-panel__line">Our first permanent shop.</p>
    <span class="coming-panel__cta" aria-hidden="true">
      smashmeup.com <span class="coming-panel__arrow">→</span>
    </span>
  </div>
</a>

<style>
  /* Mirrors BrandPanel's frame (aspect, radius, hover lift) on a true-black
     ground — the logo art's own background — so it reads as kin to the
     brand cards without pretending to be a truck. */
  .coming-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: var(--r-lg);
    background: #000;
    color: var(--color-cream);
    aspect-ratio: 3 / 4;
    text-decoration: none;
    transition: transform var(--dur-base) var(--ease-out);
  }

  .coming-panel:hover,
  .coming-panel:focus-visible {
    transform: translateY(-4px);
  }

  .coming-panel:focus-visible {
    outline: 2px solid var(--color-cream);
    outline-offset: 3px;
  }

  :global(.coming-panel__logo) {
    width: 100%;
    height: auto;
    flex: 1 1 auto;
    min-height: 0;
    object-fit: contain;
    padding: var(--sp-3);
    transition: transform var(--dur-slow) var(--ease-out);
  }

  .coming-panel:hover :global(.coming-panel__logo),
  .coming-panel:focus-visible :global(.coming-panel__logo) {
    transform: scale(1.04);
  }

  .coming-panel__content {
    padding: 0 var(--sp-5) var(--sp-5);
    display: flex;
    flex-direction: column;
    gap: var(--sp-1);
  }

  .coming-panel__kicker {
    color: var(--color-cream);
  }

  .coming-panel__line {
    font-size: var(--fs-300);
    line-height: var(--lh-snug);
    color: var(--color-cream);
  }

  .coming-panel__cta {
    margin-top: var(--sp-3);
    display: inline-flex;
    align-items: center;
    gap: var(--sp-2);
    font-family: var(--ff-body-stack);
    font-weight: var(--fw-strong);
    font-size: var(--fs-200);
    text-transform: uppercase;
    letter-spacing: var(--ls-caption);
    border-bottom: 2px solid var(--color-cream);
    padding-bottom: var(--sp-1);
    align-self: flex-start;
  }

  .coming-panel__arrow {
    transition: transform var(--dur-fast) var(--ease-out);
  }

  .coming-panel:hover .coming-panel__arrow,
  .coming-panel:focus-visible .coming-panel__arrow {
    transform: translateX(4px);
  }
</style>
```

- [ ] **Step 2: Wire into `BrandShowcase.astro`**

Frontmatter: add `import ComingSoonPanel from "./ComingSoonPanel.astro";`

Heading (line 24): `Three trucks. One canal.` → `Three trucks. One canal. And something new.`

Rail `aria-label` (line 28): `"Sub-brands"` → `"Sub-brands and coming soon"`, and after the `brandsWithPitches.map(...)` output add:

```astro
    <div role="listitem" class="showcase__cell">
      <ComingSoonPanel />
    </div>
```

Desktop grid (line 90): `grid-template-columns: repeat(3, 1fr);` → `grid-template-columns: repeat(4, 1fr);`

- [ ] **Step 3: Check + eyeball**

Run: `npm run check` — 0 errors.
Run: `npm run dev`, open `http://localhost:4321/` — desktop: four equal cards; mobile width (<900px): fourth card scroll-snaps into view; card focus ring visible via keyboard Tab.

- [ ] **Step 4: Commit**

```bash
git add src/components/ComingSoonPanel.astro src/components/BrandShowcase.astro
git commit -m "feat(home): Smash Me Up coming-soon card joins the showcase rail"
```

---

### Task 6: smashmeup.com static page  ⛔ needs Task 4 + wrangler auth (for the Simply pages.dev URL)

**Files:**
- Create: `sites/smashmeup/index.html`

- [ ] **Step 1: Find the Simply project's canonical pages.dev domain**

Run: `npx wrangler pages project list`
Expected: a row for project `simply` with its `*.pages.dev` domain. Use that exact domain as `SIMPLY_URL` in the next step (the "Meet Simply" link; flipped to `https://simplyltd.co.uk` at cutover).

- [ ] **Step 2: Write the page** (replace `SIMPLY_URL` with the domain from Step 1):

```html
<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Smash Me Up — Coming Soon</title>
    <meta
      name="description"
      content="Smash Me Up — a new permanent smash-burger spot from the team behind Simply. Coming soon."
    />
    <meta name="theme-color" content="#000000" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta property="og:title" content="Smash Me Up — Coming Soon" />
    <meta property="og:description" content="A new permanent smash-burger spot from the team behind Simply." />
    <meta property="og:image" content="https://smashmeup.pages.dev/og.png" />
    <meta property="og:type" content="website" />
    <style>
      * {
        margin: 0;
        box-sizing: border-box;
      }
      html {
        color-scheme: dark;
      }
      body {
        min-height: 100svh;
        display: grid;
        place-items: center;
        background: #000;
        color: #f5efe2;
        font-family:
          ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        text-align: center;
        padding: 2rem 1.5rem;
      }
      main {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.25rem;
        max-width: 30rem;
      }
      h1 {
        line-height: 0;
      }
      h1 img {
        width: min(70vw, 420px);
        height: auto;
      }
      .soon {
        font-size: clamp(1.4rem, 5vw, 2rem);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }
      .credit {
        font-size: 1rem;
        line-height: 1.5;
        color: #cfc8b8;
      }
      .btn {
        display: inline-block;
        margin-top: 0.5rem;
        padding: 0.85rem 1.6rem;
        border: 2px solid #f5efe2;
        border-radius: 999px;
        color: #f5efe2;
        text-decoration: none;
        font-weight: 700;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        transition: background-color 150ms ease-out, color 150ms ease-out;
      }
      .btn:hover {
        background: #f5efe2;
        color: #000;
      }
      .btn:focus-visible {
        outline: 2px solid #f5efe2;
        outline-offset: 4px;
      }
    </style>
  </head>
  <body>
    <main>
      <h1><img src="/logo-800.webp" width="800" height="800" alt="Smash Me Up" fetchpriority="high" /></h1>
      <p class="soon">Coming soon.</p>
      <p class="credit">From the team behind <strong>Simply</strong> — the food trucks on Paddington Basin.</p>
      <a class="btn" href="SIMPLY_URL">Meet Simply →</a>
    </main>
  </body>
</html>
```

- [ ] **Step 3: Eyeball locally**

Run: `npx wrangler pages dev sites/smashmeup` (or open the file directly) — black page, centered logo, works at 360px and 1440px widths, button hover inverts, Tab reaches the button with a visible ring.

- [ ] **Step 4: Commit**

```bash
git add sites/smashmeup/index.html
git commit -m "feat(smashmeup): coming-soon page"
```

---

### Task 7: ADR 0014 + domains-cutover runbook

**Files:**
- Create: `docs/decisions/0014-smash-me-up.md`
- Create: `docs/runbooks/domains-cutover.md`

- [ ] **Step 1: Write the ADR**

```markdown
# ADR 0014 — Smash Me Up teaser + second Pages project

**Date:** 2026-08-24
**Status:** Accepted

## Decision

- Smash Me Up (future permanent shop; owner-registered smashmeup.com) is teased as a
  fourth card in the homepage BrandShowcase via a dedicated `ComingSoonPanel.astro` —
  **not** a `brands` content-collection entry, because it links off-site instead of
  routing to `/[brand]` and has no menu, pitch, or page of its own yet.
- smashmeup.com is a single hand-written static page in `sites/smashmeup/`, deployed as
  a second Cloudflare Pages project (`smashmeup`) by direct upload
  (`npx wrangler pages deploy sites/smashmeup --project-name smashmeup`). No build step.
- Brand vanity domains 301 via Porkbun URL forwarding; only simplyltd.co.uk and
  smashmeup.com move nameservers to Cloudflare (Pages custom-domain requirement).
  See `docs/runbooks/domains-cutover.md`.

## Why

- A collection entry would force fake data through the brands schema (pitch, menu,
  visibility) for something that is not a sub-brand page.
- Direct upload keeps the coming-soon page decoupled from the main site's build — it
  changes approximately never.
- Porkbun forwarding is a minutes-per-domain change with no nameserver moves for
  pure-redirect domains.

## Revisit when

Smash Me Up becomes real content — it then gets a proper brand expression and likely
its own site or a full sub-brand treatment.
```

- [ ] **Step 2: Write the runbook**

```markdown
# Runbook — production domain cutover (Porkbun → Cloudflare)

Execute **only after the owner approves both previews**. Registration stays at Porkbun
for every domain; only nameservers move, and only for the two content-serving domains.

## Prerequisites

- Owner approval of the Simply branch preview and smashmeup.pages.dev.
- Porkbun account access.
- Cloudflare account owning the `simply` and `smashmeup` Pages projects.
- Final domain list from the owner (fill the table in §4).

## 1. simplyltd.co.uk → Cloudflare Pages

1. Cloudflare dashboard → Add a domain → `simplyltd.co.uk` (Free plan); let it import
   existing DNS records and note the two assigned nameservers.
2. Porkbun → simplyltd.co.uk → Nameservers → replace with Cloudflare's pair.
   (Propagation up to 24 h, usually minutes.)
3. Cloudflare Pages → project `simply` → Custom domains → add `simplyltd.co.uk`, then
   `www.simplyltd.co.uk`.
4. Rules → Redirect Rules: `www.simplyltd.co.uk/*` → `https://simplyltd.co.uk/${1}`,
   301 permanent.

## 2. smashmeup.com → Cloudflare Pages

Same four steps against the `smashmeup` project.

## 3. Flip cross-links (one commit on main)

- `src/components/ComingSoonPanel.astro`: default `href` → `https://smashmeup.com`.
- `sites/smashmeup/index.html`: "Meet Simply" href → `https://simplyltd.co.uk`;
  `og:image` → `https://smashmeup.com/og.png`.

Then `npx wrangler pages deploy sites/smashmeup --project-name smashmeup` and let the
`simply` project auto-deploy from main.

## 4. Brand-domain 301s at Porkbun

Porkbun → domain → Details → URL Forwarding: type **301 permanent**, "include path"
OFF, destination per table. Test a `www.` request per domain; add an explicit `www`
forward if not covered.

| Domain | Destination | Note |
| --- | --- | --- |
| simplypasta.co.uk | https://simplyltd.co.uk/ | page hidden — retarget to /pasta when it launches |
| _fill in from owner's list_ | | |

Visible-brand domains point at their brand page (e.g. a falafel domain →
`https://simplyltd.co.uk/falafel`); hidden-brand and non-brand domains point at the
homepage until their pages exist.

## 5. Verify

- `https://simplyltd.co.uk`, `https://www.simplyltd.co.uk`, `https://smashmeup.com`
  all serve over HTTPS.
- Each forwarded domain: `curl -sI http://<domain>` → `301` + correct `Location`.
- Homepage card ↔ smashmeup cross-links resolve.
- Catering + franchising forms still submit (env vars live on the CF project).
- Lighthouse ≥95 mobile on `https://simplyltd.co.uk`.
```

- [ ] **Step 3: Commit**

```bash
git add docs/decisions/0014-smash-me-up.md docs/runbooks/domains-cutover.md
git commit -m "docs: ADR 0014 (Smash Me Up hosting) + domain cutover runbook"
```

---

### Task 8: Deploy both previews  ⛔ needs wrangler auth

**Files:** none (deploy + possible URL fix-up in `sites/smashmeup/index.html`)

- [ ] **Step 1: Auth check**

Run: `npx wrangler whoami` — expected: logged-in account. If not: **Namit runs `npx wrangler login`**.

- [ ] **Step 2: Push the branch → Simply branch preview**

```bash
git push -u origin feat/prelaunch
```

Then: `npx wrangler pages deployment list --project-name simply` — grab the newest deployment's preview URL (aliased `feat-prelaunch.<project>.pages.dev`). If no deployment appears (branch previews disabled), note it and check the CF dashboard.

- [ ] **Step 3: Create + deploy the smashmeup project**

```bash
npx wrangler pages project create smashmeup --production-branch main
npx wrangler pages deploy sites/smashmeup --project-name smashmeup --branch main
```

Expected: a live `https://smashmeup.pages.dev` (or suffixed variant) URL in the output.

- [ ] **Step 4: Reconcile URLs if they differ from assumptions**

If the real smashmeup domain isn't exactly `smashmeup.pages.dev`, update the `href` default in `src/components/ComingSoonPanel.astro` and the `og:image` in `sites/smashmeup/index.html`, re-run Step 3's deploy, and commit:

```bash
git add src/components/ComingSoonPanel.astro sites/smashmeup/index.html
git commit -m "fix(smashmeup): point cross-links at the real pages.dev URLs"
git push
```

- [ ] **Step 5: Click through both previews** — homepage card opens the smashmeup page in a new tab; "Meet Simply →" lands back on the Simply site.

---

### Task 9: Full verification before the client sees it

- [ ] **Step 1: Repo green**

Run: `npm run check` (0 errors), `npm test` (all pass), `npm run build` (succeeds; Instagram prebuild falls back gracefully offline).

- [ ] **Step 2: Format only the files this branch touched**

```bash
npx prettier --write src/components/ComingSoonPanel.astro src/components/BrandShowcase.astro src/pages/franchising.astro src/pages/about.astro src/pages/catering.astro src/pages/locations.astro src/layouts/Base.astro src/lib/peopleFed.ts tests/lib/peopleFed.test.ts sites/smashmeup/index.html scripts/build-smashmeup-assets.mjs
npm run lint
```

Commit any diffs: `git commit -am "chore: format"`.

- [ ] **Step 3: design-reviewer subagent** on the branch preview URL — homepage + `/franchising`, mobile throttling. Lighthouse ≥95 × 4 categories on both. Fix and re-run until pass.

- [ ] **Step 4: accessibility-auditor subagent** — homepage (new card in the rail: focus, name, contrast) + franchising (counter reduced-motion fallback). Fix and re-run until pass.

- [ ] **Step 5: Console check** — clean loads of `/`, `/franchising`, and the smashmeup URL show zero console errors/warnings.

- [ ] **Step 6: Hand the two preview URLs + a change summary to Namit for the client**, with the reminder that Porkbun changes (`docs/runbooks/domains-cutover.md`) run only after client approval, and the domain list + smashmeup.com confirmation are still needed for §4 of the runbook.
