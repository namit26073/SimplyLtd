---
paths:
  - "src/islands/**"
---

# Islands (client-side JS)

Anything in this directory ships JS to the client. Treat every byte as a budget item.

## Mount strategies — pick the lightest viable

- `client:idle` — for non-critical islands (footer newsletter, analytics opt-in). Hydrates after the page is idle.
- `client:visible` — **default for almost everything else.** Hydrates when the island scrolls into view. Use for the catering form, the franchising form, success states.
- `client:media="(prefers-reduced-motion: no-preference)"` — for purely-decorative motion. Pair with a non-motion fallback in the surrounding `.astro` so reduced-motion users get a complete page.
- `client:load` — only for islands that must be interactive before the user can read them. Almost never the right answer on a marketing site.

## Budgets

- Per-route JS budget: ≤ 70 KB transferred (gzip). Catering / franchising form pages may go to ≤ 100 KB due to form-state libraries; defend it actively.
- Total motion JS across the site: ≤ 20 KB (single small library, e.g. Motion One).
- React + react-dom must be split per island, not bundled per page. Astro handles this automatically; don't fight it.

## Reduced motion is a hard floor

Every island that animates must verify a `prefers-reduced-motion: reduce` fallback. The accessibility-auditor subagent runs this check. If your island has no reduced-motion path, it is not finished.

## Form islands specifically

- Native HTML form semantics. `<label>` linked to every input.
- Required fields get `aria-required="true"` and a visible required marker.
- Validation: HTML-native first (`type="email"`, `required`, `pattern`), augmented with light client logic for cross-field rules.
- Errors get `aria-live="polite"` regions.
- Submit button enters a disabled+spinner state during request. Don't blur the form on submit; users may want to edit and retry.
- Success state is a **separate component**, not just hiding the form. Focus moves into the success heading.

## Anti-patterns

- Don't `client:load` because you couldn't get `client:visible` working. Fix the visibility detection.
- Don't import a state-management library (Zustand, Jotai, etc.) for a single form's state — use `useState`.
- Don't import lodash; import lodash subpaths only if needed, or write the helper inline (usually < 5 lines).
- Don't ship a date-picker library; use `<input type="date">`. iOS/Android natives are excellent.
