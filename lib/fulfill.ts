import type Stripe from "stripe";
import { metadataToBriefing } from "./stripe";
import { startSongGeneration, encodeDelivery } from "./kie";
import { sendConfirmationEmail } from "./email";
import { updateOrder } from "./store";
import { sendPurchaseEvent } from "./meta-capi";

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

/** An in-flight claim older than this is assumed dead and can be retaken. */
const CLAIM_STALE_MS = 3 * 60 * 1000;

/**
 * Server-side Purchase for Meta. Wrapped so a Meta outage can never break
 * order processing: on failure we emit one structured line carrying the
 * event_id, which is all TRACKING.md needs to resend it by hand. No PII is
 * logged — the email is only ever sent hashed, inside the payload.
 */
async function sendPurchaseToMeta(md: Record<string, string>, session: Stripe.Checkout.Session) {
  const eventId = md.fb_event_id;
  if (!eventId) {
    console.warn("[meta] no fb_event_id in session metadata; skipping Purchase", {
      session_id: session.id,
    });
    return;
  }
  try {
    const amount = typeof session.amount_total === "number" ? session.amount_total / 100 : undefined;
    const result = await sendPurchaseEvent({
      eventId,
      email: md.customer_email,
      fbp: md.fb_fbp,
      fbc: md.fb_fbc,
      clientIpAddress: md.fb_client_ip,
      clientUserAgent: md.fb_client_ua,
      eventSourceUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tuneofus.com"}/`,
      value: amount,
      currency: (session.currency ?? "usd").toUpperCase(),
    });
    if (result.ok) {
      console.log("[meta] purchase sent", { event_id: eventId, received: result.eventsReceived });
    } else {
      console.error("[meta] PURCHASE_FAILED — resend manually, see TRACKING.md", {
        event_id: eventId,
        session_id: session.id,
        status: result.status,
        error: result.error,
      });
    }
  } catch (err) {
    console.error("[meta] PURCHASE_FAILED — resend manually, see TRACKING.md", {
      event_id: eventId,
      session_id: session.id,
      error: err instanceof Error ? err.message : "unknown",
    });
  }
}

/**
 * Idempotently fulfill a paid Checkout Session. Called by BOTH the success
 * page (/api/fulfill) and the Stripe webhook — whichever fires first wins,
 * the other is a no-op.
 *
 * The lock lives in PaymentIntent metadata (shared + serverless-safe) and is
 * claimed in two phases:
 *   tou_claimed_at=<ts>  → work in progress; concurrent callers stand down
 *   tou_fulfilled=true   → delivery actually started; nobody repeats it
 * If the work throws, the claim is RELEASED so a retry can still deliver —
 * a paid order must never be marked done when nothing was sent. A claim
 * left behind by a crashed instance goes stale and is retaken.
 */
export async function fulfillCheckoutSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  origin: string
): Promise<{ status: "delivered" | "already" | "in_progress" | "unpaid" | "skipped" }> {
  if (session.payment_status !== "paid") return { status: "unpaid" };

  const md = (session.metadata ?? {}) as Record<string, string>;
  const product = md.product ?? "song";
  if (product !== "song") return { status: "skipped" };

  const piId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

  let claimed = false;
  let baseMeta: Record<string, string> = {};
  if (piId) {
    try {
      const pi = await stripe.paymentIntents.retrieve(piId);
      baseMeta = (pi.metadata ?? {}) as Record<string, string>;
      if (baseMeta.tou_fulfilled === "true") return { status: "already" };

      const claimedAt = Number(baseMeta.tou_claimed_at ?? 0);
      if (claimedAt && Date.now() - claimedAt < CLAIM_STALE_MS) {
        return { status: "in_progress" }; // another call is on it
      }

      await stripe.paymentIntents.update(piId, {
        metadata: { ...baseMeta, tou_claimed_at: String(Date.now()) },
      });
      claimed = true;
    } catch (err) {
      // Can't reach the lock — better to attempt delivery than to drop the order.
      console.warn("idempotency claim failed (continuing without lock)", err);
    }
  }

  const data = metadataToBriefing(md);
  try {
    await startDelivery(data, origin);
    // Purchase → Meta CAPI. Inside the claim, so it runs exactly once per
    // order whether the webhook or the success page got here first. Never
    // allowed to fail the order: a failure is logged for manual resend.
    await sendPurchaseToMeta(md, session);
  } catch (err) {
    // Release the claim so the webhook retry (or a refresh) can try again.
    if (claimed && piId) {
      try {
        await stripe.paymentIntents.update(piId, {
          metadata: { ...baseMeta, tou_claimed_at: "" },
        });
      } catch (releaseErr) {
        console.error("could not release fulfillment claim", releaseErr);
      }
    }
    throw err;
  }

  // Only now is it safe to say this order is done.
  if (claimed && piId) {
    try {
      await stripe.paymentIntents.update(piId, {
        metadata: { ...baseMeta, tou_claimed_at: "", tou_fulfilled: "true" },
      });
    } catch (err) {
      console.warn("could not mark fulfilled (delivery already started)", err);
    }
  }
  return { status: "delivered" };
}
