# Client logos — sources

Shown in the catering page's "Some of the names we've fed" strip to state a factual client
relationship (owner-confirmed list, 2026-08-25; owner asked for the public logos). Each file is
the brand's own published mark, normalised to 200 px tall with transparent background; white
variants were inverted to ink. The strip renders them single-tone at 40 px.

| File | Source (fetched 2026-08-25) |
| --- | --- |
| sony.png | Wikimedia Commons `Sony_logo.svg` (simple text logo) |
| img.png | img.com site header (`new_img_logo_coal.svg`) |
| chiswick-park.png | enjoy-work.com site header (`logo.svg`) |
| battersea-power-station.png | batterseapowerstation.co.uk (`BPS-logo-cropped.png`, white → inverted) |
| underbelly-festival.png | underbellyfestival.com (`Underbelly_LondonLogo.png`, white → inverted) |
| hyde-park-winter-wonderland.png | hydeparkwinterwonderland.com site header (HPWW primary logo) |

If any brand objects, drop its `logo` in `src/pages/catering.astro` and the strip falls back to
the typographic wordmark automatically.
