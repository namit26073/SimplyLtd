# Pre-launch changes: Smash Me Up, franchising stats, domain cutover — design spec

**Sprint:** 3 of the v1 post-prototype roadmap (final pre-cutover sprint).
**Branch (forthcoming):** `feat/prelaunch` — stacked on `feat/instagram-grid` (unmerged; the client approved that version).
**Date:** 2026-08-24

## Summary

The owner approved the site and wants production cutover, with four changes first: (1) a
"Smash Me Up" coming-soon card beside the three truck cards on the homepage, linking to a
new one-page black coming-soon site at **smashmeup.com** (second Cloudflare Pages project,
same repo); (2) franchising stats become **7 trucks / 4 operating concepts**, with the rest
of the site's "three trucks" copy re-scoped to Paddington so nothing contradicts; (3) the
`~250m` franchising stat is replaced with a live **"people fed" counter** (400,000 base,
+300/day, computed client-side from a fixed epoch — no backend); (4) all owner-held Simply
domains 301-redirect to the site via **Porkbun URL forwarding**, and `simplyltd.co.uk` +
`smashmeup.com` move to Cloudflare nameservers for Pages custom domains.

Deliverable order: build → both `*.pages.dev` previews to the client → only after approval,
execute the domain runbook at Porkbun.

## Goals

