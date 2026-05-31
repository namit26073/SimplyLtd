# Instagram grid on homepage — design spec

**Sprint:** 2 of the v1 post-prototype roadmap.
**Branch (forthcoming):** `feat/instagram-grid`
**Date:** 2026-05-21

## Summary

Add a section to the homepage that shows the six most recent posts from `@simplyltd` (the Simply Ltd Instagram). Build-time fetch via Meta Graph API → downloaded image files + a generated manifest → static rendering. A scheduled GitHub Actions workflow triggers a Cloudflare Pages rebuild every six hours so the grid stays fresh without runtime API calls.

## Goals

- Homepage shows the latest six IG posts in a curated grid.
- Real photography from the brand's own social presence shows up on the site without manual content updates.
- Zero runtime dependency on Meta's API — if the API is down, the site doesn't break.
- Build never fails because of IG: a committed fallback set always satisfies the schema.
- Local development works without IG credentials.

## Non-goals (v1)

- No runtime API calls or client-side IG SDK.
- No automated token refresh (manually re-issued every ~50 days; runbook documents the steps).
- No like / comment counts, profile bio, or follower count — just the recent posts grid.
- No lightbox / on-site post viewer — clicking a tile opens the IG permalink in a new tab.
- No editorial captions per post — the IG caption is hidden; date appears on hover/focus only.
- No Sveltia CMS editing of which posts appear — the grid is always "6 most recent" determined by Meta API.

## UX / visual design

### Section frame

Sits **between BrandShowcase and WaysToEnjoy** on the homepage.

- Background: `var(--color-cream)` (same ground as the brand-showcase strip above; no new colour introduced).
- Top border: 1px line matching `var(--color-line)` to separate from BrandShowcase.
- Type: ink on cream.

### Header

Mirrors the BrandShowcase header pattern:

