import type { Hole } from "@/config/types";
import { makeProjector, samplePath, type XY } from "@/lib/geo";

/**
 * Illustrated-mode geometry: derives a plausible, handsome plan rendering
 * of a hole (fairway ribbon, green complex, tees, bunkers, tree line) from
 * nothing but its real coordinates + par. Deterministic per hole via a
 * seeded RNG so the artwork is stable across sessions.
 *
 * All output is in a local meter space, y *down* (SVG), with `viewBox`
 * giving the padded bounds.
 */

export interface TeePad {
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
}

export interface HoleShapes {
  viewBox: { x: number; y: number; w: number; h: number };
  /** Smooth centerline samples, tee → green. */
  centerline: XY[];
  /** SVG path data. */
  rough: string;
  fairway: string | null;
  green: string;
  greenCenter: XY;
  tees: TeePad[];
  bunkers: string[];
  creek: string | null;
  trees: { x: number; y: number; r: number }[];
  start: XY;
  end: XY;
  totalM: number;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth SVG path through points (quadratic midpoint technique). */
export function smoothPath(pts: XY[], close = false): string {
  if (pts.length < 2) return "";
  const p = pts;
  let d = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i].x + p[i + 1].x) / 2;
    const my = (p[i].y + p[i + 1].y) / 2;
    d += ` Q ${p[i].x.toFixed(1)} ${p[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const last = p[p.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  if (close) d += " Z";
  return d;
}

/** Irregular organic blob around a center. */
function blob(
  cx: number,
  cy: number,
  r: number,
  rng: () => number,
  squashAngle = 0,
  squash = 1
): string {
  const pts: XY[] = [];
  const n = 9;
  const phase = rng() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const wobble = 1 + 0.22 * Math.sin(a * 2.7 + phase) + (rng() - 0.5) * 0.16;
    const rr = r * wobble;
    const ex = Math.cos(a) * rr;
    const ey = Math.sin(a) * rr * squash;
    const cs = Math.cos(squashAngle);
    const sn = Math.sin(squashAngle);
    pts.push({ x: cx + ex * cs - ey * sn, y: cy + ex * sn + ey * cs });
  }
  pts.push(pts[0]);
  return smoothPath(pts, true);
}

export function computeHoleShapes(hole: Hole): HoleShapes {
  const rng = mulberry32(hole.number * 7919 + hole.par * 101);
  const waypoints = [hole.tee, ...hole.midpoints, hole.green];
  const centroid = {
    lat: waypoints.reduce((s, p) => s + p.lat, 0) / waypoints.length,
    lng: waypoints.reduce((s, p) => s + p.lng, 0) / waypoints.length,
  };
  const proj = makeProjector(centroid);
  const sampled = samplePath(waypoints, 72);
  // SVG space: x east, y SOUTH (flip) so north is up.
  const line: XY[] = sampled.points.map((p) => {
    const m = proj.toXY(p);
    return { x: m.x, y: -m.y };
  });
  const totalM = sampled.totalM;

  // Directions + normals
  const dirs: XY[] = line.map((p, i) => {
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(line.length - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  });
  const normals: XY[] = dirs.map((d) => ({ x: -d.y, y: d.x }));

  // Width profile (half-width, meters)
  const par = hole.par;
  const noisePhase = rng() * Math.PI * 2;
  const half = (t: number): number => {
    let w: number;
    if (par === 3) {
      // One-shotter: a slim walking apron that swells near the green.
      w = t < 0.55 ? 4 : 4 + (t - 0.55) * 26;
    } else {
      const bulges =
        par === 4
          ? Math.exp(-(((t - 0.52) / 0.2) ** 2)) * 9
          : Math.exp(-(((t - 0.38) / 0.16) ** 2)) * 8 +
            Math.exp(-(((t - 0.72) / 0.14) ** 2)) * 7;
      const ramp = Math.min(1, t / 0.14) * Math.min(1, (1.02 - t) / 0.1);
      w = (13 + bulges) * Math.max(0.12, ramp);
    }
    return w * (1 + 0.13 * Math.sin(t * 9 + noisePhase));
  };

  const leftPts: XY[] = [];
  const rightPts: XY[] = [];
  for (let i = 0; i < line.length; i++) {
    const t = i / (line.length - 1);
    const w = half(t);
    leftPts.push({ x: line[i].x + normals[i].x * w, y: line[i].y + normals[i].y * w });
    rightPts.push({ x: line[i].x - normals[i].x * w, y: line[i].y - normals[i].y * w });
  }
  const fairwayOutline = [...leftPts, ...rightPts.slice().reverse()];
  fairwayOutline.push(fairwayOutline[0]);
  const fairway = par === 3 ? null : smoothPath(fairwayOutline, true);

  // Rough band: a fatter version of the same corridor.
  const roughOutline: XY[] = [];
  for (let i = 0; i < line.length; i++) {
    const t = i / (line.length - 1);
    const w = half(t) + 13 + 6 * Math.sin(t * 5 + noisePhase);
    roughOutline.push({
      x: line[i].x + normals[i].x * w,
      y: line[i].y + normals[i].y * w,
    });
  }
  for (let i = line.length - 1; i >= 0; i--) {
    const t = i / (line.length - 1);
    const w = half(t) + 13 + 6 * Math.cos(t * 4.2 + noisePhase);
    roughOutline.push({
      x: line[i].x - normals[i].x * w,
      y: line[i].y - normals[i].y * w,
    });
  }
  roughOutline.push(roughOutline[0]);
  const rough = smoothPath(roughOutline, true);

  // Green: oriented blob at the end of the line.
  const end = line[line.length - 1];
  const endDir = dirs[dirs.length - 1];
  const greenAngle = Math.atan2(endDir.y, endDir.x);
  const greenR = par === 3 ? 13 : par === 4 ? 14 : 15;
  const green = blob(end.x, end.y, greenR, rng, greenAngle, 0.78);

  // Tee pads
  const start = line[0];
  const startDir = dirs[0];
  const teeAngle = (Math.atan2(startDir.y, startDir.x) * 180) / Math.PI;
  const tees: TeePad[] = [0, 1, 2].map((i) => ({
    x: start.x - startDir.x * i * 14,
    y: start.y - startDir.y * i * 14,
    w: 9 - i * 1.4,
    h: 5.5 - i * 0.6,
    angle: teeAngle,
  }));

  // Bunkers: greenside + fairway, seeded.
  const bunkers: string[] = [];
  const greensideCount = 1 + Math.floor(rng() * 2.4);
  for (let i = 0; i < greensideCount; i++) {
    const side = rng() > 0.5 ? 1 : -1;
    const a = greenAngle + side * (Math.PI / 2) * (0.7 + rng() * 0.7);
    const dist = greenR + 7 + rng() * 7;
    bunkers.push(
      blob(end.x + Math.cos(a) * dist, end.y + Math.sin(a) * dist, 4.5 + rng() * 3.5, rng)
    );
  }
  if (par >= 4) {
    const zones = par === 4 ? [0.52] : [0.38, 0.72];
    for (const z of zones) {
      if (rng() < 0.8) {
        const i = Math.floor(z * (line.length - 1));
        const side = rng() > 0.5 ? 1 : -1;
        const off = half(z) + 5 + rng() * 4;
        bunkers.push(
          blob(
            line[i].x + normals[i].x * off * side,
            line[i].y + normals[i].y * off * side,
            5 + rng() * 3,
            rng
          )
        );
      }
    }
  }

  // Decorative creek on a quarter of holes (seeded), crossing ~t=0.7.
  let creek: string | null = null;
  if (rng() < 0.28 && par >= 4) {
    const i = Math.floor(0.7 * (line.length - 1));
    const n = normals[i];
    const c = line[i];
    const span = half(0.7) + 36;
    const creekPts: XY[] = [];
    for (let s = -1; s <= 1.001; s += 0.25) {
      creekPts.push({
        x: c.x + n.x * span * s + dirs[i].x * Math.sin(s * 5) * 10,
        y: c.y + n.y * span * s + dirs[i].y * Math.sin(s * 5) * 10,
      });
    }
    creek = smoothPath(creekPts);
  }

  // Tree scatter along the corridor edges.
  const trees: { x: number; y: number; r: number }[] = [];
  for (let i = 4; i < line.length - 5; i += 3) {
    const t = i / (line.length - 1);
    for (const side of [1, -1]) {
      if (rng() < 0.62) {
        const off = half(t) + 20 + rng() * 26;
        trees.push({
          x: line[i].x + normals[i].x * off * side + (rng() - 0.5) * 10,
          y: line[i].y + normals[i].y * off * side + (rng() - 0.5) * 10,
          r: 2.6 + rng() * 2.8,
        });
      }
    }
  }

  // Bounds (+ padding)
  const xs = roughOutline.map((p) => p.x).concat(trees.map((t) => t.x));
  const ys = roughOutline.map((p) => p.y).concat(trees.map((t) => t.y));
  const pad = 30;
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const maxX = Math.max(...xs) + pad;
  const maxY = Math.max(...ys) + pad;

  return {
    viewBox: { x: minX, y: minY, w: maxX - minX, h: maxY - minY },
    centerline: line,
    rough,
    fairway,
    green,
    greenCenter: end,
    tees,
    bunkers,
    creek,
    trees,
    start,
    end,
    totalM,
  };
}
