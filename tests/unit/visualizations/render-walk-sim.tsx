import { createHash } from "crypto";
import type { ComponentType } from "react";
import { act } from "react";
import { vi } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { withNeutralMatchMedia } from "./match-media";

/**
 * Like renderWalk, for simulations driven by timers, requestAnimationFrame and
 * Math.random: the clock is faked, Math.random is replaced by a seeded
 * generator, and time advances by `stepMs` after each click so running
 * simulations render several frames.
 */
export function renderWalkSim(Component: ComponentType, opts: { passes?: number; stepMs?: number } = {}) {
  return withNeutralMatchMedia(() => walkSim(Component, opts));
}

function walkSim(Component: ComponentType, opts: { passes?: number; stepMs?: number }) {
  const { passes = 2, stepMs = 700 } = opts;
  vi.useFakeTimers({ now: new Date("2025-01-01T00:00:00Z") });
  let seed = 123456789;
  const random = vi.spyOn(Math, "random").mockImplementation(() => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  });

  try {
    const { container } = render(<Component />);
    const hash = () =>
      createHash("md5")
        .update(container.innerHTML.replace(/_r_[0-9a-z]+_/g, "_r_X_"))
        .digest("hex")
        .slice(0, 8);
    const isTab = (el: Element) => el.getAttribute("role") === "tab";
    const click = (el: Element) => {
      fireEvent.mouseDown(el, { button: 0 });
      fireEvent.click(el);
    };
    const advance = () => act(() => { vi.advanceTimersByTime(stepMs); });

    const hashes = [hash()];
    for (let pass = 0; pass < passes; pass++) {
      const count = container.querySelectorAll("button").length;
      for (let i = 0; i < count; i++) {
        const button = container.querySelectorAll("button")[i];
        if (!button || isTab(button)) continue;
        click(button);
        advance();
        hashes.push(hash());
      }
    }
    const tabs = [...container.querySelectorAll("button")].filter(isTab);
    tabs.forEach((_, i) => {
      click([...container.querySelectorAll("button")].filter(isTab)[i]);
      advance();
      hashes.push(hash());
    });
    cleanup();
    return { hashes, states: new Set(hashes).size };
  } finally {
    random.mockRestore();
    vi.useRealTimers();
  }
}
