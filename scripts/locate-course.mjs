/**
 * Locate Whispering Pines GC by water-shape matching in open DEM data.
 *
 * Lake Livingston pools at ~131 ft (≈40 m). Decoding terrarium tiles over
 * the candidate area NE of Trinity, TX and masking cells at lake elevation
 * draws the lake arms + Caney Creek precisely; the club sits on the wooded
 * peninsula at the creek's mouth (closing six holes hug the water).
 *
 * Output: an ASCII water map with a lat/lng graticule.
 * Run: node scripts/locate-course.mjs [z [latN latS lngW lngE]]
 */
import zlib from "node:zlib";

const Z = Number(process.argv[2] ?? 13);
const LAT_N = Number(process.argv[3] ?? 30.96);
const LAT_S = Number(process.argv[4] ?? 30.78);
const LNG_W = Number(process.argv[5] ?? -95.34);
const LNG_E = Number(process.argv[6] ?? -95.08);

const tile2lng = (x, z) => (x / 2 ** z) * 360 - 180;
const tile2lat = (y, z) => {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** z;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};
const lng2x = (lng, z) => Math.floor(((lng + 180) / 360) * 2 ** z);
const lat2y = (lat, z) => {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
};

// Minimal PNG decode (8-bit RGB/RGBA, non-interlaced) — terrarium tiles.
function decodePng(buf) {
  let pos = 8;
  let w = 0, h = 0, bitDepth = 0, colorType = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`unsupported png (depth ${bitDepth} color ${colorType})`);
  }
  const ch = colorType === 2 ? 3 : 4;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const out = Buffer.alloc(w * h * ch);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = Buffer.alloc(stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? cur[i - ch] : 0;
      const b = prev[i];
      const c = i >= ch ? prev[i - ch] : 0;
      let v = line[i];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[i] = v & 255;
    }
    cur.copy(out, y * stride);
    prev = cur;
  }
  return { w, h, ch, data: out };
}

const elev = (r, g, b) => r * 256 + g + b / 256 - 32768;

const x0 = lng2x(LNG_W, Z);
const x1 = lng2x(LNG_E, Z);
const y0 = lat2y(LAT_N, Z);
const y1 = lat2y(LAT_S, Z);
console.error(`z${Z} tiles x ${x0}-${x1}, y ${y0}-${y1} (${(x1 - x0 + 1) * (y1 - y0 + 1)} tiles)`);

// Downsample each 256px tile to CELLS×CELLS chars.
const CELLS = 16;
const rows = (y1 - y0 + 1) * CELLS;
const cols = (x1 - x0 + 1) * CELLS;
const grid = Array.from({ length: rows }, () => new Array(cols).fill(" "));

for (let ty = y0; ty <= y1; ty++) {
  for (let tx = x0; tx <= x1; tx++) {
    const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${tx}/${ty}.png`;
    const res = await fetch(url);
    if (!res.ok) { console.error(`miss ${tx},${ty}`); continue; }
    const png = decodePng(Buffer.from(await res.arrayBuffer()));
    const step = png.w / CELLS;
    for (let cy = 0; cy < CELLS; cy++) {
      for (let cx = 0; cx < CELLS; cx++) {
        // sample center pixel of the cell
        const px = Math.floor((cx + 0.5) * step);
        const py = Math.floor((cy + 0.5) * step);
        const o = (py * png.w + px) * png.ch;
        const e = elev(png.data[o], png.data[o + 1], png.data[o + 2]);
        const gy = (ty - y0) * CELLS + cy;
        const gx = (tx - x0) * CELLS + cx;
        // Lake Livingston pool ≈ 39–41 m; creek bottoms a touch above.
        grid[gy][gx] = e <= 41.5 ? "#" : e <= 45 ? "+" : e <= 55 ? "." : " ";
      }
    }
  }
}

// Graticule labels every 4 cells of longitude/latitude edges.
const latAt = (gy) => {
  const fy = y0 + (gy + 0.5) / CELLS;
  return tile2lat(fy, Z);
};
const lngAt = (gx) => {
  const fx = x0 + (gx + 0.5) / CELLS;
  return tile2lng(fx, Z);
};

let header = "      ";
for (let gx = 0; gx < cols; gx += 8) {
  header += lngAt(gx).toFixed(3).padEnd(8);
}
console.log(header);
for (let gy = 0; gy < rows; gy++) {
  const label = gy % 4 === 0 ? latAt(gy).toFixed(3) : "      ";
  console.log(label.padEnd(6) + grid[gy].join(""));
}
console.log("\nlegend: # water(≤41.5m)  + bottomland(≤45m)  . low(≤55m)  (blank) upland");
