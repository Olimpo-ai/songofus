import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

/**
 * Personalized share card (1200×630) — what WhatsApp/Instagram/Facebook show
 * when the song link is shared. Feels like a wrapped gift, not an ad.
 *   /api/og?n=Maria&y=Vitor&o=Anniversary
 */
export const runtime = "edge";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const name = (q.get("n") || "you").slice(0, 32);
  const from = (q.get("y") || "").slice(0, 32);
  const occ = (q.get("o") || "").slice(0, 40);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #8a0f33 0%, #3c0416 55%, #a02050 100%)",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* soft glow */}
        <div
          style={{
            position: "absolute",
            top: "-160px",
            width: "700px",
            height: "700px",
            borderRadius: "9999px",
            background: "radial-gradient(circle, rgba(230,185,63,0.35) 0%, rgba(230,185,63,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            fontSize: "22px",
            letterSpacing: "6px",
            textTransform: "uppercase",
            color: "#e6b93f",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 700,
            marginBottom: "18px",
            display: "flex",
          }}
        >
          {occ ? `${occ} · A gift for you` : "A gift for you"}
        </div>
        <div
          style={{
            fontSize: "56px",
            color: "#fdf8f0",
            opacity: 0.85,
            marginBottom: "6px",
            display: "flex",
          }}
        >
          A song for
        </div>
        <div
          style={{
            fontSize: "150px",
            color: "#fdf8f0",
            fontWeight: 700,
            lineHeight: 1,
            textAlign: "center",
            padding: "0 60px",
            display: "flex",
          }}
        >
          {name}
        </div>
        {from ? (
          <div
            style={{
              fontSize: "40px",
              color: "#f5a3b1",
              marginTop: "22px",
              display: "flex",
            }}
          >
            from {from}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "44px",
            fontSize: "30px",
            color: "#fdf8f0",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 700,
          }}
        >
          <span style={{ display: "flex", color: "#e6b93f" }}>♪</span>
          <span style={{ display: "flex" }}>Press play — it&apos;s all yours</span>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "38px",
            fontSize: "26px",
            letterSpacing: "1px",
            color: "#f5a3b1",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 700,
            display: "flex",
          }}
        >
          TuneOfUs
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
