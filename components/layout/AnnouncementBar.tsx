"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

const KEY = "fairway.announcement.dismissed";

export function AnnouncementBar() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const immersive =
    pathname === "/explore" || /^\/course\/[^/]+\/holes/.test(pathname);
  if (!site.announcement.enabled || dismissed || immersive) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="no-print relative z-[60] border-b border-brass/30 bg-pine/30 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[100rem] items-center justify-center gap-4 px-12 py-2 text-center">
        <p className="font-body text-[0.6875rem] tracking-wide2 text-cream/90 md:text-xs">
          {site.announcement.text}
          {site.announcement.href && (
            <>
              {" "}
              <Link
                href={site.announcement.href}
                className="text-brass underline decoration-brass/40 underline-offset-4 transition-colors hover:decoration-brass"
              >
                {site.announcement.linkLabel ?? "Learn more"}
              </Link>
            </>
          )}
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-mist transition-colors hover:text-cream"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
