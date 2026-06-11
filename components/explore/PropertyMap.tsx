"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { site } from "@/lib/site";
import type { MapPin, PinCategory } from "@/config/types";
import { buildSatelliteStyle, type ImageryProvider } from "@/lib/map/sources";
import { buildPinElement } from "./pin-icons";

export function PropertyMap({
  provider,
  terrainOk,
  visibleCats,
  selected,
  onSelect,
  onFatal,
}: {
  provider: ImageryProvider;
  terrainOk: boolean;
  visibleCats: Set<PinCategory>;
  selected: MapPin | null;
  onSelect: (pin: MapPin) => void;
  onFatal: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef(new Map<string, maplibregl.Marker>());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // -- init (once) ----------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const cfg = site.propertyMap;
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
        center: [cfg.center.lng, cfg.center.lat],
        zoom: cfg.zoom - 1.1,
        bearing: cfg.bearing,
        pitch: Math.max(0, cfg.pitch - 25),
        maxPitch: 72,
        attributionControl: { compact: true },
      });
    } catch {
      // WebGL unavailable — hand the experience to the illustrated renderer.
      onFatal();
      return;
    }
    mapRef.current = map;
    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "bottom-right"
    );

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.once("load", () => {
      // Cinematic settle-in from the slightly pulled-back initial framing.
      if (reduced) {
        map.jumpTo({ zoom: cfg.zoom, pitch: cfg.pitch });
      } else {
        map.easeTo({
          zoom: cfg.zoom,
          pitch: cfg.pitch,
          duration: 2600,
          easing: (t) => 1 - Math.pow(1 - t, 3),
        });
      }
    });

    const markers = markersRef.current;
    for (const pin of cfg.pins) {
      const el = buildPinElement(pin, (p) => onSelectRef.current(p));
      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([pin.coords.lng, pin.coords.lat])
        .addTo(map);
      markers.set(pin.id, marker);
    }

    return () => {
      markers.forEach((m) => m.remove());
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -- filter visibility ------------------------------------------------
  useEffect(() => {
    for (const pin of site.propertyMap.pins) {
      const el = markersRef.current.get(pin.id)?.getElement();
      el?.classList.toggle("pin-hidden", !visibleCats.has(pin.category));
    }
  }, [visibleCats]);

  // -- selection: highlight + flyTo --------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    for (const pin of site.propertyMap.pins) {
      const el = markersRef.current.get(pin.id)?.getElement();
      el?.classList.toggle("pin-selected", selected?.id === pin.id);
      el?.setAttribute("aria-pressed", String(selected?.id === pin.id));
    }
    if (!map || !selected) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const padding = desktop
      ? { top: 90, bottom: 40, left: 40, right: 470 }
      : { top: 80, bottom: Math.round(window.innerHeight * 0.55), left: 20, right: 20 };
    if (reduced) {
      map.jumpTo({ center: [selected.coords.lng, selected.coords.lat], zoom: 16, padding });
    } else {
      map.flyTo({
        center: [selected.coords.lng, selected.coords.lat],
        zoom: 16.1,
        pitch: 56,
        padding,
        duration: 2300,
        curve: 1.32,
      });
    }
  }, [selected]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full bg-night"
      role="application"
      aria-label={`Interactive aerial map of ${site.identity.courseName}`}
    />
  );
}
