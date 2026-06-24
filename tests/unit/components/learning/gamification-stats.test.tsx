/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GamificationStats } from "@/components/learning/gamification-stats";

describe("GamificationStats", () => {
  it("renders streak, todayXp, and totalXp", () => {
    render(<GamificationStats totalXp={1250} currentStreak={7} todayXp={35} />);

    expect(screen.getByText("7j")).toBeTruthy();
    expect(screen.getByText("+35 XP")).toBeTruthy();
    // Match any locale format of 1250
    expect(screen.getByText(/1.?250/)).toBeTruthy();
  });

  it("shows 0 streak without flame highlight", () => {
    const { container } = render(
      <GamificationStats totalXp={0} currentStreak={0} todayXp={0} />,
    );

    expect(screen.getByText("0j")).toBeTruthy();
    expect(screen.getByText("+0 XP")).toBeTruthy();
    // Flame should have muted-foreground class (not orange)
    const flame = container.querySelector(".text-muted-foreground");
    expect(flame).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <GamificationStats
        totalXp={100}
        currentStreak={3}
        todayXp={10}
        className="my-custom"
      />,
    );

    expect((container.firstChild as HTMLElement).className).toContain(
      "my-custom",
    );
  });
});
