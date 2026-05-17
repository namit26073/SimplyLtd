# Plan 0002 — Phase 2 build plan

**Date:** 2026-05-17
**Author:** Lead agent (Claude Opus 4.7)
**Status:** **Signed off by Namit 2026-05-17.** All Phase 3 entry questions answered. Slice 0 is unblocked.

**Primary visual reference added (Namit, 2026-05-17):** Amigos Burgers & Shakes — `amigosburgersandshakes.com`. Cutout product floating on flat colour ground, oversized stacked editorial display type ("BURGERS BURGERS BURGERS"), small playful sticker accents ("TOP QUALITY" badge, "MMMMMM…" callout, smiley emoji), strong split layout, confident negative space. This is the most direct positive reference for our v1 expression.

This plan operationalises the Phase 1 discovery report (see `docs/plans/0001-phase1-discovery.md`). It commits the locked decisions, defines the file structure and content model, sequences the build into vertical slices with verification gates, and specifies the multi-chat / subagent split and the git workflow.

---

## 0. TL;DR

- **Stack:** Astro 6 + Cloudflare Pages + Pages Functions + Resend + Turnstile + Zod + bespoke CSS.
- **Design centre:** cutout food photography on flat brand-coloured grounds + editorial typography (`Anton` / `Fraunces` / `Inter`) + three signature motion moments + WCAG 2.2 AA + ≥95 Lighthouse mobile.
- **13 vertical slices**, each with explicit verification gates (Lead-built, parallel-chat-built, or subagent-verified — labelled per slice).
- **Asset selection is collaborative.** Slice 3 produces an asset inventory; every visual slice (4-11) has an asset gate where Namit either provides the image, picks from a Lead-prepared shortlist, or selects from an Instagram-pulled manifest (§11).
- **Parallel chats fork after Slice 6** (sub-brand template proven), with up to 5 slices running in parallel.
- **Subagent invocations** baked into the slice acceptance criteria — design-reviewer + accessibility-auditor before any slice merges to `main`.
- **Git workflow:** feature branches per slice, atomic commits, conventional commits, squash-merge to `main` on slice acceptance.
- **First code commit:** after this plan is signed off — `chore: bootstrap Astro on Cloudflare Pages` (Slice 0).

---

## 1. Locked decisions (committed at Phase 2 entry)

These move from "proposal" to "decision" at sign-off. Each gets a brief ADR (`docs/decisions/00NN-<slug>.md`) at the start of Slice 0.

| # | Decision | Locked answer |
|---|---|---|
| 0001 | Stack | Astro 6 + Cloudflare Pages + Pages Functions + Resend + Turnstile + Zod, bespoke CSS, no Tailwind |
| 0002 | Hosting | Cloudflare Pages free tier (unlimited bandwidth, commercial OK) |
| 0003 | Type system | Display: `Anton`. Editorial: `Fraunces` (variable). Body: `Inter` (Q: confirm vs `IBM Plex Sans` — see §13) |
| 0004 | Palette | Parent: warm-cream `#F4EFE6` / off-black `#1A1A18` / canal-grey `#7A7E78`. Brand accents derived from logo halos; hex values locked at Slice 1 with on-screen review |
| 0005 | Visual treatment | Cutout food photography on flat brand-coloured grounds; type beside / below, never overlay-over-photo |
| 0006 | Brand showcase | Direction A — Editorial Fleet, cutout + scroll-snap + View Transitions to sub-brand page |
| 0007 | Motion budget | Three signature moments (hero-load, showcase-snap, form-success); reduced-motion halts not shortens |
| 0008 | Content model | Astro content collections, Markdown + MDX + Zod schemas; no headless CMS in initial build |
| 0009 | CMS layer (post-MVP slice) | Sveltia CMS at `/admin`, GitHub OAuth, free git-backed |
| 0010 | Email / forms backend | Cloudflare Pages Functions → Resend → `namitg26@gmail.com` (dev env); client address in prod env var |
| 0011 | Maps | Static map (build-time render) of Paddington Basin for the Locations page; no interactive tiles in v1 |
| 0012 | Truck count | Three (Falafel + Shawarma at Merchant Square W2 1PW; Burgers at Canal Side Walk W2 1AS) |
| 0013 | Identity in chrome | Parent `Simply Ltd` everywhere; no `Simply Falafel` residue in footer, title, mail-to, OG tags |

ADRs are short — decision, rationale, alternatives rejected, date. One file per decision.

---

## 2. Repository structure

