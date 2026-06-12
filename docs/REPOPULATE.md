# Repopulating FAIRWAY for a New Client

The site is a fixed structure fed entirely by one file: a `SiteConfig` object
(schema in `/config/types.ts`). Onboarding a new course means producing a new
config file and an image set — **nothing else changes**.

---

## 1. Onboarding checklist

1. **Create the config file** — copy `/config/highmark-ridge.config.ts` to
   `/config/<client-slug>.config.ts` and repopulate every field (the schema is
   strict; TypeScript will tell you what's missing).
2. **Point the site at it** — in `/config/course.config.ts`, change the import
   and the `active` assignment. That is the only wiring step.
3. **Set the feature flags** — `flags` drives everything conditional:
   - `hasLodging` → `/stay` exists, "Stay" appears in nav, lodging pins render
   - `hasDining` → `/dine`
   - `hasWeddings` → `/events-weddings`
   - `hasMembership` → membership section on `/rates`
   - `hasSpa` / `hasActivities` → sections within `/stay` and the home grid
   - Pages for disabled modules return 404 and disappear from nav, sitemap,
     and the explore filter chips automatically.
4. **Brand it** — `identity.brandColors` (7 hex values) restyles the whole
   site through CSS variables; no Tailwind/CSS edits. See "Theming" below.
5. **Coordinates** — property center, every pin, and tee/green/midpoints for
   every hole (see "Deriving coordinates" below). These drive the explore
   map, both flyover modes, and the contact locator.
6. **Replace artwork** — drop client photography into `/public/images/…`
   using the same paths the config references (spec below). Until photos
   arrive, regenerate placeholder art with `npm run art` (edit `BRAND` in
   `/scripts/generate-art.mjs` for the client's initials/name/palette).
7. **Booking plumbing** — `booking.teeTimeUrl` (their ForeUp/GolfNow/
   Lightspeed link), `phone`/`phoneHref`, `email`. The contact form is
   client-side only by design; wire its submit handler to the client's CRM or
   a form service at deployment if they want delivery
   (`components/contact/ContactForm.tsx`, one `submit` function).
8. **SEO** — `seo.siteUrl` (canonical production origin), description,
   keywords. JSON-LD (GolfCourse + Resort/LocalBusiness), OpenGraph, sitemap
   and robots all derive from config.
9. **Verify** — `npm run build && npm run verify:routes`
   (add `--resort=0` for non-resort clients). Then walk `/explore` and
   `/course/<slug>/holes` in a browser: pins, panels, both flyover modes.

---

## 2. The ingestion prompt

Paste the following into Claude Code, replacing the bracketed values. It
produces a complete config file from public information.

```text
You are onboarding a golf course onto the FAIRWAY template (this repo).
Course: [COURSE NAME], [CITY, STATE]. Website: [URL].

Produce /config/[slug].config.ts satisfying the SiteConfig schema in
/config/types.ts, following these rules:

1. RESEARCH public facts: par, yardages per tee, slope/rating, designer,
   year built, access model (public/semi-private/private), amenities
   (lodging/dining/spa/weddings/membership), rates if published, address,
   phone. Set the feature flags to match reality — do not invent amenities.

2. COORDINATES: locate the course on satellite imagery (the property map
   uses Esri World Imagery; verify against it). For each hole, derive
   tee box and green-center lat/lng to 6 decimal places, plus one midpoint
   per dogleg at the turn. Sanity-check: computed tee→green distance must
   be within ~10% of the published hole yardage (use the haversine helpers
   in /lib/geo.ts or /scripts/layout-holes.mjs as a checker). Property pins:
   clubhouse, first tee, practice areas, plus one pin per flagged amenity.

3. COPY: write ALL prose ORIGINAL — never copy or lightly paraphrase the
   course's website or any publication. Voice: restrained editorial luxury
   (Aman/Auberge register), specific over superlative. Required: region
   narrative, course description, designer story, 18 hole descriptions
   with pro tips (grounded in the real routing/terrain you can see on
   satellite), and copy for each flagged module. Real accolades only with
   source + year; omit if unverifiable.

4. IMAGES: reference /public/images paths per the FAIRWAY image spec
   (docs/REPOPULATE.md §3). Output a "CLIENT IMAGE REQUEST" list of every
   file the config references — exact filename, dimensions, subject, and
   orientation — for the client's photographer. Write descriptive alt text
   in config for every image.

5. OUTPUT: the completed .ts config (type-checks against SiteConfig), the
   image request list, and a short list of facts you could not verify and
   defaulted (with your assumption noted inline as a code comment).

Do not modify any file outside /config and /docs.
```

---

## 3. Image spec sheet

All paths are under `/public`. SVG placeholders ship at these paths; client
photography replaces them 1:1 (JPG/WebP at the same path with the extension
updated in config). Keep subjects in the safe area — most slots crop with
`object-cover`.

| Path | Size (min) | Ratio | Subject |
|---|---|---|---|
| `images/crest.svg` | 480×480 | 1:1 | Club crest (vector preferred) |
| `images/monogram.svg` | 240×240 | 1:1 | Simplified mark (nav + favicon) |
| `images/scenes/hero-home.*` | 2400×1500 | 16:10 | Signature landscape, dusk/dawn |
| `images/scenes/hero-explore.*` | 2400×1500 | 16:10 | Aerial/elevated property view |
| `images/scenes/ridge-course.*` | 2000×1250 | 16:10 | Course hero (overview page) |
| `images/scenes/<venue>.*` | 1600×1200 | 4:3 | One per pin/module: clubhouse, lodge, cottages, each restaurant, spa, pool, venues, activities |
| `images/holes/hole-NN.*` (01–18) | 1600×1200 | 4:3 | Hole photo or plan art |
| `images/gallery/gallery-NN.*` (01–12) | 1600×1200 | mixed | Editorial set; assign categories in config |
| `images/staff/staff-NN.*` | 960×960 | 1:1 | Portraits |
| `og/og-image.png` | 1200×630 | 1.91:1 | Social share card |

Orientation: scenes/holes landscape; staff square; gallery mixed (the masonry
assigns aspect boxes). Compress to ≤350 KB per image where possible.

---

## 4. Theming guide

Everything visual hangs off `identity.brandColors` (injected as CSS custom
properties in `app/layout.tsx`, consumed by Tailwind tokens in
`tailwind.config.ts`):

| Config key | CSS var | Tailwind token | Used for |
|---|---|---|---|
| `background` | `--c-bg` | `night` | Page canvas (keep near-black) |
| `backgroundRaised` | `--c-bg-raised` | `raised` | Cards, panels, nav-solid |
| `primary` | `--c-primary` | `pine` | Brand tint fills, table headers |
| `accent` | `--c-accent` | `brass` | CTAs, eyebrows, pins, play-line |
| `text` | `--c-text` | `cream` | Headings/body on dark |
| `textDim` | `--c-text-dim` | `mist` | Secondary text — **keep ≥4.5:1 contrast on `background`** |
| `line` | `--c-line` | `line` | Hairline borders |

Fonts: vendored OFL files in `/app/fonts/` wired by `/app/fonts.ts`
(`--font-display` serif, `--font-body` sans). To swap, replace the woff2
files and the two `localFont` blocks; `identity.fonts` is the human-readable
record of the pairing. Map accent colors for the flyover play-line come from
`brandColors.accent` automatically.

Tone constraint: the template is designed dark-first (WCAG AA verified for
the shipped palettes). If a client demands a light theme, audit every
`night/cream` pairing — that's a design pass, not a config swap.

---

## 5. Useful scripts

| Command | What it does |
|---|---|
| `npm run art` | Regenerates all placeholder SVG art + OG card |
| `npm run verify:routes` | Boots the prod build, checks every route + content (add `--resort=0` for non-resort) |
| `node scripts/layout-holes.mjs` | The routing generator used for the demo geometry — handy as a coordinate sanity-checker |
