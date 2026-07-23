import { content } from "@/lib/content";
import Reveal from "./Reveal";

/** Native <details> accordion — zero JS, accessible by default. */
export default function Faq() {
  const { heading, items } = content.faq;
  return (
    <section className="mx-auto max-w-page px-5 py-14" aria-labelledby="faq-heading">
      <Reveal>
        <h2 id="faq-heading" className="text-center font-display text-3xl font-semibold text-burgundy-deep">
          {heading}
        </h2>
      </Reveal>
      <Reveal className="mt-7">
        <div className="mx-auto max-w-2xl space-y-2.5">
          {items.map((item) => (
            <details key={item.q} className="group rounded-xl border border-burgundy/15 bg-linen-warm px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-bold text-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="text-burgundy transition-transform group-open:rotate-45" aria-hidden="true">＋</span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
