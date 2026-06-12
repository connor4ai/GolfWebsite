/**
 * FAIRWAY art pass — generates every image the demo site references as
 * original, deterministic SVG compositions (plus a raster OG card).
 * No external assets, no fonts embedded, nothing copyrighted.
 *
 * Run: npm run art   (idempotent; outputs to /public)
 *
 * Visual language: dusk-lit Blue Ridge layers — gradient skies, stacked
 * ridge silhouettes, brass accents, lit architecture. Tuned to the demo
 * palette but parameterized so a re-theme only changes PALETTES/BRAND.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = (...p) => join(root, "public", ...p);

// --------------------------------------------------------------------------
// Brand + palettes
// --------------------------------------------------------------------------

const BRAND = {
  brass: "#c2a35d",
  brassBright: "#e9d9ac",
  cream: "#f3efe6",
  night: "#0e1310",
  initials: "WP",
  name: "WHISPERING PINES GOLF CLUB",
  est: "EST. 2000",
};

const PALETTES = {
  dusk: {
    sky: ["#2c3e46", "#54565b", "#9a7d52", "#c98f4e"],
    sun: { color: "#f0c878", glow: "#c98f4e" },
    ridges: ["#5d6657", "#49543f", "#36412f", "#273123", "#1a221a"],
    field: ["#3c5234", "#2c3f27"],
    fairway: ["#557544", "#476439"],
  },
  dawn: {
    sky: ["#3b4554", "#717181", "#b08f78", "#d9a777"],
    sun: { color: "#f5d9a0", glow: "#d9a777" },
    ridges: ["#6d6f70", "#565b54", "#414a3c", "#2f3a2c", "#202920"],
    field: ["#41573a", "#30432c"],
    fairway: ["#5d7c4b", "#4d6a3f"],
  },
  night: {
    sky: ["#0b1016", "#131c26", "#1d2733", "#27313c"],
    sun: { color: "#dfe6ec", glow: "#5d758c" },
    ridges: ["#222d33", "#1b2429", "#151d21", "#10171a", "#0b1013"],
    field: ["#16211a", "#101913"],
    fairway: ["#1f2f22", "#1a281d"],
  },
  gold: {
    sky: ["#33424a", "#6c6a5d", "#b3914f", "#dca74e"],
    sun: { color: "#f6d588", glow: "#dca74e" },
    ridges: ["#6a6f54", "#535d41", "#3e4b33", "#2c3826", "#1d281c"],
    field: ["#445c36", "#33482b"],
    fairway: ["#5f8048", "#4f6e3d"],
  },
  storm: {
    sky: ["#39444b", "#4e565a", "#6c6f6a", "#8d8676"],
    sun: { color: "#d9d3c2", glow: "#8d8676" },
    ridges: ["#586052", "#46503f", "#353f2f", "#262f22", "#181f17"],
    field: ["#3a4f33", "#2b3d27"],
    fairway: ["#516e41", "#446037"],
  },
};

// --------------------------------------------------------------------------
// Primitives
// --------------------------------------------------------------------------

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s) =>
  [...s].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) | 0, 7);

const W = 1600;
const H = 1200;

function skyDefs(p, id) {
  const stops = p.sky
    .map((c, i) => `<stop offset="${(i / (p.sky.length - 1)) * 100}%" stop-color="${c}"/>`)
    .join("");
  return `
  <linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient>
  <radialGradient id="glow-${id}" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="${p.sun.color}" stop-opacity="0.95"/>
    <stop offset="45%" stop-color="${p.sun.glow}" stop-opacity="0.4"/>
    <stop offset="100%" stop-color="${p.sun.glow}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="vig-${id}" cx="50%" cy="42%" r="75%">
    <stop offset="62%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity="0.38"/>
  </radialGradient>`;
}

/** One ridge silhouette path: smooth noise across the width. */
function ridgePath(rng, baseY, amp, width = W) {
  const phases = [rng() * 7, rng() * 7, rng() * 7];
  const freqs = [1.1 + rng() * 0.8, 2.3 + rng() * 1.4, 4.7 + rng() * 2];
  const ampw = [1, 0.45, 0.18];
  const pts = [];
  const N = 36;
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * width;
    const u = i / N;
    let y = 0;
    for (let k = 0; k < 3; k++) {
      y += Math.sin(u * Math.PI * freqs[k] + phases[k]) * ampw[k];
    }
    pts.push([x, baseY + (y * amp) / 1.63]);
  }
  let d = `M0 ${H} L0 ${pts[0][1].toFixed(0)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q ${pts[i][0].toFixed(0)} ${pts[i][1].toFixed(0)} ${mx.toFixed(0)} ${my.toFixed(0)}`;
  }
  d += ` L${width} ${H} Z`;
  return d;
}

