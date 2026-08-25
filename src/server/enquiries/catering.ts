import { cateringSchema, type CateringPayload } from "../../schemas/catering";
import { escapeHtml, handleEnquiry, paragraphs, type EnquiryEnv } from "../enquiry";

/** Catering enquiry pipeline — pure function of (request, env) so tests can drive it. */
export function cateringEnquiry(request: Request, env: EnquiryEnv): Promise<Response> {
  return handleEnquiry<CateringPayload>({
    request,
    env,
    tag: "catering",
    schema: cateringSchema,
    destination: (e) => e.CATERING_EMAIL,
    subject: (d) => `New catering enquiry — ${d.eventType} for ${d.guestCount} guests`,
    html: renderEnquiryHtml,
    redact: (d) => ({
      eventType: d.eventType,
      guestCount: d.guestCount,
      flexibleDate: d.flexibleDate,
      hasPhone: Boolean(d.phone),
      hasNotes: Boolean(d.notes),
    }),
  });
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
    ${data.notes ? `<h2>Notes</h2><p>${paragraphs(data.notes)}</p>` : ""}
  `;
}
