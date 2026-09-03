# Runbook — production domain cutover (Porkbun → Cloudflare)

Execute **only after the owner approves both previews**. Registration stays at Porkbun
for every domain; only nameservers move, and only for the two content-serving domains.

> **Hosting reality (2026-08-24):** the site deploys as a Cloudflare **Worker with
> static assets** named `simply` (not a Pages project — ADR 0002 predates this;
> see its amendment). The coming-soon page is a second assets-only Worker
> `smashmeup`. Both live on the account of namit.garg@hotmail.co.uk
> (id `772357e2ba3af2f83f3837f040113069`). Deploys are manual via wrangler.

## Prerequisites

- Owner approval of both previews — **given 2026-09-03** (he confirmed he's happy to
  move everything onto the domain).
  - Simply: `https://simply.namit-garg.workers.dev`
  - Smash Me Up: `https://smashmeup.namit-garg.workers.dev`
- Porkbun account access (nameserver edit is the only manual step left).
- `CLOUDFLARE_API_TOKEN` in `.env.local` — created 2026-09-03 with Workers Scripts:Edit,
  Account Settings:Read, Turnstile:Edit, Workers KV:Edit, Zone:Edit, DNS:Edit,
  Workers Routes:Edit. **Wrangler's OAuth session has expired and has no refresh token**,
  so every wrangler call now needs the token in the environment:
  ```
  set -a; . ./.env.local; set +a; npx wrangler deploy
  ```

## Already done (2026-09-03)

| Thing                           | State                                                                                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zone `simplyltd.co.uk`          | created, **pending** — id `081700c82ae33fe62c003f8f1cc61738`, nameservers `alexis.ns.cloudflare.com` + `amanda.ns.cloudflare.com`                                                           |
| Zone `smashmeup.com`            | created, **pending** — id `b5e57fd035fd4d3b6fad16808319ea6f`, nameservers `earl.ns.cloudflare.com` + `irena.ns.cloudflare.com`                                                              |
| Turnstile widget `simply-forms` | created, sitekey `0x4AAAAAAEmDxWyEkeehfKaK`, hostnames `simply.namit-garg.workers.dev`, `simplyltd.co.uk`, `www.simplyltd.co.uk`, `localhost`. Both forms verified end-to-end with it live. |
| Worker secrets                  | `CATERING_EMAIL`, `FRANCHISE_EMAIL`, `RESEND_API_KEY`, `RESEND_FROM_ADDRESS`, `TURNSTILE_SECRET_KEY` all pushed                                                                             |
| Resend domain `simplyltd.co.uk` | registered (EU region), id `c0a14833-d069-459c-bab1-c504ace9c19f`, **not verified** — its DNS records can only be added once this zone is live (see step 3)                                 |

Both zones were created **empty** (via API, no import). That's deliberate — the apex
currently points at Wix and we want it gone — but it means the records below must be
recreated by hand after the nameservers move.

### Pre-cutover DNS, for rollback

Captured 2026-09-03 while still on Wix nameservers (`ns14`/`ns15.wixdns.net`):

| Type  | Host  | Value                                                |
| ----- | ----- | ---------------------------------------------------- |
| A     | `@`   | `185.230.63.171`, `185.230.63.186`, `185.230.63.107` |
| CNAME | `www` | `cdn1.wixdns.net`                                    |

**No MX and no TXT records exist on `simplyltd.co.uk`** — so no mail is served on this
domain and nothing is at risk from the move (this is also why `info@simplyltd.co.uk`
never worked). The owner's real inbox `info@simplyfalafel.co.uk` is a _different_
domain and is untouched by this cutover.

To roll back: point the Porkbun nameservers back at `ns14.wixdns.net` + `ns15.wixdns.net`.

## 1. simplyltd.co.uk → the `simply` Worker

1. **Manual:** Porkbun → simplyltd.co.uk → Nameservers → replace with
   `alexis.ns.cloudflare.com` and `amanda.ns.cloudflare.com`.
   (Propagation up to 24 h, usually minutes. The Wix site stops serving once this
   takes effect.)
2. Wait for the zone to flip `pending` → `active`:
   ```
   set -a; . ./.env.local; set +a
   curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     "https://api.cloudflare.com/client/v4/zones/081700c82ae33fe62c003f8f1cc61738" \
     | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).result.status))"
   ```
3. Attach the custom domains to the `simply` Worker (API or dashboard → Workers & Pages
   → `simply` → Settings → Domains & Routes): `simplyltd.co.uk` and `www.simplyltd.co.uk`.