function ridges(rng, p, horizonY, layers = 4) {
  let svg = "";
  for (let i = 0; i < layers; i++) {
    const y = horizonY + i * (88 + rng() * 26);
    const amp = 64 + i * 30 + rng() * 40;
    const color = p.ridges[Math.min(i + 1, p.ridges.length - 1)];
    // back layers catch more atmospheric light
    const op = i === 0 ? 0.92 : 1;
    svg += `<path d="${ridgePath(rng, y, amp)}" fill="${color}" opacity="${op}"/>`;
    if (i === 0) {
      svg += `<path d="${ridgePath(rng, y - 60, amp * 0.8)}" fill="${p.ridges[0]}" opacity="0.65"/>`;
    }
  }
  return svg;
}

function mist(y, h, op = 0.16) {
  return `<rect x="0" y="${y}" width="${W}" height="${h}" fill="url(#mistg)" opacity="${op}"/>`;
}

function treeCluster(rng, x, y, scale, color) {
  let svg = "";
  const n = 3 + Math.floor(rng() * 4);
  for (let i = 0; i < n; i++) {
    const tx = x + (rng() - 0.5) * 110 * scale;
    const ty = y + (rng() - 0.5) * 16 * scale;
    const r = (16 + rng() * 22) * scale;
    svg += `<ellipse cx="${tx.toFixed(0)}" cy="${ty.toFixed(0)}" rx="${r.toFixed(0)}" ry="${(r * 1.25).toFixed(0)}" fill="${color}"/>`;
  }
  return svg;
}

/** Fairway ribbon snaking from foreground to a green with flag. */
function fairwayRibbon(rng, p, opts = {}) {
  const { flagX = W * (0.3 + rng() * 0.4), flagY = H * (0.62 + rng() * 0.06) } = opts;
  const x0 = W * (0.18 + rng() * 0.5);
  const c1x = x0 + (rng() - 0.5) * 500;
  const c2x = flagX + (rng() - 0.5) * 320;
  const d = `M ${x0 - 190} ${H + 40} C ${c1x - 230} ${H * 0.92}, ${c2x - 150} ${flagY + 130}, ${flagX - 56} ${flagY + 16}
             L ${flagX + 56} ${flagY + 16} C ${c2x + 150} ${flagY + 130}, ${c1x + 260} ${H * 0.94}, ${x0 + 230} ${H + 40} Z`;
  let svg = `<path d="${d}" fill="url(#fwy)"/>`;
  // mow lines
  for (let i = 1; i <= 3; i++) {
    svg += `<path d="M ${x0 - 190 + i * 86} ${H + 40} C ${c1x - 230 + i * 90} ${H * 0.93}, ${c2x - 140 + i * 64} ${flagY + 150}, ${flagX - 40 + i * 18} ${flagY + 22}" stroke="#ffffff" stroke-opacity="0.05" stroke-width="20" fill="none"/>`;
  }
  // green + flag
  svg += `<ellipse cx="${flagX}" cy="${flagY + 8}" rx="92" ry="26" fill="${p.fairway[0]}"/>
  <ellipse cx="${flagX}" cy="${flagY + 6}" rx="64" ry="17" fill="#6f9c58" opacity="0.9"/>`;
  // bunkers
  for (let i = 0; i < 2; i++) {
    const bx = flagX + (rng() - 0.5) * 260;
    const by = flagY + 26 + rng() * 18;
    svg += `<ellipse cx="${bx.toFixed(0)}" cy="${by.toFixed(0)}" rx="${(30 + rng() * 26).toFixed(0)}" ry="${(9 + rng() * 5).toFixed(0)}" fill="#cdb87f" opacity="0.88"/>`;
  }
  svg += flag(flagX, flagY + 6, 1);
  return svg;
}

