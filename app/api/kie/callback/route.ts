import { NextRequest, NextResponse } from "next/server";
import { decodeDelivery, getSongTask } from "@/lib/kie";
import { sendSongEmail } from "@/lib/email";

/**
 * Kie.ai calls this when a song render advances. On the terminal
 * (complete) event we email the finished song to the buyer.
 *
 * Delivery details ride in on the `?d=` token (base64url), packed by the
 * Stripe webhook — so this works with zero database, even though the
 * callback lands on a fresh serverless instance.
 *
 * We only send once we can pull real audio URLs (status SUCCESS), which
 * naturally fires on the completion callback rather than the early
 * "text"/"first" stages.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* non-JSON ping — fine */
  }
  console.log("kie callback:", JSON.stringify(body).slice(0, 800));

  const delivery = decodeDelivery(req.nextUrl.searchParams.get("d"));

  // Pull the taskId from whatever shape Kie sends, then fetch clean tracks.
  const dataObj = (body.data ?? body) as Record<string, unknown>;
  const taskId =
    (dataObj.taskId as string) ||
    (dataObj.task_id as string) ||
    (body.taskId as string) ||
    "";

  if (!delivery?.to || !taskId) {
    // Not enough to deliver (early-stage ping or missing token) — ack and wait.
    return NextResponse.json({ received: true });
  }

  try {
    const task = await getSongTask(taskId);
    const tracks = task.tracks
      .filter((t) => t.audioUrl)
      .map((t) => ({ title: t.title, audioUrl: t.audioUrl! }));

    if (task.status === "SUCCESS" && tracks.length > 0 && process.env.RESEND_API_KEY) {
      await sendSongEmail({
        to: delivery.to,
        theirName: delivery.theirName,
        yourName: delivery.yourName,
        style: delivery.style,
        tracks,
      });
      console.log("song delivered to", delivery.to, "task", taskId);
    }
  } catch (err) {
    console.error("song delivery failed", err);
    // Return 500 so Kie retries the callback later (delivery is important).
    return NextResponse.json({ error: "delivery failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
