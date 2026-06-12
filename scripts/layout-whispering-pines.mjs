/**
 * Whispering Pines GC (Trinity, TX) — routing generator.
 *
 * Geography derived from open DEM water-shape analysis (see
 * scripts/locate-course.mjs): the club occupies the upland peninsula at the
 * headwaters of Lake Livingston — Trinity River arm to the west, Caney
 * Creek arm to the east/south. Closing six holes (13–18) run along the
 * Caney Creek bottoms; the signature 178yd 15th plays across "Gator Cove."
 * Camp Olympia sits at the peninsula's southern tip.
 *
 * Coordinates are derived, not surveyed — see docs/DECISIONS.md. The
 * routing respects published facts: par 72, 7,468yd Spirit tees, creek-side
 * finish, lakes in play mid-front-nine.
 *
 * Run: node scripts/layout-whispering-pines.mjs > scripts/data/wp-layout.json
 */

const CLUBHOUSE = { lat: 30.8638, lng: -95.199 };
const YD = 0.9144;
const R = 6371000;
const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;

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
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
  const dφ = toRad(b.lat - a.lat), dλ = toRad(b.lng - a.lng);
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function bearingDeg(a, b) {
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
  const dλ = toRad(b.lng - a.lng);
  const y = Math.sin(dλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Championship course. Spirit-tee yardages sum to the published 7,468.
 * Front nine loops the northern upland past the two interior lakes;
 * back nine works south, then 13–18 ride the Caney Creek bottoms
 * ("the Caney Creek run") before 18 climbs home.
 * segs: [{b: bearing°, d: yards}] — joints become dogleg midpoints.
 */
const HOLES = [
  // ---- front nine: northern upland loop -------------------------------
  { n: 1, par: 4, segs: [{ b: 18, d: 450 }], walkB: 60, walk: 38 },
  { n: 2, par: 5, segs: [{ b: 332, d: 315 }, { b: 305, d: 250 }], walkB: 0, walk: 40 },
  { n: 3, par: 4, segs: [{ b: 47, d: 430 }], walkB: 90, walk: 34 },
  { n: 4, par: 3, segs: [{ b: 116, d: 200 }], walkB: 150, walk: 30 }, // across the north lake
  { n: 5, par: 4, segs: [{ b: 73, d: 470 }], walkB: 110, walk: 36 },
  { n: 6, par: 4, segs: [{ b: 168, d: 425 }], walkB: 205, walk: 34 },
  { n: 7, par: 3, segs: [{ b: 243, d: 230 }], walkB: 270, walk: 30 },
  { n: 8, par: 5, segs: [{ b: 178, d: 320 }, { b: 160, d: 275 }], walkB: 285, walk: 40 },
  { n: 9, par: 4, homeRun: { len: 435, minStop: 110 } }, // home to the east porch
  // ---- back nine: south, then the serpentine Caney Creek run ----------
  { n: 10, par: 4, segs: [{ b: 188, d: 430 }], walkB: 150, walk: 36 },
  { n: 11, par: 5, segs: [{ b: 165, d: 320 }, { b: 145, d: 225 }], walkB: 70, walk: 34 },
  { n: 12, par: 3, segs: [{ b: 85, d: 185 }], walkB: 60, walk: 32 }, // creek-bluff one-shotter
  { n: 13, par: 5, segs: [{ b: 150, d: 300 }, { b: 175, d: 230 }], walkB: 80, walk: 34 }, // down the creek
  { n: 14, par: 4, segs: [{ b: 337, d: 455 }], walkB: 70, walk: 30 }, // back up, creek right
  { n: 15, par: 3, segs: [{ b: 80, d: 178 }], walkB: 350, walk: 34 }, // Gator Cove carry
  { n: 16, par: 4, segs: [{ b: 285, d: 440 }], walkB: 30, walk: 34 }, // turning for home
  { n: 17, par: 4, segs: [{ b: 310, d: 445 }], walkB: 250, walk: 36 },
  { n: 18, par: 4, homeRun: { len: 520, minStop: 90 } }, // up to the clubhouse lawn
];

/** The Needler — nine one-shotters beside the clubhouse, Pine Valley style. */
const NEEDLER = [
  { n: 1, par: 3, segs: [{ b: 300, d: 145 }], walkB: 340, walk: 18 },
  { n: 2, par: 3, segs: [{ b: 12, d: 122 }], walkB: 55, walk: 16 },
  { n: 3, par: 3, segs: [{ b: 84, d: 168 }], walkB: 120, walk: 18 },
  { n: 4, par: 3, segs: [{ b: 150, d: 96 }], walkB: 190, walk: 14 },
  { n: 5, par: 4, segs: [{ b: 222, d: 312 }], walkB: 260, walk: 20 }, // the drivable dare
  { n: 6, par: 3, segs: [{ b: 318, d: 188 }], walkB: 0, walk: 16 },
  { n: 7, par: 3, segs: [{ b: 64, d: 132 }], walkB: 100, walk: 16 },
  { n: 8, par: 3, segs: [{ b: 156, d: 205 }], walkB: 200, walk: 16 },
  { n: 9, par: 3, segs: [{ b: 252, d: 112 }], walkB: 0, walk: 0 },
];

function layout(spec, startTee, closeAnchor) {
  const holes = [];
  let tee = startTee;
  for (const h of spec) {
    let green;
    const midpoints = [];
    if (h.homeRun) {
      // Deterministic closer: aim straight at the anchor (clubhouse) and
      // stop `minStop` yards out, capped at the desired length.
      const toAnchor = distanceM(tee, closeAnchor) / YD;
      const len = Math.min(h.homeRun.len, toAnchor - h.homeRun.minStop);
      const midB = bearingDeg(tee, closeAnchor);
      green = destination(tee, midB, len * YD);
      midpoints.push(
        destination(destination(tee, midB, len * 0.55 * YD), midB + 90, 16 * YD)
      );
      holes.push({ n: h.n, par: h.par, tee, green, midpoints, yards: Math.round(len) });
    } else {
      let cursor = tee;
      let total = 0;
      h.segs.forEach((seg, i) => {
        cursor = destination(cursor, seg.b, seg.d * YD);
        total += seg.d;
        if (i < h.segs.length - 1) midpoints.push(cursor);
      });
      green = cursor;
      holes.push({ n: h.n, par: h.par, tee, green, midpoints, yards: total });
    }
    if (h.walk) tee = destination(green, h.walkB, h.walk * YD);
  }
  return holes;
}

const tee1 = destination(CLUBHOUSE, 205, 70 * YD);
const championship = layout(HOLES, tee1, CLUBHOUSE);
const needlerStart = destination(CLUBHOUSE, 290, 190 * YD);
const needler = layout(NEEDLER, needlerStart, CLUBHOUSE);

let total = 0;
for (const h of championship) {
  total += h.yards;
  const ok =
    h.par === 3 ? h.yards >= 150 && h.yards <= 240 : h.yards >= 380 && h.yards <= 600;
  const dC = Math.round(distanceM(h.green, CLUBHOUSE) / YD);
  console.error(
    `champ ${String(h.n).padStart(2)} par${h.par} ${String(h.yards).padStart(3)}yd  green→club ${String(dC).padStart(4)}yd ${ok ? "" : "⚠"}`
  );
}
console.error(`championship total ${total}yd (target 7468)`);
console.error(`needler total ${needler.reduce((s, h) => s + h.yards, 0)}yd`);

// Extents for sanity vs. the DEM upland (lat 30.852–30.876, lng -95.21 – -95.185)
const lats = championship.flatMap((h) => [h.tee.lat, h.green.lat]);
const lngs = championship.flatMap((h) => [h.tee.lng, h.green.lng]);
console.error(
  `extent lat ${Math.min(...lats).toFixed(4)}–${Math.max(...lats).toFixed(4)}  lng ${Math.min(...lngs).toFixed(4)}–${Math.max(...lngs).toFixed(4)}`
);

const pinAt = (b, d) => destination(CLUBHOUSE, b, d * YD);
const fix = (c) => ({ lat: +c.lat.toFixed(6), lng: +c.lng.toFixed(6) });
const data = {
  clubhouse: fix(CLUBHOUSE),
  pins: {
    clubhouse: fix(CLUBHOUSE),
    firstTee: fix(tee1),
    range: fix(pinAt(335, 300)),
    puttingGreen: fix(pinAt(120, 90)),
    needler: fix(needlerStart),
    village: fix(pinAt(20, 420)),
    directorsCorner: fix(pinAt(58, 360)),
    lonesomeDove: fix(pinAt(345, 250)),
    gatorCove: fix(championship[14].green),
    spiritPlaza: fix(pinAt(95, 160)),
    campOlympia: { lat: 30.8425, lng: -95.2065 },
    boatLanding: fix(pinAt(238, 520)),
  },
  championship: championship.map((h) => ({
    n: h.n, par: h.par, yards: h.yards,
    tee: fix(h.tee), green: fix(h.green), midpoints: h.midpoints.map(fix),
  })),
  needler: needler.map((h) => ({
    n: h.n, par: h.par, yards: h.yards,
    tee: fix(h.tee), green: fix(h.green), midpoints: h.midpoints.map(fix),
  })),
};
console.log(JSON.stringify(data, null, 2));
