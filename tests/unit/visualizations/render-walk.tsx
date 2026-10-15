import { createHash } from "crypto";
import type { ComponentType } from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";

/**
 * Render a component, then click every button over several passes, hashing the
 * markup after each interaction. Tab triggers are exercised separately at the
 * end so that switching tab does not hide the buttons of the main panel.
 * Two builds of the same component that produce the same hash list render the
 * same DOM for every state reached: used to prove that splitting a large
 * component into sub-components changes nothing visible.
 */
export function renderWalk(Component: ComponentType, passes = 3) {
  const { container } = render(<Component />);
  // Radix generates ids from a global counter (_r_0_, _r_1_ ...): normalise them.
  const normalised = () => container.innerHTML.replace(/_r_[0-9a-z]+_/g, "_r_X_");
  const hash = () => createHash("md5").update(normalised()).digest("hex").slice(0, 8);
  const isTab = (el: Element) => el.getAttribute("role") === "tab";
  const click = (el: Element) => {
    fireEvent.mouseDown(el, { button: 0 });
    fireEvent.click(el);
  };

  const hashes = [hash()];
  for (let pass = 0; pass < passes; pass++) {
    const count = container.querySelectorAll("button").length;
    for (let i = 0; i < count; i++) {
      const button = container.querySelectorAll("button")[i];
      if (!button || isTab(button)) continue;
      click(button);
      hashes.push(hash());
    }
  }

  const tabs = [...container.querySelectorAll("button")].filter(isTab);
  tabs.forEach((_, i) => {
    click([...container.querySelectorAll("button")].filter(isTab)[i]);
    hashes.push(hash());
  });

  const result = { hashes, states: new Set(hashes).size };
  cleanup();
  return result;
}
