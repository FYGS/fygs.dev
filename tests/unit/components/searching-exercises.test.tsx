import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/_lib/code-sandbox", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/app/_lib/code-sandbox")>()),
  runInSandbox: vi.fn(),
}));
vi.mock("@/app/[locale]/(main)/tech-mastry/algorithms/searching/_components/sections/code-editor/code-editor", () => ({
  CodeEditor: ({ initialCode, title }: { initialCode: string; title?: string }) => (
    <textarea aria-label={title ?? "editor"} defaultValue={initialCode} />
  ),
}));

import {
  SearchingExercisesImproved,
  exercises,
} from "@/app/[locale]/(main)/tech-mastry/algorithms/searching/_components/sections/searching-exercises-improved";

afterEach(cleanup);

const select = (name: RegExp) => {
  const tab = screen.getByRole("tab", { name });
  fireEvent.mouseDown(tab, { button: 0 });
  fireEvent.click(tab);
};

describe("SearchingExercisesImproved", () => {
  it("starts with the first exercise's template in the editor", () => {
    render(<SearchingExercisesImproved />);

    expect(screen.getByLabelText(/Exercice: /)).toHaveValue(exercises[0].template);
  });

  it("another exercise brings its own template, not the code left by the previous one", () => {
    render(<SearchingExercisesImproved />);
    fireEvent.change(screen.getByLabelText(/Exercice: /), { target: { value: "my work on the first exercise" } });

    select(/Binaire/);

    expect(screen.getByLabelText(/Exercice: /)).toHaveValue(exercises[1].template);
  });

  it("every tab points at a panel that exists (aria-controls)", () => {
    render(<SearchingExercisesImproved />);

    const selected = screen.getByRole("tab", { selected: true });
    const panelId = selected.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId!)).not.toBeNull();
    expect(within(screen.getByRole("tabpanel")).getByLabelText(/Exercice: /)).toBeInTheDocument();
  });
});
