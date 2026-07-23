"use client";

import { useRef, useState } from "react";
import { content } from "@/lib/content";
import Reveal from "./Reveal";

/**
 * The emotional engine. Vertical, phone-shot-style reaction videos.
 * Drop real UGC into /public/reactions/ (r1.mp4 + r1-poster.jpg, …) and
 * they play in place. Until then each card shows a warm placeholder.
 */
function ReactionCard({ video }: { video: (typeof content.reactions.videos)[number] }) {
  const [playing, setPlaying] = useState(false);
  const [activated, setActivated] = useState(false); // video mounts on first tap
  const [broken, setBroken] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggle = () => {
    if (broken) return;
    if (!activated) {
      setActivated(true); // video autoplays on mount
      return;
    }
    const el = videoRef.current;
    if (!el) return;
    if (playing) el.pause();
    else el.play().catch(() => setBroken(true));
  };

  return (
    <figure className="group">
      <button
        onClick={toggle}
        aria-label={playing ? "Pause reaction video" : "Play reaction video"}
        className="relative block aspect-[9/16] w-full overflow-hidden rounded-2xl border border-blush/25 bg-burgundy-deep shadow-lg"
      >
        {/* poster is a lazy img — videos only load after a tap */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.poster}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        {activated && !broken && (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={video.src}
            autoPlay
            playsInline
            loop
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setBroken(true)}
          />
        )}
        {broken && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-burgundy/80 to-burgundy-deep/90 text-blush">
            <span className="px-4 text-center text-xs font-semibold opacity-90">Reaction video coming soon</span>
          </span>
        )}
        {!playing && !broken && (
          <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-linen/90 text-burgundy shadow-lg transition-transform group-hover:scale-105">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <path d="M4 2.5v13l11-6.5-11-6.5z" />
              </svg>
            </span>
          </span>
        )}
      </button>
      <figcaption className="mt-2 px-1 text-[13.5px] font-medium leading-snug text-blush-soft">
        {video.caption}
      </figcaption>
    </figure>
  );
}

export default function ReactionWall() {
  const { heading, sub, annotation, videos } = content.reactions;
  return (
    <section
      className="py-16"
      style={{ background: "linear-gradient(170deg, var(--burgundy-deep) 0%, var(--burgundy) 70%, var(--plum) 100%)" }}
      aria-labelledby="reactions-heading"
    >
      <div className="mx-auto max-w-page px-5">
        <Reveal>
          <div className="relative mx-auto max-w-lg text-center">
            <h2 id="reactions-heading" className="font-display text-3xl font-semibold text-linen sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-2 text-blush">{sub}</p>
            <p className="annotation mt-2 text-xl" style={{ color: "var(--gold-sheen)" }} aria-hidden="true">
              ↓ {annotation}
            </p>
          </div>
        </Reveal>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          {videos.map((v) => (
            <Reveal key={v.id}>
              <ReactionCard video={v} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
