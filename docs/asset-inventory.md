# Asset inventory — Simply Ltd v1

**Date:** 2026-05-17
**Status:** Locked at Slice 3. Per-slot images selected in each visual slice's asset gate (§11.2 of `docs/plans/0002-build-plan.md`).

Every image slot in v1 across the 6 visible pages. Use this list as the spec for the per-slice asset gates — Namit reviews and chooses Path A (provides), Path B (Lead-shortlist + pick), or, where reuse makes sense, references another slot.

Lebanese and Pasta sub-brands are `visible: false` per Q3 — their slots are listed below (greyed, "deferred") so the inventory documents the full eventual surface, but no images are selected for them in v1.

## Aspect ratio conventions

- **Cutout** = transparent PNG / near-transparent (matte) PNG, food extracted, composes onto a flat brand-coloured ground. No rectangular frame.
- **Scene** = rectangular framed photograph used as a tile or as a contextual atmosphere shot.
- **Video** = MP4 / WebM, owner-provided, re-encoded sub-2MB.

## Slot table

| Slot id | Slice | Spec | Aspect | Role | Reuse / notes | Status |
|---|---|---|---|---|---|---|
| `home-hero` | 4 | Cutout · hero food shot | square or 3:4 portrait | Front-door food image. Floats on flat brand-coloured or cream ground next to oversized type. | The single most important image in v1. Highest curation bar. | needs-selection |
| `wte-catering` | 4 | Cutout or scene · event vibe | 1:1 | Tile for the "Hire us for your event" card | Wedding / festival / private — vibe over specificity | needs-selection |
| `wte-franchising` | 4 | Cutout or scene · truck exterior | 1:1 | Tile for the "Run a Simply truck" card | Truck exterior or "behind the wheel" feel | needs-selection |
| `wte-locations` | 4 | Cutout or scene · canal / pitch | 1:1 | Tile for the "Find your nearest pitch" card | Canal scene or generic urban pitch | needs-selection |
| `wte-menu` | 4 | Cutout · food close-up | 1:1 | Tile for the "What's on today" card | A different food shot than home-hero | needs-selection |
| `showcase-falafel` | 5 | Cutout · falafel hero | 3:4 portrait | Falafel showcase panel | Reuses on `/falafel/` hero unless we shortlist a richer one | needs-selection |
| `showcase-shawarma` | 5 | Cutout · shawarma hero | 3:4 portrait | Shawarma showcase panel | Reuses on `/shawarma/` hero | needs-selection |
| `showcase-burgers` | 5 | Cutout · smash burger hero | 3:4 portrait | Burgers showcase panel | Reuses on `/burgers/` hero | needs-selection |
| `falafel-hero` | 6 | Cutout · per-brand hero | 3:4 or 4:3 | Falafel sub-brand page hero | May reuse `showcase-falafel`; decide at Slice 6 gate | deferred-to-slice-6 |
| `falafel-behind-counter` | 6 | Video | vertical | Behind-the-counter section | Owner-provided `FalafelVid.mp4` re-encoded as `/videos/falafel-truck.mp4` | owner-provided |
| `shawarma-hero` | 7 | Cutout · per-brand hero | 3:4 or 4:3 | Shawarma sub-brand page hero | May reuse `showcase-shawarma` | deferred-to-slice-7 |
| `shawarma-behind-counter` | 7 | Video | vertical | Behind-the-counter section | Owner-provided `ShawarmaVid.mp4` re-encoded as `/videos/shawarma-truck.mp4` | owner-provided |
| `burgers-hero` | 7 | Cutout · per-brand hero | 3:4 or 4:3 | Burgers sub-brand page hero | May reuse `showcase-burgers` | deferred-to-slice-7 |
| `burgers-behind-counter` | 7 | Cutout or scene · burger close-up | wide | Behind-the-counter section (no owner video) | Run §11.2 gate at Slice 7 | deferred-to-slice-7 |
| `lebanese-*` | — | — | — | — | Deferred until `visible: true` | deferred |
| `pasta-*` | — | — | — | — | Deferred until `visible: true` | deferred |
| `catering-hero` | 8 | Cutout or scene · event vibe | wide / 16:9 | Catering page hero | Wedding / corporate / festival scene with restraint | deferred-to-slice-8 |
| `catering-event-wedding` | 8 | Cutout or scene · wedding | 1:1 | Event-type tile | If photographing weddings is sensitive, consider a styled spread shot | deferred-to-slice-8 |
| `catering-event-corporate` | 8 | Cutout or scene · corporate | 1:1 | Event-type tile | Office / lunch / launch | deferred-to-slice-8 |
| `catering-event-festival` | 8 | Cutout or scene · festival | 1:1 | Event-type tile | Outdoor / crowd / canopy | deferred-to-slice-8 |
| `catering-event-private` | 8 | Cutout or scene · private | 1:1 | Event-type tile | Garden party / family table | deferred-to-slice-8 |
| `catering-event-other` | 8 | Cutout or scene · misc | 1:1 | Event-type tile | Optional; skip if 4 tiles look stronger than 5 | deferred-to-slice-8 |
| `franchising-hero` | 9 | Cutout or scene · truck exterior | wide / 16:9 | Franchising page hero | Truck-as-business-vehicle, not truck-as-tourist-attraction | deferred-to-slice-9 |
| `franchising-truck-life` | 9 | Scene · day in the life | 4:3 | Supporting section | Optional | deferred-to-slice-9 |
| `franchising-training` | 9 | Scene · training / kitchen | 4:3 | Supporting section | Optional | deferred-to-slice-9 |
| `franchising-supply` | 9 | Scene · supply / produce | 4:3 | Supporting section | Optional | deferred-to-slice-9 |
| `locations-merchant-square` | 10 | Optional scene · pitch context | 4:3 | Pitch atmosphere on Locations page | Skip if map alone reads well | deferred-to-slice-10 |
| `locations-canal-side` | 10 | Optional scene · pitch context | 4:3 | Pitch atmosphere on Locations page | Skip if map alone reads well | deferred-to-slice-10 |
| `about-origin` | 11 | Optional scene · 2019 founding vibe | 4:3 | About page origin section | Likely deferred — no founder/origin photo available | likely-deferred |
| `about-founder` | 11 | Portrait · founder | 3:4 | About page | Likely deferred until owner provides | likely-deferred |

