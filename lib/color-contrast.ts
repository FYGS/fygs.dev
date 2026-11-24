/**
 * Readable text on a background chosen by someone else (a tag colour typed by an admin...).
 * Contrast follows WCAG 2.x: ratio = (L1 + 0.05) / (L2 + 0.05) on the relative luminance, 4.5:1 for normal text.
 */

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** "#fff" / "ff8800" -> [255, 255, 255] ; null when it is not a colour we can read */
export function parseHexColor(input: string | null | undefined): [number, number, number] | null {
  const match = HEX.exec((input ?? "").trim());
  if (!match) return null;
  const hex = match[1].length === 3 ? [...match[1]].map((c) => c + c).join("") : match[1];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

/** The design tokens are written as "239 84% 65%" (shadcn style): hue, saturation %, lightness % -> [r, g, b] */
export function parseHslTriplet(input: string | null | undefined): [number, number, number] | null {
  const match = /^\s*(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s*$/.exec(input ?? "");
  if (!match) return null;
  const h = ((Number(match[1]) % 360) + 360) % 360;
  const sat = Number(match[2]) / 100;
  const light = Number(match[3]) / 100;
  const chroma = (1 - Math.abs(2 * light - 1)) * sat;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - chroma / 2;
  const [r, g, b] =
    h < 60 ? [chroma, x, 0] : h < 120 ? [x, chroma, 0] : h < 180 ? [0, chroma, x] : h < 240 ? [0, x, chroma] : h < 300 ? [x, 0, chroma] : [chroma, 0, x];
  return [r, g, b].map((channel) => Math.round((channel + m) * 255)) as [number, number, number];
}

export function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const BLACK: [number, number, number] = [0, 0, 0];
const WHITE: [number, number, number] = [255, 255, 255];

/** Black or white, whichever reads better on `background`; white when the colour is unreadable. */
export function readableTextColor(background: string | null | undefined): "#000000" | "#ffffff" {
  const rgb = parseHexColor(background);
  if (!rgb) return "#ffffff";
  return contrastRatio(rgb, BLACK) >= contrastRatio(rgb, WHITE) ? "#000000" : "#ffffff";
}
