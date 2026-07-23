"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { content } from "@/lib/content";
import { config } from "@/lib/config";
import { track } from "@/lib/analytics";

const CONFETTI_COLORS = ["#f5a3b1", "#e6b93f", "#8a0f33", "#ee5f36"];

function Confetti() {
  const [pieces, setPieces] = useState<{ left: number; delay: number; color: string }[]>([]);
  useEffect(() => {
    setPieces(
      Array.from({ length: 24 }, (_, i) => ({
        left: (i * 41) % 100,
        delay: (i % 8) * 0.18,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      }))
    );
  }, []);
  return (
    <>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, background: p.color }}
        />
      ))}
    </>
  );
}

interface Recap {
  recipient: string;
  occasion: string;
  theirName: string;
  style: string;
  mood: string;
}

export default function ThanksContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("oid");
  const sessionId = searchParams.get("session_id");
  const videoAdded = searchParams.get("video") === "added";
  const [recap, setRecap] = useState<Recap | null>(null);
  const [bump, setBump] = useState(false);
  const [upsellLoading, setUpsellLoading] = useState(false);

  // Webhook-free fulfillment: the moment the buyer lands here after paying,
  // tell the server to verify the payment and start the song. Guarded so a
  // refresh doesn't re-trigger; the server is idempotent too.
  useEffect(() => {
    if (!sessionId) return;
    const guard = `tou_fulfilled_${sessionId}`;
    try {
      if (localStorage.getItem(guard)) return;
    } catch {}
    fetch("/api/fulfill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res?.status && res.status !== "unpaid") {
          try {
            localStorage.setItem(guard, "1");
          } catch {}
        }
      })
      .catch(() => {
        /* the Stripe webhook, if configured, is the backstop */
      });
  }, [sessionId]);

  useEffect(() => {
    track("PurchaseClient", { order_id: orderId ?? "unknown" });
    if (!orderId) return;

    // Meta Pixel Purchase — once per order, guarded via localStorage
    try {
      const guard = `tuneofus_purchased_${orderId}`;
      if (!localStorage.getItem(guard) && typeof window.fbq === "function") {
        const local = JSON.parse(localStorage.getItem("tuneofus_order") || "null");
        const withBump = !!local?.bump;
        window.fbq("track", "Purchase", {
          value: config.price.core + (withBump ? config.price.bump : 0),
          currency: "USD",
        });
        localStorage.setItem(guard, "1");
      }
    } catch {}

    // Recap: localStorage first, server fallback
    try {
      const local = JSON.parse(localStorage.getItem("tuneofus_order") || "null");
      if (local?.orderId === orderId && local.briefing) {
        setRecap(local.briefing);
        setBump(!!local.bump);
        return;
      }
    } catch {}
    fetch(`/api/briefing?id=${orderId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setRecap(data.briefing);
        setBump(!!data.bump);
      })
      .catch(() => {});
  }, [orderId]);

  const addVideo = async () => {
    if (!orderId || upsellLoading) return;
    setUpsellLoading(true);
    track("UpsellClick", { order_id: orderId });
    try {
      let local = null;
      try {
        local = JSON.parse(localStorage.getItem("tuneofus_order") || "null");
      } catch {}
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, product: "video", briefing: local?.briefing, utm: local?.utm }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setUpsellLoading(false);
    } catch {
      setUpsellLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-lg px-5 pb-14 pt-10 text-center">
      <Confetti />
      <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-burgundy-deep sm:text-4xl">
        {content.thanks.heading}
      </h1>
      <p className="mt-2 text-lg text-ink-soft">{content.thanks.sub}</p>

      {recap && (
        <dl className="card-paper mx-auto mt-7 max-w-sm space-y-2 p-5 text-left text-[15px]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-burgundy/70">
            {content.thanks.recapHeading}
          </p>
          <div className="flex justify-between gap-4">
            <dt className="font-bold text-ink">Song for</dt>
            <dd className="text-ink-soft">{recap.theirName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-bold text-ink">Occasion</dt>
            <dd className="text-ink-soft">{recap.occasion}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-bold text-ink">Vibe</dt>
            <dd className="text-ink-soft">{recap.style} · {recap.mood}</dd>
          </div>
          {bump && (
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-ink">Second version</dt>
              <dd className="text-ink-soft">Included</dd>
            </div>
          )}
        </dl>
      )}

      {/* Post-purchase upsell */}
      {videoAdded ? (
        <p className="mt-7 rounded-2xl bg-blush-soft px-5 py-4 text-[15px] font-semibold text-burgundy-deep">
          Photo video added! We'll deliver it with your song.
        </p>
      ) : (
        <div className="card-paper mt-7 p-6">
          <h2 className="font-display text-xl font-semibold text-burgundy-deep">
            {content.thanks.upsell.title}
          </h2>
          <p className="mt-1.5 text-sm text-ink-soft">{content.thanks.upsell.body}</p>
          <button onClick={addVideo} disabled={upsellLoading} className="btn-gold mt-4 w-full px-6 py-3.5 disabled:opacity-50">
            {upsellLoading ? "One sec…" : content.thanks.upsell.cta}
          </button>
        </div>
      )}

      <p className="annotation mx-auto mt-8 max-w-xs text-xl">{content.thanks.waiting}</p>

      <Link href="/" className="btn-ghost mt-8 px-6 py-2.5 text-sm">
        Back to {content.brand.domain}
      </Link>
    </main>
  );
}
