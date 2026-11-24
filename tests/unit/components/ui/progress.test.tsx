import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Progress } from "@/components/ui/progress";

afterEach(cleanup);

describe("Progress", () => {
  it("exposes its value to assistive technology", () => {
    render(<Progress value={40} aria-label="Cours terminés" />);

    const bar = screen.getByRole("progressbar", { name: "Cours terminés" });
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("always has a name (WCAG 4.1.2), even when the caller gave none", () => {
    render(<Progress value={10} />);

    expect(screen.getByRole("progressbar")).toHaveAccessibleName("Progression");
  });

  it("keeps the caller's label or labelledby instead of the fallback", () => {
    render(
      <>
        <span id="label">Lecture</span>
        <Progress value={5} aria-labelledby="label" />
        <Progress value={5} aria-label="Quiz" />
      </>,
    );

    const [byId, byLabel] = screen.getAllByRole("progressbar");
    expect(byId).toHaveAccessibleName("Lecture");
    expect(byLabel).toHaveAccessibleName("Quiz");
  });

  it.each([0, 100])("handles the bounds (%i)", (value) => {
    render(<Progress value={value} aria-label="x" />);

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", String(value));
  });

  it("moves the bar with the value", () => {
    const { container } = render(<Progress value={25} aria-label="x" />);

    expect(container.querySelector("[style]")).toHaveStyle({ transform: "translateX(-75%)" });
  });

  it("without a value it is a bar that is not measured yet, not a bar at 0", () => {
    render(<Progress aria-label="x" />);

    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
  });
});
