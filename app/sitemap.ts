import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.seo.siteUrl;
  const routes: string[] = ["", "/explore", "/rates", "/about", "/gallery", "/contact"];
  for (const c of site.courses) {
    routes.push(`/course/${c.slug}`, `/course/${c.slug}/holes`);
  }
  if (site.flags.hasLodging) routes.push("/stay");
  if (site.flags.hasDining) routes.push("/dine");
  if (site.flags.hasWeddings) routes.push("/events-weddings");

  return routes.map((r) => ({
    url: `${base}${r}`,
    changeFrequency: r === "" ? "weekly" : "monthly",
    priority: r === "" ? 1 : r === "/explore" ? 0.9 : 0.7,
  }));
}
