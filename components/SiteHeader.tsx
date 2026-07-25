import Link from "next/link";
import { content } from "@/lib/content";

/** Brand bar at the very top — same lockup the funnel pages carry. */
export default function SiteHeader() {
  return (
    <div className="mx-auto flex max-w-page items-center justify-center px-5 pt-5 sm:justify-start">
      <Link href="/" className="inline-flex items-center gap-2" aria-label={`${content.brand.name} home`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/logo-mark.png" alt="" width={402} height={340} className="h-8 w-auto" />
        <span className="font-display text-xl font-semibold text-burgundy">{content.brand.name}</span>
      </Link>
    </div>
  );
}
