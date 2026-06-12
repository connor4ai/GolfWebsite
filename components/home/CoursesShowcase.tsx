import Link from "next/link";
import { site } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmartImage } from "@/components/media/SmartImage";

/** The golf itself: one editorial card per course. */
export function CoursesShowcase() {
  const courses = site.courses;
  if (courses.length === 0) return null;

  return (
    <section className="mx-auto max-w-[100rem] px-6 py-28 md:px-10 md:py-36">
      <SectionHeading
        eyebrow="The golf"
        title={courses.length > 1 ? "Two courses, one standard" : "The course"}
      />
      <div
        className={`mt-14 grid gap-6 ${courses.length > 1 ? "lg:grid-cols-2" : ""}`}
      >
        {courses.map((course, i) => {
          const tips = course.ratings[0];
          return (
            <Reveal key={course.slug} delay={i * 0.1}>
              <Link
                href={`/course/${course.slug}`}
                className="group relative block overflow-hidden border hairline"
              >
                <div className="relative aspect-[16/10]">
                  <SmartImage
                    asset={course.heroImage}
                    sizes={courses.length > 1 ? "(min-width: 1024px) 50vw, 100vw" : "100vw"}
                    imgClassName="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.04]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night via-night/25 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-7 md:p-9">
                  <div>
                    <p className="eyebrow">{course.designer.split("—")[0]}</p>
                    <h3 className="mt-2 font-display text-3xl text-cream md:text-4xl">
                      {course.name}
                    </h3>
                    <p className="mt-2 font-body text-sm text-mist">
                      {course.holes.length} holes · Par {course.par}
                      {tips ? ` · ${tips.yards.toLocaleString()} yds` : ""}
                    </p>
                  </div>
                  <span className="btn-ghost !px-5 !py-2.5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    Tour the course
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
