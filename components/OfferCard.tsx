import Link from "next/link";
import { content } from "@/lib/content";
import { config } from "@/lib/config";
import Reveal from "./Reveal";

export default function OfferCard() {
  const { heading, includes, priceNote, cta, guarantee } = content.offer;
  return (
    <section className="mx-auto max-w-page px-5 py-14" aria-labelledby="offer-heading">
      <Reveal>
        <div className="card-paper mx-auto max-w-xl p-6 sm:p-8">
          <h2 id="offer-heading" className="text-center font-display text-2xl font-semibold text-burgundy-deep sm:text-3xl">
            {heading}
          </h2>
          <ul className="mt-5 space-y-2.5 text-[15.5px] text-ink">
            {includes.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <svg className="mt-1 shrink-0 text-burgundy" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2.5 8.5 6 12l7.5-8" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 text-center">
            {config.showUrgency && (
              <span className="mb-2 inline-block rounded-full bg-blush px-3 py-1 text-xs font-bold text-burgundy-deep">
                {content.hero.urgencyPill}
              </span>
            )}
            <p>
              <span className="text-lg text-ink-soft line-through">${config.price.anchor}</span>{" "}
              <span className="font-display text-5xl font-semibold" style={{ color: "var(--gold)" }}>
                ${config.price.core}
              </span>
            </p>
            <p className="mt-1 text-xs text-ink-soft">{priceNote}</p>
            <Link href="/create" className="btn-gold mt-5 w-full px-8 py-4 text-lg sm:w-auto">
              {cta}
            </Link>
            <p className="mt-4 text-sm font-medium text-burgundy">{guarantee}</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
