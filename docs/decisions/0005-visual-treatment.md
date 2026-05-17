# ADR 0005 — Visual treatment: cutout food on flat colour

**Date:** 2026-05-17
**Status:** Accepted

## Decision

The site's visual signature is **cutout food photography on flat brand-coloured grounds**, with editorial typography placed beside or beneath the food rather than over it.

## Why

- Direct positive reference: **Amigos Burgers & Shakes** (`amigosburgersandshakes.com`). Cutout product floating on flat colour, oversized stacked editorial display type, small playful sticker accents, strong split layout, confident negative space. The exact aesthetic energy the owner is going for.
- Additional lineage: Apple product hero pages (iPhone / Watch silhouetted on flat ground), Bon Appétit magazine covers, Aesop product pages.
- Cutout treatment is the design move that lets **placeholder photography** read as intentional composition rather than "stock photo dressed up." A full-bleed photographic tile with placeholder content telegraphs "stock"; a cutout floating on a confident brand colour with confident typography telegraphs "considered editorial choice."
- When real photography arrives, cutouts swap for higher-quality cutouts of real Simply Ltd food. No layout change needed.

## What this rules out

- Full-bleed photographic tiles as the primary visual signature (the Pasta Evangelists pattern; structurally we still borrow PE's four-card first-fold logic, just not its tile treatment).
- Text overlaid on busy photography (overlay contrast problem; we don't have the photographs to control it).
- Card chrome (soft drop shadow + rounded rectangle) as the default container — that's the AI-template aesthetic the brief rejected.

## Photography role

- Photography is a **protagonist in dialogue with typography**, not in solo. Type and photo are equal participants in the composition.
- Where a photograph isn't available, large editorial type stands alone — this is acceptable and preferred over a stock-photo stand-in.

## Sourcing implications

See ADR 0006 and §11 of `docs/plans/0002-build-plan.md`. Per-slice asset gates; pre-cut PNG sources preferred; Unsplash + remove.bg as fallback; Instagram not used (resolution too low).
