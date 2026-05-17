import { z } from "zod";

export const EVENT_TYPES = ["wedding", "corporate", "festival", "private", "other"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

/**
 * Catering enquiry payload — shared between the React island (client-side
 * validation) and the Cloudflare Pages Function (server-side validation).
 *
 * `botField` is a honeypot: a hidden input that legitimate users never see.
 * Validation accepts empty string only; the function rejects any non-empty
 * value as spam.
 */
export const cateringSchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name.").max(200),
  email: z.email("Please use an email address we can reply to."),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("")),
  eventDate: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("")),
  flexibleDate: z.boolean().default(false),
  eventType: z.enum(EVENT_TYPES, "Please pick the kind of event."),
  guestCount: z.coerce
    .number()
    .int("Guest count needs to be a whole number.")
    .min(10, "We cater for 10 guests and up.")
    .max(10000, "Please give us a call for events that big."),
  eventLocation: z
    .string()
    .trim()
    .min(1, "Where's the event?")
    .max(200),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  turnstileToken: z.string().min(1, "Spam check failed — please try again."),
  botField: z.string().max(0, "").default(""),
}).refine(
  (data) => data.flexibleDate || (data.eventDate && data.eventDate.length > 0),
  {
    message: "Pick a date or tick \"flexible\".",
    path: ["eventDate"],
  },
);

export type CateringPayload = z.infer<typeof cateringSchema>;

/**
 * The shape the form sends — turnstileToken is added by the Turnstile widget
 * just before submit, and the bot field is sent invisibly. The rest matches
 * the user's input fields.
 */
export type CateringFormInput = Omit<CateringPayload, "turnstileToken" | "botField">;
