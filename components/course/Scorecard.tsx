"use client";

import type { CourseInfo } from "@/config/types";

/**
 * Full scorecard: front nine / back nine / totals for every tee, plus par
 * and stroke index. Horizontal-scrolls on small screens and carries a
 * dedicated print stylesheet (see globals.css `.print-card`).
 */
export function Scorecard({ course }: { course: CourseInfo }) {
  const holes = course.holes;
  const front = holes.filter((h) => h.number <= 9);
  const back = holes.filter((h) => h.number > 9);
  const hasBack = back.length > 0;

  const sum = (hs: typeof holes, f: (h: (typeof holes)[number]) => number) =>
    hs.reduce((s, h) => s + f(h), 0);

  const headCell =
    "px-2.5 py-2 text-center font-body text-[0.625rem] uppercase tracking-wider text-mist";
  const numCell = "px-2.5 py-2 text-center font-body text-sm tabular-nums";
  const totalCell = `${numCell} font-semibold bg-pine/20`;

  const teeRow = (teeId: string) => {
    const tee = course.teeBoxes.find((t) => t.id === teeId)!;
    const rating = course.ratings.find((r) => r.teeId === teeId);
    return (
      <tr key={teeId} className="border-t hairline">
        <th scope="row" className="sticky left-0 bg-raised px-3 py-2 text-left">
          <span className="flex items-center gap-2 whitespace-nowrap font-body text-sm text-cream">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: tee.color }}
              aria-hidden
            />
            {tee.name}
            {rating && (
              <span className="ml-1 text-[0.625rem] text-mist">
                {rating.rating} / {rating.slope}
              </span>
            )}
          </span>
        </th>
        {front.map((h) => (
          <td key={h.number} className={`${numCell} text-cream/85`}>
            {h.yardages[teeId] ?? "—"}
          </td>
        ))}
        <td className={`${totalCell} text-cream`}>
          {sum(front, (h) => h.yardages[teeId] ?? 0)}
        </td>
        {hasBack && (
          <>
            {back.map((h) => (
              <td key={h.number} className={`${numCell} text-cream/85`}>
                {h.yardages[teeId] ?? "—"}
              </td>
            ))}
            <td className={`${totalCell} text-cream`}>
              {sum(back, (h) => h.yardages[teeId] ?? 0)}
            </td>
            <td className={`${totalCell} text-brass`}>
              {sum(holes, (h) => h.yardages[teeId] ?? 0)}
            </td>
          </>
        )}
      </tr>
    );
  };

  return (
    <div id="scorecard" className="scroll-mt-28">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h3 className="font-display text-2xl text-cream">Scorecard</h3>
        <button type="button" onClick={() => window.print()} className="btn-ghost no-print !px-4 !py-2">
          Print scorecard
        </button>
      </div>
      <div className="print-card overflow-x-auto border hairline bg-raised/60">
        <table className="w-full min-w-[64rem] border-collapse">
          <caption className="sr-only">
            {course.name} scorecard: yardage by tee, par, and handicap for all{" "}
            {holes.length} holes
          </caption>
          <thead>
            <tr className="border-b hairline bg-pine/20">
              <th scope="col" className="sticky left-0 bg-raised px-3 py-2 text-left font-body text-[0.625rem] uppercase tracking-luxe text-mist">
                Hole
              </th>
              {front.map((h) => (
                <th key={h.number} scope="col" className={headCell}>
                  {h.number}
                </th>
              ))}
              <th scope="col" className={`${headCell} text-brass`}>
                Out
              </th>
              {hasBack && (
                <>
                  {back.map((h) => (
                    <th key={h.number} scope="col" className={headCell}>
                      {h.number}
                    </th>
                  ))}
                  <th scope="col" className={`${headCell} text-brass`}>
                    In
                  </th>
                  <th scope="col" className={`${headCell} text-brass`}>
                    Tot
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {course.teeBoxes.map((t) => teeRow(t.id))}
            <tr className="border-t-2 border-brass/40">
              <th scope="row" className="sticky left-0 bg-raised px-3 py-2 text-left font-body text-sm text-brass">
                Par
              </th>
              {front.map((h) => (
                <td key={h.number} className={`${numCell} text-brass`}>
                  {h.par}
                </td>
              ))}
              <td className={`${totalCell} text-brass`}>{sum(front, (h) => h.par)}</td>
              {hasBack && (
                <>
                  {back.map((h) => (
                    <td key={h.number} className={`${numCell} text-brass`}>
                      {h.par}
                    </td>
                  ))}
                  <td className={`${totalCell} text-brass`}>{sum(back, (h) => h.par)}</td>
                  <td className={`${totalCell} text-brass`}>{sum(holes, (h) => h.par)}</td>
                </>
              )}
            </tr>
            <tr className="border-t hairline">
              <th scope="row" className="sticky left-0 bg-raised px-3 py-2 text-left font-body text-sm text-mist">
                Handicap
              </th>
              {front.map((h) => (
                <td key={h.number} className={`${numCell} text-mist`}>
                  {h.handicap}
                </td>
              ))}
              <td className={totalCell} />
              {hasBack && (
                <>
                  {back.map((h) => (
                    <td key={h.number} className={`${numCell} text-mist`}>
                      {h.handicap}
                    </td>
                  ))}
                  <td className={totalCell} />
                  <td className={totalCell} />
                </>
              )}
            </tr>
          </tbody>
        </table>
      </div>
      {course.ratings.length > 0 && (
      <p className="mt-3 text-[0.6875rem] leading-relaxed text-mist">
        {course.ratings
          .map((r) => {
            const tee = course.teeBoxes.find((t) => t.id === r.teeId);
            return `${tee?.name ?? r.teeId}: ${r.yards.toLocaleString()} yds · ${r.rating} / ${r.slope}`;
          })
          .join("   ·   ")}
      </p>
      )}
    </div>
  );
}
