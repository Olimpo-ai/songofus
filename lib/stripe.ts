import Stripe from "stripe";
import type { Briefing } from "./types";
import type { UtmData } from "./utm";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { apiVersion: "2024-06-20" });
  }
  return _stripe;
}

/**
 * Stripe metadata values max out at 500 chars, so the story is chunked.
 * This makes the webhook self-sufficient: even if the local order store
 * is gone (serverless instance rotation), the full briefing can be
 * reconstructed from the session metadata alone.
 */
export function briefingToMetadata(orderId: string, briefing: Briefing, utm: UtmData, bump: boolean) {
  const md: Record<string, string> = {
    order_id: orderId,
    recipient: briefing.recipient.slice(0, 490),
    occasion: briefing.occasion.slice(0, 490),
    their_name: briefing.theirName.slice(0, 490),
    your_name: briefing.yourName.slice(0, 490),
    style: briefing.style,
    mood: briefing.mood,
    voice: briefing.voice ?? "",
    customer_email: briefing.email.slice(0, 490),
    customer_phone: (briefing.phone ?? "").slice(0, 490),
    bump: bump ? "yes" : "no",
  };
  // Story: up to 8 chunks × 490 chars = ~3,900 chars kept verbatim.
  const story = briefing.story.slice(0, 3920);
  for (let i = 0; i * 490 < story.length && i < 8; i++) {
    md[`story_${i + 1}`] = story.slice(i * 490, (i + 1) * 490);
  }
  for (const [k, v] of Object.entries(utm)) {
    if (v) md[`utm_${k}`.slice(0, 40)] = String(v).slice(0, 490);
  }
  return md;
}

export function metadataToBriefing(md: Record<string, string>): Briefing & { orderId: string; bump: boolean; utm: Record<string, string> } {
  let story = "";
  for (let i = 1; i <= 8; i++) {
    story += md[`story_${i}`] ?? "";
  }
  const utm: Record<string, string> = {};
  for (const [k, v] of Object.entries(md)) {
    if (k.startsWith("utm_")) utm[k.replace(/^utm_/, "")] = v;
  }
  return {
    orderId: md.order_id ?? "",
    recipient: md.recipient ?? "",
    occasion: md.occasion ?? "",
    theirName: md.their_name ?? "",
    yourName: md.your_name ?? "",
    story,
    style: md.style ?? "",
    mood: md.mood ?? "",
    voice: md.voice || undefined,
    email: md.customer_email ?? "",
    phone: md.customer_phone || undefined,
    bump: md.bump === "yes",
    utm,
  };
}
