/**
 * Self-verification: boots the production build (`next start`) on a scratch
 * port, fetches every route, and asserts both status codes and signature
 * content. Honors the active config's feature flags via RESORT=0|1
 * (default 1 — the Highmark Ridge demo).
 *
 * Usage: npm run build && node scripts/verify-routes.mjs [--resort=0]
 */

import { spawn } from "node:child_process";
import { join } from "node:path";

const PORT = process.env.PORT || 3105;
const BASE = `http://127.0.0.1:${PORT}`;
const profileArg = process.argv.find((a) => a.startsWith("--profile="));
const profile = profileArg ? profileArg.split("=")[1] : "wp";
const resort = profile === "resort";

const CHECKS = [
  {
    path: "/",
    expect: 200,
    contains: ["Explore the Property", profile === "wp" ? "Inquire" : "Book a Tee Time"],
  },
  { path: "/explore", expect: 200, contains: ["Explore", "Ambient sound"] },
  {
    path: "/rates",
    expect: 200,
    contains: [profile === "wp" ? "Membership" : "Twilight"],
  },
  { path: "/about", expect: 200, contains: ["Recognition"] },
  { path: "/gallery", expect: 200, contains: ["gallery"] },
  { path: "/contact", expect: 200, contains: ["Send message", "tel:"] },
  { path: "/sitemap.xml", expect: 200, contains: ["<urlset"] },
  { path: "/robots.txt", expect: 200, contains: ["Sitemap"] },
  { path: "/og/og-image.png", expect: 200 },
  { path: "/images/crest.svg", expect: 200, contains: ["<svg"] },
  { path: "/images/holes/hole-12.svg", expect: 200, contains: ["<svg"] },
  { path: "/this-route-does-not-exist", expect: 404, contains: ["Lost ball"] },
];

if (profile === "wp") {
  CHECKS.push(
    { path: "/", expect: 200, contains: ["Whispering Pines"] },
    { path: "/course/championship", expect: 200, contains: ["Scorecard", "Signature hole", "Chet Williams"] },
    { path: "/course/championship/holes", expect: 200, contains: ["Replay"] },
    { path: "/course/championship/holes?hole=15", expect: 200, contains: ["Gator Cove"] },
    { path: "/course/the-needler", expect: 200, contains: ["Scorecard", "Pine Valley"] },
    { path: "/course/the-needler/holes", expect: 200, contains: ["Replay"] },
    { path: "/stay", expect: 200, contains: ["Lonesome Dove", "Director"] },
    { path: "/rates", expect: 200, contains: ["Membership", "Spirit"] },
    { path: "/about", expect: 200, contains: ["Caney", "Spirit International"] },
    { path: "/dine", expect: 404 },
    { path: "/events-weddings", expect: 404 }
  );
} else if (resort) {
  CHECKS.push(
    { path: "/course/the-ridge", expect: 200, contains: ["Scorecard", "Signature hole"] },
    { path: "/course/the-ridge/holes", expect: 200, contains: ["First Light", "Replay"] },
    { path: "/course/the-ridge/holes?hole=12", expect: 200, contains: ["Window Rock"] },
    { path: "/stay", expect: 200, contains: ["Sleeps"] },
    { path: "/dine", expect: 200, contains: ["Hours"] },
    { path: "/events-weddings", expect: 200, contains: ["guests"] },
    { path: "/rates", expect: 200, contains: ["Membership", "Initiation"] }
  );
} else {
  CHECKS.push(
    { path: "/course/cedar-hollow", expect: 200, contains: ["Scorecard"] },
    { path: "/course/cedar-hollow/holes", expect: 200, contains: ["Mill Run", "Replay"] },
    { path: "/stay", expect: 404 },
    { path: "/dine", expect: 404 },
    { path: "/events-weddings", expect: 404 }
  );
}

function waitForReady(proc) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("server start timeout")), 60000);
    const onData = (d) => {
      const s = d.toString();
      if (s.includes("Ready") || s.includes("started server")) {
        clearTimeout(timer);
        resolve();
      }
    };
    proc.stdout.on("data", onData);
    proc.stderr.on("data", onData);
    proc.on("exit", (code) => reject(new Error(`server exited early (${code})`)));
  });
}

const root = new URL("..", import.meta.url).pathname;
// Spawn the server in its own process group so cleanup kills the whole
// tree (a bare SIGTERM to npx leaves next-server holding the port).
const server = spawn(
  process.execPath,
  [join(root, "node_modules", "next", "dist", "bin", "next"), "start", "-p", String(PORT)],
  { cwd: root, stdio: ["ignore", "pipe", "pipe"], detached: true }
);

let failures = 0;
try {
  await waitForReady(server);
  for (const check of CHECKS) {
    const res = await fetch(BASE + check.path, { redirect: "manual" });
    const body = await res.text();
    const statusOk = res.status === check.expect;
    const missing = (check.contains ?? []).filter((c) => !body.includes(c));
    const ok = statusOk && missing.length === 0;
    if (!ok) failures++;
    console.log(
      `${ok ? "✓" : "✗"} ${check.path}  [${res.status}${statusOk ? "" : ` ≠ ${check.expect}`}]` +
        (missing.length ? `  missing: ${missing.join(", ")}` : "")
    );
  }
} finally {
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {
    server.kill("SIGTERM");
  }
}

if (failures) {
  console.error(`\n${failures} route check(s) FAILED`);
  process.exit(1);
}
console.log(`\nall ${CHECKS.length} route checks passed (${profile} config)`);
process.exit(0);
