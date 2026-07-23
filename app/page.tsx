import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ReactionWall from "@/components/ReactionWall";
import Occasions from "@/components/Occasions";
import Comparison from "@/components/Comparison";
import MomentBand from "@/components/MomentBand";
import OfferCard from "@/components/OfferCard";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import StickyCta from "@/components/StickyCta";
import ActivityToasts from "@/components/ActivityToasts";
import { config } from "@/lib/config";
import { content } from "@/lib/content";

/** schema.org Product markup with review stars for rich results. */
function ProductJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "TuneOfUs Personalized Song",
    description:
      "A studio-quality personalized song written from your story, delivered in 1 hour.",
    brand: { "@type": "Brand", name: "TuneOfUs" },
    image: `${config.siteUrl}/og/default.jpg`,
    offers: {
      "@type": "Offer",
      price: String(config.price.core),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${config.siteUrl}/create`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: config.trustpilotScore,
      reviewCount: "1204",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function FaqJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function HomePage() {
  return (
    <main>
      <ProductJsonLd />
      <FaqJsonLd />
      <Hero />
      <HowItWorks />
      <ReactionWall />
      <Occasions />
      <Comparison />
      <MomentBand />
      <OfferCard />
      <Faq />
      <Footer />
      <StickyCta />
      <ActivityToasts />
    </main>
  );
}
