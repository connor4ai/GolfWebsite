/**
 * FAIRWAY — typed configuration schema.
 *
 * Everything a client site needs lives in one SiteConfig object. The site
 * structure never changes per client; onboarding a new course means
 * producing a new file that satisfies this schema (see /docs/REPOPULATE.md).
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface ImageAsset {
  /** Path under /public, e.g. "/images/holes/hole-01.svg" */
  src: string;
  /** Descriptive alt text — used verbatim for accessibility. */
  alt: string;
}

/** Hex colors; converted to CSS variables at render time. */
export interface BrandColors {
  /** Deep page background (near-black). */
  background: string;
  /** Raised surfaces: cards, panels, nav when solid. */
  backgroundRaised: string;
  /** Primary brand hue (e.g. deep pine green). Used for tints and fills. */
  primary: string;
  /** Accent metal (brass / gold / copper). CTAs, eyebrows, pins. */
  accent: string;
  /** Primary body text on dark. */
  text: string;
  /** Secondary / muted text. Must keep AA contrast on `background`. */
  textDim: string;
  /** Hairline borders & dividers. */
  line: string;
}

export interface Identity {
  courseName: string;
  /** Short form used in the nav wordmark, e.g. "Highmark Ridge". */
  shortName: string;
  tagline: string;
  established?: number;
  logo: {
    /** Full crest, square-ish SVG. */
    crest: string;
    /** Compact monogram for nav / favicon contexts. */
    monogram: string;
  };
  brandColors: BrandColors;
  /**
   * Documentation of the type pairing. The actual font files are wired in
   * app/fonts.ts; swap files there when a client licenses different type.
   */
  fonts: {
    display: string;
    body: string;
  };
}

export type CourseAccess = "public" | "semiPrivate" | "private";

export interface Flags {
  isResort: boolean;
  hasLodging: boolean;
  hasDining: boolean;
  hasWeddings: boolean;
  hasMembership: boolean;
  hasSpa: boolean;
  hasActivities: boolean;
  courseAccess: CourseAccess;
  numberOfCourses: number;
}

export interface LocationInfo {
  address: {
    line1: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  coords: LatLng;
  /** Elevation of the clubhouse, feet. */
  elevationFt?: number;
  /** Editorial copy describing the setting / region. */
  regionNarrative: string;
  directions: { from: string; text: string }[];
}

export interface BookingInfo {
  /** External tee-sheet URL. Opens in a new tab. */
  teeTimeUrl: string;
  phone: string;
  /** tel: href, digits only after scheme. */
  phoneHref: string;
  email: string;
  bookingNote?: string;
}

export interface TeeBox {
  id: string;
  name: string;
  /** CSS color for the tee marker dot in scorecards. */
  color: string;
}

export interface TeeRating {
  teeId: string;
  rating: number;
  slope: number;
  yards: number;
}

export interface Hole {
  number: number;
  /** Optional editorial hole name, e.g. "The Hollow". */
  name?: string;
  par: number;
  /** Yardage keyed by TeeBox id. */
  yardages: Record<string, number>;
  /** Stroke index 1–18. */
  handicap: number;
  description: string;
  proTip: string;
  heroImage: ImageAsset;
  tee: LatLng;
  green: LatLng;
  /** Dogleg waypoints between tee and green (may be empty). */
  midpoints: LatLng[];
  /**
   * When present, the hole page renders this video instead of the 3D
   * flyover. Accepts an MP4/WebM URL or a local /public path.
   */
  videoUrl?: string;
}

export interface CourseInfo {
  slug: string;
  name: string;
  designer: string;
  designerStory: string;
  yearBuilt: number;
  par: number;
  description: string;
  signatureHoleNumber: number;
  heroImage: ImageAsset;
  teeBoxes: TeeBox[];
  ratings: TeeRating[];
  holes: Hole[];
  gallery: ImageAsset[];
}

export type PinCategory =
  | "golf"
  | "dining"
  | "lodging"
  | "amenity"
  | "activity"
  | "practice";

export interface MapPin {
  id: string;
  coords: LatLng;
  category: PinCategory;
  title: string;
  shortDesc: string;
  image: ImageAsset;
  /** Internal route the panel's CTA navigates to. */
  route?: string;
}

export interface PropertyMapConfig {
  center: LatLng;
  zoom: number;
  bearing: number;
  pitch: number;
  pins: MapPin[];
  /** Copy for the cinematic entry overlay on /explore. */
  entry: {
    headline: string;
    subcopy: string;
    cta: string;
  };
}

export interface LodgingOption {
  id: string;
  name: string;
  summary: string;
  description: string;
  image: ImageAsset;
  sleeps: number;
  priceFrom: number;
  details: string[];
}

export interface DiningVenue {
  id: string;
  name: string;
  style: string;
  hours: string;
  summary: string;
  description: string;
  image: ImageAsset;
  dressCode?: string;
}

export interface Activity {
  id: string;
  name: string;
  summary: string;
  image: ImageAsset;
  season?: string;
}

export interface SpaInfo {
  name: string;
  summary: string;
  description: string;
  image: ImageAsset;
  treatments: { name: string; duration: string; price: number }[];
}

export interface WeddingVenue {
  name: string;
  capacity: number;
  setting: string;
  image: ImageAsset;
}

export interface WeddingsInfo {
  headline: string;
  summary: string;
  description: string;
  image: ImageAsset;
  venues: WeddingVenue[];
}

export interface SeasonalRateRow {
  season: string;
  dates: string;
  weekday: number;
  weekend: number;
  twilight: number;
  includes?: string;
}

export interface RateTable {
  title: string;
  note?: string;
  rows: SeasonalRateRow[];
}

export interface MembershipTier {
  name: string;
  initiation: number;
  duesMonthly: number;
  blurb: string;
  perks: string[];
}

export interface RatesConfig {
  intro: string;
  tables: RateTable[];
  notes: string[];
  membership?: {
    headline: string;
    intro: string;
    tiers: MembershipTier[];
    contactNote: string;
  };
}

export interface StaffMember {
  name: string;
  role: string;
  bio: string;
  image: ImageAsset;
}

export interface Accolade {
  kind: "award" | "ranking" | "press";
  source: string;
  year: number;
  quote?: string;
}

export interface GalleryImage extends ImageAsset {
  /** Filter category on /gallery, e.g. "Course", "Lodge", "Dining". */
  category: string;
}

export interface AboutConfig {
  historyHeadline: string;
  /** Paragraphs. */
  history: string[];
  accolades: Accolade[];
  gallery: GalleryImage[];
  staff: StaffMember[];
}

export interface AnnouncementConfig {
  enabled: boolean;
  text: string;
  href?: string;
  linkLabel?: string;
}

export interface SeoConfig {
  /** Canonical production origin, no trailing slash. */
  siteUrl: string;
  description: string;
  keywords: string[];
}

export interface SiteConfig {
  identity: Identity;
  flags: Flags;
  location: LocationInfo;
  booking: BookingInfo;
  courses: CourseInfo[];
  propertyMap: PropertyMapConfig;
  lodging: LodgingOption[];
  dining: DiningVenue[];
  activities: Activity[];
  spa?: SpaInfo;
  weddings?: WeddingsInfo;
  rates: RatesConfig;
  about: AboutConfig;
  announcement: AnnouncementConfig;
  seo: SeoConfig;
}
