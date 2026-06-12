"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { SatView } from "@/config/types";
import { buildSatelliteStyle } from "@/lib/map/sources";
import { checkTileHealth } from "@/lib/map/tile-health";

/**
 * A living full-bleed aerial of the real property: satellite + 3D terrain
 * with an endless, almost-imperceptible camera drift (slow orbit + zoom
 * breathing). The cinematic backbone of the hero and the explore entry.
 *
 * Non-interactive; honors prefers-reduced-motion (static frame); falls
 * back to a branded gradient when imagery is unreachable so it never
 * renders broken.
 */
export function LiveAerial({
  view,
  className = "",
  driftDegPerSec = 0.55,
  grade = true,
}: {
  view: SatView;
  className?: string;
  driftDegPerSec?: number;
  grade?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let map: maplibregl.Map | null = null;
    let raf = 0;
    let alive = true;
    let io: IntersectionObserver | null = null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Defer the WebGL context until the surface is near the viewport.
    const visible = new Promise<void>((resolve) => {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            resolve();
            io?.disconnect();
          }
        },
        { rootMargin: "400px" }
      );
      io.observe(el);
    });

    (async () => {
      await visible;
      if (!alive) return;
      const health = await checkTileHealth(view.center);
      if (!alive) return;
      if (!health.imagery) {
        setFailed(true);
        return;
      }
      const style = buildSatelliteStyle(health.imagery);
      if (!health.terrain) {
        delete style.terrain;
        delete style.sources["terrain-dem"];
        delete style.sources["hillshade-dem"];
        style.layers = style.layers.filter((l) => l.id !== "hillshade");
      }
      try {
        map = new maplibregl.Map({
          container: el,
          style,
          center: [view.center.lng, view.center.lat],
          zoom: view.zoom,
          bearing: view.bearing ?? 0,
          pitch: view.pitch ?? 0,
          interactive: false,
          attributionControl: { compact: true },
          fadeDuration: 180,
        });
      } catch {
        setFailed(true);
        return;
      }

      if (!reduced) {
        const t0 = performance.now();
        const b0 = view.bearing ?? 0;
        const z0 = view.zoom;
        const drift = (now: number) => {
          if (!alive || !map) return;
          const t = (now - t0) / 1000;
          map.jumpTo({
            bearing: (b0 + t * driftDegPerSec) % 360,
            zoom: z0 + Math.sin(t / 14) * 0.12,
          });
          raf = requestAnimationFrame(drift);
        };
        map.once("load", () => {
          raf = requestAnimationFrame(drift);
        });
      }
    })();

    return () => {
      alive = false;
      io?.disconnect();
      cancelAnimationFrame(raf);
      map?.remove();
    };
    // view object is config-static per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {failed ? (
        <div className="h-full w-full bg-gradient-to-b from-pine/40 via-night to-night" />
      ) : (
        <div ref={ref} className="h-full w-full" />
      )}
      {grade && (
        <>
          {/* cinematic grade + atmosphere */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-night/70 via-night/15 to-night" />
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_90%_at_50%_10%,transparent_55%,rgb(var(--c-bg)/0.55)_100%)]" />
          <div className="film-grain pointer-events-none absolute inset-0" />
        </>
      )}
    </div>
  );
}
