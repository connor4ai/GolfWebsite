"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useRM } from "@/components/ui/useRM";
import type { CourseInfo } from "@/config/types";
import { checkTileHealth, type TileHealth } from "@/lib/map/tile-health";
import type { FlyoverPhase } from "@/lib/map/flyover";
import { SatelliteFlyover } from "./SatelliteFlyover";
import { IllustratedFlyover } from "./IllustratedFlyover";
import { VideoFlyover } from "./VideoFlyover";
import { HoleScroller } from "./HoleScroller";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { AudioToggle } from "@/components/explore/AudioToggle";

type Mode = "satellite" | "illustrated";

export function FlyoverExperience({
  course,
  initialHole,
}: {
  course: CourseInfo;
  initialHole: number;
}) {
  const reduced = useRM();
  const [idx, setIdx] = useState(() =>
    Math.min(Math.max(initialHole - 1, 0), course.holes.length - 1)
  );
  const [health, setHealth] = useState<TileHealth | null>(null);
  const [override, setOverride] = useState<Mode | null>(null);
  const [webglBroken, setWebglBroken] = useState(false);
  const [replayToken, setReplayToken] = useState(0);
  const [phase, setPhase] = useState<FlyoverPhase>("idle");
  const [progress, setProgress] = useState(0);

  const hole = course.holes[idx];

  // Engines report progress per animation frame; quantize so React only
  // re-renders the HUD ~100 times per flight instead of ~60/s.
  const reportProgress = useCallback((t: number) => {
    setProgress(Math.round(t * 100) / 100);
  }, []);

  const replay = useCallback(() => {
    setProgress(0);
    setReplayToken((t) => t + 1);
  }, []);

  useEffect(() => {
    let alive = true;
    checkTileHealth(hole.tee).then((h) => {
      if (alive) setHealth(h);
    });
    return () => {
      alive = false;
    };
    // The probe is property-wide; first hole's tee is as good as any.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deep-linkable: keep ?hole=n in the URL without triggering navigation.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("hole", String(hole.number));
    window.history.replaceState(null, "", url.toString());
  }, [hole.number]);

  const select = useCallback(
    (n: number) => {
      setIdx(Math.min(Math.max(n - 1, 0), course.holes.length - 1));
      setProgress(0);
    },
    [course.holes.length]
  );

  // Keyboard: ←/→ move between holes, R replays.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (/^(input|textarea|select)$/i.test(target.tagName)) return;
      if (e.key === "ArrowRight") select(hole.number + 1);
      if (e.key === "ArrowLeft") select(hole.number - 1);
      if (e.key.toLowerCase() === "r") replay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hole.number, select, replay]);

  const satelliteAvailable = !!health?.imagery && !webglBroken;
  const mode: Mode | null = health
    ? override ?? (satelliteAvailable ? "satellite" : "illustrated")
    : null;

  const tips = course.teeBoxes[0]?.id;
  const phaseLabel = useMemo(() => {
    if (hole.videoUrl) return "Course film";
    switch (phase) {
      case "intro":
        return "On the tee";
      case "flight":
        return "In flight";
      case "orbit":
        return "Over the green";
      default:
        return "Your camera";
    }
  }, [phase, hole.videoUrl]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-night">
      {/* Stage */}
      {hole.videoUrl ? (
        <VideoFlyover hole={hole} />
      ) : mode === "satellite" && health?.imagery ? (
        <SatelliteFlyover
          provider={health.imagery}
          terrainOk={health.terrain}
          hole={hole}
          replayToken={replayToken}
          onPhase={setPhase}
          onProgress={reportProgress}
          onFatal={() => {
            setWebglBroken(true);
            setOverride("illustrated");
          }}
        />
      ) : mode === "illustrated" ? (
        <IllustratedFlyover
          hole={hole}
          replayToken={replayToken}
          onPhase={setPhase}
          onProgress={reportProgress}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="eyebrow animate-shimmer">Preparing the flyover…</p>
        </div>
      )}

      {/* Top HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-[4.5rem] z-10 flex items-start justify-between gap-4 p-4 md:p-6">
        <Link
          href={`/course/${course.slug}`}
          className="btn-ghost pointer-events-auto !border-line/60 !bg-night/60 !px-4 !py-2.5 backdrop-blur-md"
        >
          ← {course.name}
        </Link>
        <div className="pointer-events-auto flex flex-col items-end gap-3">
          {!hole.videoUrl && mode && (
            <ModeToggle
              mode={mode}
              satelliteAvailable={satelliteAvailable}
              onChange={setOverride}
            />
          )}
          <AudioToggle />
        </div>
      </div>

      {/* Hole card */}
      <div className="pointer-events-none absolute bottom-24 left-0 z-10 w-full px-4 md:bottom-6 md:max-w-md md:px-6">
        <AnimatePresence mode="wait">
          <motion.article
            key={hole.number}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="panel pointer-events-auto max-h-[38dvh] overflow-y-auto p-6 md:max-h-[52dvh] md:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">
                  Hole {hole.number}
                  {hole.name ? ` · ${hole.name}` : ""}
                </p>
                <div className="mt-3 flex items-baseline gap-5">
                  <span className="font-display text-5xl leading-none text-cream">
                    {hole.number}
                  </span>
                  <dl className="flex gap-5 text-center">
                    <div>
                      <dt className="text-[0.5625rem] uppercase tracking-luxe text-mist">Par</dt>
                      <dd className="font-display text-2xl text-cream">{hole.par}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.5625rem] uppercase tracking-luxe text-mist">Yards</dt>
                      <dd className="font-display text-2xl text-cream">
                        {tips ? hole.yardages[tips] : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.5625rem] uppercase tracking-luxe text-mist">Hcp</dt>
                      <dd className="font-display text-2xl text-cream">{hole.handicap}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <span className="whitespace-nowrap border border-line/60 px-2.5 py-1 text-[0.5625rem] uppercase tracking-luxe text-mist">
                {phaseLabel}
              </span>
            </div>

            {/* tee yardages */}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
              {course.teeBoxes.map((tee) => (
                <span key={tee.id} className="flex items-center gap-2 text-xs text-mist">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: tee.color }}
                    aria-hidden
                  />
                  {tee.name} {hole.yardages[tee.id] ?? "—"}
                </span>
              ))}
            </div>

            <p className="mt-4 font-body text-sm leading-relaxed text-cream/85">
              {hole.description}
            </p>
            <p className="mt-3 border-l-2 border-brass/60 pl-4 font-body text-sm italic leading-relaxed text-mist">
              <span className="eyebrow mr-2 not-italic">From the caddie</span>
              {hole.proTip}
            </p>

            {/* progress */}
            {!hole.videoUrl && (
              <div
                className="mt-5 h-px w-full bg-line/60"
                role="progressbar"
                aria-label="Flyover progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
              >
                <div
                  className="h-px bg-brass transition-[width] duration-200 ease-linear"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => select(hole.number - 1)}
                disabled={idx === 0}
                className="btn-ghost !px-4 !py-2.5 disabled:opacity-30"
                aria-label="Previous hole"
              >
                ← Prev
              </button>
              {!hole.videoUrl && (
                <button
                  type="button"
                  onClick={replay}
                  className="btn-primary !px-4 !py-2.5"
                >
                  Replay
                </button>
              )}
              <button
                type="button"
                onClick={() => select(hole.number + 1)}
                disabled={idx === course.holes.length - 1}
                className="btn-ghost !px-4 !py-2.5 disabled:opacity-30"
                aria-label="Next hole"
              >
                Next →
              </button>
              <Link
                href={`/course/${course.slug}#scorecard`}
                className="ml-auto text-[0.625rem] uppercase tracking-luxe text-brass transition-colors hover:text-cream"
              >
                Scorecard →
              </Link>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      {/* Hole scroller */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center md:bottom-6 md:justify-end md:pr-6">
        <HoleScroller
          holes={course.holes}
          activeNumber={hole.number}
          onSelect={select}
        />
      </div>
    </div>
  );
}
