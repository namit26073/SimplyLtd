import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { franchisingEnquiry } from "../../server/enquiries/franchising";
import type { EnquiryEnv } from "../../server/enquiry";

// On-demand route: runs in the Cloudflare Worker, never prerendered.
// Secrets arrive via the Workers runtime env (Astro 6 dropped locals.runtime.env).
export const prerender = false;

export const POST: APIRoute = ({ request }) => franchisingEnquiry(request, env as EnquiryEnv);
