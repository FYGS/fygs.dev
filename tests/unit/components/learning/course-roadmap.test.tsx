/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CourseRoadmap } from "@/components/learning/course-roadmap";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const mockItems = [
  {
    id: "1",
    title: "Introduction",
    type: "lesson" as const,
    url: "/learn/c/lessons/intro",
    completed: true,
    accessible: true,
    current: false,
  },
  {
    id: "2",
    title: "Variables",
    type: "lesson" as const,
    url: "/learn/c/lessons/variables",
    completed: true,
    accessible: true,
    current: false,
  },
  {
    id: "3",
    title: "Functions",
    type: "lesson" as const,
    url: "/learn/c/lessons/functions",
    completed: false,
    accessible: true,
    current: true,
  },
  {
    id: "4",
    title: "Quiz: Basics",
    type: "quiz" as const,
    url: "/formations/c/quizzes/q1",
    completed: false,
    accessible: false,
    current: false,
  },
];

describe("CourseRoadmap", () => {
  it("renders all items", () => {
    render(<CourseRoadmap items={mockItems} />);

    expect(screen.getByText("Introduction")).toBeTruthy();
    expect(screen.getByText("Variables")).toBeTruthy();
    expect(screen.getByText("Functions")).toBeTruthy();
    expect(screen.getByText("Quiz: Basics")).toBeTruthy();
  });

  it("shows progress count and percentage", () => {
    render(<CourseRoadmap items={mockItems} />);

    expect(screen.getByText("2/4 — 50%")).toBeTruthy();
  });

  it("renders accessible items as links", () => {
    render(<CourseRoadmap items={mockItems} />);

    const link = screen.getByText("Functions").closest("a");
    expect(link?.getAttribute("href")).toBe("/learn/c/lessons/functions");
  });

  it("renders inaccessible items without links", () => {
    render(<CourseRoadmap items={mockItems} />);

    const el = screen.getByText("Quiz: Basics").closest("a");
    expect(el).toBeNull();
  });

  it("handles empty items gracefully", () => {
    render(<CourseRoadmap items={[]} />);

    expect(screen.getByText("0/0 — 0%")).toBeTruthy();
  });
});
