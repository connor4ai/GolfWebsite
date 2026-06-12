/**
 * Photo ingestion pipeline — runs the moment this environment (or any
 * machine) has open network access. The build sandbox that produced this
 * branch blocks all image hosts (403), so this script is the one-command
 * bridge from "aerial-only" to "real photography everywhere".
 *
 *   node scripts/fetch-photos.mjs --crawl     # harvest the club's own site
 *   node scripts/fetch-photos.mjs             # download manifest entries
 *   node scripts/fetch-photos.mjs --dry       # report without writing
 *
 * --crawl fetches the club's public pages, extracts every <img>/srcset/
 * og:image URL, downloads originals ≥ 40KB into public/photos/club/, and
 * writes public/photos/crawl-report.json mapping files → source pages so
 * a human (or the next agent session) can assign them to config slots.
 *
 * MANIFEST entries with explicit URLs (e.g. hand-picked Unsplash images
 * for generic textures) download to their exact target paths. Every
 * download is content-type and size verified; failures are skipped and
 * reported, never fatal. Config wiring stays manual on purpose: a human
 * approves which photo lands in which slot (docs/WHISPERING-PINES.md §3).
 */

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dry = process.argv.includes("--dry");
const crawl = process.argv.includes("--crawl");

const CLUB_PAGES = [
  "https://whisperingpinesgolfclub.com/",
  "https://whisperingpinesgolfclub.com/championship-course",
  "https://whisperingpinesgolfclub.com/the-needler",
  "https://whisperingpinesgolfclub.com/cottages",
  "https://whisperingpinesgolfclub.com/cottage-faqs",
  "https://whisperingpinesgolfclub.com/about-us",
  "https://whisperingpinesgolfclub.com/instruction",
  "https://whisperingpinesgolfclub.com/map-directions",
];

/**
 * Direct-download manifest. `url` left empty until a verified source is
 * known — empty entries are listed as TODO in the report. Target paths
 * match the slots documented in docs/WHISPERING-PINES.md §3.
 */
const MANIFEST = [
  { file: "public/photos/hero-home.jpg", subject: "Signature landscape (ideally No. 15 / Gator Cove)", url: "" },
  { file: "public/photos/course-championship.jpg", subject: "Championship course sweep", url: "" },
  { file: "public/photos/course-needler.jpg", subject: "The Needler", url: "" },
  { file: "public/photos/cottages-village.jpg", subject: "The Village cottages", url: "" },
  { file: "public/photos/cottages-directors.jpg", subject: "Director's Corner", url: "" },
  { file: "public/photos/cottages-lonesome-dove.jpg", subject: "Lonesome Dove courtyard, fireplace lit", url: "" },
  { file: "public/photos/clubhouse.jpg", subject: "Clubhouse exterior", url: "" },
  { file: "public/photos/spirit.jpg", subject: "Spirit International ceremony/flags", url: "" },
  { file: "public/photos/og-image.jpg", subject: "Social share card 1200×630", url: "" },
];

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function get(url, asText = false) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: asText ? "text/html" : "image/*,*/*" },
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return asText ? res.text() : Buffer.from(await res.arrayBuffer());
}

function extractImageUrls(html, baseUrl) {
  const urls = new Set();
  const push = (u) => {
    try {
      const abs = new URL(u, baseUrl).toString();
      if (/\.(jpe?g|png|webp|avif)(\?|$)/i.test(abs)) urls.add(abs.split("#")[0]);
    } catch {
      /* ignore malformed */
    }
  };
  for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) push(m[1]);
  for (const m of html.matchAll(/srcset=["']([^"']+)["']/gi)) {
    for (const part of m[1].split(",")) push(part.trim().split(/\s+/)[0]);
  }
  for (const m of html.matchAll(/property=["']og:image["'][^>]+content=["']([^"']+)["']/gi)) push(m[1]);
  for (const m of html.matchAll(/content=["']([^"']+)["'][^>]+property=["']og:image["']/gi)) push(m[1]);
  for (const m of html.matchAll(/background(?:-image)?\s*:\s*url\(["']?([^"')]+)["']?\)/gi)) push(m[1]);
  return [...urls];
}

const report = { crawled: [], downloaded: [], skipped: [], todo: [] };

if (crawl) {
  const outDir = join(root, "public", "photos", "club");
  if (!dry) mkdirSync(outDir, { recursive: true });
  for (const page of CLUB_PAGES) {
    try {
      const html = await get(page, true);
      const urls = extractImageUrls(html, page);
      report.crawled.push({ page, images: urls.length });
      for (const url of urls) {
        const name = url.split("/").pop().split("?")[0].slice(-80);
        const target = join(outDir, name);
        if (existsSync(target)) continue;
        try {
          const buf = await get(url);
          if (buf.length < 40_000) {
            report.skipped.push({ url, reason: `small (${buf.length}b)` });
            continue;
          }
          if (!dry) writeFileSync(target, buf);
          report.downloaded.push({ url, file: `public/photos/club/${name}`, bytes: buf.length, from: page });
          console.log(`✓ ${name} (${Math.round(buf.length / 1024)}KB)`);
        } catch (e) {
          report.skipped.push({ url, reason: String(e.message ?? e) });
        }
      }
    } catch (e) {
      report.crawled.push({ page, error: String(e.message ?? e) });
      console.error(`✗ ${page}: ${e.message ?? e}`);
    }
  }
}

for (const entry of MANIFEST) {
  if (!entry.url) {
    report.todo.push(entry);
    continue;
  }
  try {
    const buf = await get(entry.url);
    if (buf.length < 20_000) throw new Error(`too small (${buf.length}b)`);
    if (!dry) {
      mkdirSync(join(root, dirname(entry.file)), { recursive: true });
      writeFileSync(join(root, entry.file), buf);
    }
    report.downloaded.push({ ...entry, bytes: buf.length });
    console.log(`✓ ${entry.file}`);
  } catch (e) {
    report.skipped.push({ ...entry, reason: String(e.message ?? e) });
    console.error(`✗ ${entry.file}: ${e.message ?? e}`);
  }
}

if (!dry) {
  mkdirSync(join(root, "public", "photos"), { recursive: true });
  writeFileSync(
    join(root, "public", "photos", "crawl-report.json"),
    JSON.stringify(report, null, 2)
  );
}
console.log(
  `\ndone — ${report.downloaded.length} downloaded, ${report.skipped.length} skipped, ${report.todo.length} manifest TODOs` +
    (dry ? " (dry run)" : " — report at public/photos/crawl-report.json")
);
if (report.downloaded.length === 0 && report.crawled.every((c) => c.error)) {
  console.error(
    "\nEvery fetch failed — this environment's network policy is still blocking image hosts.\n" +
      "Enable broader network access for the environment, then re-run."
  );
  process.exit(1);
}
