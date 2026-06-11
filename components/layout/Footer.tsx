"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { site, navItems } from "@/lib/site";

export function Footer() {
  const pathname = usePathname();
  // Immersive, full-viewport experiences own their entire screen.
  if (pathname === "/explore" || /^\/course\/[^/]+\/holes/.test(pathname)) {
    return null;
  }
  const year = new Date().getFullYear();
  const demo = site.seo.siteUrl.includes(".example");

  return (
    <footer className="no-print border-t hairline bg-raised/40">
      <div className="mx-auto grid max-w-[100rem] gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] md:px-10">
        <div>
          <div className="flex items-center gap-4">
            <Image src={site.identity.logo.crest} alt={`${site.identity.courseName} crest`} width={64} height={64} className="h-16 w-16" />
            <div>
              <p className="font-display text-2xl text-cream">{site.identity.shortName}</p>
              <p className="mt-1 text-[0.625rem] uppercase tracking-luxe text-mist">
                {site.identity.established ? `Est. ${site.identity.established} · ` : ""}
                {site.identity.tagline}
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-sm font-body text-sm leading-relaxed text-mist">
            {site.location.regionNarrative.split(". ").slice(0, 2).join(". ")}.
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="eyebrow mb-5">Visit</p>
          <ul className="space-y-2.5">
            {navItems().map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-body text-sm text-cream/75 transition-colors hover:text-brass"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow mb-5">Find us</p>
          <address className="font-body text-sm not-italic leading-relaxed text-mist">
            {site.location.address.line1}
            <br />
            {site.location.address.city}, {site.location.address.region}{" "}
            {site.location.address.postalCode}
          </address>
          <div className="mt-4 flex flex-col gap-2 font-body text-sm">
            <a href={site.booking.phoneHref} className="text-cream/75 transition-colors hover:text-brass">
              {site.booking.phone}
            </a>
            <a href={`mailto:${site.booking.email}`} className="break-all text-cream/75 transition-colors hover:text-brass">
              {site.booking.email}
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow mb-5">The first tee awaits</p>
          {site.booking.bookingNote && (
            <p className="font-body text-sm leading-relaxed text-mist">{site.booking.bookingNote}</p>
          )}
          <a
            href={site.booking.teeTimeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-6"
          >
            Book a Tee Time
          </a>
        </div>
      </div>

      <div className="border-t hairline">
        <div className="mx-auto flex max-w-[100rem] flex-col items-center justify-between gap-2 px-6 py-5 text-[0.6875rem] tracking-wide2 text-mist/80 md:flex-row md:px-10">
          <p>
            © {year} {site.identity.courseName}. All rights reserved.
          </p>
          {demo && <p>A fictional demonstration property — built on the Fairway template.</p>}
        </div>
      </div>
    </footer>
  );
}
