import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

/** Banner selling the flagship explore-map experience. */
export function ExploreTeaser() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-[100rem] px-6 py-10 md:px-10">
        <Link
          href="/explore"
          className="group relative block overflow-hidden border hairline"
        >
          <div className="relative aspect-[16/10] md:aspect-[21/8]">
            <Image
              src="/images/scenes/hero-explore.svg"
              alt="A bird's-eye view of the property rendered as layered ridgelines"
              fill
              sizes="100vw"
              className="object-cover transition-transform duration-[1200ms] ease-luxe group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-night/90 via-night/40 to-transparent" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16">
            <Reveal>
              <p className="eyebrow">The property, from above</p>
              <h2 className="display-2 mt-5 max-w-xl">
                {site.propertyMap.entry.headline}, in three dimensions
              </h2>
              <p className="mt-5 max-w-lg font-body text-sm leading-relaxed text-mist md:text-base">
                {site.propertyMap.entry.subcopy}
              </p>
              <span className="btn-primary mt-8 inline-flex w-fit">
                {site.propertyMap.entry.cta}
              </span>
            </Reveal>
          </div>
        </Link>
      </div>
    </section>
  );
}
