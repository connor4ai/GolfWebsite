import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SmartImage } from "@/components/media/SmartImage";
import { site, getCourseBySlug, bookingCta } from "@/lib/site";
import { Scorecard } from "@/components/course/Scorecard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function generateStaticParams() {
  return site.courses.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const course = getCourseBySlug(params.slug);
  if (!course) return {};
  return {
    title: course.name,
    description: course.description.slice(0, 200),
  };
}

export default function CoursePage({ params }: { params: { slug: string } }) {
  const course = getCourseBySlug(params.slug);
  if (!course) notFound();
  const signature = course.holes.find(
    (h) => h.number === course.signatureHoleNumber
  );
  const tips = course.ratings[0];
  const cta = bookingCta();

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[78dvh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <SmartImage asset={course.heroImage} priority sizes="100vw" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-night/60 via-night/25 to-night" />
        <div className="relative mx-auto w-full max-w-[100rem] px-6 pb-20 pt-44 md:px-10">
          <Reveal>
            <p className="eyebrow">{course.designer}</p>
            <h1 className="display-1 mt-5">{course.name}</h1>
            <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
              {[
                ["Par", String(course.par)],
                ["Holes", String(course.holes.length)],
                ...(tips
                  ? [
                      ["Yards", tips.yards.toLocaleString()],
                      ["Rating / Slope", `${tips.rating} / ${tips.slope}`],
                    ]
                  : [["Opened", String(course.yearBuilt)]]),
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[0.625rem] uppercase tracking-luxe text-mist">{label}</p>
                  <p className="mt-1 font-display text-3xl text-cream">{value}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Narrative */}
      <section className="mx-auto max-w-editorial px-6 py-24 md:px-10 md:py-32">
        <div className="grid gap-16 md:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <p className="eyebrow">The course</p>
            <p className="mt-6 font-display text-2xl leading-relaxed text-cream/95 md:text-[1.7rem]">
              {course.description.split(". ").slice(0, 2).join(". ")}.
            </p>
            <p className="mt-6 font-body text-base leading-loose text-mist">
              {course.description.split(". ").slice(2).join(". ")}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href={`/course/${course.slug}/holes`} className="btn-primary">
                Fly the course in 3D
              </Link>
              {cta.external ? (
                <a href={cta.href} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  {cta.label}
                </a>
              ) : (
                <Link href={cta.href} className="btn-ghost">
                  {cta.label}
                </Link>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="border hairline bg-raised/50 p-8">
              <p className="eyebrow">The architect</p>
              <p className="mt-5 font-body text-sm leading-loose text-mist">
                {course.designerStory}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Signature hole */}
      {signature && (
        <section className="border-y hairline bg-raised/30">
          <div className="mx-auto grid max-w-[100rem] items-center gap-10 px-6 py-20 md:grid-cols-2 md:px-10">
            <Reveal className="relative aspect-[4/3] overflow-hidden border hairline">
              <SmartImage
                asset={signature.heroImage}
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <p className="eyebrow">Signature hole</p>
              <h2 className="display-2 mt-5">
                No. {signature.number}
                {signature.name ? ` — ${signature.name}` : ""}
              </h2>
              <p className="mt-3 font-display text-lg text-brass">
                Par {signature.par} · {Object.values(signature.yardages)[0]} yards
              </p>
              <p className="mt-6 max-w-xl font-body text-base leading-loose text-mist">
                {signature.description}
              </p>
              <Link
                href={`/course/${course.slug}/holes?hole=${signature.number}`}
                className="btn-primary mt-8"
              >
                Fly this hole
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* Scorecard */}
      <section className="mx-auto max-w-[100rem] px-6 py-24 md:px-10">
        <SectionHeading
          eyebrow="The numbers"
          title="Pick your fight"
          lede={`${course.teeBoxes.length} sets of tees and not one easy way around. Play the markers that tell the truth about your game.`}
        />
        <Reveal className="mt-12">
          <Scorecard course={course} />
        </Reveal>
      </section>

      {/* Gallery strip */}
      {course.gallery.length > 0 && (
        <section className="mx-auto max-w-[100rem] px-6 pb-28 md:px-10">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {course.gallery.slice(0, 6).map((img, i) => (
              <Reveal key={img.alt} delay={i * 0.05}>
                <div className="relative aspect-[4/3] overflow-hidden border hairline">
                  <SmartImage
                    asset={img}
                    sizes="(min-width: 768px) 33vw, 50vw"
                    imgClassName="object-cover transition-transform duration-700 ease-luxe hover:scale-[1.05]"
                  />
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 text-center">
            <Link href="/gallery" className="btn-ghost">
              See the full gallery
            </Link>
          </Reveal>
        </section>
      )}
    </>
  );
}
