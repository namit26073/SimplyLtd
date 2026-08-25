import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cateringEnquiry } from "../../src/server/enquiries/catering";
import { franchisingEnquiry } from "../../src/server/enquiries/franchising";
import type { EnquiryEnv } from "../../src/server/enquiry";

const validCatering = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "",
  eventDate: "2026-09-12",
  flexibleDate: false,
  eventType: "wedding",
  guestCount: 80,
  eventLocation: "Kew Gardens",
  notes: "Vegan options please <3",
  turnstileToken: "dev-bypass",
  botField: "",
};

const validFranchising = {
  name: "Sam Patel",
  email: "sam@example.com",
  phone: "07700900123",
  regionInterest: "Manchester",
  investmentRange: "50k-100k",
  timeline: "3-6mo",
  background: "Ran a cafe for 5 years",
  turnstileToken: "dev-bypass",
  botField: "",
};

type Handler = (request: Request, env: EnquiryEnv) => Promise<Response>;

function call(handler: Handler, body: unknown, env: EnquiryEnv = {}, raw = false) {
  const request = new Request("https://simplyltd.co.uk/api/x", {
    method: "POST",
    headers: { "Content-Type": "application/json", "cf-connecting-ip": "203.0.113.9" },
    body: raw ? (body as string) : JSON.stringify(body),
  });
  return handler(request, env);
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  fetchMock.mockReset();
});

describe("enquiry endpoints", () => {
  it("rejects malformed JSON", async () => {
    const res = await call(cateringEnquiry, "{not json", {}, true);
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ ok: false, message: "Invalid JSON body." });
  });

  it("returns one message per invalid field", async () => {
    const res = await call(cateringEnquiry, { ...validCatering, email: "nope", guestCount: 2 });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.errors.email).toBeDefined();
    expect(body.errors.guestCount).toBe("We cater for 10 guests and up.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never sends anything for a filled honeypot", async () => {
    // Zod caps botField at length 0, so a filled honeypot is rejected at validation;
    // either way no email goes out.
    const spam = await call(cateringEnquiry, { ...validCatering, botField: "http://spam" });
    expect([200, 400]).toContain(spam.status);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("mock-sends when Resend isn't configured (dev bypass)", async () => {
    const res = await call(cateringEnquiry, validCatering);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, dev: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses non-bypass tokens when Turnstile isn't configured", async () => {
    const res = await call(cateringEnquiry, { ...validCatering, turnstileToken: "real-token" });
    expect(res.status).toBe(500);
  });

  it("rejects when Turnstile says no", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: false }), { status: 200 }),
    );
    const res = await call(
      cateringEnquiry,
      { ...validCatering, turnstileToken: "tok" },
      { TURNSTILE_SECRET_KEY: "secret", RESEND_API_KEY: "re_x" },
    );
    expect(res.status).toBe(400);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const form = init.body as URLSearchParams;
    expect(form.get("secret")).toBe("secret");
    expect(form.get("response")).toBe("tok");
    expect(form.get("remoteip")).toBe("203.0.113.9");
  });

  it("sends via Resend with reply-to, escaping HTML, when fully configured", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "email_1" }), { status: 200 }));

    const res = await call(
      cateringEnquiry,
      { ...validCatering, turnstileToken: "tok", name: "<b>Jane</b>" },
      {
        TURNSTILE_SECRET_KEY: "secret",
        RESEND_API_KEY: "re_x",
        RESEND_FROM_ADDRESS: "Simply Ltd <enquiries@simplyltd.co.uk>",
        CATERING_EMAIL: "owner@example.com",
      },
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_x");
    const sent = JSON.parse(init.body);
    expect(sent.to).toEqual(["owner@example.com"]);
    expect(sent.reply_to).toBe("jane@example.com");
    expect(sent.subject).toBe("New catering enquiry — wedding for 80 guests");
    expect(sent.html).toContain("&lt;b&gt;Jane&lt;/b&gt;");
    expect(sent.html).toContain("Vegan options please &lt;3");
  });

  it("surfaces a 502 when Resend fails", async () => {
    fetchMock.mockResolvedValueOnce(new Response("boom", { status: 500 }));
    const res = await call(franchisingEnquiry, validFranchising, {
      RESEND_API_KEY: "re_x",
      FRANCHISE_EMAIL: "owner@example.com",
    });
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({ ok: false });
  });

  it("routes franchising to FRANCHISE_EMAIL with its own subject", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));
    const res = await call(franchisingEnquiry, validFranchising, {
      RESEND_API_KEY: "re_x",
      FRANCHISE_EMAIL: "franchise@example.com",
    });
    expect(res.status).toBe(200);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.to).toEqual(["franchise@example.com"]);
    expect(sent.subject).toBe("New franchising enquiry — Manchester");
    expect(sent.html).toContain("Ran a cafe for 5 years");
  });
});
