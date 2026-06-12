"use client";

/** Segmented Satellite / Illustrated control. */
export function ModeToggle({
  mode,
  satelliteAvailable,
  onChange,
  className = "",
}: {
  mode: "satellite" | "illustrated";
  satelliteAvailable: boolean;
  onChange: (m: "satellite" | "illustrated") => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Map rendering mode"
      className={`flex border border-line/70 bg-night/60 backdrop-blur-md ${className}`}
    >
      {(
        [
          ["satellite", "Satellite"],
          ["illustrated", "Illustrated"],
        ] as const
      ).map(([value, label]) => {
        const disabled = value === "satellite" && !satelliteAvailable;
        return (
          <button
            key={value}
            type="button"
            disabled={disabled}
            aria-pressed={mode === value}
            title={
              disabled ? "Satellite imagery is unreachable right now" : undefined
            }
            onClick={() => onChange(value)}
            className={`px-4 py-2.5 text-[0.625rem] uppercase tracking-luxe transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-35 ${
              mode === value
                ? "bg-brass/15 text-brass"
                : "text-mist hover:text-cream"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
