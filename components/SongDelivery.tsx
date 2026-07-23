"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { content } from "@/lib/content";
import type { SongLinkData } from "@/lib/songlink";

/** UTF-8-safe base64url → string (handles accented names). */
function decodeToken(s: string): SongLinkData | null {
  try {
    let b = s.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b.length % 4;
    if (pad) b += "=".repeat(4 - pad);
    const bin = atob(b);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as SongLinkData;
  } catch {
    return null;
  }
}

function downloadHref(url: string, name: string) {
  return `/api/download?u=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;
}

function Icon({ name }: { name: string }) {
  const p = { width: 20, height: 20, viewBox: "0 0 24 24", "aria-hidden": true as const };
  switch (name) {
    case "download":
      return <svg {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>;
    case "share":
      return <svg {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>;
    case "gift":
      return <svg {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /><path d="M12 8S10.5 3 7.5 4.5 12 8 12 8Zm0 0s1.5-5 4.5-3.5S12 8 12 8Z" /></svg>;
    case "whatsapp":
      return <svg {...p} fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.8-.6-3-1.3-5-4.4-5.1-4.6-.2-.2-1.3-1.7-1.3-3.2s.8-2.3 1.1-2.6c.3-.3.6-.4.8-.4h.6c.2 0 .5 0 .7.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.4c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.4.1.1.1.7-.1 1.4Z" /></svg>;
    case "facebook":
      return <svg {...p} fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" /></svg>;
    case "instagram":
      return <svg {...p} fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
    default:
      return null;
  }
}

export default function SongDelivery({ token, data: dataProp }: { token?: string; data?: SongLinkData }) {
  const data = useMemo(() => dataProp ?? (token ? decodeToken(token) : null), [dataProp, token]);
  const [pageUrl, setPageUrl] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setPageUrl(window.location.href);
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  if (!data || !data.t?.length) {
    return (
      <main className="mx-auto max-w-md px-5 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-burgundy-deep">This song link looks broken.</h1>
        <p className="mt-2 text-ink-soft">Check the link in your email, or reply to hello@tuneofus.com and we&apos;ll resend it.</p>
        <Link href="/" className="btn-ghost mt-6 inline-flex px-6 py-2.5 text-sm">Back to TuneOfUs.com</Link>
      </main>
    );
  }

  const name = data.n?.trim() || "them";
  const fromName = data.y?.trim();
  // Warm, gift-framed messages. The recipient reads these — make it personal.
  const giftText = fromName
    ? `${name}, ${fromName} made you something special 🎁 A song, just for you — press play 🎵`
    : `${name}, someone made you something special 🎁 A song, just for you — press play 🎵`;
  const shareText = `I turned our story into a song for ${name} 🎵 Listen:`;

  const nativeShare = async (text: string) => {
    try {
      await navigator.share({ title: "TuneOfUs", text, url: pageUrl });
    } catch {
      /* user cancelled */
    }
  };

  const copyLink = async (msg = "Link copied") => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      flash(msg);
    } catch {
      flash("Couldn't copy — long-press the link to copy");
    }
  };

  const instagram = async () => {
    // No web intent posts to Instagram — copy the caption+link, open the app.
    try {
      await navigator.clipboard.writeText(`${shareText}\n${pageUrl}`);
    } catch {}
    flash("Caption copied — paste it in your story or post");
    window.open("https://instagram.com", "_blank");
  };

  const waHref = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${pageUrl}`)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;

  return (
    <main className="mx-auto max-w-md px-5 pb-16 pt-8">
      <div className="text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/logo-mark.png" alt="TuneOfUs" width={402} height={340} className="mx-auto h-10 w-auto" />
        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-burgundy/60">
          {data.s ? `${data.s} · ` : ""}{data.o || "Your song"}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-burgundy-deep">
          {name}&apos;s song
        </h1>
        {data.y?.trim() && (
          <p className="mt-1 text-[15px] text-ink-soft">from {data.y.trim()}</p>
        )}
      </div>

      {/* Players + per-version save */}
      <div className="mt-7 space-y-4">
        {data.t.map((track, i) => {
          const fileName = `${name}-song${data.t.length > 1 ? `-v${i + 1}` : ""}`;
          return (
            <div key={i} className="card-paper p-4">
              {data.t.length > 1 && (
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-burgundy/70">Version {i + 1}</p>
              )}
              <audio controls preload="none" src={track.url} className="w-full">
                Your browser can&apos;t play audio — use Save below.
              </audio>
              <a
                href={downloadHref(track.url, fileName)}
                className="btn-gold mt-3 flex w-full items-center justify-center gap-2 px-6 py-3.5 text-[15px]"
              >
                <Icon name="download" /> Save to my phone
              </a>
            </div>
          );
        })}
      </div>

      {/* Send as a gift */}
      <div className="mt-6 rounded-2xl border-2 border-burgundy/15 bg-blush-soft p-5 text-center">
        <p className="font-display text-lg font-semibold text-burgundy-deep">Send it to {name}</p>
        <p className="mt-1 text-sm text-ink-soft">Make their day — send the song straight to them.</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${giftText}\n${pageUrl}`)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-gold flex items-center justify-center gap-2 px-4 py-3 text-[15px]"
          >
            <Icon name="whatsapp" /> WhatsApp
          </a>
          {canNativeShare ? (
            <button onClick={() => nativeShare(giftText)} className="btn-ghost flex items-center justify-center gap-2 px-4 py-3 text-[15px]">
              <Icon name="gift" /> More ways
            </button>
          ) : (
            <button onClick={() => copyLink("Gift link copied")} className="btn-ghost flex items-center justify-center gap-2 px-4 py-3 text-[15px]">
              <Icon name="gift" /> Copy link
            </button>
          )}
        </div>
      </div>

      {/* Share on socials */}
      <div className="mt-6 text-center">
        <p className="font-display text-lg font-semibold text-burgundy-deep">Show it off</p>
        <p className="mt-1 text-sm text-ink-soft">Post the moment and tag <span className="font-semibold text-burgundy">#MyTuneOfUs</span>.</p>

        {canNativeShare && (
          <button onClick={() => nativeShare(shareText)} className="btn-gold mt-4 flex w-full items-center justify-center gap-2 px-6 py-3.5">
            <Icon name="share" /> Share
          </button>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2.5">
          <button onClick={instagram} className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-burgundy/15 bg-linen-warm py-3 text-xs font-semibold text-burgundy transition-colors hover:border-burgundy/40">
            <Icon name="instagram" /> Instagram
          </button>
          <a href={waHref} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-burgundy/15 bg-linen-warm py-3 text-xs font-semibold text-burgundy transition-colors hover:border-burgundy/40">
            <Icon name="whatsapp" /> WhatsApp
          </a>
          <a href={fbHref} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-burgundy/15 bg-linen-warm py-3 text-xs font-semibold text-burgundy transition-colors hover:border-burgundy/40">
            <Icon name="facebook" /> Facebook
          </a>
        </div>

        <button onClick={() => copyLink()} className="mt-4 text-sm font-medium text-ink-soft underline underline-offset-4">
          or copy the link
        </button>
      </div>

      <p className="mt-8 text-center text-xs text-ink-soft">
        Not quite right? Reply to your delivery email — one free revision, always.
      </p>
      <div className="mt-6 text-center">
        <Link href="/" className="text-sm font-semibold text-burgundy">{content.brand.name}.com</Link>
      </div>

      {toast && (
        <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit rounded-full bg-burgundy-deep px-5 py-2.5 text-sm font-semibold text-linen shadow-xl" role="status">
          {toast}
        </div>
      )}
    </main>
  );
}
