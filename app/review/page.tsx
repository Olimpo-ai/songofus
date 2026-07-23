import { Suspense } from "react";
import type { Metadata } from "next";
import ReviewCard from "@/components/ReviewCard";

export const metadata: Metadata = {
  title: "Review your order",
  robots: { index: false },
};

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" aria-busy="true" />}>
      <ReviewCard />
    </Suspense>
  );
}