4. Rules → Redirect Rules on the zone:
   `www.simplyltd.co.uk/*` → `https://simplyltd.co.uk/${1}`, 301 permanent.

## 2. smashmeup.com → the `smashmeup` Worker

Same four steps with nameservers `earl.ns.cloudflare.com` + `irena.ns.cloudflare.com`,
zone id `b5e57fd035fd4d3b6fad16808319ea6f`, attaching `smashmeup.com` (+`www`) to the
`smashmeup` Worker.

## 2a. Email on the real domain (after the simplyltd.co.uk zone is active)

1. Add these three records to the `simplyltd.co.uk` zone (values from the Resend
   domain above; re-fetch with `GET /domains/<id>` if they've rotated). **DNS-only,
   not proxied** — the CNAMEs must not be orange-clouded:

   | Type  | Host                | Value                                                                                                                                                                                                                        |
   | ----- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | TXT   | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC2rlV4+nk0PxxSr6QHl/8s2klWsYLplH74bvO/PDWDNKR+VeGI0/xTZQGTfHNkide5enHoxibwHTzztct56o3W+Nqfko1HhREa+scTGnAs3ZE7sJ31o2JyxVwUWzD61kvb05faqhr9Jj7Gq39/2jMm71ynFjA4DoiEjgncv6LqdwIDAQAB` |
   | CNAME | `rsend`             | `rsend-euw1.forge.rmta.net`                                                                                                                                                                                                  |
   | CNAME | `send`              | `send.forge.rmta.net`                                                                                                                                                                                                        |

2. Trigger verification: `POST https://api.resend.com/domains/<id>/verify`, then poll
   `GET /domains/<id>` until `status: verified`.
3. Flip the from-address and destinations off test mode, in `.env.local`:

   ```
   RESEND_FROM_ADDRESS=Simply Ltd <enquiries@simplyltd.co.uk>
   CATERING_EMAIL=info@simplyfalafel.co.uk
   FRANCHISE_EMAIL=info@simplyfalafel.co.uk
   ```

   then `node scripts/push-worker-secrets.mjs` and submit one live enquiry per form.

   Until this step, enquiries send from Resend's shared `onboarding@resend.dev` and can
   **only** be delivered to the Resend account owner's address (`namitg26@gmail.com`) —
   which is why the owner's inbox is not wired up yet.

4. Add `simplyltd.co.uk` to the Turnstile widget's hostname list if the widget was
   recreated in the meantime (the current one already covers it).

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

| Domain               | Destination                      | Note                                                       |
| -------------------- | -------------------------------- | ---------------------------------------------------------- |
| simplyshwarma.com    | https://simplyltd.co.uk/shawarma | domain spelling "shwarma" is as registered                 |
| simplyshwarma.co.uk  | https://simplyltd.co.uk/shawarma |                                                            |
| simplylebanese.co.uk | https://simplyltd.co.uk/         | brand page hidden — retarget to /lebanese when it launches |
| smashmeup.co.uk      | https://smashmeup.com            |                                                            |
| idmachine.co.uk      | —                                | not a Simply domain; leave untouched                       |

(If the owner holds further Simply domains — e.g. simplypasta.co.uk was mentioned at
project start — add them here: visible-brand domains → their brand page; hidden-brand
and non-brand domains → the homepage.)

## 5. Verify

- `https://simplyltd.co.uk`, `https://www.simplyltd.co.uk`, `https://smashmeup.com`
  all serve over HTTPS.
- Each forwarded domain: `curl -sI http://<domain>` → `301` + correct `Location`.
- Homepage card ↔ smashmeup cross-links resolve.
- Catering + franchising forms still submit (env vars live on the Worker) **and the
  email actually arrives at `info@simplyfalafel.co.uk`** — step 2a must be done first.
- Turnstile still issues a token on the new hostname (submit one form from a real
  browser; note Turnstile deliberately misbehaves under browser automation, so a
  Playwright check is not proof either way — a manual submission is).
- Lighthouse ≥95 mobile on `https://simplyltd.co.uk`.

## Known follow-up (separate from cutover)

`.github/workflows/rebuild-instagram.yml` calls the Cloudflare **Pages** deployments
API for a project that doesn't exist — the 6-hourly Instagram refresh cannot work
against the Worker deployment. It needs rewriting to build in CI and
`wrangler deploy` with an API token.
