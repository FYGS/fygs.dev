import { createHash } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { expect, vi } from "vitest";
import type { ComponentType } from "react";
import { act } from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { withNeutralMatchMedia } from "./match-media";

/**
 * Same walk as renderWalkSim (fake clock, seeded Math.random, a click then a
 * time advance on every button, text inputs filled with a cycle of values first), but the hashed markup keeps the SVG drawings
 * of the visualizations: only lucide icons are collapsed, because their
 * markup changes between lucide releases. Used for components whose content
 * is an SVG scene (graphs, trees, canvases).
 */
export function renderWalkSimSvg(Component: ComponentType, opts: { passes?: number; stepMs?: number } = {}) {
  return withNeutralMatchMedia(() => walk(Component, opts));
}

function walk(Component: ComponentType, opts: { passes?: number; stepMs?: number }) {
  const { passes = 2, stepMs = 700 } = opts;
  vi.useFakeTimers({ now: new Date("2025-01-01T00:00:00Z") });
  let seed = 123456789;
  const random = vi.spyOn(Math, "random").mockImplementation(() => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  });

  // Some components keep a setTimeout id in a ref and clear it with cancelAnimationFrame;
  // the fake clock refuses that mismatch, a browser silently ignores it.
  const nativeCancel = window.cancelAnimationFrame;
  window.cancelAnimationFrame = (id: number) => {
    try {
      nativeCancel(id);
    } catch {
      /* mismatched timer kind */
    }
  };
  const inputValues = ["42", "7", "19", "33", "5"];
  let fillCount = 0;
  const fillInputs = (root: HTMLElement) => {
    root.querySelectorAll("input").forEach((input) => {
      fireEvent.change(input, { target: { value: inputValues[fillCount++ % inputValues.length] } });
    });
  };

  try {
    const { container } = render(<Component />);
    const dump: string[] = [];
    const normalised = () =>
      container.innerHTML
        .replace(/_r_[0-9a-z]+_/g, "_r_X_")
        .replace(/<svg[^>]*lucide[^>]*>[\s\S]*?<\/svg>/g, "<svg/>");
    const hash = () => {
      const html = normalised();
      dump.push(html);
      return createHash("md5").update(html).digest("hex").slice(0, 8);
    };
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
        fillInputs(container);
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
    if (process.env.DUMP_WALK) {
      mkdirSync(process.env.DUMP_WALK, { recursive: true });
      const name = (expect.getState().currentTestName ?? "walk").replace(/[^a-z0-9]+/gi, "_");
      writeFileSync(`${process.env.DUMP_WALK}/${name}.json`, JSON.stringify(dump));
    }
    cleanup();
    return { hashes, states: new Set(hashes).size };
  } finally {
    window.cancelAnimationFrame = nativeCancel;
    random.mockRestore();
    vi.useRealTimers();
  }
}
