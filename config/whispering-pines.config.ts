import type { SiteConfig, Hole, LatLng, SatView, ImageAsset } from "./types";
import layout from "../scripts/data/wp-layout.json";
import { bearingDeg, distanceM } from "@/lib/geo";

/**
 * WHISPERING PINES GOLF CLUB — Trinity, Texas.
 *
 * A real club: facts (designer, opening, rankings, renovation, tee names,
 * ratings, address, the Spirit, the Needler, the cottages) compiled from
 * public sources — see docs/WHISPERING-PINES.md for the source log and the
 * pre-launch checklist of items the club must verify (hole-by-hole card,
 * GPS coordinates, copy approval, photography).
 *
 * Imagery strategy: every visual slot carries a `sat` view — live-rendered
 * real aerial imagery of these exact coordinates — and accepts a `src`
 * photograph on top. Drop the club's photo library in 1:1 (manifest in
 * docs/WHISPERING-PINES.md) without touching layout or code.
 */

// ---------------------------------------------------------------------------
// Geometry helpers (config-time only)
// ---------------------------------------------------------------------------

interface LayoutHole {
  n: number;
  par: number;
  yards: number;
  tee: LatLng;
  green: LatLng;
  midpoints: LatLng[];
}

const champLayout = layout.championship as LayoutHole[];
const needlerLayout = layout.needler as LayoutHole[];

function midOf(h: LayoutHole): LatLng {
  return {
    lat: (h.tee.lat + h.green.lat) / 2,
    lng: (h.tee.lng + h.green.lng) / 2,
  };
}

/** Frame a hole for its aerial portrait: centered, oriented tee→green. */
function holeView(h: LayoutHole): SatView {
  const lenM = distanceM(h.tee, h.green);
  const zoom = lenM > 480 ? 15.7 : lenM > 380 ? 15.95 : lenM > 280 ? 16.2 : 16.7;
  return {
    center: midOf(h),
    zoom,
    bearing: bearingDeg(h.tee, h.green),
  };
}

const aerial = (
  center: LatLng,
  zoom: number,
  alt: string,
  bearing = 0,
  pitch = 0
): ImageAsset => ({ alt, sat: { center, zoom, bearing, pitch } });

const P = layout.pins as Record<string, LatLng>;
const CLUB = layout.clubhouse as LatLng;

// ---------------------------------------------------------------------------
// Championship card — Spirit tees total the published 7,468 yards.
// Per-hole yardage/handicap are presented for review against the club's
// printed card before launch (docs/WHISPERING-PINES.md §verify).
// ---------------------------------------------------------------------------

const CHAMP_CARD: Record<
  number,
  { yards: number; hcp: number; desc: string; tip: string }
