import { useEffect, useRef } from "react";

/**
 * Cloudflare Turnstile widget for the enquiry forms.
 *
 * Renders explicitly (not via the implicit `.cf-turnstile` auto-scan) so it
 * survives ClientRouter navigations, where a page's `<script src>` tags are
 * deduplicated and the auto-scan would never re-run. Without a site key
 * (local dev, previews before keys exist) nothing renders and the token
 * falls back to the `dev-bypass` sentinel the server accepts only when it has
 * no TURNSTILE_SECRET_KEY.
 */

interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  getResponse(widgetId?: string): string | undefined;
  reset(widgetId?: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () =>
        window.turnstile
          ? resolve(window.turnstile)
          : reject(new Error("Turnstile API missing after load"));
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Turnstile script failed to load"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export function useTurnstile(siteKey: string | undefined) {
  const ref = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !ref.current) return;
    let cancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !ref.current || widgetId.current) return;
        widgetId.current = turnstile.render(ref.current, {
          sitekey: siteKey,
          theme: "light",
          size: "flexible",
        });
      })
      .catch((error: unknown) => console.warn("[turnstile]", error));

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey]);

  const getToken = (): string => {
    if (!siteKey) return "dev-bypass";
    if (!widgetId.current || !window.turnstile) return "";
    return window.turnstile.getResponse(widgetId.current) ?? "";
  };

  const reset = (): void => {
    if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
  };

  return { ref, getToken, reset };
}
