"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Hole } from "@/config/types";
import { site } from "@/lib/site";
import { buildSatelliteStyle, type ImageryProvider } from "@/lib/map/sources";
import { FlyoverEngine, type FlyoverPhase } from "@/lib/map/flyover";

/**
 * 3D satellite flyover host: one persistent terrain map; a fresh
 * FlyoverEngine is scripted per hole (and per replay). Any direct user
 * interaction hands over the camera and pauses the script.
 */
export function SatelliteFlyover({
  provider,
  terrainOk,
  hole,
  replayToken,
  onPhase,
  onProgress,
  onFatal,
}: {
  provider: ImageryProvider;
  terrainOk: boolean;
  hole: Hole;
  replayToken: number;
  onPhase: (p: FlyoverPhase) => void;
  onProgress: (t: number) => void;
  onFatal: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const engineRef = useRef<FlyoverEngine | null>(null);
  const [ready, setReady] = useState(false);
  const cb = useRef({ onPhase, onProgress });
  cb.current = { onPhase, onProgress };

  // -- map lifecycle (once) ---------------------------------------------
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const style = buildSatelliteStyle(provider);
    if (!terrainOk) {
      delete style.terrain;
      delete style.sources["terrain-dem"];
      delete style.sources["hillshade-dem"];
      style.layers = style.layers.filter((l) => l.id !== "hillshade");
    }
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style,
        center: [hole.tee.lng, hole.tee.lat],
        zoom: 13.5,
        pitch: 0,
        maxPitch: 72,
        attributionControl: { compact: true },
      });
    } catch {
      onFatal();
      return;
    }
    mapRef.current = map;
    const interrupt = () => {
      engineRef.current?.cancel();
    };
    map.on("mousedown", interrupt);
    map.on("touchstart", interrupt);
    map.on("wheel", interrupt);
    map.once("load", () => setReady(true));
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -- engine per hole / replay -------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    engineRef.current?.dispose();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const short =
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth < 768;
    const engine = new FlyoverEngine(map, hole, {
      reducedMotion: reduced,
      shortTimings: short,
      accentColor: site.identity.brandColors.accent,
      onPhase: (p) => cb.current.onPhase(p),
      onProgress: (t) => cb.current.onProgress(t),
    });
    engineRef.current = engine;
    engine.start();
    return () => {
      // On full unmount the map-lifecycle cleanup has already run (effects
      // clean up in declaration order) and removed the map — only cancel.
      if (mapRef.current) engine.dispose();
      else engine.cancel();
    };
  }, [hole, replayToken, ready]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full bg-night"
      role="application"
      aria-label={`3D flyover of hole ${hole.number}`}
    />
  );
}
