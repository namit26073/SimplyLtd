# ADR 0008 — Content model: Astro content collections + Zod schemas

**Date:** 2026-05-17
**Status:** Accepted

## Decision

Brand, location, testimonial, and press data live as Markdown / MDX files in `src/content/<collection>/`, validated by Zod schemas in `src/content.config.ts`. No headless CMS in initial build.

Collections in v1:

- `brands` — one entry per sub-brand (Falafel, Shawarma, Lebanese, Burgers, Pasta). Schema includes `visible: boolean` to hide Lebanese + Pasta in v1 without deleting them.
- `locations` — one entry per pitch (Merchant Square, Canal Side Walk).
- `testimonials` — stubbed, unpopulated until client provides material.
- `press` — stubbed, unpopulated.

Form input schemas (`src/schemas/{catering,franchising}.ts`) are shared between the React island and the Cloudflare Pages Function — one definition, both sides validate against it.

## Why

- Astro's built-in content collections give us type-safe data with zero infra.
- Markdown in the repo is the simplest possible content layer; suitable for a build with <50 content entries.
- Zod schemas double as runtime validation (forms) + compile-time types (content). Single source of truth.

## Alternatives rejected

- **Sanity / Strapi / Contentful** — unnecessary in v1; client doesn't need to edit content weekly. Adds infra, cost, and a network dependency.
- **Plain JSON files** — loses Markdown's nice prose editing; no type validation.
- **Database (D1 / SQLite)** — overkill for static content.

## Editing path for the client (post-v1)

Sveltia CMS (ADR 0009) overlays a web UI on `/admin` that commits to this same content tree. Client gets edit access without us migrating off the file-based model.
