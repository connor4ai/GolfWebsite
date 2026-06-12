"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Inertial smooth scrolling (Lenis). Disabled for reduced-motion users and
 * on the immersive full-viewport routes, which manage their own surfaces.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const immersive =
    pathname === "/explore" || /^\/course\/[^/]+\/holes/.test(pathname);

  useEffect(() => {
    if (immersive) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [immersive]);

  return null;
}
