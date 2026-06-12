"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ImageAsset } from "@/config/types";
import { site } from "@/lib/site";
import { checkTileHealth } from "@/lib/map/tile-health";
import { snapshotSatellite } from "@/lib/map/static-snapshot";

/**
 * The one image primitive for config-driven slots. Resolution order:
 *
 *   1. `asset.src` (local file or the club's photography CDN)
 *   2. `asset.sat` — a live-rendered crop of real satellite/aerial
 *      imagery of those exact coordinates (also used when a photo 404s)
 *   3. branded gradient veil (never a broken frame)
 *
 * Aerial crops are real photography of the actual property, so photo
 * slots are launch-safe even before the client's image library lands.
 */
export function SmartImage({
  asset,
  sizes,
  priority = false,
  className = "",
  imgClassName = "object-cover",
  aerialLabel = true,
}: {
  asset: ImageAsset;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  aerialLabel?: boolean;
}) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const usePhoto = !!asset.src && !photoFailed;
  const useSat = !usePhoto && !!asset.sat;

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {usePhoto && (
        <Image
          src={asset.src!}
          alt={asset.alt}
          fill
          sizes={sizes ?? "100vw"}
          priority={priority}
          className={imgClassName}
          onError={() => setPhotoFailed(true)}
        />
      )}
      {useSat && <SatCrop asset={asset} imgClassName={imgClassName} aerialLabel={aerialLabel} />}
      {!usePhoto && !useSat && <BrandVeil alt={asset.alt} />}
    </div>
  );
}

function SatCrop({
  asset,
  imgClassName,
  aerialLabel,
}: {
  asset: ImageAsset;
  imgClassName: string;
  aerialLabel: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [credit, setCredit] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const sat = asset.sat;
    if (!el || !sat) return;
    let alive = true;
    let started = false;

    const start = async () => {
      if (started) return;
      started = true;
      try {
        // tile-health memoizes successes and re-probes after failures —
        // never cache its result here or one offline blip at first paint
        // would blank every aerial slot for the whole session.
        const health = await checkTileHealth(sat.center);
        if (!health.imagery) throw new Error("no imagery");
        const rect = el.getBoundingClientRect();
        const w = Math.min(1280, Math.max(480, Math.round(rect.width || 800)));
        const h = Math.min(1280, Math.max(360, Math.round(rect.height || 600)));
        const dataUrl = await snapshotSatellite(health.imagery, health.terrain, sat, w, h);
        if (alive) {
          setCredit(health.imagery.name);
          setUrl(dataUrl);
        }
      } catch {
        if (alive) setFailed(true);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start();
          io.disconnect();
        }
      },
      { rootMargin: "600px" }
    );
    io.observe(el);
    return () => {
      alive = false;
      io.disconnect();
    };
  }, [asset.sat]);

  if (failed) return <BrandVeil alt={asset.alt} />;

  return (
    <div ref={ref} className="absolute inset-0">
      {url ? (
        // Snapshots are data-URLs rendered client-side; next/image adds
        // nothing here (no CDN, no optimization pass) so a plain img is
        // the correct tool.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={asset.alt}
          className={`h-full w-full animate-[fade-up_0.8s_ease_both] ${imgClassName}`}
          draggable={false}
        />
      ) : (
        <div
          aria-label={asset.alt}
          role="img"
          className="h-full w-full animate-shimmer bg-gradient-to-br from-raised via-night to-raised"
        />
      )}
      {url && aerialLabel && (
        <span
          title={`Aerial imagery © ${credit}`}
          className="pointer-events-none absolute bottom-2 right-2 bg-night/55 px-2 py-0.5 text-[0.5rem] uppercase tracking-luxe text-cream/70 backdrop-blur-sm"
        >
          Aerial © {credit}
        </span>
      )}
    </div>
  );
}

function BrandVeil({ alt }: { alt: string }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className="relative h-full w-full bg-gradient-to-br from-pine/50 via-night to-raised"
    >
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: `url(${site.identity.logo.monogram})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "110px",
        }}
      />
    </div>
  );
}
