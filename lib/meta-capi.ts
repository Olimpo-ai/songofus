import crypto from "crypto";
import { config } from "./config";

/**
 * Meta Conversions API — server-side Purchase.
 *
 * Purchase is sent ONLY from here (never from the browser), so iOS users
 * with tracking denied still get attributed. The browser fires
 * InitiateCheckout with an event_id that we persist in the Stripe session
 * metadata and reuse here, so browser and server events share one id.
 *
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

/** Single source of truth for the Graph API version. */
export const GRAPH_API_VERSION = "v25.0";

/** The one product this store sells. */
export const META_PRODUCT = {
  contentIds: ["tou_song_19"],
  contentType: "product",
  contentName: "Personalized Love Song",
  value: 19.0,
  currency: "USD",
} as const;

/** Stripe caps metadata values at 500 chars. */
export const METADATA_VALUE_LIMIT = 500;

/**
 * Truncate a metadata value, logging loudly when it happens so a silently
 * clipped user agent never goes unnoticed.
 */
export function capMetadataValue(field: string, value: string): string {
  if (value.length <= METADATA_VALUE_LIMIT) return value;
  console.warn(
    `[meta] metadata field "${field}" exceeded ${METADATA_VALUE_LIMIT} chars (${value.length}) and was truncated`
  );
  return value.slice(0, METADATA_VALUE_LIMIT);
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

/** Meta requires email lowercased and trimmed *before* hashing. */
export function hashEmail(email?: string | null): string | undefined {
  const normalized = (email ?? "").trim().toLowerCase();
  if (!normalized) return undefined;
  return sha256(normalized);
}

export interface PurchaseEvent {
  /** Shared with the browser InitiateCheckout; also our dedup/resend key. */
  eventId: string;
  email?: string;
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  eventSourceUrl?: string;
  /** Unix seconds. Defaults to now. */
  eventTime?: number;
  value?: number;
  currency?: string;
}

export interface CapiResult {
  ok: boolean;
  status?: number;
  error?: string;
  eventsReceived?: number;
}

/**
 * Send a Purchase to the Conversions API.
 *
 * Never throws — callers must not have order processing die because Meta
 * is unreachable. On failure it returns { ok:false } and the caller logs a
 * structured line with the event_id for manual resend (see TRACKING.md).
 */
export async function sendPurchaseEvent(event: PurchaseEvent): Promise<CapiResult> {
  const pixelId = config.metaPixelId;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token) return { ok: false, error: "META_CAPI_ACCESS_TOKEN is not set" };

  const userData: Record<string, unknown> = {};
  const hashedEmail = hashEmail(event.email);
  if (hashedEmail) userData.em = [hashedEmail]; // hashed
  // These four are sent in plain text, per Meta's spec.
  if (event.clientIpAddress) userData.client_ip_address = event.clientIpAddress;
  if (event.clientUserAgent) userData.client_user_agent = event.clientUserAgent;
  if (event.fbp) userData.fbp = event.fbp;
  if (event.fbc) userData.fbc = event.fbc;

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: "Purchase",
        event_time: event.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        action_source: "website",
        event_source_url: event.eventSourceUrl ?? "https://www.tuneofus.com/",
        user_data: userData,
        custom_data: {
          value: event.value ?? META_PRODUCT.value,
          currency: event.currency ?? META_PRODUCT.currency,
          content_ids: META_PRODUCT.contentIds,
          content_type: META_PRODUCT.contentType,
          content_name: META_PRODUCT.contentName,
        },
      },
    ],
  };

  // Routes the event to Events Manager → Test Events instead of production.
  const testCode = process.env.META_CAPI_TEST_EVENT_CODE;
  if (testCode) payload.test_event_code = testCode;

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await res.json().catch(() => ({}))) as {
      events_received?: number;
      error?: { message?: string };
    };
    if (!res.ok) {
      return { ok: false, status: res.status, error: body?.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, status: res.status, eventsReceived: body?.events_received };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network error" };
  }
}
