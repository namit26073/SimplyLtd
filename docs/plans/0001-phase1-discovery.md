# Plan 0001 — Phase 1 discovery report

**Date:** 2026-05-17
**Author:** Lead agent (Claude Opus 4.7)
**Status:** **Signed off by Namit 2026-05-17.** Answers locked in §7. Phase 2 plan is the next deliverable.

Companion files written this phase:

- `assets-inbox/current-site-extract/wix-extract.md` — full Wix audit (nav, copy, menu, hero, identity confusions)
- `assets-inbox/current-site-extract/reference-audits.md` — Pasta Evangelists, Honest Burgers, MEATliquor
- `assets-inbox/current-site-extract/screenshots/` — 5 reference screenshots

---

## 1. What I learned

### From the owner-provided assets

- **Videos** (Falafel 6.0 MB, Shawarma 8.8 MB, vertical-ish kitchen footage) are real and usable. They are the *only* real-photography evidence Simply Ltd currently owns. Worth using — but not as the homepage hero (see §4 below; none of the three reference brands use video in the hero, and pinning v1 to a hero-video direction makes the homepage hostage to the existing two clips).
- **Logos** (`BurgerLogo.jpeg`, `AllOtherLogos.jpeg`) are cartoon-mascot caricatures of the owner holding food, with brand-coloured halos (Falafel **green**, Shawarma **yellow**, Lebanese **red**, Pasta **orange**, Burgers **red + gold**). Charming on the side of a truck, **not** professional parent identity. PLACEHOLDERS.md is right: lift the truck-side branding (black + leaf icon + white wordmark) into a parent identity built in code, not these raster mascots.
- **The five brand halo colours are the seed of a usable palette.** Greens for Falafel; warm yellow for Shawarma; oxblood red for Lebanese; orange for Pasta; deep red + gold for Burgers. Each sub-brand inherits its halo as a single accent colour over a shared neutral parent palette. This is the most concrete identity asset the owner has given us.

### From the existing Wix site

(Full detail in `wix-extract.md`. Highlights.)

- **The current homepage hero is AI-generated cartoon street-food.** Filenames like `illustrative-cartoon-style-drawing-of-a-falafel-wr_edited.png` and `restyle-the-photo-of-the-five-chefs-in-black-unifo.jpeg` confirm it. This is the explicit anti-pattern. Rebuild does not carry forward.
- **The site is identity-confused.** Page title says "simply falafel". Footer copyright says "© 2019 by Simply Falafel." Contact email is `info@simplyfalafel.co.uk`. The Wix project is named "Simply Ltd Main" internally but Falafel residue is in every visible chrome element. Rebuild must commit to the parent identity at every chrome touchpoint, day one.
- **Nav is mostly dead.** Of 12 nav items: 5 link silently back to the homepage, 3 are empty sub-brand stubs, 2 lead to mis-titled Wix templates. Only Home + Menu are substantive. Rebuild ships fewer nav items that all resolve.
- **There IS real copy worth keeping** — the founder origin story ("Founded in 2019, our journey began with a single food truck: Simply Falafel…"), the catering pitch, and the franchising five-reasons block all read like real copy. Capture as raw material; rewrite for craft.
- **Two factual mismatches that need owner sign-off** (open questions §7 below):
  1. Homepage says "**seven** food trucks." Brief + CLAUDE.md confirm **three** at Paddington Basin.
  2. Franchising page lists Pasta "Est. 2024" and Burgers "Est. 2025" — CLAUDE.md says Pasta TBD and Burgers most recent.
- **The full menu on the live site is Falafel-only**, mislabelled "Lunch Menu". No menus exist anywhere for the other four sub-brands. Rebuild can ship without per-brand menus in v1, but flag the gap.

### From the three reference brands

(Full detail in `reference-audits.md`. The single most important finding:)

