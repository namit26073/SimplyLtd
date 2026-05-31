# Instagram Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 6-tile Instagram grid section to the homepage that fetches @simplyltd's most recent posts at build time via the Meta Graph API, with a committed fallback set ensuring the build never fails.

**Architecture:** Node script (`scripts/fetch-instagram.mjs`) runs as a `prebuild` hook, hits Meta Graph API, downloads images + writes a manifest JSON to `src/_generated/instagram/` (gitignored). On any error or missing env vars, the script copies a committed fallback set from `src/content/instagram-fallback/` into the same generated location. Astro reads the generated manifest as a content collection. A GitHub Actions cron triggers a Cloudflare Pages rebuild every 6 hours so the grid stays fresh without runtime API calls.

**Tech Stack:** Node 20+, Astro 6 content collections, native `fetch`, `node:fs/promises`, Vitest, GitHub Actions, Cloudflare Pages API.

**Source spec:** `docs/superpowers/specs/2026-05-21-instagram-grid-design.md`

**Branch:** `feat/instagram-grid` (already created; spec already committed at `57ddb83`).

---

## File structure

| File | Purpose |
|---|---|
| `scripts/fetch-instagram.mjs` | Node script: fetch from Meta API, download images, write manifest; on error copies fallback. Exports `fetchInstagramPosts({...})` for tests; runs immediately if invoked as CLI. |
| `src/content/instagram-fallback/manifest.json` | 6 post entries with permalinks, captions, timestamps, image paths. Committed to repo. |
| `src/content/instagram-fallback/<id>.jpg` | 6 placeholder images (sourced from existing Unsplash placeholders for v1; Namit swaps for real IG screenshots pre-merge). |
| `src/_generated/instagram/` | Build-time output — manifest.json + downloaded images. Gitignored. Either real fetched data or copied fallback. |
| `src/content.config.ts` | +1 collection: `instagramPosts` using `file()` loader on the generated manifest. |
| `src/components/InstagramGrid.astro` | The section: header + 6-tile grid + Follow CTA. Reads via `getCollection("instagramPosts")`. |
| `src/pages/index.astro` | +1 import + render between BrandShowcase and WaysToEnjoy. |
| `tests/fixtures/instagram/graph-api-response.json` | Sample Meta Graph API response (6 posts mix of image/video/carousel). |
| `tests/scripts/fetch-instagram.test.ts` | Vitest: happy path, missing env, 401, 429, network error, token-expiry warning. |
| `.github/workflows/rebuild-instagram.yml` | Cron `0 */6 * * *`; POST to Cloudflare Pages API. |
| `docs/runbooks/instagram-setup.md` | One-page runbook: Meta App registration, IG-User-ID resolution, token issue + renewal, GitHub + CF secret upload. |
| `package.json` | +`fetch:instagram` script, +`prebuild` hook. |
| `.gitignore` | +`src/_generated/`, +`.env.local`. |
| `.env.example` | Document `IG_USER_ID`, `IG_ACCESS_TOKEN`. |

---

## Task 1: Project setup — gitignore, env example, package scripts

**Files:**
- Modify: `.gitignore`
- Create: `.env.example`
- Modify: `package.json`

- [ ] **Step 1: Read existing `.gitignore`**

Run: `Read .gitignore`

- [ ] **Step 2: Append generated dir + env file to `.gitignore`**

