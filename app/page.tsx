import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ReactionWall from "@/components/ReactionWall";
import Occasions from "@/components/Occasions";
import StoryProof from "@/components/StoryProof";
import MomentBand from "@/components/MomentBand";
import OfferCard from "@/components/OfferCard";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import StickyCta from "@/components/StickyCta";
import { config } from "@/lib/config";
import { content } from "@/lib/content";

/**
 * schema.org Product markup. No aggregateRating until we have real,
 * verifiable reviews — fabricated ratings get sites penalized.
 */
function ProductJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "TuneOfUs Personalized Love Song",
    description:
      "A studio-quality personalized love song written from your real story, delivered in minutes.",
    brand: { "@type": "Brand", name: "TuneOfUs" },
    image: `${config.siteUrl}/og/default.jpg`,
    offers: {
      "@type": "Offer",
      price: String(config.price.core),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${config.siteUrl}/create`,
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
      {/* hook → proof it's real → proof it lands → how → your moment → offer */}
      <SiteHeader />
      <Hero />
      <StoryProof />
      <ReactionWall />
      <HowItWorks />
      <Occasions />
      <MomentBand />
      <OfferCard />
      <Faq />
      <Footer />
      <StickyCta />
    </main>
  );
}
