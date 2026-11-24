import { describe, expect, it } from "vitest";
import { contrastRatio, parseHexColor, readableTextColor, relativeLuminance } from "@/lib/color-contrast";

describe("parseHexColor", () => {
  it.each([
    ["#ffffff", [255, 255, 255]],
    ["ff8800", [255, 136, 0]],
    ["#f80", [255, 136, 0]],
    ["  #0A0B0C ", [10, 11, 12]],
  ])("reads %s", (input, expected) => {
    expect(parseHexColor(input)).toEqual(expected);
  });

  it.each(["", "red", "#ggg", "#12345", "rgb(1,2,3)", null, undefined])("rejects %s", (input) => {
    expect(parseHexColor(input as string)).toBeNull();
  });
});

describe("contrast", () => {
  it("is 21:1 for black on white and 1:1 for a colour on itself", () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5);
    expect(contrastRatio([120, 30, 200], [120, 30, 200])).toBeCloseTo(1, 5);
  });

  it("does not depend on the order", () => {
    expect(contrastRatio([10, 20, 30], [200, 210, 220])).toBe(contrastRatio([200, 210, 220], [10, 20, 30]));
  });

  it("luminance is 0 for black and 1 for white", () => {
    expect(relativeLuminance([0, 0, 0])).toBe(0);
    expect(relativeLuminance([255, 255, 255])).toBeCloseTo(1, 5);
  });
});

describe("readableTextColor", () => {
  it.each([
    ["#ffffff", "#000000"],
    ["#ffff00", "#000000"], // yellow: white would be 1.07:1
    ["#ff8800", "#000000"], // orange
    ["#000000", "#ffffff"],
    ["#1e3a8a", "#ffffff"], // dark blue
    ["#8b5cf6", "#000000"], // the brand violet: black is 5.4:1, white only 3.9:1
  ])("on %s writes in %s", (background, text) => {
    expect(readableTextColor(background)).toBe(text);
  });

  it("always reaches 4.5:1 for the primary palette tag colours", () => {
    for (const color of ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280"]) {
      const background = parseHexColor(color)!;
      const text = parseHexColor(readableTextColor(color))!;
      expect(contrastRatio(background, text), color).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("falls back to white for something that is not a colour", () => {
    expect(readableTextColor("tomato")).toBe("#ffffff");
    expect(readableTextColor(undefined)).toBe("#ffffff");
  });
});
