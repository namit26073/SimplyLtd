# Client feedback round 1 — plan

**Date:** 2026-08-25 · **Branch:** `feat/prelaunch` · **Source:** owner's WhatsApp reply to the preview.

## Asks (verbatim intent)

1. "Fix the map to represent the actual locations so people can easily find them."
2. "We are missing 1 shop — Simply Lebanese." (falafel, shawarma, burgers, smash me up are there.)
3. Catering: logos of places catered — Battersea Power Station, Winter Wonderland, Underbelly
   Festival, IMG Events, Sony, Chiswick Business Park — "a scrolling logo animation" under
   "We've fed all of these."
4. (Namit) The people-fed counter should read as live.

## Findings

- Postcode geocoding (postcodes.io): W2 1PW → 51.519082, −0.176271; W2 1AS → 51.518829,
  −0.173326. The Canal Side Walk pin was ~100 m west of its postcode; Merchant Square ~40 m off.
  Pins were hard-coded in `PaddingtonBasinMap.astro`, duplicating the locations collection.
- ADR 0011 says "static SVG map" but the component is Leaflet + OSM tiles. Doc is stale.
- `brands/lebanese.md` is `visible: false`, no pitch, no imagery, body copy says "off public
  rota". Owner now lists it as an operating concept (the 4th of the 7-trucks/4-concepts stat).
- No logo files exist for the six clients.

## Tasks

- [ ] **T1 Map** — coordinates → postcode centroids in `src/content/locations/*.md`; map reads
      pins from the collection via props; "Get directions" (Google Maps + Apple Maps by address)
      on each location card and popup; caption + aria updated; ADR 0011 amended to reflect
      Leaflet; screenshot at zoom 17 for the owner to confirm exact spots.
- [ ] **T2 Simply Lebanese** — `visible: true`, `establishedYear: 2023`, showcase/hero image =
      frame from the owner's shawarma kitchen footage (real, not stock; logged in
      PLACEHOLDERS.md), `heroVideo`/`behindCounterVideo` reuse the shawarma truck film, neutral
      body copy ("pitch details coming soon; book for events"). Showcase rail → 5 cards
      (desktop `repeat(5, 1fr)`), heading "Four concepts. One canal. And something new.",
      About "Meet the fleet" gains Lebanese. Pitch left unset until the owner confirms.
- [ ] **T3 Client strip** — `src/components/ClientMarquee.astro`: CSS-only infinite marquee
      (duplicated track, `translateX` keyframes, pause on hover/focus), static wrapped row under
      `prefers-reduced-motion: reduce`. Items are typographic wordmarks now; each accepts an
      optional image so real logos drop in without a template change. Placed after the events
      grid with kicker "Some of the names we've fed".
- [ ] **T4 Counter** — pulsing dot + "live" label (motion off under reduced-motion), count-up
      runway 10,000 over ~2.2 s.
- [ ] **T5 Verify + ship** — `astro check`, Vitest, build; Lighthouse (home, locations,
      catering, franchising); keyboard/reduced-motion checks on marquee + map; deploy preview;
      push; hand Namit the questions for the owner.

## Owner questions (relay via Namit)

1. Simply Lebanese — address/postcode, hours, truck or shop, on the map?
2. Logo files for the six clients, or permission to use public logos, or plain names?
3. Confirm pins on the map screenshot mark the exact truck spots.
4. Counter — 300/day per truck or fleet-wide; is 400k the lifetime total?
