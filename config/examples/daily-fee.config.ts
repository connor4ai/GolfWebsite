import type { SiteConfig, Hole, LatLng } from "../types";

/**
 * EXAMPLE CLIENT — Cedar Hollow Golf Course (fictional).
 *
 * Demonstrates the template with every resort module switched OFF: a
 * walkable public daily-fee course. Pages for lodging, dining, and
 * weddings disappear from the nav and return 404s; the explore map shows
 * golf and practice pins only; rates render without a membership section.
 *
 * NOTE: hole geometry intentionally reuses the demo routing coordinates —
 * an example config exists to prove the rendering paths, and real client
 * onboarding replaces these with surveyed coordinates (see
 * /docs/REPOPULATE.md). Artwork is shared with the demo for the same
 * reason; alt text is written for this course.
 */

const T = (lat: number, lng: number): LatLng => ({ lat, lng });

interface HoleSeed {
  n: number;
  par: number;
  hcp: number;
  y: [number, number, number];
  name: string;
  desc: string;
  tip: string;
  tee: LatLng;
  green: LatLng;
  mids: LatLng[];
}

const SEEDS: HoleSeed[] = [
  { n: 1, par: 4, hcp: 9, y: [412, 385, 310], name: "Mill Run", desc: "A friendly opener sliding downhill with the old mill race along the left — plenty of room right for a first swing of the day.", tip: "Favor the right-center; everything feeds back to the middle.", tee: T(36.716209, -80.447432), green: T(36.714414, -80.451016), mids: [] },
  { n: 2, par: 5, hcp: 5, y: [548, 515, 415], name: "The Bottoms", desc: "The longest hole on the card works left along the creek bottoms; three honest shots beat two heroic ones every time.", tip: "Lay up right of the 150 post for the flattest stance on the hole.", tee: T(36.71457, -80.451354), green: T(36.714357, -80.456829), mids: [T(36.714936, -80.454605)] },
  { n: 3, par: 3, hcp: 17, y: [188, 175, 140], name: "Short Crossing", desc: "Across the hollow to a green that's deeper than it looks — the front yardage and the back differ by three clubs.", tip: "Check the flag color from the tee: blue means add two clubs.", tee: T(36.714697, -80.456904), green: T(36.716049, -80.457839), mids: [] },
  { n: 4, par: 4, hcp: 3, y: [433, 405, 325], name: "The Grade", desc: "Cedar Hollow's stiffest par four climbs steadily to a benched green; bogey here never hurt anybody's Saturday.", tip: "Take an extra club on the approach and swing smooth.", tee: T(36.716281, -80.457734), green: T(36.719736, -80.456659), mids: [] },
  { n: 5, par: 4, hcp: 11, y: [395, 370, 300], name: "Meadow View", desc: "A pretty, open two-shotter across the upper meadow with the valley's best long view from the fairway crest.", tip: "The green releases hard — land it on the front third.", tee: T(36.719884, -80.456339), green: T(36.7217, -80.45298), mids: [] },
  { n: 6, par: 3, hcp: 15, y: [172, 160, 130], name: "The Dipper", desc: "A drop-shot par three to a bowl green ringed by sand; the wind swirls, the green forgives.", tip: "One less club than the number — the bowl gathers everything.", tee: T(36.721677, -80.452653), green: T(36.721407, -80.45092), mids: [] },
  { n: 7, par: 5, hcp: 1, y: [560, 525, 425], name: "Long Tom", desc: "The number-one handicap bends right and runs forever; pick your spots and take your par with pride.", tip: "The second shot decides the hole — leave a full wedge in.", tee: T(36.721228, -80.450653), green: T(36.717115, -80.448473), mids: [T(36.719232, -80.448844)] },
  { n: 8, par: 4, hcp: 7, y: [430, 405, 325], name: "Twin Oaks", desc: "Straightaway between the two namesake oaks to a deep green that holds anything struck with conviction.", tip: "The oaks frame forty yards of fairway — trust the driver.", tee: T(36.716797, -80.448579), green: T(36.713287, -80.449117), mids: [] },
  { n: 9, par: 4, hcp: 13, y: [381, 360, 290], name: "Clubhouse Turn", desc: "A short rise home past the range fence with the grill's lunch smoke as your aiming point.", tip: "Best birdie chance on the front — take dead aim.", tee: T(36.713287, -80.448747), green: T(36.716303, -80.447675), mids: [T(36.714905, -80.44798)] },
  { n: 10, par: 4, hcp: 10, y: [405, 380, 305], name: "The Lane", desc: "The back nine starts down a tree-lined lane that rewards a drawn tee ball with extra roll.", tip: "Start it over the right edge and let it turn back.", tee: T(36.716453, -80.446336), green: T(36.716917, -80.442221), mids: [] },
  { n: 11, par: 4, hcp: 18, y: [380, 355, 285], name: "Easy Street", desc: "Short, downhill, and friendly — the easiest hole on the card if you keep it out of the wildflowers.", tip: "A 220 club off the tee leaves a full wedge; that's the play.", tee: T(36.716769, -80.441902), green: T(36.714036, -80.440012), mids: [] },
  { n: 12, par: 3, hcp: 14, y: [196, 185, 150], name: "The Quarry", desc: "The prettiest shot at Cedar Hollow, across the corner of the old stone quarry to a wide, honest green.", tip: "There's more room left than your eye believes — use it.", tee: T(36.71376, -80.440072), green: T(36.712312, -80.440954), mids: [] },
  { n: 13, par: 5, hcp: 4, y: [535, 505, 405], name: "The Elbow", desc: "A genuine three-shot par five elbowing left through the pines; position over power, twice.", tip: "Short of the 100 post on the second — the creek hides beyond.", tee: T(36.712188, -80.44122), green: T(36.709807, -80.445704), mids: [T(36.711257, -80.443958)] },
  { n: 14, par: 4, hcp: 2, y: [460, 430, 345], name: "The Haul", desc: "Long, sidehill, and proud of it; the green is big and open in front because fair is fair.", tip: "Aim a flag-width uphill of every target and trust the slope.", tee: T(36.709864, -80.446108), green: T(36.71122, -80.450514), mids: [] },
  { n: 15, par: 4, hcp: 12, y: [390, 365, 295], name: "Springhouse", desc: "Past the farm's old springhouse to a punchbowl green that funnels everything to the middle.", tip: "Run a mid-iron in at the front-right slot and watch it feed.", tee: T(36.711476, -80.450698), green: T(36.714588, -80.451666), mids: [] },
  { n: 16, par: 3, hcp: 16, y: [225, 210, 170], name: "The Stretch", desc: "The longest of the one-shotters to the biggest green on the course — take your medicine club and swing easy.", tip: "A low runner beats a high ball here nine times out of ten.", tee: T(36.714842, -80.451581), green: T(36.716428, -80.450392), mids: [] },
  { n: 17, par: 5, hcp: 6, y: [521, 490, 395], name: "The Climb", desc: "Up the hill in two terraces, turning right at the crest; reachable downwind if your Saturday's going well.", tip: "Carry the false front or lay back to 90 — there's no between.", tee: T(36.716568, -80.45009), green: T(36.719613, -80.446588), mids: [T(36.718705, -80.448551)] },
  { n: 18, par: 4, hcp: 8, y: [396, 370, 300], name: "Last Call", desc: "Home past the centerline bunker with the clubhouse porch waiting — settle your bets on the green, not in the parking lot.", tip: "Right of the bunker is the percentage line; left is for pressers.", tee: T(36.719304, -80.446448), green: T(36.716051, -80.446332), mids: [T(36.717511, -80.446569)] },
];

