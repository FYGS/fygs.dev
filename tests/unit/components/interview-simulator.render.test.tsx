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
        "3683dd9b",
        "3683dd9b",
        "3683dd9b",
        "3683dd9b",
        "3683dd9b",
        "3683dd9b",
        "3683dd9b",
        "3683dd9b",
        "3683dd9b",
        "3683dd9b",
        "9f66974d",
        "1fd0a322",
        "9cdc9fcd",
      ]
    `);
  });

  it("renders the same markup through a full scripted interview (templates, questions, results)", () => {
    const hashes = scriptedWalk();
    expect(new Set(hashes).size).toBeGreaterThanOrEqual(20);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "144627bc",
        "5ceaa555",
        "592cec5d",
        "592cec5d",
        "592cec5d",
        "48bdf4c8",
        "ee6a0719",
        "48bdf4c8",
        "86b7ac90",
        "86b7ac90",
        "86b7ac90",
        "248e1e7a",
        "3f414713",
        "248e1e7a",
        "592cec5d",
        "248e1e7a",
        "248e1e7a",
        "248e1e7a",
        "86b7ac90",
        "1315d638",
        "86b7ac90",
        "7c0dcec7",
        "7c0dcec7",
        "7c0dcec7",
        "2f8c5e92",
        "7ac15053",
        "2f8c5e92",
        "119fff63",
        "119fff63",
        "119fff63",
        "a9507540",
        "bdb5f2dc",
        "a9507540",
        "f05a816d",
        "f05a816d",
        "f05a816d",
        "b40f5e35",
        "e4b501cd",
        "b40f5e35",
        "e6664bd2",
        "e6664bd2",
        "3683dd9b",
        "144627bc",
        "8b7003be",
        "58e0235f",
        "58e0235f",
        "58e0235f",
        "1c175b28",
        "50a5dea5",
        "1c175b28",
        "ceb33409",
        "ceb33409",
        "ceb33409",
        "e2a78da7",
        "2b68c2ab",
        "e2a78da7",
        "58e0235f",
        "e2a78da7",
        "e2a78da7",
        "e2a78da7",
        "ceb33409",
        "5be5e4a5",
        "ceb33409",
        "3a2e6603",
        "3a2e6603",
        "3a2e6603",
        "f3169f67",
        "18cc11ab",
        "f3169f67",
        "13dedc02",
        "13dedc02",
        "13dedc02",
        "789397fe",
        "1aa231e4",
        "789397fe",
        "d0e26412",
        "d0e26412",
        "d0e26412",
        "0673582f",
        "7769d025",
        "0673582f",
        "2ba67e55",
        "2ba67e55",
        "3683dd9b",
        "144627bc",
        "33d40439",
        "b2cba82b",
        "b2cba82b",
        "b2cba82b",
        "8c7ad9bf",
        "f4f95525",
        "8c7ad9bf",
        "7676b275",
        "7676b275",
        "7676b275",
        "ee081096",
        "b31cbe80",
        "ee081096",
        "b2cba82b",
        "ee081096",
        "ee081096",
        "ee081096",
        "7676b275",
        "bc43712a",
        "7676b275",
        "04f454aa",
        "04f454aa",
        "04f454aa",
        "b685fffa",
        "29093795",
        "b685fffa",
        "0dbd5768",
        "0dbd5768",
        "0dbd5768",
        "11e10fc9",
        "baec8960",
        "11e10fc9",
        "f04a5a4c",
        "f04a5a4c",
        "3683dd9b",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(scriptedWalk()).toEqual(scriptedWalk());
  });
});
