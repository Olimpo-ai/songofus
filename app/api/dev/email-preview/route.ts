import { NextRequest, NextResponse } from "next/server";
import { renderSongEmail } from "@/lib/email";

/** Dev-only visual preview of the delivery email. Blocked in production. */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not available" }, { status: 404 });
  }
  const q = req.nextUrl.searchParams;
  const { html } = renderSongEmail({
    to: "preview@tuneofus.com",
    theirName: q.get("theirName") || "Maria",
    yourName: q.get("yourName") || "Vitor",
    style: q.get("style") || "Acoustic",
    occasion: q.get("occasion") || "Anniversary",
    recipient: q.get("recipient") || "Partner",
    tracks: [
      { title: "Charger at the Cafe", audioUrl: "#" },
      { title: "Charger at the Cafe", audioUrl: "#" },
    ],
  });
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