function flag(x, y, s = 1) {
  return `<g>
    <line x1="${x}" y1="${y}" x2="${x}" y2="${y - 88 * s}" stroke="${BRAND.cream}" stroke-width="${3 * s}"/>
    <path d="M ${x} ${y - 88 * s} l ${46 * s} ${12 * s} l ${-46 * s} ${12 * s} Z" fill="${BRAND.brass}"/>
  </g>`;
}

/** Simple premium architecture silhouette with lit windows. */
function building(rng, kind, x, y, s = 1) {
  const lit = "#e8b96a";
  const litDim = "#c79a55";
  const wall = "#171d16";
  const roof = "#0e120d";
  let svg = `<g transform="translate(${x} ${y}) scale(${s})">`;
  const win = (wx, wy, w, h, c = lit, op = 0.92) =>
    `<rect x="${wx}" y="${wy}" width="${w}" height="${h}" fill="${c}" opacity="${op}"/>`;
  if (kind === "lodge") {
    svg += `<rect x="-260" y="-120" width="520" height="120" fill="${wall}"/>
      <path d="M-290 -120 L0 -228 L290 -120 Z" fill="${roof}"/>
      <rect x="-30" y="-282" width="60" height="80" fill="${roof}"/>`;
    for (let i = 0; i < 7; i++) svg += win(-238 + i * 72, -96, 30, 52, i % 2 ? lit : litDim);
    svg += win(-26, -196, 52, 60, lit, 0.85);
  } else if (kind === "clubhouse") {
    svg += `<rect x="-210" y="-95" width="420" height="95" fill="${wall}"/>
      <path d="M-236 -95 L-118 -172 L0 -95 Z" fill="${roof}"/>
      <path d="M-10 -95 L110 -178 L230 -95 Z" fill="${roof}"/>
      <rect x="70" y="-236" width="26" height="70" fill="${roof}"/>`;
    for (let i = 0; i < 5; i++) svg += win(-186 + i * 82, -74, 34, 48);
    svg += `<rect x="-210" y="-12" width="420" height="12" fill="${roof}"/>`;
  } else if (kind === "cottage") {
    svg += `<rect x="-95" y="-70" width="190" height="70" fill="${wall}"/>
      <path d="M-112 -70 L0 -136 L112 -70 Z" fill="${roof}"/>
      <rect x="46" y="-128" width="18" height="42" fill="${roof}"/>`;
    svg += win(-62, -52, 28, 36) + win(20, -52, 28, 36, litDim);
  } else if (kind === "barn") {
    svg += `<rect x="-170" y="-130" width="340" height="130" fill="${wall}"/>
      <path d="M-190 -130 L-150 -196 L150 -196 L190 -130 Z" fill="${roof}"/>`;
    for (let i = 0; i < 3; i++) svg += win(-120 + i * 92, -108, 56, 86, lit, 0.8);
  } else if (kind === "pavilion") {
    svg += `<path d="M-150 -88 L0 -148 L150 -88 Z" fill="${roof}"/>`;
    for (const px of [-128, -64, 0, 64, 128])
      svg += `<rect x="${px - 4}" y="-88" width="8" height="88" fill="${wall}"/>`;
    svg += `<rect x="-150" y="-6" width="300" height="6" fill="${roof}"/>
      ${win(-40, -70, 80, 40, lit, 0.5)}`;
  }
  svg += "</g>";
  return svg;
}

function stringLights(x1, x2, y, sag, n = 9) {
  const mid = (x1 + x2) / 2;
  let svg = `<path d="M ${x1} ${y} Q ${mid} ${y + sag} ${x2} ${y}" stroke="#6b5a35" stroke-width="2" fill="none"/>`;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mid + t * t * x2;
    const by = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + sag) + t * t * y;
    svg += `<circle cx="${bx.toFixed(0)}" cy="${(by + 7).toFixed(0)}" r="5" fill="#f3cd82"/>
            <circle cx="${bx.toFixed(0)}" cy="${(by + 7).toFixed(0)}" r="11" fill="#f3cd82" opacity="0.22"/>`;
  }
  return svg;
}

