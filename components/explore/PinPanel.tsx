"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { SmartImage } from "@/components/media/SmartImage";
import { motion, useReducedMotion } from "framer-motion";
import type { MapPin } from "@/config/types";
import { CATEGORY_LABEL } from "@/lib/site";
import { useFocusTrap } from "@/components/ui/useFocusTrap";

/** Slide-in detail panel for a selected map pin. */
export function PinPanel({ pin, onClose }: { pin: MapPin; onClose: () => void }) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Parent passes an inline onClose; keep it in a ref so re-renders (e.g.
  // toggling a filter chip) never re-run the focus effect and steal focus.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useFocusTrap(rootRef);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pin.id]);

  return (
    <motion.aside
      ref={rootRef}
      key={pin.id}
      role="dialog"
      aria-label={pin.title}
      initial={reduced ? { opacity: 0 } : { x: "105%" }}
      animate={reduced ? { opacity: 1 } : { x: 0 }}
      exit={reduced ? { opacity: 0 } : { x: "105%" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="panel pointer-events-auto absolute bottom-0 right-0 top-auto z-20 flex max-h-[62dvh] w-full flex-col overflow-hidden md:bottom-6 md:right-6 md:top-24 md:max-h-none md:w-[26rem]"
    >
      <div className="relative aspect-[16/9] w-full flex-shrink-0 md:aspect-[16/10]">
        <SmartImage
          asset={pin.image}
          sizes="(min-width: 768px) 26rem, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-raised via-transparent to-transparent" />
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center border border-line/60 bg-night/70 text-cream backdrop-blur-md transition-colors hover:border-brass hover:text-brass"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
        <span className="absolute left-5 bottom-4 border border-brass/50 bg-night/70 px-3 py-1 text-[0.5625rem] uppercase tracking-luxe text-brass backdrop-blur-md">
          {CATEGORY_LABEL[pin.category]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-7">
        <h2 className="font-display text-3xl leading-tight text-cream">{pin.title}</h2>
        <p className="font-body text-sm leading-relaxed text-mist">{pin.shortDesc}</p>
        {pin.route && (
          <Link href={pin.route} className="btn-primary mt-auto self-start">
            Discover more
          </Link>
        )}
      </div>
    </motion.aside>
  );
}
