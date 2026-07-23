import type { Metadata } from "next";
import { Fraunces, Nunito_Sans, Caveat } from "next/font/google";
import "./globals.css";
import { config } from "@/lib/config";
import UtmCapture from "@/components/UtmCapture";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-script",
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: "TuneOfUs — Your story. Their song. Ready in 1 hour.",
    template: "%s · TuneOfUs",
  },
  description:
    "Turn your story into a real, studio-quality personalized song — delivered in 1 hour. The most personal gift under $40. Anniversaries, mums, dads, weddings, birthdays.",
  openGraph: {
    title: "TuneOfUs — Your story. Their song. Ready in 1 hour.",
    description:
      "Answer 5 questions. We turn your memories into a studio-quality song, delivered in 1 hour. From $39.",
    url: config.siteUrl,
    siteName: "TuneOfUs",
    images: [{ url: "/og/default.jpg", width: 1200, height: 630, alt: "TuneOfUs — personalized songs in 1 hour" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TuneOfUs — Your story. Their song. Ready in 1 hour.",
    description: "The most personal gift under $40. Studio-quality personalized songs, delivered in 1 hour.",
    images: ["/og/default.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${nunitoSans.variable} ${caveat.variable}`}>
      <body className="font-body antialiased">
        <UtmCapture />
        {children}
      </body>
    </html>
  );
}
