import { NextRequest, NextResponse } from "next/server";

/**
 * Download proxy: streams a remote MP3 back with a
 * Content-Disposition: attachment header so phones SAVE the file
 * instead of opening an in-browser player.
 *
 * Restricted to known song hosts so it can't be used as an open proxy.
 */
const ALLOWED_HOSTS = ["aiquickdraw.com", "kie.ai", "cloudfront.net"];

function safeName(name: string): string {
  const base = (name || "tuneofus-song").replace(/[^\w\-. ]+/g, "").trim() || "tuneofus-song";
  return base.toLowerCase().endsWith(".mp3") ? base : `${base}.mp3`;
}

export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u");
  const name = safeName(req.nextUrl.searchParams.get("name") || "tuneofus-song");
  if (!u || !/^https:\/\//i.test(u)) {
    return NextResponse.json({ error: "Missing or invalid url" }, { status: 400 });
  }
  let host: string;
  try {
    host = new URL(u).hostname;
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }
  if (!ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(u, { cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Song file unavailable" }, { status: 502 });
  }

  const headers = new Headers();
  headers.set("Content-Type", "audio/mpeg");
  headers.set("Content-Disposition", `attachment; filename="${name}"`);
  const len = upstream.headers.get("content-length");
  if (len) headers.set("Content-Length", len);
  headers.set("Cache-Control", "public, max-age=86400");

  return new NextResponse(upstream.body, { headers });
}
