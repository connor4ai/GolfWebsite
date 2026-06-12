"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRM } from "@/components/ui/useRM";
import { site } from "@/lib/site";

/**
 * Scroll-pinned manifesto: the club's credo held center-screen while each
 * word resolves from mist to cream as you scroll through the section.
 */
export function Manifesto() {
  const text = site.identity.manifesto;
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useRM();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.65"],
  });

  if (!text) return null;
  const words = text.split(" ");

  if (reduced) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-32 md:px-10">
        <p className="eyebrow mb-8">The idea</p>
        <p className="font-display text-3xl leading-snug text-cream md:text-5xl">{text}</p>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-[100dvh] items-center">
        <div className="mx-auto w-full max-w-5xl px-6 md:px-10">
          <p className="eyebrow mb-10">The idea</p>
          <p className="font-display text-[clamp(1.9rem,4.6vw,3.9rem)] leading-[1.18] text-cream">
            {words.map((word, i) => (
              <Word
                key={`${word}-${i}`}
                progress={scrollYProgress}
                range={[i / words.length, Math.min(1, (i + 1.6) / words.length)]}
              >
                {word}
              </Word>
            ))}
          </p>
          <p className="eyebrow mt-12 text-right">— the founding brief, 1992</p>
        </div>
      </div>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [10, 0]);
  return (
    <motion.span style={{ opacity, y }} className="inline-block whitespace-pre">
      {children}{" "}
    </motion.span>
  );
}
