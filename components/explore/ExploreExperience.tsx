"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { site, filterChips, defaultCourse } from "@/lib/site";
import type { MapPin, PinCategory } from "@/config/types";
import { checkTileHealth, type TileHealth } from "@/lib/map/tile-health";
import { EntryOverlay } from "./EntryOverlay";
import { PropertyMap, type TourStop } from "./PropertyMap";
import { IllustratedPropertyMap } from "./IllustratedPropertyMap";
import { FilterChips } from "./FilterChips";
import { PinPanel } from "./PinPanel";
import { AudioToggle } from "./AudioToggle";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { bearingDeg } from "@/lib/geo";

type Mode = "satellite" | "illustrated";

/** Synthesize a selectable pin for every hole of the lead course. */
function holePins(): MapPin[] {
  if (!site.propertyMap.holePins) return [];
  const course = defaultCourse();
  return course.holes.map((hole) => {
    const tips = Object.values(hole.yardages)[0];
    return {
      id: `hole-${hole.number}`,
      coords: {
        lat: (hole.tee.lat + hole.green.lat) / 2,
        lng: (hole.tee.lng + hole.green.lng) / 2,
      },
      category: "golf" as const,
      title: `No. ${hole.number} · Par ${hole.par} · ${tips} yds`,
      shortDesc: hole.description,
      image: hole.heroImage,
      route: `/course/${course.slug}/holes?hole=${hole.number}`,
    };
  });
}

export function ExploreExperience() {
  const [entered, setEntered] = useState(false);
  const [health, setHealth] = useState<TileHealth | null>(null);
  const [override, setOverride] = useState<Mode | null>(null);
  const [webglBroken, setWebglBroken] = useState(false);
  const [selected, setSelected] = useState<MapPin | null>(null);
  const [touring, setTouring] = useState(false);

  const chips = useMemo(() => filterChips(), []);
  const [activeChips, setActiveChips] = useState<Set<string>>(
    () => new Set(chips.map((c) => c.id))
  );

  const allPins = useMemo(() => [...site.propertyMap.pins, ...holePins()], []);

  const tourStops = useMemo<TourStop[]>(() => {
    const course = defaultCourse();
    const holes = course.holes.map((h) => ({
      coords: {
        lat: (h.tee.lat + h.green.lat) / 2,
        lng: (h.tee.lng + h.green.lng) / 2,
      },
      bearing: bearingDeg(h.tee, h.green),
      zoom: 16.0,
    }));
    const finale = site.propertyMap.pins
      .filter((p) => p.category !== "golf")
      .slice(0, 4)
      .map((p) => ({ coords: p.coords, zoom: 16.2 }));
    return [...holes, ...finale];
  }, []);

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
        <>
          <PropertyMap
            provider={health.imagery}
            terrainOk={health.terrain}
            pins={allPins}
            visibleCats={visibleCats}
            selected={selected}
            onSelect={(p) => {
              setTouring(false);
              setSelected(p);
            }}
            onFatal={() => {
              setWebglBroken(true);
              setOverride("illustrated");
            }}
            touring={touring}
            tourStops={tourStops}
            onTourEnd={() => setTouring(false)}
          />
          {/* atmosphere: horizon haze, vignette, grain */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-night/85 via-night/30 to-transparent" />
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(130%_100%_at_50%_0%,transparent_60%,rgb(var(--c-bg)/0.5)_100%)]" />
          <div className="film-grain pointer-events-none absolute inset-0" />
        </>
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
            {site.propertyMap.tour && mode === "satellite" && (
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setTouring((t) => !t);
                }}
                aria-pressed={touring}
                className={`border px-4 py-2.5 text-[0.625rem] uppercase tracking-luxe backdrop-blur-md transition-colors duration-300 ${
                  touring
                    ? "border-brass bg-brass/20 text-brass"
                    : "border-line/70 bg-night/60 text-cream/85 hover:border-brass hover:text-brass"
                }`}
              >
                {touring ? "■ Stop the tour" : `▶ ${site.propertyMap.tour.label}`}
              </button>
            )}
            <ModeToggle
              mode={mode}
              satelliteAvailable={satelliteAvailable}
              onChange={(m) => {
                setTouring(false);
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