- Kicker (small caption, `t-caption`): `LATEST FROM @SIMPLYLTD`
- Heading (display, `t-display`): `Follow along.`
- Subhead (small editorial italic, `t-editorial t-editorial--italic`): one-liner like "Six most recent posts from the trucks."
- Right side: a `Follow on Instagram →` CTA pill in the same style as the Hero CTAs (cream-bg variant doesn't apply here since section is cream; use ink-bg pill — `background: var(--color-ink); color: var(--color-cream)`). Links to `https://www.instagram.com/simplyltd/`, opens in new tab.

### Grid

- 6 most recent posts. Skip videos? **No** — include them with their poster frame (see below).
- Desktop (≥720px): 3 columns × 2 rows.
- Mobile (<720px): 2 columns × 3 rows.
- Each tile: 1:1 aspect ratio, border-radius `var(--r-md)`, `overflow: hidden`.
- Each tile is an `<a>` linking to the post's IG permalink: `target="_blank" rel="noopener noreferrer"`.
- Gap: `var(--sp-3)` desktop, `var(--sp-2)` mobile.

### Tile content

- Default state: image only, full-bleed.
- Hover / focus-visible: a soft dark mask fades in (background: `color-mix(in srgb, var(--color-ink) 30%, transparent)` over a `transition: opacity var(--dur-fast) var(--ease-out)`). Inside the mask: post date in the bottom-left (small caption, e.g. `13 MAY 2026`), Instagram glyph (8-pt SVG) in the top-right.
- Captions are NOT shown — IG captions are long and hashtag-heavy, don't read well at tile size.
- Reduced motion: mask appears without fade (the existing `--dur-*` token reduction handles this automatically).
- Focus ring: `outline: 2px solid var(--color-ink); outline-offset: 3px` (inside the tile so it's visible against any image).

### Video / Reel handling

- IG returns `media_type: "VIDEO"` or `"CAROUSEL_ALBUM"` for reels and multi-post.
- Use `thumbnail_url` for videos (when present) or `media_url` (when it's an image).
- For videos: add a small play-triangle glyph in the bottom-right corner of the tile so the user knows it's video before clicking.
- For carousels: add a stacked-squares glyph in the top-right.

### Empty / failure UX

- If the fetched list is empty (API returned 0 posts AND no fallback): the section hides entirely (`{posts.length > 0 && <section>...}`).
- If the API fetch failed at build time: the build script silently switches to the committed fallback set. The user never sees a broken state.
- If the manifest schema doesn't match (Meta changed their response shape): build fails fast at the content-collection validation step — visible in CI, never reaches production.

### Accessibility

- `alt` attribute on each tile image:
  - First preference: IG's accessibility caption (the `alt_text` field; only present if the post creator set one in IG).
  - Second preference: first 80 chars of the caption, with ellipsis if truncated.
  - Last resort: a generic per-brand template — `"Instagram post by @simplyltd dated <date>"`.
- Section landmark: `<section aria-labelledby="instagram-heading">`.
- Each tile link has an `aria-label` covering "Open Instagram post from <date>" so screen readers don't read the date twice (once from `alt`, once from the visible hover overlay).

## Architecture

### Build-time data flow

```
[ scripts/fetch-instagram.mjs ]                ← Node script, ESM
       │
       │  reads env: IG_USER_ID, IG_ACCESS_TOKEN
       │  if missing → log + early-exit (fallback set is used)
       │  hits Meta Graph API for 6 most recent posts
       │  downloads each image binary to local disk
       ▼
[ src/_generated/instagram/                  ]  ← gitignored
   manifest.json                                 (per-post metadata)
   <post-id>.jpg                                 (one file per post)
       │
       ▼
[ astro build ]
       │  reads via content collection (loader: file)
       │  Astro <Image /> processes each image (AVIF/WebP, responsive)
       │  renders InstagramGrid component on /
       ▼
[ dist/ deployed to Cloudflare Pages ]
```

### Fallback set

- `src/content/instagram-fallback/manifest.json` — 6 manually-curated posts (Namit picks at sprint completion).
- `src/content/instagram-fallback/*.jpg` — 6 downloaded images committed to the repo.
- The fetch script writes to `src/_generated/instagram/` on success; if it errors, it copies the fallback files into the same generated location so downstream Astro code always reads the same path.
- Fallback is committed; generated dir is gitignored. No git churn from hourly builds.

### Local development

- Without env vars: fetch script logs `"IG_USER_ID/IG_ACCESS_TOKEN missing — using fallback set"` and copies the fallback set into `src/_generated/instagram/`. Build proceeds normally with the fallback content.
- With env vars: real fetch happens. Useful for dev-time testing of the live grid.
- `.env.local` (gitignored) holds env vars locally.

### Env var contract

Documented in `docs/runbooks/instagram-setup.md`:

| Variable | Source | Where set | Lifetime |
|---|---|---|---|
| `IG_USER_ID` | One-time resolution via Meta Graph API Explorer (uses the user's @simplyltd Business account) | GitHub Actions secret + Cloudflare Pages env var + local `.env.local` | Permanent (per account) |
| `IG_ACCESS_TOKEN` | Long-lived token issued via Graph API Explorer | Same | 60 days; manual re-issue |
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → API Tokens → Pages:Edit scope | GitHub Actions secret only | Permanent (until revoked) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → account home | GitHub Actions secret only | Permanent |

### Token refresh

- Meta's response headers include token expiry data. The fetch script logs a `WARN: IG token expires in N days — re-issue soon` line when N < 14.
- Manual re-issue process documented in the runbook: ~5 minutes via Graph API Explorer + secret update.
- Automated refresh is out-of-scope for this sprint (would be its own ~half-day of work: GitHub Action + Meta API call + GitHub Secrets API call to rotate).

### Scheduled rebuild (every 6 hours)

`.github/workflows/rebuild-instagram.yml`:

- Trigger: cron `0 */6 * * *` (00:00, 06:00, 12:00, 18:00 UTC).
- Action: POST to Cloudflare Pages API to trigger a fresh deployment of `main`. The deployment runs the prebuild fetch script, which pulls the latest posts.
- Alternative considered: push an empty commit to `main` and let CF's GitHub integration auto-build. Rejected because it bloats commit history with ~4 commits/day (1,460/year) of `chore: instagram refresh` noise.
- Workflow logs the deployment URL so failures are visible in GitHub Actions UI.

### Content schema

New collection in `src/content.config.ts`:

```ts
const instagramPosts = defineCollection({
  loader: file("src/_generated/instagram/manifest.json"),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      permalink: z.url(),
      mediaType: z.enum(["IMAGE", "VIDEO", "CAROUSEL_ALBUM"]),
      timestamp: z.coerce.date(),
      caption: z.string().optional(),
      image: image(),
      altText: z.string().optional(),
    }),
});
```

InstagramGrid component reads via `getCollection("instagramPosts")` — same pattern as `brands` and `locations`. Schema drift fails the build fast.

**Image path resolution:** the `image()` schema resolves paths relative to the manifest JSON's location. The fetch script writes each image to `src/_generated/instagram/<id>.jpg` and writes manifest entries with `"image": "./<id>.jpg"` so Astro's image pipeline picks them up correctly.

### Files added / changed

```
scripts/fetch-instagram.mjs                          ← new: fetch + download + write
tests/fixtures/instagram/                            ← new: Meta-API response fixtures used by Vitest
src/components/InstagramGrid.astro                   ← new: the section component
src/content/instagram-fallback/manifest.json         ← new: 6 fallback posts (committed)
src/content/instagram-fallback/<id>.jpg              ← new: 6 fallback images (committed)
src/content.config.ts                                ← +1 collection, +1 export
src/pages/index.astro                                ← +1 import + render between BrandShowcase and WaysToEnjoy
src/_generated/                                      ← gitignored at repo root
.github/workflows/rebuild-instagram.yml              ← new: cron trigger
docs/runbooks/instagram-setup.md                     ← new: auth setup steps
tests/scripts/fetch-instagram.test.ts                ← new: unit tests
package.json                                         ← +fetch:instagram script + prebuild hook
.gitignore                                           ← +src/_generated/
.env.example                                         ← +IG_USER_ID + IG_ACCESS_TOKEN documentation
```

### Files NOT touched (scope guardrails)

- No changes to existing components other than `src/pages/index.astro` (one import + one render line).
- No design-token changes.
- No new npm dependencies (built-in `fetch`, `node:fs/promises`, `node:path`).
- No changes to forms, brand pages, or other sprints' surfaces.

## Testing

- **Unit tests** (`tests/scripts/fetch-instagram.test.ts`, Vitest):
  - Happy path: Graph API returns 6 posts → manifest written with correct shape, images downloaded.
  - 401 (token expired): script logs error, copies fallback set, exits 0 (build proceeds).
  - 429 (rate limited): script logs error, copies fallback set, exits 0.
  - Network error: script logs error, copies fallback set, exits 0.
  - Missing env vars: script logs warning, copies fallback set, exits 0.
  - Token expiry warning: when response headers indicate <14 days remaining, log WARN line.
- **No E2E for the rendered section** — visual review during sprint, design-reviewer subagent screenshot pass before PR.
- **Accessibility-auditor subagent** runs against the new section before PR: keyboard nav into each tile, focus rings visible, alt text present, contrast OK.

## Acceptance criteria

- [ ] Homepage shows 6-tile IG grid between BrandShowcase and WaysToEnjoy on both mobile (390px) and desktop (1440px).
- [ ] All 6 tiles link to the correct IG permalink and open in a new tab.
- [ ] Each tile's image has a meaningful `alt` attribute (IG accessibility caption preferred, caption fallback, generic last-resort).
- [ ] Video posts show a play-icon glyph; carousel posts show a stacked-squares glyph.
- [ ] When `IG_USER_ID` and `IG_ACCESS_TOKEN` are absent, build succeeds using the fallback set.
- [ ] When they're present and valid, build fetches live data; six fresh images appear in `dist/`.
- [ ] When they're present but invalid (e.g. revoked token), build still succeeds via fallback; CI log shows the warning.
- [ ] Scheduled GitHub Actions workflow exists and is configured for cron `0 */6 * * *`.
- [ ] Lighthouse mobile audit on `/` post-merge scores ≥95 on **each of** Performance, Accessibility, Best Practices, SEO (project hard constraint per `.claude/rules/performance.md` and `BRIEFING.md`).
- [ ] `docs/runbooks/instagram-setup.md` documents every step Namit needs to perform to make the live fetch work.
- [ ] Unit tests pass; no regressions on existing tests.
- [ ] design-reviewer and accessibility-auditor subagents both report PASS on the new section.

## Open items (to confirm during implementation)

- Exact CTA pill placement on mobile when section header stacks vertically.
- Whether to show a tiny IG-glyph as a fixed corner detail on every tile (always visible) or only on hover (current design).
- Whether the fallback set should sit in `src/content/instagram-fallback/` (committed) or `public/instagram-fallback/` (also committed but raw-served — bypasses Astro Image). Default: `src/content/...` so Astro Image processes both fetched and fallback uniformly.

## Decisions baked in (no need to revisit unless explicitly raised)

- 6 posts, not 9 or 12.
- 3-column desktop, 2-column mobile grid (not horizontal scroll, not mosaic).
- Build-time fetch only — no runtime API.
- GitHub Actions cron, not Cloudflare cron triggers (CF Pages doesn't have native cron).
- Cloudflare API call from the cron, not empty-commit push (cleaner git history).
- Fallback set committed to repo; generated dir gitignored.
- No automated token refresh in v1.
- Captions hidden; date shown on hover/focus only.
- Permalink opens in new tab; no on-site lightbox.
