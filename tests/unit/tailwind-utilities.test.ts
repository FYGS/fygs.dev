/**
 * Compiles the real app/globals.css with Tailwind and checks that the sizing
 * utilities every dialog/card relies on still have their standard values.
 *
 * Why: in Tailwind v4 the --spacing-* theme namespace also feeds w-*, h-* and
 * max-w-*. Declaring --spacing-md inside @theme silently turned max-w-md into
 * 1rem and collapsed modals site-wide, and nothing else caught it.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";

let css = "";

beforeAll(async () => {
  const from = resolve(process.cwd(), "app/globals.css");
  const source = readFileSync(from, "utf-8");
  const result = await postcss([tailwindcss({ base: process.cwd() })]).process(
    source,
    { from },
  );
  css = result.css.replace(/\s+/g, " ");
}, 120_000);

function rule(selector: string): string {
  const escaped = selector.replace(/[.:\\/\[\]]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped} ?\\{([^}]*)\\}`));
  return match ? match[1].trim() : "";
}

describe("Tailwind sizing utilities", () => {
  it.each([
    ["max-w-sm", "24rem"],
    ["max-w-md", "28rem"],
    ["max-w-lg", "32rem"],
    ["max-w-xl", "36rem"],
    ["max-w-2xl", "42rem"],
    ["max-w-3xl", "48rem"],
    ["max-w-4xl", "56rem"],
  ])("%s resolves to the container scale (%s), not to a spacing token", (name, size) => {
    const declaration = rule(`.${name}`);
    expect(declaration).toContain("max-width");
    expect(declaration).not.toMatch(/--spacing-(xs|sm|md|lg|xl|2xl|3xl|4xl)/);
    expect(declaration).toMatch(new RegExp(`(--container-[a-z0-9]+|${size.replace(".", "\\.")})`));
  });

  it("keeps the design-system spacing scale available as plain variables", () => {
    for (const token of ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"]) {
      expect(css).toContain(`--spacing-${token}:`);
    }
  });
});
