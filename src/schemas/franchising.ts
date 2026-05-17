import { z } from "zod";

export const INVESTMENT_RANGES = [
  "under-50k",
  "50k-100k",
  "100k-250k",
  "250k-plus",
  "unsure",
] as const;
export type InvestmentRange = (typeof INVESTMENT_RANGES)[number];

export const INVESTMENT_LABELS: Record<InvestmentRange, string> = {
  "under-50k": "Under £50k",
  "50k-100k": "£50k – £100k",
  "100k-250k": "£100k – £250k",
  "250k-plus": "£250k+",
  unsure: "Not sure yet",
};

export const TIMELINES = ["now", "3-6mo", "6-12mo", "12mo-plus"] as const;
export type Timeline = (typeof TIMELINES)[number];

export const TIMELINE_LABELS: Record<Timeline, string> = {
  now: "Now / next 3 months",
  "3-6mo": "3 – 6 months",
  "6-12mo": "6 – 12 months",
  "12mo-plus": "12+ months",
};

/**
 * Franchising enquiry payload. Higher-intent than catering — required
 * fields filter low-intent visitors. See .claude/rules/forms.md.
 */
export const franchisingSchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name.").max(200),
  email: z.email("Please use an email address we can reply to."),
  phone: z.string().trim().min(7, "We'll need a phone number for franchising.").max(40),
  regionInterest: z
    .string()
    .trim()
    .min(1, "Where are you looking to operate?")
    .max(200),
  investmentRange: z.enum(INVESTMENT_RANGES, "Please pick a rough investment range."),
  timeline: z.enum(TIMELINES, "When would you like to launch?"),
  background: z.string().trim().max(4000).optional().or(z.literal("")),
  turnstileToken: z.string().min(1, "Spam check failed — please try again."),
  botField: z.string().max(0, "").default(""),
});

export type FranchisingPayload = z.infer<typeof franchisingSchema>;
export type FranchisingFormInput = Omit<FranchisingPayload, "turnstileToken" | "botField">;
