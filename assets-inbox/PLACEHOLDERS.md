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

### `home-hero` — homepage hero photograph

- **File:** `src/assets/placeholders/home-hero.jpg` (2000×3000 portrait JPEG, 467 KB source — Astro Image emits responsive AVIF/WebP)
- **Source:** Pexels photo by Engin Akyurt — "Brown and White Food on White Ceramic Plate"
- **URL:** https://www.pexels.com/photo/brown-and-white-food-on-white-ceramic-plate-6275226/
- **Licence:** Pexels licence — free for commercial use, no attribution required ([pexels.com/license](https://www.pexels.com/license/))
- **Why placeholder:** No owner-provided food photography yet. This shot reads as "Apple/Adidas-quality food ad" — moody dark-green backdrop, oval bowl of falafel + scattered pita rounds. Matches Simply Falafel's origin-brand story.
- **Swap plan:** Replace with owner-commissioned falafel photography when available (target: 2026-07 photoshoot per Namit). Same file path so component swap is one-line.
- **Used on:** `/` homepage hero (split layout: copy left, photo right desktop; photo top, copy below mobile)

## What the owner already provided

These are NOT placeholders — they're real assets to use:

- `videos/FalafelVid.mp4` — Falafel truck kitchen footage. Vertical-ish. 6 MB. Best uses: full-bleed background on /falafel/ hero; potentially the homepage if direction calls for video hero.
- `videos/ShawarmaVid.mp4` — Shawarma truck kitchen footage. Vertical-ish (640x732). 8.8 MB. Best uses: full-bleed background on /shawarma/ hero; potentially homepage.
- `logos/AllOtherLogos.jpeg` — Falafel + Shawarma + Lebanese + Pasta marks combined in one raster image. **Needs extraction** to individual SVGs (use Inkscape vectorisation or commission a clean vectorisation). Until vectorised, hold off using as a logo system; use text-based brandmarks ("Simply Falafel" in heavy condensed sans) instead.
- `logos/BurgerLogo.jpeg` — Simply Burgers mark, raster, standalone. Same note: needs vectorisation for any non-tiny usage.

## A note on the logos

The owner's raster logos have a cartoon-mascot style (chef characters, food characters). They're charming but inconsistent with each other and not professional-grade. **Do not lean on them as the primary brand identity.** The previous build observed that the owner's truck-side branding (a clean black + leaf-icon + white wordmark on the actual physical trucks) is a stronger system — lift that to the parent brand identity rather than reinvent.

If you need a parent-brand wordmark, design one in code (CSS) using a heavy condensed sans (Anton, Druk, Knockout, Tungsten — Anton is free). "SIMPLY." in poster-display caps is the safest interpretation.
