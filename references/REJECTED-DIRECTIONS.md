# Rejected directions — three signature-hero failures on the parallel build

> Read this carefully before proposing a homepage direction. The agent on the parallel build (`../SimplyLtdWebsite/`) burned three creative directions on the homepage signature interaction. Each was rejected by the owner / Namit. The pattern is consistent and instructive — repeating any of these wastes time and erodes confidence.

## Rejection 1 — "AI-template generic" (2026-05-14 / 2026-05-15)

**What was built:** A scrolling homepage with a clean modern hero, light cream background, Fraunces serif headline ("Simply.") with the dot in an accent colour, soft rounded section cards for catering / franchising / locations teasers, and a four-brand showcase as a circle-token list. Inter for body. Generic CSS shadows.

**What Namit said:** *"it looks very basic and doesnt really have much exciting content... feels like every other AI template."*

**Why it failed:** Restraint without content reads as emptiness. The hero said "Simply." and nothing else. Section cards looked like a template the agent had built for any client. There was no signature voice, no surprising idea, no visual point-of-view. The agent's default for "modern professional" matched the default for every other generic site.

**Lesson for this build:** Restraint is fine, but the hero must have a real **point of view** — a specific idea expressed with specific craft, not "minimal good taste." Reference the food brands the owner has named (Pasta Evangelists, Honest Burgers, MEATliquor): they're restrained but every page has an editorial idea behind it.

## Rejection 2 — "SVG cartoon London map with cartoon trucks" (2026-05-16)

**What was built:** A single-page homepage with an inline-SVG illustration of London — soft tan district blobs, a curved Thames in blue, three landmark icons (Hyde Park, Regent's Park, King's Cross), and five cartoon trucks at neighbourhood positions (Camden, Paddington, Soho, Shoreditch, South Bank). Trucks had brand-coloured bodies, awnings, wheels, small wordmarks. Clicking a truck opened a side-drawer info panel with the pitch details.

**What Namit said:** *"the landing hero looks like a child made it which is not what i was going for at all. I cannot show this to the client."*

**Why it failed:** SVG illustration authored programmatically by code reads as primitive. The line work is too uniform, the colours too flat, the perspective too schematic. Looks like clip-art or a children's book illustration — not like a crafted brand asset. The interactivity was working but the visual identity was the wrong genre.

**Lesson for this build:** Do not author the centrepiece visual as inline SVG. Inline SVG is fine for icons, logos, decorative bg elements — never for the hero. The hero needs to be **sourced** (real photography, commissioned 3D, commissioned illustration, motion design) — not **generated** by the agent.

## Rejection 3 — "MapLibre + procedural Three.js trucks at Paddington Basin" (2026-05-16 / 2026-05-17)

**What was built:** A real Paddington Basin map (MapLibre GL JS, Stadia Maps Alidade Smooth vector tiles, custom warm-cream palette applied) tilted to a 3/4 perspective. Three low-poly procedural food trucks built in Three.js (boxes for body, cylinders for wheels, MeshToonMaterial for cartoon shading) positioned at the real lat/lng of Merchant Square and Canal Side Walk. Brand-coloured DOM pill labels above each truck. Click a truck → InfoPanel slides in. Entry fly-in animation, idle bob, soft vignette.

**What Namit said:** *"this still gives a minecraft appearance and more like a game feel rather than a actual professional website for a food truck business. Maybe we should either go back to a more professional design or try to improve this to a level which doesnt feel like minecraft and more like a advert made by addidas or apple etc."*

**Why it failed:** Low-poly procedural geometry reads as game/toy. Three.js cubes painted in brand colours don't reach the quality bar of "Apple/Adidas ad" because that bar requires real photography, photoreal CGI, or hand-crafted illustration. The map basemap itself looked good; the trucks didn't, and the trucks were the focal point. Could be improved with commissioned 3D models, but procedural was never going to get there.

**Lesson for this build:** Procedural-3D-as-hero is in the rejected family. If a build direction depends on Three.js geometry as the centrepiece, the only way it reaches Apple/Adidas-level is with commissioned glTF models from a 3D artist — not procedural code. If you're not going to commission models, don't pick this direction.

## The common thread

All three failures share a root cause: **the agent generated the centrepiece visual rather than sourcing it.** Generated visuals — whether geometric SVG, low-poly 3D, or default-styled UI components — have a ceiling that's below the "Apple/Adidas / Pasta Evangelists / Honest Burgers" reference quality the owner has named.

What works for that quality bar:

- **Real photography** (food close-ups, truck exteriors, customers, place atmosphere)
- **Commissioned visual art** (illustration, 3D, motion design — paid for, by a person)
- **Pre-rendered cinematic video** (the agent doesn't render it in real time; it plays)
- **World-class typography + restraint** (when the visual element is *deliberately absent*, type carries the moment)

What does NOT work for that quality bar:

- Code-generated SVG illustration as hero
- Procedural WebGL geometry as hero
- Stock placeholders dressed up as if they're real assets (placeholders should look like placeholders)
- AI-generated imagery posing as real photography

## Implications for your Phase 1

When you write the Phase 1 discovery report, your signature-interaction proposal needs to be **honest** about its dependency on sourced assets. If your direction calls for a hero that depends on real food photography we don't have yet, say so — and propose either (a) a stand-in that *looks like a placeholder* until photos arrive or (b) a direction that doesn't depend on photos for its first impact.

Three creative directions are required for the four-brand showcase (per the brief). Your three directions need to be **directionally different** from each other — not three flavours of the same idea. At least one should be photography-led; at least one should be typography-led; the third is up to you (could be motion-led, could be interaction-led).

## What's actually safe to build

The following are NOT in the rejected family:

- A hero that plays one of the owner's existing kitchen videos full-bleed with bold poster type overlaid (real photography + real motion + real typography)
- A typography-led hero with one big confident statement and minimal chrome (no visual asset needed)
- A scrolling editorial layout with the owner-provided videos as section anchors, Unsplash food placeholders elsewhere clearly marked as placeholders, real copy throughout
- A cinematic intro animation made of motion graphics (pre-rendered or scroll-driven, not real-time WebGL geometry)
- A "find a truck" feature using a real Google Maps embed or photographic truck imagery (NOT procedural 3D)

The signature interaction can still be **interactive** — interactivity isn't the problem. The problem is when the interactive thing's primary visual element is something the agent generated.
