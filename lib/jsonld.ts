import { site } from "@/lib/site";

/**
 * Structured data: GolfCourse (+ Resort when flagged) per schema.org.
 * Rendered once in the root layout.
 */
export function buildJsonLd(): object[] {
  const { identity, location, booking, seo, flags, courses } = site;
  const address = {
    "@type": "PostalAddress",
    streetAddress: location.address.line1,
    addressLocality: location.address.city,
    addressRegion: location.address.region,
    postalCode: location.address.postalCode,
    addressCountry: location.address.country,
  };
  const geo = {
    "@type": "GeoCoordinates",
    latitude: location.coords.lat,
    longitude: location.coords.lng,
  };

  const golfCourse = {
    "@context": "https://schema.org",
    "@type": "GolfCourse",
    name: identity.courseName,
    description: seo.description,
    url: seo.siteUrl,
    telephone: booking.phone,
    email: booking.email,
    address,
    geo,
    slogan: identity.tagline,
    ...(identity.established ? { foundingDate: String(identity.established) } : {}),
    isAccessibleForFree: false,
    publicAccess: flags.courseAccess !== "private",
    amenityFeature: courses.map((c) => ({
      "@type": "LocationFeatureSpecification",
      name: c.name,
      value: `${c.holes.length} holes, par ${c.par}, ${c.ratings[0]?.yards ?? ""} yards`,
    })),
  };

  const out: object[] = [golfCourse];

  if (site.flags.isResort) {
    out.push({
      "@context": "https://schema.org",
      "@type": "Resort",
      name: identity.courseName,
      description: seo.description,
      url: seo.siteUrl,
      telephone: booking.phone,
      email: booking.email,
      address,
      geo,
      ...(site.lodging.length
        ? {
            containsPlace: site.lodging.map((l) => ({
              "@type": "LodgingBusiness",
              name: l.name,
              description: l.summary,
            })),
          }
        : {}),
    });
  } else {
    out.push({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: identity.courseName,
      description: seo.description,
      url: seo.siteUrl,
      telephone: booking.phone,
      email: booking.email,
      address,
      geo,
    });
  }

  return out;
}
