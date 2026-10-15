/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LessonNotes } from "@/components/learning/lesson-notes";

vi.mock("@/app/actions/note-actions", () => ({
  createNote: vi.fn().mockResolvedValue({
    note: {
      id: "new-note",
      content: "Test note",
      timestamp: 30,
      createdAt: new Date().toISOString(),
    },
  }),
  updateNote: vi.fn().mockResolvedValue({
    note: { id: "n1", content: "Updated" },
  }),
  deleteNote: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const mockNotes = [
  {
    id: "n1",
    content: "First note content",
    timestamp: 120,
    createdAt: new Date().toISOString(),
  },
  {
    id: "n2",
    content: "Second note",
    timestamp: null,
    createdAt: new Date().toISOString(),
  },
];

describe("LessonNotes", () => {
  it("renders notes count and list", () => {
    render(<LessonNotes lessonId="lesson-1" initialNotes={mockNotes} />);

    expect(screen.getByText("Notes (2)")).toBeTruthy();
    expect(screen.getByText("First note content")).toBeTruthy();
    expect(screen.getByText("Second note")).toBeTruthy();
  });

  it("shows timestamp for notes that have one", () => {
    render(<LessonNotes lessonId="lesson-1" initialNotes={mockNotes} />);

    expect(screen.getByText("2:00")).toBeTruthy();
  });

  it("shows empty state when no notes", () => {
    render(<LessonNotes lessonId="lesson-1" initialNotes={[]} />);

    expect(screen.getByText("Aucune note pour cette leçon")).toBeTruthy();
  });

  it("shows add form when plus button clicked", () => {
    render(<LessonNotes lessonId="lesson-1" initialNotes={[]} />);

    // Click the add button
    const buttons = screen.getAllByRole("button");
    const addBtn = buttons.find((b) => b.querySelector("svg"));
    if (addBtn) fireEvent.click(addBtn);

    expect(screen.getByPlaceholderText("Écrivez votre note...")).toBeTruthy();
    expect(screen.getByText("Sauver")).toBeTruthy();
  });

  it("shows current timestamp in add form", () => {
    render(
      <LessonNotes
        lessonId="lesson-1"
        initialNotes={[]}
        currentTimestamp={95}
      />,
    );

    // Open add form
    const buttons = screen.getAllByRole("button");
    const addBtn = buttons.find((b) => b.querySelector("svg"));
    if (addBtn) fireEvent.click(addBtn);

    expect(screen.getByText("1:35")).toBeTruthy();
  });
});
