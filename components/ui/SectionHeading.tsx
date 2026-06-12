import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display-2 mt-5">{title}</h2>
      {lede && <p className="lede mt-6">{lede}</p>}
    </Reveal>
  );
}
