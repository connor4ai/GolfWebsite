"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { site } from "@/lib/site";
import { AudioToggle } from "./AudioToggle";
import { LiveAerial } from "@/components/media/LiveAerial";

/** Cinematic landing veil over the explore map. */
export function EntryOverlay({ onEnter }: { onEnter: () => void }) {
  const reduced = useReducedMotion();
  const entry = site.propertyMap.entry;

  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <motion.div
      key="entry-overlay"
      className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden"
      exit={
        reduced
          ? { opacity: 0 }
          : { opacity: 0, scale: 1.06, transition: { duration: 1, ease: [0.4, 0, 0.2, 1] } }
      }
    >
      <LiveAerial
        view={{
          center: site.propertyMap.center,
          zoom: site.propertyMap.zoom - 1.4,
          bearing: site.propertyMap.bearing,
          pitch: 38,
        }}
        driftDegPerSec={0.5}
        grade={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-night/55 via-night/40 to-night/85" />

      <div className="relative flex max-w-3xl flex-col items-center px-6 text-center">
        <motion.div {...rise(0.1)}>
          <Image
            src={site.identity.logo.crest}
            alt={`${site.identity.courseName} crest`}
            width={96}
            height={96}
            priority
            className="h-24 w-24"
          />
        </motion.div>
        <motion.p {...rise(0.35)} className="eyebrow mt-10">
          {site.location.address.city}, {site.location.address.region}
        </motion.p>
        <motion.h1 {...rise(0.5)} className="display-1 mt-5">
          {entry.headline}
        </motion.h1>
        <motion.p {...rise(0.7)} className="lede mt-6 max-w-xl">
          {entry.subcopy}
        </motion.p>
        <motion.div {...rise(0.9)} className="mt-12 flex flex-col items-center gap-6">
          <button type="button" onClick={onEnter} className="btn-primary group !px-10 !py-4">
            {entry.cta}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </button>
          <AudioToggle />
        </motion.div>
      </div>

      <motion.p
        {...rise(1.15)}
        className="absolute bottom-7 left-1/2 w-full -translate-x-1/2 px-6 text-center text-[0.5625rem] uppercase tracking-luxe text-mist/70"
      >
        An interactive aerial tour · best with sound
      </motion.p>
    </motion.div>
  );
}
