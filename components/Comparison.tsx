import { content } from "@/lib/content";
import Reveal from "./Reveal";

export default function Comparison() {
  const { heading, other, us } = content.comparison;
  return (
    <section className="mx-auto max-w-page px-5 py-10" aria-labelledby="compare-heading">
      <Reveal>
        <h2 id="compare-heading" className="text-center font-display text-3xl font-semibold text-burgundy-deep">
          {heading}
        </h2>
        <div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-ink/10 bg-linen-warm/60 p-5 opacity-75">
            <p className="text-sm font-bold text-ink-soft">{other.label}</p>
            <ul className="mt-3 space-y-1.5 text-[15px] text-ink-soft">
              {other.points.map((p) => (
                <li key={p}>· {p}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-burgundy/30 bg-linen-warm p-5 shadow-md">
            <p className="text-sm font-bold text-burgundy">{us.label}</p>
            <ul className="mt-3 space-y-1.5 text-[15px] font-semibold text-ink">
              {us.points.map((p) => (
                <li key={p}>✓ {p}</li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