**None of the three references uses a hero video. All three use static photographic heroes (or, in MEATliquor's case, photography supporting a typographic hero).** This is a data point against the "use the kitchen videos as the homepage hero" instinct. The videos are still useful — on sub-brand pages, as a section anchor below the fold, or as a "behind the counter" interstitial. Not as the front door.

Specific borrowable patterns:

- **Pasta Evangelists** — Photography is the protagonist on every block. The **four-card "ways to enjoy" first-fold** (`Dine in / Delivery / Pasta Academy / Catering`) is structurally elegant: each card is its own conversion path, each has a photographic tile. Catering is *one of four* primary first-fold paths, not buried.
- **Honest Burgers** — One single condensed display sans (Ko, all-caps, weights 400/900) carries every heading, paired with restaurant-grade food photography. **Tight food-crop hero** with a one-line headline. Works because the brand is one concept; would steamroll our multi-brand voice if copied wholesale.
- **MEATliquor** — Typography-led, photography supporting. The hero subhead `FROM A VAN IN A PECKHAM CAR PARK TO A JOINT NEAR YOU - WE'VE BEEN SMASHING BURGERS, SHAKING COCKTAILS & REWRITING THE RULES SINCE DAY ONE.` is **origin story compressed into one declarative line.** Simply Ltd has the same raw material ("a single food truck: Simply Falafel" + 2019 + Paddington Basin).

Specific anti-patterns from the references:

- Pasta Evangelists' newsletter modal on first paint (covers up the photography it depends on).
- Honest Burgers' all-caps-everywhere (would flatten our sub-brand voices).
- MEATliquor's tiling film-grain noise background (perf cost not worth the texture).

---

## 2. Stack recommendation

**Recommendation: Astro 6 + Cloudflare Pages + Cloudflare Pages Functions + Resend + Turnstile + Zod.** Document the call in `docs/decisions/0001-stack.md` on Phase 2 entry.

### The decisions

| Slot | Choice | Why |
|---|---|---|
| Framework | **Astro 6** | Islands architecture: ship zero JS by default; opt in for the catering/franchising forms and any motion island. Built-in `<Image />` enforces width/height (CLS = 0). View Transitions API is declarative via `<ClientRouter />`. Hits the ≥95 Lighthouse mobile bar more easily than React-first frameworks. |
| Hosting | **Cloudflare Pages** | Commercial use explicitly OK on free tier. **Unlimited bandwidth + unlimited requests** (fair use, no overage charges). 500 builds/month, 20-min build timeout, 20k files per site, 25 MiB per asset — all comfortable for a marketing site. |
| Forms backend | **Cloudflare Pages Functions** | Inherits Workers free tier: 100k requests/day, 10 ms CPU, 50 subrequests/request, 128 MB memory. Two forms doing single-digit submissions per day is rounding-error of the budget. |
| Email | **Resend** | Free tier: 3,000 emails/month, 100/day. Free tier is commercial-OK. Excellent DX, React-Email templating if we want it. |
| Anti-spam | **Cloudflare Turnstile** | Free, native to Cloudflare, no privacy-violating reCAPTCHA. |
| Validation | **Zod** | Shared schema between client form and Pages Function. Single source of truth for form shape. |
| Type-check | **TypeScript strict + `astro check`** | Per BRIEFING.md "types everywhere." |
| Content | **Astro content collections** (Markdown / MDX + Zod schemas) | Brands, locations, press, testimonials all become typed collections. No CMS needed in v1; the data model lives in the repo. |
| Maps | **Static map image at v1** (Mapbox Static API render, baked at build time, or a simple SVG of Paddington Basin) | No paid map tiles. Three pitches, all within ~250 m, do not need an interactive map for v1. Re-evaluate at v2. |

### Why not the alternatives

- **Next.js + Vercel:** Vercel Hobby ToS forbids commercial use. Hard out.
- **Next.js + Cloudflare Pages:** technically possible, but adds React-shaped JS overhead for what is mostly content-driven pages. Astro is the lighter fit.
- **SvelteKit + Cloudflare Pages:** good alternative but Astro's island architecture matches our "pages-are-static-with-a-few-interactive-islands" shape more directly. Astro also has the more developed `<Image />` story for our heavy photography lean.
- **GitHub Pages:** ToS forbids commercial use. Hard out.
- **Netlify Free:** commercial-OK but moved to credit-based pricing post-Sept 2025 (300 credits/mo: deploys 15 credits each, bandwidth 20 credits/GB, web requests 2 credits/10K). Materially tighter and unpredictable to budget against once traffic grows. Cloudflare's unlimited-bandwidth-with-fair-use is the cleaner pick.
- **Tailwind:** ruled out by the prior-build rules in `references/prior-build-rules/components.md` ("the project's aesthetic stance is anti-generic; bespoke CSS gives the right control"). The rule was set on the prior build for a real reason — tooling that nudges towards utility-class soup nudges the design away from editorial confidence. Bespoke CSS with `@layer`, container queries, and design tokens in custom properties.
- **Headless CMS (Sanity, Strapi, etc.):** unnecessary in v1. Owner does not need to edit copy weekly. Content lives in Markdown in the repo; if the owner later wants self-edit, add a CMS layer then.

---

## 3. Visual direction

**Named reference: Apple product hero pages × *Bon Appétit* covers × Pasta Evangelists' editorial confidence.** Live in the lineage of "cutout food photography floating on flat composed grounds + typographic counterweight + considered restraint in the chrome." (Updated 2026-05-17: Q5 answer selected a cutout / borderless treatment rather than full-bleed photographic frames — direction adjusted accordingly.)

The lineage isn't *primarily* Pasta Evangelists any more — Pasta Evangelists' homepage uses full-frame photographic tiles, which contradicts the borderless treatment Namit selected. We borrow Pasta Evangelists' **structural** move (the four-card first-fold "ways to enjoy") but the **visual** model is closer to Apple's product hero, where the photographed object is silhouetted on a flat or subtle ground and the typography sits beside or beneath it as an equal participant.

**Hero composition** (homepage):

- **Cutout food photography** as the hero subject — falafel, shawarma, burger, or pasta dish photographed against a clean ground, then composed onto a brand-coloured or warm-cream flat background. Type does not sit *over* the food (no overlay contrast problem); type sits *next to* or *under* the food, with the cutout floating in considered negative space.
- One declarative display headline. Working line, subject to your edit: **"Street food that earned its corner of Paddington Basin."**
- One origin-story subhead in the MEATliquor mould: **"From a single falafel truck in 2019 to a fleet on the canal — fresh, fast, and on the basin every day."**
- Two CTAs: primary `Hire us for your event` (catering), secondary `Find a truck` (locations).
- Below the fold: the four-card "ways to enjoy" pattern, mapped to our four primary paths — see §4. Each card uses the same cutout-on-flat-ground treatment, not a full-bleed photographic tile.

**Type system** (working proposal — locks in Phase 2):

- **Display:** `Anton` (free, Google Fonts, condensed grotesque, single weight 400). Used for big editorial headlines and sub-brand wordmarks. Heavy enough to carry attitude, restrained enough to avoid Honest-Burgers all-caps-everything.
- **Editorial subhead / pullquote:** `Fraunces` (free, Google Fonts, variable serif, weights 300–700). Adds humanist serif counter-voice to the display sans — echoes Pasta Evangelists' Fortescue.
- **Body:** `Inter` (free, ubiquitous, excellent at small sizes). Self-hosted via Astro Fonts API, subset to Latin + symbols actually used.

Reason for `Inter` despite the BRIEFING.md note that the "AI-template generic" rejection used Inter for body: the rejection wasn't about Inter the typeface — it was about Inter + Fraunces serif headline + soft cards reading as a "modern AI template." Used here as quiet body type beneath confident `Anton` display and editorial `Fraunces` subhead, Inter does its job invisibly. If you want to avoid any chance of carryover, the alternative is `IBM Plex Sans` (free, more idiosyncratic, fewer "template" associations). Flagging as a Phase-2 lock.

**Palette** (working proposal):

- Parent: warm-cream `#F4EFE6` / off-black `#1A1A18` / canal-grey `#7A7E78` (cool neutral for restraint).
- Sub-brand accents (each used only on its own sub-brand page + the brand showcase tile): Falafel **#3F7A3A** (deep leaf green), Shawarma **#E8B83A** (warm gold-yellow), Lebanese **#A6342E** (oxblood red), Burgers **#C03020** + **#D4A24A** (red + gold), Pasta **#E07A2A** (warm orange). Hex values are placeholders — locked once we see the real truck-side branding referenced in PLACEHOLDERS.md.
- Photography overlay floor: every photo-overlaid text block uses a min-30% black gradient overlay or a text-shadow guaranteeing ≥4.5:1 contrast. Accessibility-auditor verifies.

**Motion language:**

- Three signature motion moments, quiet between (per CLAUDE.md "modern and futuristic but not overwhelming"). Candidates: hero-headline letter-spacing-on-load; sub-brand showcase scroll-snap transition; catering form success-state. Locks in Phase 2.
- `prefers-reduced-motion: reduce` halts all motion — not "shortens" it — verified by accessibility-auditor before any page is marked done.
- No procedural WebGL anywhere. (Rejected family.)
- No tiling film-grain noise. (MEATliquor's mistake.)
- View Transitions API used between homepage and sub-brand pages — typically the sub-brand wordmark grows from its showcase tile into the sub-brand page's header. Real, choreographed reason; not decoration.

**Photography role:**

- Photography is a protagonist of the page **in dialogue with typography**, not in solo. The cutout-on-flat-ground treatment makes photo and type equal participants in the composition. (Updated per Q5.)
- v1 ships with **curated** placeholder photography — not "first result on Unsplash search." Selection criteria: clean enough source for masking, food shot on a plain or neutral background, restaurant-grade lighting. Where source quality isn't quite there, a one-pass alpha cleanup is acceptable. Every placeholder logged in `assets-inbox/PLACEHOLDERS.md` with a swap plan. The placeholders are chosen so v1 *demonstrates* what a commissioned shoot would deliver — this is part of the case for funding the shoot.
- Owner-provided kitchen videos (Falafel, Shawarma) anchor those two sub-brand pages, not the homepage hero. They also appear in a "behind the counter" section on each sub-brand page where they were shot.

---

## 4. Signature interactions

### Homepage hero + first-fold

(Single direction; not asking for three on the homepage hero — the brief requires three on the four-brand showcase, which is below.)

**Direction:** Static photographic hero + declarative headline + four-card "ways to enjoy" first-fold (lifted from Pasta Evangelists, mapped to Simply Ltd's audience priorities).

**Below-the-hero, four-card grid** — each card a photographic tile + a one-line proposition + a CTA. Mapped to the four primary audiences:

| Card | Proposition | CTA | Photographic anchor |
|---|---|---|---|
| Catering | "Bring street food to your event." | Get a quote | Service / event scene |
| Franchising | "Run a Simply truck of your own." | See how it works | Truck exterior (existing kitchen videos can fall back to posterframes here) |
| Locations | "Find your nearest pitch on the basin." | See the map | Canal / truck exterior |
| Menu | "What's on today." | Explore the menu | Food close-up |

This is the structural lift from Pasta Evangelists. **Why this works for us specifically:** the brief lists three audience priorities (catering, franchising, walk-up). A four-card grid lets us serve all three from the homepage without funnelling everyone through a single CTA, and lets us put catering and franchising **above the fold** where the brief's revenue logic puts them.

**Hero motion**: one signature moment on load — display headline animates letter-spacing from `0.04em` → `0` in a 700 ms ease-out, subhead and CTA fade in 200 ms behind it. Reduced-motion: instant, no animation. Lighthouse: no impact (CSS transition, no JS).

### Four-brand showcase — THREE distinct directions

The five sub-brands need a homepage section that introduces them with personality and routes the visitor to the per-brand page. Per the brief, three directionally different options follow. (The brief says "four-brand" but we currently have five sub-brands — Falafel, Shawarma, Lebanese, Burgers, Pasta. Treating it as five throughout; if you want to hide Pasta until pitch + 2024/2025 chronology is confirmed, the structure scales to N.)

#### Direction A — Photography-led: *"Editorial Fleet"*

A vertical scroll-snapping sequence. Each sub-brand fills the viewport with a full-bleed editorial food photograph (close-crop, restaurant-grade, real). On top: brand wordmark in `Anton`, one-line proposition in `Fraunces`, a small metadata strip (`EST. 2019` / `PADDINGTON BASIN` / `VEGAN`). Background colour of the typographic overlay-zone shifts to the brand's halo accent. Scroll-transitions between brands use the View Transitions API for a clean cross-fade. Clicking a brand triggers a view transition into the sub-brand page where the wordmark grows from its showcase tile to the sub-brand hero.

**Reference lineage:** Burberry seasonal lookbook; Apple Watch family showcase; Pasta Evangelists' tile grid scaled to full-height sequence; The Row's lookbook page.

**Content dependency:** one strong photograph per brand. We have zero real food close-ups today. v1 ships with Unsplash placeholders, clearly marked, documented for swap.

**Pros:** Highest ceiling. Sets up the genuine Apple/Adidas quality bar. Most cinematic when real photos arrive.

**Cons:** v1 quality is hostage to Unsplash search. The five brands could read as generic until real photography lands. "Photography as protagonist" with placeholder photography is a tension worth being honest about — the brief explicitly warns against "stock placeholders dressed up as if they're real assets."

#### Direction B — Typography-led: *"Roll Call"*

No photography needed for v1. Each sub-brand introduced with a magazine-spread treatment. Layout per panel:

- Enormous `Anton` display wordmark — `FALAFEL.` at 240–320px, all-caps, condensed.
- A `Fraunces` italic dek of 18–22 words: *"Vegan and vegetarian Levantine that started it all — fresh, plant-positive, no preaching."*
- An inline metadata strip — `EST. 2019` · `MERCHANT SQUARE W2 1PW` · `VEGAN`.
- Background colour = the brand's halo accent. Single small inline-SVG decorative mark (a leaf for Falafel, a single skewer for Shawarma, etc.) sized small, sits in the corner — decorative only.
- Each panel fills the viewport on scroll-snap. Per-panel motion: letter-spacing transition on entry; on exit, the wordmark slides up and the next brand's wordmark slides in. Cinematic but typographic.

**Reference lineage:** MEATliquor's typography-led-with-attitude; Stripe Press editorial type; *Eye* magazine / *MagCulture* page furniture; Acme Capital's home page.

**Content dependency:** none. v1 ships at full quality, day one.

**Pros:** Doesn't depend on photography we don't have. Most pragmatic "ship at the bar" direction. Most editorially distinctive — a typographic showcase is a stronger point of view than five photographic tiles. If the type system is committed (heavy `Anton`, hard colour shifts), it cannot read as the "AI-template generic" rejection because the type *is* the content; it isn't decorating a card.

**Cons:** Less visceral than photography. If the type system is undersized or apologetic, it lapses into the rejected #1 territory. Demands real commitment to scale and colour.

#### Direction C — Motion-led / video-anchored: *"The Fleet, In Motion"*

A single continuous scroll-driven sequence. The two real kitchen videos (Falafel, Shawarma) anchor two of the five panels. The other three (Lebanese, Burgers, Pasta) get typographic panels styled to match — same scale and energy as Direction B, but interleaved with the videos. Scroll choreographs the panel-to-panel transition: each panel pinned briefly on entry, then released as the next scrolls into the pin position. Reduced-motion: videos become posterframe stills; type panels unchanged; no scroll-driven sequencing.

**Reference lineage:** Apple Vision Pro launch (the scroll-pinned sequence section); Nike React running pages.

**Content dependency:** the two videos we have; three brands stay typographic until owner shoots more video.

**Pros:** Honest about what we have — uses the real footage we own; the missing-asset panels are *designed-in*, not placeholder-in. Bridges photography-led and typography-led directions.

**Cons:** Mixed video + typographic risks looking inconsistent unless the typographic panels have real authority. Performance budget on video at Lighthouse ≥95 mobile is doable (H.264 + WebM, sub-2MB per clip, lazy-loaded, single-clip-at-a-time decode) but tight. Scroll-pinning is a known accessibility hazard if motion sickness isn't handled — reduced-motion path must be complete.

#### Direction comparison

| | A — Editorial Fleet | B — Roll Call | C — The Fleet, In Motion |
|---|---|---|---|
| Centrepiece | Photography (real food, per brand) | Typography (huge display, per brand) | Video (2 brands) + typography (3 brands) |
| v1 asset dependency | High — needs 5 real photos | None | Medium — uses 2 videos we own |
| Risk of looking placeholder | High until real photos land | Low | Medium |
| Risk of looking generic | Low — once real photos land | Medium — if type isn't committed | Low |
| Reduced-motion path | Cross-fade → simple anchor links | Letter-spacing → static blocks | Pinned-scroll → static panels |
| Lighthouse mobile difficulty | Moderate — photo weight | Easy — almost zero JS | Hard — video + scroll-pinning |
| Quality ceiling once real assets arrive | Highest | High | High |
| Quality floor today (v1, placeholders) | Lowest | Highest | Middle |

**Locked 2026-05-17: Direction A (Editorial Fleet) — adapted to the cutout / borderless treatment from Q5.**

The picked direction is photography-led, with curated cutout-style placeholders chosen carefully enough that v1 demonstrates the photographed end-state. Concretely, each sub-brand panel renders as:

- The brand's halo accent colour as the full panel background (Falafel green, Shawarma yellow, Lebanese oxblood, Burgers red-gold, Pasta orange).
- A **cutout food image** for that brand floats on the panel — not a full-frame photographic crop. The image is masked / has a transparent ground, so the brand-coloured background shows through everything around the food.
- Brand wordmark in `Anton` sits in editorial relationship to the cutout (e.g. type below the food on mobile; type alongside the food on desktop). The type and the photograph are **equal participants** in the composition — neither overlays the other.
- `Fraunces` italic dek of 18–22 words below the wordmark.
- Metadata strip (`MERCHANT SQUARE W2 1PW` · `VEGAN`) sits small, lower-left or right.
- Scroll-snap moves between panels; View Transitions API choreographs the hand-off into the sub-brand page when the user taps a panel.

**Why this works in v1:** the cutout treatment is the design move that lets placeholder photography read as *intentional composition* rather than "we couldn't find a good photo." A full-bleed photographic tile with a placeholder photo telegraphs "stock photo." A cutout floating on a confident brand colour with confident typography telegraphs "considered editorial choice." When the real photoshoot lands, the cutouts swap for higher-quality cutouts of real Simply Ltd food — no layout change needed.

Directions B and C remain documented above as the rejected alternatives for the record. The selection of A is contingent on the cutout treatment in Q5; without that move, Direction A would still risk reading as "stock photo site" with placeholders.

---

## 5. What ships in v1 — high level only

(Not the Phase 2 plan. Just so we have shared vocabulary for the open questions below.)

- Homepage (hero + four-card paths + brand showcase + light footer)
- Five sub-brand pages (one template, five instances; brand-coloured chrome via `[data-brand]`)
- Catering page (the brief's "earn the enquiry before asking" structure) + serverless function for submission
- Franchising page (longer self-qualifying form) + serverless function
- Locations page (three pitches; static map of Paddington Basin; opening hours)
- About page (founder origin story, lightly edited from the Wix copy we extracted)
- Contact / Press / 404 pages

Not in v1: blog, e-commerce, online ordering, multi-language, account system, CMS interface.

---

## 6. Phase 2 entry conditions

All four conditions met 2026-05-17:

- [x] Discovery report read and locked.
- [x] All six original questions answered (see §7).
- [x] Showcase direction selected — Direction A with cutout / borderless treatment.
- [x] Stack confirmed — Astro 6 + Cloudflare Pages.

Plus one new decision: a CMS layer (Sveltia CMS) will be added later in Phase 3 to give the client edit access without going through Namit.

**Next deliverable: `docs/plans/0002-build-plan.md` — the Phase 2 plan.** That doc commits the design system tokens, file structure, content schemas, vertical-slice sequence, verification gates between slices, the placeholder-photography curation method, and the deferred CMS slice. It is still a doc-only step; no code is written until the Phase 2 plan is signed off.

After Phase 2 approval, the first executing actions are: write `docs/decisions/0001-stack.md`, run `git init`, scaffold Astro 6, write `.claude/rules/*.md` for the locked stack, first commit `chore: bootstrap Astro on Cloudflare Pages`, then start vertical-slice 1 (design system tokens + base layout + header + footer).

---

## 7. Answers (locked 2026-05-17)

### Q1. Truck count — **answered (a): three only.**

Rebuild commits to three trucks at Paddington Basin: Falafel + Shawarma sharing Merchant Square W2 1PW; Burgers at Canal Side Walk W2 1AS. The "seven trucks" claim on the live site is dropped. The site avoids stating a count that doesn't match the locations page.

### Q2. Sub-brand launch years — **answered: deferred.**

Establishment years are **not rendered anywhere in the v1 prototype**. We confirm with the client once functionality is proved, then add them in a follow-up edit. (Keeping the data field in the brand content schema as optional so the swap is one edit per brand.)

### Q3. Email destination — **answered: `namitg26@gmail.com` for dev.**

Dev / preview environments use `namitg26@gmail.com` for both `CATERING_EMAIL` and `FRANCHISE_EMAIL` env vars so Namit can test form delivery end-to-end. Pre-cutover, both swap to the client's chosen production address (one env-var change per environment). Site-visible email address (footer, contact page, mailto links) is deferred — placeholder during build, locked when the client picks `hello@`, `info@`, or other.

### Q4. Showcase direction — **answered: Direction A (Editorial Fleet), with high-quality curated placeholders.**

The choice is the photography-led direction, deliberately with placeholder photography selected to be good enough that **v1 demonstrates what the final site looks like once the client commissions a real shoot**. The placeholders are a sales tool as much as a placeholder — they show the client the value of investing in photography. (Implication: placeholder selection is a craft activity, not a quick Unsplash search; budget time for it.)

### Q5. Photography path — **answered: high-quality curated placeholders, cutout / borderless aesthetic.**

Curate carefully (not "first result on Unsplash search"). The preferred visual treatment is **cutout-style food photography** — images on transparent or matched-flat backgrounds, with type laid over or beside the food rather than the food framed in a rectangular tile. The aesthetic reference is closer to:

- **Apple product hero pages** — iPhone / Watch silhouetted on flat background, type sits next to or under it
- **Bon Appétit magazine covers** — food cutouts as part of the typographic composition
- **Aesop product pages** — flat-colour ground, single product, considered type

…than to the Pasta Evangelists full-bleed photographic frame. This is a meaningfully different direction from what §3 originally proposed; §3 updated accordingly.

**Sourcing path for v1 placeholders:**
1. Unsplash / Pexels searches for food shots already photographed on plain / neutral backgrounds where masking is clean.
2. CSS `mask-image` + a generated alpha mask, OR a one-time Photoshop / `remove.bg` pass to extract cleaner cutouts where source isn't quite there.
3. Each placeholder logged in `assets-inbox/PLACEHOLDERS.md` with the swap plan.

**Real shoot:** still TBD — client conversation. The v1 prototype's job is to make the case for it.

### Q6. Stack — **answered (a): locked.**

Astro 6 + Cloudflare Pages + Cloudflare Pages Functions + Resend + Turnstile + Zod + bespoke CSS (no Tailwind). Documented in `docs/decisions/0001-stack.md` at Phase 2 entry.

### Q7 (newly raised by Namit). Client editing the site after handover — **resolved with a CMS layer.**

The client has paid for 3 years of Wix. A code-built Astro site **cannot** be migrated into Wix's visual editor (closed platform; no import path). The underlying need — "the client can edit copy and swap photos without going through Namit" — is met instead by:

**Decision: add Sveltia CMS as `/admin` on the Cloudflare Pages deployment.**

- Sveltia is a modernised fork of Decap CMS (formerly Netlify CMS). Open source, free.
- Runs as a single static page at `/admin` on the same deployment.
- Client logs in via GitHub OAuth (Namit invites them to the repo as a collaborator with limited access).
- Every edit becomes a commit to the repo → Cloudflare auto-rebuilds and deploys.
- Owner can edit: all body copy, image swaps, opening hours, menu items + prices, testimonials, sub-brand visibility.
- Owner cannot: change layouts, design tokens, or add new section types — by design.

The Wix subscription is sunk cost. Letting it lapse at renewal costs nothing extra; the legacy Wix site can stay at `simplyltd.co.uk` until the client approves cutover (per the brief's existing plan).

**Phase 2 sequencing:** the CMS layer is **not** the first vertical slice. It's added once the design system + a couple of brand pages prove the content model is right. Adding it earlier risks the schema churning while the pages are still finding their shape.

---

## 8. What I am NOT doing until you sign off

- Writing any code.
- Running `git init` or making any commits.
- Writing the Phase 2 plan.
- Dispatching any further subagents.
- Touching `docs/decisions/`.

The next action belongs to you.
