# Placeholder asset guidance

Real food / truck / customer photography is **not available yet**. The owner will provide it; until then, use stock placeholders. Rules:

## Where to source placeholders

- **Unsplash** (unsplash.com) — primary. Licence: free, commercial-OK, no attribution required (but the photographer credit is good etiquette).
- **Pexels** (pexels.com) — secondary. Same licensing.
- **Burst** (burst.shopify.com) — tertiary, food-strong.
- **Pixabay** (pixabay.com) — last resort; some images have stricter conditions.

**Do not use:**

- Getty / Shutterstock / Adobe Stock — paid services, not in v1 budget.
- Google Images — most are copyrighted.
- AI-generated food imagery (Midjourney, DALL·E, Stable Diffusion outputs) — the owner has explicitly rejected "AI-template" aesthetics, and AI food photos have an uncanny-valley vibe that hurts more than helps.
- Photos of *competitors'* food (e.g. a Pasta Evangelists dish photo) — passing-off risk.

## What to look for

- Light, real, unstaged. The owner's brand is street food, not fine dining.
- Hands-in-shot beats food-styled studio shots.
- Outdoor / canal / urban context where possible (we're at Paddington Basin).
- Diverse customers, real-looking, unposed.
- Avoid anything that screams "stock photo" — generic burger-on-wooden-board shots, etc.

## Documenting placeholders

For each placeholder image you use, log it in this file under the "Active placeholders" section. Format:

```markdown
- `src/assets/placeholder/falafel-hero.jpg` — Unsplash photo by @photographer-handle
  - URL: https://unsplash.com/photos/abc123
  - Why placeholder: no real Falafel close-ups from owner yet
  - Swap plan: owner photography session, target 2026-06 (per Namit)
  - Used on: /falafel/ hero, brand showcase tile
```

Then, when the owner provides real photography:

1. Replace the file at the same path.
2. Delete the placeholder entry from this file.
3. Verify alt text still matches (real photo may differ from placeholder content).
4. Run the design-reviewer subagent on every page using the swapped image.

## Active placeholders

### `home-hero` — homepage hero video (full-bleed) + poster fallback

- **Video:** `public/videos/falafel-truck.mp4` (5.7 MB MP4, owner-provided kitchen footage, autoplays muted on load)
- **Poster:** `src/assets/placeholders/home-hero.jpg` (Pexels 6275226 — falafel + pita on dark green; serves as LCP image + permanent still on prefers-reduced-motion)
- **Source:** Pexels photo by Engin Akyurt (poster); owner-provided footage (video)
- **URL (poster):** https://www.pexels.com/photo/brown-and-white-food-on-white-ceramic-plate-6275226/
- **Licence:** Pexels licence (poster) — free for commercial, no attribution. Owner footage (video) — used with owner permission.
- **Treatment:** Full-bleed background, type overlay on darkened gradient mask. Cream-coloured display type, amber accent on "THAT EARNED" line.
- **Why placeholder:** No owner-commissioned brand film yet. Falafel kitchen footage is genuinely on-brand (Simply Falafel = origin) so works as long-term placeholder.
- **⚠ Perf debt:** MP4 is 5.7 MB — well above the 2 MB sub-budget in `.claude/rules/performance.md`. **Re-encode required** before Cloudflare Pages cutover: target H.264 ~1.8 MB + WebM ~1.5 MB at 1280×720, 24fps, CRF 26-28. Needs ffmpeg locally (currently unavailable on this machine).
- **Used on:** `/` homepage hero (full-bleed, type overlay)

### `franchising-hero` — franchising page hero photograph (full-bleed)

- **File:** `src/assets/placeholders/franchising-hero.jpg` (2400×1560 landscape JPEG, 253 KB source)
- **Source:** Pexels photo 32897258 — operator framed through truck service window at night, warm interior glow, dark blue truck exterior
- **URL:** https://www.pexels.com/photo/32897258/
- **Licence:** Pexels licence — free for commercial, no attribution required
- **Treatment:** Full-bleed background, type overlay on darkened gradient mask (same pattern as homepage + catering)
- **Why placeholder:** No owner franchisee photography yet. Documentary-tone shot communicates "this is real work, and it's yours" — operator-as-owner POV.
- **Swap plan:** Replace with first-franchisee portrait when Simply Ltd onboards a franchisee (timeline TBD per Namit/owner).
- **Used on:** `/franchising/` page hero

### `catering-hero` — catering page hero photograph (full-bleed)

- **File:** `src/assets/placeholders/catering-hero.jpg` (2000×2999 portrait JPEG, 354 KB source — Astro Image emits responsive AVIF/WebP)
- **Source:** Pexels photo 25388878 — Turkish kebab pans on street-food stall (Pexels search "kebab street food stall")
- **URL:** https://www.pexels.com/photo/kebab-meat-on-pans-on-street-food-stall-25388878/
- **Licence:** Pexels licence — free for commercial, no attribution required
- **Treatment:** Full-bleed background, type overlay on darkened gradient mask (same pattern as homepage)
- **Why placeholder:** No owner catering photography yet. Kebab-pans-on-stall is culturally aligned with Simply Falafel + Shawarma Levantine roots and reads as "real volume catering," not stock-fast-food.
- **Swap plan:** Replace when owner provides catering event photography (likely post-first-catering-job-with-photo-permission). Could also swap to a chef-at-festival image (Pexels 14316004) if catering copy leans on hospitality over volume.
- **Used on:** `/catering/` page hero

## What the owner already provided

These are NOT placeholders — they're real assets to use:

- `videos/FalafelVid.mp4` — Falafel truck kitchen footage. Vertical-ish. 6 MB. Best uses: full-bleed background on /falafel/ hero; potentially the homepage if direction calls for video hero.
- `videos/ShawarmaVid.mp4` — Shawarma truck kitchen footage. Vertical-ish (640x732). 8.8 MB. Best uses: full-bleed background on /shawarma/ hero; potentially homepage.
- `logos/AllOtherLogos.jpeg` — Falafel + Shawarma + Lebanese + Pasta marks combined in one raster image. **Needs extraction** to individual SVGs (use Inkscape vectorisation or commission a clean vectorisation). Until vectorised, hold off using as a logo system; use text-based brandmarks ("Simply Falafel" in heavy condensed sans) instead.
- `logos/BurgerLogo.jpeg` — Simply Burgers mark, raster, standalone. Same note: needs vectorisation for any non-tiny usage.

## A note on the logos

The owner's raster logos have a cartoon-mascot style (chef characters, food characters). They're charming but inconsistent with each other and not professional-grade. **Do not lean on them as the primary brand identity.** The previous build observed that the owner's truck-side branding (a clean black + leaf-icon + white wordmark on the actual physical trucks) is a stronger system — lift that to the parent brand identity rather than reinvent.

If you need a parent-brand wordmark, design one in code (CSS) using a heavy condensed sans (Anton, Druk, Knockout, Tungsten — Anton is free). "SIMPLY." in poster-display caps is the safest interpretation.
