// Pushes the enquiry-form secrets from .env.local to the deployed `simply` Worker.
// Usage: node scripts/push-worker-secrets.mjs            (requires `npx wrangler login`)
//
// Reads only the variables the endpoints use; skips any that are unset or
// commented out, so it's safe to re-run after filling in more lines.
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const SECRET_NAMES = [
  "CATERING_EMAIL",
  "FRANCHISE_EMAIL",
  "RESEND_API_KEY",
  "RESEND_FROM_ADDRESS",
  "TURNSTILE_SECRET_KEY",
];

const env = Object.fromEntries(
  (await readFile(".env.local", "utf8"))
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
);

let pushed = 0;
for (const name of SECRET_NAMES) {
  const value = env[name];
  if (!value) {
    console.log(`[secrets] ${name}: not set in .env.local — skipped`);
    continue;
  }
  const result = spawnSync("npx", ["wrangler", "secret", "put", name, "--name", "simply"], {
    input: value,
    stdio: ["pipe", "inherit", "inherit"],
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    console.error(`[secrets] ${name}: wrangler exited ${result.status}`);
    process.exit(1);
  }
  pushed += 1;
}
console.log(`[secrets] pushed ${pushed} secret(s) to the simply Worker.`);
