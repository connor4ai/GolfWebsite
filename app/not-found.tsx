import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgb(var(--c-primary)/0.35),rgb(var(--c-bg))_70%)]" />
      <Image
        src={site.identity.logo.crest}
        alt=""
        width={420}
        height={420}
        className="absolute -bottom-24 -right-24 opacity-[0.06]"
        priority
      />
      <div className="relative">
        <p className="eyebrow">Out of bounds</p>
        <h1 className="display-1 mt-6">Lost ball.</h1>
        <p className="lede mx-auto mt-6 max-w-xl">
          The page you were looking for isn&apos;t on the card. Take a free
          drop back at the clubhouse — no penalty.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="btn-primary">
            Return to the clubhouse
          </Link>
          <Link href="/explore" className="btn-ghost">
            Explore {site.identity.shortName}
          </Link>
        </div>
      </div>
    </div>
  );
}
