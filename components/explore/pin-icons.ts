import type { MapPin, PinCategory } from "@/config/types";

/**
 * Category glyphs as 24×24 stroke paths, shared by the satellite map's HTML
 * markers and the illustrated map's SVG pins so both modes feel identical.
 */
export const ICON_PATHS: Record<PinCategory, string> = {
  golf: "M8 21V3m0 1.5h8.5L14 7.75l2.5 3.25H8",
  practice:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-5 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  dining: "M8 3v6a2 2 0 0 1-2 2v10M6 3v4m4-4v4m6-4c-1.6 2-2.2 4-2.2 6 0 2 .7 3 2.2 3v9",
  lodging: "M4 11l8-7 8 7M6.5 9.5V20h11V9.5M10 20v-5.5h4V20",
  amenity: "M12 3l2.1 6.9L21 12l-6.9 2.1L12 21l-2.1-6.9L3 12l6.9-2.1Z",
  activity: "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Zm3.5-12.5l-2 5-5 2 2-5Z",
};

const ICON_SVG = (category: PinCategory) =>
  `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="${ICON_PATHS[category]}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** Build the DOM element used as a MapLibre marker. */
export function buildPinElement(
  pin: MapPin,
  onSelect: (pin: MapPin) => void
): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "fairway-pin";
  el.dataset.category = pin.category;
  el.setAttribute("aria-label", `${pin.title} — open details`);
  el.innerHTML = `
    <span class="fairway-pin__ring">${ICON_SVG(pin.category)}</span>
    <span class="fairway-pin__stem"></span>
    <span class="fairway-pin__label">${pin.title}</span>
  `;
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onSelect(pin);
  });
  return el;
}
