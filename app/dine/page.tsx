import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SmartImage } from "@/components/media/SmartImage";
import { site } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Dine",
  description: site.flags.hasDining
    ? `Dining at ${site.identity.courseName}: ${site.dining.map((d) => d.name).join(", ")}.`
    : undefined,
};

export default function DinePage() {
  if (!site.flags.hasDining || site.dining.length === 0) notFound();

  return (
    <>
      <section className="mx-auto max-w-editorial px-6 pb-10 pt-44 md:px-10">
        <SectionHeading
          eyebrow="The table"
          title="Cooked over fire, poured with a view"
          lede="Every kitchen on the property buys from the valley below it — and the best seat in each room faces west."
        />
      </section>

      <section className="mx-auto max-w-[100rem] space-y-20 px-6 py-16 md:px-10">
        {site.dining.map((venue, i) => (
          <Reveal key={venue.id}>
            <article
              className={`grid items-center gap-10 md:grid-cols-2 ${
                i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden border hairline">
                <SmartImage
                  asset={venue.image}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  imgClassName="object-cover transition-transform duration-700 ease-luxe hover:scale-[1.04]"
                />
              </div>
              <div className="max-w-xl">
                <p className="eyebrow">{venue.style}</p>
                <h2 className="display-2 mt-4">{venue.name}</h2>
                <p className="mt-5 font-body text-base leading-loose text-mist">
                  {venue.description}
                </p>
                <dl className="mt-7 space-y-2 border-l-2 border-brass/50 pl-5">
                  <div className="flex gap-3 text-sm">
                    <dt className="w-20 flex-shrink-0 uppercase tracking-wide2 text-[0.625rem] leading-6 text-mist">
                      Hours
                    </dt>
                    <dd className="text-cream/85">{venue.hours}</dd>
                  </div>
                  {venue.dressCode && (
                    <div className="flex gap-3 text-sm">
                      <dt className="w-20 flex-shrink-0 uppercase tracking-wide2 text-[0.625rem] leading-6 text-mist">
                        Dress
                      </dt>
                      <dd className="text-cream/85">{venue.dressCode}</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-8 flex flex-wrap gap-4">
                  <a href={site.booking.phoneHref} className="btn-primary">
                    Reserve a table
                  </a>
                  {site.booking.email && (
                    <a href={`mailto:${site.booking.email}`} className="btn-ghost">
                      Private dining inquiry
                    </a>
                  )}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </section>
    </>
  );
}
