import Link from "next/link";
import { content } from "@/lib/content";

export default function Footer() {
  const { email, links, note } = content.footer;
  return (
    <footer className="bg-burgundy-deep py-10 text-blush-soft">
      <div className="mx-auto max-w-page px-5 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo/logo-mark.png"
          alt=""
          width={402}
          height={340}
          loading="lazy"
          className="mx-auto mb-2 h-10 w-auto"
        />
        <p className="font-display text-2xl font-semibold text-linen">{content.brand.name}</p>
        <p className="mt-1 text-sm opacity-80">{content.brand.tagline}</p>
        <p className="mt-4 text-sm">
          <a href={`mailto:${email}`} className="underline decoration-blush/40 underline-offset-4 hover:decoration-blush">
            {email}
          </a>
        </p>
        <nav className="mt-4 flex justify-center gap-5 text-sm" aria-label="Legal">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="opacity-80 hover:opacity-100">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-xs opacity-60">{note}</p>
      </div>
    </footer>
  );
}
