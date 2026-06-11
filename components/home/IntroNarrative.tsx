import { Reveal } from "@/components/ui/Reveal";
import { site, defaultCourse, yardageTotal } from "@/lib/site";

export function IntroNarrative() {
  const course = defaultCourse();
  const tips = course.teeBoxes[0]?.id;
  const stats: { value: string; label: string }[] = [
    ...(site.identity.established
      ? [{ value: String(site.identity.established), label: "Established" }]
      : []),
    { value: String(course.par), label: "Par" },
    {
      value: tips ? yardageTotal(course, tips).toLocaleString() : "—",
      label: "Yards from the tips",
    },
    ...(site.location.elevationFt
      ? [
          {
            value: site.location.elevationFt.toLocaleString(),
            label: "Feet above sea level",
          },
        ]
      : [{ value: String(course.holes.length), label: "Holes" }]),
  ];

  return (
    <section className="mx-auto max-w-editorial px-6 py-28 md:px-10 md:py-36">
      <Reveal>
        <p className="eyebrow">The setting</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="display-2 mt-6 max-w-4xl">{site.location.regionNarrative.split(".")[0]}.</h2>
      </Reveal>
      <Reveal delay={0.16}>
        <p className="mt-8 max-w-3xl font-body text-base leading-loose text-mist md:text-lg">
          {site.location.regionNarrative.split(".").slice(1).join(".").trim()}
        </p>
      </Reveal>

      <div className="mt-16 grid grid-cols-2 gap-px border hairline bg-line/40 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={0.1 + i * 0.08} className="bg-night">
            <div className="flex flex-col gap-2 px-6 py-8">
              <span className="font-display text-4xl text-brass md:text-5xl">{s.value}</span>
              <span className="text-[0.625rem] uppercase tracking-luxe text-mist">{s.label}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
