import { content } from "@/lib/content";
import Reveal from "./Reveal";

export default function HowItWorks() {
  const { heading, sub, steps } = content.howItWorks;
  return (
    <section className="mx-auto max-w-page px-5 py-14" aria-labelledby="how-heading">
      <Reveal>
        <h2 id="how-heading" className="text-center font-display text-3xl font-semibold text-burgundy-deep sm:text-4xl">
          {heading}
        </h2>
        <p className="mt-2 text-center text-ink-soft">{sub}</p>
      </Reveal>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {steps.map((step) => (
          <Reveal key={step.track}>
            <article className="card-paper h-full p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-burgundy/70">{step.track}</p>
              {/* cassette tape line */}
              <div className="mt-2 flex items-center gap-2" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-burgundy/50" />
                <span className="h-px grow border-t border-dashed border-burgundy/30" />
                <span className="h-2.5 w-2.5 rounded-full border-2 border-burgundy/50" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-burgundy-deep">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{step.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