function stars(rng, count, maxY) {
  let svg = "";
  for (let i = 0; i < count; i++) {
    const x = rng() * W;
    const y = rng() * maxY;
    const r = rng() * 1.7 + 0.4;
    svg += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="#e9ecf2" opacity="${(0.25 + rng() * 0.6).toFixed(2)}"/>`;
  }
  return svg;
}

function water(p, y, h, sunX) {
  return `<rect x="0" y="${y}" width="${W}" height="${h}" fill="url(#waterg)"/>
    <ellipse cx="${sunX}" cy="${y + h * 0.3}" rx="170" ry="14" fill="${p.sun.color}" opacity="0.18"/>
    <ellipse cx="${sunX}" cy="${y + h * 0.55}" rx="110" ry="9" fill="${p.sun.color}" opacity="0.12"/>
    ${[...Array(7)].map((_, i) => `<line x1="${W * 0.08 + i * 190}" y1="${y + 18 + i * (h / 8)}" x2="${W * 0.08 + i * 190 + 130}" y2="${y + 18 + i * (h / 8)}" stroke="#dfe8ee" stroke-opacity="0.1" stroke-width="2"/>`).join("")}`;
}

// --------------------------------------------------------------------------
// Scene assembler
// --------------------------------------------------------------------------

function scene(name, spec) {
  const rng = mulberry32(hash(name));
  const p = PALETTES[spec.palette ?? "dusk"];
  const id = name.replace(/[^a-z0-9]/gi, "");
  const horizonY = H * (spec.horizon ?? 0.4);
  const sunX = W * (spec.sunX ?? 0.62);
  const sunY = horizonY - H * (spec.sunH ?? 0.1);

  let fg = "";
  const fieldTop = horizonY + 240 + rng() * 80;

  let defs = `${skyDefs(p, id)}
  <linearGradient id="mistg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${p.sun.glow}" stop-opacity="0"/>
    <stop offset="55%" stop-color="${p.sun.glow}" stop-opacity="0.8"/>
    <stop offset="100%" stop-color="${p.sun.glow}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="fwy" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${p.fairway[0]}"/>
    <stop offset="100%" stop-color="${p.fairway[1]}"/>
  </linearGradient>
  <linearGradient id="fieldg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${p.field[0]}"/>
    <stop offset="100%" stop-color="${p.field[1]}"/>
  </linearGradient>
  <linearGradient id="waterg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#33505e"/>
    <stop offset="100%" stop-color="#16242c"/>
  </linearGradient>`;

  // foreground composition
  if (spec.fg === "fairway" || spec.fg === undefined) {
    fg += `<rect x="0" y="${fieldTop}" width="${W}" height="${H - fieldTop}" fill="url(#fieldg)"/>`;
    fg += fairwayRibbon(rng, p, spec.ribbon ?? {});
  } else if (spec.fg === "lawn") {
    fg += `<rect x="0" y="${fieldTop}" width="${W}" height="${H - fieldTop}" fill="url(#fieldg)"/>`;
  } else if (spec.fg === "water") {
    fg += water(p, fieldTop, H - fieldTop, sunX);
  } else if (spec.fg === "forest") {
    fg += `<rect x="0" y="${fieldTop}" width="${W}" height="${H - fieldTop}" fill="${p.ridges[4]}"/>`;
    for (let i = 0; i < 12; i++) {
      fg += treeCluster(rng, rng() * W, fieldTop + 30 + rng() * 110, 1.4, p.ridges[3]);
    }
  }

  // trees flanking
  if (spec.trees !== false && spec.fg !== "water") {
    fg += treeCluster(rng, W * 0.08, fieldTop + 70, 1.7, "#141b13");
    fg += treeCluster(rng, W * 0.93, fieldTop + 40, 2, "#141b13");
    if (rng() > 0.5) fg += treeCluster(rng, W * 0.78, fieldTop + 10, 1.1, "#1a2418");
  }

  // architecture
  let arch = "";
  if (spec.building) {
    arch = building(rng, spec.building, W * (spec.buildingX ?? 0.5), fieldTop + 26, spec.buildingScale ?? 1.15);
  }
  if (spec.cottageRow) {
    for (let i = 0; i < 3; i++) {
      arch += building(rng, "cottage", W * (0.24 + i * 0.26), fieldTop + 30 + i * 8, 0.95 - i * 0.12);
    }
  }

  let extras = "";
  if (spec.lights) extras += stringLights(W * 0.22, W * 0.78, fieldTop - 60, 80, 12);
  if (spec.stars) extras += stars(rng, spec.stars, horizonY - 40);
  if (spec.milkyWay) {
    extras += `<g transform="rotate(-24 ${W / 2} ${horizonY / 2})">
      <rect x="${-W * 0.2}" y="${horizonY * 0.28}" width="${W * 1.4}" height="150" fill="#cfd8e6" opacity="0.07"/>
      <rect x="${-W * 0.2}" y="${horizonY * 0.34}" width="${W * 1.4}" height="60" fill="#e6ecf5" opacity="0.08"/>
    </g>`;
  }
  if (spec.flagOnly) extras += flag(W * 0.72, fieldTop + 130, 1.5);

  const moonOrSun = `<circle cx="${sunX}" cy="${sunY}" r="${spec.sunR ?? 64}" fill="${p.sun.color}" opacity="0.96"/>
  <circle cx="${sunX}" cy="${sunY}" r="${(spec.sunR ?? 64) * 4.4}" fill="url(#glow-${id})"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img">
<defs>${defs}</defs>
<rect width="${W}" height="${H}" fill="url(#sky-${id})"/>
${spec.sun === false ? "" : moonOrSun}
${ridges(rng, p, horizonY, spec.ridgeLayers ?? 4)}
${mist(horizonY + 110, 90, 0.2)}
${fg}
${mist(fieldTop - 26, 70, 0.12)}
${arch}
${extras}
<rect width="${W}" height="${H}" fill="url(#vig-${id})"/>
</svg>`;
}

// --------------------------------------------------------------------------
// Hole hero art: plan-perspective hybrid with big numeral
// --------------------------------------------------------------------------

function holeArt(n, par) {
  const name = `hole-${String(n).padStart(2, "0")}`;
  const palette = ["dusk", "gold", "dawn", "storm"][n % 4];
  const rng = mulberry32(hash(name));
  const base = scene(name, {
    palette,
    horizon: 0.34 + (n % 3) * 0.03,
    sunX: 0.25 + ((n * 37) % 50) / 100,
    fg: "fairway",
    ribbon: {},
    ridgeLayers: 3 + (n % 2),
  });
  // inject numeral + par chip before closing tag
  const numeral = `
  <text x="${W - 90}" y="290" text-anchor="end" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="360" fill="${BRAND.cream}" opacity="0.16">${n}</text>
  <g font-family="Georgia, serif" text-anchor="end">
    <text x="${W - 96}" y="368" font-size="44" fill="${BRAND.brass}" letter-spacing="10">PAR ${par}</text>
  </g>`;
  return base.replace("</svg>", `${numeral}</svg>`);
}

// --------------------------------------------------------------------------
// Crest, monogram, staff medallions
// --------------------------------------------------------------------------

function crest({ withText = true, size = 480 } = {}) {
  const c = size / 2;
  const rng = mulberry32(hash("crest"));
  const ridge = (() => {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const x = c - 130 + (i / 20) * 260;
      const y =
        c +
        18 -
        (Math.sin((i / 20) * Math.PI * 1.6 + 0.4) * 36 +
          Math.sin((i / 20) * Math.PI * 3.7 + 2) * 14);
      pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return `M ${pts.join(" L ")}`;
  })();
  void rng;
  const textArcs = withText
    ? `
  <defs>
    <path id="arcTop" d="M ${c - 168} ${c} A 168 168 0 0 1 ${c + 168} ${c}"/>
    <path id="arcBot" d="M ${c - 168} ${c} A 168 168 0 0 0 ${c + 168} ${c}"/>
  </defs>
  <text font-family="Georgia, serif" font-size="27" letter-spacing="6" fill="${BRAND.brass}">
    <textPath href="#arcTop" startOffset="50%" text-anchor="middle">${BRAND.name}</textPath>
  </text>
  <text font-family="Georgia, serif" font-size="22" letter-spacing="8" fill="${BRAND.brass}">
    <textPath href="#arcBot" startOffset="50%" text-anchor="middle">· ${BRAND.est} ·</textPath>
  </text>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img">
  <circle cx="${c}" cy="${c}" r="${c - 6}" fill="${BRAND.night}"/>
  <circle cx="${c}" cy="${c}" r="${c - 10}" fill="none" stroke="${BRAND.brass}" stroke-width="3"/>
  <circle cx="${c}" cy="${c}" r="${c - 22}" fill="none" stroke="${BRAND.brass}" stroke-width="1.2" opacity="0.7"/>
  ${withText ? `<circle cx="${c}" cy="${c}" r="138" fill="#18211b" stroke="${BRAND.brass}" stroke-width="1.5"/>` : ""}
  <g>
    <path d="${ridge}" fill="none" stroke="${BRAND.brass}" stroke-width="4" stroke-linecap="round"/>
    <line x1="${c + 58}" y1="${c - 4}" x2="${c + 58}" y2="${c - 64}" stroke="${BRAND.brassBright}" stroke-width="3.4"/>
    <path d="M ${c + 58} ${c - 64} l 30 8 l -30 8 Z" fill="${BRAND.brassBright}"/>
    <circle cx="${c - 64}" cy="${c - 58}" r="17" fill="${BRAND.brassBright}" opacity="0.9"/>
    <text x="${c}" y="${c + 84}" text-anchor="middle" font-family="Georgia, serif" font-size="64" letter-spacing="4" fill="${BRAND.cream}">${BRAND.initials}</text>
  </g>
  ${textArcs}
</svg>`;
}

function staffMedallion(i, initials) {
  const hues = ["#2e4d3a", "#3a4a55", "#4d3f33", "#43355a"];
  const bg = hues[i % hues.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" role="img">
  <defs>
    <radialGradient id="pg${i}" cx="50%" cy="36%" r="80%">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#11160f"/>
    </radialGradient>
  </defs>
  <rect width="480" height="480" fill="url(#pg${i})"/>
  <circle cx="240" cy="240" r="150" fill="none" stroke="${BRAND.brass}" stroke-width="2"/>
  <circle cx="240" cy="240" r="160" fill="none" stroke="${BRAND.brass}" stroke-width="0.8" opacity="0.6"/>
  <text x="240" y="272" text-anchor="middle" font-family="Georgia, serif" font-size="96" letter-spacing="6" fill="${BRAND.cream}">${initials}</text>
  <path d="M150 332 q 90 44 180 0" fill="none" stroke="${BRAND.brass}" stroke-width="2"/>
  ${[0, 1, 2, 3, 4].map((k) => `<circle cx="${168 + k * 36}" cy="${344 + Math.sin(k / 4 * Math.PI) * 10}" r="3" fill="${BRAND.brass}"/>`).join("")}
</svg>`;
}

// --------------------------------------------------------------------------
// OG card (PNG, 1200×630) — pure-JS encoder via zlib
// --------------------------------------------------------------------------

function ogPng() {
  const w = 1200;
  const h = 630;
  const px = new Uint8Array(w * h * 4);
  const sky = [
    [44, 62, 70],
    [84, 86, 91],
    [154, 125, 82],
    [201, 143, 78],
  ];
  const lerp = (a, b, t) => a + (b - a) * t;
  const skyAt = (t) => {
    const seg = Math.min(2, Math.floor(t * 3));
    const tt = t * 3 - seg;
    return [
      lerp(sky[seg][0], sky[seg + 1][0], tt),
      lerp(sky[seg][1], sky[seg + 1][1], tt),
      lerp(sky[seg][2], sky[seg + 1][2], tt),
    ];
  };
  const ridgeCols = [
    [93, 102, 87],
    [73, 84, 63],
    [54, 65, 47],
    [39, 49, 35],
    [22, 29, 22],
  ];
  const horizon = h * 0.52;
  const ridgeY = (layer, x) => {
    const u = x / w;
    const amp = 36 + layer * 26;
    return (
      horizon +
      layer * 56 +
      (Math.sin(u * Math.PI * (1.3 + layer * 0.7) + layer * 2.4) * amp +
        Math.sin(u * Math.PI * (3.1 + layer) + layer) * amp * 0.4)
    );
  };
  const sunX = w * 0.64;
  const sunY = h * 0.34;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let [r, g, b] = skyAt(Math.min(1, y / horizon));
      // sun glow
      const d = Math.hypot(x - sunX, y - sunY);
      if (d < 260) {
        const k = (1 - d / 260) ** 2 * 0.85;
        r = lerp(r, 240, k);
        g = lerp(g, 200, k);
        b = lerp(b, 120, k);
      }
      if (d < 46) {
        r = 240;
        g = 200;
        b = 120;
      }
      // ridges
      for (let l = 0; l < 5; l++) {
        if (y > ridgeY(l, x)) {
          [r, g, b] = ridgeCols[l];
        }
      }
      // vignette
      const vd = Math.hypot(x - w / 2, y - h / 2) / (w / 2);
      const v = Math.max(0, vd - 0.55) * 0.55;
      r *= 1 - v;
      g *= 1 - v;
      b *= 1 - v;
      const o = (y * w + x) * 4;
      px[o] = r;
      px[o + 1] = g;
      px[o + 2] = b;
      px[o + 3] = 255;
    }
  }
  // brass keyline border
  const brass = [194, 163, 93];
  const inset = 18;
  for (let x = inset; x < w - inset; x++) {
    for (const y of [inset, h - inset - 1]) {
      const o = (y * w + x) * 4;
      [px[o], px[o + 1], px[o + 2]] = brass;
    }
  }
  for (let y = inset; y < h - inset; y++) {
    for (const x of [inset, w - inset - 1]) {
      const o = (y * w + x) * 4;
      [px[o], px[o + 1], px[o + 2]] = brass;
    }
  }

  // PNG encode (filter 0 per scanline)
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    Buffer.from(px.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  }
  const chunks = [Buffer.from("\x89PNG\r\n\x1a\n", "binary")];
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crcBuf]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  chunks.push(chunk("IHDR", ihdr));
  chunks.push(chunk("IDAT", deflateSync(raw, { level: 9 })));
  chunks.push(chunk("IEND", Buffer.alloc(0)));
  return Buffer.concat(chunks);
}

