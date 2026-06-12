"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { site } from "@/lib/site";
import { Lightbox } from "./Lightbox";

/** Filterable masonry gallery with a keyboard-navigable lightbox. */
export function GalleryGrid() {
  const all = site.about.gallery;
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(all.map((g) => g.category)))],
    [all]
  );
  const [filter, setFilter] = useState("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const images = useMemo(
    () => (filter === "All" ? all : all.filter((g) => g.category === filter)),
    [all, filter]
  );

  return (
    <>
      <div role="group" aria-label="Filter gallery" className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            aria-pressed={filter === cat}
            onClick={() => {
              setFilter(cat);
              setOpenIndex(null);
            }}
            className={`border px-4 py-2 text-[0.625rem] uppercase tracking-luxe transition-all duration-300 ${
              filter === cat
                ? "border-brass bg-brass/15 text-brass"
                : "border-line/60 text-mist hover:border-cream/40 hover:text-cream"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <motion.div layout className="mt-10 columns-2 gap-4 md:columns-3 md:gap-6">
        <AnimatePresence mode="popLayout">
          {images.map((img, i) => (
            <motion.button
              layout
              key={img.src + img.category}
              type="button"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setOpenIndex(i)}
              className={`group relative mb-4 block w-full break-inside-avoid overflow-hidden border hairline md:mb-6 ${
                i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/3]"
              }`}
              aria-label={`View larger: ${img.alt}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.05]"
              />
              <span className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-night/90 to-transparent p-4 text-left opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="text-[0.5625rem] uppercase tracking-luxe text-brass">
                  {img.category}
                </span>
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {openIndex !== null && images[openIndex] && (
          <Lightbox
            images={images}
            index={openIndex}
            onClose={() => setOpenIndex(null)}
            onNavigate={(next) =>
              setOpenIndex(((next % images.length) + images.length) % images.length)
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}
