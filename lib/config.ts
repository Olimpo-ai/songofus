/**
 * All tunable knobs in one place. Numbers you'll want to change as the
 * business grows live here or in env vars — never inside components.
 */
/** Whole dollars. Falls back to the real price if the var is unset/invalid. */
const CORE_PRICE_USD = Number(process.env.NEXT_PUBLIC_PRICE_USD) > 0
  ? Number(process.env.NEXT_PUBLIC_PRICE_USD)
  : 19;

export const config = {
  /**
   * Couple-focused campaign: the funnel targets partners only, so the
   * wizard skips "who is this for?" and starts at the occasion.
   * Set false to reopen the full recipient list (mum, dad, friend…).
   */
  coupleMode: true,

  /**
   * Price in whole dollars, with cents derived for Stripe. Driven by
   * NEXT_PUBLIC_PRICE_USD so it can be dropped to 1.00 for a cheap
   * end-to-end tracking test and restored without a code change — every
   * surface (copy, Stripe amount, pixel value) reads from here.
   */
  price: {
    core: CORE_PRICE_USD,
    coreCents: Math.round(CORE_PRICE_USD * 100),
  },

  /** Launch-price pill. Flag only — never a fake countdown. */
  showUrgency: process.env.NEXT_PUBLIC_SHOW_URGENCY === "true",

  currency: "usd",

  /**
   * Meta pixel / CAPI dataset id. Single source of truth: the browser
   * pixel, advanced matching and the server-side Purchase all read this.
   * The literal fallback matters — NEXT_PUBLIC_* vars are inlined at build
   * time, so an unset var would silently disable CAPI and advanced
   * matching while the base pixel kept working.
   */
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "2240086196844764",

  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tuneofus.com",
  supportEmail: "hello@tuneofus.com",

  /** Recent-activity toast cadence (ms). */
  toastIntervalMs: 45_000,
};
