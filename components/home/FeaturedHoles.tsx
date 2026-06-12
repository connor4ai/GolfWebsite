"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SmartImage } from "@/components/media/SmartImage";
import { defaultCourse } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Swipeable featured-holes carousel: native scroll-snap (touch-first) with
 * arrow controls and an index readout. Features the signature hole, the
 * No. 1 handicap, and a spread of memorable others.
 */
export function FeaturedHoles() {
  const course = defaultCourse();
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const sig = course.signatureHoleNumber;
  const hardest = course.holes.find((h) => h.handicap === 1)?.number;
  const finisher = course.holes[course.holes.length - 1]?.number;
  const longThree = [...course.holes]
    .filter((h) => h.par === 3)
    .sort((a, b) => (Object.values(b.yardages)[0] ?? 0) - (Object.values(a.yardages)[0] ?? 0))[0]
    ?.number;
  const picks = Array.from(
    new Set([sig, hardest, longThree, finisher, 1].filter(Boolean))
  ) as number[];
  const holes = picks
    .map((n) => course.holes.find((h) => h.number === n)!)
    .filter(Boolean);

  const scrollTo = useCallback(
    (i: number) => {
      const el = ref.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(holes.length - 1, i));
      const child = el.children[clamped] as HTMLElement | undefined;
      child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    },
    [holes.length]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      Array.from(el.children).forEach((c, i) => {
        const r = c as HTMLElement;
        const center = r.offsetLeft + r.offsetWidth / 2;
        const d = Math.abs(center - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setIndex(best);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="overflow-hidden border-y hairline bg-raised/30 py-28 md:py-36">
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="eyebrow">The holes everyone remembers</p>
            <h2 className="display-2 mt-5">Postcards from the round</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex items-center gap-3">
              <span className="mr-2 font-display text-lg text-mist">
                {String(index + 1).padStart(2, "0")} / {String(holes.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => scrollTo(index - 1)}
                aria-label="Previous hole"
                className="flex h-11 w-11 items-center justify-center border border-line/70 text-cream transition-colors hover:border-brass hover:text-brass disabled:opacity-30"
                disabled={index === 0}
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollTo(index + 1)}
                aria-label="Next hole"
                className="flex h-11 w-11 items-center justify-center border border-line/70 text-cream transition-colors hover:border-brass hover:text-brass disabled:opacity-30"
                disabled={index === holes.length - 1}
              >
                →
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      <div
        ref={ref}
        className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 [scrollbar-width:none] md:px-10 [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label="Featured holes carousel"
      >
        {holes.map((hole) => {
          const tips = Object.values(hole.yardages)[0];
          return (
            <article
              key={hole.number}
              className="group relative w-[85vw] max-w-xl flex-shrink-0 snap-center overflow-hidden border hairline bg-night md:w-[44vw]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <SmartImage
                  asset={hole.heroImage}
                  sizes="(min-width: 768px) 44vw, 85vw"
                  imgClassName="object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night via-night/20 to-transparent" />
                <div className="absolute left-6 top-6 flex items-baseline gap-2">
                  <span className="font-display text-6xl text-cream/95">{hole.number}</span>
                  <span className="text-[0.625rem] uppercase tracking-luxe text-brass">
                    Par {hole.par} · {tips} yds
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3 p-7">
                <h3 className="font-display text-2xl text-cream">
                  {hole.name ?? `Hole ${hole.number}`}
                </h3>
                <p className="line-clamp-3 font-body text-sm leading-relaxed text-mist">
                  {hole.description}
                </p>
                <Link
                  href={`/course/${course.slug}/holes?hole=${hole.number}`}
                  className="mt-2 inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-luxe text-brass transition-colors hover:text-cream"
                >
                  Fly this hole <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
