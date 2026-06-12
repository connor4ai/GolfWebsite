/**
 * One-time generator for the Highmark Ridge demo routing.
 *
 * Lays 18 holes across real Blue Ridge terrain (Patrick County, VA — the
 * plateau rim above the Dan River gorge, ~36.71N -80.45W) using bearings +
 * lengths, then emits coordinate literals consumed by the demo config.
 * Holes chain green → next tee with a short walk; holes 9 and 18 are aimed
 * back at fixed points beside the clubhouse so the routing closes properly.
 *
 * Run: node scripts/layout-holes.mjs
 */

const CLUBHOUSE = { lat: 36.7165, lng: -80.447 };
const YD = 0.9144; // meters per yard
const R = 6371000; // earth radius, meters

const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;

/** Great-circle destination point. */
function destination({ lat, lng }, bearingDeg, distMeters) {
  const δ = distMeters / R;
  const θ = toRad(bearingDeg);
  const φ1 = toRad(lat);
  const λ1 = toRad(lng);
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

function distanceM(a, b) {
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δφ = toRad(b.lat - a.lat);
  const Δλ = toRad(b.lng - a.lng);
  const h =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function bearingDeg(a, b) {
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δλ = toRad(b.lng - a.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Routing spec. Each hole: par, segments [{b: bearing°, d: yards}].
 * `walk` = green → next tee distance (yards) at `walkB` bearing.
 * `closeTo` aims the final segment at a fixed offset from the clubhouse.
 */
const FRONT = [
  { n: 1, par: 4, segs: [{ b: 238, d: 412 }], walkB: 300, walk: 38 },
  { n: 2, par: 5, segs: [{ b: 278, d: 320 }, { b: 252, d: 228 }], walkB: 350, walk: 42 },
  { n: 3, par: 3, segs: [{ b: 331, d: 188 }], walkB: 20, walk: 30 },
  { n: 4, par: 4, segs: [{ b: 14, d: 433 }], walkB: 60, walk: 36 },
  { n: 5, par: 4, segs: [{ b: 56, d: 395 }], walkB: 95, walk: 32 },
  { n: 6, par: 3, segs: [{ b: 101, d: 172 }], walkB: 130, walk: 34 },
  { n: 7, par: 5, segs: [{ b: 144, d: 300 }, { b: 172, d: 260 }], walkB: 195, walk: 40 },
  { n: 8, par: 4, segs: [{ b: 187, d: 430 }], walkB: 90, walk: 36 },
  { n: 9, par: 4, closeTo: { b: 250, d: 70 } }, // green 70yd SW of clubhouse
];

const BACK = [
  { n: 10, par: 4, segs: [{ b: 82, d: 405 }], walkB: 120, walk: 36 },
  { n: 11, par: 4, segs: [{ b: 151, d: 380 }], walkB: 190, walk: 34 },
  { n: 12, par: 3, segs: [{ b: 206, d: 196 }], walkB: 240, walk: 30 },
  { n: 13, par: 5, segs: [{ b: 247, d: 290 }, { b: 224, d: 245 }], walkB: 280, walk: 40 },
  { n: 14, par: 4, segs: [{ b: 291, d: 460 }], walkB: 330, walk: 36 },
  { n: 15, par: 4, segs: [{ b: 346, d: 390 }], walkB: 15, walk: 32 },
  { n: 16, par: 3, segs: [{ b: 31, d: 225 }], walkB: 60, walk: 34 },
  { n: 17, par: 5, segs: [{ b: 30, d: 300 }, { b: 60, d: 221 }], walkB: 160, walk: 40 },
  { n: 18, par: 4, closeTo: { b: 130, d: 85 } }, // green 85yd SE of clubhouse
];

function layoutNine(spec, startTee) {
  const holes = [];
  let tee = startTee;
  for (const h of spec) {
    let green;
    const midpoints = [];
    if (h.closeTo) {
      green = destination(CLUBHOUSE, h.closeTo.b, h.closeTo.d * YD);
      const len = distanceM(tee, green) / YD;
      // Slight fairway bend for visual interest on the closer.
      const midB = bearingDeg(tee, green);
      const mid = destination(
        destination(tee, midB, len * 0.55 * YD),
        midB + 90,
        18 * YD
      );
      midpoints.push(mid);
      holes.push({ n: h.n, par: h.par, tee, green, midpoints, yards: Math.round(len) });
      tee = h.next ? null : tee;
    } else {
      let cursor = tee;
      let total = 0;
      for (let i = 0; i < h.segs.length; i++) {
        const seg = h.segs[i];
        cursor = destination(cursor, seg.b, seg.d * YD);
        total += seg.d;
        if (i < h.segs.length - 1) midpoints.push(cursor);
      }
      green = cursor;
      holes.push({ n: h.n, par: h.par, tee, green, midpoints, yards: total });
    }
    if (h.walk) tee = destination(green, h.walkB, h.walk * YD);
  }
  return holes;
}

// Tee 1 sits a short walk south-west of the clubhouse terrace.
const tee1 = destination(CLUBHOUSE, 230, 55 * YD);
const front = layoutNine(FRONT, tee1);
// Tee 10 east of the clubhouse, past the practice green.
const tee10 = destination(CLUBHOUSE, 95, 65 * YD);
const back = layoutNine(BACK, tee10);
const holes = [...front, ...back];

// --- sanity report -------------------------------------------------------
let out = 0;
for (const h of holes) {
  const flag =
    h.par === 3
      ? h.yards >= 150 && h.yards <= 240
      : h.yards >= 380 && h.yards <= 565;
  if (!flag) out++;
  const dClub = Math.round(distanceM(h.green, CLUBHOUSE) / YD);
  console.error(
    `hole ${String(h.n).padStart(2)}  par ${h.par}  ${String(h.yards).padStart(3)}yd` +
      `  green→clubhouse ${String(dClub).padStart(4)}yd ${flag ? "" : "  ⚠ out of range"}`
  );
}
console.error(out === 0 ? "all holes within spec ranges" : `${out} holes out of range`);

// Furthest point from clubhouse (for map bounds sanity).
const maxD = Math.max(...holes.map((h) => Math.round(distanceM(h.green, CLUBHOUSE))));
console.error(`furthest green from clubhouse: ${maxD}m`);

// --- property pins -------------------------------------------------------
const pinAt = (b, d) => destination(CLUBHOUSE, b, d * YD);
const pins = {
  clubhouse: CLUBHOUSE,
  firstTee: tee1,
  tenthTee: tee10,
  range: pinAt(70, 320),
  puttingGreen: pinAt(110, 110),
  shortCourse: pinAt(55, 470),
  lodge: pinAt(8, 260),
  tavern: pinAt(15, 215),
  restaurant: pinAt(2, 300),
  spa: pinAt(322, 330),
  pool: pinAt(338, 410),
  cottages: pinAt(282, 480),
  eventLawn: pinAt(187, 540),
  overlook: pinAt(196, 760),
  trailhead: pinAt(255, 690),
  pond: pinAt(126, 620),
  tennis: pinAt(36, 420),
};

const fix = (c) => ({ lat: +c.lat.toFixed(6), lng: +c.lng.toFixed(6) });
const data = {
  clubhouse: fix(CLUBHOUSE),
  pins: Object.fromEntries(Object.entries(pins).map(([k, v]) => [k, fix(v)])),
  holes: holes.map((h) => ({
    n: h.n,
    par: h.par,
    yards: h.yards,
    tee: fix(h.tee),
    green: fix(h.green),
    midpoints: h.midpoints.map(fix),
  })),
};
console.log(JSON.stringify(data, null, 2));