- Smash Me Up is visibly teased on the homepage but clearly distinct from the truck fleet
  (it's a future permanent shop, off-site link).
- smashmeup.com stands alone: black page, logo, "coming soon", credit line, link to Simply.
- Franchising stats read 7 trucks / 4 concepts and no page contradicts them.
- "People fed" ticks up automatically forever with zero runtime infrastructure.
- Every owned domain resolves somewhere sensible with a 301.
- Lighthouse ≥95 mobile still holds on every touched page.

## Non-goals (v1)

- No Smash Me Up sub-brand page under `/[brand]` — it is not a brands-collection entry.
- No email-capture / notify-me form on smashmeup.com.
- No backend or analytics for the counter — it is arithmetic, not measurement.
- No explanation on-site of where the 4 non-Paddington trucks operate (owner hasn't said;
  we state numbers, we don't invent detail).
- No flipping `lebanese` / `pasta` pages visible — their domains redirect to the homepage
  until those pages launch.

## 1. Homepage — Smash Me Up card

New component `src/components/ComingSoonPanel.astro`, rendered by `BrandShowcase.astro`
after the three `BrandPanel` cards as a fourth equal card.

- **Layout:** desktop (≥900px) grid becomes `repeat(4, 1fr)`; mobile scroll-snap rail is
  unchanged — the card is simply the fourth snap item at 80% width.
- **Visual:** near-black card ground (`--color-ink` or true black to match the logo art),
  Smash Me Up logo via Astro `<Image />` (source `src/assets/smash-me-up-logo.png`,
  explicit dimensions, `widths`/`sizes` set), kicker caption `COMING SOON`, one line:
  "Our first permanent shop."
- **Link:** whole card wraps in `<a target="_blank" rel="noopener noreferrer">`
  (matches InstagramGrid's external-link convention). Accessible name:
  "Smash Me Up — coming soon". **Cross-link note:** until DNS cutover the real domains
  don't resolve — the card points at `https://smashmeup.pages.dev` (and the smashmeup
  page's back-link at the Simply preview URL); flipping both to the real domains is an
  explicit runbook step.
- **Heading update:** BrandShowcase heading "Three trucks. One canal." →
  **"Three trucks. One canal. And something new."**
- **A11y:** visible focus ring on the card; text on black meets ≥4.5:1; logo `alt`
  "Smash Me Up" only if the card has no other name source (avoid double-announcement —
  if the aria-label carries the name, the logo gets `alt=""`).

## 2. smashmeup.com — coming-soon page

`sites/smashmeup/index.html` — hand-written static HTML, inline CSS, **no JS, no build
step, no framework**.

- **Content, top to bottom, centered:** logo image (`<h1>` wraps it, `alt="Smash Me Up"`;
  the logo art carries the wordmark so it is the hero) → "Coming soon." → "From the team
  behind Simply — the food trucks on Paddington Basin." → link styled as a button:
  "Meet Simply →" to `https://simplyltd.co.uk`.
- **Ground:** true black `#000` (the logo's own background), system font stack, single
  centered column, `theme-color` meta `#000`.
- **Assets in `sites/smashmeup/`:** optimized logo (target ≤80 KB, explicit
  width/height), `favicon.png` + `apple-touch-icon.png` derived from the logo,
  `og-image` (logo on black). Title: "Smash Me Up — Coming Soon" + meta description.
  Indexable (no robots block).
- **Hosting:** second Cloudflare Pages project (name `smashmeup`), same repo, build
  command none, output directory `sites/smashmeup`. Preview at `smashmeup.pages.dev`;
  `smashmeup.com` attaches at cutover.

## 3. Franchising stats + people-fed counter

Stat tiles on `src/pages/franchising.astro` become:

| Figure | Label |
|---|---|
| 2019 | Founded |
| 7 | Trucks operating |
| 4 | Operating concepts |
| *live* (e.g. 400,214) | People fed |

The `~250m / Between pitches` tile is deleted.

**Counter mechanics** — `src/lib/peopleFed.ts` exports:

- `PEOPLE_FED_BASE = 400_000`
- `PEOPLE_FED_EPOCH = Date.UTC(2026, 7, 24)` (2026-08-24T00:00:00Z — the day the owner
  gave the figure)
- `PEOPLE_FED_PER_DAY = 300` (fleet-wide; owner-confirmed rough average)
- `peopleFed(nowMs: number): number` = `BASE + floor((nowMs − EPOCH) / 86_400_000 ×
  PER_DAY)`, clamped to ≥ BASE (client clocks set before the epoch must not lower it).

**Rendering:**

- Static markup ships `400,000+` so the no-JS page is truthful.
- A plain `<script>` in the `.astro` file (bundled module importing `peopleFed`; well
  under the JS budget) replaces it with `peopleFed(Date.now()).toLocaleString("en-GB")`.
- Entrance: on first scroll-into-view (IntersectionObserver) count up to the live figure
  over ~1.2 s. Under `prefers-reduced-motion: reduce` (checked via `matchMedia`), skip
  the animation and render the final number immediately.
- A 30 s `setInterval` re-renders so lingering visitors see it tick (+1 roughly every
  4.8 minutes).
- CLS = 0: `font-variant-numeric: tabular-nums` and a reserved `min-width` in `ch` on
  the figure.

**Testing:** Vitest unit tests for `peopleFed` in `tests/lib/` — at epoch returns BASE;
one day later BASE+300; pre-epoch clamps to BASE; fractional days floor correctly.

## 4. Copy consistency sweep

Principle: **fleet-wide numbers are 7 trucks / 4 concepts** (franchising, about);
**Paddington-scoped copy stays at three trucks / two pitches** but is framed as home
base, not the whole business. Geographic "250 metres" facts (map caption, about,
locations dek) are unchanged — only the franchising *stat* dies.

| File | Current | Becomes |
|---|---|---|
| `src/pages/franchising.astro` dek | "Three concepts. One operating model. Six years on Paddington Basin." | "Four concepts. Seven trucks. One operating model." (drops the now-stale "six years"; Founded 2019 stat carries that signal) |
| `src/pages/franchising.astro` meta description | "Three concepts, one operating model, six years…" | "Four concepts, seven trucks, one operating model…" |
| `src/components/BrandShowcase.astro` heading | "Three trucks. One canal." | "Three trucks. One canal. And something new." |
| `src/layouts/Base.astro` default description | "…catering, franchising, and three trucks on the canal." | "…catering, franchising, and our trucks on the Paddington Basin canal." |
| `src/pages/locations.astro` hero | "Three trucks. Two pitches. One canal." (kept — true of the pitches listed) | unchanged, plus a closing dek line: "Home base is Paddington — our trucks also cook across London for events." linking to `/catering` |
| `src/pages/about.astro` ~line 50 | "Three trucks, two pitches, one canal. The standards are the same on every menu." | "Seven trucks, four concepts — and the standards are the same on every menu." |
| `src/pages/about.astro` ~line 97 | "Three concepts, one parent" | "Four concepts, one parent" |
| `src/pages/catering.astro` line 51 + meta | "Three concepts, one team." / "Three food-truck concepts…" | "Four concepts, one team." / "Four food-truck concepts…" |

Instagram fallback manifest captions ("three trucks") are left alone — they are
placeholder social captions displaced by live posts.

**ADRs:** amend `docs/decisions/0012-truck-count.md` (status → Amended 2026-08-24:
owner confirms 7 trucks / 4 concepts; fleet-wide claims live on franchising + about;
locations lists confirmed pitches only). New `docs/decisions/0014-smash-me-up.md`
records: teaser card is not a brands-collection entry, second Pages project for
smashmeup.com, Porkbun URL forwarding for brand-domain redirects.

## 5. Domains & Porkbun cutover — runbook

New `docs/runbooks/domains-cutover.md`. Executed **only after the client approves both
previews**. Registration stays at Porkbun throughout; only nameservers move, and only
for the two content-serving domains.

1. **simplyltd.co.uk** → add zone on Cloudflare (free), set Cloudflare's nameserver pair
   at Porkbun, attach `simplyltd.co.uk` + `www` as custom domains on the existing Pages
   project (www → apex via redirect rule).
2. **smashmeup.com** → same flow, attached to the `smashmeup` Pages project.
3. **Brand domains** → Porkbun URL forwarding, type 301 permanent:
   `simply<brand>.co.uk` → `https://simplyltd.co.uk/<brand>` for visible brands
   (falafel, shawarma, burgers); domains for hidden brands (pasta, lebanese) and any
   non-brand domains → `https://simplyltd.co.uk/` until their pages exist. Cover `www.`
   forwards where Porkbun doesn't include them automatically. Exact mapping table filled
   in once the owner's domain list arrives.
4. **Flip cross-links:** one commit changing the homepage card's href to
   `https://smashmeup.com` and the smashmeup page's back-link to
   `https://simplyltd.co.uk` (they point at `*.pages.dev` previews until now).
5. **Verify:** HTTPS on both apexes, every redirect returns 301 to the right target,
   both cross-links resolve, forms still submit (env vars are per-project in the CF
   dashboard), Lighthouse on the production URL.

`astro.config.mjs` already sets `site: https://simplyltd.co.uk`, so the sitemap is
correct at cutover with no code change.

## 6. Verification before client review

- `astro check` and the full Vitest suite pass (including new `peopleFed` tests).
- design-reviewer subagent: homepage + franchising on the Pages preview — Lighthouse
  ≥95 mobile on all four categories (logo image and counter script included).
- accessibility-auditor subagent: homepage (new card in the showcase rail) +
  franchising (counter reduced-motion fallback) pass.
- No console errors/warnings on clean loads of homepage, franchising, smashmeup page.
- Both preview URLs collected for the client message.

## Open items (owner/Namit input — none block the build start)

1. Original Smash Me Up logo PNG dropped into `assets-inbox/` (currently only pasted in
   chat; never recreate logo art).
2. Full list of owned Simply domains + confirmation `smashmeup.com` is registered at
   Porkbun.
3. Optional, for future copy: what the 7 trucks are (event fleet? other pitches?).
4. Confirm ~300/day rate with the owner before cutover (constant is trivial to change).