> = {
  1: {
    yards: 450,
    hcp: 7,
    desc: "The round opens due north off the clubhouse hill, a broad two-shotter framed wall-to-wall by the loblolly pines that name the place. Zeon zoysia fairways run true and fast here — a firm handshake before the property starts to move.",
    tip: "There is more room left than the tree line admits. Favor that side and the approach opens up.",
  },
  2: {
    yards: 565,
    hcp: 3,
    desc: "A three-shot par five bending gently left through the northern woodland, the corridor narrowing in stages the closer you press toward the green. Position is the whole game — twice.",
    tip: "Take the second shot to the right half and the third is a full, flat wedge. Chase the left side and the pines do the scoring.",
  },
  3: {
    yards: 430,
    hcp: 9,
    desc: "Northeast across the highest ground on the property, with the first long views over the pine canopy toward the water. The green sits slightly proud, shedding anything tentative.",
    tip: "Trust one extra club on the approach — the exposed green plays longer than the number.",
  },
  4: {
    yards: 200,
    hcp: 15,
    desc: "The first one-shotter plays across the corner of the north lake, all carry to a green benched against the water. The TifEagle surface is generous; the line is not.",
    tip: "The water exaggerates everything. Pick the club for the middle of the green and swing without negotiation.",
  },
  5: {
    yards: 470,
    hcp: 1,
    desc: "The number-one handicap runs long and east, the fairway tumbling with the land before climbing to a deep, two-tiered green. Par here is a shot gained on almost everyone.",
    tip: "Drive to the right-center speed slot and accept the longest mid-iron you can hit flush. Bogey from the front fringe beats double from anywhere brave.",
  },
  6: {
    yards: 425,
    hcp: 11,
    desc: "Turning south for the first time, six works downhill through a pine-framed saddle. The scale deceives — the corridor is wider than it reads, the green smaller than it looks.",
    tip: "Check the wind at the flag, not the treetops; the corridor swirls it. Center of the green is always right.",
  },
  7: {
    yards: 230,
    hcp: 13,
    desc: "A long iron west across a natural amphitheater of pines, to a green defended by sand and shaved run-offs. The kind of par three the Spirit's internationals talk about on the flight home.",
    tip: "A running long iron beats a soaring hybrid here — the front door is open for a reason.",
  },
  8: {
    yards: 585,
    hcp: 5,
    desc: "The longest hole on the card swings south in two unhurried turns. Big hitters can flirt with the inside line; everyone else plays the width Chet Williams gave them and arrives putting for birdie anyway.",
    tip: "The hole gives you one wide landing area per shot. Use all three and the green arrives on schedule.",
  },
  9: {
    yards: 395,
    hcp: 17,
    desc: "Home along the eastern meadow to a green set below the clubhouse porch — the friendliest look of the front nine, and the best chance to turn in red figures.",
    tip: "Aim the tee ball at the flag on the practice green and take dead aim with the wedge. This one owes you.",
  },
  10: {
    yards: 430,
    hcp: 8,
    desc: "The inward nine starts south into the quiet heart of the property, the fairway sliding between pine shadows toward a green that tilts subtly back at you.",
    tip: "Below the hole is everything. Leave the approach a half-club short and putt uphill all day.",
  },
  11: {
    yards: 545,
    hcp: 4,
    desc: "A par five working steadily down toward Caney Creek country, bending left past the property's southern lakes. The third shot plays to a green you'll want to photograph and then respect.",
    tip: "Lay up long-right of the 100 marker; the angle past the front bunkering is worth twenty yards of distance.",
  },
  12: {
    yards: 185,
    hcp: 16,
    desc: "The first taste of the water that defines the finish: a mid-iron from a bluff with the creek bottoms glittering beyond. The green is wide and honest — the setting does the intimidating.",
    tip: "It's a half-club downhill from the bluff. Believe it.",
  },
  13: {
    yards: 560,
    hcp: 2,
    desc: "Now the famous stretch begins. Thirteen plunges south to the creek itself, a true three-shot five that ends hard against the bottomland — gators and all. The start of the run home along Caney Creek and the headwaters of Lake Livingston.",
    tip: "Whatever the lie says, finish your second short of the final crest — from there the green sits in a natural theater you want to walk into, not gamble at.",
  },
  14: {
    yards: 455,
    hcp: 6,
    desc: "Back up the creek line with the water riding your right shoulder the whole way. Long, beautiful, and unbothered by your score.",
    tip: "The fairway cants toward the creek — start everything one width left and let it work back.",
  },
  15: {
    yards: 178,
    hcp: 18,
    desc: "The signature. From the tee the green floats out in Gator Cove, a dome of TifEagle ringed by water with a single jagged-edged bunker spilling off the front-left into the cove. One swing, fully meant — the most photographed moment in Texas golf.",
    tip: "The number is the number — the cove adds no yardage, only voltage. Middle of the green, every pin, every time.",
  },
  16: {
    yards: 440,
    hcp: 14,
    desc: "Turning for home along the water's last reach, sixteen runs west with the lake headwaters glinting through the trees. A complete driving hole with the round on the line.",
    tip: "The right-center line shortens the hole and keeps the water out of mind, if not out of sight.",
  },
  17: {
    yards: 445,
    hcp: 12,
    desc: "A two-shotter climbing northwest through the pines, the creek finally behind you and the clubhouse chimney appearing through the canopy. Seventeen has quietly decided more matches here than fifteen.",
    tip: "An extra club uphill into the evening breeze — the green's false front returns anything proud.",
  },
  18: {
    yards: 480,
    hcp: 10,
    desc: "The closer plays long and northeast to the clubhouse lawn, the porch filling with the day's verdicts as you walk up. A par at the last at Whispering Pines is a story you're allowed to keep.",
    tip: "Swing freely — the fairway is the widest on the back nine. The hole only punishes the protective.",
  },
};

