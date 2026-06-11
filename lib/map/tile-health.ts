import type { LatLng } from "@/config/types";
import { IMAGERY_PROVIDERS, TERRAIN_TILES, type ImageryProvider } from "./sources";

/**
 * Runtime resilience: before mounting a satellite map we probe one real
 * tile from each imagery provider (and the terrain host). Offline, blocked
 * by CSP/firewall, or provider outage → the UI falls back to the
 * illustrated renderer instead of showing a broken black canvas.
 *
 * Results are cached per session so the probe cost is paid once.
 */

const PROBE_TIMEOUT_MS = 4000;
const CACHE_KEY = "fairway.tilehealth.v1";

export interface TileHealth {
  imagery: ImageryProvider | null;
  terrain: boolean;
}

function lngLatToTile(p: LatLng, z: number) {
  const n = 2 ** z;
  const x = Math.floor(((p.lng + 180) / 360) * n);
  const latRad = (p.lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y, z };
}

async function probeUrl(url: string): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "force-cache" });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function fill(tpl: string, t: { x: number; y: number; z: number }) {
  return tpl
    .replace("{z}", String(t.z))
    .replace("{x}", String(t.x))
    .replace("{y}", String(t.y));
}

let inflight: Promise<TileHealth> | null = null;

export function checkTileHealth(center: LatLng): Promise<TileHealth> {
  if (typeof window === "undefined") {
    return Promise.resolve({ imagery: IMAGERY_PROVIDERS[0], terrain: true });
  }
  // Session cache
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as { imageryId: string | null; terrain: boolean };
      return Promise.resolve({
        imagery: IMAGERY_PROVIDERS.find((p) => p.id === saved.imageryId) ?? null,
        terrain: saved.terrain,
      });
    }
  } catch {
    /* sessionStorage unavailable — probe every time */
  }

  if (inflight) return inflight;

  const tile = lngLatToTile(center, 12);
  inflight = (async () => {
    let imagery: ImageryProvider | null = null;
    for (const provider of IMAGERY_PROVIDERS) {
      // eslint-disable-next-line no-await-in-loop
      if (await probeUrl(fill(provider.tiles[0], tile))) {
        imagery = provider;
        break;
      }
    }
    const terrain = await probeUrl(fill(TERRAIN_TILES, tile));
    const health: TileHealth = { imagery, terrain };
    try {
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ imageryId: imagery?.id ?? null, terrain })
      );
    } catch {
      /* ignore */
    }
    return health;
  })();
  return inflight;
}

/** Clear the cached probe (used by the satellite/illustrated toggle). */
export function resetTileHealth() {
  inflight = null;
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}
