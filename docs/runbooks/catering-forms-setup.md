# Catering + franchising forms — setup runbook

> Owner-facing setup for the enquiry forms on `/catering` (and, when sprint 7
> lands, `/franchising`). One-time Resend account + domain verification, plus
> the env-var layout for local dev vs Cloudflare Pages.

## How the form actually delivers

1. Visitor submits the form on `/catering`.
2. The React island (`src/islands/forms/Catering.tsx`) validates client-side,
   then POSTs JSON to `/api/catering`.
3. Cloudflare Pages routes that to the function in `functions/api/catering.ts`,
   which re-validates server-side, runs the Turnstile spam check (when
   configured), and calls Resend's `/emails` API to deliver.
4. The email lands in the inbox set by `CATERING_EMAIL`.

If `RESEND_API_KEY` is unset, the function returns mock-success and logs
the submission shape (no PII) — so dev iteration works without a live key.

## One-time setup

### 1. Resend account + API key

1. Sign up at <https://resend.com/> with the Simply Ltd ops email.
2. **API Keys → Create API Key.** Name it `Simply Ltd Pages`. Scope: **Full
   access** (the function only sends; restrict further once we move to
   per-domain keys).
3. Copy the `re_...` key now — Resend won't show it again. Save it.

### 2. Verify the sending domain

Until a domain is verified, Resend only allows sending from `onboarding@resend.dev`
to the account owner's verified email. To send `From: enquiries@simplyltd.co.uk`:

1. **Domains → Add Domain** → `simplyltd.co.uk`.
2. Resend lists DNS records (SPF, DKIM, optional DMARC). Add each as a TXT/CNAME
   record at the registrar managing `simplyltd.co.uk` DNS.
3. Click **Verify** in Resend; propagation usually takes < 15 min.
4. Verified status unlocks `RESEND_FROM_ADDRESS=Simply Ltd <enquiries@simplyltd.co.uk>`.

Until verification: leave `RESEND_FROM_ADDRESS` unset and Resend will send from
`onboarding@resend.dev` (works for testing, looks wrong in production).

### 3. Cloudflare Pages env vars

These are **Worker runtime** vars (not build vars — different from the Instagram
setup). Set in: Cloudflare dashboard → Pages → `simply` project → Settings →
Variables and secrets → **Production**.

| Variable | Value | Required |
|---|---|---|
| `CATERING_EMAIL` | Client's destination email at cutover; `namitg26@gmail.com` for now | Y |
| `FRANCHISE_EMAIL` | Same, for the franchising form (sprint 7) | Later |
| `RESEND_API_KEY` | The `re_...` key from step 1.3 — set as **Secret**, not plain text | Y |
| `RESEND_FROM_ADDRESS` | `Simply Ltd <enquiries@simplyltd.co.uk>` once domain is verified | N |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret (Site → Turnstile → site for `simplyltd.co.uk`) | Y for prod |

Save → trigger a fresh deployment (push any commit, or **Deployments → Retry
deployment**). New env vars only apply to deployments built after they're set.

### 4. (Optional) Cloudflare Turnstile

The function refuses unverified submissions in any environment where
`TURNSTILE_SECRET_KEY` is set, and rejects all non-`dev-bypass` submissions
when it isn't set. For production:

1. Cloudflare dashboard → Turnstile → **Add site** → host `simplyltd.co.uk`.
2. Copy the **Secret key**; set as `TURNSTILE_SECRET_KEY` in Pages env vars.
3. Embed the Turnstile widget script on the catering page (TODO — currently
   the island reads `window.turnstile?.getResponse()` and falls back to
   `dev-bypass` when the widget isn't loaded). Without the widget loaded
   client-side, production submissions will fail spam check.

## Local development

`.env.local` is loaded by Astro's dev server and by `wrangler pages dev`.
See `.env.example` for the full list with comments.

**Without Resend configured (default):** The function logs to the dev console
and returns `{ ok: true, dev: true }`. The success state renders normally.
Useful for iterating on form UX without burning Resend quota.

**With Resend configured:** Paste your `re_...` key into `.env.local`'s
`RESEND_API_KEY` line (uncomment it) and restart `npm run dev`. Submissions
deliver for real. Until the domain is verified, omit `RESEND_FROM_ADDRESS`
and Resend will send from `onboarding@resend.dev` — only deliverable to the
Resend account owner's own email.

## End-to-end test (after deploy)

1. Confirm `CATERING_EMAIL`, `RESEND_API_KEY` (and ideally `TURNSTILE_SECRET_KEY`)
   are set in CF Pages env vars for **Production**.
2. Wait for the next deployment to complete, or push a commit to retrigger.
3. Open the deployed preview URL → `/catering` → fill the form with realistic
   test values (e.g. event date 8 weeks out, 50 guests, "TEST — please ignore"
   in notes).
4. Submit. The page should swap to the success state ("Enquiry received.").
5. Within ~30s, an email titled `New catering enquiry — wedding for 50 guests`
   should land at `CATERING_EMAIL`.
6. If it doesn't: check Cloudflare → Pages → `simply` → Functions logs for the
   matching request. `[catering] resend send failed` in the log gives the
   Resend status code.

## Cutover from dev to client email

1. Change `CATERING_EMAIL` in CF Pages env vars from `namitg26@gmail.com` to
   the client's preferred destination.
2. Trigger a redeploy. (Env vars apply per-build.)
3. Submit one more test enquiry from the live page to confirm delivery.
4. Update `.env.example` if the destination convention changes (e.g. moving to
   a shared inbox).

## Troubleshooting

**Submission succeeds in the UI but no email arrives.**
- Check whether `RESEND_API_KEY` is set in CF Pages Worker runtime vars (not
  build vars — different section). Function logs will show `[catering] mock
  send (no RESEND_API_KEY)` if the key is missing at runtime.
- Check the Resend dashboard → Emails. A failed send shows up there with the
  error reason (unverified domain, invalid `to`, etc.).

**Resend returns 403 / "domain not verified".**
- The `RESEND_FROM_ADDRESS` uses a domain Resend hasn't verified for this
  account. Either complete the DNS verification (step 2 above) or temporarily
  unset `RESEND_FROM_ADDRESS` to fall back to `onboarding@resend.dev`.

**"Spam check is not configured on this environment." error from the form.**
- `TURNSTILE_SECRET_KEY` is unset on this environment but the React island
  isn't sending the dev-bypass token. Either set the key (prod) or check that
  `window.turnstile` is loaded as expected on the page.

**Function logs show no `[catering]` lines at all when I submit.**
- Routing isn't reaching the function. Confirm `functions/api/catering.ts`
  exists in the deployed build and that the form is POSTing to `/api/catering`
  (Network tab in DevTools).

**Local form submits but `.env.local` changes don't seem to apply.**
- Astro's dev server caches env vars at process start. Stop and restart
  `npm run dev` after editing `.env.local`. The Instagram runbook documents
  the same gotcha for build-time vars.

**Local dev shows "Network error" on submit.**
- Pages Functions in `functions/api/` only run inside the Cloudflare Pages
  runtime. Neither `npm run dev` (Astro dev server) nor `npm run preview`
  (which compiles a Worker via the Cloudflare adapter and runs `wrangler dev`)
  route `/api/*` to those files — they 404. To exercise the real function:
  - Push the branch to GitHub. CF Pages auto-creates a preview deployment
    at `https://<branch-hash>.simply.pages.dev` where Functions are live.
  - Unit tests for the function's validation, Turnstile branch, honeypot
    rejection, and Resend success/failure paths live in
    `tests/catering.test.ts` — run with `npm test`. Use those to verify
    function logic without a deployment.