Append these lines (preserve existing content; don't duplicate if already present):

```gitignore

# Build-time generated content (Instagram grid fetch output)
src/_generated/

# Local environment overrides
.env.local
```

- [ ] **Step 3: Create `.env.example`**

Create `.env.example`:

```bash
# Meta Graph API credentials for the @simplyltd Instagram fetch.
# Resolved once via the Meta App / Graph API Explorer — see
# docs/runbooks/instagram-setup.md for the full setup.
#
# When absent (local dev without secrets), the build falls back to
# the committed set under src/content/instagram-fallback/.

IG_USER_ID=
IG_ACCESS_TOKEN=
```

- [ ] **Step 4: Modify `package.json` — add fetch script + prebuild hook**

Read `package.json`. In the `"scripts"` block, add:

```json
"fetch:instagram": "node scripts/fetch-instagram.mjs",
"prebuild": "npm run fetch:instagram",
```

Place `"fetch:instagram"` after `"dev"` and `"prebuild"` immediately before `"build"`.

- [ ] **Step 5: Verify `npm run fetch:instagram` errors gracefully**

Run: `npm run fetch:instagram`
Expected: command not found / module not found (script doesn't exist yet). That's fine — Task 4 creates it.

- [ ] **Step 6: Commit**

```bash
git add .gitignore .env.example package.json
git commit -m "chore(instagram): scaffold env, gitignore, and prebuild hook"
```

---

## Task 2: Fallback set scaffolding

**Files:**
- Create: `src/content/instagram-fallback/manifest.json`
- Create: `src/content/instagram-fallback/post-1.jpg` through `post-6.jpg` (placeholder images)

For v1, the fallback images are placeholders sourced from existing Unsplash assets in `src/assets/placeholders/`. Namit replaces them with real IG screenshots before merge (documented in runbook).

- [ ] **Step 1: Inspect existing placeholder images for reuse**

Run: `ls src/assets/placeholders/`

Identify 6 candidates that vary (food shots, locations, behind-counter). Reasonable picks: `showcase-falafel.jpg`, `showcase-shawarma.jpg`, `showcase-burgers.jpg`, `wte-locations.jpg`, `burgers-behind-counter.jpg`, `catering-hero.jpg`.

- [ ] **Step 2: Copy 6 placeholder images into fallback dir**

Run from repo root:

```bash
mkdir -p src/content/instagram-fallback
cp src/assets/placeholders/showcase-falafel.jpg src/content/instagram-fallback/post-1.jpg
cp src/assets/placeholders/showcase-shawarma.jpg src/content/instagram-fallback/post-2.jpg
cp src/assets/placeholders/showcase-burgers.jpg src/content/instagram-fallback/post-3.jpg
cp src/assets/placeholders/wte-locations.jpg src/content/instagram-fallback/post-4.jpg
cp src/assets/placeholders/burgers-behind-counter.jpg src/content/instagram-fallback/post-5.jpg
cp src/assets/placeholders/catering-hero.jpg src/content/instagram-fallback/post-6.jpg
```

- [ ] **Step 3: Create fallback manifest**

Create `src/content/instagram-fallback/manifest.json`:

```json
[
  {
    "id": "post-1",
    "permalink": "https://www.instagram.com/simplyltd/",
    "mediaType": "IMAGE",
    "timestamp": "2026-05-15T12:00:00.000Z",
    "caption": "Fresh falafel today at Merchant Square. Vegan + vegetarian wraps from 11am.",
    "image": "./post-1.jpg",
    "altText": "Plate of freshly fried falafel with a bowl of garnish."
  },
  {
    "id": "post-2",
    "permalink": "https://www.instagram.com/simplyltd/",
    "mediaType": "IMAGE",
    "timestamp": "2026-05-13T17:30:00.000Z",
    "caption": "Late-night shawarma. Open till 10 tonight.",
    "image": "./post-2.jpg",
    "altText": "Shawarma wrap on dark paper, fillings visible."
  },
  {
    "id": "post-3",
    "permalink": "https://www.instagram.com/simplyltd/",
    "mediaType": "IMAGE",
    "timestamp": "2026-05-11T13:15:00.000Z",
    "caption": "Smash patties off the grill. Canal Side Walk all day.",
    "image": "./post-3.jpg",
    "altText": "Smash burger patties cooking on a flat-top grill."
  },
  {
    "id": "post-4",
    "permalink": "https://www.instagram.com/simplyltd/",
    "mediaType": "IMAGE",
    "timestamp": "2026-05-08T11:00:00.000Z",
    "caption": "Two pitches, three trucks, one canal.",
    "image": "./post-4.jpg",
    "altText": "Paddington Basin canal scene with food trucks."
  },
  {
    "id": "post-5",
    "permalink": "https://www.instagram.com/simplyltd/",
    "mediaType": "IMAGE",
    "timestamp": "2026-05-05T15:45:00.000Z",
    "caption": "Behind the counter on the Burgers truck.",
    "image": "./post-5.jpg",
    "altText": "Behind-the-counter view inside the Burgers truck mid-service."
  },
  {
    "id": "post-6",
    "permalink": "https://www.instagram.com/simplyltd/",
    "mediaType": "IMAGE",
    "timestamp": "2026-05-02T14:00:00.000Z",
    "caption": "Catering setup for a 200-guest event. Three concepts, one team.",
    "image": "./post-6.jpg",
    "altText": "Catering setup with multiple food stations."
  }
]
```

- [ ] **Step 4: Commit**

```bash
git add src/content/instagram-fallback/
git commit -m "feat(instagram): seed fallback set with 6 placeholder posts"
```

---

## Task 3: Test fixture for Meta Graph API response

**Files:**
- Create: `tests/fixtures/instagram/graph-api-response.json`
- Create: `tests/fixtures/instagram/image-bytes.bin`

- [ ] **Step 1: Create the Graph API response fixture**

Create `tests/fixtures/instagram/graph-api-response.json`:

```json
{
  "data": [
    {
      "id": "17900000000000001",
      "permalink": "https://www.instagram.com/p/AAAAAAAAAA1/",
      "media_type": "IMAGE",
      "media_url": "https://scontent.cdninstagram.com/test/post-1.jpg",
      "caption": "Fresh falafel today. #vegan #paddington",
      "timestamp": "2026-05-19T14:00:00+0000"
    },
    {
      "id": "17900000000000002",
      "permalink": "https://www.instagram.com/p/AAAAAAAAAA2/",
      "media_type": "VIDEO",
      "media_url": "https://scontent.cdninstagram.com/test/post-2.mp4",
      "thumbnail_url": "https://scontent.cdninstagram.com/test/post-2-thumb.jpg",
      "caption": "Behind the counter at Shawarma.",
      "timestamp": "2026-05-18T18:30:00+0000"
    },
    {
      "id": "17900000000000003",
      "permalink": "https://www.instagram.com/p/AAAAAAAAAA3/",
      "media_type": "CAROUSEL_ALBUM",
      "media_url": "https://scontent.cdninstagram.com/test/post-3.jpg",
      "caption": "Catering setup gallery.",
      "timestamp": "2026-05-17T11:00:00+0000"
    },
    {
      "id": "17900000000000004",
      "permalink": "https://www.instagram.com/p/AAAAAAAAAA4/",
      "media_type": "IMAGE",
      "media_url": "https://scontent.cdninstagram.com/test/post-4.jpg",
      "timestamp": "2026-05-16T09:15:00+0000"
    },
    {
      "id": "17900000000000005",
      "permalink": "https://www.instagram.com/p/AAAAAAAAAA5/",
      "media_type": "IMAGE",
      "media_url": "https://scontent.cdninstagram.com/test/post-5.jpg",
      "caption": "Smash burgers. Canal Side Walk.",
      "timestamp": "2026-05-15T13:45:00+0000"
    },
    {
      "id": "17900000000000006",
      "permalink": "https://www.instagram.com/p/AAAAAAAAAA6/",
      "media_type": "IMAGE",
      "media_url": "https://scontent.cdninstagram.com/test/post-6.jpg",
      "caption": "Two pitches, one canal.",
      "timestamp": "2026-05-14T10:30:00+0000"
    }
  ],
  "paging": {
    "cursors": {
      "before": "QVFI",
      "after": "QVFJ"
    }
  }
}
```

- [ ] **Step 2: Create a tiny binary blob as fake image bytes**

Run:

```bash
mkdir -p tests/fixtures/instagram
printf 'fake-image-bytes' > tests/fixtures/instagram/image-bytes.bin
```

(Real image bytes aren't needed — the fetch script just writes whatever the response body returns. Tests assert the bytes are passed through correctly.)

- [ ] **Step 3: Commit**

```bash
git add tests/fixtures/instagram/
git commit -m "test(instagram): add Meta Graph API response + image fixtures"
```

---

## Task 4: Fetch script — failing test for happy path

**Files:**
- Create: `tests/scripts/fetch-instagram.test.ts`

- [ ] **Step 1: Write the failing test (happy path only)**

Create `tests/scripts/fetch-instagram.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtemp, rm, readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { fetchInstagramPosts } from "../../scripts/fetch-instagram.mjs";

const fixturePath = (name: string) =>
  fileURLToPath(new URL(`../fixtures/instagram/${name}`, import.meta.url));

let outputDir: string;
let fallbackDir: string;

beforeEach(async () => {
  outputDir = await mkdtemp(join(tmpdir(), "ig-out-"));
  fallbackDir = await mkdtemp(join(tmpdir(), "ig-fallback-"));
  // Seed a minimal fallback set so error-path tests have something to copy.
  await writeFile(
    join(fallbackDir, "manifest.json"),
    JSON.stringify([
      {
        id: "fb-1",
        permalink: "https://www.instagram.com/simplyltd/",
        mediaType: "IMAGE",
        timestamp: "2026-05-01T00:00:00.000Z",
        image: "./fb-1.jpg",
        altText: "Fallback image",
      },
    ]),
  );
  await writeFile(join(fallbackDir, "fb-1.jpg"), "fallback-bytes");
});

afterEach(async () => {
  await rm(outputDir, { recursive: true, force: true });
  await rm(fallbackDir, { recursive: true, force: true });
  vi.unstubAllGlobals();
});

describe("fetchInstagramPosts — happy path", () => {
  it("writes a manifest and downloads images for 6 posts", async () => {
    const apiResponse = JSON.parse(
      await readFile(fixturePath("graph-api-response.json"), "utf8"),
    );
    const imageBytes = await readFile(fixturePath("image-bytes.bin"));

    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("graph.facebook.com") || url.includes("graph.instagram.com")) {
        return new Response(JSON.stringify(apiResponse), { status: 200 });
      }
      // Image download
      return new Response(imageBytes, { status: 200 });
    });

    const result = await fetchInstagramPosts({
      igUserId: "1234567890",
      igAccessToken: "test-token",
      fetchFn: fetchMock,
      outputDir,
      fallbackDir,
      logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    });

    expect(result.source).toBe("live");
    expect(result.count).toBe(6);

    const manifest = JSON.parse(
      await readFile(join(outputDir, "manifest.json"), "utf8"),
    );
    expect(manifest).toHaveLength(6);
    expect(manifest[0]).toMatchObject({
      id: "17900000000000001",
      permalink: "https://www.instagram.com/p/AAAAAAAAAA1/",
      mediaType: "IMAGE",
      image: "./17900000000000001.jpg",
    });
    expect(manifest[1].mediaType).toBe("VIDEO");
    // Video uses thumbnail_url, not media_url
    expect(manifest[1].image).toBe("./17900000000000002.jpg");

    const files = await readdir(outputDir);
    expect(files).toContain("manifest.json");
    expect(files.filter((f) => f.endsWith(".jpg"))).toHaveLength(6);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/scripts/fetch-instagram.test.ts`
Expected: FAIL — "Cannot find module '../../scripts/fetch-instagram.mjs'" or similar.

---

## Task 5: Fetch script — implement happy path

**Files:**
- Create: `scripts/fetch-instagram.mjs`

- [ ] **Step 1: Write the minimal script implementation**

Create `scripts/fetch-instagram.mjs`:

```js
// Fetches the latest @simplyltd Instagram posts at build time, downloads the
// images, writes a manifest JSON consumed by the Astro content collection.
// On any error or missing env vars, copies the committed fallback set from
// src/content/instagram-fallback/ into the same generated location so the
// build never fails.

import { mkdir, writeFile, copyFile, readFile, readdir, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_OUTPUT_DIR = "src/_generated/instagram";
const DEFAULT_FALLBACK_DIR = "src/content/instagram-fallback";
const POST_COUNT = 6;
const FIELDS = "id,permalink,media_type,media_url,thumbnail_url,caption,timestamp";

export async function fetchInstagramPosts({
  igUserId,
  igAccessToken,
  fetchFn = fetch,
  outputDir = DEFAULT_OUTPUT_DIR,
  fallbackDir = DEFAULT_FALLBACK_DIR,
  logger = console,
} = {}) {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  if (!igUserId || !igAccessToken) {
    logger.warn?.(
      "[instagram] IG_USER_ID / IG_ACCESS_TOKEN missing — using fallback set",
    );
    return copyFallback({ outputDir, fallbackDir, logger });
  }

  const url =
    `https://graph.instagram.com/v21.0/${encodeURIComponent(igUserId)}/media` +
    `?fields=${FIELDS}&limit=${POST_COUNT}` +
    `&access_token=${encodeURIComponent(igAccessToken)}`;

  const res = await fetchFn(url);
  if (!res.ok) {
    logger.error?.(`[instagram] Graph API ${res.status} — using fallback set`);
    return copyFallback({ outputDir, fallbackDir, logger });
  }

  const body = await res.json();
  const posts = Array.isArray(body?.data) ? body.data.slice(0, POST_COUNT) : [];
  if (posts.length === 0) {
    logger.error?.("[instagram] Graph API returned 0 posts — using fallback set");
    return copyFallback({ outputDir, fallbackDir, logger });
  }

  const manifest = [];
  for (const post of posts) {
    const imageUrl = post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;
    if (!imageUrl) {
      logger.warn?.(`[instagram] post ${post.id} has no image URL — skipping`);
      continue;
    }
    const imgRes = await fetchFn(imageUrl);
    if (!imgRes.ok) {
      logger.warn?.(`[instagram] image download for ${post.id} failed — skipping`);
      continue;
    }
    const bytes = Buffer.from(await imgRes.arrayBuffer());
    const filename = `${post.id}.jpg`;
    await writeFile(join(outputDir, filename), bytes);

    manifest.push({
      id: post.id,
      permalink: post.permalink,
      mediaType: post.media_type,
      timestamp: new Date(post.timestamp).toISOString(),
      caption: post.caption,
      image: `./${filename}`,
      altText: undefined, // IG Graph API doesn't expose alt_text on /media; placeholder
    });
  }

  if (manifest.length === 0) {
    logger.error?.("[instagram] no posts could be downloaded — using fallback set");
    return copyFallback({ outputDir, fallbackDir, logger });
  }

  await writeFile(
    join(outputDir, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );

  logger.info?.(`[instagram] wrote ${manifest.length} live posts to ${outputDir}`);
  return { source: "live", count: manifest.length };
}

async function copyFallback({ outputDir, fallbackDir, logger }) {
  const entries = await readdir(fallbackDir).catch(() => []);
  for (const entry of entries) {
    await copyFile(join(fallbackDir, entry), join(outputDir, entry));
  }
  logger.info?.(`[instagram] copied ${entries.length} fallback files to ${outputDir}`);
  const manifest = JSON.parse(
    await readFile(join(outputDir, "manifest.json"), "utf8"),
  );
  return { source: "fallback", count: manifest.length };
}

// Run as CLI when invoked directly.
const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  await fetchInstagramPosts({
    igUserId: process.env.IG_USER_ID,
    igAccessToken: process.env.IG_ACCESS_TOKEN,
  });
}
```

- [ ] **Step 2: Run the happy-path test**

Run: `npm test -- tests/scripts/fetch-instagram.test.ts`
Expected: PASS — happy path test green.

- [ ] **Step 3: Commit**

```bash
git add scripts/fetch-instagram.mjs tests/scripts/fetch-instagram.test.ts
git commit -m "feat(instagram): fetch script + happy-path test"
```

---

## Task 6: Fetch script — failing tests for error paths

**Files:**
- Modify: `tests/scripts/fetch-instagram.test.ts`

- [ ] **Step 1: Append error-path tests to the test file**

Append to `tests/scripts/fetch-instagram.test.ts`:

```ts
describe("fetchInstagramPosts — error paths", () => {
  it("uses fallback when env vars are missing", async () => {
    const fetchMock = vi.fn();
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const result = await fetchInstagramPosts({
      igUserId: undefined,
      igAccessToken: undefined,
      fetchFn: fetchMock,
      outputDir,
      fallbackDir,
      logger,
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.source).toBe("fallback");
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("IG_USER_ID / IG_ACCESS_TOKEN missing"),
    );
    const files = await readdir(outputDir);
    expect(files).toContain("manifest.json");
    expect(files).toContain("fb-1.jpg");
  });

  it("uses fallback when Graph API returns 401", async () => {
    const fetchMock = vi.fn(
      async () => new Response("Unauthorized", { status: 401 }),
    );
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const result = await fetchInstagramPosts({
      igUserId: "x",
      igAccessToken: "y",
      fetchFn: fetchMock,
      outputDir,
      fallbackDir,
      logger,
    });

    expect(result.source).toBe("fallback");
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Graph API 401"),
    );
  });

  it("uses fallback when Graph API returns 429", async () => {
    const fetchMock = vi.fn(
      async () => new Response("Too Many Requests", { status: 429 }),
    );
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const result = await fetchInstagramPosts({
      igUserId: "x",
      igAccessToken: "y",
      fetchFn: fetchMock,
      outputDir,
      fallbackDir,
      logger,
    });

    expect(result.source).toBe("fallback");
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Graph API 429"),
    );
  });

  it("uses fallback when fetch throws (network error)", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    });
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    await expect(
      fetchInstagramPosts({
        igUserId: "x",
        igAccessToken: "y",
        fetchFn: fetchMock,
        outputDir,
        fallbackDir,
        logger,
      }),
    ).resolves.toMatchObject({ source: "fallback" });

    expect(logger.error).toHaveBeenCalled();
  });

  it("uses fallback when API returns 0 posts", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ data: [] }), { status: 200 }),
    );
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const result = await fetchInstagramPosts({
      igUserId: "x",
      igAccessToken: "y",
      fetchFn: fetchMock,
      outputDir,
      fallbackDir,
      logger,
    });

    expect(result.source).toBe("fallback");
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("0 posts"),
    );
  });
});
```

- [ ] **Step 2: Run the new tests; the network-error one will fail**

Run: `npm test -- tests/scripts/fetch-instagram.test.ts`
Expected: 4 of 5 new tests pass; the "network error" test FAILS because the current script doesn't catch the thrown error.

---

## Task 7: Fetch script — add try/catch around fetch

**Files:**
- Modify: `scripts/fetch-instagram.mjs`

- [ ] **Step 1: Wrap the API + image fetches in try/catch**

In `scripts/fetch-instagram.mjs`, replace the body of `fetchInstagramPosts` from `const res = await fetchFn(url);` through the end of the function with a try/catch that catches any thrown error and falls back. The simplest patch:

Replace:

```js
  const res = await fetchFn(url);
  if (!res.ok) {
    logger.error?.(`[instagram] Graph API ${res.status} — using fallback set`);
    return copyFallback({ outputDir, fallbackDir, logger });
  }

  const body = await res.json();
