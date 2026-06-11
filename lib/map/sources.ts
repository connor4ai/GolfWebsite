import type { StyleSpecification, RasterDEMSourceSpecification } from "maplibre-gl";

/**
 * Keyless map sources.
 *
 * Imagery — Esri World Imagery (primary) with USGS Imagery (US coverage)
 * as a secondary host. Both are raster tile services that require
 * attribution but no token. tile-health.ts probes them at runtime and the
 * experience downgrades to the illustrated renderer if neither responds.
 *
 * Terrain — AWS Open Data Terrain Tiles (Mapzen terrarium encoding).
 * MapLibre's raster-dem source accepts `encoding: "terrarium"` natively;
 * buildTerrainSource() centralizes that configuration (decode constants
 * included for reference: elevation = R*256 + G + B/256 − 32768).
 */

export interface ImageryProvider {
  id: "esri" | "usgs";
  name: string;
  tiles: string[];
  attribution: string;
  maxzoom: number;
}

export const IMAGERY_PROVIDERS: ImageryProvider[] = [
  {
    id: "esri",
    name: "Esri World Imagery",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution:
      "Imagery © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    maxzoom: 19,
  },
  {
    id: "usgs",
    name: "USGS Imagery",
    tiles: [
      "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution: "Imagery courtesy of the U.S. Geological Survey",
    maxzoom: 16,
  },
];

export const TERRAIN_TILES =
  "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";

export const TERRAIN_ATTRIBUTION =
  "Terrain: Mapzen/AWS Open Data Terrain Tiles (USGS 3DEP, SRTM)";

/** Terrarium decode constants, exposed for tests/reference. */
export const TERRARIUM = {
  redFactor: 256,
  greenFactor: 1,
  blueFactor: 1 / 256,
  baseShift: -32768,
} as const;

export function buildTerrainSource(): RasterDEMSourceSpecification {
  return {
    type: "raster-dem",
    tiles: [TERRAIN_TILES],
    tileSize: 256,
    // MapLibre understands the Mapzen terrarium RGB packing directly —
    // this is the "conversion utility": correct encoding + zoom bounds.
    encoding: "terrarium",
    maxzoom: 14,
    attribution: TERRAIN_ATTRIBUTION,
  };
}

/**
 * Full-screen satellite style with 3D terrain + hillshade. `provider` has
 * already been health-checked by the caller.
 */
export function buildSatelliteStyle(provider: ImageryProvider): StyleSpecification {
  return {
    version: 8,
    sources: {
      imagery: {
        type: "raster",
        tiles: provider.tiles,
        tileSize: 256,
        maxzoom: provider.maxzoom,
        attribution: provider.attribution,
      },
      // Deliberately separate DEM sources for terrain vs. hillshade —
      // sharing one raster-dem source between the two is a known MapLibre
      // flicker footgun; the HTTP cache dedupes the tile fetches anyway.
      "terrain-dem": buildTerrainSource(),
      "hillshade-dem": buildTerrainSource(),
    },
    layers: [
      // Matches the brand's night background so tile seams never flash white.
      { id: "bg", type: "background", paint: { "background-color": "#101511" } },
      {
        id: "imagery",
        type: "raster",
        source: "imagery",
        paint: {
          "raster-fade-duration": 250,
          // Slightly cinematic grade: lift saturation, deepen shadows.
          "raster-saturation": 0.12,
          "raster-contrast": 0.08,
          "raster-brightness-max": 0.95,
        },
      },
      {
        id: "hillshade",
        type: "hillshade",
        source: "hillshade-dem",
        paint: {
          "hillshade-exaggeration": 0.35,
          "hillshade-shadow-color": "#0b0f0c",
          "hillshade-highlight-color": "#f2ede3",
          "hillshade-accent-color": "#2e4d3a",
        },
      },
    ],
    // Lower-zoom DEM fetches keep flyovers smooth on modest connections.
    terrain: { source: "terrain-dem", exaggeration: 1.3 },
  };
}
