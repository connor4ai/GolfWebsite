import type { LatLng } from "@/config/types";

/**
 * Lightweight geodesy + path utilities for the flyover engine and the
 * illustrated renderers. Distances are short (a golf property), so
 * spherical formulas and local-plane approximations are more than enough.
 */

export const EARTH_R = 6371000;
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

export function distanceM(a: LatLng, b: LatLng): number {
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δφ = toRad(b.lat - a.lat);
  const Δλ = toRad(b.lng - a.lng);
  const h =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(h));
}

export function bearingDeg(a: LatLng, b: LatLng): number {
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δλ = toRad(b.lng - a.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function destination(p: LatLng, bearing: number, distM: number): LatLng {
  const δ = distM / EARTH_R;
  const θ = toRad(bearing);
  const φ1 = toRad(p.lat);
  const λ1 = toRad(p.lng);
  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );
  return { lat: toDeg(φ2), lng: toDeg(λ2) };
}

/** Shortest-arc interpolation between two compass bearings. */
export function lerpBearing(a: number, b: number, t: number): number {
  let d = ((b - a + 540) % 360) - 180;
  return (a + d * t + 360) % 360;
}

// ---------------------------------------------------------------------------
// Smooth path sampling (Catmull–Rom through tee → midpoints → green)
// ---------------------------------------------------------------------------

export interface SampledPath {
  /** Evenly indexed spline samples. */
  points: LatLng[];
  /** Cumulative distance (m) at each sample; last entry = total length. */
  cum: number[];
  totalM: number;
}

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

export function samplePath(waypoints: LatLng[], samples = 96): SampledPath {
  const pts = waypoints;
  if (pts.length < 2) {
    const only = pts[0] ?? { lat: 0, lng: 0 };
    return { points: [only, only], cum: [0, 0], totalM: 0 };
  }
  const padded = [pts[0], ...pts, pts[pts.length - 1]];
  const out: LatLng[] = [];
  const segs = pts.length - 1;
  for (let i = 0; i < samples; i++) {
    const u = (i / (samples - 1)) * segs;
    const seg = Math.min(Math.floor(u), segs - 1);
    const t = u - seg;
    const a = padded[seg];
    const b = padded[seg + 1];
    const c = padded[seg + 2];
    const d = padded[seg + 3];
    out.push({
      lat: catmullRom(a.lat, b.lat, c.lat, d.lat, t),
      lng: catmullRom(a.lng, b.lng, c.lng, d.lng, t),
    });
  }
  const cum: number[] = [0];
  for (let i = 1; i < out.length; i++) {
    cum.push(cum[i - 1] + distanceM(out[i - 1], out[i]));
  }
  return { points: out, cum, totalM: cum[cum.length - 1] };
}

/** Point at distance-fraction f (0–1) along a sampled path. */
export function pointAt(path: SampledPath, f: number): LatLng {
  const target = Math.max(0, Math.min(1, f)) * path.totalM;
  const { points, cum } = path;
  let lo = 0;
  let hi = cum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  const i = Math.max(1, lo);
  const span = cum[i] - cum[i - 1] || 1;
  const t = (target - cum[i - 1]) / span;
  const a = points[i - 1];
  const b = points[i];
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

/** Travel bearing at distance-fraction f, smoothed over a small window. */
export function bearingAt(path: SampledPath, f: number): number {
  const ahead = pointAt(path, Math.min(1, f + 0.035));
  const behind = pointAt(path, Math.max(0, f - 0.035));
  return bearingDeg(behind, ahead);
}

// ---------------------------------------------------------------------------
// Local planar projection (meters east/north of an origin) for SVG renderers
// ---------------------------------------------------------------------------

export interface XY {
  x: number;
  y: number;
}

export function makeProjector(origin: LatLng) {
  const kx = 111320 * Math.cos(toRad(origin.lat));
  const ky = 111320;
  return {
    toXY(p: LatLng): XY {
      return { x: (p.lng - origin.lng) * kx, y: (p.lat - origin.lat) * ky };
    },
    toLatLng(p: XY): LatLng {
      return { lat: origin.lat + p.y / ky, lng: origin.lng + p.x / kx };
    },
  };
}

// ---------------------------------------------------------------------------
// Easing
// ---------------------------------------------------------------------------

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
