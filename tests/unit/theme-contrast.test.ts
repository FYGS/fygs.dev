import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio, parseHslTriplet } from "@/lib/color-contrast";

/**
 * WCAG 1.4.3: normal text needs 4.5:1 against its background. The design tokens are what every
 * `text-foreground`, `text-muted-foreground`, `bg-primary text-primary-foreground`... resolves to, so the
 * pairs that are meant to be read together are checked here, in both themes, once for all the pages.
 */
const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf-8");

function tokens(blockPattern: RegExp): Record<string, string> {
  const block = blockPattern.exec(css)?.[1];
  if (!block) throw new Error(`theme block not found: ${blockPattern}`);
  return Object.fromEntries([...block.matchAll(/--([a-z-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.replace(/\/\*.*?\*\//g, "").trim()]));
}

const themes = {
  dark: tokens(/:root,\s*\.dark\s*\{([^}]+)\}/s),
  light: tokens(/\.light\s*\{([^}]+)\}/s),
};

// [text token, surface token]
const PAIRS: Array<[string, string]> = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["muted-foreground", "background"],
  ["muted-foreground", "card"],
  ["muted-foreground", "muted"],
  ["muted-foreground", "secondary"],
  ["muted-foreground", "accent"],
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["accent-foreground", "accent"],
  ["destructive-foreground", "destructive-solid"], // a destructive button or badge
  ["destructive", "background"], // an error message, `text-destructive`
  ["destructive", "card"],
  ["primary-text", "background"],
  ["primary-text", "card"],
  ["primary-text", "muted"],
];

describe.each(Object.entries(themes))("%s theme", (_name, theme) => {
  it.each(PAIRS)("%s on %s reaches 4.5:1", (text, surface) => {
    const fg = parseHslTriplet(theme[text]);
    const bg = parseHslTriplet(theme[surface]);
    expect(fg, `--${text} is not an hsl triplet: ${theme[text]}`).not.toBeNull();
    expect(bg, `--${surface} is not an hsl triplet: ${theme[surface]}`).not.toBeNull();

    expect(contrastRatio(fg!, bg!), `--${text} (${theme[text]}) on --${surface} (${theme[surface]})`).toBeGreaterThanOrEqual(4.5);
  });
});
