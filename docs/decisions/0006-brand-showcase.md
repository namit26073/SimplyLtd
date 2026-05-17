# ADR 0006 — Brand showcase: Direction A (Editorial Fleet)

**Date:** 2026-05-17
**Status:** Accepted

## Decision

The homepage four-brand-showcase section is built per "Direction A — Editorial Fleet" from the Phase 1 discovery report.

Per panel:
- Brand's halo accent colour as full panel background.
- Cutout food image (alpha PNG) floats on the panel — not a full-frame photographic crop.
- Wordmark in `Anton` sits in editorial relationship to the cutout (type below the food on mobile; alongside on desktop).
- `Fraunces` italic dek of 18–22 words below the wordmark.
- Metadata strip (pitch · dietary tag) lower-left / right.
- Scroll-snap moves between panels; View Transitions API hands off into the sub-brand page on tap.

**Scope:** 3 visible panels in v1 (Falafel, Shawarma, Burgers). Lebanese + Pasta are `visible: false` per Q3 and excluded from the showcase until pitch addresses and content land.

## Why

- Photography-led direction expresses the visual ambition of the build at v1 quality without relying on generated visuals (the rejected family). The placeholder photography demonstrates the photographed end-state to the client and makes the case for commissioning real photography.
- Direction A (vs Direction B typography-led or Direction C video-anchored) was selected by Namit at Phase 1 sign-off because v1 needs to show the client *what the photographed version looks like*.

## Alternatives rejected (full detail in Phase 1 discovery report §4)

- **Direction B — Roll Call (typography-led).** Safer v1 floor; no asset dependency. Rejected because it doesn't demonstrate the photographic end-state to the client.
- **Direction C — Fleet, In Motion (video-anchored).** Uses the two owner kitchen videos; mixed-with-typographic panels. Rejected because v1 with mismatched video and type would risk reading as inconsistent.

## Reduced-motion path

- Scroll-snap remains (it's a layout primitive, not motion per se).
- Cutout-translate + wordmark fade-in are halted (not shortened) — verified by accessibility-auditor.
- View transitions degrade to standard navigation.
