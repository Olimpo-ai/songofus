import Reveal from "./Reveal";

/**
 * Full-width emotional beat between comparison and offer: the kitchen
 * slow-dance photo with a handwritten caption. Image lives at
 * /public/moments/kitchen-dance.jpg — swap freely.
 */
export default function MomentBand() {
  return (
    <section aria-label="A TuneOfUs moment" className="px-5 py-6">
      <Reveal>
        <figure className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-burgundy/15 shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/moments/kitchen-dance.jpg"
            alt="A couple slow dancing in their kitchen while their song plays"
            loading="lazy"
            className="aspect-[16/9] w-full object-cover"
          />
          <figcaption
            className="absolute inset-x-0 bottom-0 px-5 pb-4 pt-14 text-linen"
            style={{ background: "linear-gradient(transparent, rgba(60,4,22,0.82))" }}
          >
            <span className="font-script text-2xl">their song, night one of forever</span>
          </figcaption>
        </figure>
      </Reveal>
    </section>
  );
}
