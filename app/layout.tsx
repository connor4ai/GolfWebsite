import type { Metadata, Viewport } from "next";
import { displayFont, bodyFont } from "./fonts";
import { site, themeVars } from "@/lib/site";
import { buildJsonLd } from "@/lib/jsonld";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Preloader } from "@/components/layout/Preloader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.seo.siteUrl),
  title: {
    default: `${site.identity.courseName} — ${site.identity.tagline}`,
    template: `%s — ${site.identity.courseName}`,
  },
  description: site.seo.description,
  keywords: site.seo.keywords,
  icons: { icon: site.identity.logo.monogram },
  openGraph: {
    type: "website",
    siteName: site.identity.courseName,
    title: `${site.identity.courseName} — ${site.identity.tagline}`,
    description: site.seo.description,
    url: site.seo.siteUrl,
    images: [{ url: "/og/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.identity.courseName} — ${site.identity.tagline}`,
    description: site.seo.description,
  },
};

export const viewport: Viewport = {
  themeColor: site.identity.brandColors.background,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = buildJsonLd();
  return (
    <html
      lang="en"
      style={themeVars() as React.CSSProperties}
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          // Schema.org structured data assembled from the site config.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-night focus:px-4 focus:py-2 focus:text-cream"
        >
          Skip to content
        </a>
        <Preloader />
        <SmoothScroll />
        <AnnouncementBar />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
