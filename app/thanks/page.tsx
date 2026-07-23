import { Suspense } from "react";
import type { Metadata } from "next";
import ThanksContent from "@/components/ThanksContent";

export const metadata: Metadata = {
  title: "We're writing your song",
  robots: { index: false },
};

export default function ThanksPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" aria-busy="true" />}>
      <ThanksContent />
    </Suspense>
  );
}
