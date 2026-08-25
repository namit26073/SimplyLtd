import type { z } from "zod";

/** Env vars the enquiry endpoints read. Set as Worker secrets (`wrangler secret put`). */
export interface EnquiryEnv {
  CATERING_EMAIL?: string;
  FRANCHISE_EMAIL?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_ADDRESS?: string;
  TURNSTILE_SECRET_KEY?: string;
}

interface EnquiryBase {
  email: string;
  turnstileToken: string;
  botField: string;
}

export interface EnquiryHandlerOptions<T extends EnquiryBase> {
  request: Request;
  env: EnquiryEnv;
  /** Log prefix, e.g. "catering". */
  tag: string;
  schema: z.ZodType<T>;
  destination: (env: EnquiryEnv) => string | undefined;
  subject: (data: T) => string;
  html: (data: T) => string;
  /** Structural metadata only — never the message body. */
  redact: (data: T) => Record<string, unknown>;
}

/** Last-resort destination when the env var is unset — production must set the var. */
const FALLBACK_DESTINATION = "namitg26@gmail.com";
const DEFAULT_FROM = "Simply Ltd <enquiries@simplyltd.co.uk>";

/**
 * Shared pipeline for the catering + franchising endpoints:
 * parse JSON → validate → honeypot → Turnstile → Resend (or mock when unconfigured).
 */
export async function handleEnquiry<T extends EnquiryBase>(
  opts: EnquiryHandlerOptions<T>,
): Promise<Response> {
  const { request, env, tag, schema } = opts;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, message: "Invalid JSON body." }, 400);
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return json(
      { ok: false, message: "Validation failed.", errors: firstIssuePerField(parsed.error) },
      400,
    );
  }
  const data = parsed.data;

  // Honeypot — silently "succeed" so bots don't learn they were caught.
  if (data.botField !== "") {
    return json({ ok: true }, 200);
  }

  if (env.TURNSTILE_SECRET_KEY) {
    const ok = await verifyTurnstile(data.turnstileToken, env.TURNSTILE_SECRET_KEY, request);
    if (!ok) {
      return json({ ok: false, message: "Spam check failed. Please try again." }, 400);
    }
  } else if (data.turnstileToken !== "dev-bypass") {
    return json({ ok: false, message: "Spam check is not configured on this environment." }, 500);
  }

  const to = opts.destination(env);
  if (!to) {
    console.warn(`[${tag}] destination env var unset — falling back to ${FALLBACK_DESTINATION}`);
  }
  const destination = to ?? FALLBACK_DESTINATION;

  if (!env.RESEND_API_KEY) {
    console.warn(`[${tag}] mock send (no RESEND_API_KEY)`, {
      to: destination,
      payload: opts.redact(data),
    });
    return json({ ok: true, dev: true }, 200);
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_ADDRESS ?? DEFAULT_FROM,
      to: [destination],
      reply_to: data.email,
      subject: opts.subject(data),
      html: opts.html(data),
    }),
  });

  if (!resendResponse.ok) {
    const errBody = await resendResponse.text().catch(() => "");
    console.error(`[${tag}] resend send failed`, resendResponse.status, errBody);
    return json(
      {
        ok: false,
        message: "We couldn't send the enquiry just now. Please try again or email us directly.",
      },
      502,
    );
  }

  return json({ ok: true }, 200);
}

async function verifyTurnstile(token: string, secret: string, request: Request): Promise<boolean> {
  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) form.set("remoteip", ip);

  const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  if (!result.ok) return false;
  const body = (await result.json()) as { success?: boolean };
  return body.success === true;
}

function firstIssuePerField(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path[0];
    if (typeof path === "string" && !(path in errors)) errors[path] = issue.message;
  }
  return errors;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function paragraphs(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
