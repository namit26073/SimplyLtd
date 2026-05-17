# ADR 0007 — Motion budget

**Date:** 2026-05-17
**Status:** Accepted

## Decision

Three signature motion moments across v1, quiet between. Each has a documented reason. `prefers-reduced-motion: reduce` halts motion (not shortens) — verified by accessibility-auditor before any page is marked done.

The three moments:

1. **Hero load** — display headline letter-spacing animates from `0.04em` → `0` over 700 ms ease-out. Subhead + CTAs fade-up 200 ms behind it. Reason: arrival ceremony; signals the page has resolved.
2. **Brand-showcase panel pin** — as a panel scroll-snaps into view, the cutout image translates up ~40 px (320 ms) and the wordmark fades from 0 → 1. Reason: each brand arrives as its own moment, not a passive tile.
3. **Form success state** — submit triggers a spinner (180 ms) → form fades out → success component fades up with an SVG-stroke tick animation (700 ms ease-in-out). Reason: the catering / franchising submission is a high-friction action; the success state earns the friction.

Motion tokens in `src/styles/tokens.css` (`--ease-out`, `--ease-in-out`, `--dur-fast/base/slow`). Reduced-motion overrides all `--dur-*` to `0ms` so any CSS animation using these tokens collapses to no-op.

## Why

- "Modern and futuristic but not overwhelming" per CLAUDE.md translates to: 2–3 signature moments, ambient stillness between.
- Each motion moment has a *reason* (call out a transition, mark an arrival, celebrate a success). No decorative animation.

## What this rules out

- Scroll-driven WebGL geometry as a hero. (Rejected per `references/REJECTED-DIRECTIONS.md`.)
- Tiling film-grain noise on every section. (MEATliquor's mistake.)
- Auto-play video that doesn't respect reduced-motion.
- Any motion that conveys information not also available statically (e.g. tooltips that only appear on motion-tracked hover).

## Verification

Accessibility-auditor emulates `prefers-reduced-motion: reduce`, reloads, and verifies for each motion moment that:
1. No CSS animation is running.
2. The non-motion view is complete — no information lost.
