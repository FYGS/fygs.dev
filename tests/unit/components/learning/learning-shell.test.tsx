/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { LearningShell } from "@/components/learning/learning-shell";

// Mock window.matchMedia for desktop (md+)
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: true, // Simulate desktop (min-width: 768px)
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Mock sub-components
vi.mock("@/components/learning/learning-top-bar", () => ({
  LearningTopBar: ({
    courseTitle,
    lessonTitle,
    progressPercentage,
    sidebarOpen,
    onToggleSidebar,
  }: {
    courseTitle: string;
    lessonTitle: string;
    progressPercentage: number;
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
  }) => (
    <div data-testid="top-bar">
      <span>{courseTitle}</span>
      <span>{lessonTitle}</span>
      <span>{progressPercentage}%</span>
      <button onClick={onToggleSidebar} data-testid="toggle-sidebar">
        {sidebarOpen ? "close" : "open"}
      </button>
    </div>
  ),
}));

vi.mock("@/components/learning/learning-sidebar", () => ({
  LearningSidebar: ({ open }: { open: boolean }) => (
    <div data-testid="sidebar" data-open={open} />
  ),
}));

describe("LearningShell", () => {
  const defaultProps = {
    courseTitle: "Test Course",
    courseSlug: "test-course",
    lessonTitle: "Test Lesson",
    progressPercentage: 50,
    lessons: [],
    modules: [],
    currentLessonId: "l1",
    progressData: [],
  };

  it("renders top bar and sidebar", () => {
    render(
      <LearningShell {...defaultProps}>
        <div>Lesson content</div>
      </LearningShell>,
    );

    expect(screen.getByTestId("top-bar")).toBeTruthy();
    expect(screen.getByTestId("sidebar")).toBeTruthy();
  });

  it("renders children content", () => {
    render(
      <LearningShell {...defaultProps}>
        <div>My lesson video here</div>
      </LearningShell>,
    );

    expect(screen.getByText("My lesson video here")).toBeTruthy();
  });

  it("sidebar starts open by default", () => {
    render(
      <LearningShell {...defaultProps}>
        <div>Content</div>
      </LearningShell>,
    );

    expect(screen.getByTestId("sidebar").getAttribute("data-open")).toBe(
      "true",
    );
  });

  it("toggles sidebar on button click", () => {
    render(
      <LearningShell {...defaultProps}>
        <div>Content</div>
      </LearningShell>,
    );

    expect(screen.getByTestId("toggle-sidebar").textContent).toBe("close");

    fireEvent.click(screen.getByTestId("toggle-sidebar"));

    expect(screen.getByTestId("toggle-sidebar").textContent).toBe("open");
    expect(screen.getByTestId("sidebar").getAttribute("data-open")).toBe(
      "false",
    );
  });
});