let CRC_TABLE = null;
function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return ~c;
}

// --------------------------------------------------------------------------
// Manifest
// --------------------------------------------------------------------------

const SCENES = {
  "hero-home": { palette: "dusk", horizon: 0.38, sunX: 0.66, fg: "fairway", ridgeLayers: 4 },
  "hero-explore": { palette: "gold", horizon: 0.33, sunX: 0.3, fg: "forest", ridgeLayers: 5 },
  "ridge-course": { palette: "gold", horizon: 0.4, sunX: 0.74, fg: "fairway" },
  clubhouse: { palette: "dusk", horizon: 0.36, sunX: 0.2, fg: "lawn", building: "clubhouse", buildingX: 0.52, lights: false },
  lodge: { palette: "dusk", horizon: 0.34, sunX: 0.78, fg: "lawn", building: "lodge", buildingX: 0.5 },
  cottages: { palette: "gold", horizon: 0.36, sunX: 0.18, fg: "lawn", cottageRow: true },
  "gorge-house": { palette: "dawn", horizon: 0.4, sunX: 0.68, fg: "lawn", building: "lodge", buildingScale: 0.85, buildingX: 0.42 },
  "ember-oak": { palette: "night", horizon: 0.4, sunX: 0.82, sunR: 38, fg: "lawn", building: "barn", stars: 90 },
  "anvil-tavern": { palette: "night", horizon: 0.42, sunX: 0.16, sunR: 34, fg: "lawn", building: "cottage", buildingScale: 1.6, stars: 70 },
  "first-light-porch": { palette: "dawn", horizon: 0.4, sunX: 0.56, sunH: 0.04, fg: "lawn", building: "pavilion", buildingX: 0.36 },
  spa: { palette: "storm", horizon: 0.38, sunX: 0.7, fg: "forest", building: "pavilion", buildingScale: 1.1 },
  pool: { palette: "dusk", horizon: 0.4, sunX: 0.5, fg: "water" },
  tennis: { palette: "day_gold", horizon: 0.36, sunX: 0.8, fg: "lawn", building: "pavilion" },
  "meadow-lawn": { palette: "dusk", horizon: 0.42, sunX: 0.3, fg: "lawn", lights: true },
  "window-rock": { palette: "gold", horizon: 0.52, sunX: 0.5, sunH: 0.16, sunR: 84, fg: "forest", ridgeLayers: 5, trees: false },
  "granite-hall": { palette: "night", horizon: 0.4, sunX: 0.84, sunR: 36, fg: "lawn", building: "barn", lights: true, stars: 60 },
  weddings: { palette: "dusk", horizon: 0.4, sunX: 0.26, fg: "lawn", lights: true },
  range: { palette: "dawn", horizon: 0.38, sunX: 0.6, fg: "fairway", trees: false },
  "putting-green": { palette: "gold", horizon: 0.42, sunX: 0.76, fg: "lawn", flagOnly: true },
  "short-course": { palette: "gold", horizon: 0.4, sunX: 0.32, fg: "fairway" },
  trailhead: { palette: "storm", horizon: 0.3, sunX: 0.62, fg: "forest", ridgeLayers: 5 },
  pond: { palette: "dawn", horizon: 0.44, sunX: 0.52, sunH: 0.07, fg: "water" },
  clays: { palette: "storm", horizon: 0.36, sunX: 0.24, fg: "lawn", building: "pavilion", buildingScale: 0.8, buildingX: 0.7 },
  "dark-sky": { palette: "night", horizon: 0.46, sunX: 0.22, sunR: 44, fg: "forest", stars: 170, milkyWay: true, trees: false },
};

