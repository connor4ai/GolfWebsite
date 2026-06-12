"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { site, navItems, bookingCta } from "@/lib/site";
import { MobileMenu } from "./MobileMenu";

const PRIMARY_LINK_COUNT = 5;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const immersive =
    pathname === "/explore" || /^\/course\/[^/]+\/holes/.test(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const solid = scrolled && !immersive;
  const items = navItems();
  const primary = items.slice(0, PRIMARY_LINK_COUNT);
  const cta = bookingCta();

  return (
    <>
      <header
        className={`no-print fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-luxe ${
          solid
            ? "border-b hairline bg-night/92 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-md"
            : "bg-gradient-to-b from-night/80 to-transparent"
        }`}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-[100rem] items-center justify-between gap-6 px-5 md:px-10">
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label={`${site.identity.courseName} — home`}
          >
            <Image
              src={site.identity.logo.monogram}
              alt=""
              width={40}
              height={40}
              priority
              className="h-10 w-10 transition-transform duration-500 ease-luxe group-hover:rotate-[8deg]"
            />
            <span className="hidden flex-col sm:flex">
              <span className="font-display text-xl leading-none tracking-wide text-cream">
                {site.identity.shortName}
              </span>
              <span className="mt-1 text-[0.5625rem] uppercase tracking-luxe text-mist">
                {site.identity.tagline}
              </span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-7 xl:flex">
            {primary.map((item) => {
              const active =
                item.href === pathname ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[0.6875rem] uppercase tracking-luxe transition-colors duration-300 ${
                    active ? "text-brass" : "text-cream/80 hover:text-cream"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {cta.external ? (
              <a
                href={cta.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary hidden !px-5 !py-2.5 md:inline-flex"
              >
                {cta.label}
              </a>
            ) : (
              <Link href={cta.href} className="btn-primary hidden !px-5 !py-2.5 md:inline-flex">
                {cta.label}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              className="group flex h-11 w-11 flex-col items-center justify-center gap-[5px] border border-line/70 transition-colors duration-300 hover:border-brass"
              aria-label="Open menu"
            >
              <span className="h-px w-5 bg-cream transition-all duration-300 group-hover:w-6 group-hover:bg-brass" />
              <span className="h-px w-5 bg-cream transition-all duration-300 group-hover:w-4 group-hover:bg-brass" />
              <span className="h-px w-5 bg-cream transition-all duration-300 group-hover:w-6 group-hover:bg-brass" />
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
