# Simply Ltd — domain context

> This file is the domain context — who Simply Ltd is, what each sub-brand stands for, what each page must do. It's loaded automatically each session. Coding conventions and stack-specific rules belong in `.claude/rules/<scope>.md` (path-scoped) once the agent has picked a stack. If you're tempted to put a generic engineering rule here, it goes in a rules file instead.
>
> **First-session priority:** read `BRIEFING.md` for the full onboarding, not just this file.

## What Simply Ltd is

UK food-truck group, founded 2019. Operates three confirmed trucks from Paddington Basin in West London. Audiences, in priority order:

1. **Catering enquirers** — weddings, corporate, festivals. Conversion target #1; this is where revenue is.
2. **Prospective franchisees** — growth motion. Conversion target #2.
3. **Walk-up customers** — looking for "where's the nearest Simply truck, what's on the menu, when does it open." Homepage should stay useful for them but craft budget concentrates on (1) and (2).

The current `simplyltd.co.uk` (Wix) is what we're replacing. Its nav lies (most items 404), its brand identity is unresolved (footer says "© 2019 by Simply Falafel" while the site is "Simply Ltd"), its hero is cartoon illustrations rather than food. **Do not import those decisions.**

## Brand architecture

Parent shell + distinct sub-brand expressions. `simplyltd.co.uk` is the parent that handles About / Catering / Franchising / Contact and routes to sub-brand pages. Each sub-brand has its own type / palette / motion / photography expression and a `/<brand>` subpath. Owner has bought sub-brand domains (e.g. `simplypasta.co.uk`); plan is to 301-redirect those to `/<brand>` at production cutover.

## Sub-brands (the content model scales to N — don't hard-code 4 or 5)

| Slug | Name | Concept | Voice flex | Established |
|---|---|---|---|---|
| `falafel` | Simply Falafel | Vegan/vegetarian Levantine — the origin | Warm, confident, plant-positive without being preachy | 2019 |
| `shawarma` | Simply Shawarma | Levantine shawarma, late-night | Fast, generous, late-night-friendly | 2021 |
| `lebanese` | Simply Lebanese | Combined Lebanese offering | Rooted, family-table-feel, hospitable | 2023 |
| `burgers` | Simply Burgers | Smash burgers | Loud, direct, indulgent | Most recent |
| `pasta` | Simply Pasta | Fresh pasta, weekend pop-up | Italian-confident, restrained | TBD |

When proposing copy or design, **flex the voice per sub-brand** but keep parent-level Simply Ltd copy steady and credible. The parent is the trust signal; sub-brands are the personality.

## Real pitch data (confirmed by owner 2026-05-16)

> "hey are all in Paddington. Simply Shawarma and Simply Falafel is Merchant Square Paddington W2 1PW. Simply Burgers is Canal Side Walk Paddington Basin, London W2 1AS"

Confirmed three trucks at Paddington Basin:

- **Simply Falafel + Simply Shawarma** share Merchant Square, W2 1PW. Approx `51.5193, -0.1768`.
- **Simply Burgers** at Canal Side Walk, Paddington Basin, W2 1AS. Approx `51.5187, -0.1748`.

The Merchant Square and Canal Side Walk pitches are ~250m apart along the Paddington Basin canal. Simply Lebanese and Simply Pasta pitches not yet confirmed; assume Paddington Basin until owner confirms; mark them placeholder.

## Catering — what the page must do

The catering page is the rebuild's revenue engine. v1 is a **register-interest stub** — owner doesn't want to surface deep content yet. The page must:

