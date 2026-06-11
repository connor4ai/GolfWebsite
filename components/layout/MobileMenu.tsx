"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { site, navItems } from "@/lib/site";
import { useFocusTrap } from "@/components/ui/useFocusTrap";

/** Full-screen menu (all viewports) with staggered reveal. */
export function MobileMenu({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useFocusTrap(ref);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [onClose]);

  const items = navItems();

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed inset-0 z-[90] flex flex-col overflow-y-auto bg-night/97 backdrop-blur-xl"
    >
      <div className="flex h-[4.5rem] items-center justify-between px-5 md:px-10">
        <div className="flex items-center gap-3">
          <Image src={site.identity.logo.monogram} alt="" width={36} height={36} className="h-9 w-9" />
          <span className="font-display text-lg text-cream">{site.identity.shortName}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="flex h-11 w-11 items-center justify-center border border-line/70 text-cream transition-colors hover:border-brass hover:text-brass"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-editorial flex-1 flex-col justify-center gap-12 px-6 py-12 md:flex-row md:items-center md:gap-24 md:px-10">
        <nav aria-label="Menu" className="flex flex-col gap-1">
          {items.map((item, i) => (
            <motion.div
              key={item.href}
              initial={reduced ? false : { opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + i * 0.055, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={item.href}
                className="group flex items-baseline gap-4 py-1.5"
                onClick={onClose}
              >
                <span className="w-7 text-right font-body text-[0.625rem] tracking-luxe text-mist">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-4xl text-cream/85 transition-colors duration-300 group-hover:text-brass md:text-5xl">
                  {item.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </nav>

        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex max-w-xs flex-col gap-6 border-l hairline pl-8"
        >
          <p className="eyebrow">Visit</p>
          <address className="font-body text-sm not-italic leading-relaxed text-mist">
            {site.location.address.line1}
            <br />
            {site.location.address.city}, {site.location.address.region}{" "}
            {site.location.address.postalCode}
          </address>
          <div className="flex flex-col gap-2 text-sm">
            <a href={site.booking.phoneHref} className="text-cream/85 transition-colors hover:text-brass">
              {site.booking.phone}
            </a>
            <a href={`mailto:${site.booking.email}`} className="break-all text-cream/85 transition-colors hover:text-brass">
              {site.booking.email}
            </a>
          </div>
          <a
            href={site.booking.teeTimeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Book a Tee Time
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
}
