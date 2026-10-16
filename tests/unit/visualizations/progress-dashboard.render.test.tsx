import { createHash } from "crypto";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup, act } from "@testing-library/react";
// the mock data is built at import time from Date.now(): freeze the clock before importing it
vi.hoisted(() => {
  vi.useFakeTimers({ now: new Date("2025-01-01T12:00:00Z") });
});
import { ProgressDashboard } from "@/app/[locale]/(main)/tech-mastry/dashboard/_components/progress-dashboard";

const progress = { challengesCompleted: ["a", "b", "c"] };
const getStreakDays = () => 3;
vi.mock("@/app/[locale]/(main)/tech-mastry/_hooks/use-progress", () => ({
  useProgress: () => ({ progress, isLoaded: true, getStreakDays }),
}));
vi.mock("@/providers/theme-provider", () => ({
  useTheme: () => ({ resolvedTheme: "light", theme: "light", setTheme: () => {} }),
}));

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2025-01-01T12:00:00Z") });
  // dates are rendered with the machine locale: pin them
  vi.spyOn(Date.prototype, "toLocaleDateString").mockImplementation(function (this: Date) {
    return this.toISOString().slice(0, 10);
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

async function walk() {
  vi.restoreAllMocks();
  vi.spyOn(Date.prototype, "toLocaleDateString").mockImplementation(function (this: Date) {
    return this.toISOString().slice(0, 10);
  });
  // the streak calendar draws random activity: seed it
  let seed = 123456789;
  vi.spyOn(Math, "random").mockImplementation(() => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  });
  vi.setSystemTime(new Date("2025-01-01T12:00:00Z"));
  const { container } = render(<ProgressDashboard />);
  const hash = () =>
    createHash("md5")
      .update(container.innerHTML.replace(/_r_[0-9a-z]+_/g, "_r_X_").replace(/<svg[\s\S]*?<\/svg>/g, "<svg/>"))
      .digest("hex")
      .slice(0, 8);
  const hashes = [hash()]; // loading skeleton
  await act(async () => {
    await vi.advanceTimersByTimeAsync(600);
  });
  hashes.push(hash()); // overview
  const click = (el: Element) => {
    fireEvent.mouseDown(el, { button: 0 });
    fireEvent.click(el);
  };
  const tabs = () => [...container.querySelectorAll("[role=tab]")];
  for (let i = 0; i < tabs().length; i++) {
    click(tabs()[i]);
    hashes.push(hash());
    const buttons = [...container.querySelectorAll("button:not([role=tab])")];
    buttons.forEach((b) => {
      click(b);
      hashes.push(hash());
    });
  }
  return hashes;
}

describe("ProgressDashboard rendering", () => {
  it("renders the same markup while loading, then on every tab", async () => {
    const hashes = await walk();
    expect(new Set(hashes).size).toBeGreaterThanOrEqual(4);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "d167549b",
        "d3c363c1",
        "43a0705b",
        "43a0705b",
        "b71d5c75",
        "b71d5c75",
        "b71d5c75",
        "b71d5c75",
        "09d16595",
        "09d16595",
        "09d16595",
        "09d16595",
        "09d16595",
        "09d16595",
        "5d2edad8",
      ]
    `);
  });

  it("is deterministic", async () => {
    const a = await walk();
    cleanup();
    expect(await walk()).toEqual(a);
  });
});