```
SimplyLtd-FreshBuild/
├─ CLAUDE.md                          # domain context (existing)
├─ BRIEFING.md                        # session-start (existing)
├─ AGENT-WORKFLOW.md                  # multi-chat (existing)
├─ README.md                          # dev/build/preview commands, deploy notes
├─ .claude/
│  ├─ agents/                         # existing 3 subagents
│  ├─ commands/                       # existing 2 slash commands (/perf, /shoot)
│  └─ rules/                          # stack-specific rules — WRITTEN AT SLICE 0
│     ├─ astro.md                     # routing, content collections, image
│     ├─ islands.md                   # client-side JS budget (adapted from prior-build)
│     ├─ components.md                # naming, props, a11y (adapted)
│     ├─ forms.md                     # form structure, Pages Function pattern (adapted)
│     ├─ performance.md               # Lighthouse ≥95 (adapted)
│     └─ styles.md                    # tokens, brand scoping, CSS approach
├─ docs/
│  ├─ plans/
│  │  ├─ 0001-onboarding-checklist.md
│  │  ├─ 0001-phase1-discovery.md     # signed off 2026-05-17
│  │  └─ 0002-build-plan.md           # THIS DOC
│  ├─ decisions/                      # ADRs (one per decision in §1)
│  ├─ research/                       # incidental research notes
│  └─ screenshots/                    # /shoot output
├─ assets-inbox/                      # owner-provided + extracted, NOT built
│  ├─ videos/                         # FalafelVid.mp4, ShawarmaVid.mp4
│  ├─ logos/                          # raster, currently unused
│  ├─ current-site-extract/           # Wix audit + reference audits (existing)
│  └─ PLACEHOLDERS.md                 # placeholder log
├─ public/                            # static assets served as-is (favicons, OG images, robots.txt)
├─ functions/                         # Cloudflare Pages Functions
│  └─ api/
│     ├─ catering.ts
│     └─ franchising.ts
├─ src/
│  ├─ assets/                         # build-optimised images (cutouts, videos)
│  │  ├─ placeholders/                # curated placeholders, swap targets
│  │  └─ videos/                      # owner-provided, re-encoded
│  ├─ components/                     # .astro presentational
│  │  ├─ Header.astro
│  │  ├─ Footer.astro
│  │  ├─ Hero.astro
│  │  ├─ WaysToEnjoy.astro
│  │  ├─ BrandShowcase.astro
│  │  ├─ BrandPanel.astro
│  │  ├─ LocationCard.astro
│  │  └─ ...
│  ├─ islands/                        # React, hydrate on demand
│  │  └─ forms/
│  │     ├─ Catering.tsx
│  │     └─ Franchising.tsx
│  ├─ content/                        # collections
│  │  ├─ brands/                      # falafel.md, shawarma.md, ...
│  │  ├─ locations/                   # merchant-square.md, canal-side.md
│  │  ├─ testimonials/                # if/when client provides
│  │  └─ press/                       # if/when client provides
│  ├─ content.config.ts               # Zod schemas
│  ├─ layouts/
│  │  ├─ Base.astro                   # html shell, fonts, meta
│  │  └─ Brand.astro                  # adds [data-brand="slug"]
│  ├─ pages/
│  │  ├─ index.astro                  # homepage
│  │  ├─ [brand]/index.astro          # dynamic per-brand
│  │  ├─ catering.astro
│  │  ├─ franchising.astro
│  │  ├─ locations.astro
│  │  ├─ about.astro
│  │  ├─ contact.astro
│  │  ├─ 404.astro
│  │  └─ admin/                       # Sveltia CMS (Slice 12)
│  ├─ schemas/                        # Zod schemas shared between client + Pages Function
│  │  ├─ catering.ts
│  │  └─ franchising.ts
│  ├─ styles/
│  │  ├─ tokens.css                   # design tokens (colour, type, space, motion)
│  │  ├─ reset.css
│  │  ├─ typography.css
│  │  ├─ transitions.css              # view-transition names
│  │  └─ brands/                      # per-brand accent overrides
│  │     ├─ falafel.css
│  │     ├─ shawarma.css
│  │     ├─ lebanese.css
│  │     ├─ burgers.css
│  │     └─ pasta.css
│  └─ utils/                          # tiny helpers, no framework
├─ tests/                             # Vitest — see §11 testing policy
│  ├─ schemas/
│  └─ functions/
├─ astro.config.mjs
├─ tsconfig.json                      # strict mode
├─ package.json
└─ wrangler.toml                      # Cloudflare Pages config
```

Notes on the structure:

- **`.claude/rules/` are written at Slice 0**, adapted from `references/prior-build-rules/` for an Astro 6 stack. They become path-scoped behaviour for the Lead and forked chats — keeps every conversation aligned on stack discipline without bloating CLAUDE.md.
- **`src/content/` + `content.config.ts` is the source of truth** for brand / location / menu data. No CMS needed in initial build; Sveltia CMS plugs onto this in Slice 12.
- **`src/schemas/`** holds Zod schemas shared between the form island and the Pages Function — one definition, both sides validate against it.

---

## 3. Design system (locked at Slice 1, refined as slices progress)

### 3.1 Tokens (`src/styles/tokens.css`)

```css
:root {
  /* Parent palette */
  --color-cream:    #F4EFE6;
  --color-ink:      #1A1A18;
  --color-canal:    #7A7E78;
  --color-line:     color-mix(in srgb, var(--color-ink) 8%, transparent);

  /* Type scale (modular, ratio 1.25, base 17px) */
  --fs-100: 0.75rem;     /* 12px — caption */
  --fs-200: 0.875rem;    /* 14px — small */
  --fs-300: 1rem;        /* 17px — body, base */
  --fs-400: 1.25rem;     /* 21px — lede */
  --fs-500: 1.5625rem;   /* 27px — section sub */
  --fs-600: 1.953rem;    /* 33px — section h2 */
  --fs-700: 2.441rem;    /* 41px — page h1 mobile */
  --fs-800: 3.815rem;    /* 65px — hero h1 mobile */
  --fs-900: 7.451rem;    /* 127px — showcase wordmark mobile (responsive +) */

  /* Type families (loaded via Astro Fonts API) */
  --ff-display:   "Anton", system-ui, sans-serif;
  --ff-editorial: "Fraunces", Georgia, serif;
  --ff-body:      "Inter", system-ui, sans-serif;

  /* Space scale (modular, ratio 1.5, base 8px) */
  --sp-1: 0.5rem;        /* 8 */
  --sp-2: 0.75rem;       /* 12 */
  --sp-3: 1rem;          /* 16 */
  --sp-4: 1.5rem;        /* 24 */
  --sp-5: 2.25rem;       /* 36 */
  --sp-6: 3.375rem;      /* 54 */
  --sp-7: 5rem;          /* 80 */
  --sp-8: 7.5rem;        /* 120 */

  /* Motion */
  --ease-out:     cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out:  cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast:     180ms;
  --dur-base:     320ms;
  --dur-slow:     700ms;

  /* Radii / shadows used sparingly */
  --r-sm: 6px;
  --r-md: 12px;
  --r-lg: 20px;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-fast: 0ms;
    --dur-base: 0ms;
    --dur-slow: 0ms;
  }
}
```

### 3.2 Brand accents (`src/styles/brands/*.css`)

Each file sets `--color-accent` and `--color-accent-contrast` on `[data-brand="slug"]`. Hex values are placeholder pending Slice 1 on-screen review (the logo halos are the starting point):

| Brand | `--color-accent` (start) | `--color-accent-contrast` |
|---|---|---|
| Falafel | `#3F7A3A` (deep leaf green) | `#F4EFE6` |
| Shawarma | `#E8B83A` (warm gold-yellow) | `#1A1A18` |
| Lebanese | `#A6342E` (oxblood red) | `#F4EFE6` |
| Burgers | `#C03020` (deep red) | `#F4EFE6` |
| Pasta | `#E07A2A` (warm orange) | `#1A1A18` |

Contrast pair locked at Slice 1 after running through the WCAG 2.2 AA contrast checker; values above are starting candidates.

### 3.3 Three signature motion moments

1. **Hero load** — display headline letter-spacing `0.04em → 0` over 700 ms ease-out, subhead + CTAs fade-up 200 ms behind.
2. **Brand showcase snap** — viewport scroll-snap to each panel. Within a panel, the cutout image translates up 40 px and the wordmark fades from 0 → 1 (320 ms) as the panel pins.
3. **Form success state** — submit → spinner (180 ms) → form fades to 0 → success state fades up with a tick that draws (CSS `stroke-dashoffset` animation, 700 ms ease-in-out).

Each moment has a reduced-motion path that delivers the same information with zero animation. The accessibility-auditor verifies that the non-motion view is complete on its own per slice.

### 3.4 Cutout-photography production recipe

Slice 3 (content schemas) is also when placeholder cutouts get curated. The recipe:

1. Search Unsplash / Pexels for the dish type photographed on a clean background (white, light wood, soft cream).
2. If the source already has a near-flat background, use a CSS `mask-image` derived from the alpha threshold, or generate a clean alpha via `remove.bg` (one-shot service, free for a handful of images) and store the PNG.
3. Where source quality won't yield a clean cutout, accept a soft circular vignette + matched background colour instead of a hard cutout.
4. Log every placeholder in `assets-inbox/PLACEHOLDERS.md`: source URL, photographer credit, why placeholder, swap target, used on which page.
5. Selection bar: would the **client** look at this image and say "yes, that's the energy I want my food photographed at"? If no, keep searching.

Lead curates placeholders at Slice 3. Not delegated to a subagent — the curation is a craft activity and the quality bar is the single biggest determinant of how v1 reads.

---

## 4. Content schemas

Defined in `src/content.config.ts` with Zod. Sketch:

```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const brands = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/brands" }),
  schema: ({ image }) => z.object({
    slug: z.enum(["falafel", "shawarma", "lebanese", "burgers", "pasta"]),
    name: z.string(),                         // "Simply Falafel"
    tagline: z.string().max(80),
    introDek: z.string().min(60).max(200),    // 18-22 word editorial dek
    cuisine: z.string(),                      // "Vegan/Vegetarian Levantine"
    voice: z.string(),                        // tone description
    establishedYear: z.number().optional(),   // deferred per Phase 1 Q2
    visible: z.boolean().default(true),       // for hiding Pasta/Lebanese if needed
    primaryPitchSlug: z.string(),             // -> locations collection
    heroImage: image(),                       // cutout PNG
    accentToken: z.enum(["falafel", "shawarma", "lebanese", "burgers", "pasta"]),
    dietary: z.array(z.enum(["vegan", "vegetarian", "halal", "gluten-free"])).optional(),
    behindCounterVideo: z.string().optional(),// path under src/assets/videos/ if we have it
  }),
});

const locations = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/locations" }),
  schema: z.object({
    slug: z.string(),
    name: z.string(),                         // "Merchant Square"
    addressLines: z.array(z.string()),
    postcode: z.string(),                     // "W2 1PW"
    coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
    brandsOnPitch: z.array(z.string()),       // refs to brands collection slugs
    openingHours: z.object({
      mon: z.string().optional(),
      tue: z.string().optional(),
      wed: z.string().optional(),
      thu: z.string().optional(),
      fri: z.string().optional(),
      sat: z.string().optional(),
      sun: z.string().optional(),
    }),
    notes: z.string().optional(),
  }),
});

export const collections = { brands, locations };
```

`testimonials` and `press` collections are stubbed but unpopulated until the client provides material.

---

## 5. Routing + URLs

| Path | Page | Purpose |
|---|---|---|
| `/` | `pages/index.astro` | Homepage: hero + ways-to-enjoy + brand showcase |
| `/falafel/` | `pages/[brand]/index.astro` | Sub-brand page (dynamic for the 5 brands) |
| `/shawarma/` | same | |
| `/lebanese/` | same | |
| `/burgers/` | same | |
| `/pasta/` | same (visible toggle from content) | |
| `/catering/` | `pages/catering.astro` | Long-form + form |
| `/franchising/` | `pages/franchising.astro` | Long-form + form |
| `/locations/` | `pages/locations.astro` | Static map + 3 pitches |
| `/about/` | `pages/about.astro` | Founder origin (lightly edited from Wix extract) |
| `/contact/` | `pages/contact.astro` | Contact (deferred email + phone) |
| `/admin/` | Sveltia CMS bundle | Slice 12 |
| `/404` | `pages/404.astro` | |

Sub-brand domains (`simplypasta.co.uk` etc.) 301-redirect to `/<slug>/` at production cutover — DNS-level concern handled in Phase 4.

---

## 6. Vertical slice sequence

Thirteen slices ordered by dependency. Each entry: **who owns it**, **what's in scope**, **acceptance gates**, **commit/branch plan**.

The owner field is one of: **Lead** (this chat, careful slow work), **Parallel chat** (a separately-spawned Claude Code chat with a hand-off brief), **Subagent** (one of the three pre-wired agents, called for verification not implementation).

### Slice 0 — Repo bootstrap (Lead, ~30 min)

- `git init` on `main`
- `npm create astro@latest` with TypeScript strict
- Add `@astrojs/cloudflare` adapter
- Add React integration (for islands)
- Add ESLint + Prettier (minimal config)
- Add Vitest (for schema + function tests)
- Write `.claude/rules/{astro,components,islands,forms,performance,styles}.md` adapted from `references/prior-build-rules/`
- Write `README.md` (dev / build / preview / test commands)
- Write `docs/decisions/0001-stack.md` and 0002 through 0013 ADRs (each 5-10 lines)
- First commit: `chore: bootstrap Astro on Cloudflare Pages`

**Acceptance:**
- `astro check` exits 0
- `astro dev` starts on http://localhost:4321 and renders the default Astro splash
- `npm run build` produces a `dist/` folder
- No console warnings in dev

**No subagent verification needed at this slice** — there's nothing UI-rendered to audit yet.

### Slice 1 — Design system foundation (Lead, ~2-3 h)

- Write `src/styles/tokens.css`, `reset.css`, `typography.css`, `transitions.css`, `brands/*.css`
- Configure Astro Fonts API for Anton, Fraunces, Inter (self-hosted, subset to Latin + symbols)
- Write `src/layouts/Base.astro` (HTML shell, font loading, meta, `[data-brand]` attribute hook, view-transitions config)
- Build a single throwaway page at `/__designsystem` that renders the type scale, palette, and motion samples for visual review
- Lock the brand-accent hex values via on-screen contrast check

**Acceptance:**
- `/__designsystem` renders correctly (Lead inspects)
- `lighthouse_audit` mobile on `/__designsystem`: ≥95 across all four categories (subagent: design-reviewer)
- Console clean
- No TS errors
- `prefers-reduced-motion: reduce` halts the motion samples (subagent: accessibility-auditor)

**Branch / commit:** branch `feat/design-system`; commits: `feat: tokens and base layout`, `feat: typography system (anton, fraunces, inter)`, `feat: brand accent variables`. Squash-merged to `main` on acceptance.

### Slice 2 — Header + Footer (Lead, ~1-2 h)

- `Header.astro` — minimal nav (Catering, Franchising, Locations, About — only 4 items, each resolves)
- Mobile menu via CSS-only `<details>` + small enhancement script (no React)
- `Footer.astro` — parent identity (Simply Ltd, not Simply Falafel), real address (Merchant Square + Canal Side Walk), placeholder mail-to, social-link stubs
- Wire into `Base.astro`

