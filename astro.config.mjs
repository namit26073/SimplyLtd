import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://simplyltd.co.uk",
  output: "static",
  integrations: [react()],

  fonts: [
    {
      provider: fontProviders.google(),
      name: "Anton",
      cssVariable: "--ff-display",
      weights: [400],
      subsets: ["latin"],
      styles: ["normal"],
      display: "swap",
    },
    {
      provider: fontProviders.google(),
      name: "Fraunces",
      cssVariable: "--ff-editorial",
      weights: ["300 700"],
      subsets: ["latin"],
      styles: ["normal", "italic"],
      display: "swap",
    },
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--ff-body",
      weights: ["400 700"],
      subsets: ["latin"],
      styles: ["normal"],
      display: "swap",
    },
  ],

  vite: {
    build: {
      cssCodeSplit: true,
    },
  },

  adapter: cloudflare({
    // Force build-time image processing. The default Cloudflare adapter
    // image service swaps Astro's <Image /> to runtime URLs like
    // /_image?href=...&f=webp, which expect Cloudflare's runtime
    // Image Transformations to handle the request. We're a fully static
    // site (output: 'static'), so we bake the images at build time
    // instead — sharp pre-renders each variant into /_astro/*.webp.
    imageService: "compile",
  }),
});