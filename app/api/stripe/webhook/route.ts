import { NextRequest, NextResponse } from "next/server";
import { getStripe, metadataToBriefing } from "@/lib/stripe";
import { updateOrder } from "@/lib/store";
import { startSongGeneration, encodeDelivery } from "@/lib/kie";
import { sendConfirmationEmail } from "@/lib/email";

/**
 * Stripe → checkout.session.completed → mark order paid → hand off the
 * full briefing to your automation (n8n → lyrics → Suno/Kie → delivery).
 * The site never generates the song; it just passes the baton.
 *
 * The briefing is reconstructed from session metadata, so this works
 * even on serverless where the JSON store may not be shared.
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
    const session = event.data.object;
    const md = (session.metadata ?? {}) as Record<string, string>;
    const data = metadataToBriefing(md);
    const product = md.product ?? "song";

    // Best-effort local record (fine if the store is unavailable on serverless)
    try {
      if (data.orderId) {
        await updateOrder(data.orderId, {
          status: "paid",
          stripeSessionId: session.id,
          amountTotal: session.amount_total ?? undefined,
          currency: session.currency ?? undefined,
          paidAt: new Date().toISOString(),
          ...(product === "video" ? { upsell: true } : {}),
        });
      }
    } catch (err) {
      console.warn("local order update skipped", err);
    }

    // 1) Confirmation email — ALWAYS for song orders, so the buyer is never
    //    left wondering (fires no matter which delivery path runs).
    if (product === "song" && process.env.RESEND_API_KEY && data.email) {
      try {
        await sendConfirmationEmail({ to: data.email, theirName: data.theirName, occasion: data.occasion });
      } catch (err) {
        console.error("confirmation email failed", err);
      }
    }

    // 2) Primary delivery: the site generates (Kie/Suno) and later emails the
    //    finished song via the callback (Resend). This is the main path.
    let generationStarted = false;
    if (process.env.KIE_API_KEY && product === "song") {
      try {
        const token = encodeDelivery({
          to: data.email,
          theirName: data.theirName,
          yourName: data.yourName,
          style: data.style,
          occasion: data.occasion,
          recipient: data.recipient,
        });
        const callBackUrl = `${req.nextUrl.origin}/api/kie/callback?d=${token}`;
        const taskId = await startSongGeneration(
          {
            recipient: data.recipient,
            occasion: data.occasion,
            theirName: data.theirName,
            yourName: data.yourName,
            story: data.story,
            style: data.style,
            mood: data.mood,
            voice: data.voice,
            email: data.email,
            phone: data.phone,
          },
          callBackUrl
        );
        if (data.orderId) await updateOrder(data.orderId, { kieTaskId: taskId });
        generationStarted = true;
        console.log("kie generation started for order", data.orderId, "task", taskId);
      } catch (err) {
        console.error("direct kie generation failed", err);
        return NextResponse.json({ error: "Song generation failed to start" }, { status: 500 });
      }
    }

    // 3) Optional handoff to n8n/automation — NON-blocking, never fails the
    //    webhook (so a stale AUTOMATION_WEBHOOK_URL can't stop delivery).
    const automationUrl = process.env.AUTOMATION_WEBHOOK_URL;
    if (automationUrl) {
      const payload = {
        event: "purchase",
        product,
        orderId: data.orderId,
        stripeSessionId: session.id,
        amountTotal: session.amount_total,
        currency: session.currency,
        paidAt: new Date().toISOString(),
        briefing: {
          recipient: data.recipient,
          occasion: data.occasion,
          theirName: data.theirName,
          yourName: data.yourName,
          story: data.story,
          style: data.style,
          mood: data.mood,
          voice: data.voice ?? null,
          email: data.email,
          phone: data.phone ?? null,
        },
        bump: data.bump,
        utm: data.utm,
      };
      try {
        await fetch(automationUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn("automation handoff failed (non-blocking)", err);
      }
    }

    if (product === "song" && !generationStarted && !automationUrl) {
      console.warn("No KIE_API_KEY or AUTOMATION_WEBHOOK_URL — paid but not handed off:", data.orderId);
    }
  }

  return NextResponse.json({ received: true });
}
