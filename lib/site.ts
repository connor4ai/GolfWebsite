import config from "@/config/course.config";
import type { CourseInfo, PinCategory } from "@/config/types";

export const site = config;

export function getCourseBySlug(slug: string): CourseInfo | undefined {
  return site.courses.find((c) => c.slug === slug);
}

export function defaultCourse(): CourseInfo {
  return site.courses[0];
}

/** Primary navigation, assembled from feature flags. */
export interface NavItem {
  label: string;
  href: string;
}

export function navItems(): NavItem[] {
  const items: NavItem[] = [{ label: "Explore", href: "/explore" }];
  if (site.courses.length === 1) {
    items.push({ label: "The Course", href: `/course/${site.courses[0].slug}` });
  } else {
    for (const c of site.courses) items.push({ label: c.name, href: `/course/${c.slug}` });
  }
  items.push({ label: "Rates", href: "/rates" });
  if (site.flags.hasLodging) items.push({ label: "Stay", href: "/stay" });
  if (site.flags.hasDining) items.push({ label: "Dine", href: "/dine" });
  if (site.flags.hasWeddings) items.push({ label: "Events", href: "/events-weddings" });
  items.push({ label: "About", href: "/about" });
  items.push({ label: "Gallery", href: "/gallery" });
  items.push({ label: "Contact", href: "/contact" });
  return items;
}

/** Explore-map filter chips, grouping pin categories. */
export interface ChipDef {
  id: string;
  label: string;
  categories: PinCategory[];
}

export function filterChips(): ChipDef[] {
  const cats = new Set(site.propertyMap.pins.map((p) => p.category));
  const chips: ChipDef[] = [];
  if (cats.has("golf") || cats.has("practice"))
    chips.push({ id: "golf", label: "Golf", categories: ["golf", "practice"] });
  if (cats.has("dining")) chips.push({ id: "dining", label: "Dining", categories: ["dining"] });
  if (cats.has("lodging")) chips.push({ id: "stay", label: "Stay", categories: ["lodging"] });
  if (cats.has("amenity") || cats.has("activity"))
    chips.push({ id: "amenities", label: "Amenities", categories: ["amenity", "activity"] });
  return chips;
}

export const CATEGORY_LABEL: Record<PinCategory, string> = {
  golf: "Golf",
  practice: "Practice",
  dining: "Dining",
  lodging: "Stay",
  amenity: "Amenity",
  activity: "Activity",
};

/** "#rrggbb" → "r g b" channel triple for CSS variables. */
function channels(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** Brand palette as CSS custom properties, injected on <html>. */
export function themeVars(): Record<string, string> {
  const c = site.identity.brandColors;
  return {
    "--c-bg": channels(c.background),
    "--c-bg-raised": channels(c.backgroundRaised),
    "--c-primary": channels(c.primary),
    "--c-accent": channels(c.accent),
    "--c-text": channels(c.text),
    "--c-text-dim": channels(c.textDim),
    "--c-line": channels(c.line),
  };
}

export function formatUSD(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function courseTotalPar(course: CourseInfo): number {
  return course.holes.reduce((s, h) => s + h.par, 0);
}

export function yardageTotal(course: CourseInfo, teeId: string): number {
  return course.holes.reduce((s, h) => s + (h.yardages[teeId] ?? 0), 0);
}
