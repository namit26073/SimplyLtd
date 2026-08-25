import { franchisingSchema, type FranchisingPayload } from "../../schemas/franchising";
import { escapeHtml, handleEnquiry, paragraphs, type EnquiryEnv } from "../enquiry";

/** Franchising enquiry pipeline — pure function of (request, env) so tests can drive it. */
export function franchisingEnquiry(request: Request, env: EnquiryEnv): Promise<Response> {
  return handleEnquiry<FranchisingPayload>({
    request,
    env,
    tag: "franchising",
    schema: franchisingSchema,
    destination: (e) => e.FRANCHISE_EMAIL,
    subject: (d) => `New franchising enquiry — ${d.regionInterest}`,
    html: renderEnquiryHtml,
    redact: (d) => ({
      region: d.regionInterest,
      investmentRange: d.investmentRange,
      timeline: d.timeline,
      hasBackground: Boolean(d.background),
    }),
  });
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
    ${data.background ? `<h2>Background</h2><p>${paragraphs(data.background)}</p>` : ""}
  `;
}