```

with:

```js
  let res;
  try {
    res = await fetchFn(url);
  } catch (err) {
    logger.error?.(`[instagram] Graph API fetch threw: ${err.message} — using fallback set`);
    return copyFallback({ outputDir, fallbackDir, logger });
  }
  if (!res.ok) {
    logger.error?.(`[instagram] Graph API ${res.status} — using fallback set`);
    return copyFallback({ outputDir, fallbackDir, logger });
  }

  const body = await res.json();
```

- [ ] **Step 2: Run all tests; all 6 should now pass**

Run: `npm test -- tests/scripts/fetch-instagram.test.ts`
Expected: all 6 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add scripts/fetch-instagram.mjs tests/scripts/fetch-instagram.test.ts
git commit -m "feat(instagram): fall back on auth + rate-limit + network errors"
```

---

## Task 8: Smoke-test the script end-to-end with the fallback path

**Files:**
- None modified; verification only.

- [ ] **Step 1: Run the script with no env vars**

Run: `npm run fetch:instagram`
Expected stdout: line containing `IG_USER_ID / IG_ACCESS_TOKEN missing — using fallback set`. Process exits 0.

- [ ] **Step 2: Verify generated dir is populated**

Run: `ls src/_generated/instagram/`
Expected: 7 files — `manifest.json` + `post-1.jpg` through `post-6.jpg`.

