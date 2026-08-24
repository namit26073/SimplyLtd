// One-off: builds the smashmeup.com static assets from the owner's original logo.
// Usage: node scripts/build-smashmeup-assets.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "assets-inbox/logos/SmashMeUpLogo.jpeg";
const OUT = "sites/smashmeup";

await mkdir(OUT, { recursive: true });

await sharp(SRC)
  .resize(800, 800, { fit: "inside" })
  .webp({ quality: 82 })
  .toFile(`${OUT}/logo-800.webp`);

await sharp(SRC).resize(64, 64).png().toFile(`${OUT}/favicon.png`);

await sharp(SRC)
  .resize(180, 180)
  .flatten({ background: "#000000" })
  .png()
  .toFile(`${OUT}/apple-touch-icon.png`);

const logo = await sharp(SRC).resize(500, 500, { fit: "inside" }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#000000" } })
  .composite([{ input: logo, gravity: "centre" }])
  .png({ compressionLevel: 9 })
  .toFile(`${OUT}/og.png`);

console.log("smashmeup assets written to", OUT);
