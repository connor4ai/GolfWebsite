import type { Metadata } from "next";
import { ExploreExperience } from "@/components/explore/ExploreExperience";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Explore the Property",
  description: `An interactive aerial tour of ${site.identity.courseName} — ${site.propertyMap.entry.subcopy}`,
};

export default function ExplorePage() {
  return <ExploreExperience />;
}
