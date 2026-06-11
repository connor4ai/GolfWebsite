import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { site, formatUSD } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Stay",
  description: site.flags.hasLodging
    ? `Lodging at ${site.identity.courseName}: ${site.lodging.map((l) => l.name).join(", ")}.`
    : undefined,
};

export default function StayPage() {
  if (!site.flags.hasLodging || site.lodging.length === 0) notFound();
  const spa = site.flags.hasSpa ? site.spa : undefined;
  const activities = site.flags.hasActivities ? site.activities : [];

  return (
    <>
      <section className="mx-auto max-w-editorial px-6 pb-10 pt-44 md:px-10">
        <SectionHeading
          eyebrow="Stay the night"
          title="Rooms with a ridgeline"
          lede="Fall asleep to wind in the trees and wake up thirty steps from the first tee."
        />
      </section>

      {/* Lodging — alternating editorial rows */}
      <section className="mx-auto max-w-[100rem] space-y-20 px-6 py-16 md:px-10">
        {site.lodging.map((lodge, i) => (
          <Reveal key={lodge.id}>
            <article
              className={`grid items-center gap-10 md:grid-cols-2 ${
                i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden border hairline">
                <Image
                  src={lodge.image.src}
                  alt={lodge.image.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-luxe hover:scale-[1.04]"
                />
              </div>
              <div className="max-w-xl">
                <p className="eyebrow">
                  Sleeps {lodge.sleeps} · From {formatUSD(lodge.priceFrom)} / night
                </p>
                <h2 className="display-2 mt-4">{lodge.name}</h2>
                <p className="mt-5 font-body text-base leading-loose text-mist">
                  {lodge.description}
                </p>
                <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
                  {lodge.details.map((d) => (
                    <li key={d} className="flex gap-3 font-body text-sm leading-relaxed text-mist">
                      <span className="mt-0.5 text-brass" aria-hidden>
                        —
                      </span>
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-4">
                  <a href={site.booking.phoneHref} className="btn-primary">
                    Reserve · {site.booking.phone}
                  </a>
                  <a href={`mailto:${site.booking.email}`} className="btn-ghost">
                    Email reservations
                  </a>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </section>

      {/* Spa */}
      {spa && (
        <section id="spa" className="scroll-mt-24 border-y hairline bg-raised/30">
          <div className="mx-auto grid max-w-[100rem] items-center gap-12 px-6 py-24 md:grid-cols-2 md:px-10">
            <Reveal className="relative aspect-[4/3] overflow-hidden border hairline">
              <Image
                src={spa.image.src}
                alt={spa.image.alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <p className="eyebrow">Wellness</p>
              <h2 className="display-2 mt-4">{spa.name}</h2>
              <p className="mt-5 max-w-xl font-body text-base leading-loose text-mist">
                {spa.description}
              </p>
              <ul className="mt-8 divide-y divide-line/50 border-y hairline">
                {spa.treatments.map((t) => (
                  <li key={t.name} className="flex items-baseline justify-between gap-4 py-3.5">
                    <span className="font-display text-lg text-cream">{t.name}</span>
                    <span className="flex items-baseline gap-4 whitespace-nowrap">
                      <span className="text-xs text-mist">{t.duration}</span>
                      <span className="font-display text-lg text-brass tabular-nums">
                        {formatUSD(t.price)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      )}

      {/* Activities */}
      {activities.length > 0 && (
        <section id="activities" className="scroll-mt-24 mx-auto max-w-[100rem] px-6 py-24 md:px-10">
          <SectionHeading
            eyebrow="On the land"
            title="The other three thousand acres"
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {activities.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.06}>
                <article className="group flex h-full flex-col border hairline bg-raised/40">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={a.image.src}
                      alt={a.image.alt}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-xl text-cream">{a.name}</h3>
                    {a.season && (
                      <p className="mt-1 text-[0.625rem] uppercase tracking-luxe text-brass">
                        {a.season}
                      </p>
                    )}
                    <p className="mt-3 font-body text-sm leading-relaxed text-mist">
                      {a.summary}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