## Sourcing methodology (§11.2 recap)

For each `needs-selection` slot, the asset gate runs three paths in order of preference:

1. **Path A — Namit-provided.** Drop file into `assets-inbox/owner-provided/<slot-id>.{png,jpg}`.
2. **Path B — Pre-cut PNG library + pick.** Lead searches Rawpixel / Pixabay / PNGTree / Freepik for transparent-PNG candidates, presents shortlist inline, Namit picks.
3. **Path C — Photograph + Namit-runs-remove.bg.** Lead shortlists Unsplash / Pexels photographs on clean grounds; Namit picks; Namit runs through remove.bg or rembg; drops cutout into `assets-inbox/owner-provided/`.

All choices logged in `assets-inbox/PLACEHOLDERS.md` with source URL, photographer credit, licence, and swap target.

## Counts at a glance (v1, 3 visible brands)

- **Selecting in v1:** ~15 slots (home hero + 4 ways-to-enjoy + 3 showcase + 3 brand-page heroes if not reused + 1 burgers behind-counter still + catering hero + 1–4 event tiles + franchising hero + 2-3 supporting + 0-2 locations atmosphere + 0-2 about)
- **Owner-provided already in repo:** 2 (Falafel + Shawarma videos)
- **Deferred until later:** 2 brand families (Lebanese + Pasta) plus About founder photo

## v1 vs eventual

This inventory reflects v1 as scoped. When Lebanese and Pasta come back online, run the §11.2 gate for their slots and flip `visible: true` in `src/content/brands/<slug>.md`. When real owner photography arrives, swap one file at a time per the workflow in `assets-inbox/PLACEHOLDERS.md`.
