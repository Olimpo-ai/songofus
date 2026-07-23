import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Hex literals (not var()) so Tailwind opacity modifiers like
      // bg-linen/90 work. Keep in sync with the CSS vars in globals.css.
      colors: {
        burgundy: "#8a0f33",
        "burgundy-deep": "#3c0416",
        blush: "#f5a3b1",
        "blush-soft": "#fcdde3",
        linen: "#fdf8f0",
        "linen-warm": "#f8edda",
        gold: "#b8860f",
        "gold-sheen": "#e6b93f",
        ink: "#231d3a",
        "ink-soft": "#55506e",
        apricot: "#ee5f36",
        "apricot-soft": "#fcd6c4",
        plum: "#a02050",
        candle: "#f9df9d",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      maxWidth: {
        page: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
