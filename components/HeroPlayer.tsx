"use client";

import { useRef, useState } from "react";
import { content } from "@/lib/content";
import HeartbeatWave from "./HeartbeatWave";

/**
 * The cassette-ticket player card: sample tabs + play button + the
 * heartbeat wave. One <audio> element, Web Audio analyser wired on the
 * first user gesture (autoplay policies).
 */
export default function HeroPlayer() {
  const [active, setActive] = useState(content.hero.samples[0]);
  const [playing, setPlaying] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  const ensureAnalyser = () => {
    const audio = audioRef.current;
    if (!audio || ctxRef.current) return;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const src = ctx.createMediaElementSource(audio);
      const an = ctx.createAnalyser();
      an.fftSize = 128;
      src.connect(an);
      an.connect(ctx.destination);
      ctxRef.current = ctx;
      setAnalyser(an);
    } catch {
      /* analyser is decorative — playback still works */
    }
  };

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    ensureAnalyser();
    await ctxRef.current?.resume().catch(() => {});
    if (playing) {
      audio.pause();
    } else {
      try {
        await audio.play();
      } catch {
        /* missing demo file in dev — silently ignore */
      }
    }
  };

  const pick = async (sample: (typeof content.hero.samples)[number]) => {
    const wasPlaying = playing;
    setActive(sample);
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = sample.src;
    if (wasPlaying) {
      try {
        await audio.play();
      } catch {}
    }
  };

  return (
    <div id="hero-player" className="card-paper p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5" role="tablist" aria-label="Sample songs">
          {content.hero.samples.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={active.id === s.id}
              onClick={() => pick(s)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                active.id === s.id
                  ? "bg-burgundy text-linen"
                  : "bg-blush-soft text-burgundy hover:bg-blush"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <span className="hidden font-script text-lg text-burgundy sm:block" aria-hidden="true">
          {content.hero.annotation}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label={playing ? "Pause sample" : "Play sample"}
          className="btn-gold h-14 w-14 shrink-0 rounded-full text-xl"
        >
          {playing ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
              <rect x="3" y="2" width="4.5" height="14" rx="1" />
              <rect x="10.5" y="2" width="4.5" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
              <path d="M4 2.5v13l11-6.5-11-6.5z" />
            </svg>
          )}
        </button>
        <div className="min-w-0 grow">
          <HeartbeatWave analyser={analyser} playing={playing} height={72} />
        </div>
      </div>

      <p className="mt-1 text-center text-xs text-ink-soft">
        Real sample · <span className="font-semibold">{active.label}</span> · every song is written from scratch
      </p>

      <audio
        ref={audioRef}
        src={active.src}
        preload="none"
        crossOrigin="anonymous"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}
