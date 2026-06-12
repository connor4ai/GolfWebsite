# Whispering Pines Golf Club — Build Dossier

The `claude/whispering-pines` branch turns the FAIRWAY template into a
launch-candidate site for **Whispering Pines Golf Club, Trinity, Texas**
(whisperingpinesgolfclub.com). This file records what is verified fact,
what is derived, and exactly what the club must sign off before launch.

---

## 1. Verified facts in the config (with sources)

| Fact | Source |
|---|---|
| Chet Williams (Nicklaus Design) design; opened March 2000; founder Corby Robertson Jr.; routing staked 1992 | nicklausdesign.com; texasforestcountryliving.com; where2golf.com |
| Land bought 1970 by Barbara & Corby Robertson Jr. for Camp Olympia | countryclubmag.com |
| Spirit Golf Association founded 1998; 501(c)(3); supports Texas Medical Center, health causes, amateur golf; club is SGA members/sponsors only | texasforestcountryliving.com; whisperingpinesgolfclub.com (search snippets) |
| Spirit International Amateur: biennial, two men + two women per nation, athletes housed at Camp Olympia | itemonline.com; golf.com coverage |
| 2019–20 Chet Williams renovation: all greens rebuilt (TifEagle), tees releveled, bunkers rebuilt, Zeon Zoysia wall-to-wall; reopened fall 2020 | thegolfwire.com; golfcoursearchitecture.net; golfdom.com |
| Golf Digest: America's 100 Greatest **No. 66** (2025-26); **No. 1 in Texas every list since 2013**; Dallas Morning News No. 1 ×11 | golfdigest.com; kicks105.com; yahoo/golfweek |
| Par 72; ~7,468 yds; tees **Spirit 77.0/150 · 1 Pine 74.1/145 · 2 Pines 71.7/139 · 3 Pines 69.5/134** | bluegolf.com course profile (search capture) |
| Signature 15th: 178-yard par 3 over **Gator Cove**, jagged bunker front-left into the water | bestgolftexas.com |
| Closing six along Caney Creek + headwaters of Lake Livingston | where2golf.com; multiple |
| The Needler: 9 holes, 4 tee boxes per hole, 68–312 yds; inspired by Pine Valley's short course & Augusta's Par-3 | whisperingpinesgolfclub.com (snippets); golfwire |
| Cottages: The Village; **Director's Corner from $1,350/night + tax**; **Lonesome Dove: 8 casitas + 2 casas, courtyard fireplace** | whisperingpinesgolfclub.com /cottages + /cottage-faqs (snippets) |
| Address **1532 Whispering Pines Dr, Trinity, TX 75862**; phone **(936) 594-4980**; ~88 miles north of Houston | yellowpages/yelp/PGA directory |
| 400-acre property; pines, creeks, lakes, natural sand | nicklausdesign.com |

## 2. Derived data — flag for club verification before launch

1. **GPS coordinates (property + every hole).** The club's site and APIs
   were unreachable from the build environment, so the property location
   was derived by water-shape matching in open elevation data
   (`scripts/locate-course.mjs`): the peninsula at the lake's headwaters
   between the Trinity River arm and the Caney Creek arm, clubhouse
   ≈ (30.8638, −95.1990). The 18-hole routing
   (`scripts/layout-whispering-pines.mjs` → `scripts/data/wp-layout.json`)
   honors the published facts (par sequence totals, creek-side 13–18,
   Gator Cove 15th, Needler beside the clubhouse) but **is not surveyed**.
   → Open `/explore` over real satellite, walk the pins, and correct
   coordinates in the layout script (regenerate) or directly in config.
2. **Per-hole yardages and stroke indexes.** Published totals and the
   15th's 178 are real; the other 17 per-hole numbers are a reconstruction
   that sums exactly to 7,468 (and tee scalings to the rated totals).
   → Replace with the printed card.
3. **Hole-by-hole descriptions & caddie tips.** Original editorial copy
   grounded in the verified routing narrative — written as draft copy for
   club approval, like any agency engagement.
4. **Needler per-hole data** (lengths within the published 68–312 window,
   par 28 with the drivable 5th) — reconstruction; replace with the card.
5. **Press-quote year** for “the Augusta of Texas” (The Huntsville Item) —
   article year needs confirmation.
6. **og-image.png** is brand art; swap for a photograph at launch.

## 3. Imagery system & the photo drop

Every photo slot is an `ImageAsset` carrying a `sat` view: until club
photography is supplied, the site renders **live aerial imagery of the
actual property** (Esri World Imagery, client-side) in every slot — real
photography by definition, never a broken frame (offline → branded veil).
The hero and explore entry are *living* aerials with cinematic drift.

To drop in photography: set `src` on any asset in
`config/whispering-pines.config.ts` to a local path or a
`https://whisperingpinesgolfclub.com/...` URL (host already allowed in
`next.config.mjs`). The aerial remains as automatic fallback.

**Requested library (1:1 slots)** — landscape 2000×1250+ unless noted:

| Slot | Subject |
|---|---|
| Hero (home) | Signature dusk/dawn landscape — ideally 15 over Gator Cove |
| Course heroes ×2 | Championship sweep; the Needler |
| 18 hole portraits | Each championship hole (aerials already in place) |
| Cottages ×3 | Village, Director's Corner, Lonesome Dove courtyard (fireplace lit) |
| Clubhouse, practice grounds, putting green | |
| Spirit International | Flags/opening-ceremony imagery |
| Gallery ×12 | Mixed: creek run, pines, details, lifestyle |
| Crest | Official club mark (replaces generated `images/crest.svg` + `monogram.svg`) |
| OG card 1200×630 | Social share photograph |

## 4. Experience map (what was built for this client)

- **Home**: preloader → living-aerial hero with masked-line kinetic type
  and scroll parallax → honors marquee → scroll-pinned manifesto
  (word-by-word) → animated counters → two-course showcase → **the
  finishing-run horizontal scroll story (13–18 over real aerials)** →
  explore teaser (live) → cottages card → aerial gallery. Lenis smooth
  scrolling; every animated system honors prefers-reduced-motion.
- **Explore**: living-aerial entry → 3D satellite property with numbered
  pins for all 18 championship holes + facilities, filter chips, detail
  panels with aerial imagery, **auto-flying property tour** (hole 1 → 18
  → cottages), idle cinematic drift, atmosphere grade + grain, and the
  illustrated vector fallback when offline.
- **Courses ×2** with flyovers (satellite 3D + illustrated modes), full
  scorecards (Spirit/1 Pine/2 Pines/3 Pines with real ratings), print
  stylesheet.
- **Stay / Membership / About / Gallery / Contact** rebuilt around the
  private-club model: no public rates, membership & Spirit mission lead,
  cottage rates, inquiry-first CTAs ("Inquire"), no fabricated emails,
  staff section intentionally empty until the club supplies bios.
- Dining/weddings module flags are **off** (not on the club's current
  site); each is one config flag away if the club wants the page.

## 5. Pre-launch checklist

- [ ] Club verifies §2 items (coordinates, card, copy, quote year)
- [ ] Photography drop per §3 (or accept aerial-first art direction)
- [ ] Official crest files
- [ ] Confirm membership-inquiry routing (currently contact form + phone)
- [ ] DNS/hosting cutover to whisperingpinesgolfclub.com
- [ ] Replace og-image.png; re-run `npm run build && npm run verify:routes`