const GALLERY = [
  { palette: "dawn", horizon: 0.42, sunX: 0.5, fg: "fairway" },
  { palette: "gold", horizon: 0.38, sunX: 0.8, fg: "fairway" },
  { palette: "gold", horizon: 0.5, sunX: 0.46, sunH: 0.14, sunR: 80, fg: "forest", ridgeLayers: 5 },
  { palette: "storm", horizon: 0.36, sunX: 0.3, fg: "forest" },
  { palette: "dawn", horizon: 0.34, sunX: 0.6, fg: "forest", ridgeLayers: 5, trees: false },
  { palette: "dusk", horizon: 0.4, sunX: 0.72, fg: "fairway" },
  { palette: "night", horizon: 0.42, sunX: 0.84, sunR: 36, fg: "lawn", building: "lodge", stars: 80 },
  { palette: "gold", horizon: 0.38, sunX: 0.2, fg: "lawn", cottageRow: true },
  { palette: "night", horizon: 0.4, sunX: 0.14, sunR: 30, fg: "lawn", building: "barn", stars: 50 },
  { palette: "dusk", horizon: 0.44, sunX: 0.6, fg: "lawn", building: "cottage", buildingScale: 1.5, lights: true },
  { palette: "dusk", horizon: 0.42, sunX: 0.5, fg: "water" },
  { palette: "night", horizon: 0.48, sunX: 0.26, sunR: 40, fg: "forest", stars: 160, milkyWay: true, trees: false },
];

