"use client";

/**
 * Capture UTM params on landing, persist through the funnel, attach to
 * the briefing → Stripe metadata → your automation webhook. This is how
 * you find out which ad creative actually sells.
 */
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "ttclid"] as const;
const STORAGE_KEY = "tuneofus_utm";

export type UtmData = Partial<Record<(typeof UTM_KEYS)[number], string>> & {
  landing_page?: string;
  first_seen?: string;
};

export function captureUtm() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const found: UtmData = {};
    let any = false;
    for (const key of UTM_KEYS) {
      const v = params.get(key);
      if (v) {
        found[key] = v;
        any = true;
      }
    }
    // First touch wins — don't overwrite the ad that brought them here.
    if (any && !localStorage.getItem(STORAGE_KEY)) {
      found.landing_page = window.location.pathname;
      found.first_seen = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    }
  } catch {
    /* storage blocked — fine */
  }
}

export function getUtm(): UtmData {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}