- [ ] **Step 3: Verify manifest is valid JSON matching the fallback contents**

Run: `cat src/_generated/instagram/manifest.json`
Expected: 6 entries with the post-1..post-6 ids from the fallback file.

- [ ] **Step 4: (No commit — generated dir is gitignored.)**

---

## Task 9: Add content collection for Instagram posts

**Files:**
- Modify: `src/content.config.ts`

- [ ] **Step 1: Inspect current `src/content.config.ts`**

Run: `Read src/content.config.ts`

Note the existing imports and the `collections` export.

- [ ] **Step 2: Add the `file` loader import**

In `src/content.config.ts`, change the import line:

```ts
import { glob } from "astro/loaders";
```

to:

```ts
import { glob, file } from "astro/loaders";
```

- [ ] **Step 3: Add the `instagramPosts` collection definition**

In `src/content.config.ts`, after the `press` collection definition (before `export const collections`), add:

```ts
const instagramPosts = defineCollection({
  loader: file("src/_generated/instagram/manifest.json"),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      permalink: z.url(),
      mediaType: z.enum(["IMAGE", "VIDEO", "CAROUSEL_ALBUM"]),
      timestamp: z.coerce.date(),
      caption: z.string().optional(),
      image: image(),
      altText: z.string().optional(),
    }),
});
```

