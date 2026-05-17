# Wix site extract — simplyltd.co.uk

Extracted 2026-05-17 via Playwright. The live site is JS-rendered Wix; auto-generated class names are not preserved here. Content is captured verbatim where it is real and verbatim where it is Wix template placeholder (clearly labelled).

Pages walked:

- `/` (homepage) — renders
- `/menu` — renders, real menu items
- `/shawarma` — header + footer only (effectively empty)
- `/burger` — header + footer only (effectively empty)
- `/lebanese` — header + footer only (effectively empty)
- `/about-1` (linked from nav as "Falafel") — renders, but entirely Wix template placeholder
- `/about-1-1` (linked from nav as "Franchising") — renders, real franchise pitch + leftover template placeholder
- `/locations` — **404**
- `/contact` — **404**
- `/about` — **404**

---

## 1. Nav structure as built

The homepage exposes one nav with twelve items. URLs are taken verbatim from the rendered `<a href>`.

| Label | Linked URL | What's at that URL |
|---|---|---|
| Home | `https://www.simplyltd.co.uk` | homepage (self) |
| Lebanese | `/lebanese` | empty page (header + footer only) |
| Shawarma | `/shawarma` | empty page (header + footer only) |
| Burger | `/burger` | empty page (header + footer only) |
| Falafel | `/about-1` | Wix "About Us" template — fully placeholder |
| Locations | `https://www.simplyltd.co.uk` | **link goes back to homepage** (no `/locations` route) |
| Menu | `/menu` | real menu page |
| Who We Are | `https://www.simplyltd.co.uk` | **link goes back to homepage** |
| Instagram | `https://www.simplyltd.co.uk` | **link goes back to homepage** (does not leave the site) |
| Catering | `https://www.simplyltd.co.uk` | **link goes back to homepage** (anchors the catering form on home) |
| Contact | `https://www.simplyltd.co.uk` | **link goes back to homepage** (anchors the footer on home) |
| Franchising | `/about-1-1` | real franchising copy + Wix template leftovers |

Of 12 nav items, **5 are dead-link-to-self** (Locations, Who We Are, Instagram, Catering, Contact), **3 are empty stubs** (Lebanese, Shawarma, Burger), and **2 link to mis-titled Wix "About" templates** (`/about-1`, `/about-1-1`). Only **Home** and **Menu** lead to substantive content. `/locations`, `/contact`, `/about` return 404 directly.

The brief's statement that "nav lies, most items 404" is partially accurate but understates the dysfunction — most do not 404, they silently route back to the homepage.

---

## 2. Brand identity confusion signals

Confirmed mismatches between "Simply Ltd" (the umbrella the rebuild is for) and what the current site actually says:

- **Page `<title>` on `/`**: `simply falafel | vegan | SIMPLY FALAFEL, Merchant Square, London, UK` — the homepage of `simplyltd.co.uk` titles itself as Simply Falafel, the sub-brand, not the parent.
- **Footer copyright (every page)**: `© 2019 by Simply Falafel.`
- **Contact email (every page)**: `info@simplyfalafel.co.uk` — uses the Simply Falafel domain, not a Simply Ltd domain.
- **Wix project name** (visible in sub-page titles): `Lunch Menu | Simply Ltd Main`, `Burger | Simply Ltd Main`, etc. — the Wix-side project IS named "Simply Ltd Main", but customer-facing chrome (footer, email, homepage title) still reads as Simply Falafel. The rebrand from Falafel-only to multi-brand is incomplete in the live site.
- **"Falafel" nav item links to `/about-1`** — a stock Wix About page with no Falafel content. The sub-brand entry point is a template the owner never filled in.

---

## 3. Real copy worth keeping (verbatim)

### Homepage hero strapline (rendered as image on the hero)

> "GOOD FOOD, GOOD VIBES, SIMPLY THE BEST!"

(Treat as creative reference — owner may want a less generic line in the rebuild.)

