import { Suspense } from "react";
import type { Metadata } from "next";
import Wizard from "@/components/create/Wizard";

export const metadata: Metadata = {
  title: "Create your love song",
  description: "A few questions, three minutes. Your love song, delivered in minutes.",
  robots: { index: false },
};

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" aria-busy="true" />}>
      <Wizard />
    </Suspense>
  );
}
