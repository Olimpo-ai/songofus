"use client";

/**
 * All client-side analytics fire into window.dataLayer (GTM) and, when
 * present, Meta Pixel via fbq(). Purchase fires server-side from the
 * Stripe webhook (see app/api/stripe/webhook) — CAPI-ready.
 */
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
  }
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  if (typeof window.fbq === "function") {
    // Map to Meta standard events where they exist
    const metaEvents: Record<string, string> = {
      ViewContent: "ViewContent",
      InitiateCheckout: "InitiateCheckout",
    };
    if (metaEvents[event]) {
      window.fbq("track", metaEvents[event], params);
    } else {
      window.fbq("trackCustom", event, params);
    }
  }
}

export const events = {
  viewContent: () => track("ViewContent", { content_name: "landing" }),
  startForm: () => track("StartForm"),
  completeStep: (n: number, name: string) =>
    track("CompleteStep", { step: n, step_name: name }),
  initiateCheckout: (value: number) =>
    track("InitiateCheckout", { value, currency: "USD" }),
};
