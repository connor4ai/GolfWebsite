"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Soft page-transition veil on every route change.
 *
 * The wrapper and its `initial` styles must be identical on the server and
 * the client's first render (reduced-motion users would otherwise get a
 * structural hydration mismatch), so reduced motion is honored via the
 * transition config — which never reaches the SSR markup — by snapping the
 * animation to zero duration.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
