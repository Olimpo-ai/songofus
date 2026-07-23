import { NextRequest, NextResponse } from "next/server";
import { getOrder, updateOrder } from "@/lib/store";
import { startSongGeneration, getSongTask } from "@/lib/kie";

/**
 * Direct song generation via Kie (Suno) — the no-n8n pipeline and the
 * test harness.
 *
 *   POST { orderId }     → starts generation, returns { taskId }
 *   GET  ?taskId=…       → { status, tracks[] } (poll until SUCCESS)
 *
 * Guarded: POST only works for orders that exist; in production the
 * webhook triggers this automatically after payment.
 */
export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    const order = await getOrder(orderId);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const callBackUrl = `${req.nextUrl.origin}/api/kie/callback`;
    const taskId = await startSongGeneration(order.briefing, callBackUrl);
    await updateOrder(orderId, { kieTaskId: taskId });
    return NextResponse.json({ taskId });
  } catch (err) {
    console.error("generate-song error", err);
    return NextResponse.json({ error: "Song generation could not start. Check KIE_API_KEY." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
  try {
    const task = await getSongTask(taskId);
    return NextResponse.json(task);
  } catch (err) {
    console.error("generate-song status error", err);
    return NextResponse.json({ error: "Could not fetch task status" }, { status: 500 });
  }
}
