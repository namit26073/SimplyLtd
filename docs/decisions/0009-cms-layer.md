# ADR 0009 — Client editing via Sveltia CMS at /admin

**Date:** 2026-05-17
**Status:** Accepted (implementation deferred to Slice 12)

## Decision

Add **Sveltia CMS** (open-source fork of Decap CMS / Netlify CMS) at `/admin/` on the Cloudflare Pages deployment. Client logs in via GitHub OAuth; every edit becomes a commit to the repo; Cloudflare rebuilds and redeploys automatically.

## Why

The client wants to edit the site after handover without going through Namit. The client has paid for 3 years of Wix; that subscription is sunk cost — there is no migration path from a code-built Astro site into Wix's visual editor (Wix is a closed platform). Sveltia CMS solves the *underlying need* on our stack.

What the client can edit:
- All body copy on every page
- Image swaps (drag-and-drop upload)
- Opening hours per pitch
- Menu items + prices
- Testimonials / press mentions
- Sub-brand visibility (the `visible` flag)

What the client cannot edit:
- Page layouts
- Design tokens
- Section types

…by design — the design system stays curated.

## Why Sveltia over Decap CMS

- Sveltia is a modernised fork of Decap (formerly Netlify CMS); lighter, faster, actively maintained.
- Same git-backed model; same config format; better UX.

## Alternatives rejected

- **TinaCMS** — paid for cloud team mode; solo mode less polished. Sveltia wins on price + UX.
- **Self-host Strapi / Directus** — adds an always-on server cost; we'd need a small VPS. Not free-tier.
- **Don't ship a CMS, write a custom edit UI** — too much surface area for v1.

## Implementation notes (Slice 12)

- Sveltia served as static files from `public/admin/`.
- GitHub OAuth proxy lives as a tiny Cloudflare Worker (~30 lines).
- OAuth client secrets go in Cloudflare env vars, never the repo.
- Client invited as a GitHub collaborator with limited scope.