**Acceptance:**
- design-reviewer: mobile + desktop screenshots; no defects
- accessibility-auditor: keyboard nav, focus order, mobile menu announces correctly, no `outline: none`
- /perf: ≥95 mobile on a blank page rendering only header + footer

**Branch:** `feat/header-footer`. Squash-merged.

### Slice 3 — Content schemas + asset inventory (Lead + Namit, ~2-3 h)

This slice is **content data + an asset map**, *not* placeholder selection. Actual image selection happens per-slice in the asset gate (see §11.2).

- Write `src/content.config.ts` (per §4)
- Populate `src/content/brands/{falafel,shawarma,lebanese,burgers,pasta}.md` — content fields filled with extracted Wix copy where available, working copy where placeholder. Lebanese and Pasta files get `visible: false` per Q3.
- Populate `src/content/locations/{merchant-square,canal-side-walk}.md`
- Re-encode the two owner videos: H.264 + VP9 WebM, sub-2MB each, kept short. Drop into `src/assets/videos/`
- Write `docs/asset-inventory.md` — one row per image slot across the 6 visible pages in v1, with: slot id, slice it belongs to, spec (cutout vs scene, rough aspect, role/mood), possible reuse, current state (`needs-selection` / `owner-provided` / `selected`). Inventory reflects 3 visible brands (Lebanese + Pasta hidden).

**Acceptance:**
- `astro check` exits 0
- Content collections type-resolve on the design-system page
- `docs/asset-inventory.md` exists, lists every image slot in v1, and **Namit has reviewed and signed off the inventory** (not the actual images yet — those happen per slice)

**Branch:** `feat/content-schemas`. Squash-merged.

**Note:** Asset selection is *not* in Slice 3. Each visual slice has its own asset gate (§11.2) where you and I pick images together. This slice's job is to know *what* we need; the per-slice gates decide *which* image fills each slot. Per Q7, Instagram is NOT used as a placeholder source — pre-cut PNG libraries are the preferred path; Unsplash + remove.bg the fallback.

### Slice 4 — Homepage hero + ways-to-enjoy first-fold (Lead + Namit, ~3-4 h + asset gate)

**Asset gate (before build):**
- Slots needed: `home-hero` (1), `wte-catering` `wte-franchising` `wte-locations` `wte-menu` (4)
- Lead runs §11.2 gate for each; Namit picks Path A / B / C per slot
- All 5 slot images land in `src/assets/placeholders/` before code begins

**Build:**
- `pages/index.astro` — sectioned scaffold
- `Hero.astro` — cutout food image + display headline + origin-story subhead + two CTAs. Implements the load-time letter-spacing motion.
- `WaysToEnjoy.astro` — four-card grid (Catering / Franchising / Locations / Menu). Each card: cutout, one-line, CTA. Mobile: stacked; desktop: 2×2 or 4-in-a-row depending on visual review.

