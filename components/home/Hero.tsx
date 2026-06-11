"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { site } from "@/lib/site";

export function Hero() {
  const reduced = useReducedMotion();
  const fade = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 26 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section className="relative flex min-h-[100dvh] items-end overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/scenes/hero-home.svg"
          alt={`The ridgelines and fairways of ${site.identity.courseName} at dusk`}
          fill
          priority
          className={`object-cover ${reduced ? "" : "animate-slow-drift"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night/55 via-night/20 to-night" />
      </div>

      <div className="relative mx-auto w-full max-w-[100rem] px-6 pb-24 pt-44 md:px-10 md:pb-32">
        <motion.p {...fade(0.2)} className="eyebrow">
          {site.location.address.city}, {site.location.address.region}
          {site.location.elevationFt
            ? ` · ${site.location.elevationFt.toLocaleString()} feet`
            : ""}
        </motion.p>
        <motion.h1 {...fade(0.35)} className="display-1 mt-6 max-w-4xl">
          {site.identity.courseName}
        </motion.h1>
        <motion.p {...fade(0.5)} className="lede mt-6 max-w-2xl">
          {site.identity.tagline}
          {site.identity.established ? ` — since ${site.identity.established}.` : "."}
        </motion.p>
        <motion.div {...fade(0.65)} className="mt-10 flex flex-wrap gap-4">
          <Link href="/explore" className="btn-primary">
            Explore the Property
          </Link>
          <Link href={`/course/${site.courses[0].slug}/holes`} className="btn-ghost">
            Fly the Course
          </Link>
        </motion.div>
      </div>

      {!reduced && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
          aria-hidden
        >
          <span className="text-[0.5625rem] uppercase tracking-luxe text-mist">Scroll</span>
          <span className="h-10 w-px animate-shimmer bg-gradient-to-b from-brass to-transparent" />
        </motion.div>
      )}
    </section>
  );
}
