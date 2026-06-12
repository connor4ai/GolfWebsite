"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRM } from "@/components/ui/useRM";
import { defaultCourse } from "@/lib/site";
import { SmartImage } from "@/components/media/SmartImage";

/**
 * The closing-stretch story: a scroll-pinned horizontal journey through
 * the course's final six holes, each card carrying a real aerial of the
 * hole it describes. Vertical scroll drives the lateral travel — the
 * "walk the finish" moment of the page.
 */
export function CreekRun() {
  const course = defaultCourse();
  const holes = course.holes.slice(-6);
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useRM();
  const { scrollYProgress } = useScroll({ target: ref });
  // Lateral travel measured in pixels — percentage travel resolves against
  // the track's own width and clips the final cards on narrow viewports.
  const [range, setRange] = useState(0);
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setRange(Math.max(0, track.scrollWidth - window.innerWidth + 24));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [reduced]);
  const x = useTransform(scrollYProgress, [0.06, 0.94], [16, -range]);

  if (holes.length < 3) return null;
  const first = holes[0].number;
  const last = holes[holes.length - 1].number;

  const intro = (
    <div className="w-[82vw] flex-shrink-0 self-center pr-8 md:w-[36rem] md:pr-16">
      <p className="eyebrow">
        Holes {first}–{last}
      </p>
      <h2 className="display-2 mt-5">The finishing run</h2>
      <p className="mt-6 max-w-md font-body text-base leading-loose text-mist">
        Every great course saves an argument for the end. These are the six
        holes that decide the day — walk them from above.
      </p>
      <p className="eyebrow mt-10 hidden md:block" aria-hidden>
        Keep scrolling →
      </p>
    </div>
  );

  const cards = holes.map((hole) => {
    const tips = Object.values(hole.yardages)[0];
    const signature = hole.number === course.signatureHoleNumber;
    return (
      <article
        key={hole.number}
        className={`relative w-[78vw] flex-shrink-0 overflow-hidden border hairline md:w-[34rem] ${
          signature ? "border-brass/60" : ""
        }`}
      >
        <div className="relative aspect-[4/3]">
          <SmartImage
            asset={hole.heroImage}
            sizes="(min-width: 768px) 34rem, 78vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night via-night/15 to-transparent" />
          <span
            aria-hidden
            className="ghost-numeral absolute -right-2 -top-6 font-display text-[7.5rem] leading-none md:text-[9rem]"
          >
            {hole.number}
          </span>
          {signature && (
            <span className="absolute left-5 top-5 border border-brass/60 bg-night/70 px-3 py-1 text-[0.5625rem] uppercase tracking-luxe text-brass backdrop-blur-sm">
              The signature
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 p-6 md:p-7">
          <p className="eyebrow">
            No. {hole.number} · Par {hole.par} · {tips} yds
          </p>
          <p className="line-clamp-3 font-body text-sm leading-relaxed text-mist">
            {hole.description}
          </p>
          <Link
            href={`/course/${course.slug}/holes?hole=${hole.number}`}
            className="mt-1 inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-luxe text-brass transition-colors hover:text-cream"
          >
            Fly this hole <span aria-hidden>→</span>
          </Link>
        </div>
      </article>
    );
  });

  if (reduced) {
    return (
      <section className="border-y hairline bg-raised/20 py-28">
        <div className="flex gap-6 overflow-x-auto px-6 md:px-10">
          {intro}
          {cards}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[340vh] border-y hairline bg-raised/20">
      <div className="sticky top-0 flex h-[100dvh] items-center overflow-hidden">
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex items-stretch gap-6 pl-6 md:pl-10"
        >
          {intro}
          {cards}
          <div className="w-6 flex-shrink-0 md:w-10" aria-hidden />
        </motion.div>
      </div>
    </section>
  );
}
