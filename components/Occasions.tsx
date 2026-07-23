import Link from "next/link";
import { content } from "@/lib/content";
import Reveal from "./Reveal";

/** Occasion chips — each pre-fills the form's occasion step via query param. */
export default function Occasions() {
  const { heading, items } = content.occasions;
  return (
    <section className="mx-auto max-w-page px-5 py-14" aria-labelledby="occasions-heading">
      <Reveal>
        <h2 id="occasions-heading" className="text-center font-display text-3xl font-semibold text-burgundy-deep sm:text-4xl">
          {heading}
        </h2>
      </Reveal>
      <Reveal className="mt-7">
        <ul className="flex flex-wrap justify-center gap-2.5">
          {items.map((o, i) => {
            // warm tint rotation — each occasion feels like its own little gift
            const tints = [
              "border-burgundy/25 bg-blush-soft text-burgundy",
              "border-apricot/40 bg-apricot-soft text-plum",
              "border-gold/40 bg-candle/60 text-burgundy-deep",
              "border-plum/30 bg-plum/10 text-plum",
            ];
            return (
              <li key={o.slug}>
                <Link
                  href={`/create?occasion=${encodeURIComponent(o.label)}`}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[15px] font-semibold transition-transform hover:-translate-y-0.5 ${tints[i % tints.length]}`}
                >
                  {o.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
