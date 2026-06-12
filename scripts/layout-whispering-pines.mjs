/**
 * Whispering Pines GC (Trinity, TX) — routing generator.
 *
 * Site anchored to federal GNIS data (USGS DomesticNames, pulled from the
 * prd-tnm S3 bucket): the property is the peninsula between Caney Creek
 * (mouth 30.9205,-95.2699 — feature 1353735) and White Rock Creek (mouth
 * 30.9055,-95.2658), on the east bank of the Trinity River channel at the
 * headwaters of Lake Livingston. Cross-checked against the DEM water mask
 * (scripts/locate-course.mjs over 30.935–30.885 / -95.295–-95.225).
 *
 * Front nine loops the eastern upland; the closing run rides lower Caney
 * Creek — 13 to the headwaters bluff, 14 up the bank, the 178yd 15th
 * across the Gator Cove pocket where the creek meets the river, 16–18
 * home. Hole positions remain plan-derived, not GPS-surveyed — see
 * docs/WHISPERING-PINES.md §2.
 *
 * Run: node scripts/layout-whispering-pines.mjs > scripts/data/wp-layout.json
 */

// GNIS-anchored: the peninsula between Caney Creek (mouth 30.9205,-95.2699,
// USGS feature 1353735) and White Rock Creek (mouth 30.9055,-95.2658),
// east bank of the Trinity River channel at the Lake Livingston headwaters.
const CLUBHOUSE = { lat: 30.9165, lng: -95.2475 };
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
  // ---- front nine: eastern upland loop ---------------------------------
  { n: 1, par: 4, segs: [{ b: 150, d: 450 }], walkB: 95, walk: 38 },
  { n: 2, par: 5, segs: [{ b: 85, d: 315 }, { b: 60, d: 250 }], walkB: 20, walk: 40 },
  { n: 3, par: 4, segs: [{ b: 30, d: 430 }], walkB: 75, walk: 34 },
  { n: 4, par: 3, segs: [{ b: 115, d: 200 }], walkB: 60, walk: 30 }, // across the east pond
  { n: 5, par: 4, segs: [{ b: 350, d: 470 }], walkB: 300, walk: 36 },
  { n: 6, par: 4, segs: [{ b: 275, d: 425 }], walkB: 320, walk: 34 },
  { n: 7, par: 3, segs: [{ b: 300, d: 230 }], walkB: 260, walk: 30 },
  { n: 8, par: 5, endAt: { b: 92, d: 495 }, walkB: 175, walk: 40 },
  { n: 9, par: 4, homeRun: { len: 435, minStop: 110 }, walkB: 285, walk: 42 }, // home to the east porch
  // ---- back nine: west to the water, then the Caney Creek run ----------
  { n: 10, par: 4, segs: [{ b: 262, d: 430 }], walkB: 300, walk: 36 },
  { n: 11, par: 5, segs: [{ b: 285, d: 320 }, { b: 262, d: 225 }], walkB: 310, walk: 34 },
  { n: 12, par: 3, segs: [{ b: 290, d: 185 }], walkB: 235, walk: 32 }, // creek-bluff one-shotter
  { n: 13, par: 5, segs: [{ b: 245, d: 300 }, { b: 268, d: 230 }], walkB: 5, walk: 34 }, // to the headwaters bluff
  { n: 14, par: 4, segs: [{ b: 35, d: 455 }], walkB: 80, walk: 30 }, // up the bank, creek left
  { n: 15, par: 3, segs: [{ b: 75, d: 178 }], walkB: 120, walk: 34 }, // Gator Cove carry
  { n: 16, par: 4, segs: [{ b: 140, d: 440 }], walkB: 140, walk: 34 }, // along the water's last reach
  { n: 17, par: 4, segs: [{ b: 115, d: 445 }], walkB: 200, walk: 36 },
  { n: 18, par: 4, homeRun: { len: 455, minStop: 90 } }, // up to the clubhouse lawn
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
    if (h.endAt) {
      // Green pinned at a fixed offset from the anchor; the hole bends
      // gently from wherever the previous walk left the tee.
      green = destination(closeAnchor, h.endAt.b, h.endAt.d * YD);
      const len = distanceM(tee, green) / YD;
      const midB = bearingDeg(tee, green);
      midpoints.push(
        destination(destination(tee, midB, len * 0.5 * YD), midB - 90, 22 * YD)
      );
      holes.push({ n: h.n, par: h.par, tee, green, midpoints, yards: Math.round(len) });
    } else if (h.homeRun) {
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

const tee1 = destination(CLUBHOUSE, 185, 70 * YD);
const championship = layout(HOLES, tee1, CLUBHOUSE);
const needlerStart = destination(CLUBHOUSE, 245, 190 * YD);
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

// Extents vs. the DEM upland (lat 30.910–30.924, lng -95.268 – -95.232)
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
    range: fix(pinAt(330, 300)),
    puttingGreen: fix(pinAt(150, 90)),
    needler: fix(needlerStart),
    village: fix(pinAt(40, 420)),
    directorsCorner: fix(pinAt(75, 360)),
    lonesomeDove: fix(pinAt(15, 250)),
    gatorCove: fix(championship[14].green),
    spiritPlaza: fix(pinAt(110, 160)),
    campOlympia: { lat: 30.9095, lng: -95.2615 },
    boatLanding: { lat: 30.9135, lng: -95.27 },
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
