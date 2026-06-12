import { Hero } from "@/components/home/Hero";
import { IntroNarrative } from "@/components/home/IntroNarrative";
import { ExploreTeaser } from "@/components/home/ExploreTeaser";
import { FeaturedHoles } from "@/components/home/FeaturedHoles";
import { AmenitiesGrid } from "@/components/home/AmenitiesGrid";
import { Accolades } from "@/components/home/Accolades";
import { GalleryPreview } from "@/components/home/GalleryPreview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <IntroNarrative />
      <ExploreTeaser />
      <FeaturedHoles />
      <AmenitiesGrid />
      <Accolades />
      <GalleryPreview />
    </>
  );
}
