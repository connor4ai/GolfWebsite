"use client";

import { useState } from "react";
import { getAmbientAudio } from "@/lib/audio/ambient";

/**
 * Ambient-audio toggle (synthesized mountain air + birdsong). Off by
 * default; the AudioContext is created on first activation so browser
 * autoplay policies are respected.
 */
export function AudioToggle({ className = "" }: { className?: string }) {
  // The audio engine is a singleton that outlives any one toggle (entry
  // overlay → HUD → flyover), so initialize from its live state. At
  // SSR/hydration time audio can never be running (it requires a user
  // gesture), so this is hydration-safe.
  const [on, setOn] = useState(
    () => typeof window !== "undefined" && getAmbientAudio().isRunning
  );
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const next = await getAmbientAudio().toggle();
      setOn(next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className={`group inline-flex items-center gap-3 border border-line/70 bg-night/60 px-4 py-2.5 text-[0.625rem] uppercase tracking-luxe backdrop-blur-md transition-colors duration-300 hover:border-brass ${
        on ? "text-brass" : "text-cream/75"
      } ${className}`}
    >
      <span className="flex h-3 items-end gap-[2.5px]" aria-hidden>
        {[0.55, 1, 0.7, 0.9].map((h, i) => (
          <span
            key={i}
            style={{
              height: `${h * 100}%`,
              animationDelay: `${i * 0.18}s`,
              animationPlayState: on ? "running" : "paused",
            }}
            className={`w-[2.5px] origin-bottom animate-shimmer ${
              on ? "bg-brass" : "bg-mist/60"
            }`}
          />
        ))}
      </span>
      {on ? "Sound on" : "Ambient sound"}
    </button>
  );
}
