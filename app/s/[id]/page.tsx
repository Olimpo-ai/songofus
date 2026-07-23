import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SongDelivery from "@/components/SongDelivery";
import { getShortSong } from "@/lib/shortlink";

/** Personalized gift preview for the short link. */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await getShortSong(params.id);
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
    openGraph: { title, description, type: "website", images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function ShortSongPage({ params }: { params: { id: string } }) {
  const data = await getShortSong(params.id);
  if (!data) notFound();
  return <SongDelivery data={data} />;
}
