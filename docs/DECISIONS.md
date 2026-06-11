# DECISIONS — Autonomous Build Log

Every material decision made without consultation during the one-shot build,
with reasoning. Items marked ⚠ are the ones a client-facing deploy should
revisit first.

## Architecture & stack

1. **Pinned Next 14.2 / React 18 / Tailwind 3.4 / MapLibre 4.7 / Framer
   Motion 11.** Newest majors (Next 15/React 19/Tailwind 4) were skipped
   deliberately — this is a product template; boring-stable beats novel.
2. **Single source of truth at `/config/course.config.ts`** re-exporting a
   per-client file. Swapping clients is a one-line diff, which also made the
   daily-fee verification swap trivial.
3. **Brand colors → CSS custom properties → Tailwind tokens.** Re-theming
   requires zero Tailwind/CSS knowledge; AA contrast is the config author's
   only obligation (documented in REPOPULATE).
4. **Fonts vendored** (Cormorant Garamond + Jost variable woff2, both OFL)
   and loaded via `next/font/local` so `npm run build` never touches the
   network. `identity.fonts` is documentation, not wiring — swapping fonts
   is a file replacement, which is the honest mechanics of licensed type.
5. **No UI runtime beyond React** — carousel, lightbox, masonry, menu, and
   forms are hand-built on scroll-snap/CSS columns/Framer Motion rather than
   pulling component libraries. Keeps the bundle small and the aesthetic
   singular.

## Maps, terrain & resilience

6. **Terrarium terrain "conversion utility" = configuration, not decoding.**
   MapLibre ≥2 natively accepts `encoding: "terrarium"` on raster-dem
   sources; `lib/map/sources.ts#buildTerrainSource()` centralizes that (with
   the decode constants kept for reference). Writing a custom decoder would
   have been cargo-culting.
7. **Imagery failover chain: Esri World Imagery → USGS Imagery → illustrated
   mode.** A real tile is probed per session (`lib/map/tile-health.ts`,
   4s timeout, sessionStorage cache); WebGL construction failure also drops
   to illustrated. In this build sandbox both imagery hosts are blocked by
   the egress policy (403) while the terrain S3 bucket is open — which means
   the fallback path is the one that got exercised end-to-end here, and the
   satellite path follows the exact same component contract.
8. **Illustrated mode is a feature, not an apology.** Both the property map
   and the per-hole flyover have full vector renderings generated from the
   same config coordinates, exposed via a Satellite/Illustrated toggle.
   The illustrated *property* map uses a static overview framing (pins
   pulse/highlight on select rather than animating a fake camera) — a
   deliberate call: a faux flyTo in flat SVG reads as jank, a composed
   overview reads as a map. The illustrated *hole* flyover does animate
   (viewBox camera: intro → flight along the line → settle), because there
   the camera is the feature being replaced.
9. **Flyover camera built on per-frame `jumpTo`** with hand-rolled easing,
   Catmull-Rom path sampling, and path-derived bearings (`lib/geo.ts`,
   `lib/map/flyover.ts`) instead of chained `flyTo` calls — deterministic,
   cancellable mid-frame, and terrain-safe. Durations scale by par (9–17s),
   ×0.6 on coarse pointers/small screens; ends in a continuous slow orbit.
   Any drag/wheel cancels the script and hands the camera to the user.
10. **`prefers-reduced-motion`** disables flyover autoplay entirely (static
    framing + completed playing line), kills the Ken Burns/page transitions,
    and switches map flyTo to jumpTo.

## Demo content (Highmark Ridge — fictional)

11. **Sited at ~36.716N, −80.447W** (Patrick County, VA, plateau rim above
    the Dan River gorge) for genuinely dramatic real terrain under the 3D
    flyovers, per the brief's suggested area.
12. **Routing generated, not hand-waved**: `scripts/layout-holes.mjs` lays
    18 holes by bearing/length with green→tee walks, then closes holes 9 and
    18 against fixed points beside the clubhouse. Result: par 72, 7,027 yds,
    out/in 3,519/3,508, both nines returning home; geometry mirrored to
    `scripts/data/highmark-layout.json` for the art generator.
13. ⚠ **Interpreted "holes 380–560yd" as the par-4/5 range.** A course whose
    *shortest* hole is 380 yards cannot have par 3s; the four one-shotters
    run 172–225 yds. Par 4s/5s all sit within 380–560.
14. **All invented proper nouns are fictional** (Ellis Maybank, Calder & Noe,
    staff, and accolade sources like "Mountain Golf Journal") — deliberately
    avoiding real publications/architects so the demo never implies a false
    endorsement. Demo domains use the reserved `.example` TLD, and the demo
    tee-sheet URL points at example.com (the button still opens it, as
    required). The footer auto-discloses "fictional demonstration property"
    when `seo.siteUrl` contains `.example`.
15. **Daily-fee example reuses the demo hole geometry** with its own copy,
    palette, tees, rates, and flags-all-off. An example config exists to
    prove the conditional rendering paths; surveying a second fictional
    course added nothing. Noted in the file header.

## Product behavior

16. **Conditional pages 404 when their flag is off** (vs. redirecting):
    correct semantics for sold sites where the page genuinely doesn't exist;
    nav, sitemap, home grid, and filter chips all derive from the same flags
    so no dead links are reachable.
17. **Contact form is client-side only** (validate → animated success), as
    specified. The submit handler is the single integration point, flagged
    in REPOPULATE for CRM wiring.
18. **Ambient audio synthesized** in Web Audio (pink-noise wind bed + sparse
    two-partial birdsong), created lazily on first toggle, default-off,
    ~−16dB master — autoplay-policy-proof and zero assets.
19. **`?hole=` deep links** on the flyover use `history.replaceState` so
    hole switching never triggers Next navigation; entry links from the
    carousel/pins/signature blocks land on the right hole.
20. **OG image is a generated PNG** (pure-JS encoder over node:zlib in the
    art script) because scrapers ignore SVG; it's typography-free so it
    needs no embedded fonts, with name/tagline carried by og:title.
21. ⚠ **Booking is link-out only** (tee-sheet URL + tel/mailto), matching
    the brief's "no backend" constraint. Real deployments will want the
    client's booking widget embedded.

## Verification record

22. `npm run build`: clean — zero errors, zero warnings (one React-hooks
    warning found and fixed during the pass).
23. `scripts/verify-routes.mjs` against the production server: 19/19 checks
    (status + signature content) on the resort config, including the 404
    page; the daily-fee swap build verified 13/13 with `/stay`, `/dine`,
    `/events-weddings` correctly 404ing, then the resort config was
    restored and rebuilt.
24. ⚠ **Headless-browser interaction checks were not possible in this
    sandbox** — Playwright's browser CDN is blocked (HTTP 403), as are the
    imagery hosts. Per the contract's allowance, verification fell back to:
    SSR content assertions on every route, end-to-end exercise of the
    illustrated mode path (the same components/state machine the satellite
    mode drives), and a line-level audit of every interaction handler
    (documented in the commit). The satellite path runs against the same
    health-check contract and should be eyeballed once in a normal browser:
    `/explore` (pins → panel → flyTo) and `/course/the-ridge/holes`
    (flight + orbit + line draw).
