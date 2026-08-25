# Forms on the Worker + Instagram automation — design note

**Date:** 2026-08-25 · **Branch:** `feat/prelaunch` · **Trigger:** owner asked for enquiry
emails to actually reach him, and for the Instagram grid to stay fresh without manual
token renewals.

## Findings that shaped this

- The site deploys as a Cloudflare **Worker**; the form handlers were Cloudflare
  **Pages Functions** in `functions/`, which the Worker never bundles. On the live
  preview `POST /api/catering` returned **404** — the forms could not work at all.
- The Turnstile widget was never rendered on the client; the islands sent a
  `dev-bypass` sentinel. Setting `TURNSTILE_SECRET_KEY` alone would have failed every
  submission.
- The 6-hourly Instagram cron targeted the Pages API for a nonexistent project, and
  the Instagram token (`graph.instagram.com`, Instagram-Login flavour) expires every
  60 days.

## Decisions

1. **Endpoints move into Astro** — `src/pages/api/{catering,franchising}.ts` with
   `prerender = false`, served by the existing `@astrojs/cloudflare` adapter. The two
   near-identical handlers collapse into `src/server/enquiry.ts` (`handleEnquiry`).
   Behaviour is unchanged (validation → honeypot → Turnstile → Resend/mock); env comes
   from `locals.runtime.env`, read duck-typed so no adapter type coupling. `functions/`
   deleted. Tests in `tests/api/enquiry.test.ts` mock `fetch`.
2. **Turnstile rendered explicitly** via `useTurnstile()` in both islands: loads
   `api.js?render=explicit` once, `turnstile.render()` into a container above the
   submit button, `getResponse(widgetId)` at submit, `reset()` on server rejection.
   Explicit render survives ClientRouter navigations (implicit auto-scan would not).
   No site key → nothing renders and the `dev-bypass` path is preserved.
3. **Secrets via `wrangler secret put`**, scripted by `scripts/push-worker-secrets.mjs`
   from `.env.local`. Runbook: `docs/runbooks/email-setup.md`.
4. **CI deploy workflow** `.github/workflows/deploy.yml` replaces the dead cron:
   on push to `main`, every 6 h, and manually. It reads `IG_USER_ID`/`IG_ACCESS_TOKEN`
   from KV namespace `simply-config` (`93dd79c0c56a42458290fab826ed2368`), calls
   Meta's `refresh_access_token` (one success per 24 h → 60 more days), writes the
   new token back to KV, builds (fetching posts), and `wrangler deploy`s. Needs GitHub
   secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` and variable
   `PUBLIC_TURNSTILE_SITE_KEY`. Scheduled runs only fire from `main`, so it activates
   at merge — i.e. at cutover — and makes `main` the deploy source of truth.

## Not doing

- No rate limiting on the endpoints (KV-backed limiter deferred, as ADR 0010 noted).
- No automated re-minting if the token is ever *invalidated* (password change,
  revoked app) — the manual path in the Instagram runbook covers that.
