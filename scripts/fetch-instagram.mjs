// Fetches the latest @simplyltd Instagram posts at build time, downloads the
// images, writes a manifest JSON consumed by the Astro content collection.
// On any error or missing env vars, copies the committed fallback set from
// src/content/instagram-fallback/ into the same generated location so the
// build never fails.

import { mkdir, writeFile, copyFile, readFile, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
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
      altText: undefined, // IG Graph API /media endpoint doesn't expose alt_text
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
