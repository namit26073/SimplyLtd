import { franchisingSchema, type FranchisingPayload } from "../../src/schemas/franchising";

interface Env {
  FRANCHISE_EMAIL?: string;
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

  const parsed = franchisingSchema.safeParse(payload);
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

  if (data.botField !== "") {
    return json({ ok: true }, 200);
  }

  if (env.TURNSTILE_SECRET_KEY) {
    const turnstileOk = await verifyTurnstile(data.turnstileToken, env.TURNSTILE_SECRET_KEY, request);
    if (!turnstileOk) {
      return json({ ok: false, message: "Spam check failed. Please try again." }, 400);
    }
  } else if (data.turnstileToken !== "dev-bypass") {
    return json(
      { ok: false, message: "Spam check is not configured on this environment." },
      500,
    );
  }

  const destination = env.FRANCHISE_EMAIL ?? "namitg26@gmail.com";

  if (!env.RESEND_API_KEY) {
    console.log("[franchising] mock send (no RESEND_API_KEY)", {
      to: destination,
      payload: redactForLog(data),
    });
    return json({ ok: true, dev: true }, 200);
  }

  const subject = `New franchising enquiry — ${data.regionInterest}`;
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
    console.error("[franchising] resend send failed", resendResponse.status, errBody);
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

function renderEnquiryHtml(data: FranchisingPayload): string {
  return `
    <h1>New franchising enquiry</h1>
    <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>
    <p><strong>Region:</strong> ${escapeHtml(data.regionInterest)}</p>
    <p><strong>Investment range:</strong> ${escapeHtml(data.investmentRange)}</p>
    <p><strong>Timeline:</strong> ${escapeHtml(data.timeline)}</p>
    ${data.background ? `<h2>Background</h2><p>${escapeHtml(data.background).replace(/\n/g, "<br>")}</p>` : ""}
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

function redactForLog(data: FranchisingPayload): Record<string, unknown> {
  return {
    region: data.regionInterest,
    investmentRange: data.investmentRange,
    timeline: data.timeline,
    hasBackground: Boolean(data.background),
  };
}

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
