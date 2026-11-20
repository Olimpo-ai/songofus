import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns minimal verified purchase data for the browser Purchase pixel event
 * on /thanks. Never returns PII (email, names, etc.) — only eventId, value,
 * and currency when the Stripe Checkout Session is paid and carries fb_event_id.
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id")?.trim();
  if (!sessionId) {
    return NextResponse.json({}, { status: 404 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const eventId = session.metadata?.fb_event_id?.trim();

    if (
      session.payment_status !== "paid" ||
      !eventId ||
      typeof session.amount_total !== "number" ||
      !session.currency
    ) {
      return NextResponse.json({}, { status: 404 });
    }

    return NextResponse.json({
      eventId,
      value: session.amount_total / 100,
      currency: session.currency.toUpperCase(),
    });
  } catch (err) {
    const statusCode =
      typeof err === "object" && err !== null && "statusCode" in err
        ? (err as { statusCode?: number }).statusCode
        : undefined;
    const status = statusCode === 404 || statusCode === 400 ? 404 : 500;
    return NextResponse.json({}, { status });
  }
}
