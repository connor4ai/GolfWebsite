"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { GalleryImage } from "@/config/types";

/** Full-screen lightbox: Esc closes, arrows navigate, focus is contained. */
export function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const img = images[index];
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(index + 1);
      if (e.key === "ArrowLeft") onNavigate(index - 1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, onClose, onNavigate]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Image ${index + 1} of ${images.length}: ${img.alt}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[95] flex flex-col bg-night/96 backdrop-blur-md"
      onClick={onClose}
    >
      <div className="flex items-center justify-between p-5">
        <p className="text-[0.625rem] uppercase tracking-luxe text-mist">
          {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          <span className="ml-4 text-brass">{img.category}</span>
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close lightbox"
          className="flex h-11 w-11 items-center justify-center border border-line/70 text-cream transition-colors hover:border-brass hover:text-brass"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
            <path d="M1.5 1.5l12 12m0-12l-12 12" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>

      <div
        className="relative mx-auto flex w-full max-w-6xl flex-1 items-center px-14 pb-6 md:px-20"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          key={img.src}
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-full w-full border hairline"
        >
          <Image src={img.src} alt={img.alt} fill className="object-contain" sizes="100vw" />
        </motion.div>

        <button
          type="button"
          onClick={() => onNavigate(index - 1)}
          aria-label="Previous image"
          className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-line/70 bg-night/70 text-cream transition-colors hover:border-brass hover:text-brass md:left-4"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => onNavigate(index + 1)}
          aria-label="Next image"
          className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-line/70 bg-night/70 text-cream transition-colors hover:border-brass hover:text-brass md:right-4"
        >
          →
        </button>
      </div>

      <p className="px-6 pb-6 text-center font-display text-base italic text-mist">
        {img.alt}
      </p>
    </motion.div>
  );
}
