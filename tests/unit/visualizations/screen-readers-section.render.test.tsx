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
        "1b180709",
        "d46876d7",
        "d46876d7",
        "d46876d7",
        "d46876d7",
        "d46876d7",
        "56fe7032",
        "2891f708",
        "772b1baa",
        "772b1baa",
        "772b1baa",
        "772b1baa",
        "772b1baa",
        "772b1baa",
        "f514f778",
        "a58be116",
        "d46876d7",
        "bc9d6da6",
        "a3c658b0",
        "01732f57",
        "4a843f9a",
        "b39a8cde",
        "c4a72596",
        "5e96a9f2",
        "1cd0c4d0",
        "66119151",
        "42ce48c2",
        "2592b181",
        "d016ef31",
        "4bcbaabf",
        "2f5fa5b8",
        "5656275e",
        "45a8994c",
        "0c9ff003",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(ScreenReadersSection).hashes).toEqual(renderWalkSim(ScreenReadersSection).hashes);
  });
});
