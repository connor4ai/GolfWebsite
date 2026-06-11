"use client";

import { motion } from "framer-motion";
import type { ChipDef } from "@/lib/site";

export function FilterChips({
  chips,
  active,
  onToggle,
}: {
  chips: ChipDef[];
  active: Set<string>;
  onToggle: (id: string) => void;
}) {
  if (chips.length < 2) return null;
  return (
    <div
      role="group"
      aria-label="Filter map pins"
      className="pointer-events-auto flex flex-wrap items-center justify-center gap-2"
    >
      {chips.map((chip, i) => {
        const on = active.has(chip.id);
        return (
          <motion.button
            key={chip.id}
            type="button"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => onToggle(chip.id)}
            aria-pressed={on}
            className={`border px-4 py-2 text-[0.625rem] uppercase tracking-luxe backdrop-blur-md transition-all duration-300 ${
              on
                ? "border-brass bg-brass/15 text-brass"
                : "border-line/60 bg-night/55 text-mist hover:border-cream/40 hover:text-cream"
            }`}
          >
            {chip.label}
          </motion.button>
        );
      })}
    </div>
  );
}
