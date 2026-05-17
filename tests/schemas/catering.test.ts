import { describe, it, expect } from "vitest";
import { cateringSchema } from "../../src/schemas/catering";

function validPayload(overrides: Partial<Parameters<typeof cateringSchema.parse>[0]> = {}) {
  return {
    name: "Sam Tester",
    email: "sam@example.com",
    phone: "07700 900123",
    eventDate: "2026-09-12",
    flexibleDate: false,
    eventType: "wedding" as const,
    guestCount: 120,
    eventLocation: "Hackney Town Hall",
    notes: "Vegan options please.",
    turnstileToken: "dev-bypass",
    botField: "",
    ...overrides,
  };
}

describe("cateringSchema", () => {
  it("accepts a complete valid payload", () => {
    const result = cateringSchema.safeParse(validPayload());
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = cateringSchema.safeParse(validPayload({ name: "" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "name")).toBe(true);
    }
  });

  it("rejects invalid email", () => {
    const result = cateringSchema.safeParse(validPayload({ email: "not-an-email" }));
    expect(result.success).toBe(false);
  });

  it("requires either a date or the flexibleDate flag", () => {
    const result = cateringSchema.safeParse(
      validPayload({ eventDate: "", flexibleDate: false }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "eventDate")).toBe(true);
    }
  });

  it("accepts flexible date without a specific date", () => {
    const result = cateringSchema.safeParse(
      validPayload({ eventDate: "", flexibleDate: true }),
    );
    expect(result.success).toBe(true);
  });

  it("rejects guest count below 10", () => {
    const result = cateringSchema.safeParse(validPayload({ guestCount: 5 }));
    expect(result.success).toBe(false);
  });

  it("coerces numeric strings for guest count", () => {
    const result = cateringSchema.safeParse(validPayload({ guestCount: "50" as unknown as number }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.guestCount).toBe(50);
    }
  });

  it("rejects unknown event type", () => {
    const result = cateringSchema.safeParse(
      validPayload({ eventType: "anniversary" as never }),
    );
    expect(result.success).toBe(false);
  });

  it("requires turnstileToken", () => {
    const result = cateringSchema.safeParse(validPayload({ turnstileToken: "" }));
    expect(result.success).toBe(false);
  });

  it("rejects when honeypot is populated", () => {
    const result = cateringSchema.safeParse(validPayload({ botField: "i am a bot" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "botField")).toBe(true);
    }
  });

  it("allows phone to be omitted", () => {
    const result = cateringSchema.safeParse(validPayload({ phone: "" }));
    expect(result.success).toBe(true);
  });

  it("allows notes to be omitted", () => {
    const result = cateringSchema.safeParse(validPayload({ notes: "" }));
    expect(result.success).toBe(true);
  });
});
