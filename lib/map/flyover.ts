import type { Map as MapLibreMap, GeoJSONSource } from "maplibre-gl";
import type { Hole, LatLng } from "@/config/types";
import {
  samplePath,
  pointAt,
  bearingAt,
  destination,
  lerpBearing,
  easeInOutSine,
  easeOutCubic,
  type SampledPath,
} from "@/lib/geo";

export type FlyoverPhase = "intro" | "flight" | "orbit" | "idle";

export interface FlyoverCallbacks {
  onPhase?: (phase: FlyoverPhase) => void;
  onProgress?: (t: number) => void;
}

export interface FlyoverOptions extends FlyoverCallbacks {
  /** Skip all camera animation; show the whole hole + completed line. */
  reducedMotion?: boolean;
  /** Mobile: compress timings (~0.6×). */
  shortTimings?: boolean;
  accentColor?: string;
}

const SRC_LINE = "flyover-line";
const SRC_HEAD = "flyover-head";
const SRC_ENDS = "flyover-ends";

/**
 * Scripted cinematic flyover for one hole.
 *
 * Phases: a high reveal behind the tee → a 60°-pitch flight following the
 * playing line (bearings derived from the path itself) while the shot arc
 * draws onto the terrain → a slow continuous orbit of the green.
 *
 * Built on per-frame jumpTo with explicit easing so it stays deterministic
 * under terrain and can be cancelled at any frame.
 */
export class FlyoverEngine {
  private map: MapLibreMap;
  private hole: Hole;
  private path: SampledPath;
  private opts: FlyoverOptions;
  private raf = 0;
  private cancelled = false;
  private phase: FlyoverPhase = "idle";
  private orbitFrom = 0;

  constructor(map: MapLibreMap, hole: Hole, opts: FlyoverOptions = {}) {
    this.map = map;
    this.hole = hole;
    this.opts = opts;
    this.path = samplePath([hole.tee, ...hole.midpoints, hole.green], 120);
  }

  private get durations() {
    const k = this.opts.shortTimings ? 0.6 : 1;
    const flightBase =
      this.hole.par === 3 ? 9000 : this.hole.par === 4 ? 13500 : 17000;
    return {
      intro: 3200 * k,
      flight: flightBase * k,
      orbitRevolution: 30000, // one full turn; runs until cancelled
    };
  }

  // ---- geojson scaffolding ------------------------------------------------

