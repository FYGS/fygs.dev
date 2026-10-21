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
        "78915f73",
        "5d12d46b",
        "5d12d46b",
        "5d12d46b",
        "5d12d46b",
        "5d12d46b",
        "aee74a96",
        "f880af5e",
        "3f852db1",
        "3f852db1",
        "3f852db1",
        "3f852db1",
        "3f852db1",
        "3f852db1",
        "a63152ec",
        "2a3e15e7",
        "5d12d46b",
        "0bbb5e34",
        "af0491ad",
        "ae890513",
        "54b46723",
        "a33a26a7",
        "3e66da19",
        "51c160b6",
        "b20d5db0",
        "d49a2e11",
        "9483a2dc",
        "21363255",
        "13a80845",
        "5cefb517",
        "4707f266",
        "e5136203",
        "766f5fad",
        "5d36aafd",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(ScreenReadersSection).hashes).toEqual(renderWalkSim(ScreenReadersSection).hashes);
  });
});
