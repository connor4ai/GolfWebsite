"use client";

import { useMemo } from "react";
import { site } from "@/lib/site";
import type { MapPin, PinCategory } from "@/config/types";
import { makeProjector, samplePath, type XY } from "@/lib/geo";
import { smoothPath, mulberry32 } from "@/lib/hole-shapes";
import { ICON_PATHS } from "./pin-icons";

/**
 * Original stylized rendering of the whole property — the explore
 * experience when satellite tiles are unreachable (offline, blocked, no
 * WebGL). Every hole corridor and pin is drawn from the same config
 * coordinates the satellite map uses, and pins remain fully interactive
 * and keyboard accessible.
 */
export function IllustratedPropertyMap({
  visibleCats,
  selected,
  onSelect,
}: {
  visibleCats: Set<PinCategory>;
  selected: MapPin | null;
  onSelect: (pin: MapPin) => void;
}) {
  const scene = useMemo(() => buildScene(), []);
  const { vb, holes, pins, hills, woods } = scene;

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-night">
      <svg
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        aria-label={`Illustrated map of ${site.identity.courseName}`}
        role="application"
      >
        <defs>
          <radialGradient id="ipm-glow" cx="50%" cy="38%" r="80%">
            <stop offset="0%" stopColor="#22301f" />
            <stop offset="55%" stopColor="#17211a" />
            <stop offset="100%" stopColor="#0e1410" />
          </radialGradient>
          <linearGradient id="ipm-gorge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0e1410" stopOpacity="0" />
            <stop offset="100%" stopColor="#070b08" />
          </linearGradient>
        </defs>

        <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill="url(#ipm-glow)" />

        {/* soft landform contours */}
        {hills.map((h, i) => (
          <ellipse
            key={i}
            cx={h.x}
            cy={h.y}
            rx={h.rx}
            ry={h.ry}
            fill="none"
            stroke="#2c3a2c"
            strokeOpacity={0.5 - i * 0.018}
            strokeWidth={2.5}
          />
        ))}

        {/* gorge band falling away to the south */}
        <rect
          x={vb.x}
          y={vb.y + vb.h * 0.82}
          width={vb.w}
          height={vb.h * 0.18}
          fill="url(#ipm-gorge)"
        />

        {/* woodland clusters */}
        {woods.map((w, i) => (
          <circle key={i} cx={w.x} cy={w.y} r={w.r} fill="#1c2a1d" opacity={0.8} />
        ))}

        {/* hole corridors */}
        {holes.map((h) => (
          <g key={h.number}>
            <path
              d={h.path}
              fill="none"
              stroke="#33502f"
              strokeWidth={34}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            />
            <path
              d={h.path}
              fill="none"
              stroke="#446b3c"
              strokeWidth={20}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={h.green.x} cy={h.green.y} r={13} fill="#5d8a50" />
            <circle cx={h.tee.x} cy={h.tee.y} r={5} fill="#d8d2c0" opacity={0.9} />
            <text
              x={h.label.x}
              y={h.label.y}
              fill="#e9e3d2"
              opacity={0.75}
              fontSize={26}
              fontFamily="var(--font-body), sans-serif"
              textAnchor="middle"
            >
              {h.number}
            </text>
          </g>
        ))}

        {/* pins — SVG-native so alignment survives any crop */}
        {pins.map((p) => {
          const hidden = !visibleCats.has(p.pin.category);
          const isSel = selected?.id === p.pin.id;
          return (
            <g
              key={p.pin.id}
              role="button"
              tabIndex={hidden ? -1 : 0}
              aria-label={`${p.pin.title} — open details`}
              onClick={() => onSelect(p.pin)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(p.pin);
                }
              }}
              className={`ipm-pin ${hidden ? "ipm-pin--hidden" : ""} ${
                isSel ? "ipm-pin--selected" : ""
              }`}
            >
              {isSel && (
                <circle cx={p.at.x} cy={p.at.y} r={46} fill="#c2a35d" opacity={0.14}>
                  <animate
                    attributeName="r"
                    values="38;52;38"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle
                cx={p.at.x}
                cy={p.at.y}
                r={26}
                fill="#10150f"
                fillOpacity={0.92}
                stroke={isSel ? "#e9d9ac" : "#c2a35d"}
                strokeWidth={isSel ? 4 : 2.5}
              />
              <path
                d={ICON_PATHS[p.pin.category]}
                transform={`translate(${p.at.x - 15} ${p.at.y - 15}) scale(1.25)`}
                fill="none"
                stroke={isSel ? "#e9d9ac" : "#c2a35d"}
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <title>{p.pin.title}</title>
            </g>
          );
        })}
      </svg>

      <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-[0.5625rem] uppercase tracking-luxe text-mist/70">
        Illustrated property view
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------

interface SceneHole {
  number: number;
  path: string;
  tee: XY;
  green: XY;
  label: XY;
}

function buildScene() {
  const cfg = site.propertyMap;
  const proj = makeProjector(cfg.center);
  const toSvg = (lat: number, lng: number): XY => {
    const m = proj.toXY({ lat, lng });
    return { x: m.x, y: -m.y };
  };

  const course = site.courses[0];
  const holes: SceneHole[] = course.holes.map((h) => {
    const sampled = samplePath([h.tee, ...h.midpoints, h.green], 28);
    const pts = sampled.points.map((p) => toSvg(p.lat, p.lng));
    const mid = pts[Math.floor(pts.length / 2)];
    return {
      number: h.number,
      path: smoothPath(pts),
      tee: pts[0],
      green: pts[pts.length - 1],
      label: { x: mid.x + 22, y: mid.y - 14 },
    };
  });

  const pins = cfg.pins.map((pin) => ({
    pin,
    at: toSvg(pin.coords.lat, pin.coords.lng),
  }));

  // Bounds over everything + breathing room.
  const xs: number[] = [];
  const ys: number[] = [];
  holes.forEach((h) => {
    xs.push(h.tee.x, h.green.x);
    ys.push(h.tee.y, h.green.y);
  });
  pins.forEach((p) => {
    xs.push(p.at.x);
    ys.push(p.at.y);
  });
  const pad = 220;
  const minX = Math.min(...xs) - pad;
  const maxX = Math.max(...xs) + pad;
  const minY = Math.min(...ys) - pad;
  const maxY = Math.max(...ys) + pad;
  const vb = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };

  // Seeded decorative landforms.
  const rng = mulberry32(20290614);
  const hills = Array.from({ length: 14 }, () => ({
    x: vb.x + rng() * vb.w,
    y: vb.y + rng() * vb.h * 0.8,
    rx: 120 + rng() * 320,
    ry: 60 + rng() * 140,
  }));
  const woods = Array.from({ length: 60 }, () => ({
    x: vb.x + rng() * vb.w,
    y: vb.y + rng() * vb.h,
    r: 14 + rng() * 42,
  }));

  return { vb, holes, pins, hills, woods };
}
