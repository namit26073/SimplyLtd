---
paths:
  - "src/pages/catering*"
  - "src/pages/franchising*"
  - "src/islands/forms/**"
  - "src/schemas/{catering,franchising}.ts"
  - "functions/api/**"
---

# Forms (catering, franchising)

## Page-level discipline

- **Catering form is not the top of the page.** Earn the enquiry: event types, named past clients (if available), lead-time, coverage area, package tiers (when content lands), then the form.
- **Franchising form is preceded by self-qualification** — credibility signals, what the franchisee will get, what we expect from them.
- Progressive disclosure: don't ask for guest count or investment range before showing the relevant context.

## Form structure

Implemented as React islands (`src/islands/forms/Catering.tsx`, `src/islands/forms/Franchising.tsx`), hydrated `client:visible`.

## Form fields

**Catering (v1):**
- Name (required)
- Email (required)
- Phone (optional)
- Event date (required, or "flexible" checkbox)
- Event type: wedding / corporate / festival / private / other (required, radio)
- Guest count (required, integer ≥ 10)
- Event location (required, free text — postcode or venue name)
- Notes (optional, textarea)
- Turnstile token (hidden)
- `bot_field` honeypot (hidden, must be empty)

**Franchising (v1):**
- Name, email, phone (phone required for franchising — higher-intent)
- City / region of interest (required)
- Investment range (required, picklist)
- Timeline (required: now / 3-6mo / 6-12mo / 12mo+)
- Background note (optional, textarea — "tell us about yourself")
- Turnstile token (hidden)
- `bot_field` honeypot (hidden)

## Cloudflare Pages Function handlers

Each form has its own function in `functions/api/`. Responsibilities:

1. **Verify Turnstile token** with Cloudflare's verification endpoint before any side effects.
2. **Validate payload** with Zod schemas (`src/schemas/<form>.ts`). Return 400 with a structured error on failure.
3. **Compose email via Resend.** Subject lines and from-address templated. Reply-to is the submitter's email.
4. **Route by env var**: `CATERING_EMAIL`, `FRANCHISE_EMAIL`. Never hard-code a destination address.
5. **Honeypot rejection**: include a `bot_field` hidden input; reject submissions where it's populated.
6. **Return JSON**: `{ ok: true }` or `{ ok: false, errors: ... }`. The island handles the success/error UX.
7. **Rate limit** by IP via Cloudflare KV (deferred to v1.1 if traffic is negligible).

Logs go to `console.log` and surface in Cloudflare's dashboard. **Never log the full email body** in production.

## Testing

Unit tests in `tests/schemas/` and `tests/functions/` (Vitest). Test:

- Zod schemas: invalid input rejected, valid accepted, edge cases.
- Functions: Turnstile-fail rejection, schema-fail rejection, honeypot rejection, Resend success path, Resend failure handling.
