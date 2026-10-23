/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { LessonNotes } from "@/components/learning/lesson-notes";

const m = vi.hoisted(() => ({
  seek: vi.fn(),
  getTime: vi.fn(() => 75.9),
  createNote: vi.fn(),
  deleteNote: vi.fn(),
}));

vi.mock("@/components/learning/lesson-session", () => ({
  useLessonSession: () => ({ getTime: m.getTime, seek: m.seek }),
}));
vi.mock("@/app/actions/note-actions", () => ({
  createNote: m.createNote,
  updateNote: vi.fn().mockResolvedValue({ note: { id: "n1", content: "Updated" } }),
  deleteNote: m.deleteNote,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { render } from "@testing-library/react";

const notes = [
  { id: "n1", content: "First note content", timestamp: 120, createdAt: new Date().toISOString() },
  { id: "n2", content: "Second note", timestamp: null, createdAt: new Date().toISOString() },
];

beforeEach(() => {
  vi.clearAllMocks();
  m.getTime.mockReturnValue(75.9);
  m.createNote.mockResolvedValue({
    note: { id: "new", content: "Retenir ça", timestamp: 75, createdAt: new Date() },
  });
  m.deleteNote.mockResolvedValue({ success: true });
});

describe("LessonNotes", () => {
  it("lists the notes with their count", () => {
    render(<LessonNotes lessonId="l1" initialNotes={notes} hasVideo />);
    expect(screen.getByText("Mes notes (2)")).toBeTruthy();
    expect(screen.getByText("First note content")).toBeTruthy();
    expect(screen.getByText("Second note")).toBeTruthy();
  });

  it("a note taken at a moment of the video jumps back to it when clicked", () => {
    render(<LessonNotes lessonId="l1" initialNotes={notes} hasVideo />);
    fireEvent.click(screen.getByRole("button", { name: /Aller à 2:00/ }));
    expect(m.seek).toHaveBeenCalledWith(120);
  });

  it("shows no jump link on a lesson without a video", () => {
    render(<LessonNotes lessonId="l1" initialNotes={notes} hasVideo={false} />);
    expect(screen.queryByRole("button", { name: /Aller à/ })).toBeNull();
  });

  it("says so when there is no note", () => {
    render(<LessonNotes lessonId="l1" initialNotes={[]} hasVideo />);
    expect(screen.getByText("Aucune note pour cette leçon.")).toBeTruthy();
  });

  it("pins a new note to the moment where it was opened, whole seconds", async () => {
    render(<LessonNotes lessonId="l1" initialNotes={[]} hasVideo />);
    fireEvent.click(screen.getByRole("button", { name: /Ajouter une note/ }));
    expect(screen.getByText(/à 1:15/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Texte de la note"), { target: { value: "Retenir ça" } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));
    await waitFor(() => expect(screen.getByText("Retenir ça")).toBeTruthy());
    expect(m.createNote).toHaveBeenCalledWith({ lessonId: "l1", content: "Retenir ça", timestamp: 75 });
  });

  it("keeps no moment for a lesson without a video", async () => {
    render(<LessonNotes lessonId="l1" initialNotes={[]} hasVideo={false} />);
    fireEvent.click(screen.getByRole("button", { name: /Ajouter une note/ }));
    fireEvent.change(screen.getByLabelText("Texte de la note"), { target: { value: "Texte" } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));
    await waitFor(() => expect(m.createNote).toHaveBeenCalled());
    expect(m.createNote.mock.calls[0][0].timestamp).toBeNull();
  });

  it("deletes a note", async () => {
    render(<LessonNotes lessonId="l1" initialNotes={notes} hasVideo />);
    fireEvent.click(screen.getAllByRole("button", { name: "Supprimer la note" })[0]);
    await waitFor(() => expect(screen.queryByText("First note content")).toBeNull());
  });
});
