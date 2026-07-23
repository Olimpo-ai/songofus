import { NextRequest, NextResponse } from "next/server";
import { getStripe, briefingToMetadata } from "@/lib/stripe";
import { getOrder, updateOrder } from "@/lib/store";
import { config } from "@/lib/config";

/**
 * Creates a Stripe Checkout session.
 *  - product: "song"  → core $39 (+ optional $15 bump line item)
 *  - product: "video" → post-purchase $30 photo-video upsell
 * Apple Pay / Google Pay come free with hosted Checkout.
 * Local currency: enable Adaptive Pricing in Stripe Dashboard →
 * Settings → Checkout (no code needed) — see README.
 */
export async function POST(req: NextRequest) {
  try {
    const { orderId, bump, product } = await req.json();
    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "We couldn't find your song draft. Please fill the form again." }, { status: 404 });
    }

    const stripe = getStripe();
    const origin = req.nextUrl.origin;
    const isUpsell = product === "video";

    const lineItems: { price_data: { currency: string; product_data: { name: string; description?: string }; unit_amount: number }; quantity: number }[] = [];

    if (isUpsell) {
      lineItems.push({
        price_data: {
          currency: config.currency,
          product_data: {
            name: "Photo Video of Your Song",
            description: "Your song set to your photos — an MP4 made for posting.",
          },
          unit_amount: config.price.upsellCents,
        },
        quantity: 1,
      });
    } else {
      lineItems.push({
        price_data: {
          currency: config.currency,
          product_data: {
            name: "Personalized Song",
            description: `A studio-quality song about ${order.briefing.theirName || "them"}, delivered in 1 hour.`,
          },
          unit_amount: config.price.coreCents,
        },
        quantity: 1,
      });
      if (bump) {
        lineItems.push({
          price_data: {
            currency: config.currency,
            product_data: {
              name: "Second Version — Different Style",
              description: "Same story, a second song in another style.",
            },
            unit_amount: config.price.bumpCents,
          },
          quantity: 1,
        });
      }
      await updateOrder(orderId, { bump: !!bump });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: order.briefing.email,
      success_url: isUpsell
        ? `${origin}/thanks?oid=${orderId}&video=added`
        : `${origin}/thanks?oid=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: isUpsell ? `${origin}/thanks?oid=${orderId}` : `${origin}/review?oid=${orderId}`,
      metadata: {
        ...briefingToMetadata(orderId, order.briefing, order.utm, !!bump),
        product: isUpsell ? "video" : "song",
      },
      payment_intent_data: {
        description: isUpsell ? "TuneOfUs — photo video upsell" : "TuneOfUs — personalized song",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout error", err);
    return NextResponse.json({ error: "Checkout is having a moment. Please try again." }, { status: 500 });
  }
}
