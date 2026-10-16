import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ScreenReadersSection } from "@/app/[locale]/(main)/tech-mastry/frontend/accessibility/_components/sections/screen-readers-section";
import { renderWalkSim } from "./render-walk-sim";

beforeEach(() => {
  // the code examples have a "copy" button
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  });
  // the aria-live demo prints the current time: pin it, whatever the machine locale
  vi.spyOn(Date.prototype, "toLocaleTimeString").mockReturnValue("12:00:00");
});
afterEach(() => vi.restoreAllMocks());

describe("ScreenReadersSection rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(ScreenReadersSection, { passes: 2 });
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "01469ded",
        "b847d937",
        "b847d937",
        "b847d937",
        "b847d937",
        "b847d937",
        "32d6f2cc",
        "a6abb52e",
        "ed31d4e4",
        "ed31d4e4",
        "ed31d4e4",
        "ed31d4e4",
        "ed31d4e4",
        "ed31d4e4",
        "1e3ed19f",
        "43999f4e",
        "b847d937",
        "2a4aec5a",
        "690aa3d8",
        "01f016fa",
        "b6340d1b",
        "beeb3391",
        "a58e953a",
        "0af09813",
        "d0e6859e",
        "1dd9c06e",
        "7dcfd739",
        "0efe472b",
        "0ffd38ac",
        "5ad91463",
        "c49ee435",
        "ef8a7044",
        "6efa68d8",
        "e1dd072e",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(ScreenReadersSection).hashes).toEqual(renderWalkSim(ScreenReadersSection).hashes);
  });
});
