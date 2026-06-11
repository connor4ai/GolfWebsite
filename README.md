# FAIRWAY — Premium Golf Course Website Template

A reusable, config-driven website system for golf courses and golf resorts,
in the dark editorial-luxury register of high-end hospitality brands. One
typed configuration file holds every course-specific detail; the site
structure never changes between clients.

Ships with a fully populated fictional demo — **Highmark Ridge Golf Club**,
a mountain resort course set on real Blue Ridge terrain above the Dan River
gorge in Virginia — plus a second example config (a public daily-fee course)
proving the conditional-module system.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

No API keys, no accounts, no env vars. Maps use keyless tile services
(Esri/USGS imagery, AWS terrain tiles); fonts are vendored; all artwork is
original generated SVG; ambient audio is synthesized in the browser.

## The two showpieces

- **`/explore`** — cinematic entry screen (with optional ambient audio)
  dissolving into a full-screen 3D satellite property map: category-styled
  pins, animated filter chips, flyTo + slide-in detail panels.
- **`/course/the-ridge/holes`** — hole-by-hole 3D flyover: a scripted
  camera rides the playing line from behind the tee to a slow orbit of the
  green while the shot arc draws onto real terrain. 1–18 scroller,
  par/yardage/caddie-tip overlay, replay, deep links (`?hole=12`).

Both experiences have a second, fully animated **Illustrated mode** — an
original vector rendering generated from the same coordinates — exposed as
a toggle and engaged automatically if tiles or WebGL are unavailable. The
experience never appears broken, including fully offline.

## Everything else

Home, course overview with print-ready scorecard, rates + membership,
stay (lodging/spa/activities), dine, weddings & events, about, filterable
gallery with lightbox, contact with validated inquiry form and embedded
locator map, branded 404 — every module switched by config flags, every
page complete.

## Configuration

| Where | What |
|---|---|
| `config/types.ts` | The strict `SiteConfig` schema |
| `config/highmark-ridge.config.ts` | The resort demo (active default) |
| `config/examples/daily-fee.config.ts` | Public muni example — all resort flags off |
| `config/course.config.ts` | One-line switch between client configs |

New-client onboarding (checklist, a Claude Code ingestion prompt, image
spec, theming guide): **[docs/REPOPULATE.md](docs/REPOPULATE.md)**.
Build decisions log: **[docs/DECISIONS.md](docs/DECISIONS.md)**.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Standard Next.js lifecycle |
| `npm run art` | Regenerate all placeholder SVG art + OG card |
| `npm run verify:routes` | Boot the prod build and assert every route + content (`--resort=0` for the daily-fee variant) |

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion ·
MapLibre GL JS (keyless: Esri World Imagery / USGS imagery, AWS terrarium
terrain) · self-hosted OFL fonts · Web Audio API.

---

*Highmark Ridge and Cedar Hollow are fictional demonstration properties.*
