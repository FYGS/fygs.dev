import { createHash } from "crypto";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, cleanup, screen } from "@testing-library/react";
import { InterviewSimulator } from "@/app/[locale]/(main)/tech-mastry/interview-simulation/_components/interview-simulator";
import { renderWalk } from "../visualizations/render-walk";
import { withNeutralMatchMedia } from "../visualizations/match-media";

// The "active" and "review" modes can only be entered from the review screen's
// template cards, which are themselves unreachable from the initial "inactive"
// mode. To characterise them, the scripted walk below starts the component
// directly in "review" mode by overriding the initial value of the mode state.
const force = vi.hoisted(() => ({ mode: null as string | null }));
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useState: ((initial: unknown) =>
      actual.useState(initial === "inactive" && force.mode ? force.mode : initial)) as typeof actual.useState,
  };
});

function scriptedWalk() {
  force.mode = "review";
  return withNeutralMatchMedia(() => {
    const hashes: string[] = [];
    const click = (el: Element) => {
      fireEvent.mouseDown(el, { button: 0 });
      fireEvent.click(el);
    };
    const byText = (text: string) => screen.getAllByText(text).map((e) => e.closest("button") ?? e);
    for (let template = 0; template < 3; template++) {
      const { container } = render(<InterviewSimulator />);
      const snap = () =>
        hashes.push(
          createHash("md5")
            .update(container.innerHTML.replace(/_r_[0-9a-z]+_/g, "_r_X_").replace(/<svg[\s\S]*?<\/svg>/g, "<svg/>"))
            .digest("hex")
            .slice(0, 8)
        );
      snap();
      click(container.querySelectorAll('[class*="cursor-pointer"]')[template]); // select template card
      snap();
      click(byText("Start")[template]); // start the interview
      snap();
      const textarea = () => container.querySelector("textarea") as HTMLTextAreaElement;
      // walk through the questions, exercising the controls on the way
      for (let step = 0; step < 8 && textarea(); step++) {
        const iconButtons = [...container.querySelectorAll("button")].filter((b) => b.textContent === "" || /Record|Stop/.test(b.textContent ?? ""));
        iconButtons.forEach((b) => { click(b); snap(); });
        fireEvent.change(textarea(), { target: { value: `answer ${step}` } });
        snap();
        click(byText("Hint")[0]);
        snap();
        if (step === 1) {
          click(byText("Previous")[0]);
          snap();
        }
        const next = screen.queryByText("Next Question") ?? screen.getByText("Finish Interview");
        click(next.closest("button") as Element);
        snap();
      }
      click(byText("Download Report")[0]);
      snap();
      click(byText("Start New")[0]);
      snap();
      cleanup();
    }
    force.mode = null;
    return hashes;
  });
}

describe("InterviewSimulator rendering", () => {
  it("renders the same markup in every state reachable from the initial mode", () => {
    force.mode = null;
    const { hashes, states } = renderWalk(InterviewSimulator, 3);
    expect(states).toBeGreaterThanOrEqual(3);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "b4e9c254",
        "b4e9c254",
        "b4e9c254",
        "b4e9c254",
        "b4e9c254",
        "b4e9c254",
        "b4e9c254",
        "b4e9c254",
        "b4e9c254",
        "b4e9c254",
        "b9724f3d",
        "485d3090",
        "9e1ce3f4",
      ]
    `);
  });

  it("renders the same markup through a full scripted interview (templates, questions, results)", () => {
    const hashes = scriptedWalk();
    expect(new Set(hashes).size).toBeGreaterThanOrEqual(20);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "3188148b",
        "6152cd7b",
        "bea21fab",
        "bea21fab",
        "bea21fab",
        "b8a97bc2",
        "409e31ff",
        "b8a97bc2",
        "85ff5361",
        "85ff5361",
        "85ff5361",
        "7dda90ee",
        "cc7f1e30",
        "7dda90ee",
        "bea21fab",
        "7dda90ee",
        "7dda90ee",
        "7dda90ee",
        "85ff5361",
        "e0d0c2bf",
        "85ff5361",
        "b5237ab9",
        "b5237ab9",
        "b5237ab9",
        "aed40ac1",
        "88abbeb4",
        "aed40ac1",
        "b9bf34fb",
        "b9bf34fb",
        "b9bf34fb",
        "1d37710f",
        "b5817206",
        "1d37710f",
        "b5c09c25",
        "b5c09c25",
        "b5c09c25",
        "292bf120",
        "850dd007",
        "292bf120",
        "5b7faf30",
        "5b7faf30",
        "7598bd16",
        "3188148b",
        "f22deec3",
        "6e19b683",
        "6e19b683",
        "6e19b683",
        "914827ee",
        "099cae2c",
        "914827ee",
        "d634feb3",
        "d634feb3",
        "d634feb3",
        "f17febf4",
        "862e831f",
        "f17febf4",
        "6e19b683",
        "f17febf4",
        "f17febf4",
        "f17febf4",
        "d634feb3",
        "817dbfed",
        "d634feb3",
        "1ce6aeb6",
        "1ce6aeb6",
        "1ce6aeb6",
        "b22137d6",
        "5a17e888",
        "b22137d6",
        "eb9a81bc",
        "eb9a81bc",
        "eb9a81bc",
        "9edd94fa",
        "d85861e0",
        "9edd94fa",
        "539004c1",
        "539004c1",
        "539004c1",
        "620f2ac2",
        "ce5d0eed",
        "620f2ac2",
        "3d7b441f",
        "3d7b441f",
        "7598bd16",
        "3188148b",
        "43ae204e",
        "ed9c4b8a",
        "ed9c4b8a",
        "ed9c4b8a",
        "6d882fc9",
        "8f4475d4",
        "6d882fc9",
        "90cdf209",
        "90cdf209",
        "90cdf209",
        "65bfd242",
        "9bdea7ee",
        "65bfd242",
        "ed9c4b8a",
        "65bfd242",
        "65bfd242",
        "65bfd242",
        "90cdf209",
        "f1c7e01e",
        "90cdf209",
        "455fe006",
        "455fe006",
        "455fe006",
        "8520d760",
        "5d2d2606",
        "8520d760",
        "2dc6e0e3",
        "2dc6e0e3",
        "2dc6e0e3",
        "c03b06b0",
        "76d09a0a",
        "c03b06b0",
        "8461aeb1",
        "8461aeb1",
        "7598bd16",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(scriptedWalk()).toEqual(scriptedWalk());
  });
});
