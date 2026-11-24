import { describe, it, expect, vi } from "vitest";
import type { ComponentType } from "react";
import { FibonacciVisualization } from "@/app/[locale]/(main)/tech-mastry/algorithms/_components/visualizations/fibonacci-visualization";
import { KnapsackVisualization } from "@/app/[locale]/(main)/tech-mastry/algorithms/_components/visualizations/knapsack-visualization";
import { LCSVisualization } from "@/app/[locale]/(main)/tech-mastry/algorithms/_components/visualizations/lcs-visualization";
import { SearchAlgorithmsVisualization } from "@/app/[locale]/(main)/tech-mastry/algorithms/complexity/_components/visualizations/search-algorithms-visualization";
import { ExponentialSearch } from "@/app/[locale]/(main)/tech-mastry/algorithms/searching/_components/sections/additional-algorithms/exponential-search";
import { TernarySearch } from "@/app/[locale]/(main)/tech-mastry/algorithms/searching/_components/sections/additional-algorithms/ternary-search";
import { RealtimePerformance } from "@/app/[locale]/(main)/tech-mastry/algorithms/sorting/_components/sections/charts/realtime-performance";
import { SortingExercises } from "@/app/[locale]/(main)/tech-mastry/algorithms/sorting/_components/sections/sorting-exercises";
import { SortingAlgorithmsVisualization } from "@/app/[locale]/(main)/tech-mastry/algorithms/sorting/_components/sorting-algorithms-visualization";
import MessagingPage from "@/app/[locale]/(main)/tech-mastry/backend/messaging/page";
import { StreakCalendar } from "@/app/[locale]/(main)/tech-mastry/dashboard/_components/streak-calendar";
import { GitMasteryHero } from "@/app/[locale]/(main)/tech-mastry/git-mastery/_components/hero";
import { Quiz } from "@/app/[locale]/(main)/tech-mastry/_components/quiz";
import { renderWalkSim } from "./render-walk-sim";

// Characterisation of the components whose effects were rewritten to satisfy the
// react-hooks lint rules: the markup reached by clicking through them must not change.
const questions = [
  { id: "a", question: "Q1?", options: ["x", "y", "z"], correctIndex: 1, explanation: "e1", difficulty: "easy" as const, category: "c1" },
  { id: "b", question: "Q2?", options: ["x", "y"], correctIndex: 0, explanation: "e2", difficulty: "hard" as const, category: "c2" },
];
const cases: [string, ComponentType][] = [
  ["fibonacci", FibonacciVisualization],
  ["knapsack", KnapsackVisualization],
  ["lcs", LCSVisualization],
  ["search-algorithms", SearchAlgorithmsVisualization],
  ["exponential-search", ExponentialSearch],
  ["ternary-search", TernarySearch],
  ["realtime-performance", RealtimePerformance],
  ["sorting-exercises", SortingExercises],
  ["sorting-algorithms-sized", () => <SortingAlgorithmsVisualization arraySize={8} speed={50} />],
  ["messaging", MessagingPage],
  [
    "streak-calendar",
    () => (
      <StreakCalendar
        streakDays={5}
        activityByDay={{ "2026-10-16": 1, "2026-10-17": 2, "2026-10-18": 1, "2026-10-19": 4, "2026-10-20": 1 }}
        today={new Date("2026-10-20T10:00:00Z")}
      />
    ),
  ],
  ["git-hero", GitMasteryHero],
  ["quiz", () => <Quiz questions={questions} />],
];

Object.defineProperty(navigator, "clipboard", { value: { writeText: vi.fn() }, configurable: true });

describe("tech-mastry components rewritten for the lint rules", () => {
  it.each(cases)("%s renders the same markup in every state reachable by clicking", (_name, Component) => {
    const { hashes } = renderWalkSim(Component, { passes: 2, stepMs: 1300 });
    expect(hashes).toMatchSnapshot();
  });

  it.each(cases)("%s is deterministic", (_name, Component) => {
    expect(renderWalkSim(Component).hashes).toEqual(renderWalkSim(Component).hashes);
  });
});

vi.setConfig({ testTimeout: 30000 });
