# ADR 0013 — Parent-brand identity across all chrome

**Date:** 2026-05-17
**Status:** Accepted

## Decision

Every chrome element — page `<title>`, footer copyright, `mailto:` links, OG tags, structured data, social handles — uses the parent identity **Simply Ltd**. No "Simply Falafel" residue anywhere.

Specifically:

- Page title pattern: `<Page> · Simply Ltd` (e.g. "Catering · Simply Ltd", "Simply Falafel · Simply Ltd")
- Footer: `© 2026 Simply Ltd` (current year, dynamic)
- Email displayed: `info@simplyltd.co.uk` (provisional; confirm with client)
- Email used by dev forms (`CATERING_EMAIL`, `FRANCHISE_EMAIL` env vars): `namitg26@gmail.com` until cutover
- OG site_name: `Simply Ltd`
- Twitter / X meta: not set unless the client provides a handle
- LocalBusiness structured data: `name: "Simply Ltd"`, individual `subOrganization` entries per sub-brand

## Why

The existing Wix site is identity-confused — the page title reads "simply falafel", the footer says "© 2019 by Simply Falafel", the email is `info@simplyfalafel.co.uk`, but the Wix project is named "Simply Ltd Main" and the brand is positioned as an umbrella. Rebuild commits day one to a clean parent identity.

## Notes

- The "Simply Falafel" sub-brand is honoured *as the origin* in About-page copy ("Founded in 2019, our journey began with a single food truck: Simply Falafel…") and as one of the five sub-brand pages — but never as the parent.
- Owner has bought sub-brand domains (e.g. `simplypasta.co.uk`); 301-redirect them to `/<brand>/` at production cutover (Phase 4).
