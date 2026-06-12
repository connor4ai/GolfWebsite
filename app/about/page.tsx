import type { Metadata } from "next";
import { SmartImage } from "@/components/media/SmartImage";
import { site } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "About",
  description: `The story of ${site.identity.courseName} — history, people, and the land.`,
};

export default function AboutPage() {
  const { about, identity, location } = site;

  return (
    <>
      <section className="mx-auto max-w-editorial px-6 pb-16 pt-44 md:px-10">
        <SectionHeading
          eyebrow={identity.established ? `Since ${identity.established}` : "Our story"}
          title={about.historyHeadline}
        />
      </section>

      {/* History */}
      <section className="mx-auto max-w-editorial px-6 md:px-10">
        <div className="space-y-8 border-l-2 border-brass/40 pl-7 md:pl-10">
          {about.history.map((para, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <p className="max-w-3xl font-body text-base leading-loose text-mist md:text-lg">
                {para}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Accolades */}
      {about.accolades.length > 0 && (
        <section className="mx-auto max-w-editorial px-6 py-24 md:px-10">
          <Reveal>
            <p className="eyebrow">Recognition</p>
          </Reveal>
          <div className="mt-8 divide-y divide-line/50 border-y hairline">
            {about.accolades.map((a, i) => (
              <Reveal key={`${a.source}-${a.year}`} delay={i * 0.05}>
                <div className="flex flex-wrap items-baseline justify-between gap-3 py-5">
                  <div className="max-w-2xl">
                    <p className="font-display text-xl text-cream">{a.source}</p>
                    {a.quote && (
                      <p className="mt-2 font-display italic text-mist">“{a.quote}”</p>
                    )}
                  </div>
                  <p className="text-[0.625rem] uppercase tracking-luxe text-brass">
                    {a.kind} · {a.year}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Staff */}
      {about.staff.length > 0 && (
        <section className="border-y hairline bg-raised/30">
          <div className="mx-auto max-w-[100rem] px-6 py-24 md:px-10">
            <SectionHeading eyebrow="The people" title="Kept by hands that care" />
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {about.staff.map((person, i) => (
                <Reveal key={person.name} delay={i * 0.06}>
                  <article className="flex h-full flex-col border hairline bg-night">
                    <div className="relative aspect-square overflow-hidden">
                      <SmartImage
                        asset={person.image}
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-display text-xl text-cream">{person.name}</h3>
                      <p className="mt-1 text-[0.625rem] uppercase tracking-luxe text-brass">
                        {person.role}
                      </p>
                      <p className="mt-3 font-body text-sm leading-relaxed text-mist">
                        {person.bio}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Getting here */}
      <section className="mx-auto max-w-editorial px-6 py-24 md:px-10">
        <SectionHeading eyebrow="Getting here" title="Worth the drive up" />
        <Reveal className="mt-8">
          <p className="max-w-3xl font-body text-base leading-loose text-mist">
            {location.regionNarrative}
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {location.directions.map((d, i) => (
            <Reveal key={d.from} delay={i * 0.07}>
              <div className="h-full border hairline bg-raised/40 p-7">
                <p className="eyebrow">From {d.from}</p>
                <p className="mt-4 font-body text-sm leading-relaxed text-mist">{d.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
