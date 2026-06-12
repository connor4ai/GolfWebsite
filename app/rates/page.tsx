import type { Metadata } from "next";
import Link from "next/link";
import { site, formatUSD, bookingCta } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const isPrivate = site.flags.courseAccess === "private";

export const metadata: Metadata = {
  title: isPrivate ? "Membership" : "Rates & Membership",
  description: isPrivate
    ? `Membership and access at ${site.identity.courseName}.`
    : `Green fees, seasonal rates${site.flags.hasMembership ? ", and membership" : ""} at ${site.identity.courseName}.`,
};

export default function RatesPage() {
  const { rates, flags } = site;
  const membership = flags.hasMembership ? rates.membership : undefined;
  const cta = bookingCta();

  return (
    <>
      <section className="mx-auto max-w-editorial px-6 pb-16 pt-44 md:px-10">
        <SectionHeading
          eyebrow={isPrivate ? "A private club" : "Green fees"}
          title={isPrivate ? "Membership & access" : "Rates"}
          lede={rates.intro}
        />
      </section>

      <section className="mx-auto max-w-editorial space-y-14 px-6 pb-20 md:px-10">
        {rates.tables.map((table, ti) => (
          <Reveal key={table.title} delay={ti * 0.08}>
            <div className="border hairline bg-raised/50">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b hairline px-7 py-5">
                <h2 className="font-display text-2xl text-cream">{table.title}</h2>
                {table.note && <p className="text-xs text-mist">{table.note}</p>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[40rem] border-collapse">
                  <thead>
                    <tr className="border-b hairline text-left">
                      <th scope="col" className="px-7 py-3 font-body text-[0.625rem] uppercase tracking-luxe text-mist">
                        Season
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-body text-[0.625rem] uppercase tracking-luxe text-mist">
                        Weekday
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-body text-[0.625rem] uppercase tracking-luxe text-mist">
                        Weekend
                      </th>
                      <th scope="col" className="px-7 py-3 text-right font-body text-[0.625rem] uppercase tracking-luxe text-mist">
                        Twilight
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row) => (
                      <tr key={row.season} className="border-b hairline last:border-0">
                        <td className="px-7 py-4">
                          <p className="font-display text-lg text-cream">{row.season}</p>
                          <p className="mt-0.5 text-xs text-mist">{row.dates}</p>
                          {row.includes && (
                            <p className="mt-1 text-xs text-brass">{row.includes}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right font-display text-xl text-cream tabular-nums">
                          {formatUSD(row.weekday)}
                        </td>
                        <td className="px-4 py-4 text-right font-display text-xl text-cream tabular-nums">
                          {formatUSD(row.weekend)}
                        </td>
                        <td className="px-7 py-4 text-right font-display text-xl text-brass tabular-nums">
                          {formatUSD(row.twilight)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        ))}

        {/* Membership (lead position for private clubs) */}
        {membership && (
          <Reveal>
            <div className="border border-brass/40 bg-pine/10 p-8 md:p-12">
              <p className="eyebrow">{membership.headline}</p>
              <p className="mt-6 max-w-3xl font-display text-xl leading-relaxed text-cream md:text-2xl">
                {membership.intro}
              </p>
              {membership.tiers.length > 0 && (
                <div className="mt-10 grid gap-6 md:grid-cols-3">
                  {membership.tiers.map((tier) => (
                    <div key={tier.name} className="flex h-full flex-col border hairline bg-night p-7">
                      <h3 className="font-display text-2xl text-cream">{tier.name}</h3>
                      <p className="mt-2 font-body text-sm text-mist">{tier.blurb}</p>
                      <div className="mt-5 flex items-baseline gap-4 border-y hairline py-4">
                        <div>
                          <p className="font-display text-2xl text-brass">
                            {formatUSD(tier.initiation)}
                          </p>
                          <p className="text-[0.625rem] uppercase tracking-luxe text-mist">
                            Initiation
                          </p>
                        </div>
                        <div>
                          <p className="font-display text-2xl text-cream">
                            {formatUSD(tier.duesMonthly)}
                          </p>
                          <p className="text-[0.625rem] uppercase tracking-luxe text-mist">
                            Monthly
                          </p>
                        </div>
                      </div>
                      <ul className="mt-5 space-y-2">
                        {tier.perks.map((perk) => (
                          <li key={perk} className="flex gap-3 font-body text-sm leading-relaxed text-mist">
                            <span className="mt-0.5 text-brass" aria-hidden>
                              —
                            </span>
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-10 flex flex-wrap items-center gap-6">
                {cta.external ? (
                  <a href={cta.href} target="_blank" rel="noopener noreferrer" className="btn-primary">
                    {cta.label}
                  </a>
                ) : (
                  <Link href={cta.href} className="btn-primary">
                    {cta.label}
                  </Link>
                )}
                <p className="max-w-md font-body text-sm leading-relaxed text-mist">
                  {membership.contactNote}
                </p>
              </div>
            </div>
          </Reveal>
        )}

        {/* On-property lodging rates */}
        {rates.lodgingRates && rates.lodgingRates.length > 0 && (
          <Reveal>
            <div className="border hairline bg-raised/50">
              <div className="border-b hairline px-7 py-5">
                <h2 className="font-display text-2xl text-cream">Staying inside the gates</h2>
              </div>
              <ul className="divide-y divide-line/50">
                {rates.lodgingRates.map((row) => (
                  <li
                    key={row.name}
                    className="flex flex-wrap items-baseline justify-between gap-3 px-7 py-5"
                  >
                    <div>
                      <p className="font-display text-xl text-cream">{row.name}</p>
                      {row.note && <p className="mt-1 text-sm text-mist">{row.note}</p>}
                    </div>
                    <p className="font-display text-xl text-brass">{row.rate}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        {rates.notes.length > 0 && (
          <Reveal>
            <ul className="grid gap-3 border hairline bg-pine/10 p-7 md:grid-cols-2">
              {rates.notes.map((note) => (
                <li key={note} className="flex gap-3 font-body text-sm leading-relaxed text-mist">
                  <span className="mt-0.5 text-brass" aria-hidden>
                    ·
                  </span>
                  {note}
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {!isPrivate && (
          <Reveal className="text-center">
            {cta.external ? (
              <a href={cta.href} target="_blank" rel="noopener noreferrer" className="btn-primary">
                {cta.label}
              </a>
            ) : (
              <Link href={cta.href} className="btn-primary">
                {cta.label}
              </Link>
            )}
          </Reveal>
        )}
      </section>
    </>
  );
}
