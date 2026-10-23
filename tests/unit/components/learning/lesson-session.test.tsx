/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { LessonFooter } from "@/components/learning/lesson-footer";
import { LessonSession } from "@/components/learning/lesson-session";
import { renderInLearning } from "../../../support/learning-fixtures";

const m = vi.hoisted(() => ({
  update: vi.fn(),
  push: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/app/[locale]/(main)/dashboard/actions/updateLessonProgress", () => ({ updateLessonProgress: m.update }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: m.push, refresh: vi.fn() }), usePathname: () => "/fr/learn/react/lessons/variables" }));
vi.mock("sonner", () => ({ toast: { success: m.toastSuccess, error: m.toastError } }));
vi.mock("next/link", () => ({
  default: ({ children, href, prefetch: _prefetch, ...props }: { children: React.ReactNode; href: string; prefetch?: boolean }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const lesson = (initialCompleted = false, state = {}) =>
  renderInLearning(
    <LessonSession lessonId="l1" initialCompleted={initialCompleted} courseSlug="react">
      <LessonFooter lessonId="l1" />
    </LessonSession>,
    state,
  );

const done = { success: true, progress: { completed: true }, reward: { xp: 10, streak: 1, isFirstLesson: false }, course: { percent: 20, isComplete: false, justIssued: false, certificate: null } };

beforeEach(() => {
  vi.clearAllMocks();
  m.update.mockResolvedValue(done);
});

describe("marking a lesson as done", () => {
  it("shows the lesson done at once, then confirms with the server and the XP", async () => {
    lesson();
    fireEvent.click(screen.getByRole("button", { name: "Marquer comme terminée" }));
    // optimistic: the button already says done
    expect(screen.getByRole("button", { name: "Terminée" })).toBeTruthy();
    await waitFor(() => expect(m.update).toHaveBeenCalledWith({ lessonId: "l1", completed: true }));
    await waitFor(() => expect(m.toastSuccess).toHaveBeenCalledWith("+10 XP", expect.anything()));
  });

  it("puts the button back and says so when the server refuses", async () => {
    m.update.mockResolvedValue({ success: false, error: "ACCESS_DENIED" });
    lesson();
    fireEvent.click(screen.getByRole("button", { name: "Marquer comme terminée" }));
    await waitFor(() => expect(m.toastError).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "Marquer comme terminée" })).toBeTruthy();
  });

  it("announces the certificate when this lesson finished the course", async () => {
    m.update.mockResolvedValue({ ...done, course: { percent: 100, isComplete: true, justIssued: true, certificate: { id: "c", code: "abc" } } });
    lesson();
    fireEvent.click(screen.getByRole("button", { name: "Marquer comme terminée" }));
    await waitFor(() => expect(m.toastSuccess).toHaveBeenCalledWith(expect.stringContaining("certificat"), expect.objectContaining({ action: expect.anything() })));
  });

  it("does not record anything for a preview or for the author", () => {
    lesson(false, { mode: "preview" });
    expect(screen.queryByRole("button", { name: "Marquer comme terminée" })).toBeNull();
    expect(screen.getByText(/la progression n’est pas enregistrée/)).toBeTruthy();
    expect(m.update).not.toHaveBeenCalled();
  });

  it("makes the next step the main button once the lesson is done", () => {
    lesson(true);
    expect(screen.getByRole("button", { name: "Terminée" })).toBeTruthy();
    const next = screen.getByRole("link", { name: /Fonctions/ });
    expect(next.getAttribute("href")).toBe("/learn/react/lessons/fonctions");
  });
});

describe("the way on", () => {
  it("leads from the last item to the wrap-up, and a visitor of a preview to the course page", () => {
    renderInLearning(
      <LessonSession lessonId="x1" initialCompleted courseSlug="react">
        <LessonFooter lessonId="x1" />
      </LessonSession>,
    );
    expect(screen.getByRole("link", { name: /Terminer la formation/ }).getAttribute("href")).toBe("/learn/react/completed");
  });

  it("sends a previewer to the course page for what they cannot open", () => {
    lesson(false, { mode: "preview", openable: ["l1"] });
    expect(screen.getByRole("link", { name: /S’inscrire pour continuer/ }).getAttribute("href")).toBe("/formations/react");
  });
});
