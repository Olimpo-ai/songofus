"use client";

import Link from "next/link";
import { useEffect } from "react";
import { content } from "@/lib/content";
import { config } from "@/lib/config";
import { events } from "@/lib/analytics";
import HeroPlayer from "./HeroPlayer";

function TrustIcon({ name }: { name: string }) {
  const props = { width: 13, height: 13, viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": true as const, className: "text-burgundy" };
  if (name === "bolt") return <svg {...props}><path d="M9.5 1 3 9.5h4L6.5 15 13 6.5H9L9.5 1z" /></svg>;
  if (name === "shield") return <svg {...props}><path d="M8 1 2.5 3v4.5c0 3.6 2.3 6.2 5.5 7.5 3.2-1.3 5.5-3.9 5.5-7.5V3L8 1z" /></svg>;
  return <svg {...props}><path d="M8 1.3l2 4.2 4.6.6-3.4 3.2.9 4.6L8 11.7l-4.1 2.2.9-4.6L1.4 6.1 6 5.5 8 1.3z" /></svg>;
}

export default function Hero() {
  useEffect(() => {
    events.viewContent();
  }, []);

  return (
    <header className="relative mx-auto max-w-page px-5 pb-10 pt-6 sm:pt-14">
      {/* warm candlelight glow behind the headline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 30%, rgba(246,223,174,0.55) 0%, rgba(240,201,203,0.35) 45%, transparent 75%)",
        }}
      />
      <div className="hero-stagger mx-auto max-w-xl text-center sm:max-w-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo/logo-mark.png"
          alt="TuneOfUs"
          width={402}
          height={340}
          className="mx-auto mb-3 h-12 w-auto sm:h-14"
        />
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-burgundy">
          {content.hero.eyebrow}
        </p>

        <h1 className="mt-3 font-display text-[2.15rem] font-semibold leading-[1.08] text-burgundy-deep sm:text-6xl">
          {content.hero.h1}
        </h1>

        <div className="mt-5 flex flex-col items-center gap-3">
          {config.showUrgency && (
            <span className="rounded-full bg-blush px-3 py-1 text-xs font-bold text-burgundy-deep">
              {content.hero.urgencyPill}
            </span>
          )}
          <Link href="/create" className="btn-gold w-full max-w-sm px-8 py-4 text-lg">
            {content.hero.ctaPrimary}
          </Link>
          <a href="#hero-player" className="btn-ghost px-6 py-2.5 text-sm">
            {content.hero.ctaSecondary}
            <svg width="11" height="11" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
              <path d="M4 2.5v13l11-6.5-11-6.5z" />
            </svg>
          </a>
        </div>

        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[13px] font-semibold text-ink-soft">
          {content.hero.trust.map((t) => (
            <li key={t.label} className="inline-flex items-center gap-1.5">
              <TrustIcon name={t.icon} /> {t.label}
            </li>
          ))}
        </ul>

        <div className="mt-8 text-left">
          <HeroPlayer />
        </div>
      </div>
    </header>
  );
}
