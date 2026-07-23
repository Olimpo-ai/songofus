import type Stripe from "stripe";
import { metadataToBriefing } from "./stripe";
import { startSongGeneration, encodeDelivery } from "./kie";
import { sendConfirmationEmail } from "./email";
import { updateOrder } from "./store";

/**
 * Confirmation email + start the Suno render. The finished song is emailed
 * later by the Kie callback (delivery details ride in the callback token).
 */
async function startDelivery(data: ReturnType<typeof metadataToBriefing>, origin: string) {
  if (process.env.RESEND_API_KEY && data.email) {
    try {
      await sendConfirmationEmail({ to: data.email, theirName: data.theirName, occasion: data.occasion });
    } catch (err) {
      console.error("confirmation email failed", err);
    }
  }
  if (!process.env.KIE_API_KEY) {
    console.warn("KIE_API_KEY not set — cannot generate song for", data.email);
    return;
  }
  const token = encodeDelivery({
    to: data.email,
    theirName: data.theirName,
    yourName: data.yourName,
    style: data.style,
    occasion: data.occasion,
    recipient: data.recipient,
  });
  const callBackUrl = `${origin}/api/kie/callback?d=${token}`;
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
  if (data.orderId) {
    try {
      await updateOrder(data.orderId, { kieTaskId: taskId });
    } catch {}
  }
  console.log("generation started for", data.email, "task", taskId);
}

/**
 * Idempotently fulfill a paid Checkout Session. Called by BOTH the success
 * page (/api/fulfill) and the Stripe webhook — whichever fires first wins,
 * the other is a no-op. Dedupe uses PaymentIntent metadata as a shared,
 * serverless-safe lock, so a customer never gets two songs.
 */
export async function fulfillCheckoutSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  origin: string
): Promise<{ status: "delivered" | "already" | "unpaid" | "skipped" }> {
  if (session.payment_status !== "paid") return { status: "unpaid" };

  const md = (session.metadata ?? {}) as Record<string, string>;
  const product = md.product ?? "song";
  if (product !== "song") return { status: "skipped" };

  // Idempotency lock via PaymentIntent metadata (survives serverless).
  const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (piId) {
    try {
      const pi = await stripe.paymentIntents.retrieve(piId);
      if (pi.metadata?.tou_fulfilled === "true") return { status: "already" };
      // claim it before doing the work so a concurrent call can't double-send
      await stripe.paymentIntents.update(piId, { metadata: { ...pi.metadata, tou_fulfilled: "true" } });
    } catch (err) {
      console.warn("idempotency check failed (continuing)", err);
    }
  }

  const data = metadataToBriefing(md);
  await startDelivery(data, origin);
  return { status: "delivered" };
}