- [ ] **Step 4: Add `instagramPosts` to the `collections` export**

Change:

```ts
export const collections = { brands, locations, testimonials, press };
```

to:

```ts
export const collections = { brands, locations, testimonials, press, instagramPosts };
```

- [ ] **Step 5: Ensure the generated manifest exists, then verify `astro check` passes**

Astro's content-collection sync needs the loader's source file to exist. Run the fetch (which copies the fallback set into `src/_generated/instagram/`) first, then check:

```bash
npm run fetch:instagram
npm run check
```

Expected: 0 type errors. (May print warnings about missing markdown content collections — those are unchanged from baseline.)

- [ ] **Step 6: Commit**

```bash
git add src/content.config.ts
git commit -m "feat(instagram): add instagramPosts content collection"
```

---

## Task 10: Build the InstagramGrid component

**Files:**
- Create: `src/components/InstagramGrid.astro`

- [ ] **Step 1: Create the component**

Create `src/components/InstagramGrid.astro`:

```astro
---
import { getCollection } from "astro:content";
import { Image } from "astro:assets";

const posts = (await getCollection("instagramPosts")).sort((a, b) =>
  b.data.timestamp.getTime() - a.data.timestamp.getTime(),
);

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function altFor(post: (typeof posts)[number]) {
  if (post.data.altText) return post.data.altText;
  if (post.data.caption) {
    const trimmed = post.data.caption.trim().replace(/\s+/g, " ");
    return trimmed.length > 80 ? `${trimmed.slice(0, 77)}…` : trimmed;
  }
  return `Instagram post by @simplyltd dated ${dateFormatter.format(post.data.timestamp)}`;
}
---

{posts.length > 0 && (
  <section class="ig" aria-labelledby="ig-heading">
    <div class="ig__inner">
      <header class="ig__header">
        <div class="ig__title">
          <p class="t-caption ig__kicker">Latest from @simplyltd</p>
          <h2 id="ig-heading" class="t-display ig__heading">Follow along.</h2>
          <p class="t-editorial t-editorial--italic ig__dek">
            Six most recent posts from the trucks.
          </p>
        </div>
        <a
          class="ig__cta"
          href="https://www.instagram.com/simplyltd/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Follow on Instagram
          <span aria-hidden="true">→</span>
        </a>
      </header>

      <ul role="list" class="ig__grid">
        {posts.map((post) => (
          <li class="ig__cell">
            <a
              class="ig__tile"
              href={post.data.permalink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open Instagram post from ${dateFormatter.format(post.data.timestamp)}`}
            >
              <Image
                src={post.data.image}
                alt={altFor(post)}
                class="ig__photo"
                widths={[240, 360, 540, 720]}
                sizes="(min-width: 720px) 33vw, 50vw"
                loading="lazy"
                quality={75}
              />
              {post.data.mediaType === "VIDEO" && (
                <span class="ig__glyph ig__glyph--play" aria-label="Video" title="Video">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M3.5 2.7c0-.6.7-1 1.2-.66l8.6 5.3c.5.3.5 1 0 1.32l-8.6 5.3c-.5.3-1.2 0-1.2-.66Z" />
                  </svg>
                </span>
              )}
              {post.data.mediaType === "CAROUSEL_ALBUM" && (
                <span class="ig__glyph ig__glyph--carousel" aria-label="Multi-post" title="Multi-post">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
                    <rect x="3.5" y="3.5" width="9" height="9" rx="1.2" />
                    <rect x="5.5" y="5.5" width="9" height="9" rx="1.2" />
                  </svg>
                </span>
              )}
              <span class="ig__overlay" aria-hidden="true">
                <span class="ig__date">{dateFormatter.format(post.data.timestamp)}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  </section>
)}

