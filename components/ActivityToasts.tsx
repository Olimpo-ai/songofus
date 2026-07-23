"use client";

import { useEffect, useState } from "react";
import { config } from "@/lib/config";
import toasts from "@/data/toasts.json";

/**
 * Recent-activity toasts. Content lives in /data/toasts.json — edit that
 * file, no code changes. Capped at one per 45s, dismissible, never shown
 * on the form flow (only mounted on the landing page).
 */
export default function ActivityToasts() {
  const [current, setCurrent] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed || toasts.length === 0) return;
    let idx = Math.floor(Math.random() * toasts.length);
    let hideTimer: ReturnType<typeof setTimeout>;

    const show = () => {
      setCurrent(toasts[idx % toasts.length]);
      idx++;
      hideTimer = setTimeout(() => setCurrent(null), 6000);
    };

    const first = setTimeout(show, 12_000);
    const interval = setInterval(show, config.toastIntervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
      clearTimeout(hideTimer);
    };
  }, [dismissed]);

  if (!current || dismissed) return null;

  return (
    <div
      className="toast-enter fixed bottom-20 left-3 z-40 flex max-w-[280px] items-start gap-2 rounded-xl border border-burgundy/15 bg-linen p-3 pr-2 text-[13px] font-medium text-ink shadow-xl sm:bottom-5"
      role="status"
    >
      <svg className="mt-0.5 shrink-0 text-burgundy" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M13 1 5.5 2.8v8.1a2.6 2.6 0 1 0 1.2 2.2V6.3L13 4.9v4a2.6 2.6 0 1 0 1.2 2.2V1z" />
      </svg>
      <span>{current}</span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss notifications"
        className="ml-1 shrink-0 rounded p-0.5 text-ink-soft hover:text-ink"
      >
        ✕
      </button>
    </div>
  );
}
