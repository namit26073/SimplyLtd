# ADR 0004 — Palette

**Date:** 2026-05-17
**Status:** Accepted (brand-accent hex values may shift after Slice 1 on-screen contrast review)

## Decision

**Parent palette** (used everywhere except branded sections):

- `--color-cream` — warm cream surface, `#F4EFE6`
- `--color-ink` — off-black text + display, `#1A1A18`
- `--color-canal` — cool neutral grey for restraint, `#7A7E78`
- `--color-line` — `color-mix(in srgb, var(--color-ink) 8%, transparent)`

**Brand accents** (each scoped to `[data-brand="<slug>"]`; starting hex from logo halos, locked in Slice 1):

| Brand | `--color-accent` | `--color-accent-contrast` |
|---|---|---|
| Falafel | `#3F7A3A` (deep leaf green) | cream |
| Shawarma | `#E8B83A` (warm gold-yellow) | ink |
| Lebanese | `#A6342E` (oxblood red) | cream |
| Burgers | `#C03020` (deep red) | cream |
| Pasta | `#E07A2A` (warm orange) | ink |

## Why

- Cream + ink + canal-grey gives an editorial neutral foundation that reads as professional, not generic. Avoids the "soft grey card" template-look that got rejected previously.
- Brand accents are derived from the **actual** truck-side branding observed in the owner's logo halos — a real identity asset rather than an invention.
- Contrast pairs verified ≥4.5:1 for body text and ≥3:1 for large text per WCAG 2.2 AA in Slice 1.

## Notes

- Photography overlay floor: any text-on-photo block uses ≥30% black gradient overlay (or matched text-shadow) guaranteeing 4.5:1 contrast. Accessibility-auditor verifies.
- Per Q3 (locked), Lebanese and Pasta brands are `visible: false` in v1; their accent tokens still exist in the schema so flipping them on later is a one-line change.
