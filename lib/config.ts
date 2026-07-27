/**
 * All tunable knobs in one place. Numbers you'll want to change as the
 * business grows live here or in env vars — never inside components.
 */
export const config = {
  /**
   * Couple-focused campaign: the funnel targets partners only, so the
   * wizard skips "who is this for?" and starts at the occasion.
   * Set false to reopen the full recipient list (mum, dad, friend…).
   */
  coupleMode: true,

  /** Prices in whole dollars (display) and cents (Stripe). */
  price: {
    core: 19,
    coreCents: 1900,
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
