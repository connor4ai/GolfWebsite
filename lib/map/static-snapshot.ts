"use client";

import maplibregl from "maplibre-gl";
import type { SatView } from "@/config/types";
import { buildSatelliteStyle, type ImageryProvider } from "./sources";

/**
 * Renders real satellite/aerial imagery of given coordinates into a JPEG
 * data-URL, off-DOM, then destroys the map. A small queue bounds
 * concurrent WebGL contexts; results are memoized per view for the
 * session, so a gallery of aerial crops costs a handful of contexts
 * total rather than one per image.
 */

const cache = new Map<string, Promise<string>>();
const MAX_CONCURRENT = 2;
let active = 0;
const waiters: (() => void)[] = [];

function acquire(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active++;
    return Promise.resolve();
  }
  return new Promise((res) => waiters.push(res));
}
function release() {
  const next = waiters.shift();
  if (next) next();
  else active--;
}

export function keyOf(view: SatView, w: number, h: number): string {
  const { center, zoom, bearing = 0, pitch = 0 } = view;
  return [
    center.lat.toFixed(5),
    center.lng.toFixed(5),
    zoom.toFixed(2),
    bearing.toFixed(0),
    pitch.toFixed(0),
    w,
    h,
  ].join("|");
}

export function snapshotSatellite(
  provider: ImageryProvider,
  terrainOk: boolean,
  view: SatView,
  width: number,
  height: number
): Promise<string> {
  const key = provider.id + "|" + keyOf(view, width, height);
  const hit = cache.get(key);
  if (hit) return hit;

  const job = (async () => {
    await acquire();
    try {
      return await new Promise<string>((resolve, reject) => {
        const container = document.createElement("div");
        container.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:${height}px;`;
        document.body.appendChild(container);

        const style = buildSatelliteStyle(provider);
        // Crops are flat photography; terrain only matters when pitched.
        if (!terrainOk || !(view.pitch && view.pitch > 0)) {
          delete style.terrain;
          delete style.sources["terrain-dem"];
        }
        // When the terrain host is unhealthy, hillshade tiles would hang
        // the 'idle' event and time out every snapshot — strip them too.
        if (!terrainOk) {
          delete style.sources["hillshade-dem"];
          style.layers = style.layers.filter((l) => l.id !== "hillshade");
        }

        let settled = false;
        const finish = (fn: () => void) => {
          if (settled) return;
          settled = true;
          fn();
          map.remove();
          container.remove();
        };

        let map: maplibregl.Map;
        try {
          map = new maplibregl.Map({
            container,
            style,
            center: [view.center.lng, view.center.lat],
            zoom: view.zoom,
            bearing: view.bearing ?? 0,
            pitch: view.pitch ?? 0,
            interactive: false,
            attributionControl: false,
            fadeDuration: 0,
            // required for toDataURL (MapLibre v4 option shape)
            preserveDrawingBuffer: true,
          });
        } catch (e) {
          // WebGL context exhaustion etc. — don't orphan the container.
          container.remove();
          reject(e as Error);
          return;
        }

        const timeout = window.setTimeout(
          () => finish(() => reject(new Error("snapshot timeout"))),
          15000
        );

        map.once("idle", () => {
          window.clearTimeout(timeout);
          try {
            const url = map.getCanvas().toDataURL("image/jpeg", 0.86);
            // A blank/black canvas means tiles never arrived.
            finish(() => (url.length > 2000 ? resolve(url) : reject(new Error("empty snapshot"))));
          } catch (e) {
            finish(() => reject(e as Error));
          }
        });
        map.once("error", () => {
          /* per-tile errors are fine; idle decides */
        });
      });
    } finally {
      release();
    }
  })();

  cache.set(key, job);
  job.catch(() => cache.delete(key));
  return job;
}
