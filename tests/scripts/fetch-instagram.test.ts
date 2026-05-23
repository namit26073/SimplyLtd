import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtemp, rm, readFile, readdir, writeFile } from "node:fs/promises";
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
  // Seed a minimal fallback set so error-path tests (Round 3) have something to copy.
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
