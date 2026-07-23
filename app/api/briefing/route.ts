import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrder } from "@/lib/store";
import type { Briefing } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const briefing = body.briefing as Briefing;
    if (!briefing?.email || !briefing?.recipient || !briefing?.story) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const order = await createOrder(briefing, body.utm ?? {});
    return NextResponse.json({ orderId: order.id });
  } catch {
    return NextResponse.json({ error: "Could not save your answers. Please try again." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Only return what the client needs for review/recap — never the full record.
  const { briefing, status, bump } = order;
  return NextResponse.json({
    status,
    bump,
    briefing: {
      recipient: briefing.recipient,
      occasion: briefing.occasion,
      theirName: briefing.theirName,
      yourName: briefing.yourName,
      style: briefing.style,
      mood: briefing.mood,
    },
  });
}
