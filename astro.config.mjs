import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";

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
});
