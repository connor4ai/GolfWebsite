import type { Config } from "tailwindcss";

/**
 * All brand colors resolve through CSS custom properties injected by
 * app/layout.tsx from /config/course.config.ts — re-theming a client site
 * never requires touching this file.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "rgb(var(--c-bg) / <alpha-value>)",
        raised: "rgb(var(--c-bg-raised) / <alpha-value>)",
        cream: "rgb(var(--c-text) / <alpha-value>)",
        mist: "rgb(var(--c-text-dim) / <alpha-value>)",
        pine: "rgb(var(--c-primary) / <alpha-value>)",
        brass: "rgb(var(--c-accent) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        luxe: "0.28em",
        wide2: "0.14em",
      },
      maxWidth: {
        editorial: "72rem",
      },
      transitionTimingFunction: {
        luxe: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        "slow-drift": {
          from: { transform: "scale(1.04) translateY(0)" },
          to: { transform: "scale(1.1) translateY(-1.5%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.9s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 3.2s ease-in-out infinite",
        "slow-drift": "slow-drift 18s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};
export default config;
