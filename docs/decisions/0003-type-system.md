# ADR 0003 — Type system

**Date:** 2026-05-17
**Status:** Accepted

## Decision

- **Display:** `Anton` — free, Google Fonts, condensed grotesque, single weight 400. Editorial headlines + brand wordmarks.
- **Editorial subhead / pullquote:** `Fraunces` — free, Google Fonts, variable serif, weights 300–700, italic available. Humanist serif counter-voice to the display sans.
- **Body:** `Inter` — free, ubiquitous, weights 400–700. Self-hosted via Astro Fonts API, subset to Latin.

Type scale: modular ratio 1.25, base 17px. Defined in `src/styles/tokens.css`.

## Why

- Three faces, each with a distinct role: monumental display / editorial flex / invisible body work.
- Anton paired with Fraunces echoes the editorial confidence of the named references (MEATliquor's display + Pasta Evangelists' serif system) without copying either.
- Inter as body keeps Lighthouse perf clean — well-subsetted, woff2, swap loading. The BRIEFING.md "AI-template" rejection used Inter alongside Fraunces serif headline + soft cards; the rejection wasn't of Inter itself but of the overall lack of point of view. In our system, Anton carries the personality; Inter is invisible body.

## Alternatives rejected

- **IBM Plex Sans for body** — slightly more idiosyncratic but harder to subset cleanly; Inter wins on perf + readability.
- **Display: Druk / Knockout / Tungsten** — paid licences; Anton is the closest free analogue.
- **Body: system stack** — saves a font request but undercuts type-system coherence on diverse devices.

## Notes

- All three loaded via Astro's experimental Fonts API (`astro.config.mjs`). No Google Fonts CDN — self-hosted, single domain.
- Font CSS critical path budget: ≤30 KB.