const holes: Hole[] = SEEDS.map((s) => ({
  number: s.n,
  name: s.name,
  par: s.par,
  yardages: { blue: s.y[0], white: s.y[1], gold: s.y[2] },
  handicap: s.hcp,
  description: s.desc,
  proTip: s.tip,
  heroImage: {
    src: `/images/holes/hole-${String(s.n).padStart(2, "0")}.svg`,
    alt: `Illustrated plan of hole ${s.n}, ${s.name}, at Cedar Hollow Golf Course`,
  },
  tee: s.tee,
  green: s.green,
  midpoints: s.mids,
}));

const config: SiteConfig = {
  identity: {
    courseName: "Cedar Hollow Golf Course",
    shortName: "Cedar Hollow",
    tagline: "Everybody's home course",
    established: 1962,
    logo: { crest: "/images/crest.svg", monogram: "/images/monogram.svg" },
    brandColors: {
      background: "#11140f",
      backgroundRaised: "#1a2016",
      primary: "#3c5a33",
      accent: "#d3b06a",
      text: "#f3efe2",
      textDim: "#aca78f",
      line: "#3c4435",
    },
    fonts: { display: "Cormorant Garamond", body: "Jost" },
  },
  flags: {
    isResort: false,
    hasLodging: false,
    hasDining: false,
    hasWeddings: false,
    hasMembership: false,
    hasSpa: false,
    hasActivities: false,
    courseAccess: "public",
    numberOfCourses: 1,
  },
  location: {
    address: {
      line1: "400 Cedar Hollow Road",
      city: "Woolwine",
      region: "Virginia",
      postalCode: "24185",
      country: "US",
    },
    coords: { lat: 36.7165, lng: -80.447 },
    elevationFt: 1480,
    regionNarrative:
      "Cedar Hollow has been Patrick County's everyday golf course since 1962 — eighteen walkable holes in the foothills below the Blue Ridge, where the green fees are fair, the greens are better than they have any right to be, and the porch debates outlast the daylight.",
    directions: [
      {
        from: "Stuart, VA",
        text: "VA-8 North for 9 miles, left on Cedar Hollow Road at the white church. The course is one mile on the right.",
      },
      {
        from: "Floyd, VA",
        text: "VA-8 South over the mountain for 22 miles, right on Cedar Hollow Road. About 35 minutes.",
      },
    ],
  },
  booking: {
    teeTimeUrl: "https://example.com/tee-times/cedar-hollow",
    phone: "+1 (276) 555-0190",
    phoneHref: "tel:+12765550190",
    email: "proshop@cedar-hollow.example",
    bookingNote: "Tee times released 7 days out. Walk-ups welcome on weekdays.",
  },
  courses: [
    {
      slug: "cedar-hollow",
      name: "Cedar Hollow",
      designer: "Buck Whitlow, 1962",
      yearBuilt: 1962,
      par: 72,
      signatureHoleNumber: 12,
      heroImage: {
        src: "/images/scenes/ridge-course.svg",
        alt: "Fairways of Cedar Hollow rolling through the foothills at dusk",
      },
      description:
        "Buck Whitlow built Cedar Hollow in 1962 with a bulldozer he owned and a philosophy he didn't know he had: keep the greens true, keep the walks short, and let the land do the architecture. Sixty years on it remains the valley's honest game — a par 72 that anyone can play and nobody quite conquers.",
      designerStory:
        "Whitlow was the county's grading contractor, and Cedar Hollow was his only course. He routed it in an afternoon by walking his bird dogs across the property and following where they went. The members will tell you that's a legend; the members are wrong — the routing map in the grill room has paw prints on it.",
      teeBoxes: [
        { id: "blue", name: "Blue", color: "#3b6ea5" },
        { id: "white", name: "White", color: "#e8e6e0" },
        { id: "gold", name: "Gold", color: "#d3b06a" },
      ],
      ratings: [
        { teeId: "blue", rating: 73.1, slope: 132, yards: 7027 },
        { teeId: "white", rating: 71.0, slope: 126, yards: 6590 },
        { teeId: "gold", rating: 66.2, slope: 113, yards: 5310 },
      ],
      gallery: [
        { src: "/images/gallery/gallery-01.svg", alt: "Morning fog on the first fairway at Cedar Hollow" },
        { src: "/images/gallery/gallery-02.svg", alt: "Evening light across the seventh fairway" },
        { src: "/images/gallery/gallery-03.svg", alt: "The quarry par three, Cedar Hollow's twelfth" },
        { src: "/images/gallery/gallery-04.svg", alt: "The sixteenth green on its granite shoulder" },
      ],
      holes,
    },
  ],
  propertyMap: {
    center: { lat: 36.7158, lng: -80.4475 },
    zoom: 14.4,
    bearing: -17,
    pitch: 52,
    entry: {
      headline: "Cedar Hollow",
      subcopy: "Eighteen walkable holes in the Blue Ridge foothills — take the tour from above.",
      cta: "Explore the Course",
    },
    pins: [
      {
        id: "clubhouse",
        coords: { lat: 36.7165, lng: -80.447 },
        category: "golf",
        title: "Clubhouse & Grill",
        shortDesc: "Pro shop, the grill, and the porch where every round ends. Cheeseburgers until 8, stories until close.",
        image: { src: "/images/scenes/clubhouse.svg", alt: "The Cedar Hollow clubhouse and porch" },
        route: "/about",
      },
      {
        id: "first-tee",
        coords: { lat: 36.716209, lng: -80.447432 },
        category: "golf",
        title: "The First Tee",
        shortDesc: "Mill Run, 412 yards downhill to start your day. The starter's shed has pencils, tees, and opinions.",
        image: { src: "/images/holes/hole-01.svg", alt: "Illustrated plan of the first hole" },
        route: "/course/cedar-hollow/holes?hole=1",
      },
      {
        id: "quarry-tee",
        coords: { lat: 36.71376, lng: -80.440072 },
        category: "golf",
        title: "The Quarry — No. 12",
        shortDesc: "The prettiest shot on the property, across the old stone quarry. Bring one extra ball and zero doubt.",
        image: { src: "/images/holes/hole-12.svg", alt: "Illustrated plan of the twelfth hole over the quarry" },
        route: "/course/cedar-hollow/holes?hole=12",
      },
      {
        id: "range",
        coords: { lat: 36.7174, lng: -80.443915 },
        category: "practice",
        title: "The Range",
        shortDesc: "Grass tees, real targets, and a bucket that costs less than your coffee. Open dawn to dusk.",
        image: { src: "/images/scenes/range.svg", alt: "The grass practice range at Cedar Hollow" },
        route: "/rates",
      },
      {
        id: "putting-green",
        coords: { lat: 36.716191, lng: -80.44594 },
        category: "practice",
        title: "Putting Green",
        shortDesc: "Rolled every morning to course speed. The Tuesday night putting league is undefeated against visitors.",
        image: { src: "/images/scenes/putting-green.svg", alt: "The practice putting green beside the clubhouse" },
        route: "/rates",
      },
    ],
  },
  lodging: [],
  dining: [],
  activities: [],
  rates: {
    intro:
      "Cedar Hollow is daily-fee golf the way it ought to be: fair rates, fast greens, and nobody hurrying you off the porch afterward. Carts optional — the course walks easy.",
    tables: [
      {
        title: "Green Fees",
        note: "18 holes, walking. Add $18 per rider for a cart.",
        rows: [
          { season: "In Season", dates: "April 1 – October 31", weekday: 42, weekend: 56, twilight: 28 },
          { season: "Off Season", dates: "November 1 – March 31", weekday: 30, weekend: 38, twilight: 22 },
        ],
      },
      {
        title: "Nine-Hole & League",
        note: "Nine-hole rates available before 9 a.m. and after 4 p.m.",
        rows: [
          { season: "Nine Holes", dates: "Year-round, off-peak windows", weekday: 24, weekend: 30, twilight: 20 },
        ],
      },
    ],
    notes: [
      "Twilight begins at 3 p.m. (1:30 p.m. in the off season).",
      "Juniors 17 and under play free after 3 p.m. with a paying adult.",
      "Seniors take $8 off weekday rates.",
      "Annual passes available at the pro shop — ask for Dale.",
    ],
  },
  about: {
    historyHeadline: "Sixty-four years of honest golf",
    history: [
      "Buck Whitlow graded roads for Patrick County by trade, and in 1961 he took a winter's pay and a leased bulldozer to a hollow full of cedars his uncle couldn't farm. The course he scraped out opened the next summer with sand greens, a coffee can for green fees, and a sign that said simply GOLF. The greens went to grass in 1971; the sign is in the grill room.",
      "Cedar Hollow has never been exclusive about anything except its greens, which three generations of one family have kept absurdly good. It is where the county learns the game — juniors play free evenings, the high school teams call it home, and the Saturday dogfight has run uninterrupted since 1968, including, famously, the morning of the '93 blizzard.",
    ],
    accolades: [
      { kind: "ranking", source: "Virginia Golfer — Best Municipal & Daily-Fee Values", year: 2025 },
      { kind: "press", source: "The Fairway Review", year: 2023, quote: "The best $42 in Virginia golf." },
    ],
    gallery: [
      { src: "/images/gallery/gallery-01.svg", alt: "Morning fog on the first fairway", category: "Course" },
      { src: "/images/gallery/gallery-02.svg", alt: "Evening light on the seventh", category: "Course" },
      { src: "/images/gallery/gallery-03.svg", alt: "The quarry twelfth", category: "Course" },
      { src: "/images/gallery/gallery-04.svg", alt: "The sixteenth green", category: "Course" },
      { src: "/images/gallery/gallery-11.svg", alt: "The clubhouse porch at dusk", category: "Clubhouse" },
      { src: "/images/gallery/gallery-10.svg", alt: "Cheeseburger and sweet tea at the grill", category: "Clubhouse" },
    ],
    staff: [
      {
        name: "Dale Whitlow",
        role: "Head Professional & General Manager",
        bio: "Buck's grandson. Sets the pins, runs the dogfight, and will fix your slice for the price of listening to one story about the '93 blizzard round.",
        image: { src: "/images/staff/staff-02.svg", alt: "Crest portrait mark for Dale Whitlow" },
      },
      {
        name: "June Hairston",
        role: "Superintendent",
        bio: "Third generation on these greens. June's bentgrass is the pride of the county and she knows it; do not drive your cart within fifty feet of a collar.",
        image: { src: "/images/staff/staff-03.svg", alt: "Crest portrait mark for June Hairston" },
      },
    ],
  },
  announcement: {
    enabled: false,
    text: "",
  },
  seo: {
    siteUrl: "https://cedar-hollow.example",
    description:
      "Cedar Hollow Golf Course — eighteen walkable, affordable holes of daily-fee golf in the Blue Ridge foothills of Patrick County, Virginia, since 1962.",
    keywords: ["daily fee golf Virginia", "public golf Blue Ridge", "Cedar Hollow Golf Course"],
  },
};

export default config;
