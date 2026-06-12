"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useRM } from "@/components/ui/useRM";
import { site, defaultCourse, yardageTotal } from "@/lib/site";

interface Stat {
  value: number;
  format?: (n: number) => string;
  label: string;
  prefix?: string;
}

/** Animated odometer stats assembled from config. */
export function NumbersStrip() {
  const course = defaultCourse();
  const tips = course.teeBoxes[0]?.id;
  const totalHoles = site.courses.reduce((s, c) => s + c.holes.length, 0);

  const stats: Stat[] = [
    ...(site.flags.numberOfCourses > 1
      ? [{ value: totalHoles, label: "Holes inside the gates" }]
      : [{ value: course.holes.length, label: "Holes" }]),
    {
      value: tips ? yardageTotal(course, tips) : course.par,
      format: (n) => n.toLocaleString(),
      label: `Yards from the ${course.teeBoxes[0]?.name ?? "back"} tees`,
    },
    ...(site.location.acreage
      ? [{ value: site.location.acreage, label: "Acres of property" }]
      : []),
    ...(site.identity.established
      ? [{ value: site.identity.established, format: (n: number) => String(n), label: "Established" }]
      : []),
  ];

  return (
    <section className="border-y hairline bg-raised/30">
      <div className="mx-auto grid max-w-[100rem] grid-cols-2 gap-px bg-line/40 md:grid-cols-4">
        {stats.slice(0, 4).map((s) => (
          <Counter key={s.label} stat={s} />
        ))}
      </div>
    </section>
  );
}

function Counter({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useRM();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(stat.value);
      return;
    }
    const t0 = performance.now();
    const DURATION = 1600;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / DURATION);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(Math.round(stat.value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, stat.value]);

  return (
    <div ref={ref} className="bg-night px-6 py-12 md:px-10 md:py-16">
      <p className="font-display text-5xl text-brass tabular-nums md:text-6xl">
        {stat.prefix}
        {stat.format ? stat.format(display) : display}
      </p>
      <p className="mt-3 text-[0.625rem] uppercase tracking-luxe text-mist">{stat.label}</p>
    </div>
  );
}
