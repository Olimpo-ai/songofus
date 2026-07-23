import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>Last updated: July 2026. These terms keep things fair for both of us. Plain English, no traps.</p>
      <h2>What we do</h2>
      <p>
        TuneOfUs creates personalized songs based on the story and details you provide. When you place an order, you get a
        ~2-minute original song, its lyrics, a private share link, and an MP4 download — typically delivered within 1 hour of payment.
      </p>
      <h2>Delivery</h2>
      <p>
        We aim for 1-hour delivery, 24/7. In rare cases (high demand, technical issues) it may take longer; if delivery
        exceeds 12 hours, contact us and we'll refund you in full if you'd like.
      </p>
      <h2>Your content</h2>
      <p>
        You confirm the story and names you submit are yours to share and don't infringe anyone's rights. Don't submit
        hateful, unlawful, or harassing content — we'll refuse and refund those orders.
      </p>
      <h2>Ownership & usage</h2>
      <p>
        Your song is yours to keep and share for personal use: play it, gift it, post it on social media (yes, Instagram
        and TikTok are fine). Commercial licensing (ads, monetized channels) requires our written OK — email us, we're reasonable.
      </p>
      <h2>Revisions & the love-it guarantee</h2>
      <p>
        Every order includes one free revision. If after that the song still doesn't make them feel something, we'll
        remake it free. See our <a href="/refund" className="underline">refund policy</a> for details.
      </p>
      <h2>Liability</h2>
      <p>
        Our total liability for any claim is capped at the amount you paid for your order. We're a song service, not a
        substitute for professional advice of any kind.
      </p>
      <h2>Contact</h2>
      <p>Questions? hello@tuneofus.com — a human reads every email.</p>
    </LegalPage>
  );
}
