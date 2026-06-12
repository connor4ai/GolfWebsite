"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Hydration-safe prefers-reduced-motion: returns false during SSR and the
 * first client render (matching the server tree), then the real system
 * preference after mount. Use this instead of `useReducedMotion` anywhere
 * the value changes *what* is rendered, not just animation tuning —
 * otherwise reduced-motion users get a structural hydration mismatch
 * (framer's hook is null on the server but resolved on first client
 * render).
 */
export function useRM(): boolean {
  const system = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && !!system;
}
