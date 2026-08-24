# Runbook — production domain cutover (Porkbun → Cloudflare)

Execute **only after the owner approves both previews**. Registration stays at Porkbun
for every domain; only nameservers move, and only for the two content-serving domains.

> **Hosting reality (2026-08-24):** the site deploys as a Cloudflare **Worker with
> static assets** named `simply` (not a Pages project — ADR 0002 predates this;
> see its amendment). The coming-soon page is a second assets-only Worker
> `smashmeup`. Both live on the account of namit.garg@hotmail.co.uk
> (id `772357e2ba3af2f83f3837f040113069`). Deploys are manual via wrangler.

## Prerequisites

- Owner approval of both previews:
  - Simply: `https://simply.namit-garg.workers.dev`
  - Smash Me Up: `https://smashmeup.namit-garg.workers.dev`
- Porkbun account access.
- The Cloudflare account above (wrangler login or dashboard).

## 1. simplyltd.co.uk → the `simply` Worker

1. Cloudflare dashboard → Add a domain → `simplyltd.co.uk` (Free plan); let it import
   existing DNS records and note the two assigned nameservers.
2. Porkbun → simplyltd.co.uk → Nameservers → replace with Cloudflare's pair.
   (Propagation up to 24 h, usually minutes.)
3. Cloudflare dashboard → Workers & Pages → `simply` → Settings → Domains & Routes →
   Add → Custom Domain → `simplyltd.co.uk`. Add `www.simplyltd.co.uk` the same way.
4. Rules → Redirect Rules on the simplyltd.co.uk zone:
   `www.simplyltd.co.uk/*` → `https://simplyltd.co.uk/${1}`, 301 permanent.

## 2. smashmeup.com → the `smashmeup` Worker

Same four steps: add zone `smashmeup.com`, move nameservers at Porkbun, attach
`smashmeup.com` (+`www`) as custom domains on the `smashmeup` Worker, add the
www→apex redirect rule.

## 3. Flip cross-links (one commit on main)

- `src/components/ComingSoonPanel.astro`: default `href` → `https://smashmeup.com`.
- `sites/smashmeup/index.html`: "Meet Simply" href → `https://simplyltd.co.uk`;
  `og:image` → `https://smashmeup.com/og.png`.

Then redeploy both:

```
npm run deploy                                            # builds + deploys the simply Worker
npx wrangler deploy --config sites/smashmeup/wrangler.jsonc
```

## 4. Domain 301s at Porkbun

Porkbun → domain → Details → URL Forwarding: type **301 permanent**, "include path"
OFF, destination per table. Test a `www.` request per domain; add an explicit `www`
forward if not covered.

| Domain | Destination | Note |
| --- | --- | --- |
| simplyshwarma.com | https://simplyltd.co.uk/shawarma | domain spelling "shwarma" is as registered |
| simplyshwarma.co.uk | https://simplyltd.co.uk/shawarma | |
| simplylebanese.co.uk | https://simplyltd.co.uk/ | brand page hidden — retarget to /lebanese when it launches |
| smashmeup.co.uk | https://smashmeup.com | |
| idmachine.co.uk | — | not a Simply domain; leave untouched |

(If the owner holds further Simply domains — e.g. simplypasta.co.uk was mentioned at
project start — add them here: visible-brand domains → their brand page; hidden-brand
and non-brand domains → the homepage.)

## 5. Verify

- `https://simplyltd.co.uk`, `https://www.simplyltd.co.uk`, `https://smashmeup.com`
  all serve over HTTPS.
- Each forwarded domain: `curl -sI http://<domain>` → `301` + correct `Location`.
- Homepage card ↔ smashmeup cross-links resolve.
- Catering + franchising forms still submit (env vars live on the Worker).
- Lighthouse ≥95 mobile on `https://simplyltd.co.uk`.

## Known follow-up (separate from cutover)

`.github/workflows/rebuild-instagram.yml` calls the Cloudflare **Pages** deployments
API for a project that doesn't exist — the 6-hourly Instagram refresh cannot work
against the Worker deployment. It needs rewriting to build in CI and
`wrangler deploy` with an API token.
