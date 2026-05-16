# Plan 0001 — Phase 1 onboarding checklist

**Date:** (set when started)
**Status:** Not started — agent to populate as Phase 1 proceeds.

## Pre-flight reading (do all of these before any other work)

- [ ] `BRIEFING.md` — root briefing
- [ ] `CLAUDE.md` — domain context
- [ ] `AGENT-WORKFLOW.md` — multi-chat / subagent strategy
- [ ] `references/REJECTED-DIRECTIONS.md` — what NOT to propose
- [ ] `assets-inbox/PLACEHOLDERS.md` — placeholder asset guidance
- [ ] `references/prior-build-rules/*.md` — previous build's rules (for discipline reference, not enforced verbatim)
- [ ] `.claude/agents/*.md` — wiring + intended use of each subagent

## Asset review

- [ ] Watch `assets-inbox/videos/FalafelVid.mp4` end-to-end. Note: pacing, what's shown, what's hidden, how it could anchor a hero.
- [ ] Watch `assets-inbox/videos/ShawarmaVid.mp4` end-to-end. Same.
- [ ] Examine `assets-inbox/logos/BurgerLogo.jpeg` + `assets-inbox/logos/AllOtherLogos.jpeg`. Form a view on whether to lean on these vs build a clean parent-brand mark.

## Research

- [ ] Run `content-researcher` subagent against the existing Wix site at `https://simplyltd.co.uk`. Extract any copy worth keeping. Note the 404'ing nav, the brand-identity confusion (site is "Simply Ltd" but footer says "© 2019 by Simply Falafel"), the cartoon hero.
- [ ] Run `content-researcher` against the three positive reference brands:
  - `https://pastaevangelists.com`
  - `https://honestburgers.co.uk`
  - `https://meatliquor.com`
- [ ] For each reference, write a short note: what's the homepage doing; what's the typography system; how is food photography used; what's the catering / franchising flow look like. Save to `docs/research/2026-XX-XX-reference-audit.md`.
- [ ] (Optional) Check the owner's Instagram or any other public-facing presence the brief mentions for photography context.

## Phase 1 discovery report

Write to `docs/plans/0001-phase1-discovery.md`. Sections:

1. **What I learned** — synthesised findings from assets + existing site + references.
2. **Stack recommendation** — pick a framework + hosting + form handler + content system. Include cited verification of commercial-use ToS for each. List rejected alternatives with reasons.
3. **Visual direction** — name a real reference brand and explain how this build will live in that lineage. Be specific: type system, palette, motion language, photography role.
4. **Signature interaction** — for the homepage hero and (separately) the four-brand showcase. The four-brand showcase requires **three distinct creative directions** per the brief. Each direction must be directionally different from the others (e.g. one photography-led, one typography-led, one motion-led — not three variations of the same idea).
5. **Open questions for Namit** — concrete options, not open prompts. Example: "Should we commission food photography now (~3 weeks lead time, blocks visual hero work) or proceed with Unsplash placeholders documented for swap?" — present (a)(b)(c) options.

## Stop after Phase 1

When the discovery report is written, **stop**. Don't proceed to Phase 2 plan or any code. Wait for Namit's review and sign-off.

## What "done" looks like for this plan

- [ ] All pre-flight reading complete
- [ ] All assets reviewed
- [ ] Content-researcher run against existing Wix + 3 reference brands
- [ ] `docs/plans/0001-phase1-discovery.md` written
- [ ] Reported to Namit with: one paragraph what was done; one paragraph what's next (Phase 2 plan); list of open questions; link to the discovery report
- [ ] First commit on `main` made (everything above + this plan's checkboxes checked)