### Founder / "Who We Are" — homepage

> "Founded in 2019, our journey began with a single food truck: Simply Falafel. Built from a genuine love of food and a passion for sharing authentic flavours, Simply Falafel quickly gained a loyal following and proved that quality, simplicity, and consistency matter."

> "Following its success, we expanded in 2021 with Simply Shawarma, bringing bold, traditional shawarma flavours to the streets. The response was overwhelming, confirming that our approach resonated with customers."

> "In 2023, after seeing the huge demand for both concepts, we combined the best of Simply Falafel and Simply Shawarma to create Simply Lebanese — a brand that celebrates the heart of Lebanese street food in one complete offering."

> "Driven by continued customer demand and encouragement from friends and supporters, we later launched Simply Burgers, inspired by our much-loved smash burgers that had long been requested as a standalone concept."

> "Today, the Simply brand has grown to seven food trucks operating across multiple locations. With strong foundations, proven concepts, and consistent demand, we are now exploring franchising opportunities to grow the Simply brand while maintaining the quality and values that defined us from day one."

**Surprise / discrepancy:** the live site claims **seven food trucks**. The owner confirmed only **three trucks at Paddington Basin** to the brief author. Flag this for the lead — the public number is currently higher than the confirmed operational number.

### Catering pitch — homepage

> "We are a street food catering team passionate about bringing fresh, flavour-packed food and a vibrant street-food atmosphere to private events. Our concept is simple: high-quality ingredients, freshly prepared dishes, and fast, friendly service that keeps your guests happy."

> "Whether you are planning a corporate event, wedding, birthday party, festival, or private celebration, our food truck setup creates a relaxed and enjoyable experience for everyone. We specialise in freshly made street-food favourites, prepared on site and served hot to your guests."

> "Our team is experienced in catering for events of different sizes, and we work closely with our clients to ensure everything runs smoothly from start to finish. We aim to provide not just great food, but a memorable food experience."

> "If you would like to confirm your booking or have any questions about the quotation, menu options, or event logistics, please feel free to contact us."

### Franchising pitch — `/about-1-1`

Concrete dates that differ from the homepage narrative — the franchising page lists **five** sub-brands with **dated establishment years**:

> "In just six years, we've expanded from one concept to five distinct brands:
> Simply Falafel (Est. 2019)
> Simply Shawarma (Est. 2021)
> Simply Lebanese (Est. 2023)
> Simply Pasta (Est. 2024)
> Simply Burgers (Est. 2025)"

**Note:** this contradicts the CLAUDE.md brand-architecture table, which lists Pasta as "TBD" and Burgers as "Most recent". The live franchising page has firm dates: Pasta 2024, Burgers 2025. Recommend the lead asks the owner to confirm.

Other real franchising copy (uses some emotive lift-up language; usable as raw material but probably wants a rewrite):

> "Lebanese fusion to the premium sear of our Simply Burgers smash patties, we have captured the market's craving for high-quality street food. Now, we are inviting driven partners to take the wheel and grow with us."

> "**A Proven Track Record** — We aren't testing the waters—we're making waves."

> "**Premium Quality, Built-In** — Our reputation is built on quality, not shortcuts. Whether it's our authentic Middle Eastern marinades or our smash burgers made with the best possible ingredients, customers trust the \"Simply\" name. As a franchisee, you inherit that trust on Day 1."

> "**Diverse Concepts** — Unlike other franchises that lock you into one menu, the Simply fleet offers versatility. We have successfully launched concepts across different cuisines, giving our brand broad appeal in any location."

> "**Low Overhead, High Mobility** — Forget the massive costs of a brick-and-mortar restaurant. Our food truck model allows you to go where the customers are—festivals, corporate events, and busy street corners—keeping overheads low and potential high."