  private ensureLayers() {
    const map = this.map;
    const accent = this.opts.accentColor ?? "#c2a35d";
    if (!map.getSource(SRC_LINE)) {
      map.addSource(SRC_LINE, { type: "geojson", data: emptyLine() });
      map.addSource(SRC_HEAD, { type: "geojson", data: emptyPoints([]) });
      map.addSource(SRC_ENDS, { type: "geojson", data: emptyPoints([]) });
      map.addLayer({
        id: `${SRC_LINE}-glow`,
        type: "line",
        source: SRC_LINE,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": accent,
          "line-width": 10,
          "line-opacity": 0.28,
          "line-blur": 6,
        },
      });
      map.addLayer({
        id: `${SRC_LINE}-core`,
        type: "line",
        source: SRC_LINE,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#f6f1e4", "line-width": 2.4, "line-opacity": 0.95 },
      });
      map.addLayer({
        id: `${SRC_HEAD}-dot`,
        type: "circle",
        source: SRC_HEAD,
        paint: {
          "circle-radius": 6,
          "circle-color": "#ffffff",
          "circle-blur": 0.2,
          "circle-stroke-color": accent,
          "circle-stroke-width": 3,
        },
      });
      map.addLayer({
        id: `${SRC_ENDS}-dots`,
        type: "circle",
        source: SRC_ENDS,
        paint: {
          "circle-radius": ["case", ["==", ["get", "kind"], "green"], 7, 5],
          "circle-color": [
            "case",
            ["==", ["get", "kind"], "green"],
            accent,
            "#f6f1e4",
          ],
          "circle-opacity": 0.95,
          "circle-stroke-color": "#10120d",
          "circle-stroke-width": 1.5,
        },
      });
    }
    this.setEnds();
  }

  private setEnds() {
    const src = this.map.getSource(SRC_ENDS) as GeoJSONSource | undefined;
    src?.setData(
      emptyPoints([
        { p: this.hole.tee, kind: "tee" },
        { p: this.hole.green, kind: "green" },
      ])
    );
  }

  private setLineProgress(f: number) {
    const lineSrc = this.map.getSource(SRC_LINE) as GeoJSONSource | undefined;
    const headSrc = this.map.getSource(SRC_HEAD) as GeoJSONSource | undefined;
    if (!lineSrc || !headSrc) return;
    const pts = this.path.points;
    const head = pointAt(this.path, f);
    const upto = Math.max(1, Math.floor(f * (pts.length - 1)));
    const coords = pts.slice(0, upto + 1).map((p) => [p.lng, p.lat]);
    coords.push([head.lng, head.lat]);
    lineSrc.setData({
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: coords },
    });
    headSrc.setData(emptyPoints(f >= 1 ? [] : [{ p: head, kind: "head" }]));
  }

  // ---- phases ---------------------------------------------------------

  start() {
    this.cancelled = false;
    this.ensureLayers();
    if (this.opts.reducedMotion) {
      this.showStatic();
      return;
    }
    this.runIntro();
  }

  /** Reduced-motion / static presentation: whole hole, completed line. */
  private showStatic() {
    this.setLineProgress(1);
    const mid = pointAt(this.path, 0.5);
    const b = bearingAt(this.path, 0.06);
    this.map.jumpTo({
      center: [mid.lng, mid.lat],
      zoom: this.zoomForLength(),
      pitch: 42,
      bearing: b,
    });
    this.setPhase("idle");
    this.opts.onProgress?.(1);
  }

  private zoomForLength() {
    const m = this.path.totalM;
    if (m < 220) return 16.6;
    if (m < 380) return 16.0;
    if (m < 480) return 15.7;
    return 15.4;
  }

  private setPhase(p: FlyoverPhase) {
    this.phase = p;
    this.opts.onPhase?.(p);
  }

  private frame(cb: FrameRequestCallback) {
    if (this.cancelled) return;
    this.raf = requestAnimationFrame(cb);
  }

  private runIntro() {
    this.setPhase("intro");
    const d = this.durations.intro;
    const b0 = bearingAt(this.path, 0.02);
    // Camera floats high behind the tee, descending to launch height while
    // the view settles onto the line of play.
    const lookFrom = destination(this.hole.tee, b0, 90);
    const start = performance.now();
    this.setLineProgress(0.001);
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / d);
      const e = easeOutCubic(t);
      this.map.jumpTo({
        center: [lookFrom.lng, lookFrom.lat],
        zoom: 13.9 + (15.8 - 13.9) * e,
        pitch: 28 + (58 - 28) * e,
        bearing: lerpBearing(b0 - 24, b0, e),
      });
      if (t < 1) this.frame(step);
      else this.runFlight();
    };
    this.frame(step);
  }

  private runFlight() {
    this.setPhase("flight");
    const d = this.durations.flight;
    const start = performance.now();
    const step = (now: number) => {
      const raw = Math.min(1, (now - start) / d);
      const f = easeInOutSine(raw);
      // Focus rides slightly ahead of the drawn line so the camera leads
      // the shot; the lead shrinks to zero on the green.
      const lead = 0.1 * (1 - f);
      const focus = pointAt(this.path, Math.min(1, f + lead));
      const bearing = bearingAt(this.path, Math.min(1, f + lead * 0.5));
      const zoom = 15.8 + 0.7 * Math.sin(Math.PI * f); // breathe out mid-flight
      const pitch = 58 + 4 * Math.sin(Math.PI * f);
      this.map.jumpTo({
        center: [focus.lng, focus.lat],
        zoom,
        pitch,
        bearing: lerpBearing(this.map.getBearing(), bearing, 0.18),
      });
      this.setLineProgress(f);
      this.opts.onProgress?.(f);
      if (raw < 1) this.frame(step);
      else this.runOrbit();
    };
    this.frame(step);
  }

  private runOrbit() {
    this.setPhase("orbit");
    this.setLineProgress(1);
    const g = this.hole.green;
    this.orbitFrom = this.map.getBearing();
    const start = performance.now();
    const rev = this.durations.orbitRevolution;
    const step = (now: number) => {
      const t = (now - start) / rev;
      const settle = Math.min(1, t * 6); // ease into orbit zoom over ~5s
      this.map.jumpTo({
        center: [g.lng, g.lat],
        zoom: 16.5 - 0.25 * (1 - settle),
        pitch: 56,
        bearing: (this.orbitFrom + 360 * t) % 360,
      });
      this.frame(step);
    };
    this.frame(step);
  }

  /** Stop animating but leave the drawn line in place. */
  cancel() {
    this.cancelled = true;
    cancelAnimationFrame(this.raf);
    this.setPhase("idle");
  }

  /** Remove every flyover layer/source from the map. */
  dispose() {
    this.cancel();
    const map = this.map;
    for (const id of [
      `${SRC_LINE}-glow`,
      `${SRC_LINE}-core`,
      `${SRC_HEAD}-dot`,
      `${SRC_ENDS}-dots`,
    ]) {
      if (map.getLayer(id)) map.removeLayer(id);
    }
    for (const id of [SRC_LINE, SRC_HEAD, SRC_ENDS]) {
      if (map.getSource(id)) map.removeSource(id);
    }
  }
}

// ---- GeoJSON helpers -------------------------------------------------------

function emptyLine(): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates: [] },
  };
}

function emptyPoints(
  pts: { p: LatLng; kind: string }[]
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: pts.map(({ p, kind }) => ({
      type: "Feature",
      properties: { kind },
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
    })),
  };
}