const NEEDLER_DESC: Record<number, { desc: string; tip: string }> = {
  1: { desc: "The Needler opens with a mid-iron over native scruff — Pine Valley's short course was the muse, and it shows immediately.", tip: "Land it on the front third; everything feeds to center." },
  2: { desc: "A flick of a hole where the contour does all the defending.", tip: "Take less club than pride suggests." },
  3: { desc: "The longest of the opening stretch, to a green tipped against the trees.", tip: "Right edge, always — the slope is your caddie." },
  4: { desc: "Barely a wedge, entirely a test. The smallest green on the property.", tip: "Pick a landing spot the size of a towel and hit it." },
  5: { desc: "The dare: a drivable par four at 312 from the back pegs, with trouble everywhere ambition lands. Matches are settled here nightly.", tip: "Three-wood finds the throat; driver finds the stories." },
  6: { desc: "A long one-shotter through a pine gate — the most demanding swing on the short course.", tip: "Commit to the line over the left bunker's edge." },
  7: { desc: "Short, surrounded by sand, with the day's pin dictating everything.", tip: "Check the sheet — back pins here are a different hole." },
  8: { desc: "The penultimate green sits in a hollow that collects courage and rejects caution.", tip: "Flight it down; the hollow does the rest." },
  9: { desc: "A finishing wedge under the clubhouse lights — the Needler ends arguments and starts them.", tip: "One smooth swing; the porch is watching." },
};

const SCALES: [string, number][] = [
  ["spirit", 1],
  ["one-pine", 0.925],
  ["two-pines", 0.853],
  ["three-pines", 0.785],
];

const round5 = (n: number) => Math.round(n / 5) * 5;

const champHoles: Hole[] = champLayout.map((h) => {
  const card = CHAMP_CARD[h.n];
  const yardages: Record<string, number> = {};
  for (const [id, k] of SCALES) {
    yardages[id] = k === 1 ? card.yards : round5(card.yards * k);
  }
  return {
    number: h.n,
    par: h.par,
    yardages,
    handicap: card.hcp,
    description: card.desc,
    proTip: card.tip,
    heroImage: {
      alt: `Aerial view of hole ${h.n} at Whispering Pines Golf Club, a par ${h.par} of ${card.yards} yards`,
      sat: holeView(h),
    },
    tee: h.tee,
    green: h.green,
    midpoints: h.midpoints,
  };
});

const needlerHoles: Hole[] = needlerLayout.map((h) => {
  const tips = h.yards;
  return {
    number: h.n,
    par: h.par,
    yardages: {
      back: tips,
      middle: round5(Math.max(60, tips * 0.82)),
      forward: round5(Math.max(50, tips * 0.62)),
      family: round5(Math.max(40, tips * 0.45)),
    },
    handicap: h.n,
    description: NEEDLER_DESC[h.n].desc,
    proTip: NEEDLER_DESC[h.n].tip,
    heroImage: {
      alt: `Aerial view of Needler hole ${h.n}, a ${tips}-yard par ${h.par}`,
      sat: holeView(h),
    },
    tee: h.tee,
    green: h.green,
    midpoints: h.midpoints,
  };
});

// ---------------------------------------------------------------------------

