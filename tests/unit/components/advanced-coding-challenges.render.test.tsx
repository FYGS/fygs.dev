import { createHash } from "crypto";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, cleanup, screen, act } from "@testing-library/react";
import { AdvancedCodingChallenges } from "@/app/[locale]/(main)/tech-mastry/challenges/_components/advanced-coding-challenges";
import { withNeutralMatchMedia } from "../visualizations/match-media";

/**
 * Walks the whole component: tabs, opening each challenge, revealing hints,
 * submitting (random mock result, hence the seeded Math.random and fake
 * timers), running single test cases, resetting and going back.
 */
function scriptedSession() {
  return withNeutralMatchMedia(() => {
    vi.useFakeTimers({ now: new Date("2025-01-01T00:00:00Z") });
    let seed = 24681357;
    const random = vi.spyOn(Math, "random").mockImplementation(() => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    });
    try {
      const { container } = render(<AdvancedCodingChallenges />);
      const hashes: string[] = [];
      const snap = () =>
        hashes.push(
          createHash("md5")
            .update(container.innerHTML.replace(/_r_[0-9a-z]+_/g, "_r_X_").replace(/<svg[\s\S]*?<\/svg>/g, "<svg/>"))
            .digest("hex")
            .slice(0, 8)
        );
      const click = (el: Element) => {
        fireEvent.mouseDown(el, { button: 0 });
        fireEvent.click(el);
      };
      const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });
      const button = (text: string | RegExp) => screen.getAllByRole("button", { name: text });
      snap();
      for (const title of ["Two Sum", "Valid Parentheses", "Binary Tree Level Order Traversal"]) {
        click(screen.getByText(title).closest(".cursor-pointer") as Element);
        snap();
        for (const b of screen.queryAllByRole("button", { name: "Reveal Hint" })) { click(b); snap(); }
        click(button(/Submit Solution/)[0]); snap();
        advance(1500); snap();
        click(button(/Submit Solution/)[0]); advance(1500); snap();
        for (const b of button("Run Test")) { click(b); snap(); advance(1000); snap(); }
        click(button("Reset")[0]); snap();
        click(button(/Back to Challenges/)[0]); snap();
      }
      const tabs = screen.getAllByRole("tab");
      for (const t of tabs) { click(t); snap(); }
      cleanup();
      return hashes;
    } finally {
      random.mockRestore();
      vi.useRealTimers();
    }
  });
}

describe("AdvancedCodingChallenges rendering", () => {
  it("renders the same markup through a full scripted session", () => {
    const hashes = scriptedSession();
    expect(new Set(hashes).size).toBeGreaterThanOrEqual(20);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "72891310",
        "72d6e545",
        "48bd0a84",
        "20e71e18",
        "b7ea6c34",
        "2287e8ad",
        "3af21830",
        "0d3fbc97",
        "44bfaee7",
        "0a78a0f1",
        "baff7663",
        "87231e2c",
        "64d612db",
        "fcc6d2a7",
        "4410dbb5",
        "543f3a06",
        "9dddbd01",
        "28b80690",
        "89c06597",
        "fd611830",
        "4fc65ca1",
        "f833711b",
        "f52481d6",
        "42fe39d8",
        "a52c59a4",
        "0d58d67e",
        "ba76e908",
        "ac6c0d60",
        "89c06597",
        "28b80690",
        "b800d1f3",
        "98b9b05a",
        "fc62736f",
        "f2bd7232",
        "ed534b42",
        "605b2871",
        "15f1b03f",
        "2eba4e51",
        "0eb55c05",
        "29a115a7",
        "b800d1f3",
        "28b80690",
        "12dd0803",
        "7585bfb5",
        "ecd4718c",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(scriptedSession()).toEqual(scriptedSession());
  });
});
