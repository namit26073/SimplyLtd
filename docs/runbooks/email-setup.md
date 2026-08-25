# Runbook — enquiry emails (Resend + Turnstile) on the Worker

The catering and franchising forms POST to `/api/catering` and `/api/franchising` —
Astro on-demand routes served by the `simply` Worker (`src/pages/api/*.ts`, shared
pipeline in `src/server/enquiry.ts`). **Until the secrets below are set, the Worker
is in mock mode: the form reports success, logs the shape, and emails nobody.**

## What production needs

| Where                 | Name                        | Value                                                                                       |
| --------------------- | --------------------------- | ------------------------------------------------------------------------------------------- |
| Worker secret         | `CATERING_EMAIL`            | Inbox for catering enquiries                                                                |
| Worker secret         | `FRANCHISE_EMAIL`           | Inbox for franchising enquiries (can be the same)                                           |
| Worker secret         | `RESEND_API_KEY`            | From resend.com → API Keys                                                                  |
| Worker secret         | `RESEND_FROM_ADDRESS`       | e.g. `Simply Ltd <enquiries@simplyltd.co.uk>` — the domain must be verified in Resend       |
| Worker secret         | `TURNSTILE_SECRET_KEY`      | Cloudflare → Turnstile → the widget's **Secret key**                                        |
| Build-time public var | `PUBLIC_TURNSTILE_SITE_KEY` | The widget's **Site key** — `.env.local` locally, a GitHub Actions _variable_ for CI builds |

Replies go to the submitter's address (`reply_to`), so the owner can just hit Reply.

## One-time setup

1. **Resend account** (free tier: 3,000 emails/month) → **API Keys → Create** → paste
   into `.env.local` as `RESEND_API_KEY=`.
2. **Verify the sending domain.** Resend → **Domains → Add domain** → `simplyltd.co.uk`.
   It lists DNS records (DKIM TXT, SPF TXT, MX for bounces). Add them wherever the
   domain's DNS lives _right now_ — Porkbun before cutover, Cloudflare after — then
   click **Verify**. After the nameserver move, re-check the records exist in the
   Cloudflare zone (its import usually carries them over; re-add if not).
   - Stopgap before verification: `RESEND_FROM_ADDRESS="Simply Ltd <onboarding@resend.dev>"`
     works immediately but **only delivers to the Resend account's own email** — fine
     for testing the pipe, not for the owner's inbox.
3. **Turnstile widget.** Cloudflare dashboard → **Turnstile → Add widget**: name
   `Simply Ltd`, hostnames `simplyltd.co.uk` and `simply.namit-garg.workers.dev`,
   mode _Managed_. Copy the **Site key** → `.env.local` `PUBLIC_TURNSTILE_SITE_KEY=`
   and the **Secret key** → `TURNSTILE_SECRET_KEY=`.
4. **Destinations.** `CATERING_EMAIL=` and `FRANCHISE_EMAIL=` in `.env.local`.
5. **Push secrets to the Worker:** `node scripts/push-worker-secrets.mjs`
   (reads `.env.local`, runs `wrangler secret put` per variable, skips unset ones).
6. **Rebuild + deploy** so the site key is baked in: `npm run deploy`.
7. For CI builds: add `PUBLIC_TURNSTILE_SITE_KEY` as a repository **variable** in
   GitHub (Settings → Secrets and variables → Actions → Variables).

## Test the real path

Submit the catering form on the preview with a real email of yours. Expect: a
Turnstile widget above the button, the success state after submit, and the email in
the `CATERING_EMAIL` inbox within seconds. Live Worker logs: `npx wrangler tail simply`.

## Behaviour matrix (from `src/server/enquiry.ts`, covered by `tests/api/`)

| Secrets set                        | Result                                                           |
| ---------------------------------- | ---------------------------------------------------------------- |
| none                               | mock success (`{ ok: true, dev: true }`), nothing sent           |
| `TURNSTILE_SECRET_KEY` only        | Turnstile enforced; still mock send                              |
| `RESEND_API_KEY` without Turnstile | sends, but only accepts the `dev-bypass` token (site key unset)  |
| all                                | verified + sent; Resend failure → 502 with a user-facing message |

The honeypot (`botField`) rejects at validation; a missing destination var falls back
to `namitg26@gmail.com` with a warning in the logs — set the vars so it never does.
