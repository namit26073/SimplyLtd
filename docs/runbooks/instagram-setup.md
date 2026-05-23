# Instagram grid — auth + secrets runbook

> Owner-facing setup steps for the homepage Instagram grid. One-time setup
> (~30 min), then re-issue the access token roughly every 50 days.

## One-time setup

### 1. Meta developer account + app

1. Sign in at <https://developers.facebook.com/> with a Facebook account that is an admin of the **@simplyltd** Instagram Business account.
2. **My Apps → Create App** → "Other" → "Business" type.
3. Name the app `Simply Ltd Site`. Save the App ID + App Secret.
4. Add the **Instagram Graph API** product to the app.
5. Ensure the linked Facebook page is connected to the @simplyltd Instagram Business account.

### 2. Resolve the IG-User-ID

1. Open the Graph API Explorer: <https://developers.facebook.com/tools/explorer/>
2. Select your app from the dropdown.
3. Generate a User Access Token with the scopes `instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `business_management`.
4. Run the query:
   ```
   GET /me/accounts
   ```
   Find the page connected to @simplyltd; copy its `id` (this is the **Facebook Page ID**).
5. Run:
   ```
   GET /<page-id>?fields=instagram_business_account
   ```
   The returned `instagram_business_account.id` is the **IG-User-ID**. Save it.

### 3. Issue a long-lived access token

1. Still in the Graph API Explorer, exchange the short-lived token for a long-lived one:
   ```
   GET /oauth/access_token
     ?grant_type=fb_exchange_token
     &client_id=<app-id>
     &client_secret=<app-secret>
     &fb_exchange_token=<short-lived-token>
   ```
2. The returned `access_token` is valid for ~60 days. Save it.

### 4. Upload secrets

**GitHub repository secrets** (Settings → Secrets and variables → Actions):
- `IG_USER_ID` — from step 2.5.
- `IG_ACCESS_TOKEN` — from step 3.1.
- `CLOUDFLARE_ACCOUNT_ID` — from Cloudflare dashboard (account home page sidebar).
- `CLOUDFLARE_API_TOKEN` — Cloudflare dashboard → My Profile → API Tokens → Create Token → "Edit Cloudflare Pages" template, restrict to the `simply` project.

**Cloudflare Pages environment variables** (Pages project → Settings → Environment variables → Production):
- `IG_USER_ID` — same value.
- `IG_ACCESS_TOKEN` — same value.

### 5. Trigger first refresh

Either wait for the next cron (every 6 hours) or run `Refresh Instagram grid` manually from GitHub Actions → Workflows.

## Recurring task — token renewal (~every 50 days)

The access token expires after 60 days. When `IG_ACCESS_TOKEN` expires the next CF Pages build will skip the live fetch and use the committed `src/content/instagram-fallback/` set; users see the fallback grid until you refresh the token.

To renew:
1. Open the Graph API Explorer.
2. Re-run the long-lived-token exchange (step 3 above) — Meta lets you refresh within the 60-day validity window.
3. Update the `IG_ACCESS_TOKEN` value in **both** GitHub secrets and Cloudflare Pages env vars.
4. Trigger the `Refresh Instagram grid` workflow manually to confirm the new token works.

If you wait past 60 days, you'll need to start from a fresh short-lived token (Graph API Explorer → Get User Access Token) and re-do the exchange in step 3.

## Replacing the fallback set with real screenshots

For v1 the fallback uses Unsplash placeholders. To swap for real IG content:

1. Open <https://www.instagram.com/simplyltd/> in a browser, signed in.
2. Pick 6 recent posts you want as the "if-the-API-is-down" view.
3. For each, save the image (1080×1080 ideal) into `src/content/instagram-fallback/post-N.jpg` (overwrite the existing placeholder).
4. Edit `src/content/instagram-fallback/manifest.json` — for each entry update the `permalink`, `caption`, `timestamp`, and `altText` to match the real post.
5. Commit + push. CI rebuilds the site; the fallback set is now real Simply Ltd content.

## Troubleshooting

**The grid shows placeholders even though I uploaded the secrets.**
- Check `IG_USER_ID` and `IG_ACCESS_TOKEN` are both set in **Cloudflare Pages env vars** (not just GitHub secrets — the build runs on Cloudflare).
- Trigger a fresh deployment (push any commit, or manually re-deploy in the CF Pages dashboard) and watch the build log. The first lines should include `[instagram] wrote 6 live posts to ...` if the fetch worked, or `[instagram] Graph API <status> — using fallback set` if it didn't.

**Build logs show `[instagram] Graph API 400 — using fallback set`.**
- Token is invalid or the IG-User-ID has changed. Re-run step 3 to issue a new token, update secrets, redeploy.

**Build logs show `[instagram] Graph API 429 — using fallback set`.**
- Hit Meta's rate limit. The cron only fires every 6 hours so this is unlikely from our side; usually means another integration on the same App is over-consuming. Wait an hour, redeploy.

**The cron workflow fails in GitHub Actions with an HTTP 401 from Cloudflare.**
- `CLOUDFLARE_API_TOKEN` is missing the `Pages:Edit` permission, or it's scoped to a different account. Recreate the token using the "Edit Cloudflare Pages" template and re-upload.

**Local `npm run dev` shows the fallback grid.**
- Expected — local dev doesn't have the secrets. To test the live grid locally, create `.env.local` with `IG_USER_ID=` and `IG_ACCESS_TOKEN=` set to the production values, then `npm run fetch:instagram && npm run dev`. Do not commit `.env.local` — it's gitignored.
