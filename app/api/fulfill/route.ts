import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { fulfillCheckoutSession } from "@/lib/fulfill";

/**
 * Webhook-free fulfillment. The /thanks success page calls this with the
 * Checkout Session id from Stripe's redirect. We verify the session is
 * actually paid (server-side, with the secret key), then send the
 * confirmation email and start the song — idempotently. Works in test and
 * live mode with only the Stripe Secret key; no webhook required.
 *
 * The Stripe webhook (if configured) calls the same fulfillment path, so
 * the two never double up.
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const result = await fulfillCheckoutSession(stripe, session, req.nextUrl.origin);
    return NextResponse.json(result);
  } catch (err) {
    console.error("fulfill error", err);
    return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
  }
}