> "**What We Provide** — We don't just hand you the keys; we give you the roadmap.
> - Comprehensive Training: Learn our operations, safety standards, and customer service protocols.
> - The Secret Recipes: Get full access to our proprietary recipes, including our famous marinades and smash burger techniques.
> - Supply Chain Access: Benefit from our established relationships with suppliers to get the best ingredients at the right prices.
> - Branding & Marketing: Utilize our strong brand identity, social media presence, and fleet reputation to hit the ground running."

> "**Ideal Candidate — Who Are We Looking For?** We are looking for partners who share our values:
> - Passion for Food: You understand that quality ingredients are non-negotiable.
> - Drive: You are ready to hustle and manage a fast-paced environment.
> - Community Focus: You want to build connections with customers, just like we have since 2019."

> "Ready to Get Rolling? The \"Simply\" fleet is growing. If you are ready to own your business and join a winning team, we want to hear from you."

The franchising page also leaks Wix authoring instructions into the rendered output: bracketed strings like `[Footer / Contact Form Section]`, `[Contact Form Fields]`, `[BUTTON: Submit Enquiry]` appear in the live HTML, suggesting the section is a rough draft that was never converted into actual UI.

The franchising page proposes form fields:

- Name, Email, Phone Number
- "Which Brand Interests You?" (Dropdown: Simply Burgers, Simply Lebanese, Simply Pasta, Open to Suggestions)
- Proposed Location/City
- Message
- Submit Enquiry

### `/about-1` — pure Wix template placeholder (do NOT use)

For the record, the "Falafel" nav target reads in full:

> "About Us — Finding Inspiration in Every Turn — This is your About Page. This space is a great opportunity to give a full background on who you are, what you do and what your website has to offer. Double click on the text box to start editing your content and make sure to add all the relevant details you want site visitors to know."

> "Our Story — Every website has a story, and your visitors want to hear yours. … If you're a business, talk about how you started and share your professional journey. Explain your core values, your commitment to customers, and how you stand out from the crowd. Add a photo, gallery, or video for even more engagement."

This text appears verbatim because the owner did not customise the page. Do not paraphrase it into something that sounds real.

---

## 4. Contact details

- **Email**: `info@simplyfalafel.co.uk`
- **Phone**: `0744-613-0870` (UK mobile prefix; rendered with dashes)
- **Postal address (single, repeated across all pages)**: `Merchant Square, Estate, London W2 1PW`
- **Live chat widget**: a Wix-injected "Let's Chat!" floating button is present on the homepage.

No second pitch address (Canal Side Walk W2 1AS) is mentioned anywhere on the live site, despite the homepage copy claiming seven trucks.

---

## 5. Menu items + prices + dietary tags

From `/menu`. Tags as labelled by the site (verbatim). Items with placeholder descriptions are marked.

### Wraps

| Item | Description | Price | Tag |
|---|---|---|---|
| Falafel Wrap | Freshly made Falafel wrap with all the salad included and Home Made Tahini Sauce | £7 | Vegan |
| Falafel Wrap Extra | Freshly made Falafel wrap with extra Falafel all the salad include Home Made Tahini Sauce | £8 | Vegan |
| Falafel with Haloumi | Freshly made Falafel Wrap with Halloumi all the salad included a Home Made Tahini Sauce | £8 | Vegetarian |
| Falafel with Haloumi Extra | Freshly made Falafel Wrap with extra Falafel and Halloumi all the salad included and Home Made Tahini Sauce | £9 | Vegetarian |
| The Special One | A large Falafel Wrap Served with Halloumi Fries and a Sweet Chilli Dip | £10 | Vegetarian |

### Salads

| Item | Description | Price | Tag |
|---|---|---|---|
| Falafel Salad | Falafel Salad with Humous | £7.50 | Vegan |
| Falafel Salad Extra | Falafel Salad with Humous | £8.50 | Vegan |
| Falafel Salad with Halloumi | Falafel Salad with Humous and freshly grilled Halloumi | £9 | Vegetarian |
| Falafel Salad with Halloumi Extra | Falafel Salad with Humous and freshly grilled Halloumi | £10 | Vegetarian |
| The Salad Special | Falafel Salad served with Halloumi Fries, Hummus, Za'atar & Sweet Chilli Dip | £11 | Vegetarian |

