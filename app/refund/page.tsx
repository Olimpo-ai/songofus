import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPage() {
  return (
    <LegalPage title="Refund Policy">
      <p>Last updated: July 2026. We want you crying happy tears, not arguing with support.</p>
      <h2>The love-it guarantee</h2>
      <p>
        If your song doesn't make them feel something, tell us what's off and we'll revise it once, free. If the revision
        still misses, we'll remake it from scratch at no charge.
      </p>
      <h2>When you get your money back</h2>
      <p>
        Full refund, no questions: if we fail to deliver within 12 hours of payment, or if we can't produce a song that
        meets the brief after a revision and a remake. Refunds go back to your original payment method within 5–10
        business days.
      </p>
      <h2>What we can't refund</h2>
      <p>
        Because every song is custom-made and delivered digitally, we can't refund orders after delivery simply for a
        change of heart, or when the details in the brief were incorrect (wrong name spelling we faithfully used, etc.) —
        but the free revision exists exactly for fixing those.
      </p>
      <h2>How to ask</h2>
      <p>
        Email hello@tuneofus.com with your order email and what went wrong. A human replies within 24 hours.
      </p>
    </LegalPage>
  );
}
