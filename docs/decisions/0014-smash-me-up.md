# ADR 0014 — Smash Me Up teaser + second Pages project

**Date:** 2026-08-24
**Status:** Accepted

## Decision

- Smash Me Up (future permanent shop; owner-registered smashmeup.com) is teased as a
  fourth card in the homepage BrandShowcase via a dedicated `ComingSoonPanel.astro` —
  **not** a `brands` content-collection entry, because it links off-site instead of
  routing to `/[brand]` and has no menu, pitch, or page of its own yet.
- smashmeup.com is a single hand-written static page in `sites/smashmeup/`, deployed as
  a second Cloudflare Pages project (`smashmeup`) by direct upload
  (`npx wrangler pages deploy sites/smashmeup --project-name smashmeup`). No build step.
- Brand vanity domains 301 via Porkbun URL forwarding; only simplyltd.co.uk and
  smashmeup.com move nameservers to Cloudflare (Pages custom-domain requirement).
  See `docs/runbooks/domains-cutover.md`.

## Why

- A collection entry would force fake data through the brands schema (pitch, menu,
  visibility) for something that is not a sub-brand page.
- Direct upload keeps the coming-soon page decoupled from the main site's build — it
  changes approximately never.
- Porkbun forwarding is a minutes-per-domain change with no nameserver moves for
  pure-redirect domains.

## Revisit when

Smash Me Up becomes real content — it then gets a proper brand expression and likely
its own site or a full sub-brand treatment.
