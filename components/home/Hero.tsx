"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { site, defaultCourse, bookingCta } from "@/lib/site";
import { LiveAerial } from "@/components/media/LiveAerial";

/**
 * Cinematic hero: a living aerial of the real property drifting beneath
 * masked-line kinetic type, with scroll-linked parallax handoff into the
 * page. The headline splits across lines that rise from clipping masks —
 * the classic award-site entrance, in the club's voice.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const veil = useTransform(scrollYProgress, [0, 1], [0, 0.55]);

  const course = defaultCourse();
  const signature = course.holes.find(
    (h) => h.number === course.signatureHoleNumber
  );
  const heroView = signature
    ? {
        center: signature.green,
        zoom: 15.9,
        bearing: 110,
        pitch: 58,
      }
    : { center: site.location.coords, zoom: 15.2, bearing: 0, pitch: 50 };

  const cta = bookingCta();
  const words = site.identity.shortName.split(" ");

  const lineReveal = (i: number) =>
    reduced
      ? {}
      : {
          initial: { y: "110%" },
          animate: { y: "0%" },
          transition: {
            duration: 1.1,
            delay: 0.35 + i * 0.14,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  const fade = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section ref={ref} className="relative flex min-h-[100dvh] items-end overflow-hidden">
      <LiveAerial view={heroView} driftDegPerSec={0.4} />
      {!reduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-night"
          style={{ opacity: veil }}
        />
      )}

      <motion.div
        style={reduced ? undefined : { y: titleY, opacity: titleOpacity }}
        className="relative mx-auto w-full max-w-[100rem] px-6 pb-20 pt-44 md:px-10 md:pb-28"
      >
        <motion.p {...fade(0.25)} className="eyebrow">
          Trinity, Texas · Est. {site.identity.established} ·{" "}
          {site.flags.courseAccess === "private" ? "A private club" : site.identity.tagline}
        </motion.p>

        <h1 className="mt-6 font-display font-medium leading-[0.96] text-cream">
          {words.map((word, i) => (
            <span key={word} className="line-mask">
              <motion.span
                {...lineReveal(i)}
                className="block text-[clamp(3.4rem,11.5vw,10rem)]"
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
          <motion.p {...fade(0.8)} className="lede max-w-xl">
            {site.identity.tagline} — {course.holes.length} holes of Chet
            Williams golf in the East Texas pines, where Caney Creek meets
            the headwaters of Lake Livingston.
          </motion.p>
          <motion.div {...fade(0.95)} className="flex flex-wrap gap-4">
            <Link href="/explore" className="btn-primary">
              Explore the Property
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
          </motion.div>
        </div>
      </motion.div>

      {!reduced && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
          aria-hidden
        >
          <span className="text-[0.5625rem] uppercase tracking-luxe text-mist">Scroll</span>
          <span className="h-10 w-px animate-shimmer bg-gradient-to-b from-brass to-transparent" />
        </motion.div>
      )}
    </section>
  );
}
