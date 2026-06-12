"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { site, filterChips } from "@/lib/site";
import type { MapPin, PinCategory } from "@/config/types";
import { checkTileHealth, type TileHealth } from "@/lib/map/tile-health";
import { EntryOverlay } from "./EntryOverlay";
import { PropertyMap } from "./PropertyMap";
import { IllustratedPropertyMap } from "./IllustratedPropertyMap";
import { FilterChips } from "./FilterChips";
import { PinPanel } from "./PinPanel";
import { AudioToggle } from "./AudioToggle";
import { ModeToggle } from "@/components/ui/ModeToggle";

type Mode = "satellite" | "illustrated";

export function ExploreExperience() {
  const [entered, setEntered] = useState(false);
  const [health, setHealth] = useState<TileHealth | null>(null);
  const [override, setOverride] = useState<Mode | null>(null);
  const [webglBroken, setWebglBroken] = useState(false);
  const [selected, setSelected] = useState<MapPin | null>(null);

  const chips = useMemo(() => filterChips(), []);
  const [activeChips, setActiveChips] = useState<Set<string>>(
    () => new Set(chips.map((c) => c.id))
  );

  useEffect(() => {
    let alive = true;
    checkTileHealth(site.propertyMap.center).then((h) => {
      if (alive) setHealth(h);
    });
    return () => {
      alive = false;
    };
  }, []);

  const satelliteAvailable = !!health?.imagery && !webglBroken;
  const mode: Mode | null = health
    ? override ?? (satelliteAvailable ? "satellite" : "illustrated")
    : null;

  const visibleCats = useMemo(() => {
    const cats = new Set<PinCategory>();
    for (const chip of chips) {
      if (activeChips.has(chip.id)) chip.categories.forEach((c) => cats.add(c));
    }
    return cats;
  }, [chips, activeChips]);

  const toggleChip = (id: string) => {
    setActiveChips((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-night">
      {/* Map layer */}
      {mode === "satellite" && health?.imagery && (
        <PropertyMap
          provider={health.imagery}
          terrainOk={health.terrain}
          visibleCats={visibleCats}
          selected={selected}
          onSelect={setSelected}
          onFatal={() => {
            setWebglBroken(true);
            setOverride("illustrated");
          }}
        />
      )}
      {mode === "illustrated" && (
        <IllustratedPropertyMap
          visibleCats={visibleCats}
          selected={selected}
          onSelect={setSelected}
        />
      )}
      {!mode && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="eyebrow animate-shimmer">Preparing the property…</p>
        </div>
      )}

      {/* HUD — only after entry */}
      {entered && mode && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-20 z-10 flex justify-center px-4">
            <FilterChips chips={chips} active={activeChips} onToggle={toggleChip} />
          </div>
          <div className="absolute bottom-5 left-5 z-10 flex flex-col items-start gap-3">
            <ModeToggle
              mode={mode}
              satelliteAvailable={satelliteAvailable}
              onChange={(m) => {
                setOverride(m);
              }}
            />
            <AudioToggle />
          </div>
        </>
      )}

      <AnimatePresence>
        {selected && (
          <PinPanel pin={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!entered && <EntryOverlay onEnter={() => setEntered(true)} />}
      </AnimatePresence>
    </div>
  );
}