<style>
  .ig {
    padding: var(--sp-7) var(--page-gutter);
    background: var(--color-cream);
    border-top: 1px solid var(--color-line);
  }

  .ig__inner {
    max-width: var(--page-max);
    margin: 0 auto;
  }

  .ig__header {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--sp-4);
    align-items: end;
    margin-bottom: var(--sp-5);
  }

  @media (min-width: 720px) {
    .ig__header {
      grid-template-columns: 1fr auto;
    }
  }

  .ig__kicker {
    color: var(--color-text-muted);
    margin-bottom: var(--sp-2);
  }

  .ig__heading {
    font-size: clamp(var(--fs-600), 5vw, var(--fs-700));
    line-height: 0.96;
    letter-spacing: var(--ls-display-tight);
  }

  .ig__dek {
    margin-top: var(--sp-3);
    font-size: var(--fs-300);
    color: color-mix(in srgb, var(--color-ink) 78%, transparent);
  }

  .ig__cta {
    align-self: end;
    justify-self: start;
    display: inline-flex;
    align-items: center;
    gap: var(--sp-2);
    padding: var(--sp-3) var(--sp-4);
    background: var(--color-ink);
    color: var(--color-cream);
    font-family: var(--ff-body-stack);
    font-weight: var(--fw-strong);
    font-size: var(--fs-200);
    text-transform: uppercase;
    letter-spacing: var(--ls-caption);
    text-decoration: none;
    border-radius: var(--r-pill);
    transition: transform var(--dur-fast) var(--ease-out);
  }

  @media (min-width: 720px) {
    .ig__cta {
      justify-self: end;
    }
  }

  .ig__cta:hover,
  .ig__cta:focus-visible {
    transform: translateY(-1px);
  }

  .ig__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sp-2);
  }

  @media (min-width: 720px) {
    .ig__grid {
      grid-template-columns: repeat(3, 1fr);
      gap: var(--sp-3);
    }
  }

  .ig__cell {
    list-style: none;
  }

  .ig__tile {
    position: relative;
    display: block;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    border-radius: var(--r-md);
    background: var(--color-paper);
    text-decoration: none;
    color: inherit;
  }

  :global(.ig__photo) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--dur-slow) var(--ease-out);
  }

  .ig__tile:hover :global(.ig__photo),
  .ig__tile:focus-visible :global(.ig__photo) {
    transform: scale(1.04);
  }

  /* Always-visible media-type badges. Video → bottom-right, carousel →
     top-right. Don't overlap each other; one tile only has one type. */
  .ig__glyph {
    position: absolute;
    display: inline-flex;
    width: 28px;
    height: 28px;
    align-items: center;
    justify-content: center;
    border-radius: var(--r-pill);
    background: color-mix(in srgb, var(--color-ink) 70%, transparent);
    color: var(--color-cream);
    z-index: 1;
  }

  .ig__glyph--play {
    bottom: var(--sp-3);
    right: var(--sp-3);
  }

  .ig__glyph--carousel {
    top: var(--sp-3);
    right: var(--sp-3);
  }

  /* Hover overlay — fades in a dark gradient with the post date bottom-left.
     Independent of the media-type badges above. */
  .ig__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    padding: var(--sp-3);
    background: linear-gradient(
      180deg,
      transparent 0%,
      transparent 55%,
      color-mix(in srgb, var(--color-ink) 35%, transparent) 100%
    );
    opacity: 0;
    transition: opacity var(--dur-fast) var(--ease-out);
    pointer-events: none;
    color: var(--color-cream);
  }

  .ig__tile:hover .ig__overlay,
  .ig__tile:focus-visible .ig__overlay {
    opacity: 1;
  }

  .ig__date {
    font-family: var(--ff-body-stack);
    font-weight: var(--fw-strong);
    font-size: var(--fs-100);
    text-transform: uppercase;
    letter-spacing: var(--ls-caption);
  }

  .ig__tile:focus-visible {
    outline: 2px solid var(--color-ink);
    outline-offset: 3px;
  }
