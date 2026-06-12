import { site } from "@/lib/site";

/** Endless honors ribbon. Duplicated track = seamless loop. */
export function AccoladeMarquee() {
  const items = site.about.accolades.map((a) =>
    a.quote ? `“${a.quote}” — ${a.source}` : `${a.source} · ${a.year}`
  );
  if (items.length === 0) return null;
  // 4× so the 50% loop point is seamless even on ultrawide displays.
  const row = [...items, ...items, ...items, ...items];

  return (
    <section
      aria-label="Honors"
      className="overflow-hidden border-y hairline bg-pine/15 py-6"
    >
      <div className="marquee-track" style={{ "--marquee-duration": "55s" } as React.CSSProperties}>
        {row.map((text, i) => (
          <span
            key={i}
            aria-hidden={i >= items.length}
            className="flex items-center whitespace-nowrap px-6 font-display text-lg italic text-cream/85 md:text-xl"
          >
            {text}
            <span className="ml-12 text-brass" aria-hidden>
              ✦
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
