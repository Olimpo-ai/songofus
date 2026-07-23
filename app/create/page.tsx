import { Suspense } from "react";
import type { Metadata } from "next";
import Wizard from "@/components/create/Wizard";

export const metadata: Metadata = {
  title: "Create their song",
  description: "5 questions, 3 minutes. Your personalized song, delivered in 1 hour.",
  robots: { index: false },
};

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" aria-busy="true" />}>
      <Wizard />
    </Suspense>
  );
}
