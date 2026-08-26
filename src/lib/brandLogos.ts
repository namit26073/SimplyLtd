import type { ImageMetadata } from "astro";
import falafel from "../assets/logos/falafel.png";
import shawarma from "../assets/logos/shawarma.png";
import lebanese from "../assets/logos/lebanese.png";
import burgers from "../assets/logos/burgers.png";
import pasta from "../assets/logos/pasta.png";

/**
 * The owner's truck logos, one per sub-brand — cropped straight from the
 * raster files in `assets-inbox/logos/` (never redrawn). Used wherever a
 * truck needs to be recognised at a glance: map pins, pitch cards.
 */
export const brandLogos = { falafel, shawarma, lebanese, burgers, pasta } satisfies Record<
  string,
  ImageMetadata
>;

export type BrandLogoSlug = keyof typeof brandLogos;
