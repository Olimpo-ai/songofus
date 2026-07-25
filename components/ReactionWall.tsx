import { content } from "@/lib/content";
import Reveal from "./Reveal";

/**
 * Mood imagery for the moment the song lands. These are illustrations, not
 * customer footage — so there is no play affordance and no quoted or named
 * testimonial. Swap in real customer videos (with permission) before making
 * any "real reactions" claim.
 */
export default function ReactionWall() {
  const { heading, sub, annotation, videos } = content.reactions;
  return (
    <section
      className="py-16"
      style={{ background: "linear-gradient(170deg, var(--burgundy-deep) 0%, var(--burgundy) 70%, var(--plum) 100%)" }}
      aria-labelledby="reactions-heading"
    >
      <div className="mx-auto max-w-page px-5">
        <Reveal>
          <div className="relative mx-auto max-w-lg text-center">
            <h2 id="reactions-heading" className="font-display text-3xl font-semibold text-linen sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-2 text-blush">{sub}</p>
            <p className="annotation mt-2 text-xl" style={{ color: "var(--gold-sheen)" }} aria-hidden="true">
              ↓ {annotation}
            </p>
          </div>
        </Reveal>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
          {videos.map((v) => (
            <Reveal key={v.id}>
              <figure>
                <div className="aspect-[9/16] w-full overflow-hidden rounded-2xl border border-blush/25 bg-burgundy-deep shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.poster}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="mt-2 px-1 text-[13.5px] font-medium leading-snug text-blush-soft">
                  {v.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
