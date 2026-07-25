"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import HeartbeatWave from "./HeartbeatWave";
import Reveal from "./Reveal";

/**
 * The proof section. Replaces the abstract style picker with something
 * concrete: what a real couple wrote → the exact lyric that came back →
 * the finished song. Seeing their own kind of detail sung back is what
 * makes "personalized" believable.
 *
 * One shared <audio> element so only one song plays at a time.
 */
export default function StoryProof() {
  const { heading, sub, labelStory, labelSong, annotation, items } = content.proof;
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  // Web Audio analyser wired on first gesture (autoplay policies)
  const ensureAnalyser = () => {
    const audio = audioRef.current;
    if (!audio || ctxRef.current) return;
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

  const toggle = async (id: string, src: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    ensureAnalyser();
    await ctxRef.current?.resume().catch(() => {});
    if (playingId === id) {
      audio.pause();
      return;
    }
    audio.src = src;
    try {
      await audio.play();
      setPlayingId(id);
    } catch {
      /* missing file in dev — ignore */
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnd = () => setPlayingId(null);
    audio.addEventListener("pause", onEnd);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("pause", onEnd);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  return (
    <section id="proof" className="mx-auto max-w-page px-5 py-14" aria-labelledby="proof-heading">
      <Reveal>
        <div className="mx-auto max-w-xl text-center">
          <h2
            id="proof-heading"
            className="font-display text-[26px] font-semibold leading-tight text-burgundy-deep sm:text-4xl"
          >
            {heading}
          </h2>
          <p className="mt-2 text-[15px] text-ink-soft sm:text-base">{sub}</p>
          <p className="annotation mt-2 text-xl" aria-hidden="true">
            {annotation}
          </p>
        </div>
      </Reveal>

      {/* Mobile: one card at a time, swipeable — keeps the offer within
          reach of the average scroll. Desktop: all three side by side.
          (No scroll-reveal here: off-screen carousel cards would flash in.) */}
      <div className="no-scrollbar -mx-5 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 lg:mx-auto lg:grid lg:max-w-5xl lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0">
        {items.map((item) => {
          const isPlaying = playingId === item.id;
          return (
            <div key={item.id} className="w-[86vw] shrink-0 snap-center sm:w-[62vw] lg:w-auto">
              <article className="card-paper flex h-full flex-col p-5">
                <header>
                  <p className="font-display text-lg font-semibold text-burgundy-deep">{item.couple}</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-burgundy/60">
                    {item.context}
                  </p>
                </header>

                {/* What they wrote */}
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">
                  {labelStory}
                </p>
                <blockquote className="mt-1.5 rounded-xl bg-linen px-4 py-3 text-[14.5px] italic leading-relaxed text-ink">
                  “{item.story}”
                </blockquote>

                {/* Arrow: input → output */}
                <div className="my-3 flex items-center gap-2" aria-hidden="true">
                  <span className="h-px grow bg-burgundy/15" />
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-burgundy/50">
                    <path d="M8 3v10M4 9l4 4 4-4" />
                  </svg>
                  <span className="h-px grow bg-burgundy/15" />
                </div>

                {/* What came back */}
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-burgundy">
                  {labelSong}
                </p>
                <div
                  className="mt-1.5 rounded-xl px-4 py-3.5"
                  style={{ background: "linear-gradient(135deg, var(--blush-soft), var(--candle))" }}
                >
                  <p className="whitespace-pre-line font-display text-[15.5px] italic leading-snug text-burgundy-deep">
                    {item.lyric}
                  </p>
                  {item.lyricTail && (
                    <p className="mt-2 whitespace-pre-line border-t border-burgundy/15 pt-2 font-display text-[15.5px] italic leading-snug text-burgundy-deep">
                      {item.lyricTail}
                    </p>
                  )}
                </div>

                {/* Player */}
                <div className="mt-4 flex grow items-end">
                  <div className="flex w-full items-center gap-3">
                    <button
                      onClick={() => toggle(item.id, item.src)}
                      aria-label={isPlaying ? `Pause ${item.title}` : `Play ${item.title}`}
                      className="btn-gold h-12 w-12 shrink-0 rounded-full"
                    >
                      {isPlaying ? (
                        <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                          <rect x="3" y="2" width="4.5" height="14" rx="1" />
                          <rect x="10.5" y="2" width="4.5" height="14" rx="1" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                          <path d="M4 2.5v13l11-6.5-11-6.5z" />
                        </svg>
                      )}
                    </button>
                    <div className="min-w-0 grow">
                      <p className="truncate text-[13px] font-semibold text-ink">{item.title}</p>
                      <HeartbeatWave analyser={isPlaying ? analyser : null} playing={isPlaying} height={30} />
                    </div>
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </div>

      {/* swipe affordance — mobile only */}
      <p className="mt-1 text-center text-xs font-semibold text-burgundy/60 lg:hidden">
        swipe for more couples →
      </p>

      <audio ref={audioRef} preload="none" crossOrigin="anonymous" />
    </section>
  );
}
