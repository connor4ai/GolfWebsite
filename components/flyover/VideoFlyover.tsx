"use client";

import type { Hole } from "@/config/types";

/**
 * When a hole carries a `videoUrl` in config, the flyover stage renders a
 * standard video player (drone footage, etc.) instead of the 3D camera.
 */
export function VideoFlyover({ hole }: { hole: Hole }) {
  return (
    <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-night">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- course flyover footage is ambient/visual; descriptive copy accompanies it in the hole card */}
      <video
        key={hole.number}
        className="h-full w-full object-contain"
        src={hole.videoUrl}
        poster={hole.heroImage.src}
        controls
        playsInline
        preload="metadata"
        aria-label={`Flyover video of hole ${hole.number}${hole.name ? ` — ${hole.name}` : ""}`}
      />
      <p className="pointer-events-none absolute bottom-3 right-4 z-10 text-[0.5625rem] uppercase tracking-luxe text-mist/60">
        Course film
      </p>
    </div>
  );
}
