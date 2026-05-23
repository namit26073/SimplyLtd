import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "zod";

const brandSlugs = ["falafel", "shawarma", "lebanese", "burgers", "pasta"] as const;
const dietaryTags = ["vegan", "vegetarian", "halal", "gluten-free"] as const;

const brands = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/brands" }),
  schema: ({ image }) =>
    z.object({
      slug: z.enum(brandSlugs),
      name: z.string(),
      tagline: z.string().max(80),
      introDek: z.string().min(40).max(280),
      cuisine: z.string(),
      voice: z.string().optional(),
      establishedYear: z.number().int().min(2018).max(2030).optional(),
      visible: z.boolean().default(true),
      primaryPitchSlug: z.enum(["merchant-square", "canal-side-walk"]).optional(),
      heroImage: image().optional(),
      heroVideo: z.string().optional(),
      showcaseImage: image().optional(),
      behindCounterVideo: z.string().optional(),
      behindCounterImage: image().optional(),
      behindCounterAlt: z.string().optional(),
      dietary: z.array(z.enum(dietaryTags)).optional(),
      order: z.number().int().default(0),
    }),
});

const locations = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/locations" }),
  schema: z.object({
    slug: z.enum(["merchant-square", "canal-side-walk"]),
    name: z.string(),
    addressLines: z.array(z.string()).nonempty(),
    postcode: z.string(),
    coordinates: z.tuple([z.number(), z.number()]),
    brandsOnPitch: z.array(z.enum(brandSlugs)).nonempty(),
    openingHours: z
      .object({
        mon: z.string().optional(),
        tue: z.string().optional(),
        wed: z.string().optional(),
        thu: z.string().optional(),
        fri: z.string().optional(),
        sat: z.string().optional(),
        sun: z.string().optional(),
      })
      .partial(),
    notes: z.string().optional(),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/testimonials" }),
  schema: z.object({
    quote: z.string(),
    attribution: z.string(),
    eventType: z.string().optional(),
    date: z.coerce.date().optional(),
  }),
});

const press = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/press" }),
  schema: z.object({
    title: z.string(),
    outlet: z.string(),
    url: z.url(),
    date: z.coerce.date(),
  }),
});

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

export const collections = { brands, locations, testimonials, press, instagramPosts };
