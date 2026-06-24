/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LearningTopBar } from "@/components/learning/learning-top-bar";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("LearningTopBar", () => {
  const defaultProps = {
    courseTitle: "React Mastery",
    courseSlug: "react-mastery",
    lessonTitle: "Introduction aux hooks",
    progressPercentage: 42,
    sidebarOpen: true,
    onToggleSidebar: vi.fn(),
  };

  it("renders course title and lesson title", () => {
    render(<LearningTopBar {...defaultProps} />);

    expect(screen.getByText("React Mastery")).toBeTruthy();
    expect(screen.getByText("Introduction aux hooks")).toBeTruthy();
  });

  it("renders progress percentage", () => {
    render(<LearningTopBar {...defaultProps} />);

    expect(screen.getByText("42%")).toBeTruthy();
  });

  it("calls onToggleSidebar when sidebar button clicked", () => {
    const onToggle = vi.fn();
    render(<LearningTopBar {...defaultProps} onToggleSidebar={onToggle} />);

    fireEvent.click(screen.getByLabelText("Fermer le panneau"));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("shows correct aria-label based on sidebar state", () => {
    const { rerender } = render(
      <LearningTopBar {...defaultProps} sidebarOpen={true} />,
    );
    expect(screen.getByLabelText("Fermer le panneau")).toBeTruthy();

    rerender(<LearningTopBar {...defaultProps} sidebarOpen={false} />);
    expect(screen.getByLabelText("Ouvrir le panneau")).toBeTruthy();
  });

  it("renders exit link to course page", () => {
    render(<LearningTopBar {...defaultProps} />);

    const exitLink = screen.getByLabelText("Quitter le mode focus");
    expect(exitLink.getAttribute("href")).toBe("/formations/react-mastery");
  });
});
