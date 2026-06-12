import type { Metadata } from "next";
import { site, formatUSD } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Rates & Membership",
  description: `Green fees, seasonal rates${site.flags.hasMembership ? ", and membership" : ""} at ${site.identity.courseName}.`,
};

export default function RatesPage() {
  const { rates, flags, booking } = site;
  const membership = flags.hasMembership ? rates.membership : undefined;

  return (
    <>
      <section className="mx-auto max-w-editorial px-6 pb-16 pt-44 md:px-10">
        <SectionHeading eyebrow="Green fees" title="Rates" lede={rates.intro} />
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

        <Reveal className="text-center">
          <a
            href={booking.teeTimeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Book a tee time
          </a>
        </Reveal>
      </section>

      {membership && (
        <section className="border-t hairline bg-raised/30">
          <div className="mx-auto max-w-[100rem] px-6 py-24 md:px-10">
            <SectionHeading
              eyebrow="Membership"
              title={membership.headline}
              lede={membership.intro}
              align="center"
            />
            <div className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-3">
              {membership.tiers.map((tier, i) => (
                <Reveal key={tier.name} delay={i * 0.08}>
                  <div className="flex h-full flex-col border hairline bg-night p-8">
                    <h3 className="font-display text-2xl text-cream">{tier.name}</h3>
                    <p className="mt-2 font-body text-sm text-mist">{tier.blurb}</p>
                    <div className="mt-6 flex items-baseline gap-4 border-y hairline py-5">
                      <div>
                        <p className="font-display text-3xl text-brass">
                          {formatUSD(tier.initiation)}
                        </p>
                        <p className="text-[0.625rem] uppercase tracking-luxe text-mist">
                          Initiation
                        </p>
                      </div>
                      <div>
                        <p className="font-display text-3xl text-cream">
                          {formatUSD(tier.duesMonthly)}
                        </p>
                        <p className="text-[0.625rem] uppercase tracking-luxe text-mist">
                          Monthly dues
                        </p>
                      </div>
                    </div>
                    <ul className="mt-6 space-y-2.5">
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
                </Reveal>
              ))}
            </div>
            <Reveal className="mx-auto mt-12 max-w-2xl text-center">
              <p className="font-body text-sm leading-relaxed text-mist">
                {membership.contactNote}
              </p>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
