"use client";

import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";
import { LiveAerial } from "@/components/media/LiveAerial";

/** Banner selling the flagship explore-map experience — over live imagery. */
export function ExploreTeaser() {
  const cfg = site.propertyMap;
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-[100rem] px-6 py-10 md:px-10">
        <Link
          href="/explore"
          className="group relative block overflow-hidden border hairline"
          aria-label={cfg.entry.cta}
        >
          <div className="relative aspect-[16/10] md:aspect-[21/8]">
            <LiveAerial
              view={{
                center: cfg.center,
                zoom: cfg.zoom - 0.6,
                bearing: cfg.bearing,
                pitch: 45,
              }}
              driftDegPerSec={0.7}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-night/90 via-night/40 to-transparent" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16">
            <Reveal>
              <p className="eyebrow">The property, live from above</p>
              <h2 className="display-2 mt-5 max-w-xl">
                {cfg.entry.headline}, in three dimensions
              </h2>
              <p className="mt-5 max-w-lg font-body text-sm leading-relaxed text-mist md:text-base">
                {cfg.entry.subcopy}
              </p>
              <span className="btn-primary mt-8 inline-flex w-fit">{cfg.entry.cta}</span>
            </Reveal>
          </div>
        </Link>
      </div>
    </section>
  );
}
