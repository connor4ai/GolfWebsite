"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Hole } from "@/config/types";
import { computeHoleShapes, smoothPath } from "@/lib/hole-shapes";
import type { FlyoverPhase } from "@/lib/map/flyover";

/**
 * Illustrated flyover: an original top-down plan of the hole generated
 * from its real coordinates, with an animated camera (viewBox) that pans
 * the playing line tee → green, drawing the shot arc as it goes — the same
 * choreography as the satellite engine, in vector form. Serves as both an
 * aesthetic mode and the no-network/no-WebGL fallback.
 */
export function IllustratedFlyover({
  hole,
  replayToken,
  onPhase,
  onProgress,
}: {
  hole: Hole;
  replayToken: number;
  onPhase: (p: FlyoverPhase) => void;
  onProgress: (t: number) => void;
}) {
  const shapes = useMemo(() => computeHoleShapes(hole), [hole]);
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const ballRef = useRef<SVGCircleElement>(null);
  const cb = useRef({ onPhase, onProgress });
  cb.current = { onPhase, onProgress };

  const centerlineD = useMemo(
    () => smoothPath(shapes.centerline),
    [shapes]
  );

  const full = shapes.viewBox;
  const fullStr = `${full.x} ${full.y} ${full.w} ${full.h}`;

  useEffect(() => {
    const svg = svgRef.current;
    const line = lineRef.current;
    const ball = ballRef.current;
    if (!svg || !line || !ball) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const short =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    const k = short ? 0.6 : 1;

    const L = line.getTotalLength();
    line.style.strokeDasharray = `${L}`;

    const setView = (cx: number, cy: number, w: number) => {
      const aspect = full.h / full.w;
      const h = w * aspect;
      svg.setAttribute("viewBox", `${cx - w / 2} ${cy - h / 2} ${w} ${h}`);
    };
    const setLine = (f: number) => {
      line.style.strokeDashoffset = `${L * (1 - f)}`;
      const p = line.getPointAtLength(L * f);
      ball.setAttribute("cx", String(p.x));
      ball.setAttribute("cy", String(p.y));
      ball.setAttribute("opacity", f > 0.001 && f < 0.999 ? "1" : "0");
    };

    if (reduced) {
      svg.setAttribute("viewBox", fullStr);
      setLine(1);
      cb.current.onPhase("idle");
      cb.current.onProgress(1);
      return;
    }

    let raf = 0;
    let cancelled = false;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
    const windowW = Math.min(full.w * 0.55, 320);

    const durations = {
      intro: 2400 * k,
      flight: (hole.par === 3 ? 7000 : hole.par === 4 ? 10000 : 12500) * k,
      settle: 2600 * k,
    };

    const start = shapes.start;
    setLine(0);
    setView(start.x, start.y, full.w); // begin pulled out, centered on tee

    const phaseIntro = (t0: number) => (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - t0) / durations.intro);
      const e = easeOutCubic(t);
      const w = full.w + (windowW - full.w) * e;
      setView(start.x, start.y, w);
      if (t < 1) raf = requestAnimationFrame(phaseIntro(t0));
      else {
        cb.current.onPhase("flight");
        raf = requestAnimationFrame((n) => phaseFlight(n)(n));
      }
    };

    const phaseFlight = (t0: number) => (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - t0) / durations.flight);
      const f = easeInOutSine(t);
      const p = line.getPointAtLength(L * f);
      setView(p.x, p.y, windowW * (1 + 0.18 * Math.sin(Math.PI * f)));
      setLine(f);
      cb.current.onProgress(f);
      if (t < 1) raf = requestAnimationFrame(phaseFlight(t0));
      else {
        cb.current.onPhase("orbit");
        raf = requestAnimationFrame((n) => phaseSettle(n)(n));
      }
    };

    const end = shapes.end;
    const phaseSettle = (t0: number) => (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - t0) / durations.settle);
      const e = easeInOutSine(t);
      const w = windowW + (full.w - windowW) * e;
      const cx = end.x + (full.x + full.w / 2 - end.x) * e;
      const cy = end.y + (full.y + full.h / 2 - end.y) * e;
      setView(cx, cy, w);
      if (t < 1) raf = requestAnimationFrame(phaseSettle(t0));
      else {
        // gentle breathing on the full view
        const breathe = (n2: number) => {
          if (cancelled) return;
          const s = 1 + 0.015 * Math.sin(n2 / 2400);
          setView(full.x + full.w / 2, full.y + full.h / 2, full.w * s);
          raf = requestAnimationFrame(breathe);
        };
        raf = requestAnimationFrame(breathe);
      }
    };

    cb.current.onPhase("intro");
    raf = requestAnimationFrame((n) => phaseIntro(n)(n));

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [hole, shapes, replayToken, full.h, full.w, full.x, full.y, fullStr]);

  // 100yd / 150yd arcs from the green (meters)
  const arcs = [91.44, 137.16];

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-[#131a12]">
      <svg
        ref={svgRef}
        viewBox={fullStr}
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        role="img"
        aria-label={`Illustrated plan of hole ${hole.number}: par ${hole.par}`}
      >
        <defs>
          <radialGradient id="ifo-ground" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor="#1d2a18" />
            <stop offset="100%" stopColor="#121a10" />
          </radialGradient>
          <linearGradient id="ifo-fairway" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4a7240" />
            <stop offset="100%" stopColor="#3c5f35" />
          </linearGradient>
        </defs>

        <rect
          x={full.x - full.w}
          y={full.y - full.h}
          width={full.w * 3}
          height={full.h * 3}
          fill="url(#ifo-ground)"
        />

        {/* mowed-rough corridor */}
        <path d={shapes.rough} fill="#2a3d22" opacity={0.85} />

        {/* tree scatter */}
        {shapes.trees.map((t, i) => (
          <g key={i}>
            <circle cx={t.x + 1.2} cy={t.y + 1.6} r={t.r} fill="#0c120a" opacity={0.55} />
            <circle cx={t.x} cy={t.y} r={t.r} fill="#22351c" />
          </g>
        ))}

        {/* fairway */}
        {shapes.fairway && (
          <path
            d={shapes.fairway}
            fill="url(#ifo-fairway)"
            stroke="#5a8049"
            strokeWidth={0.8}
            strokeOpacity={0.5}
          />
        )}

        {/* creek */}
        {shapes.creek && (
          <path
            d={shapes.creek}
            fill="none"
            stroke="#39596b"
            strokeWidth={7}
            strokeLinecap="round"
            opacity={0.9}
          />
        )}

        {/* yardage arcs */}
        {arcs.map((r) => (
          <circle
            key={r}
            cx={shapes.end.x}
            cy={shapes.end.y}
            r={r}
            fill="none"
            stroke="#e9e3d2"
            strokeOpacity={0.14}
            strokeWidth={0.9}
            strokeDasharray="3 7"
          />
        ))}

        {/* bunkers */}
        {shapes.bunkers.map((b, i) => (
          <path key={i} d={b} fill="#cdb87f" stroke="#a89055" strokeWidth={0.7} />
        ))}

        {/* green + flag */}
        <path d={shapes.green} fill="#6f9c58" stroke="#86b369" strokeWidth={1} />
        <circle cx={shapes.end.x} cy={shapes.end.y} r={1.4} fill="#f6f1e4" />
        <line
          x1={shapes.end.x}
          y1={shapes.end.y}
          x2={shapes.end.x}
          y2={shapes.end.y - 11}
          stroke="#f6f1e4"
          strokeWidth={0.9}
        />
        <path
          d={`M ${shapes.end.x} ${shapes.end.y - 11} l 7 2.6 l -7 2.6 Z`}
          fill="#c2a35d"
        />

        {/* tee pads */}
        {shapes.tees.map((t, i) => (
          <rect
            key={i}
            x={t.x - t.w / 2}
            y={t.y - t.h / 2}
            width={t.w}
            height={t.h}
            rx={1.6}
            transform={`rotate(${t.angle} ${t.x} ${t.y})`}
            fill="#3f6136"
            stroke="#5a8049"
            strokeWidth={0.6}
          />
        ))}

        {/* playing line (drawn during flight) + ball */}
        <path
          ref={lineRef}
          d={centerlineD}
          fill="none"
          stroke="#e9d9ac"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeDasharray="100000"
          strokeDashoffset="100000"
          opacity={0.95}
        />
        <circle ref={ballRef} r={3.4} fill="#ffffff" stroke="#c2a35d" strokeWidth={1.4} opacity={0} />
      </svg>

      <p className="pointer-events-none absolute bottom-3 right-4 z-10 text-[0.5625rem] uppercase tracking-luxe text-mist/60">
        Illustrated view
      </p>
    </div>
  );
}
