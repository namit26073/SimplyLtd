import { describe, it, expect } from "vitest";
import { franchisingSchema } from "../../src/schemas/franchising";

function validPayload(overrides: Partial<Parameters<typeof franchisingSchema.parse>[0]> = {}) {
  return {
    name: "Alex Tester",
    email: "alex@example.com",
    phone: "07700 900456",
    regionInterest: "Manchester",
    investmentRange: "100k-250k" as const,
    timeline: "6-12mo" as const,
    background: "Eight years running a bakery; ready for a step up.",
    turnstileToken: "dev-bypass",
    botField: "",
    ...overrides,
  };
}

describe("franchisingSchema", () => {
  it("accepts a complete valid payload", () => {
    const result = franchisingSchema.safeParse(validPayload());
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = franchisingSchema.safeParse(validPayload({ name: "" }));
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = franchisingSchema.safeParse(validPayload({ email: "nope" }));
    expect(result.success).toBe(false);
  });

  it("requires phone (franchising is higher-intent)", () => {
    const result = franchisingSchema.safeParse(validPayload({ phone: "" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "phone")).toBe(true);
    }
  });

  it("rejects phone shorter than 7 chars", () => {
    const result = franchisingSchema.safeParse(validPayload({ phone: "123" }));
    expect(result.success).toBe(false);
  });

  it("rejects empty region", () => {
    const result = franchisingSchema.safeParse(validPayload({ regionInterest: "" }));
    expect(result.success).toBe(false);
  });

  it("rejects unknown investment range", () => {
    const result = franchisingSchema.safeParse(
      validPayload({ investmentRange: "free-coffee" as never }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects unknown timeline", () => {
    const result = franchisingSchema.safeParse(
      validPayload({ timeline: "tomorrow" as never }),
    );
    expect(result.success).toBe(false);
  });

  it("requires turnstileToken", () => {
    const result = franchisingSchema.safeParse(validPayload({ turnstileToken: "" }));
    expect(result.success).toBe(false);
  });

  it("rejects when honeypot is populated", () => {
    const result = franchisingSchema.safeParse(validPayload({ botField: "spam" }));
    expect(result.success).toBe(false);
  });

  it("allows optional background", () => {
    const result = franchisingSchema.safeParse(validPayload({ background: "" }));
    expect(result.success).toBe(true);
  });
});
