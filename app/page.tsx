import { Hero } from "@/components/home/Hero";
import { NumbersStrip } from "@/components/home/NumbersStrip";
import { Manifesto } from "@/components/home/Manifesto";
import { CoursesShowcase } from "@/components/home/CoursesShowcase";
import { CreekRun } from "@/components/home/CreekRun";
import { AmenitiesGrid } from "@/components/home/AmenitiesGrid";
import { ExploreTeaser } from "@/components/home/ExploreTeaser";
import { AccoladeMarquee } from "@/components/home/AccoladeMarquee";
import { GalleryPreview } from "@/components/home/GalleryPreview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AccoladeMarquee />
      <Manifesto />
      <NumbersStrip />
      <CoursesShowcase />
      <CreekRun />
      <ExploreTeaser />
      <AmenitiesGrid />
      <GalleryPreview />
    </>
  );
}
