# Runbook — production domain cutover (Porkbun → Cloudflare)

Execute **only after the owner approves both previews**. Registration stays at Porkbun
for every domain; only nameservers move, and only for the two content-serving domains.

## Prerequisites

- Owner approval of the Simply branch preview and smashmeup.pages.dev.
- Porkbun account access.
- Cloudflare account owning the `simply` and `smashmeup` Pages projects.
- Final domain list from the owner (fill the table in §4).

## 1. simplyltd.co.uk → Cloudflare Pages

1. Cloudflare dashboard → Add a domain → `simplyltd.co.uk` (Free plan); let it import
   existing DNS records and note the two assigned nameservers.
2. Porkbun → simplyltd.co.uk → Nameservers → replace with Cloudflare's pair.
   (Propagation up to 24 h, usually minutes.)
3. Cloudflare Pages → project `simply` → Custom domains → add `simplyltd.co.uk`, then
   `www.simplyltd.co.uk`.
4. Rules → Redirect Rules: `www.simplyltd.co.uk/*` → `https://simplyltd.co.uk/${1}`,
   301 permanent.

## 2. smashmeup.com → Cloudflare Pages

Same four steps against the `smashmeup` project.

## 3. Flip cross-links (one commit on main)

- `src/components/ComingSoonPanel.astro`: default `href` → `https://smashmeup.com`.
- `sites/smashmeup/index.html`: "Meet Simply" href → `https://simplyltd.co.uk`;
  `og:image` → `https://smashmeup.com/og.png`.

Then `npx wrangler pages deploy sites/smashmeup --project-name smashmeup` and let the
`simply` project auto-deploy from main.

## 4. Brand-domain 301s at Porkbun

Porkbun → domain → Details → URL Forwarding: type **301 permanent**, "include path"
OFF, destination per table. Test a `www.` request per domain; add an explicit `www`
forward if not covered.

| Domain | Destination | Note |
| --- | --- | --- |
| simplypasta.co.uk | https://simplyltd.co.uk/ | page hidden — retarget to /pasta when it launches |
| _fill in from owner's list_ | | |

Visible-brand domains point at their brand page (e.g. a falafel domain →
`https://simplyltd.co.uk/falafel`); hidden-brand and non-brand domains point at the
homepage until their pages exist.

## 5. Verify

- `https://simplyltd.co.uk`, `https://www.simplyltd.co.uk`, `https://smashmeup.com`
  all serve over HTTPS.
- Each forwarded domain: `curl -sI http://<domain>` → `301` + correct `Location`.
- Homepage card ↔ smashmeup cross-links resolve.
- Catering + franchising forms still submit (env vars live on the CF project).
- Lighthouse ≥95 mobile on `https://simplyltd.co.uk`.