**Acceptance:**
- design-reviewer mobile + desktop screenshots; passes the "Apple/Adidas advert" smell test (Lead's own bar, then yours)
- accessibility-auditor: keyboard tab order Hero → 4 cards → header; reduced-motion halts the headline letter-spacing
- /perf: ≥95 mobile (this slice is the first real perf test of the live design)
- LCP image is the hero cutout, ≤200 KB after responsive selection
- CLS = 0

**Branch:** `feat/homepage-hero`. Atomic commits inside: `feat: hero composition`, `feat: ways-to-enjoy four-card`, `style: hero motion polish`. Squash-merged.

### Slice 5 — Brand showcase (Lead + Namit, ~3-4 h + asset gate)

**Asset gate (before build):**
- Slots needed (v1, Lebanese + Pasta hidden per Q3): `showcase-falafel`, `showcase-shawarma`, `showcase-burgers` (3)
- Lead runs §11.2 gate for each; Namit picks per-brand
- All 3 cutouts land in `src/assets/placeholders/showcase/` before code begins
- These same cutouts may be reused as the brand-page heroes in Slices 6 + 7 — Namit confirms reuse intent or asks for distinct brand-page heroes

**Build:**
- `BrandShowcase.astro` — full-bleed scroll-snap container
- `BrandPanel.astro` — one panel template, parameterised on brand
- Implements scroll-snap, panel pin-on-entry, cutout-translate + wordmark fade-in (motion moment #2)
- View Transitions API names declared in `transitions.css` for the brand-wordmark cross-page transition (lands the user on `/<brand>/` in Slice 6)
- Mounted on the homepage below ways-to-enjoy

**Acceptance:**
- design-reviewer mobile + desktop; passes the "this is the homepage hero moment" bar
- accessibility-auditor:
  - keyboard nav between panels works (panels are reachable, no scroll trap)
  - visually-hidden `<ul>` of brand links exists as the screen-reader alternative
  - reduced-motion: scroll-snap stays, but the cutout-translate / wordmark fade is halted
- /perf: ≥95 mobile with the showcase active (the first big perf test)

**Branch:** `feat/brand-showcase`. Squash-merged.

### Slice 6 — Sub-brand page template, piloted on Falafel (Lead + Namit, ~2-3 h + asset gate)

**Asset gate (before build):**
- Slots needed for Falafel pilot: `falafel-hero` (may reuse `showcase-falafel`), `falafel-behind-counter` (use owned `FalafelVid.mp4`), `falafel-menu-thumb` (optional, can come later)
- Lead runs §11.2 gate for `falafel-hero` if not reused
- Final pilot assets in place before code begins

**Build:**
- `pages/[brand]/index.astro` — dynamic route
- `layouts/Brand.astro` — wraps in `[data-brand="slug"]`, swaps `--color-accent`
- Sections: hero (cutout + wordmark + dek) → "behind the counter" (the Falafel video) → menu summary (only Falafel has real menu data) → primary pitch card (Merchant Square) → cross-link strip ("Try our other concepts")
- View transition from showcase panel into sub-brand hero

**Acceptance:**
- design-reviewer on `/falafel/` mobile + desktop
- accessibility-auditor: video has accessible name + caption stub; brand-accent contrast passes ≥4.5:1; reduced-motion: video does not autoplay (poster shown, controls available)
- /perf: ≥95 mobile

**Branch:** `feat/brand-page-template`. Squash-merged.

**>>> THIS IS THE FORK POINT. <<<** After Slice 6 is on `main`, Slices 7–10 run in parallel chats. Slice 11 stays with Lead.

### Slice 7 — Sub-brand pages: Shawarma + Burgers (2 parallel chats, ~1-2 h each)

(Lebanese and Pasta are `visible: false` per Q3 — no public pages built in v1; their content files exist and can be flipped on later with one schema change plus an asset gate run.)

**Asset gate (Lead + Namit, before forking chats):**
- For each of the 2 brands: confirm reuse of `showcase-<slug>` cutout for the page hero OR run §11.2 gate for a richer `<slug>-hero` asset
- For Shawarma: `shawarma-behind-counter` uses owned `ShawarmaVid.mp4`
- For Burgers: `burgers-behind-counter` is a still image — run §11.2 gate
- All brand-specific assets land in `src/assets/placeholders/<brand>/` BEFORE Lead spawns the parallel chats. Parallel chats DO NOT select assets — Lead has done that with you, the chats build with the assets already in place.

**Build:**

Each parallel chat:
- Is briefed with: this build plan, the brand template at `pages/[brand]/index.astro`, the brand's content file at `src/content/brands/<slug>.md`, the brand's accent CSS, the brand's pre-selected assets, and **only** the brand-specific instructions
- Operates on a feature branch named `feat/brand-<slug>` (Lead pre-creates them)
- Commits small atomic changes per the conventional-commit style
- Invokes design-reviewer + accessibility-auditor on the rendered `/brand/` URL
- Returns a short report to Lead with: branch name, slices touched, audit results, any deviations
- **Does NOT merge to `main`** — Lead reviews and squash-merges

**Acceptance per brand (Lead checks):**
- The parallel chat's audit reports show pass on both subagents
- design-reviewer + accessibility-auditor verdicts match the Lead's own smoke test
- No console errors
- /perf: ≥95 mobile

### Slice 8 — Catering page + form (Lead + Namit asset gate; 1 parallel chat for the form island; ~3-4 h combined)

**Asset gate (Lead + Namit, before fork):**
- Slots needed: `catering-hero` + up to 5 event-type tiles (`catering-event-wedding`, `corporate`, `festival`, `private`, `other`)
- Lead runs §11.2 gate; event-type tiles are good candidates for Path B (Unsplash shortlists — wedding / corporate / festival scenes are well-represented) or Path C if Instagram has event coverage
- Assets land before page chrome work begins

**Parallel chat scope** (form island, no asset selection):
- `src/schemas/catering.ts` — shared Zod schema
- `src/islands/forms/Catering.tsx` — React island, hydrated `client:visible`
- `functions/api/catering.ts` — Cloudflare Pages Function: Turnstile verify → Zod validate → Resend send → JSON response
- Vitest unit tests for the schema and the function
- Honeypot field, `aria-live` errors, success-state component
- Posts to `namitg26@gmail.com` in dev; env-var-driven in prod

**Lead scope** (page chrome):
- `pages/catering.astro` — earn-the-enquiry structure: hero, event types, capability copy, lead time, coverage area, FAQ, form last
- Pulls `<Catering />` island in `client:visible`

**Acceptance:**
- design-reviewer
- accessibility-auditor: form a11y (label/input pairs, required markers, error announcement, success focus return)
- **Functional test:** submit the form on the preview build, confirm the email lands in `namitg26@gmail.com` with the expected payload
- Schema unit tests pass
- /perf: ≥95 mobile

**Branch:** `feat/catering`. Lead merges parallel-chat work into the branch first, then squash-merges to `main`.

### Slice 9 — Franchising page + form (Lead + Namit asset gate; 1 parallel chat for the form; ~3-4 h)

**Asset gate (Lead + Namit, before fork):**
- Slots needed: `franchising-hero`, plus 2–3 supporting (`franchising-truck-life`, `franchising-training`, `franchising-supply` — final list decided with Namit)
- Lead runs §11.2 gate. Truck-exterior shots from Instagram (if available) are the strongest fit for the hero.
- Assets land before page chrome work begins.

**Build:** Identical structure to Slice 8, qualification-led page copy. Higher-intent visitors expected; longer form is the filter, per CLAUDE.md.

### Slice 10 — Locations page (Lead + optional Namit asset gate; ~1-2 h)

**Asset gate (optional, before build):**
- Map is built (hand-crafted SVG), not sourced — no asset selection needed for the map itself
- Optional slots: `pitch-merchant-square` and `pitch-canal-side` atmosphere shots
- Lead asks Namit: skip these (clean, minimalist locations page) or include them (more immersive)? If included, run §11.2 gate per slot — strong candidates for Instagram canal-side / truck-exterior shots if available

**Build:**
- `pages/locations.astro`
- Static SVG map of Paddington Basin showing the two pitches (canal as a curve, the two pitch markers as brand-coloured dots). Hand-crafted SVG, not a tile-map render — keeps Lighthouse trivial and adds visual personality.
- 3 pitch cards (Falafel + Shawarma at Merchant Square treated as two trucks, one address; Burgers at Canal Side Walk)
- Per-pitch opening hours table

**Acceptance:**
- design-reviewer
- accessibility-auditor: SVG map has accessible name + a `<ul>` text alternative; pitch addresses are marked-up with `<address>` and `microformats h-card`
- /perf: ≥95 mobile

**Branch:** `feat/locations`. Squash-merged.

### Slice 11 — About + Contact + 404 (Lead + Namit asset gate; ~1-2 h)

**Asset gate (Lead + Namit, before build):**
- Slots needed: `about-founder` (likely deferred — no founder photo available) and `about-origin-2019` (likely deferred — no 2019 archive photo). Confirm with Namit: defer (about page leans typographic) or run §11.2 gate with stand-ins (e.g. an evocative truck-or-canal scene rather than a literal founder photo).
- Contact page is text-only; 404 may use a small inline graphic — decide at gate.

**Build:**
- `pages/about.astro` — founder origin lightly edited from the Wix extract (rewrite to remove the "seven trucks" claim and the marketing-speak; keep the genuine 2019 → Shawarma → Lebanese → Burgers chronology)
- `pages/contact.astro` — phone + (deferred) email + map link to Locations
- `pages/404.astro` — branded, useful

**Acceptance:**
- design-reviewer per page
- accessibility-auditor per page
- All internal links resolve (no 404s within the site)
- /perf ≥95 each

**Branch:** `feat/about-contact-404`. Squash-merged.

### Slice 12 — Sveltia CMS at /admin (Lead, ~2-3 h)

- Vendor Sveltia CMS files into `public/admin/` (per Sveltia's static deploy guide)
- Write `public/admin/config.yml` matching the content collections + image folders
- Wire GitHub OAuth via Cloudflare Workers OAuth proxy (free, ~30 lines)
- Smoke test: log in as Namit, edit a copy field, see the deployment update

**Acceptance:**
- design-reviewer on `/admin/` (basic UI sanity check)
- A round-trip edit succeeds: change a field, commit lands on the repo, Cloudflare rebuilds, change is live within 90 seconds
- No client credentials in repo; OAuth secrets are in Cloudflare env vars

**Branch:** `feat/sveltia-cms`. Squash-merged.

### Slice 13 — Cross-cutting passes (Lead + subagents, ~2-3 h)

- Full accessibility audit of every page (accessibility-auditor batch run)
- Full performance audit of every page (/perf batch run)
- Link audit: crawl the site, no internal 404s, no broken external links
- Copy pass: read every word; remove any Wix template residue, fix the "Haloumi" / "Halloumi" / "Humous" inconsistencies in menu data, normalise voice per sub-brand
- SEO pass: per-page meta description, OG image, structured data (LocalBusiness for each pitch)
- Final commit: `chore: pre-cutover polish pass`

**Acceptance:**
- All 8 pages ≥95 mobile across all four Lighthouse categories
- All 8 pages pass accessibility-auditor with no failures (quick-wins allowed; failures not)
- No broken internal links
- No Wix template residue

**Branch:** small atomic commits direct to `main` (these are fixes, not features).

---

## 7. Multi-chat / subagent parallelism strategy

Per Namit's explicit ask: this section captures how we minimise context-window load and run independent work in parallel.

### 7.1 What stays in the Lead chat

- The entire plan + all decisions + all integration
- Slices 0–6, 10, 11, 12, 13 (built directly by Lead)
- Subagent invocations + interpretation of their reports
- Merge of all parallel-chat branches to `main`
- All client-facing communication

### 7.2 What forks into parallel chats

| Trigger | Chats spawned | Estimated parallel time | Joined back via |
|---|---|---|---|
| Slice 6 complete | 4 chats — Shawarma, Lebanese, Burgers, Pasta sub-brand pages | ~1-2 h each, all running concurrently | Squash-merge of `feat/brand-<slug>` branches |
| Slice 7 complete | 2 chats — Catering form island, Franchising form island | ~2-3 h each | Squash-merge of `feat/catering` and `feat/franchising` |

Up to **6 parallel chats can run simultaneously** after Slice 6 wraps. In practice they don't all start at once — Lead spawns brand chats first, integrates as they return, then spawns the form chats. Wall-clock saving: ~6-8 hours of strict-sequential work compressed into ~3-4 hours of parallel work.

### 7.3 Parallel-chat brief template

Each forked chat opens a fresh Claude Code session and receives a focused brief that includes:

```
You are picking up Slice <N> of the Simply Ltd rebuild.

Read these files first:
  - CLAUDE.md
  - docs/plans/0002-build-plan.md (this plan)
  - .claude/rules/<scope>.md (path-scoped to your slice)
  - <the specific content + asset files for your slice>

Your scope is:
  - <exact files you touch>
  - <exact subagent verifications you must pass>

You operate on branch: feat/<slug>
You do NOT merge to main. You squash-prep the branch, run the subagent audits, and report back to Lead.

Quality bar: <link to acceptance criteria in this plan>
```

The brief is small — ~30 lines — keeping the spawned chat's initial context low.

### 7.4 Subagent invocation policy

Per `.claude/agents/*.md`:

- **design-reviewer**: runs after **every** slice that ships visible UI, before squash-merge. Returns: Lighthouse mobile scores, mobile + desktop screenshots, defect list. Lead uses the report to decide ship/iterate.
- **accessibility-auditor**: runs after **every** slice that includes interactive elements or motion, before squash-merge. Returns: WCAG 2.2 AA verdict + reduced-motion verdict + specific failures.
- **content-researcher**: **not re-invoked in Phase 3** under current plan. Reserve for if we need to verify the Wix site has not changed before cutover, or if Namit asks for the Instagram-photography pull.

Subagent reports are short by design. They don't bloat the Lead's context — they hand back a verdict + a defect list.

### 7.5 Context window discipline for Lead

- The Lead chat **never** reads full content of files a subagent or parallel chat has audited — only their reports.
- When Lead merges a parallel-chat branch, Lead reviews the diff via `git diff main...feat/<slug>` (compact), not by re-reading the chat transcripts.
- Plan docs (`docs/plans/`) and ADRs (`docs/decisions/`) are the persistence layer. The Lead chat references them by path, not by re-quoting.
- If the Lead context ever feels heavy, the action is to: (a) commit and ADR-document outstanding decisions, (b) summarise progress to the user, (c) start a fresh Lead chat with a brief that points at the docs.

---

## 8. Git workflow

Per BRIEFING.md + the user's emphasis on git discipline.

### 8.1 Branching

- `main` — always green, always deployable. Cloudflare Pages auto-deploys on push.
- `feat/<slice-slug>` — one per slice. Created by Lead at slice start, deleted after squash-merge.
- No long-lived feature branches.
- No direct commits to `main` for Slices 0–12. Slice 13 (cross-cutting polish) is the exception — small atomic fixes go straight to `main`.

### 8.2 Commit conventions

```
<type>: <subject in imperative mood, <72 chars>

<optional body, wrap 72>

<optional footer, links / refs>
```

Types used: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `style:`, `test:`, `perf:`.

One logical change per commit. If a commit needs `and` in the subject, it should probably be two commits.

### 8.3 Squash-merge protocol

Every feature branch merges into `main` via squash. Final commit message format:

```
<type>(<slice-slug>): <slice description>

Slice <N> per docs/plans/0002-build-plan.md.
- <key change 1>
- <key change 2>

Verified:
- design-reviewer: pass
- accessibility-auditor: pass
- Lighthouse mobile: P95 / A95 / B95 / S95
```

### 8.4 Pre-merge checklist (Lead enforces)

For each `feat/<slug>` branch, before squash-merge:

- [ ] `astro check` exits 0
- [ ] Unit tests (where present) pass
- [ ] `npm run build` succeeds
- [ ] design-reviewer report attached or referenced
- [ ] accessibility-auditor report attached or referenced
- [ ] `git log feat/<slug>` reviewed for commit hygiene
- [ ] Lead has visually checked the rendered page (not just trusted the audits)
- [ ] No `console.log` debug statements; no `// TODO` left without a reason

### 8.5 Pre-commit hooks (Slice 0 sets up)

- `eslint --fix` on staged TS/TSX
- `prettier --write` on staged files
- `astro check` (skips on `--no-verify`, but per BRIEFING.md never skip hooks)

### 8.6 Remote + push policy

- **No `git remote add origin` until Namit creates the GitHub repo and shares the URL.** Flagged when ready.
- Once the remote exists, Lead pushes after every slice merge.
- Never force-push to `main`. Never push without first showing Namit what's about to go up if it's the first push or if 5+ commits have accumulated since last push.

---

## 9. Verification gates

Defined once here so each slice doesn't need to re-state them.

### 9.1 Per-slice gates (run before squash-merge)

| Gate | Tool | Pass criterion |
|---|---|---|
| Asset gate (visual slices only) | Lead + Namit per §11.2 | every required slot for the slice has a Namit-approved asset in `src/assets/` before code starts |
| Type-check | `astro check` | exit 0 |
| Build | `npm run build` | exit 0, `dist/` produced |
| Unit tests | `vitest run` | all pass (only on slices with tests) |
| Lighthouse mobile | design-reviewer subagent | ≥95 on all 4 categories |
| Visual review | design-reviewer subagent | screenshots match design intent; no defects |
| WCAG 2.2 AA | accessibility-auditor subagent | pass (no failures; quick-wins acceptable) |
| Reduced-motion | accessibility-auditor subagent | halted, not shortened |
| Console clean | design-reviewer report | no errors, no warnings on a clean load |
| Functional smoke | Lead's visual test | feature works as intended in dev preview |

### 9.2 Slice-13 cross-cutting gates (run before deploy)

| Gate | Tool | Pass criterion |
|---|---|---|
| Every-page Lighthouse | /perf batch | ≥95 mobile every page |
| Every-page a11y | accessibility-auditor batch | pass every page |
| Link audit | manual crawl + Lead | no internal 404s |
| Wix-residue audit | Lead grep | no "Simply Falafel" in footers / titles / mailtos |
| OG tags audit | Lead | every page has a unique title, description, OG image |

### 9.3 Pre-cutover gates (Phase 4)

| Gate | Tool | Pass criterion |
|---|---|---|
| Real form submission | Lead end-to-end test | catering + franchising emails land in production address |
| OAuth flow for CMS | Namit + Lead | Sveltia login works on production |
| DNS readiness | Namit | client owns the cutover decision |
| Owner walkthrough | Namit + client | client signs off the preview URL |

---

## 10. Testing policy

Per BRIEFING.md "testing is for things that will break."

**Test:**
- Zod schemas (`src/schemas/*.ts`) — invalid input rejected, valid input accepted, edge cases covered
- Cloudflare Pages Functions (`functions/api/*.ts`) — Turnstile verification path, Zod validation rejection, Resend success, Resend failure, honeypot rejection
- Any pure-logic utility added to `src/utils/`

**Don't test:**
- Component rendering
- CSS layout
- Design tokens
- Astro routing

Test framework: **Vitest** (small, fast, native ESM). Tests live in `tests/`. CI not configured in v1 — `npm run test` is the gate. CI can come post-handover.

---

## 11. Photography & asset workflow

The single biggest v1 risk per Namit's Q5 answer. Asset selection is **collaborative** — Namit either provides the image directly, picks from a shortlist Lead prepares, or marks Instagram posts for harvest. Lead does not pick placeholders alone.

### 11.1 Asset inventory (Slice 3 deliverable)

Slice 3 produces `docs/asset-inventory.md` — a single document listing every image slot in v1 across all 6 visible pages (Lebanese + Pasta hidden per Q3). One row per slot with:

- **Slot id** (e.g. `home-hero`, `showcase-falafel`, `catering-event-wedding`)
- **Slice** the slot is used in
- **Spec** — cutout vs scene; rough aspect ratio; mood / role; brand context
- **Possible reuse** — can this slot share an asset with another slot? (Many can.)
- **Status** — `needs-selection` / `owner-provided` / `selected`

Indicative inventory at planning time, ~15-18 slots (3 visible brands):

| Pages | Slots |
|---|---|
| Homepage | hero, ways-to-enjoy × 4 (catering, franchising, locations, menu), showcase × 3 (Falafel, Shawarma, Burgers) |
| Sub-brand pages × 3 | brand-hero × 3 (may reuse showcase cutouts), behind-counter × 3 (Falafel + Shawarma videos owned, Burgers needs a still) |
| Catering | hero, event-types × up-to-5 |
| Franchising | hero, supporting × 2-3 |
| Locations | optional pitch-atmosphere × 0-2 (map is built, not sourced) |
| About | founder + origin × 1-2 (likely deferred) |

Inventory is reviewed and signed off by Namit before any visual slice runs. The actual image choices come later, per the gate below.

### 11.2 Per-slice asset gate

Every visual slice (4, 5, 6, 7, 8, 9, 10, 11) has an explicit gate that runs **before** building starts. Source decision per Q7 (Namit, 2026-05-17): **Instagram is not used for placeholders** (resolution too low). High-quality transparent-PNG cutouts are the target. Three sourcing paths per slot:

**Path A — Owner-provided.** Namit drops a file into `assets-inbox/owner-provided/<slot-id>.{png,jpg,heic}` and tells Lead. Lead processes (resize, compress, generate responsive variants). Lands at `src/assets/placeholders/<slot-id>.png` (or `<brand>/<slot-id>.png`).

**Path B — Pre-cut PNG from stock libraries (preferred default).** Lead searches:
1. **Rawpixel** (`rawpixel.com/free`) — CC0 / public domain food PNGs; best free-cutout source
2. **Pixabay** (PNG / transparent filter) — free commercial, no attribution required
3. **PNGTree / Freepik / Vexels** — variable quality; check licence carefully (free with attribution OR paid no-attribution)

Lead saves 3–4 candidates per slot to `assets-inbox/candidates/<slot-id>/<n>.png`, presents them inline in the chat. Namit picks (or rejects all and asks for a fresh shortlist). Pick lands in `src/assets/placeholders/`.

**Path C — Photograph + background removal (fallback when pre-cut quality isn't there).** Lead shortlists food photography from Unsplash / Pexels shot on clean studio / cream / wood backgrounds (where masking will yield a clean cutout). Namit picks. **Namit then runs the picked image through a background-removal tool** — recommendations:
- **remove.bg** (web UI; first ~50 images free, output quality is excellent)
- **rembg** (open-source CLI; free, runs locally)
- **Photoshop / Affinity Photo** (if already in your toolchain)

The resulting transparent PNG goes into `assets-inbox/owner-provided/<slot-id>.png`; Lead picks it up from there.

> **Why Lead doesn't do the masking:** the current Claude Code environment has no image-processing tools wired in. Lead can search, present, and save candidate images, but cannot run remove.bg or any masking step in-process. The one-time drag-and-drop into remove.bg per image (~10s) is the cleanest place to put that work.

**Gate output:** every chosen image logged in `assets-inbox/PLACEHOLDERS.md` with path, source (owner / library name / Unsplash), original URL or photographer credit, licence, why placeholder, swap target, used-on pages.

### 11.3 Production bar (applies regardless of path)

- Cutout (or near-cutout via vignette) so the image composes onto the brand-coloured ground rather than sitting in a rectangular frame
- PNG with alpha where the brand-coloured background needs to show through
- Final asset under 400 KB; LCP candidate under 200 KB
- Responsive variants generated by Astro `<Image />` (`widths` + `sizes` always declared)
- Decorative images get `alt=""` + `role="presentation"`; content-bearing images get meaningful alt text

### 11.4 Quality check (Lead enforces, before slice squash-merge)

For each slice's slots, Lead asks: *if the client opens this page on their phone tomorrow, would they say "that's the food I want photographed at this level," or would they say "that's a stock photo"?* If the latter, the slot is wrong — return to the gate.

### 11.5 Swap workflow for real photography

When real photography arrives:

1. Replace the file at the same path under `src/assets/`.
2. Delete the placeholder entry from `assets-inbox/PLACEHOLDERS.md`.
3. Verify alt text still matches (real photo may differ from placeholder content).
4. Run design-reviewer on every page using the swapped image.

The workflow is one-shot per page, low-risk.

---

## 12. Risk register

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Placeholder photography reads as "stock photo site" | High — v1 fails the quality bar | Medium | The cutout treatment + curation discipline in §11; Lead enforces. Fallback: typography-led Direction B becomes the recovery path |
| Lighthouse ≥95 mobile fails after Slice 5 (showcase active) | High — hard project constraint | Medium | Slice 0 ships with all perf budgets in `.claude/rules/performance.md`; design-reviewer at every slice catches regressions early; LCP image budget enforced via Astro `<Image />` widths |
| View Transitions API behaves oddly between showcase and sub-brand pages | Medium | Medium | API has a documented fallback to standard nav; verified at Slice 5 / 6 boundary |
| Cloudflare Pages Functions free tier exhausted | Low — 100k req/day is huge for marketing-site forms | Very low | Spam filtering via Turnstile + honeypot + Zod; KV-based rate limit can be added post-MVP if needed |
| GitHub OAuth setup for Sveltia CMS blocks on Namit | Medium — Slice 12 gates on it | Medium | Slice 12 is scheduled late; CMS layer is post-MVP. Site ships to preview without CMS if needed |
| Lebanese / Pasta pitch addresses never arrive | Low — page can ship with "off rota" placeholder | Medium | Schema's `visible` flag + the "Currently off rota" pattern handle this gracefully |
| Wix subscription confusion: client expects to edit in Wix | Medium | Medium | Sveltia CMS conversation framed early; demo `/admin` in the preview walkthrough |
| Real food photography commission is delayed indefinitely | Low — v1 ships with placeholders | Medium | Swap workflow is documented and one-shot per page; deferred indefinitely is fine |
| Parallel-chat branch returns with off-brand work | Medium | Low | Brief template is tight; design-reviewer audit is in the chat's acceptance criteria; Lead reviews diff before merge |

---

## 13. Answers (locked 2026-05-17)

### Q1. Body typeface — **answered (a): Inter.**

Inter for body. Locks at Slice 1.

### Q2. Site-visible email — **answered: `info@simplyltd.co.uk`** (provisional; confirm with client).

Footer + contact page render `info@simplyltd.co.uk` as the mail-to. Dev forms still send to `namitg26@gmail.com`. Final lock when Namit gets the client's preference.

### Q3. Lebanese / Pasta visibility — **answered (b): hidden in v1.**

Showcase = 3 panels (Falafel + Shawarma + Burgers). 3 sub-brand pages, not 5. Slice 7 = 2 parallel chats (Shawarma + Burgers), not 4. Content schema retains all 5 brand files with `visible: false` on Lebanese + Pasta — flipping them on later is a single-line schema change + an asset gate run.

### Q4. GitHub repo timing — **answered (b): create after Slice 0.**

Slice 0 commits to a local-only `main`. Namit creates the GitHub repo after Slice 0 lands; from Slice 1 onwards we push as we go.

### Q5. Cloudflare Pages timing — **answered (b): provision around Slice 4.**

First Cloudflare Pages preview URL goes live when Slice 4 (homepage hero) is on the remote. Slices 0–3 run on local builds.

### Q6. Real photography commission — **answered (a): deferred.**

Decision postponed until the client sees v1 on the preview URL. The v1 prototype's job is partly to make the case for the shoot.

### Q7. Placeholder sourcing — **answered: NO Instagram for placeholders. High-quality transparent-PNG cutouts only.**

Per Namit (2026-05-17): the owner's Instagram is too low-resolution for v1 placeholders. Asset workflow drops the Instagram path (§11.2 was originally Path C — removed). Sourcing methodology:

1. **Pre-cut PNG libraries first** — Rawpixel CC0, Pixabay PNG filter, PNGTree / Freepik / Vexels (licence-checked). When a candidate at the quality bar exists, picks it; no masking needed.
2. **Unsplash / Pexels + remove.bg fallback** — when pre-cut quality isn't there. Lead shortlists, Namit picks, Namit runs the picked image through remove.bg (or rembg / Photoshop), drops the cutout into `assets-inbox/owner-provided/`. Lead picks it up.
3. **Namit-provided cutouts** — Namit can drop any file into `assets-inbox/owner-provided/<slot-id>.png` at any point; Lead uses it directly.

Instagram (`https://www.instagram.com/simplyltd/`) is retained as a **styling / vibe reference** — Lead may check it for dish details, vocabulary, brand mood — but no posts are downloaded for v1 placeholder use.

**Primary visual reference added:** Amigos Burgers & Shakes (`amigosburgersandshakes.com`). This is the most directly relevant positive reference — cutout product on flat colour, oversized stacked editorial type, playful sticker accents. Lineage now reads: **Amigos × Apple product hero × Bon Appétit covers.**

---

## 14. Phase 3 entry conditions

All entry conditions met 2026-05-17:

- [x] Plan read.
- [x] Q1 — Inter.
- [x] Q3 — Lebanese / Pasta hidden.
- [x] Q4 — GitHub repo after Slice 0.
- [x] Q5 — Cloudflare Pages around Slice 4.
- [x] Q7 — Transparent-PNG cutouts, no Instagram for placeholders.

**Awaiting only:** Namit's explicit "go" to begin Slice 0.

Q2 (site-visible email) and Q6 (real photography commission) remain open but do not block Slice 0.

Once signed off, the **first action** is Slice 0 — `git init`, Astro scaffold, ADRs, `.claude/rules/`, first commit. No design work in Slice 0; that's Slice 1's job.

---

## 15. What I am NOT doing until you sign off

- Running `git init`
- Running `npm create astro`
- Writing any code
- Writing any ADR file
- Touching `.claude/rules/`

The next action belongs to you — one word ("go") and I start Slice 0.
