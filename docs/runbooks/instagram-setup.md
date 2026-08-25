# Instagram grid — auth + token runbook

> How the homepage Instagram grid gets its posts, and how to renew the token
> roughly every 50 days. Corrected 2026-08-25 after the first renewal: the
> site uses the **Instagram API with Instagram Login** (`graph.instagram.com`),
> so tokens come from the App Dashboard — not the Graph API Explorer.

## How it works

- `npm run build` (and `npm run deploy`) first runs `scripts/fetch-instagram.mjs`,
  which calls `https://graph.instagram.com/v21.0/<IG_USER_ID>/media` and bakes the
  six most recent posts into the site. **The grid is a build-time snapshot** — it
  only changes when the site is rebuilt and redeployed.
- Credentials are read from `.env.local` in the repo root (gitignored; loaded via
  `node --env-file-if-exists`). Two lines: `IG_USER_ID=…` and `IG_ACCESS_TOKEN=…`.
- If either is missing or the API errors, the build logs
  `[instagram] … using fallback set` and ships the committed placeholder posts from
  `src/content/instagram-fallback/`. The build never fails because of Instagram.
- Success looks like `[instagram] wrote 6 live posts to src/_generated/instagram`.

## Where the token comes from

Meta app **Simply Ltd Site** at <https://developers.facebook.com/apps/>, use case
**"Manage messaging & content on Instagram"**. The token is a long-lived
Instagram user token (60 days).

1. Open the app → **Use cases** → **Customize** on the Instagram use case.
2. Left sidebar → **API setup with Instagram login**.
3. Section **Generate access tokens** — the **@simplyltd** account is listed with its
   account ID (this ID is `IG_USER_ID`; it never changes).
4. Click **Generate token** → log in as @simplyltd in the popup → **Allow** → tick
   "I understand" → copy the token (starts `IGAA…`).
5. Paste it into `.env.local` as `IG_ACCESS_TOKEN=…`, then
   `npm run fetch:instagram` to confirm `wrote 6 live posts`, then `npm run deploy`.

## Renewal (~every 50 days)

**Current token issued 2026-08-25 → expires ~2026-10-24.** Renew before then.

- **While the token is still valid** (and at least 24 h old) it can be refreshed
  without logging in — open in a browser or curl:

  ```
  https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=<current-token>
  ```

  The JSON response's `access_token` is a fresh 60-day token. Update `.env.local`
  and redeploy. (This is what the automated refresh will use once the cron is
  rewritten — see below.)
- **If it has already expired**, refresh returns an error: generate a new token via
  the App Dashboard steps above.

## Automated refresh — currently broken, follow-up pending

`.github/workflows/rebuild-instagram.yml` calls the Cloudflare **Pages** API for a
project that doesn't exist (the site deploys as a **Worker** named `simply`, via
`npm run deploy`). It has never refreshed anything. Rewriting it to build in GitHub
Actions and `wrangler deploy` needs these repository secrets:

- `IG_USER_ID`, `IG_ACCESS_TOKEN` — from above.
- `CLOUDFLARE_ACCOUNT_ID` — `772357e2ba3af2f83f3837f040113069`.
- `CLOUDFLARE_API_TOKEN` — Cloudflare dashboard → My Profile → API Tokens → Create
  Token → "Edit Cloudflare Workers" template.

Until that's done, "refreshing the grid" = renewing the token if needed and running
`npm run deploy` from a machine with `.env.local`.

## Replacing the fallback set with real screenshots

For v1 the fallback uses Unsplash placeholders. To swap for real IG content:

1. Open <https://www.instagram.com/simplyltd/> in a browser, signed in.
2. Pick 6 recent posts you want as the "if-the-API-is-down" view.
3. For each, save the image (1080×1080 ideal) into `src/content/instagram-fallback/post-N.jpg` (overwrite the existing placeholder).
4. Edit `src/content/instagram-fallback/manifest.json` — for each entry update the `permalink`, `caption`, `timestamp`, and `altText` to match the real post.
5. Commit + push, then redeploy.

## Troubleshooting

**Build log: `IG_USER_ID / IG_ACCESS_TOKEN missing — using fallback set`.**
- `.env.local` isn't in the repo root on this machine (it's gitignored, so it doesn't
  travel with clones). Recreate it with both lines.

**Build log: `Graph API 400 — using fallback set`.**
- Token expired or invalid. Generate a new one via the App Dashboard steps.

**Build log: `Graph API 429 — using fallback set`.**
- Meta rate limit. Wait an hour and rebuild.

**The live site shows placeholder posts (tiles link to the profile, not to individual posts).**
- The last deploy ran without valid credentials. Fix `.env.local`, confirm
  `npm run fetch:instagram` reports live posts, `npm run deploy`.

**Which posts is the live site showing?** Each version's preview URL is
`https://<first-8-chars-of-version-id>-simply.namit-garg.workers.dev`
(`npx wrangler versions list --name simply`).