### Sides

| Item | Description | Price | Tag |
|---|---|---|---|
| Handmade Falafel Starter | *placeholder: "I'm a dish description."* | £4.50 | Vegan |
| Handmade Hummus | *placeholder: "I'm a dish description."* | £5 | Vegan |
| Handmade Baba Ghanoush | *placeholder: "I'm a dish description."* | £5 | Vegan |

### Desserts

| Item | Description | Price | Tag |
|---|---|---|---|
| Baklava | Freshly Prepared Baklava | £3 | *(no tag)* |
| Baklava Plate Large | Freshly Prepared Baklava | £5 | Vegan |

### Drinks

| Item | Description | Price | Tag |
|---|---|---|---|
| Water | *placeholder: "I'm a dish description."* | £1.50 | *(no tag)* |
| Soft drink | *placeholder: "I'm a dish description."* | £2 | Vegan |

Menu coverage observations:

- **Only Simply Falafel items are on the menu page.** No shawarma, burger, lebanese, or pasta items appear anywhere on the live site. The menu is mis-labelled "Lunch Menu" but is in practice the Falafel menu.
- Several spelling inconsistencies ("Haloumi" vs "Halloumi", "Humous" vs "Hummus") appear within the same page — rebuild should normalise.
- Tagging is inconsistent: Baklava (small) has no tag, Baklava (large) is tagged Vegan; Water has no tag, Soft Drink is tagged Vegan.

---

## 6. Hero treatment

The brief said "cartoon illustrations rather than food." Confirmed and expanded:

The homepage hero is a flat, frontal composition built from **cartoon SVG/PNG illustrations** of street-food items: a soda cup, a wrap/shawarma, a chicken shawarma, a falafel wrap, and a chip-cup. They are arranged on either side of a centred hero panel and a large pile of cartoon fries (`french_fries_4k.png`). The strapline `GOOD FOOD, GOOD VIBES, SIMPLY THE BEST!` is set in a bold, slightly hand-drawn display lettering and presented as part of the artwork. No photography, no video, no real-food imagery in the hero zone. File names in the DOM (e.g. `illustrative-cartoon-style-drawing-of-a-falafel-wr_edited.png`) suggest the illustrations were generated by an AI-image tool and lightly edited. This is the explicit anti-pattern the brief calls out: cartoon-illustration hero on a food business that wants an "Adidas / Apple advert" quality bar.

Below the hero, an 8-slide image gallery does feature real food/team/truck photography (the only place on the site where real photos appear at scale).

A "team" image (`restyle-the-photo-of-the-five-chefs-in-black-unifo.jpeg`) sits next to the "Who We Are" block. The filename suggests it was AI-restyled from an original photograph.

---

## 7. Truck location names

Only one location is named anywhere on the live site:

- **Merchant Square, Estate, London W2 1PW** (footer; repeated on every page).

The homepage copy claims "**seven food trucks operating across multiple locations**" but does not name any of them. No pitch list, no map, no rota. The Canal Side Walk W2 1AS pitch (Simply Burgers per CLAUDE.md) is **not mentioned on the live site at all** — neither is any pasta or lebanese pitch.

This is the surprise the brief warned to look for: the live narrative ("seven trucks") and the confirmed operational reality ("three trucks at Paddington Basin") don't match. Either trucks have closed, the "seven" was always aspirational, or the owner is counting concept/menu lines as "trucks" rather than physical units. Worth a direct question to the owner before any "seven trucks" claim is carried into the rebuild.

---

## Source screenshots

- Desktop, full-page: `assets-inbox/current-site-extract/screenshots/wix-home-desktop.png`
- Mobile-width viewport: `assets-inbox/current-site-extract/screenshots/wix-home-mobile.png`
