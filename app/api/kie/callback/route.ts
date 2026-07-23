import { NextRequest, NextResponse } from "next/server";

/**
 * Kie.ai calls this when a song finishes rendering. Payload includes the
 * taskId and track data (audio URLs). We log and ACK; delivery is
 * handled by your n8n automation or by polling /api/generate-song.
 * Extend here when you want the site itself to email the customer.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("kie callback:", JSON.stringify(body).slice(0, 2000));
  } catch {
    /* non-JSON ping — fine */
  }
  return NextResponse.json({ received: true });
}