const config: SiteConfig = {
  identity: {
    courseName: "Whispering Pines Golf Club",
    shortName: "Whispering Pines",
    tagline: "The No. 1 golf course in Texas",
    established: 2000,
    logo: {
      crest: "/images/crest.svg",
      monogram: "/images/monogram.svg",
    },
    brandColors: {
      background: "#0e1310",
      backgroundRaised: "#18211a",
      primary: "#20402c",
      accent: "#c2a35d",
      text: "#f3efe6",
      textDim: "#a9a591",
      line: "#38402f",
    },
    manifesto:
      "Build the best golf course in Texas, hide it in four hundred acres of pines, and let every round played beneath them carry the game somewhere larger than itself.",
    fonts: {
      display: "Cormorant Garamond",
      body: "Jost",
    },
  },

  flags: {
    isResort: false,
    hasLodging: true,
    hasDining: false,
    hasWeddings: false,
    hasMembership: true,
    hasSpa: false,
    hasActivities: false,
    courseAccess: "private",
    numberOfCourses: 2,
  },

  location: {
    address: {
      line1: "1532 Whispering Pines Drive",
      city: "Trinity",
      region: "Texas",
      postalCode: "75862",
      country: "US",
    },
    coords: CLUB,
    elevationFt: 250,
    acreage: 400,
    regionNarrative:
      "Whispering Pines occupies four hundred acres of East Texas piney woods at the headwaters of Lake Livingston, where Caney Creek slides out of the forest and gives itself to the lake. It is eighty-eight miles and one entire world north of Houston: loblolly pines a hundred feet tall, white sand under native grasses, water on three sides, and wildlife that treats the golf course as a guest. Golfers who make the drive describe what they find the same way the rankings do — the best golf in Texas, hidden in plain sight.",
    directions: [
      {
        from: "Houston",
        text: "I-45 North to Huntsville, exit TX-19 North to Trinity. In Trinity, take TX-94 north four miles, then right on FM 3188 east five miles and follow the club signage to the gate at Whispering Pines Drive. About one hour forty-five minutes from the Loop.",
      },
      {
        from: "Dallas / Fort Worth",
        text: "I-45 South to Huntsville, then TX-19 North to Trinity and the FM 3188 approach as above. Roughly three hours — the last ten minutes through the pines are the point.",
      },
      {
        from: "By air",
        text: "George Bush Intercontinental (IAH) is ninety minutes south. Private aircraft favor Huntsville Municipal (UTS), thirty-five minutes from the gate.",
      },
    ],
  },

  booking: {
    // Private club: the primary CTA routes to the inquiry page.
    teeTimeUrl: "/contact?topic=membership",
    ctaLabel: "Inquire",
    phone: "(936) 594-4980",
    phoneHref: "tel:+19365944980",
    bookingNote:
      "Whispering Pines is a private club. Play is reserved for Spirit Golf Association members, their guests, and supporters of the club's charitable mission.",
  },

  courses: [
    {
      slug: "championship",
      name: "The Championship Course",
      designer: "Chet Williams, Nicklaus Design — opened 2000, renovated by Williams 2019–20",
      yearBuilt: 2000,
      par: 72,
      signatureHoleNumber: 15,
      heroImage: aerial(
        midOf(champLayout[12]),
        14.6,
        "Aerial view of the Championship Course winding through the East Texas pines toward Caney Creek",
        205,
        48
      ),
      description:
        "Corby Robertson Jr. staked a routing through his family's piney woods in 1992 and asked Chet Williams of Nicklaus Design for the best course in Texas. Twenty months of work later, in March 2000, Whispering Pines opened — and the rankings have spent a quarter-century agreeing. Golf Digest has named it the No. 1 course in Texas in every list since 2013 and ranks it among America's 100 Greatest. The course rides four hundred acres of pines, creeks, lakes and natural sand, climaxing in a closing run along gator-patrolled Caney Creek and the headwaters of Lake Livingston. A tee-to-green renovation by Williams — new TifEagle greens, Zeon zoysia fairways, rebuilt bunkers and tees — reopened the course in fall 2020 sharper than ever.",
      designerStory:
        "Chet Williams came to the property as a Nicklaus Design senior architect and never really left it; Whispering Pines is the course that made his name, and he has cared for it like a member of the family since. His brief from founder Corby Robertson Jr. was unambiguous — build the best course in Texas — and his method was patience: walking the rough-cut corridors Robertson had staked through the pines, refining them into golf that uses the land's tumble, its white sand, and its water without ever bullying them. Two decades on, Williams returned to renovate his own masterwork, rebuilding every green and tee and re-grassing the property wall to wall. The result swept Texas's top honors all over again.",
      teeBoxes: [
        { id: "spirit", name: "Spirit", color: "#c2a35d" },
        { id: "one-pine", name: "1 Pine", color: "#2e6e46" },
        { id: "two-pines", name: "2 Pines", color: "#e8e6e0" },
        { id: "three-pines", name: "3 Pines", color: "#b7c4cf" },
      ],
      ratings: [
        { teeId: "spirit", rating: 77.0, slope: 150, yards: 7468 },
        { teeId: "one-pine", rating: 74.1, slope: 145, yards: 6905 },
        { teeId: "two-pines", rating: 71.7, slope: 139, yards: 6370 },
        { teeId: "three-pines", rating: 69.5, slope: 134, yards: 5860 },
      ],
      gallery: [
        aerial(champLayout[14].green, 17.1, "The fifteenth green ringed by the waters of Gator Cove", 96),
        aerial(midOf(champLayout[12]), 15.8, "The thirteenth descending to the Caney Creek bottoms", 160),
        aerial(midOf(champLayout[4]), 16.0, "The fifth fairway tumbling through the pines", 73),
        aerial(P.clubhouse, 16.4, "The clubhouse grounds and ninth green from above", 30),
        aerial(midOf(champLayout[7]), 15.7, "The eighth, the card's longest journey, from overhead", 190),
        aerial(midOf(champLayout[16]), 16.0, "Seventeen climbing home through the pine corridor", 310),
      ],
      holes: champHoles,
    },
    {
      slug: "the-needler",
      name: "The Needler",
      designer: "Chet Williams — in the spirit of Pine Valley's short course and Augusta's Par-3",
      yearBuilt: 2000,
      par: 28,
      signatureHoleNumber: 5,
      heroImage: aerial(
        P.needler,
        16.5,
        "Aerial view of the Needler, Whispering Pines' nine-hole short course",
        290
      ),
      description:
        "Nine short holes beside the clubhouse, inspired by the great short course at Pine Valley and the Par-3 at Augusta National — and spoken of by those who've played it as the best short course in America. Eight one-shotters from 68 to 205 yards, one drivable dare of a par four, four sets of tees on every hole, and no safe place for an unconsidered swing. Settle the day's debts here as the light goes long.",
      designerStory:
        "Williams built the Needler as concentrated golf: every hole a question with the wedge-to-mid-iron answers that decide real matches. Members treat it as equal parts practice ground, nightcap, and dueling field.",
      teeBoxes: [
        { id: "back", name: "Back", color: "#c2a35d" },
        { id: "middle", name: "Middle", color: "#2e6e46" },
        { id: "forward", name: "Forward", color: "#e8e6e0" },
        { id: "family", name: "Family", color: "#b7c4cf" },
      ],
      ratings: [],
      gallery: [
        aerial(P.needler, 16.9, "The Needler's opening holes from above", 320),
        aerial(needlerLayout[4].tee, 17.0, "The drivable fifth — the Needler's dare", 222),
      ],
      holes: needlerHoles,
    },
  ],

  propertyMap: {
    center: { lat: 30.8595, lng: -95.1955 },
    zoom: 14.5,
    bearing: 200,
    pitch: 50,
    holePins: true,
    tour: { label: "Play the property tour", dwell: 3.2 },
    entry: {
      headline: "Whispering Pines",
      subcopy:
        "Four hundred acres of East Texas pines, twenty-seven holes, Caney Creek and the headwaters of Lake Livingston — explore the No. 1 course in Texas from above.",
      cta: "Explore the Property",
    },
    pins: [
      {
        id: "clubhouse",
        coords: P.clubhouse,
        category: "golf",
        title: "The Clubhouse",
        shortDesc:
          "The heart of the club above the ninth and eighteenth greens — golf shop, locker rooms, dining room and the porch where every Spirit story gets retold.",
        image: aerial(P.clubhouse, 16.8, "The clubhouse and surrounds from above", 30),
        route: "/about",
      },
      {
        id: "first-tee",
        coords: P.firstTee,
        category: "golf",
        title: "The First Tee",
        shortDesc:
          "Four hundred fifty yards due north into the pines — the opening handshake of the No. 1 course in Texas.",
        image: aerial(P.firstTee, 16.9, "The first tee and opening fairway from above", 18),
        route: "/course/championship/holes?hole=1",
      },
      {
        id: "gator-cove",
        coords: P.gatorCove,
        category: "golf",
        title: "No. 15 — Gator Cove",
        shortDesc:
          "The signature one-shotter: 178 yards to a domed green set in the water, one jagged bunker spilling into the cove, and residents who enforce the lateral hazard personally.",
        image: aerial(P.gatorCove, 17.2, "The fifteenth green in Gator Cove from above", 96),
        route: "/course/championship/holes?hole=15",
      },
      {
        id: "needler",
        coords: P.needler,
        category: "golf",
        title: "The Needler",
        shortDesc:
          "Nine short holes in the spirit of Pine Valley and Augusta's Par-3 — called by many the best short course in America. Matches end here; legends start here.",
        image: aerial(P.needler, 16.7, "The Needler short course from above", 290),
        route: "/course/the-needler",
      },
      {
        id: "practice",
        coords: P.range,
        category: "practice",
        title: "Practice Grounds",
        shortDesc:
          "A full grass range aimed into the pines, short-game complexes, and the putting green where Spirit internationals warm up in November.",
        image: aerial(P.range, 16.8, "The practice grounds from above", 335),
        route: "/course/championship",
      },
      {
        id: "putting-green",
        coords: P.puttingGreen,
        category: "practice",
        title: "The Putting Green",
        shortDesc:
          "TifEagle rolled to championship speed beside the first tee — the honest preview of everything that follows.",
        image: aerial(P.puttingGreen, 17.3, "The putting green beside the clubhouse", 120),
        route: "/course/championship",
      },
      {
        id: "village",
        coords: P.village,
        category: "lodging",
        title: "The Village",
        shortDesc:
          "Professionally appointed cottages within the gates, built for golf trips, corporate retreats and Spirit weeks — walk to the first tee, fall asleep to the pines.",
        image: aerial(P.village, 17.0, "The Village cottages from above", 20),
        route: "/stay",
      },
      {
        id: "directors-corner",
        coords: P.directorsCorner,
        category: "lodging",
        title: "Director's Corner",
        shortDesc:
          "The club's premier cottage — whole-house comfort steps from the clubhouse, reserved for groups who want the property at arm's reach.",
        image: aerial(P.directorsCorner, 17.0, "Director's Corner cottage from above", 58),
        route: "/stay",
      },
      {
        id: "lonesome-dove",
        coords: P.lonesomeDove,
        category: "lodging",
        title: "Lonesome Dove",
        shortDesc:
          "The newest quarters inside the gates: eight casitas and two great-room casas arranged around a courtyard and its custom fireplace.",
        image: aerial(P.lonesomeDove, 17.0, "The Lonesome Dove casitas from above", 345),
        route: "/stay",
      },
      {
        id: "spirit",
        coords: P.spiritPlaza,
        category: "amenity",
        title: "Home of the Spirit International",
        shortDesc:
          "Every two years the world's best amateurs — two men, two women per nation — gather here for the Spirit International Amateur Golf Championship, golf's Olympic village in the pines.",
        image: aerial(P.spiritPlaza, 16.6, "The grounds that host the Spirit International", 95),
        route: "/about",
      },
      {
        id: "caney-creek",
        coords: { lat: 30.8525, lng: -95.1885 },
        category: "activity",
        title: "Caney Creek",
        shortDesc:
          "The gator-patrolled water that shapes the famous closing run, sliding out of the pines into the headwaters of Lake Livingston.",
        image: aerial({ lat: 30.8525, lng: -95.1885 }, 16.2, "Caney Creek winding past the closing holes", 150),
        route: "/course/championship/holes?hole=13",
      },
      {
        id: "camp-olympia",
        coords: P.campOlympia,
        category: "activity",
        title: "Camp Olympia",
        shortDesc:
          "The Robertson family's storied summer camp at the peninsula's tip — neighbor, sibling, and the Spirit's athlete village since the beginning.",
        image: aerial(P.campOlympia, 16.3, "Camp Olympia on the Lake Livingston shoreline", 210),
        route: "/about",
      },
      {
        id: "lake-livingston",
        coords: P.boatLanding,
        category: "activity",
        title: "Lake Livingston Headwaters",
        shortDesc:
          "Ninety thousand acres of water begin here, where the Trinity River and Caney Creek meet the pines. The view west at dusk belongs on the wall.",
        image: aerial(P.boatLanding, 15.6, "The headwaters of Lake Livingston at the property's edge", 240),
        route: "/explore",
      },
    ],
  },

  lodging: [
    {
      id: "village",
      name: "The Village",
      summary: "Cottages within the gates, a short walk from the first tee.",
      description:
        "The Village is how a golf trip to Whispering Pines becomes a residency: professionally decorated and furnished cottages inside the gates, configured for foursomes, corporate retreats, and the long weeks of the Spirit. Mornings start with coffee on the porch and the sound of the range; evenings end at the Needler under a Texas sky.",
      image: aerial(P.village, 16.9, "The Village cottages among the pines", 20),
      sleeps: 8,
      priceFrom: 0,
      details: [
        "Multiple cottage configurations for groups and outings",
        "Professionally decorated and fully furnished",
        "Steps from the clubhouse, range, and the Needler",
        "Reserved through the club — see Cottage FAQs",
      ],
    },
    {
      id: "directors-corner",
      name: "Director's Corner",
      summary: "The club's premier cottage, steps from the clubhouse.",
      description:
        "Director's Corner is the address groups ask for by name: the property's premier cottage, positioned at the clubhouse's shoulder with room for a full buddies' trip or a board retreat. Nightly rate from $1,350 plus tax — the kind of number that divides by eight very agreeably.",
      image: aerial(P.directorsCorner, 16.9, "Director's Corner beside the clubhouse grounds", 58),
      sleeps: 8,
      priceFrom: 1350,
      details: [
        "The club's flagship cottage",
        "From $1,350 per night plus tax",
        "Clubhouse, practice grounds and Needler at the doorstep",
        "Books earliest of all quarters — plan ahead",
      ],
    },
    {
      id: "lonesome-dove",
      name: "Lonesome Dove",
      summary: "Eight casitas and two casas around a courtyard fireplace.",
      description:
        "The newest addition within the gates: Lonesome Dove gathers eight casitas around a courtyard with a custom-made fireplace, anchored by two great-room casas built for the hours after golf. It is the property's most social address — by design.",
      image: aerial(P.lonesomeDove, 16.9, "The Lonesome Dove courtyard and casitas", 345),
      sleeps: 16,
      priceFrom: 0,
      details: [
        "8 casitas + 2 great-room casas",
        "Courtyard with custom fireplace",
        "Built for full-group buyouts and Spirit weeks",
        "Reserved through the club",
      ],
    },
  ],

  dining: [],
  activities: [],

  rates: {
    intro:
      "Whispering Pines is a private club operated by the Spirit Golf Association, a 501(c)(3) charitable organization. Access comes through SGA membership and sponsorship — and every round played here advances the mission: world-class golf in service of the Texas Medical Center, health-related causes, and the amateur game.",
    tables: [],
    lodgingRates: [
      {
        name: "Director's Corner",
        rate: "from $1,350 / night + tax",
        note: "The club's premier cottage. Sleeps a full group.",
      },
      {
        name: "The Village cottages",
        rate: "by arrangement",
        note: "Configurations for foursomes through full outings.",
      },
      {
        name: "Lonesome Dove casitas & casas",
        rate: "by arrangement",
        note: "Eight casitas, two casas, one courtyard fireplace.",
      },
    ],
    notes: [
      "Cottage stays are reserved through the club office — see the Cottage FAQs or call (936) 594-4980.",
      "Group outings and corporate retreats are hosted within the gates with golf, lodging and dining arranged as one program.",
      "The club closes seasonally each winter; the calendar is set annually.",
    ],
    membership: {
      headline: "Membership & The Spirit",
      intro:
        "Founded by Corby Robertson Jr. in 1998, the Spirit Golf Association exists to do two things at once: sustain the best golf course in Texas, and turn that golf into support for the Texas Medical Center, health-related causes, and amateur golf. SGA members and sponsors don't just join a club — they underwrite a mission, and play Whispering Pines as the privilege that comes with it.",
      tiers: [],
      contactNote:
        "Membership and sponsorship inquiries: (936) 594-4980, or send a note through the contact page and the club will call you back.",
    },
  },

  about: {
    historyHeadline: "Best in Texas, built on purpose",
    history: [
      "The land came first. In 1970, Barbara and Corby Robertson Jr. bought four hundred acres of piney woods on the headwaters of Lake Livingston for Camp Olympia, the summer camp that still anchors the peninsula's southern tip. For two decades the future golf course was simply forest — pines, white sand, Caney Creek, and the family's conviction that the place was extraordinary.",
      "In 1992, Robertson walked the woods and staked out a routing. The brief he eventually handed Chet Williams of the Nicklaus Design Group had no hedge in it: build the best course in Texas. Twenty months of construction later, Whispering Pines opened in March 2000 — and the verdict arrived almost immediately, in the form of every ranking that matters. Golf Digest has named it Texas's No. 1 course in every Best-in-State list since 2013 and ranks it among America's 100 Greatest; the Dallas Morning News crowned it No. 1 eleven times before that streak even began.",
      "In 1998 the vision widened into the Spirit Golf Association, a 501(c)(3) that operates the club in service of the Texas Medical Center, health-related causes, and amateur golf — and in 2001 the SGA created the club's signature gift to the game: the Spirit International Amateur Golf Championship, a biennial 'Olympics of amateur golf' that brings two men and two women from each competing nation to Trinity, houses them at Camp Olympia, and crowns world champions under the pines.",
      "In December 2019 Chet Williams returned to renovate his own masterpiece: every green rebuilt in TifEagle bermuda, every tee releveled, the bunkers recut, and the property re-grassed wall-to-wall in Zeon zoysia. Whispering Pines reopened in fall 2020 — and promptly swept the state's top honors again. The club remains what it was built to be: golf of the first rank, played for something larger than golf.",
    ],
    accolades: [
      { kind: "ranking", source: "Golf Digest — America's 100 Greatest Golf Courses, No. 66", year: 2025 },
      { kind: "ranking", source: "Golf Digest — No. 1 Course in Texas, every list since 2013", year: 2025 },
      { kind: "award", source: "Dallas Morning News — No. 1 Course in Texas, eleven times", year: 2012 },
      {
        kind: "press",
        source: "The Huntsville Item",
        year: 2024,
        quote: "The Augusta of Texas — one of a kind.",
      },
    ],
    gallery: [
      { ...aerial(P.gatorCove, 17.2, "Gator Cove and the fifteenth green", 96), category: "The Creek Run" },
      { ...aerial(midOf(champLayout[12]), 15.9, "Thirteen falling toward Caney Creek", 160), category: "The Creek Run" },
      { ...aerial(midOf(champLayout[13]), 16.0, "Fourteen riding the creek line home", 337), category: "The Creek Run" },
      { ...aerial({ lat: 30.8525, lng: -95.1885 }, 15.6, "Caney Creek meeting the headwaters", 150), category: "The Creek Run" },
      { ...aerial(midOf(champLayout[0]), 16.1, "The first hole running north into the pines", 18), category: "Championship" },
      { ...aerial(midOf(champLayout[4]), 16.0, "The fifth, the card's sternest test", 73), category: "Championship" },
      { ...aerial(midOf(champLayout[7]), 15.7, "The eighth from above — 585 yards of patience", 190), category: "Championship" },
      { ...aerial(P.clubhouse, 16.6, "The clubhouse hill between nine and eighteen", 30), category: "Property" },
      { ...aerial(P.needler, 16.8, "The Needler's nine, packed beside the clubhouse", 290), category: "The Needler" },
      { ...aerial(needlerLayout[4].tee, 17.0, "The drivable dare at Needler No. 5", 222), category: "The Needler" },
      { ...aerial(P.village, 16.8, "The Village cottages in the trees", 20), category: "Property" },
      { ...aerial(P.campOlympia, 16.2, "Camp Olympia at the peninsula's tip", 210), category: "Property" },
    ],
    staff: [],
  },

  announcement: {
    enabled: false,
    text: "",
  },

  seo: {
    siteUrl: "https://whisperingpinesgolfclub.com",
    description:
      "Whispering Pines Golf Club — the No. 1 ranked golf course in Texas and one of America's 100 Greatest. A private Chet Williams/Nicklaus Design masterpiece in the East Texas pines at the headwaters of Lake Livingston, home of the Spirit International Amateur Golf Championship, the Needler short course, and cottages within the gates. Trinity, Texas.",
    keywords: [
      "Whispering Pines Golf Club",
      "best golf course in Texas",
      "Trinity Texas golf",
      "Spirit International Amateur",
      "Chet Williams Nicklaus Design",
      "The Needler short course",
    ],
  },
};

export default config;
