# ADR 0001 — Stack

**Date:** 2026-05-17
**Status:** Accepted

## Decision

Astro 6 + Cloudflare Pages + Cloudflare Pages Functions + Resend + Turnstile + Zod + bespoke CSS (no Tailwind).

## Why

- **Astro 6:** islands architecture ships zero JS by default; built-in `<Image />` enforces width/height (no CLS); experimental Fonts API self-hosts subsets; declarative View Transitions. Fits a marketing site with a few interactive islands cleanly. Reaches Lighthouse ≥95 mobile more easily than React-first frameworks.
- **Cloudflare Pages:** commercial use explicitly OK on free tier. Unlimited bandwidth + unlimited requests (fair use, no overage). 500 builds/month, 20-min timeout, 25 MiB asset cap. Suits a marketing site.
- **Pages Functions:** inherits Workers free tier (100k req/day, 10ms CPU, 50 subrequests/req). Easily covers two contact forms.
- **Resend:** 3,000 emails/month free, commercial-OK, great DX.
- **Turnstile:** native to Cloudflare, free, no privacy-violating reCAPTCHA.
- **Zod:** shared form-input schemas between client island and server function — one source of truth.

## Alternatives rejected

- **Next.js + Vercel** — Vercel Hobby ToS forbids commercial use. Hard out.
- **Next.js + Cloudflare** — possible, but adds React-shaped JS overhead for what's mostly content-driven pages.
- **SvelteKit** — Astro's island model matches our shape (static-with-a-few-islands) more directly; Astro's `<Image />` story is stronger.
- **GitHub Pages** — ToS forbids commercial use. Hard out.
- **Netlify Free** — commercial-OK but moved to credit-based pricing post-Sept 2025 (300 credits/mo, deploys 15 credits each, bandwidth 20 credits/GB). Materially tighter and unpredictable to budget vs Cloudflare's unlimited bandwidth.
- **Tailwind** — rejected per the project's anti-generic stance (see `references/prior-build-rules/components.md`). Utility-class soup nudges design toward generic. Bespoke CSS with `@layer`, container queries, and design tokens in custom properties.
- **Headless CMS in initial build** — unnecessary. Content lives in Markdown in the repo; Sveltia CMS overlays at `/admin` later (ADR 0009).
