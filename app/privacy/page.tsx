import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>Last updated: July 2026. The short version: we collect what we need to make your song, and we don't sell it.</p>
      <h2>What we collect</h2>
      <p>
        The answers you give in the briefing form (names, your story, style preferences), your email, an optional phone
        number for SMS delivery, and standard analytics data (pages visited, ad campaign tags) so we know which ads work.
      </p>
      <h2>How we use it</h2>
      <p>
        Your story and names are used for exactly one thing: writing and producing your song. Your email and phone are
        used to deliver it. Analytics data is used in aggregate to improve the site and our ads.
      </p>
      <h2>Payments</h2>
      <p>
        Payments are processed by Stripe. We never see or store your card number. Stripe's privacy policy applies to
        payment data.
      </p>
      <h2>Who we share with</h2>
      <p>
        Only the services needed to run TuneOfUs: Stripe (payments), our song-production pipeline, our email/SMS
        delivery providers, and analytics tools (Google, Meta) in accordance with their policies. We never sell your
        personal data, and we never publish your story.
      </p>
      <h2>Your rights</h2>
      <p>
        Email hello@tuneofus.com to request a copy of your data or its deletion — we'll act within 30 days. EU/UK
        visitors: this is your GDPR right; Australian visitors: APP; Californians: CCPA. Same inbox for all of it.
      </p>
      <h2>Retention</h2>
      <p>
        We keep order details as long as needed to provide the service and meet tax obligations, then delete them.
        You can request earlier deletion of your story at any time after delivery.
      </p>
    </LegalPage>
  );
}
