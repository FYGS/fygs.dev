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
        "f5b8b027",
        "6a019882",
        "6a019882",
        "6a019882",
        "6a019882",
        "6a019882",
        "a1e6ae42",
        "bcb6e382",
        "b73a422f",
        "b73a422f",
        "b73a422f",
        "b73a422f",
        "b73a422f",
        "b73a422f",
        "5ec97f80",
        "15a35f70",
        "6a019882",
        "7c91e28c",
        "ade788eb",
        "691b0f27",
        "3b3e2615",
        "71aeb096",
        "5e2322d2",
        "eef8c11b",
        "0f356d1b",
        "44e21ed5",
        "a1b4f5e6",
        "1ae931ba",
        "5e195237",
        "c006dc6b",
        "8c779ca7",
        "d7892e45",
        "93256922",
        "b926e615",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(ScreenReadersSection).hashes).toEqual(renderWalkSim(ScreenReadersSection).hashes);
  });
});
