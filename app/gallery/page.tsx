import type { Metadata } from "next";
import { site } from "@/lib/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery",
  description: `Scenes from ${site.identity.courseName} — the course, the lodge, and the land.`,
};

export default function GalleryPage() {
  return (
    <section className="mx-auto max-w-[100rem] px-6 pb-28 pt-44 md:px-10">
      <SectionHeading
        eyebrow="The gallery"
        title="Scenes from the ridge"
        lede="The course, the rooms, the tables, and the weather that makes all three worth photographing."
      />
      <div className="mt-12">
        <GalleryGrid />
      </div>
    </section>
  );
}
