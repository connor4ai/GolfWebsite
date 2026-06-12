import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function GalleryPreview() {
  const images = site.about.gallery.slice(0, 4);
  if (images.length === 0) return null;
  return (
    <section className="mx-auto max-w-[100rem] px-6 py-28 md:px-10 md:py-36">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow="The light up here" title="From the gallery" />
        <Reveal delay={0.1}>
          <Link href="/gallery" className="btn-ghost">
            View the gallery
          </Link>
        </Reveal>
      </div>
      <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {images.map((img, i) => (
          <Reveal key={img.src} delay={i * 0.07} className={i % 2 === 1 ? "md:mt-12" : ""}>
            <Link
              href="/gallery"
              className="group relative block aspect-[3/4] overflow-hidden border hairline"
              aria-label={`Open gallery — ${img.alt}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-night/0 transition-colors duration-500 group-hover:bg-night/20" />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
