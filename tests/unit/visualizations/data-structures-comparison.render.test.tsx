import { createHash } from "crypto";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DataStructuresComparison } from "@/app/[locale]/(main)/tech-mastry/algorithms/data-structures/_components/data-structures-comparison";
import { withNeutralMatchMedia } from "./match-media";

/**
 * The comparison is static data driven by two kinds of controls: clickable
 * badges (not buttons) that toggle a structure and tabs that switch the
 * comparison. Walk every badge in each tab and hash the markup each time.
 */
function walk() {
  return withNeutralMatchMedia(() => {
    const { container } = render(<DataStructuresComparison />);
    const normalised = () =>
      container.innerHTML.replace(/_r_[0-9a-z]+_/g, "_r_X_").replace(/<svg[^>]*lucide[^>]*>[\s\S]*?<\/svg>/g, "<svg/>");
    const hash = () => createHash("md5").update(normalised()).digest("hex").slice(0, 8);
    const hashes = [hash()];
    const tabs = () => [...container.querySelectorAll('button[role="tab"]')];
    const badges = () => [...container.querySelectorAll(".cursor-pointer")];
    for (let t = 0; t < tabs().length; t++) {
      fireEvent.mouseDown(tabs()[t], { button: 0 });
      fireEvent.click(tabs()[t]);
      hashes.push(hash());
      for (let pass = 0; pass < 2; pass++) {
        for (let b = 0; b < badges().length; b++) {
          fireEvent.click(badges()[b]);
          hashes.push(hash());
        }
      }
    }
    cleanup();
    return { hashes, states: new Set(hashes).size };
  });
}

describe("DataStructuresComparison rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = walk();
    expect(states).toBeGreaterThanOrEqual(10);
    expect(hashes).toMatchSnapshot();
  });

  it("is deterministic", () => {
    expect(walk().hashes).toEqual(walk().hashes);
  });
});
