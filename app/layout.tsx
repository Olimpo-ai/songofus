import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Nunito_Sans, Caveat } from "next/font/google";
import "./globals.css";
import { config } from "@/lib/config";
import UtmCapture from "@/components/UtmCapture";

const META_PIXEL_ID = config.metaPixelId;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "xr8hkijydq";
/** Value from Events Manager → Settings → Verify Domain (meta-tag method). */
const FB_DOMAIN_VERIFICATION = process.env.NEXT_PUBLIC_FB_DOMAIN_VERIFICATION;

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
    default: "TuneOfUs — A love song made from your real story",
    template: "%s · TuneOfUs",
  },
  description:
    "Surprise your partner with a song made from your real love story. Their name, your memories and the moments only you two understand — turned into a one-of-a-kind song.",
  openGraph: {
    title: "TuneOfUs — A love song made from your real story",
    description:
      `The story only you two share, turned into a song only you two will have. Delivered in minutes, from $${config.price.core}.`,
    url: config.siteUrl,
    siteName: "TuneOfUs",
    images: [{ url: "/og/default.jpg", width: 1200, height: 630, alt: "TuneOfUs — personalized love songs" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TuneOfUs — A love song made from your real story",
    description: "The story only you two share, turned into a song only you two will have.",
    images: ["/og/default.jpg"],
  },
  // Meta domain verification (Events Manager → Settings → Verify Domain).
  ...(FB_DOMAIN_VERIFICATION
    ? { verification: { other: { "facebook-domain-verification": FB_DOMAIN_VERIFICATION } } }
    : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${nunitoSans.variable} ${caveat.variable}`}>
      <body className="font-body antialiased">
        {/* Microsoft Clarity */}
        <Script
          id="ms-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${CLARITY_ID}");`,
          }}
        />
        {/* Meta Pixel */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            alt=""
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
        <UtmCapture />
        {children}
      </body>
    </html>
  );
}
