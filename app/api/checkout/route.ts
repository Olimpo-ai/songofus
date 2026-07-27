import { NextRequest, NextResponse } from "next/server";
import { getStripe, briefingToMetadata } from "@/lib/stripe";
import { getOrder, updateOrder } from "@/lib/store";
import { config } from "@/lib/config";
import { capMetadataValue } from "@/lib/meta-capi";

/**
 * Creates a Stripe Checkout session for the one thing we can actually
 * deliver: the personalized song.
 *
 * The photo-video upsell is DISABLED — there is no production process for
 * it, and fulfillment skips any non-"song" product, so a purchase would
 * take money and deliver nothing. Re-enable only alongside real
 * fulfillment (see lib/fulfill.ts).
 *
 * Apple Pay / Google Pay come free with hosted Checkout. Local currency:
 * enable Adaptive Pricing in Stripe Dashboard → Settings → Checkout.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, product } = body;

    if (product && product !== "song") {
      return NextResponse.json({ error: "That product isn't available." }, { status: 400 });
    }

    /**
     * Meta attribution, captured here and replayed by the server-side
     * Purchase (lib/meta-capi.ts). The client sends the event_id it used
     * for InitiateCheckout plus its _fbp/_fbc cookies; the IP and UA must
     * come from the request itself, not from the browser payload.
     */
    const forwardedFor = req.headers.get("x-forwarded-for") ?? "";
    const clientIp = forwardedFor.split(",")[0]?.trim() ?? "";
    const clientUserAgent = req.headers.get("user-agent") ?? "";
    const metaMetadata: Record<string, string> = {};
    if (typeof body.eventId === "string" && body.eventId) metaMetadata.fb_event_id = body.eventId;
    if (typeof body.fbp === "string" && body.fbp) metaMetadata.fb_fbp = capMetadataValue("fb_fbp", body.fbp);
    if (typeof body.fbc === "string" && body.fbc) metaMetadata.fb_fbc = capMetadataValue("fb_fbc", body.fbc);
    if (clientIp) metaMetadata.fb_client_ip = capMetadataValue("fb_client_ip", clientIp);
    if (clientUserAgent) metaMetadata.fb_client_ua = capMetadataValue("fb_client_ua", clientUserAgent);
    // Store lookup is best-effort (serverless FS is ephemeral) — the
    // client sends its own copy of the briefing as the source of truth.
    const order = await getOrder(orderId).catch(() => null);
    const briefing = order?.briefing ?? body.briefing;
    const utm = order?.utm ?? body.utm ?? {};
    if (!briefing?.email || !briefing?.recipient) {
      return NextResponse.json({ error: "We couldn't find your song draft. Please fill the form again." }, { status: 404 });
    }

    const stripe = getStripe();
    const origin = req.nextUrl.origin;

    const lineItems = [
      {
        price_data: {
          currency: config.currency,
          product_data: {
            name: "Personalized Song",
            description: `A studio-quality song about ${briefing.theirName || "them"}, delivered in minutes.`,
          },
          unit_amount: config.price.coreCents,
        },
        quantity: 1,
      },
    ];
    await updateOrder(orderId, { bump: false });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: briefing.email,
      success_url: `${origin}/thanks?oid=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/review?oid=${orderId}`,
      metadata: {
        ...briefingToMetadata(orderId, briefing, utm, false),
        ...metaMetadata,
        product: "song",
      },
      payment_intent_data: {
        description: "TuneOfUs — personalized song",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout error", err);
    return NextResponse.json({ error: "Checkout is having a moment. Please try again." }, { status: 500 });
  }
}