- Earn the enquiry before asking for it: show event types, named past clients or testimonials if available, lead-time, coverage area, and (when content arrives) package tiers. Long form goes at the bottom, not the top.
- Use progressive disclosure on the form (don't ask for guest count before the user has any sense of minimum spend).
- Send the submission to a serverless function; destination email is configurable via env var (`CATERING_EMAIL`).
- Include Turnstile (or equivalent free anti-spam) on form submission.

Form fields (v1): name, email, phone (optional), event date (or "flexible"), event type (wedding / corporate / festival / private / other), guest count, location, free-text notes. Validate email + presence of at least one contact method.

## Franchising — what the page must do

Also a register-interest stub in v1. Must:

- Speak to high-intent visitors who self-identify quickly. No "is this for me?" ambiguity.
- Surface credibility signals even without a full prospectus: years operating, number of pitches, sub-brand range as a proof of concept.
- Provide a deliberately-longer qualified-lead form (investment range, location interest, timeline). The longer form is a filter, not a barrier — high-intent visitors will complete it; low-intent visitors will self-deselect, which is the goal.
- Send to a serverless function; destination via env var (`FRANCHISE_EMAIL`).

## Locations

Three confirmed fixed pitches (not rotating). Each truck has a pitch address + opening hours (may vary by day). Locations page = map view + list view. No calendar/rota UI needed.

## Photography in v1

Real food / truck / customer photography is incomplete. We have:

- Owner-provided videos: kitchen footage from the Falafel and Shawarma trucks (in `assets-inbox/videos/`).
- Owner-provided logo files: `BurgerLogo.jpeg` + `AllOtherLogos.jpeg` (raster, multiple-marks-in-one for the older brands).
- **No food close-ups, no truck exteriors, no customer scenes, no canal scene photos.**

This is a real constraint. The agent should:

1. Plan to use the videos as anchor hero content where possible.
2. Use high-quality stock placeholders from Unsplash / Pexels for missing categories. Document each placeholder in `assets-inbox/PLACEHOLDERS.md` with the replacement plan.
3. **Never use AI-generated food imagery as a primary asset.** That's the explicit anti-pattern.

## Motion

"Modern and futuristic but not overwhelming." Translation: 2–3 strategic showpieces, quiet between. Hard `prefers-reduced-motion` floor — every motion moment must have a static fallback validated by the accessibility-auditor subagent before being marked done.

## Hard constraints (do not violate)

- **Hosting must permit commercial use on the free tier.** Vercel Hobby (forbids commercial), GitHub Pages (forbids online business), Netlify Free (commercial-OK but new 15 GB/mo cap) are all worth considering vs Cloudflare Pages. Agent picks; document the call.
- **Lighthouse ≥95 mobile** across Performance / Accessibility / Best Practices / SEO — with the wow-factor active, not as a non-motion fallback. The design-reviewer subagent enforces this.
- **No production domain wiring yet.** Work on a hosted preview URL until the owner approves cutover.
- **Dev form-submission email** is whatever Namit (the human running this build) provides via env var; production swap is one env-var change at deploy time.

## Anti-patterns (explicit, learned the hard way)

Three signature-interaction directions have been rejected on the parallel build:

1. **AI-template minimalism** — Inter font, soft grey cards, generic gradient backgrounds. Reads as "every other site."
2. **Stylised SVG cartoon illustration as homepage hero** — Rejected as "looks like a child made it."
3. **Procedural low-poly 3D (Three.js cubes / Animal Crossing aesthetic)** — Rejected as "Minecraft / game feel."

Common thread: when the hero is **generated** by the agent rather than **sourced** (real photography, commissioned art, pre-rendered cinematic), it doesn't reach the quality bar.

**Reference quality bar the owner has named:** *"an advert made by Adidas or Apple."* That implies real photography, considered typography, cinematic motion, restraint. Direct competitors worth referencing as positive examples: Pasta Evangelists, Honest Burgers, MEATliquor, Pizza Pilgrims — all use real food photography, none use procedural-3D-as-hero.

## What you have, what you don't

You have:
- This brief.
- 2 real kitchen videos.
- 2 logo files (raster).
- The owner's real pitch addresses.
- Three pre-wired subagents (design-reviewer, accessibility-auditor, content-researcher).

You don't have:
- Real food photography. (Use Unsplash placeholders; document the swap plan.)
- A production domain. (Stay on the hosted preview URL.)
- Pasta and Lebanese pitch addresses confirmed. (Use placeholder addresses; mark them.)
- A locked stack. (Pick the right one for the design direction you choose; document in `docs/decisions/`.)