const STAFF = ["MT", "WC", "PR", "TM"];

// fix: "day_gold" isn't a palette — map to gold
for (const spec of Object.values(SCENES)) {
  if (!PALETTES[spec.palette]) spec.palette = "gold";
}

// --------------------------------------------------------------------------
// Write everything
// --------------------------------------------------------------------------

const PAR = { 1: 4, 2: 5, 3: 3, 4: 4, 5: 4, 6: 3, 7: 5, 8: 4, 9: 4, 10: 4, 11: 4, 12: 3, 13: 5, 14: 4, 15: 4, 16: 3, 17: 5, 18: 4 };

const dirs = ["images", "images/scenes", "images/holes", "images/gallery", "images/staff", "og"];
for (const d of dirs) mkdirSync(out(d), { recursive: true });

let count = 0;
const write = (path, content) => {
  writeFileSync(out(path), content);
  count++;
};

write("images/crest.svg", crest({ withText: true }));
write("images/monogram.svg", crest({ withText: false, size: 240 }));
for (const [name, spec] of Object.entries(SCENES)) {
  write(`images/scenes/${name}.svg`, scene(name, spec));
}
for (let n = 1; n <= 18; n++) {
  write(`images/holes/hole-${String(n).padStart(2, "0")}.svg`, holeArt(n, PAR[n]));
}
GALLERY.forEach((spec, i) => {
  write(`images/gallery/gallery-${String(i + 1).padStart(2, "0")}.svg`, scene(`gallery-${i + 1}`, spec));
});
STAFF.forEach((initials, i) => {
  write(`images/staff/staff-${String(i + 1).padStart(2, "0")}.svg`, staffMedallion(i, initials));
});
write("og/og-image.png", ogPng());

console.log(`art pass complete — ${count} files written to /public`);
