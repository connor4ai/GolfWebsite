import type { Metadata } from "next";
import { site } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactMap } from "@/components/contact/ContactMap";

export const metadata: Metadata = {
  title: "Contact",
  description: `Reach ${site.identity.courseName}: ${site.booking.phone}${site.booking.email ? ` · ${site.booking.email}` : ""}`,
};

export default function ContactPage({
  searchParams,
}: {
  searchParams: { topic?: string };
}) {
  const { booking, location } = site;
  return (
    <>
      <section className="mx-auto max-w-[100rem] px-6 pb-24 pt-44 md:px-10">
        <SectionHeading
          eyebrow="Contact"
          title="Talk to a human on a mountain"
          lede="Tee times, stays, celebrations, or directions for the scenic way up — write to us or call the front desk."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.15fr_1fr]">
          <Reveal>
            <ContactForm initialTopic={searchParams.topic} />
          </Reveal>

          <div className="flex flex-col gap-8">
            <Reveal delay={0.08}>
              <div className="grid gap-6 border hairline bg-raised/40 p-7 sm:grid-cols-2">
                <div>
                  <p className="eyebrow">Call</p>
                  <a
                    href={booking.phoneHref}
                    className="mt-2 block font-display text-xl text-cream transition-colors hover:text-brass"
                  >
                    {booking.phone}
                  </a>
                </div>
                {booking.email ? (
                  <div>
                    <p className="eyebrow">Write</p>
                    <a
                      href={`mailto:${booking.email}`}
                      className="mt-2 block break-all font-display text-xl text-cream transition-colors hover:text-brass"
                    >
                      {booking.email}
                    </a>
                  </div>
                ) : (
                  <div>
                    <p className="eyebrow">Office hours</p>
                    <p className="mt-2 font-display text-xl text-cream">
                      The club office returns every call
                    </p>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <p className="eyebrow">Visit</p>
                  <address className="mt-2 font-body text-sm not-italic leading-relaxed text-mist">
                    {location.address.line1}, {location.address.city},{" "}
                    {location.address.region} {location.address.postalCode}
                  </address>
                  {booking.bookingNote && (
                    <p className="mt-3 border-l-2 border-brass/50 pl-4 text-sm italic text-mist">
                      {booking.bookingNote}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.14} className="flex-1">
              <ContactMap />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
