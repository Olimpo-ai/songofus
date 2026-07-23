"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { content } from "@/lib/content";
import { config } from "@/lib/config";
import { events } from "@/lib/analytics";

interface RecapBriefing {
  recipient: string;
  occasion: string;
  theirName: string;
  yourName: string;
  style: string;
  mood: string;
}

/** The full order saved by the wizard — survives serverless storage loss. */
function loadLocalOrder(oid: string | null) {
  try {
    const raw = localStorage.getItem("tuneofus_order");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (oid && parsed.orderId !== oid) return null;
    return parsed as { orderId: string; briefing: RecapBriefing & { story: string; email: string; phone?: string }; utm: Record<string, string> };
  } catch {
    return null;
  }
}

export default function ReviewCard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("oid");
  const [briefing, setBriefing] = useState<RecapBriefing | null>(null);
  const [bump, setBump] = useState(true); // pre-checked — most people add this
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      router.replace("/create");
      return;
    }
    // localStorage first (always present right after the wizard);
    // server copy is only a fallback for cross-device links.
    const local = loadLocalOrder(orderId);
    if (local) {
      setBriefing(local.briefing);
      return;
    }
    fetch(`/api/briefing?id=${orderId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setBriefing(data.briefing))
      .catch(() => router.replace("/create"));
  }, [orderId, router]);

  const total = config.price.core + (bump ? config.price.bump : 0);

  const checkout = async () => {
    if (!orderId || loading) return;
    setLoading(true);
    setError(null);
    events.initiateCheckout(total);
    try {
      const local = loadLocalOrder(orderId);
      // remember the bump choice so /thanks reports the right Purchase value
      try {
        if (local) localStorage.setItem("tuneofus_order", JSON.stringify({ ...local, bump }));
      } catch {}
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          bump,
          product: "song",
          briefing: local?.briefing,
          utm: local?.utm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error);
      window.location.href = data.url;
    } catch {
      setError("Checkout is having a moment — give it another tap.");
      setLoading(false);
    }
  };

  if (!briefing) {
    return <div className="min-h-[60vh]" aria-busy="true" />;
  }

  return (
    <div className="mx-auto max-w-lg px-5 pb-12 pt-6">
      <Link href="/" className="inline-flex items-center gap-2 font-display text-lg font-semibold text-burgundy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/logo-mark.png" alt="" width={402} height={340} className="h-7 w-auto" />
        {content.brand.name}
      </Link>

      <h1 className="mt-8 font-display text-3xl font-semibold leading-tight text-burgundy-deep">
        {content.review.heading}
      </h1>

      <dl className="card-paper mt-6 space-y-3 p-5 text-[15px]">
        <div className="flex justify-between gap-4">
          <dt className="font-bold text-ink">{content.review.songFor}</dt>
          <dd className="text-right text-ink-soft">
            {briefing.theirName} <span className="text-ink-soft/70">({briefing.recipient.toLowerCase()})</span>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="font-bold text-ink">{content.review.occasion}</dt>
          <dd className="text-right text-ink-soft">{briefing.occasion}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="font-bold text-ink">{content.review.vibe}</dt>
          <dd className="text-right text-ink-soft">
            {briefing.style} · {briefing.mood}
          </dd>
        </div>
      </dl>

      {/* Order bump */}
      <label
        className={`mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-colors ${
          bump ? "border-burgundy bg-blush-soft" : "border-dashed border-burgundy/30 bg-linen-warm"
        }`}
      >
        <input
          type="checkbox"
          checked={bump}
          onChange={(e) => setBump(e.target.checked)}
          className="mt-1 h-5 w-5 accent-[#8a0f33]"
        />
        <span>
          <span className="block text-[15px] font-bold text-burgundy-deep">{content.review.bump.title}</span>
          <span className="mt-0.5 block text-sm text-ink-soft">{content.review.bump.sub}</span>
        </span>
      </label>

      {/* Totals */}
      <div className="mt-5 space-y-1.5 border-t border-burgundy/15 pt-4 text-[15px]">
        <div className="flex justify-between">
          <span>{content.review.lineCore}</span>
          <span>${config.price.core}</span>
        </div>
        {bump && (
          <div className="flex justify-between">
            <span>{content.review.lineBump}</span>
            <span>${config.price.bump}</span>
          </div>
        )}
        <div className="flex justify-between pt-1 text-lg font-bold text-burgundy-deep">
          <span>{content.review.total}</span>
          <span style={{ color: "var(--gold)" }}>${total}</span>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-blush-soft px-3 py-2 text-sm font-semibold text-burgundy-deep" role="alert">
          {error}
        </p>
      )}

      <button onClick={checkout} disabled={loading} className="btn-gold mt-6 w-full px-6 py-4 text-lg disabled:opacity-50">
        {loading ? "Opening secure checkout…" : content.review.cta}
      </button>
      <p className="mt-3 text-center text-xs text-ink-soft">{content.review.secure}</p>
      <p className="mt-2 text-center text-sm font-medium text-burgundy">{content.offer.guarantee}</p>
    </div>
  );
}
