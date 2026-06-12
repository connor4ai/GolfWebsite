"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { site, filterChips } from "@/lib/site";
import type { PinCategory } from "@/config/types";
import { IllustratedPropertyMap } from "@/components/explore/IllustratedPropertyMap";

/**
 * Embedded locator map on the contact page — the illustrated property
 * rendering (works offline, no keys). Clicking any pin continues into the
 * full explore experience.
 */
export function ContactMap() {
  const router = useRouter();
  const allCats = useMemo(() => {
    const cats = new Set<PinCategory>();
    filterChips().forEach((c) => c.categories.forEach((cat) => cats.add(cat)));
    return cats;
  }, []);

  return (
    <div className="relative aspect-[4/3] overflow-hidden border hairline md:aspect-auto md:h-full md:min-h-[28rem]">
      <IllustratedPropertyMap
        visibleCats={allCats}
        selected={null}
        onSelect={() => router.push("/explore")}
      />
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${site.location.coords.lat},${site.location.coords.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-3 top-3 z-10 border border-line/70 bg-night/75 px-3 py-2 text-[0.5625rem] uppercase tracking-luxe text-cream/85 backdrop-blur-md transition-colors hover:border-brass hover:text-brass"
      >
        Open in Maps ↗
      </a>
    </div>
  );
}