</style>
```

- [ ] **Step 2: Verify `astro check` passes**

Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/InstagramGrid.astro
git commit -m "feat(instagram): InstagramGrid component"
```

---

## Task 11: Wire InstagramGrid into the homepage

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Read the current homepage**

Run: `Read src/pages/index.astro`

Confirm current order: Hero → BrandShowcase → WaysToEnjoy.

- [ ] **Step 2: Modify imports + render order**

In `src/pages/index.astro`, replace:

```astro
---
import Base from "../layouts/Base.astro";
import Hero from "../components/Hero.astro";
import WaysToEnjoy from "../components/WaysToEnjoy.astro";
import BrandShowcase from "../components/BrandShowcase.astro";
---

<Base title="Simply Ltd">
  <Hero />
  <BrandShowcase />
  <WaysToEnjoy />
</Base>
```

with:

```astro
---
import Base from "../layouts/Base.astro";
import Hero from "../components/Hero.astro";
import WaysToEnjoy from "../components/WaysToEnjoy.astro";
import BrandShowcase from "../components/BrandShowcase.astro";
import InstagramGrid from "../components/InstagramGrid.astro";
---

<Base title="Simply Ltd">
  <Hero />
  <BrandShowcase />
  <InstagramGrid />
  <WaysToEnjoy />
</Base>
```

- [ ] **Step 3: Start dev server and visually confirm**

Run: `npm run dev` (in a background terminal)
Open: `http://localhost:4321/` (or whatever port Astro assigns)
Expected: between the "Three trucks. One canal." section and the "What's next?" section, there's a new section with the kicker "LATEST FROM @SIMPLYLTD", heading "Follow along.", a `Follow on Instagram` pill on the right, and a 3-column grid of 6 tiles showing the fallback placeholder images.

- [ ] **Step 4: Visually confirm hover overlay**

Hover over a tile.
Expected: dark gradient overlay fades in, post date appears bottom-left in caption style.

- [ ] **Step 5: Visually confirm mobile breakpoint**

Resize to 390px width (or use devtools mobile emulation).
Expected: grid collapses to 2 columns × 3 rows; header stacks vertically (heading on top, CTA below).

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(instagram): wire InstagramGrid into homepage"
```

---

## Task 12: GitHub Actions cron — rebuild every 6 hours

**Files:**
- Create: `.github/workflows/rebuild-instagram.yml`

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/rebuild-instagram.yml`:

```yaml
name: Refresh Instagram grid

on:
  schedule:
    # Every 6 hours at the top of the hour (UTC).
    - cron: "0 */6 * * *"
  workflow_dispatch: {}

permissions:
  contents: read

jobs:
  trigger-cloudflare-rebuild:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cloudflare Pages deployment
        env:
          CF_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          CF_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CF_PROJECT_NAME: simply
        run: |
          set -euo pipefail
          if [[ -z "${CF_ACCOUNT_ID:-}" || -z "${CF_API_TOKEN:-}" ]]; then
            echo "::warning::Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN — skipping."
            exit 0
          fi
          response=$(curl -fsS -X POST \
            -H "Authorization: Bearer ${CF_API_TOKEN}" \
            -H "Content-Type: application/json" \
            "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects/${CF_PROJECT_NAME}/deployments")
          echo "$response" | head -c 4000
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/rebuild-instagram.yml
git commit -m "ci(instagram): cron workflow rebuilds CF Pages every 6h"
```

---

## Task 13: Runbook — Meta App setup + secrets

**Files:**
- Create: `docs/runbooks/instagram-setup.md`

- [ ] **Step 1: Create the runbook**

Create `docs/runbooks/instagram-setup.md`:

