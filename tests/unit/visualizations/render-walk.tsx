import { createHash } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { expect } from "vitest";
import type { ComponentType } from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { withNeutralMatchMedia } from "./match-media";

/**
 * Render a component, then click every button over several passes, hashing the
 * markup after each interaction. Tab triggers are exercised separately at the
 * end so that switching tab does not hide the buttons of the main panel.
 * Two builds of the same component that produce the same hash list render the
 * same DOM for every state reached: used to prove that splitting a large
 * component into sub-components changes nothing visible.
 */
export function renderWalk(Component: ComponentType, passes = 3) {
  return withNeutralMatchMedia(() => walk(Component, passes));
}

function walk(Component: ComponentType, passes: number) {
  const { container } = render(<Component />);
  // Radix generates ids from a global counter (_r_0_, _r_1_ ...): normalise them.
  const normalised = () => container.innerHTML.replace(/_r_[0-9a-z]+_/g, "_r_X_").replace(/<svg[\s\S]*?<\/svg>/g, "<svg/>") // icon markup changes between lucide releases;
  const hash = () => createHash("md5").update(normalised()).digest("hex").slice(0, 8);
  const isTab = (el: Element) => el.getAttribute("role") === "tab";
  const click = (el: Element) => {
    fireEvent.mouseDown(el, { button: 0 });
    fireEvent.click(el);
  };

  const dump: string[] = [];
  const hashes = [hash()];
  dump.push(normalised());
  for (let pass = 0; pass < passes; pass++) {
    const count = container.querySelectorAll("button").length;
    for (let i = 0; i < count; i++) {
      const button = container.querySelectorAll("button")[i];
      if (!button || isTab(button)) continue;
      click(button);
      hashes.push(hash());
      dump.push(normalised());
    }
  }

  const tabs = [...container.querySelectorAll("button")].filter(isTab);
  tabs.forEach((_, i) => {
    click([...container.querySelectorAll("button")].filter(isTab)[i]);
    hashes.push(hash());
      dump.push(normalised());
  });

  if (process.env.DUMP_WALK) {
    mkdirSync(process.env.DUMP_WALK, { recursive: true });
    const name = (expect.getState().currentTestName ?? "walk").replace(/[^a-z0-9]+/gi, "_");
    writeFileSync(`${process.env.DUMP_WALK}/${name}.json`, JSON.stringify(dump));
  }
  const result = { hashes, states: new Set(hashes).size };
  cleanup();
  return result;
}
