# ADR 0002 — Hosting on Cloudflare Pages free tier

**Date:** 2026-05-17
**Status:** Amended 2026-08-24 — in practice the site deploys as a Cloudflare **Worker
with static assets** (name `simply`, manual `npm run deploy`), not a Pages project.
Same free-tier commercial terms apply. The Instagram cron workflow still targets the
Pages API and needs rewriting (see `docs/runbooks/domains-cutover.md`).

## Decision

Deploy on Cloudflare Pages free tier. No paid services in v1.

## Why

- Commercial use explicitly OK on free tier.
- Unlimited bandwidth + unlimited requests (fair use, no overage charges).
- 500 builds/month, 1 concurrent build, 20-min build timeout — plenty for our cadence.
- 20,000 files per site, 25 MiB per asset — comfortable.
- 100 custom domains per project.
- GitHub auto-deploy: every push to `main` triggers a preview / production deploy.
- Pages Functions inherit Workers free tier (see ADR 0001).

## Alternatives rejected

See ADR 0001 — Netlify Free's credit-based pricing post-Sept 2025 is tighter; Vercel and GitHub Pages forbid commercial use.

## Operational notes

- Production domain (`simplyltd.co.uk`) wiring is **not** done in v1. Site lives on the auto-generated `*.pages.dev` preview URL until the owner approves cutover.
- Env vars (`CATERING_EMAIL`, `FRANCHISE_EMAIL`, `TURNSTILE_*`, `RESEND_*`) configured in the Cloudflare Pages dashboard, not in the repo.
