import { NextRequest, NextResponse } from "next/server";
import { getStripe, metadataToBriefing } from "@/lib/stripe";
import { updateOrder } from "@/lib/store";
import { startSongGeneration } from "@/lib/kie";

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

    // Server-side Purchase event data + full briefing → automation
    const automationUrl = process.env.AUTOMATION_WEBHOOK_URL;
    if (automationUrl) {
      const payload = {
        event: "purchase",
        product, // "song" | "video"
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
        const res = await fetch(automationUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          console.error("automation webhook returned", res.status);
          // Non-200 → tell Stripe to retry the whole event later.
          return NextResponse.json({ error: "Automation handoff failed" }, { status: 500 });
        }
      } catch (err) {
        console.error("automation webhook unreachable", err);
        return NextResponse.json({ error: "Automation handoff failed" }, { status: 500 });
      }
    } else if (process.env.KIE_API_KEY && product === "song") {
      // No n8n configured — generate directly via Kie (Suno).
      // Delivery email/SMS still needs your automation; the callback
      // route logs the finished track URLs.
      try {
        const callBackUrl = `${req.nextUrl.origin}/api/kie/callback`;
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
        console.log("kie generation started for order", data.orderId, "task", taskId);
      } catch (err) {
        console.error("direct kie generation failed", err);
        return NextResponse.json({ error: "Song generation failed to start" }, { status: 500 });
      }
    } else {
      console.warn("No AUTOMATION_WEBHOOK_URL or KIE_API_KEY — order paid but not handed off:", data.orderId);
    }
  }

  return NextResponse.json({ received: true });
}
