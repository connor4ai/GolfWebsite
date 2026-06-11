import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface Card {
  title: string;
  copy: string;
  href: string;
  image: { src: string; alt: string };
}

/** Resort amenities, assembled purely from feature flags. */
export function AmenitiesGrid() {
  const cards: Card[] = [];
  if (site.flags.hasLodging && site.lodging[0]) {
    cards.push({
      title: "Stay",
      copy: site.lodging[0].summary,
      href: "/stay",
      image: site.lodging[0].image,
    });
  }
  if (site.flags.hasDining && site.dining[0]) {
    cards.push({
      title: "Dine",
      copy: site.dining[0].summary,
      href: "/dine",
      image: site.dining[0].image,
    });
  }
  if (site.flags.hasSpa && site.spa) {
    cards.push({
      title: "The Spa",
      copy: site.spa.summary,
      href: "/stay#spa",
      image: site.spa.image,
    });
  }
  if (site.flags.hasWeddings && site.weddings) {
    cards.push({
      title: "Weddings & Events",
      copy: site.weddings.summary,
      href: "/events-weddings",
      image: site.weddings.image,
    });
  }
  if (site.flags.hasActivities && site.activities[0]) {
    cards.push({
      title: "On the Land",
      copy: site.activities[0].summary,
      href: "/stay#activities",
      image: site.activities[0].image,
    });
  }
  if (cards.length === 0) return null;

  return (
    <section className="mx-auto max-w-[100rem] px-6 py-28 md:px-10 md:py-36">
      <SectionHeading
        eyebrow="Beyond the course"
        title="A property, not just a tee sheet"
      />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <Reveal key={card.href + card.title} delay={i * 0.07}>
            <Link
              href={card.href}
              className="group relative block aspect-[5/6] overflow-hidden border hairline"
            >
              <Image
                src={card.image.src}
                alt={card.image.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night/95 via-night/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <h3 className="font-display text-3xl text-cream">{card.title}</h3>
                <p className="mt-2 line-clamp-2 font-body text-sm leading-relaxed text-mist">
                  {card.copy}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-luxe text-brass opacity-0 transition-all duration-500 group-hover:opacity-100">
                  Discover <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
