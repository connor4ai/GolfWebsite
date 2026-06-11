import localFont from "next/font/local";

/**
 * Self-hosted variable fonts (SIL Open Font License) — vendored in
 * app/fonts/ so builds never touch the network. Swap the files here when a
 * client licenses different type; config/course.config.ts documents the
 * pairing for reference.
 */

export const displayFont = localFont({
  src: [
    { path: "./fonts/cormorant-garamond.woff2", style: "normal" },
    { path: "./fonts/cormorant-garamond-italic.woff2", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
  weight: "300 700",
});

export const bodyFont = localFont({
  src: [{ path: "./fonts/jost.woff2", style: "normal" }],
  variable: "--font-body",
  display: "swap",
  weight: "100 900",
});
