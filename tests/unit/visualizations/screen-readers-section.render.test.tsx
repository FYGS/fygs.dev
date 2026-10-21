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
        "021a7ab8",
        "c77d7d61",
        "c77d7d61",
        "c77d7d61",
        "c77d7d61",
        "c77d7d61",
        "353475c7",
        "10de1e6d",
        "3230f493",
        "3230f493",
        "3230f493",
        "3230f493",
        "3230f493",
        "3230f493",
        "a03746ec",
        "0cc723ae",
        "c77d7d61",
        "b0ee5584",
        "1a29c0f5",
        "d8bb6779",
        "9e9d3f29",
        "2d824bad",
        "cad948cf",
        "27f295dc",
        "1c42febb",
        "d2da21fd",
        "7f044cbc",
        "e0163e02",
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
