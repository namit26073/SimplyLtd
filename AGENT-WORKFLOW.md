# Agent workflow — how to build this efficiently with Claude Code

> This file explains how to split the work across subagents and parallel chats. The previous build was done largely in a single thread, which caused context bloat, slow iteration, and re-rejected designs because the main thread couldn't see the broader picture. This time we structure differently.

## The three roles

### Lead (this chat, the one reading BRIEFING.md)

- Owns the plan. Phases 1 → 2 → 3. Owns the architectural decisions.
- Owns integration. When subagents return work, the Lead is the one stitching it into the codebase.
- Owns the conversation with Namit. Subagents don't talk to Namit.
- Does the high-leverage work: writing the plan, writing the design system, writing the homepage hero.

### Subagents (dispatched via the `Agent` tool from the Lead)

Three are pre-wired in `.claude/agents/`. Use them as named:

- **`design-reviewer`** — verifies a vertical slice is design-correct after it's built in code. Runs Lighthouse, takes mobile + desktop screenshots, reports concrete issues with the rendered page (not the code).
  - **Invoke after:** every vertical slice (page or major section) is "done in code"
  - **Don't invoke for:** early-stage exploration; pre-merge cleanup; backend-only changes
- **`accessibility-auditor`** — WCAG 2.2 AA pass + `prefers-reduced-motion` fallback verification. Catches things the design-reviewer misses (focus order, keyboard nav, ARIA usage, contrast on photo overlays).
  - **Invoke after:** every interactive component is functionally complete; every page is design-reviewer-approved
- **`content-researcher`** — extracts content from external sources. Two specific uses here: (1) the current Simply Ltd Wix site for any copy worth keeping; (2) reference food-brand sites (Pasta Evangelists, Honest Burgers, MEATliquor, etc.) for design moves worth borrowing.
  - **Invoke for:** early Phase 1 research; ad-hoc content lookups
  - **Don't invoke for:** generic web search (use WebFetch directly in the Lead)

### Parallel chats (separate VS Code windows, separate Claude sessions)

When work splits cleanly into independent threads, fork. Examples:

- **Three sub-brand pages** (Falafel + Shawarma + Lebanese) can be built in three parallel chats once the design system + page template is in place. Each chat is briefed on the brand-specific assets, the template, and the conventions. The Lead reviews each at merge time.
- **The catering form** and the **franchising form** are independent — different copy, different fields, different success states. Fork one off in a parallel chat.

The trigger for forking is: *can two pieces of work be done with no shared state for the next 2+ hours?* If yes, fork. If no, single thread.

## Phase shape

### Phase 1 — Discovery (single thread, Lead only)

- Read this workspace's `CLAUDE.md`, `BRIEFING.md`, `references/REJECTED-DIRECTIONS.md`.
- Dispatch `content-researcher` against:
  - `https://simplyltd.co.uk` (existing Wix; what to keep)
  - `https://pastaevangelists.com` (reference for catering CTA + brand voice)
  - `https://honestburgers.co.uk` (reference for menu presentation + restaurant photography)
  - `https://meatliquor.com` (reference for visual identity + brand expression)
- Examine the owner-provided assets in `assets-inbox/`.
- Write `docs/plans/0001-phase1-discovery.md`.
- **Stop and wait.** Namit reviews and signs off, or redirects.

Estimated time: 2–3 hours, mostly research.

### Phase 2 — Plan (single thread, Lead only)

- Synthesise Phase 1 findings into a concrete build plan.
- Stack choice with rejected alternatives.
- File structure.
- Three creative directions for the four-brand showcase (per the brief — required, not optional).
- Sequence of vertical slices to build, with verification gates between each.
- Open questions Namit must answer before specific slices can start.
- Write `docs/plans/0002-build-plan.md`.
- **Stop and wait.** Namit reviews, picks the creative direction, signs off.

Estimated time: 1–2 hours.

### Phase 3 — Execute (Lead + parallel chats + subagents)

The vertical slices, roughly in dependency order:

1. **Scaffolding** — repo + stack install + `.claude/rules/` written for the chosen stack + first commit (Lead, single thread).
2. **Design system** — tokens (colour, type scale, space, motion), Base layout, Header, Footer (Lead, single thread).
3. **Content model** — schemas for brands, locations, press, etc.; populate with the real owner-provided content where it exists, placeholder where it doesn't (Lead, single thread).
4. **Homepage hero** — the signature interaction the Namit-approved direction calls for (Lead, careful slow work; design-reviewer + accessibility-auditor before marking done).
5. **Sub-brand pages** — once the page template is built once, the remaining 4 can fork into parallel chats. Each chat takes one brand, builds its page using the template, runs design-reviewer + accessibility-auditor, reports back to Lead for integration.
6. **Catering page + form** — parallel chat for the form (form is independent enough to fork); Lead handles the page chrome.
7. **Franchising page + form** — parallel chat for the form; Lead handles the page chrome.
8. **Locations page** — Lead, with content-researcher possibly pulling map references.
9. **Press / About / Contact** — small pages, Lead does them in sequence.
10. **Cross-cutting passes** — accessibility audit of every page (accessibility-auditor); perf audit of every page (design-reviewer Lighthouse run); copy pass; link audit (no 404s).

### Phase 4 — Deploy

- Hosted preview deployed via the chosen platform.
- Cloudflare/Netlify env vars configured (Namit provides credentials).
- Domain stays on the preview URL until owner approves cutover.

## When NOT to use a subagent

Subagents have setup cost (briefing prompt, context-load, result digestion). Don't use them for:

- A single grep or file read — use the tool directly.
- Tasks under ~3 tool calls — direct execution is faster.
- Anything where the Lead's judgment is on the critical path — don't delegate the call, just the work.

## When NOT to fork a parallel chat

Parallel chats have integration cost (the Lead has to merge their output). Don't fork for:

- Anything under ~1 hour of work.
- Work that needs frequent reference to the Lead's in-flight context.
- Anything still mid-design — fork only after the design is locked.

## Reporting back to Namit

After each Phase or major slice:

- One paragraph: what was done.
- One paragraph: what's next.
- Bulleted list: any blocking questions, with concrete options for each.
- Link to: any new screenshots, plan docs, decision records.

Don't report progress that nobody asked for. Don't dump tool output. The Lead's job is to synthesise.

## A note on humility

Three signature-interaction directions have already been rejected on the parallel build. You are starting clean but you are not starting from zero — there are real lessons in `references/REJECTED-DIRECTIONS.md`. Read them as evidence about what the owner does and doesn't respond to, not as obstacles to creative freedom.
