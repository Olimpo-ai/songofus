import Link from "next/link";
import { content } from "@/lib/content";
import Footer from "./Footer";

export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <main className="mx-auto max-w-2xl px-5 pb-16 pt-8">
        <Link href="/" className="inline-flex items-center gap-2 font-display text-lg font-semibold text-burgundy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/logo-mark.png" alt="" width={402} height={340} className="h-7 w-auto" />
          {content.brand.name}
        </Link>
        <h1 className="mt-8 font-display text-3xl font-semibold text-burgundy-deep">{title}</h1>
        <div className="prose-legal mt-6 space-y-4 text-[15px] leading-relaxed text-ink [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-burgundy-deep">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
