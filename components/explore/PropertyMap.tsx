"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { site } from "@/lib/site";
import type { MapPin, PinCategory } from "@/config/types";
import { buildSatelliteStyle, type ImageryProvider } from "@/lib/map/sources";
import { buildPinElement, buildHolePinElement } from "./pin-icons";

export interface TourStop {
  coords: { lat: number; lng: number };
  bearing?: number;
  zoom?: number;
}

export function PropertyMap({
  provider,
  terrainOk,
  pins,
  visibleCats,
  selected,
  onSelect,
  onFatal,
  touring = false,
  tourStops = [],
  onTourEnd,
}: {
  provider: ImageryProvider;
  terrainOk: boolean;
  pins: MapPin[];
  visibleCats: Set<PinCategory>;
  selected: MapPin | null;
  onSelect: (pin: MapPin) => void;
  onFatal: () => void;
  touring?: boolean;
  tourStops?: TourStop[];
  onTourEnd?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef(new Map<string, maplibregl.Marker>());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onTourEndRef = useRef(onTourEnd);
  onTourEndRef.current = onTourEnd;
  const interactedRef = useRef(false);

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
        zoom: cfg.zoom - 1.6,
        bearing: cfg.bearing,
        pitch: Math.max(0, cfg.pitch - 30),
        maxPitch: 78,
        attributionControl: { compact: true },
      });
    } catch {
      onFatal();
      return;
    }
    mapRef.current = map;
    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "bottom-right"
    );

    const markInteract = () => {
      interactedRef.current = true;
    };
    map.on("mousedown", markInteract);
    map.on("touchstart", markInteract);
    map.on("wheel", markInteract);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.once("load", () => {
      // High-altitude arrival: settle down onto the property.
      if (reduced) {
        map.jumpTo({ zoom: cfg.zoom, pitch: cfg.pitch });
      } else {
        map.easeTo({
          zoom: cfg.zoom,
          pitch: cfg.pitch,
          duration: 3200,
          easing: (t) => 1 - Math.pow(1 - t, 3),
        });
      }
    });

    // Idle cinema: an almost-still orbit when the visitor rests.
    let idleRaf = 0;
    let lastInteract = performance.now();
    const noteActivity = () => {
      lastInteract = performance.now();
    };
    map.on("move", () => {
      if (interactedRef.current) noteActivity();
    });
    if (!reduced) {
      const drift = (now: number) => {
        if (!mapRef.current) return;
        const idleFor = now - lastInteract;
        if (idleFor > 9000 && !document.hidden) {
          map.setBearing(map.getBearing() + 0.012);
        }
        idleRaf = requestAnimationFrame(drift);
      };
      idleRaf = requestAnimationFrame(drift);
    }

    const markers = markersRef.current;
    for (const pin of pins) {
      const holeMatch = /^hole-(\d+)$/.exec(pin.id);
      const el = holeMatch
        ? buildHolePinElement(pin, holeMatch[1], (p) => onSelectRef.current(p))
        : buildPinElement(pin, (p) => onSelectRef.current(p));
      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([pin.coords.lng, pin.coords.lat])
        .addTo(map);
      markers.set(pin.id, marker);
    }

    return () => {
      cancelAnimationFrame(idleRaf);
      markers.forEach((m) => m.remove());
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -- filter visibility ------------------------------------------------
  useEffect(() => {
    for (const pin of pins) {
      const el = markersRef.current.get(pin.id)?.getElement();
      el?.classList.toggle("pin-hidden", !visibleCats.has(pin.category));
    }
  }, [pins, visibleCats]);

  // -- selection: highlight + flyTo --------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    for (const pin of pins) {
      const el = markersRef.current.get(pin.id)?.getElement();
      el?.classList.toggle("pin-selected", selected?.id === pin.id);
      el?.setAttribute("aria-pressed", String(selected?.id === pin.id));
    }
    if (!map || !selected || touring) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const padding = desktop
      ? { top: 90, bottom: 40, left: 40, right: 470 }
      : { top: 80, bottom: Math.round(window.innerHeight * 0.55), left: 20, right: 20 };
    if (reduced) {
      map.jumpTo({ center: [selected.coords.lng, selected.coords.lat], zoom: 16.2, padding });
    } else {
      map.flyTo({
        center: [selected.coords.lng, selected.coords.lat],
        zoom: 16.3,
        pitch: 58,
        padding,
        duration: 2300,
        curve: 1.32,
      });
    }
  }, [pins, selected, touring]);

  // -- auto-flying property tour ------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !touring || tourStops.length === 0) return;
    let cancelled = false;
    let timer = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dwellMs = (site.propertyMap.tour?.dwell ?? 3) * 1000;
    const stopTour = () => {
      if (cancelled) return;
      cancelled = true;
      onTourEndRef.current?.();
    };
    map.on("mousedown", stopTour);
    map.on("wheel", stopTour);
    map.on("touchstart", stopTour);

    let i = 0;
    const next = () => {
      if (cancelled || !mapRef.current) return;
      if (i >= tourStops.length) {
        stopTour();
        return;
      }
      const stop = tourStops[i];
      const bearing = stop.bearing ?? map.getBearing() + 24;
      if (reduced) {
        map.jumpTo({
          center: [stop.coords.lng, stop.coords.lat],
          zoom: stop.zoom ?? 16.1,
          bearing,
          pitch: 55,
        });
        i += 1;
        timer = window.setTimeout(next, dwellMs);
      } else {
        map.flyTo({
          center: [stop.coords.lng, stop.coords.lat],
          zoom: stop.zoom ?? 16.1,
          bearing,
          pitch: 56,
          duration: 2700,
          curve: 1.25,
        });
        i += 1;
        timer = window.setTimeout(next, 2700 + dwellMs);
      }
    };
    next();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      map.off("mousedown", stopTour);
      map.off("wheel", stopTour);
      map.off("touchstart", stopTour);
    };
  }, [touring, tourStops]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full bg-night"
      role="application"
      aria-label={`Interactive aerial map of ${site.identity.courseName}`}
    />
  );
}
