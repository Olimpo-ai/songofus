import { Suspense } from "react";
import type { Metadata } from "next";
import SongDelivery from "@/components/SongDelivery";

export const metadata: Metadata = {
  title: "Your song",
  description: "Listen, save, and share your personalized TuneOfUs song.",
  robots: { index: false },
};

export default function SongPage({ searchParams }: { searchParams: { d?: string } }) {
  const token = searchParams.d ?? "";
  return (
    <Suspense fallback={<div className="min-h-dvh" aria-busy="true" />}>
      <SongDelivery token={token} />
    </Suspense>
  );
}
