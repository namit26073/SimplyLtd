import { cateringSchema, type CateringPayload } from "../../src/schemas/catering";

interface Env {
  CATERING_EMAIL?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_ADDRESS?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, message: "Invalid JSON body." }, 400);
  }

  const parsed = cateringSchema.safeParse(payload);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0];
      if (typeof path === "string" && !(path in errors)) {
        errors[path] = issue.message;
      }
    }
    return json({ ok: false, message: "Validation failed.", errors }, 400);
  }

  const data = parsed.data;

  // Honeypot — silently drop spam without surfacing the rejection.
  if (data.botField !== "") {
    return json({ ok: true }, 200);
  }

  // Turnstile verification — required when the secret is set.
  if (env.TURNSTILE_SECRET_KEY) {
    const turnstileOk = await verifyTurnstile(data.turnstileToken, env.TURNSTILE_SECRET_KEY, request);
    if (!turnstileOk) {
      return json({ ok: false, message: "Spam check failed. Please try again." }, 400);
    }
  } else if (data.turnstileToken !== "dev-bypass") {
    // No secret set and not a dev request — refuse to accept unverified
    // submissions in this configuration.
    return json(
      { ok: false, message: "Spam check is not configured on this environment." },
      500,
    );
  }

  const destination = env.CATERING_EMAIL ?? "namitg26@gmail.com";

  // If Resend isn't configured, return mock-success so dev iteration still
  // exercises the happy path. Production deploys must set RESEND_API_KEY.
  if (!env.RESEND_API_KEY) {
    console.log("[catering] mock send (no RESEND_API_KEY)", {
      to: destination,
      payload: redactForLog(data),
    });
    return json({ ok: true, dev: true }, 200);
  }

  const subject = `New catering enquiry — ${data.eventType} for ${data.guestCount} guests`;
  const body = renderEnquiryHtml(data);

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_ADDRESS ?? "Simply Ltd <enquiries@simplyltd.co.uk>",
      to: [destination],
      reply_to: data.email,
      subject,
      html: body,
    }),
  });

  if (!resendResponse.ok) {
    const errBody = await resendResponse.text().catch(() => "");
    console.error("[catering] resend send failed", resendResponse.status, errBody);
    return json(
      {
        ok: false,
        message: "We couldn't send the enquiry just now. Please try again or email us directly.",
      },
      502,
    );
  }

  return json({ ok: true }, 200);
};

async function verifyTurnstile(token: string, secret: string, request: Request): Promise<boolean> {
  const ip = request.headers.get("cf-connecting-ip") ?? "";
  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (ip) form.set("remoteip", ip);

  const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });

  if (!result.ok) return false;

  const data = (await result.json()) as { success?: boolean };
  return data.success === true;
}

function renderEnquiryHtml(data: CateringPayload): string {
  return `
    <h1>New catering enquiry</h1>
    <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
    ${data.phone ? `<p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>` : ""}
    <p><strong>Event type:</strong> ${escapeHtml(data.eventType)}</p>
    <p><strong>Date:</strong> ${data.flexibleDate ? "Flexible" : escapeHtml(data.eventDate ?? "(not given)")}</p>
    <p><strong>Guest count:</strong> ${data.guestCount}</p>
    <p><strong>Event location:</strong> ${escapeHtml(data.eventLocation)}</p>
    ${data.notes ? `<h2>Notes</h2><p>${escapeHtml(data.notes).replace(/\n/g, "<br>")}</p>` : ""}
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function redactForLog(data: CateringPayload): Record<string, unknown> {
  // Don't log full email body in prod logs; keep only structural metadata.
  return {
    eventType: data.eventType,
    guestCount: data.guestCount,
    flexibleDate: data.flexibleDate,
    hasPhone: Boolean(data.phone),
    hasNotes: Boolean(data.notes),
  };
}

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
