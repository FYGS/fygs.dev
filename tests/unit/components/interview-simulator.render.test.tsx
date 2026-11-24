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
      click(byText("Démarrer")[template]); // start the interview
      snap();
      const textarea = () => container.querySelector("textarea") as HTMLTextAreaElement;
      // walk through the questions, exercising the controls on the way
      for (let step = 0; step < 8 && textarea(); step++) {
        const iconButtons = [...container.querySelectorAll("button")].filter((b) => b.textContent === "" || /Enregistrer|Arrêter/.test(b.textContent ?? ""));
        iconButtons.forEach((b) => { click(b); snap(); });
        fireEvent.change(textarea(), { target: { value: `answer ${step}` } });
        snap();
        click(byText("Indice")[0]);
        snap();
        if (step === 1) {
          click(byText("Précédent")[0]);
          snap();
        }
        const next = screen.queryByText("Question suivante") ?? screen.getByText("Terminer l'entretien");
        click(next.closest("button") as Element);
        snap();
      }
      click(byText("Télécharger le rapport")[0]);
      snap();
      click(byText("Recommencer")[0]);
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
        "ed15a8fe",
        "ed15a8fe",
        "ed15a8fe",
        "ed15a8fe",
        "ed15a8fe",
        "ed15a8fe",
        "ed15a8fe",
        "ed15a8fe",
        "ed15a8fe",
        "ed15a8fe",
        "15362a8c",
        "d4e08d44",
        "1100973a",
      ]
    `);
  });

  it("renders the same markup through a full scripted interview (templates, questions, results)", () => {
    const hashes = scriptedWalk();
    expect(new Set(hashes).size).toBeGreaterThanOrEqual(20);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "d85e6fa7",
        "5b926e23",
        "f630e239",
        "f630e239",
        "f630e239",
        "e6b553cb",
        "fe151360",
        "e6b553cb",
        "cc139cc9",
        "cc139cc9",
        "cc139cc9",
        "0429b76f",
        "c69e9c3d",
        "0429b76f",
        "f630e239",
        "0429b76f",
        "0429b76f",
        "0429b76f",
        "cc139cc9",
        "7f56c691",
        "cc139cc9",
        "cb924ad4",
        "cb924ad4",
        "cb924ad4",
        "6ad351b7",
        "9fc07f45",
        "6ad351b7",
        "2ecf85de",
        "2ecf85de",
        "2ecf85de",
        "0c511e73",
        "0ac76c25",
        "0c511e73",
        "0f8bdec1",
        "0f8bdec1",
        "0f8bdec1",
        "23847dac",
        "25e2b612",
        "23847dac",
        "b08436e8",
        "b08436e8",
        "ed15a8fe",
        "d85e6fa7",
        "8d9d2b4b",
        "fe18d025",
        "fe18d025",
        "fe18d025",
        "ce0fc917",
        "64e83243",
        "ce0fc917",
        "cf873e0f",
        "cf873e0f",
        "cf873e0f",
        "e781bd1a",
        "195ea87d",
        "e781bd1a",
        "fe18d025",
        "e781bd1a",
        "e781bd1a",
        "e781bd1a",
        "cf873e0f",
        "0c9051bf",
        "cf873e0f",
        "c99eec0a",
        "c99eec0a",
        "c99eec0a",
        "d2964e7a",
        "dd0c314b",
        "d2964e7a",
        "c6f65faf",
        "c6f65faf",
        "c6f65faf",
        "6aa2c50d",
        "78e00deb",
        "6aa2c50d",
        "12fb2407",
        "12fb2407",
        "12fb2407",
        "4b1b401d",
        "5b44f20c",
        "4b1b401d",
        "4649fbc4",
        "4649fbc4",
        "ed15a8fe",
        "d85e6fa7",
        "0d626dfb",
        "d18afd6e",
        "d18afd6e",
        "d18afd6e",
        "9810cd7f",
        "04138855",
        "9810cd7f",
        "345cfc35",
        "345cfc35",
        "345cfc35",
        "a853847b",
        "6c3c64d0",
        "a853847b",
        "d18afd6e",
        "a853847b",
        "a853847b",
        "a853847b",
        "345cfc35",
        "e8f484fc",
        "345cfc35",
        "bdedb40d",
        "bdedb40d",
        "bdedb40d",
        "52f1d62a",
        "fa9d96ee",
        "52f1d62a",
        "713f5dad",
        "713f5dad",
        "713f5dad",
        "10697480",
        "2e2350e6",
        "10697480",
        "a8b14c70",
        "a8b14c70",
        "ed15a8fe",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(scriptedWalk()).toEqual(scriptedWalk());
  });
});
