"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { site } from "@/lib/site";

const KEY = "fairway.preloader.seen";

/**
 * First-arrival veil: crest, name, and a counting beat before the curtain
 * lifts into the hero. Shown once per session; skipped entirely for
 * reduced-motion users and on return visits within the session.
 */
export function Preloader() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduced) return;
    try {
      if (sessionStorage.getItem(KEY) === "1") return;
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* private mode: just show it */
    }
    setShow(true);
    document.body.style.overflow = "hidden";
    const t0 = performance.now();
    const DURATION = 1100;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / DURATION);
      setCount(Math.round(t * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        window.setTimeout(() => {
          setShow(false);
          document.body.style.overflow = "";
        }, 200);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [reduced]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          aria-hidden
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-night"
          exit={{ y: "-100%", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-6"
          >
            <Image
              src={site.identity.logo.crest}
              alt=""
              width={88}
              height={88}
              priority
              className="h-[88px] w-[88px]"
            />
            <p className="font-display text-2xl tracking-wide text-cream">
              {site.identity.shortName}
            </p>
            <p className="eyebrow">{site.identity.tagline}</p>
          </motion.div>
          <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-3 px-10">
            <div className="h-px w-full max-w-md bg-line/50">
              <div
                className="h-px bg-brass transition-[width] duration-100 ease-linear"
                style={{ width: `${count}%` }}
              />
            </div>
            <span className="font-display text-sm tabular-nums text-mist">{count}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
