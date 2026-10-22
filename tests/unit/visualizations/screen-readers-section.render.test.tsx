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
        "5f055ae1",
        "28b2b8fa",
        "28b2b8fa",
        "28b2b8fa",
        "28b2b8fa",
        "28b2b8fa",
        "d5a3502a",
        "91e0560f",
        "f8e2a6c9",
        "f8e2a6c9",
        "f8e2a6c9",
        "f8e2a6c9",
        "f8e2a6c9",
        "f8e2a6c9",
        "0066470d",
        "34e51c43",
        "28b2b8fa",
        "1cb74f0f",
        "814ed9da",
        "51830243",
        "ec63ebf1",
        "ea8853cf",
        "2ac8a28f",
        "90853759",
        "7de8351d",
        "037a279d",
        "60d1c9b2",
        "f6a6430a",
        "58e99d00",
        "cfc662d5",
        "d6b7e46a",
        "bd53df3a",
        "a1217a38",
        "3670b2b2",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(ScreenReadersSection).hashes).toEqual(renderWalkSim(ScreenReadersSection).hashes);
  });
});
