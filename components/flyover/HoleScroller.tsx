"use client";

import { useEffect, useRef } from "react";
import type { Hole } from "@/config/types";

/** Horizontal 1–18 selector; keeps the active hole in view. */
export function HoleScroller({
  holes,
  activeNumber,
  onSelect,
}: {
  holes: Hole[];
  activeNumber: number;
  onSelect: (n: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.querySelector<HTMLButtonElement>(
      `[data-hole="${activeNumber}"]`
    );
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeNumber]);

  return (
    <div
      ref={ref}
      role="tablist"
      aria-label="Choose a hole"
      className="pointer-events-auto flex max-w-full gap-1.5 overflow-x-auto px-2 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {holes.map((h) => {
        const active = h.number === activeNumber;
        return (
          <button
            key={h.number}
            type="button"
            data-hole={h.number}
            role="tab"
            aria-selected={active}
            aria-label={`Hole ${h.number}, par ${h.par}`}
            onClick={() => onSelect(h.number)}
            className={`flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center border backdrop-blur-md transition-all duration-300 ${
              active
                ? "border-brass bg-brass/20 text-brass"
                : "border-line/60 bg-night/60 text-mist hover:border-cream/40 hover:text-cream"
            }`}
          >
            <span className="font-display text-base leading-none">{h.number}</span>
            <span className="mt-0.5 text-[0.5rem] uppercase tracking-wider opacity-70">
              P{h.par}
            </span>
          </button>
        );
      })}
    </div>
  );
}
