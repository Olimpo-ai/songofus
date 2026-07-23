import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { fulfillCheckoutSession } from "@/lib/fulfill";

/**
 * Stripe webhook → checkout.session.completed → fulfill the order
 * (confirmation email + start the song; delivery email on render).
 *
 * This is the reliable, server-to-server trigger. The /thanks success page
 * calls the same fulfillment path (/api/fulfill) so delivery still works
 * even without a webhook configured — and idempotency keeps them from
 * double-sending.
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    try {
      const session = event.data.object;
      const result = await fulfillCheckoutSession(stripe, session, req.nextUrl.origin);
      console.log("webhook fulfill:", result.status, session.id);
    } catch (err) {
      console.error("webhook fulfillment failed", err);
      // Non-200 → Stripe retries the event later.
      return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
