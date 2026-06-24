/**
 * Design Tokens Validation Tests
 *
 * Ensures CSS custom properties (design tokens) remain consistent
 * and that both dark and light themes define all required variables.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const globalsCss = readFileSync(
  resolve(process.cwd(), "app/globals.css"),
  "utf-8",
);

describe("Design Tokens", () => {
  describe("Color tokens", () => {
    const requiredTokens = [
      "--background",
      "--foreground",
      "--muted",
      "--muted-foreground",
      "--popover",
      "--popover-foreground",
      "--card",
      "--card-foreground",
      "--border",
      "--input",
      "--primary",
      "--primary-foreground",
      "--secondary",
      "--secondary-foreground",
      "--accent",
      "--accent-foreground",
      "--destructive",
      "--destructive-foreground",
      "--ring",
      "--radius",
      "--success",
      "--success-foreground",
      "--warning",
      "--warning-foreground",
      "--info",
      "--info-foreground",
      "--chart-1",
      "--chart-2",
      "--chart-3",
      "--chart-4",
      "--chart-5",
    ];

    it("dark theme defines all required color tokens", () => {
      // Extract the :root/.dark block
      const darkMatch = globalsCss.match(/:root,\s*\.dark\s*\{([^}]+)\}/s);
      expect(darkMatch).not.toBeNull();
      const darkBlock = darkMatch![1];

      for (const token of requiredTokens) {
        expect(
          darkBlock.includes(token + ":"),
          `Dark theme missing token: ${token}`,
        ).toBe(true);
      }
    });

    it("light theme defines all required color tokens", () => {
      // Extract the .light block
      const lightMatch = globalsCss.match(/\.light\s*\{([^}]+)\}/s);
      expect(lightMatch).not.toBeNull();
      const lightBlock = lightMatch![1];

      for (const token of requiredTokens) {
        expect(
          lightBlock.includes(token + ":"),
          `Light theme missing token: ${token}`,
        ).toBe(true);
      }
    });

    it("primary color uses indigo hue (230-250 range)", () => {
      const primaryMatch = globalsCss.match(
        /:root,\s*\.dark\s*\{[^}]*--primary:\s*(\d+)/s,
      );
      expect(primaryMatch).not.toBeNull();
      const hue = parseInt(primaryMatch![1]);
      expect(hue).toBeGreaterThanOrEqual(230);
      expect(hue).toBeLessThanOrEqual(250);
    });
  });

  describe("Spacing tokens", () => {
    const spacingTokens = [
      "--spacing-xs",
      "--spacing-sm",
      "--spacing-md",
      "--spacing-lg",
      "--spacing-xl",
      "--spacing-2xl",
      "--spacing-3xl",
      "--spacing-4xl",
    ];

    it("defines all spacing scale tokens", () => {
      for (const token of spacingTokens) {
        expect(
          globalsCss.includes(token + ":"),
          `Missing spacing token: ${token}`,
        ).toBe(true);
      }
    });

    it("spacing scale is in ascending order (rem values)", () => {
      const values: number[] = [];
      for (const token of spacingTokens) {
        const match = globalsCss.match(
          new RegExp(`${token.replace("--", "\\-\\-")}:\\s*([\\d.]+)rem`),
        );
        expect(match, `Could not parse value for ${token}`).not.toBeNull();
        values.push(parseFloat(match![1]));
      }

      for (let i = 1; i < values.length; i++) {
        expect(
          values[i],
          `Spacing ${spacingTokens[i]} (${values[i]}rem) should be > ${spacingTokens[i - 1]} (${values[i - 1]}rem)`,
        ).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  describe("Motion tokens", () => {
    const motionTokens = [
      "--duration-fast",
      "--duration-normal",
      "--duration-slow",
      "--duration-slower",
      "--ease-default",
      "--ease-in",
      "--ease-out",
      "--ease-bounce",
    ];

    it("defines all motion tokens", () => {
      for (const token of motionTokens) {
        expect(
          globalsCss.includes(token + ":"),
          `Missing motion token: ${token}`,
        ).toBe(true);
      }
    });

    it("duration values are in ascending order", () => {
      const durationTokens = [
        "--duration-fast",
        "--duration-normal",
        "--duration-slow",
        "--duration-slower",
      ];
      const values: number[] = [];

      for (const token of durationTokens) {
        const match = globalsCss.match(
          new RegExp(`${token.replace("--", "\\-\\-")}:\\s*(\\d+)ms`),
        );
        expect(match, `Could not parse duration for ${token}`).not.toBeNull();
        values.push(parseInt(match![1]));
      }

      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  describe("Typography utilities", () => {
    const typographyUtilities = [
      "text-display",
      "text-heading-1",
      "text-heading-2",
      "text-heading-3",
      "text-body-lg",
      "text-body",
      "text-body-sm",
      "text-caption",
    ];

    it("defines all typography scale utilities", () => {
      for (const util of typographyUtilities) {
        expect(
          globalsCss.includes(`@utility ${util}`),
          `Missing typography utility: ${util}`,
        ).toBe(true);
      }
    });
  });

  describe("Radius tokens", () => {
    it("defines radius scale (sm, md, lg, xl)", () => {
      expect(globalsCss).toContain("--radius-sm:");
      expect(globalsCss).toContain("--radius-md:");
      expect(globalsCss).toContain("--radius-lg:");
      expect(globalsCss).toContain("--radius-xl:");
    });
  });

  describe("Font families", () => {
    it("defines sans, mono, and caption font families", () => {
      expect(globalsCss).toContain("--font-sans:");
      expect(globalsCss).toContain("--font-mono:");
      expect(globalsCss).toContain("--font-caption:");
    });
  });
});
