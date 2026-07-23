import { Suspense } from "react";
import type { Metadata } from "next";
import SongDelivery from "@/components/SongDelivery";
import { decodeSongLink } from "@/lib/songlink";

/** Personalized share preview — a gift, not an ad. */
export function generateMetadata({ searchParams }: { searchParams: { d?: string } }): Metadata {
  const data = searchParams.d ? decodeSongLink(searchParams.d) : null;
  const name = data?.n?.trim() || "you";
  const from = data?.y?.trim();
  const occ = data?.o?.trim();

  const title = `A song for ${name}`;
  const description = from
    ? `${from} turned your story into a song. Press play — it's all yours.`
    : `Someone turned your story into a song. Press play — it's all yours.`;

  const ogImage = `/api/og?n=${encodeURIComponent(name)}${from ? `&y=${encodeURIComponent(from)}` : ""}${occ ? `&o=${encodeURIComponent(occ)}` : ""}`;

  return {
    title,
    description,
    robots: { index: false },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function SongPage({ searchParams }: { searchParams: { d?: string } }) {
  const token = searchParams.d ?? "";
  return (
    <Suspense fallback={<div className="min-h-dvh" aria-busy="true" />}>
      <SongDelivery token={token} />
    </Suspense>
  );
}
