import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Weddings & Events",
  description: site.weddings?.summary,
};

export default function EventsWeddingsPage() {
  if (!site.flags.hasWeddings || !site.weddings) notFound();
  const w = site.weddings;

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[78dvh] items-end overflow-hidden">
        <Image
          src={w.image.src}
          alt={w.image.alt}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night/55 via-night/25 to-night" />
        <div className="relative mx-auto w-full max-w-[100rem] px-6 pb-20 pt-44 md:px-10">
          <Reveal>
            <p className="eyebrow">Weddings & private events</p>
            <h1 className="display-1 mt-5 max-w-3xl">{w.headline}</h1>
            <p className="lede mt-6 max-w-2xl">{w.summary}</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-editorial px-6 py-24 md:px-10">
        <Reveal>
          <p className="font-body text-base leading-loose text-mist md:text-lg">
            {w.description}
          </p>
        </Reveal>
      </section>

      {/* Venues */}
      <section className="border-t hairline bg-raised/30">
        <div className="mx-auto max-w-[100rem] px-6 py-24 md:px-10">
          <SectionHeading eyebrow="The settings" title="Three places to say it" />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {w.venues.map((venue, i) => (
              <Reveal key={venue.name} delay={i * 0.08}>
                <article className="group flex h-full flex-col border hairline bg-night">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={venue.image.src}
                      alt={venue.image.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-transparent to-transparent" />
                    <p className="absolute bottom-5 left-6 text-[0.625rem] uppercase tracking-luxe text-brass">
                      Up to {venue.capacity} guests
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <h3 className="font-display text-2xl text-cream">{venue.name}</h3>
                    <p className="mt-3 font-body text-sm leading-relaxed text-mist">
                      {venue.setting}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mx-auto mt-16 max-w-2xl text-center">
            <p className="font-display text-xl italic text-mist">
              One wedding at a time, never two. Dates for next season open each
              October.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact?topic=weddings" className="btn-primary">
                Start the conversation
              </Link>
              <a href={site.booking.phoneHref} className="btn-ghost">
                {site.booking.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
