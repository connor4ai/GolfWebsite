import { site } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";

export function Accolades() {
  const items = site.about.accolades;
  if (items.length === 0) return null;
  const quote = items.find((a) => a.quote);

  return (
    <section className="border-y hairline bg-pine/15">
      <div className="mx-auto max-w-[100rem] px-6 py-20 md:px-10">
        {quote && (
          <Reveal className="mx-auto max-w-4xl text-center">
            <p className="font-display text-2xl italic leading-relaxed text-cream md:text-[2rem]">
              “{quote.quote}”
            </p>
            <p className="eyebrow mt-6">
              {quote.source}, {quote.year}
            </p>
          </Reveal>
        )}
        <div
          className={`grid gap-px border hairline bg-line/40 ${quote ? "mt-16" : ""} sm:grid-cols-3`}
        >
          {items
            .filter((a) => !a.quote)
            .slice(0, 3)
            .map((a, i) => (
              <Reveal key={a.source} delay={i * 0.08} className="bg-night/80">
                <div className="flex h-full flex-col justify-between gap-4 px-7 py-8">
                  <p className="font-display text-lg leading-snug text-cream/90">{a.source}</p>
                  <p className="text-[0.625rem] uppercase tracking-luxe text-brass">
                    {a.kind === "award" ? "Award" : "Ranking"} · {a.year}
                  </p>
                </div>
              </Reveal>
            ))}
        </div>
      </div>
    </section>
  );
}
