"use client";

import { config } from "./config";

/**
 * Browser-side Meta Pixel helpers (targeting `config.metaBrowserPixelId`).
 *
 * Fires ViewContent, Lead, InitiateCheckout, and Purchase (on /thanks after
 * server verification), plus custom funnel signals. Server-side CAPI
 * (lib/meta-capi.ts) continues sending Purchase to `config.metaPixelId`.
 *
 * No GTM, no dataLayer, no third-party wrapper: just fbq.
 */
declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[] };
  }
}

/** content_ids is a stable SKU — it never changes with price. */
export const META_PRODUCT = {
  content_ids: ["tou_song_19"],
  content_type: "product",
  content_name: "Personalized Love Song",
  value: config.price.core,
  currency: "USD",
} as const;

function fbq(...args: unknown[]) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq(...args);
}

/* ------------------------------------------------------------------ *
 * Attribution cookies
 * ------------------------------------------------------------------ */

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * The Meta click id cookie. If the pixel hasn't written `_fbc` yet but the
 * landing URL carries `fbclid`, build it ourselves in Meta's documented
 * format (fb.1.<timestamp>.<fbclid>) and persist it, so a click that
 * converts on the first pageview still gets attributed.
 */
export function ensureFbc(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const existing = readCookie("_fbc");
  if (existing) return existing;

  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  if (!fbclid) return undefined;

  const value = `fb.1.${Date.now()}.${fbclid}`;
  try {
    // 90 days, matching Meta's own _fbc lifetime.
    const maxAge = 90 * 24 * 60 * 60;
    document.cookie = `_fbc=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
  } catch {
    /* cookies blocked — still return the value for this request */
  }
  return value;
}

/** Browser identifiers to hand to the server for the CAPI event. */
export function getFbCookies(): { fbp?: string; fbc?: string } {
  return { fbp: readCookie("_fbp"), fbc: ensureFbc() };
}

/* ------------------------------------------------------------------ *
 * Advanced matching
 * ------------------------------------------------------------------ */

let advancedMatchingApplied = false;

/**
 * Re-init the pixel with the buyer's email so Meta can match the user.
 * fbq hashes it internally — the raw address never leaves in a payload we
 * build. Re-calling init only updates matching data; it does NOT emit a
 * second PageView (PageView only fires on an explicit track call).
 */
export function applyAdvancedMatching(email?: string | null) {
  const pixelId = config.metaBrowserPixelId;
  const normalized = (email ?? "").trim().toLowerCase();
  if (!pixelId || !normalized || advancedMatchingApplied) return;
  advancedMatchingApplied = true;
  fbq("init", pixelId, { em: normalized });
}

/* ------------------------------------------------------------------ *
 * Events
 * ------------------------------------------------------------------ */

let viewContentSent = false;

/** Landing page product view — once per page session, never on re-render. */
export function trackViewContent() {
  if (viewContentSent) return;
  viewContentSent = true;
  fbq("track", "ViewContent", { ...META_PRODUCT });
}

/**
 * Fired when the buyer submits their song brief in the wizard.
 * Browser-only: the server CAPI currently uses a separate pixel/token.
 */
export function trackLead(eventId: string) {
  fbq(
    "track",
    "Lead",
    { content_name: "Song brief", content_category: "love_song" },
    { eventID: eventId }
  );
}

/**
 * Fired in the buy-button handler, immediately before creating the Stripe
 * session. The returned event_id is persisted in the session metadata and
 * reused by both browser Purchase (/thanks) and server-side CAPI Purchase.
 */
export function trackInitiateCheckout(eventId: string, value: number = META_PRODUCT.value) {
  fbq(
    "track",
    "InitiateCheckout",
    { ...META_PRODUCT, value },
    { eventID: eventId }
  );
}

const purchaseClaimedSessions = new Set<string>();

export interface PurchaseParams {
  eventId: string;
  value: number;
  currency: string;
  sessionId: string;
}

/**
 * Fired on /thanks once per checkout session after verifying payment via
 * GET /api/purchase-info. Guarded by a module-level Set (marked before any
 * retry to defeat StrictMode/re-renders) and localStorage (written after
 * fbq actually fires). Retries briefly if `window.fbq` hasn't loaded yet.
 */
export function trackPurchase({ eventId, value, currency, sessionId }: PurchaseParams) {
  if (typeof window === "undefined" || !eventId || !sessionId) return;
  if (purchaseClaimedSessions.has(sessionId)) return;

  const storageKey = `tou_purchase_pixel_${sessionId}`;
  try {
    if (localStorage.getItem(storageKey)) {
      purchaseClaimedSessions.add(sessionId);
      return;
    }
  } catch {}

  // Mark module guard before any async retry so re-renders / StrictMode never double-schedule.
  purchaseClaimedSessions.add(sessionId);

  const fire = (attempt: number) => {
    if (typeof window === "undefined") return;
    if (typeof window.fbq === "function") {
      try {
        window.fbq(
          "track",
          "Purchase",
          {
            content_ids: ["tou_song_19"],
            content_type: "product",
            content_name: "Personalized Love Song",
            value,
            currency,
          },
          { eventID: eventId }
        );
      } catch {
        return;
      }
      try {
        localStorage.setItem(storageKey, "1");
      } catch {}
      return;
    }
    if (attempt >= 10) return;
    window.setTimeout(() => fire(attempt + 1), 500);
  };

  fire(0);
}

/** Funnel-progress signals (custom events, no standard-event mapping). */
export const events = {
  startForm: () => fbq("trackCustom", "StartForm"),
  completeStep: (step: number, stepName: string) =>
    fbq("trackCustom", "CompleteStep", { step, step_name: stepName }),
};
