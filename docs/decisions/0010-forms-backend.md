# ADR 0010 — Forms backend: Pages Functions + Resend + Turnstile

**Date:** 2026-05-17
**Status:** Accepted

## Decision

Catering and franchising form submissions are handled by Cloudflare Pages Functions in `functions/api/{catering,franchising}.ts`. Each function:

1. Verifies the Turnstile token against Cloudflare's verification endpoint.
2. Validates the payload against the shared Zod schema (`src/schemas/<form>.ts`).
3. Rejects honeypot (`bot_field`) submissions.
4. Composes the email and sends it via Resend.
5. Returns `{ ok: true }` on success or `{ ok: false, errors }` on validation failure.

Destination addresses come from env vars — never hard-coded.

## Env vars

| Var | Dev value | Prod value |
|---|---|---|
| `CATERING_EMAIL` | `namitg26@gmail.com` | (client's address — locked pre-cutover) |
| `FRANCHISE_EMAIL` | `namitg26@gmail.com` | (client's address — locked pre-cutover) |
| `RESEND_API_KEY` | (Namit's Resend key) | (production Resend key) |
| `TURNSTILE_SECRET_KEY` | (Namit's Turnstile secret) | (production secret) |
| `TURNSTILE_SITE_KEY` (public) | (Namit's Turnstile site key) | (production site key) |

## Why

- Pages Functions + Workers free tier covers 100k req/day at 10ms CPU per req — orders of magnitude more headroom than a marketing-site form will ever need.
- Resend free tier (3,000 emails/month) is more than enough; no client credit card.
- Turnstile is privacy-friendlier than reCAPTCHA and native to the Cloudflare stack.
- Zod schema shared with the React island = client-side validation that exactly mirrors server-side.

## Alternatives rejected

- **Formspree / Getform / etc.** — third-party form-as-a-service; adds a network dep and surfaces brand chrome.
- **Mailgun / Postmark / SendGrid** — heavier setup, often paid for low volumes.
- **No anti-spam** — guaranteed to be hit by spam within weeks for a public form.
- **reCAPTCHA** — privacy concerns; not in keeping with the rest of the stack.

## Rate limiting

Deferred to v1.1. Cloudflare KV-based rate limiter by `cf-connecting-ip` is the planned add when traffic warrants.

## Logging

`console.log` is the only mechanism in v1; surfaces in the Cloudflare Pages dashboard. **Never log the email body** in production — submitter data is sensitive.
