/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LessonProgressButton } from "@/components/learning/lesson-progress-button";

describe("LessonProgressButton", () => {
  const defaultProps = {
    lessonId: "lesson-1",
    initialCompleted: false,
    onMarkComplete: vi.fn().mockResolvedValue({ success: true }),
  };

  it("shows 'Marquer comme terminée' when not completed", () => {
    render(<LessonProgressButton {...defaultProps} />);
    expect(screen.getByText("Marquer comme terminée")).toBeInTheDocument();
  });

  it("shows 'Terminée' when initialCompleted is true", () => {
    render(<LessonProgressButton {...defaultProps} initialCompleted={true} />);
    expect(screen.getByText("Terminée")).toBeInTheDocument();
  });

  it("button is disabled when already completed", () => {
    render(<LessonProgressButton {...defaultProps} initialCompleted={true} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("calls onMarkComplete when clicked", () => {
    render(<LessonProgressButton {...defaultProps} />);
    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.onMarkComplete).toHaveBeenCalledWith("lesson-1");
  });
});
