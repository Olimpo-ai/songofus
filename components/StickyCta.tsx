"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { content } from "@/lib/content";

/** Sticky mobile CTA bar, appears after 30% scroll depth. */
export default function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const depth = window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1);
      setVisible(depth > 0.3);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 p-3 transition-transform duration-300 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      aria-hidden={!visible}
    >
      <div className="mx-auto max-w-md rounded-full bg-linen/80 p-1 shadow-2xl backdrop-blur">
        <Link href="/create" className="btn-gold w-full px-6 py-3.5 text-base" tabIndex={visible ? 0 : -1}>
          {content.stickyCta}
        </Link>
      </div>
    </div>
  );
}
