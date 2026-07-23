"use client";

import { useEffect, useRef } from "react";

/**
 * The signature element: a line that idles as a slow ECG heartbeat and,
 * when the demo song plays, blends live waveform energy into the pulse.
 * Canvas + Web Audio analyser, no dependencies.
 * Under prefers-reduced-motion it renders a single static heartbeat.
 */
export default function HeartbeatWave({
  analyser,
  playing,
  height = 96,
}: {
  analyser: AnalyserNode | null;
  playing: boolean;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const playingRef = useRef(playing);
  const analyserRef = useRef(analyser);
  playingRef.current = playing;
  analyserRef.current = analyser;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = canvas.clientWidth;
      canvas.width = w * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // ECG-style pulse: flat → small bump → sharp spike → dip → flat
    const ecg = (t: number) => {
      const p = ((t % 1) + 1) % 1;
      if (p < 0.35) return 0;
      if (p < 0.42) return Math.sin(((p - 0.35) / 0.07) * Math.PI) * 0.14;
      if (p < 0.46) return -((p - 0.42) / 0.04) * 0.28;
      if (p < 0.52) return -0.28 + ((p - 0.46) / 0.06) * 1.28;
      if (p < 0.58) return 1.0 - ((p - 0.52) / 0.06) * 1.42;
      if (p < 0.64) return -0.42 + ((p - 0.58) / 0.06) * 0.42;
      if (p < 0.78) return Math.sin(((p - 0.64) / 0.14) * Math.PI) * 0.2;
      return 0;
    };

    const freq = new Uint8Array(64);
    let phase = 0;
    let energySmooth = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const w = canvas.clientWidth;
      const mid = height / 2;
      ctx.clearRect(0, 0, w, height);

      // heartbeat speeds up slightly while the song plays
      const isPlaying = playingRef.current;
      phase += dt * (isPlaying ? 1.15 : 0.55);

      let energy = 0;
      const an = analyserRef.current;
      if (isPlaying && an) {
        an.getByteFrequencyData(freq);
        let sum = 0;
        for (let i = 0; i < freq.length; i++) sum += freq[i];
        energy = sum / (freq.length * 255);
      }
      energySmooth += (energy - energySmooth) * 0.12;

      ctx.beginPath();
      const steps = Math.max(80, Math.floor(w / 4));
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * w;
        // traveling heartbeat: pulse sweeps left → right
        const beat = ecg(i / steps - phase * 0.35) * (mid * 0.72);
        // waveform shimmer riding on top when audio plays
        let wave = 0;
        if (isPlaying && an) {
          const bin = Math.floor((i / steps) * (freq.length - 1));
          const centered = (freq[bin] / 255 - 0.5) * 2;
          wave = centered * mid * 0.45 * Math.sin(i * 0.6 + now * 0.008);
        }
        const blend = isPlaying ? 0.45 + energySmooth * 0.4 : 0;
        const y = mid - (beat * (1 - blend * 0.5) + wave * blend);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "rgba(138,15,51,0.25)");
      grad.addColorStop(0.5, "#8a0f33");
      grad.addColorStop(1, "rgba(138,15,51,0.25)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.25;
      ctx.lineCap = "round";
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };

    if (reduced) {
      // one static heartbeat, no animation
      const w = canvas.clientWidth;
      const mid = height / 2;
      ctx.beginPath();
      const steps = Math.max(80, Math.floor(w / 4));
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * w;
        const y = mid - ecg(i / steps + 0.15) * (mid * 0.72);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#8a0f33";
      ctx.lineWidth = 2.25;
      ctx.stroke();
    } else {
      rafRef.current = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [height]);

  return <canvas ref={canvasRef} className="w-full" style={{ height }} aria-hidden="true" />;
}
