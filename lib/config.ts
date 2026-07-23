/**
 * All tunable knobs in one place. Numbers you'll want to change as the
 * business grows live here or in env vars — never inside components.
 */
export const config = {
  /** Social-proof counter in the hero eyebrow. Update as orders grow. */
  tearsOfJoyCount: process.env.NEXT_PUBLIC_TEARS_COUNT ?? "12,000+",

  /** Prices in whole dollars (display) and cents (Stripe). */
  price: {
    anchor: 49, // struck-through
    core: 19,
    coreCents: 1900,
    bump: 15,
    bumpCents: 1500,
    upsell: 30,
    upsellCents: 3000,
  },

  /** Launch-price pill. Flag only — never a fake countdown. */
  showUrgency: process.env.NEXT_PUBLIC_SHOW_URGENCY === "true",

  currency: "usd",

  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tuneofus.com",
  supportEmail: "hello@tuneofus.com",

  trustpilotScore: "4.9",

  /** Recent-activity toast cadence (ms). */
  toastIntervalMs: 45_000,
};
