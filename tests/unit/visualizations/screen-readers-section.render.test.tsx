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
        "a3dd40ea",
        "4fc72918",
        "4fc72918",
        "4fc72918",
        "4fc72918",
        "4fc72918",
        "75ff6599",
        "ccaba0f6",
        "ad344b66",
        "ad344b66",
        "ad344b66",
        "ad344b66",
        "ad344b66",
        "ad344b66",
        "f4ea9c44",
        "0950fa4b",
        "4fc72918",
        "e0b3338e",
        "c9427e4c",
        "4164efa5",
        "5845c2ce",
        "22bef902",
        "c21fd455",
        "4ae37623",
        "9373e5b8",
        "8265510d",
        "200c6905",
        "676143d1",
        "8deee77a",
        "9948c052",
        "d2733023",
        "a127224d",
        "46005981",
        "11e94f85",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(ScreenReadersSection).hashes).toEqual(renderWalkSim(ScreenReadersSection).hashes);
  });
});