```markdown
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

The access token expires after 60 days. The fetch script logs a `WARN: IG token expires in N days` line during builds when N < 14 (visible in CF Pages build logs).

When the warning appears:
1. Open the Graph API Explorer.
2. Re-run the long-lived-token exchange (step 3 above) — Meta lets you refresh within the validity window.
3. Update the `IG_ACCESS_TOKEN` value in **both** GitHub secrets and Cloudflare Pages env vars.
4. Trigger the workflow manually to confirm the new token works.

If the token has fully expired before you renew, the build won't fail — the grid falls back to the committed `src/content/instagram-fallback/` set. Refresh as soon as you can to restore live data.

## Replacing the fallback set with real screenshots

For v1 the fallback uses Unsplash placeholders. To swap for real IG content:

1. Open <https://www.instagram.com/simplyltd/> in a browser, signed in.
2. Pick 6 recent posts you want as the "if-the-API-is-down" view.
3. For each, save the image (1080×1080 ideal) into `src/content/instagram-fallback/post-N.jpg` (overwrite the existing placeholder).
4. Edit `src/content/instagram-fallback/manifest.json` — for each entry update the `permalink`, `caption`, `timestamp`, and `altText` to match the real post.
5. Commit + push. CI rebuilds the site; the fallback set is now real Simply Ltd content.
```

- [ ] **Step 2: Commit**

```bash
git add docs/runbooks/instagram-setup.md
git commit -m "docs(instagram): auth + secrets setup runbook"
```

---

## Task 14: Verification — accessibility-auditor on the new section

**Files:**
- None modified; verification only.

- [ ] **Step 1: Make sure dev server is running on localhost**

If not running from Task 11, run: `npm run dev` (background) and note the port (likely 4321 or 4322).

- [ ] **Step 2: Dispatch the `accessibility-auditor` subagent**

Use the Agent tool with `subagent_type: accessibility-auditor` and this prompt:

> Audit the new Instagram grid section on the Simply Ltd homepage. Dev server at `http://localhost:<port>/`. Section sits between the "Three trucks. One canal." block and "What's next?".
>
> Check on both mobile (390px) and desktop (1440px):
> 1. Contrast: kicker "LATEST FROM @SIMPLYLTD" (muted ink on cream), heading "Follow along." (ink on cream), dek text, `Follow on Instagram` pill (cream on ink), hover overlay date (cream on dark gradient).
> 2. Keyboard navigation: can you tab into each tile, see a visible focus ring, and activate it?
> 3. ARIA: section landmark labelled correctly, each tile link has a meaningful `aria-label`, each image has a non-empty `alt`.
> 4. Reduced motion: the photo zoom-on-hover + overlay fade should respect `prefers-reduced-motion: reduce`.
>
> Report PASS / specific failures + selector + fix suggestion. Cap at 250 words.

- [ ] **Step 3: Address any failures the auditor reports**

Apply fixes inline. Re-dispatch the auditor if needed. Commit each fix separately.

---

## Task 15: Verification — design-reviewer screenshots

**Files:**
- None modified; verification only.

- [ ] **Step 1: Dispatch the `design-reviewer` subagent**

Use the Agent tool with `subagent_type: design-reviewer` and this prompt:

> Visual + perf review of the new Instagram grid section on Simply Ltd homepage. Dev server at `http://localhost:<port>/`. Section between BrandShowcase and WaysToEnjoy.
>
> 1. Take desktop (1440×900) + mobile (390×844) screenshots of the section.
> 2. Run Lighthouse mobile on `/` and report Performance / Accessibility / Best Practices / SEO scores. Project hard constraint: ≥95 on each.
> 3. Verify the grid visually: 3-up desktop, 2-up mobile; hover overlay clean; CTA pill aligned; no layout shift on image load (Astro Image should give explicit width/height).
>
> Report PASS / specific issues + fix suggestions. Cap 250 words.

- [ ] **Step 2: Address any failures**

If Lighthouse Performance dropped below 95 (most likely culprit: oversized fallback images or missing image sizes), fix inline:
- Confirm `widths` + `sizes` on the `<Image>` are appropriate.
- Confirm `loading="lazy"` is set.
- If fallback JPGs are too large, re-export them at ~1080px and recommit.

Commit each fix separately.

---

## Task 16: Push branch + open PR

**Files:**
- None modified; git operations only.

- [ ] **Step 1: Push the branch**

```bash
git push -u origin feat/instagram-grid
```

- [ ] **Step 2: Print the PR-create URL for the user**

The remote will return a URL like:
`https://github.com/namit26073/SimplyLtd/pull/new/feat/instagram-grid`

Surface it to the user with a brief summary of what's in the branch (commits) and the test plan, and the post-merge tasks Namit needs to do (set up Meta App + secrets per the runbook, swap fallback placeholders for real IG content).

---

## Definition of done

- [ ] All 16 tasks above complete.
- [ ] `npm test` passes (existing + new fetch-instagram tests).
- [ ] `npm run check` passes.
- [ ] `npm run build` succeeds with no env vars (uses fallback) AND with env vars (uses live data — only testable after Namit sets up secrets).
- [ ] accessibility-auditor reports PASS on the new section.
- [ ] design-reviewer reports Lighthouse ≥95 mobile on all four categories.
- [ ] PR is open at `https://github.com/namit26073/SimplyLtd/pull/new/feat/instagram-grid`.
- [ ] PR description includes the post-merge runbook pointer and the fallback-swap reminder.
