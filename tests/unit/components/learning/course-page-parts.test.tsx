/**
 * @vitest-environment jsdom
 * The course page parts of the formations area are tested in tests/unit/components/formations/course-page.test.tsx.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor, within } from "@testing-library/react";
import { ExamRunner } from "@/components/learning/exam-runner";
import { renderInLearning } from "../../../support/learning-fixtures";

const m = vi.hoisted(() => ({ start: vi.fn(), submit: vi.fn(), toastInfo: vi.fn() }));
vi.mock("@/app/actions/exam-actions", () => ({ startFinalExam: m.start, submitFinalExam: m.submit }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn(), info: m.toastInfo } }));
vi.mock("next/link", () => ({
  default: ({ children, href, prefetch: _p, ...props }: { children: React.ReactNode; href: string; prefetch?: boolean }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

beforeEach(() => vi.clearAllMocks());

describe("ExamRunner", () => {
  const exam = { id: "x1", title: "Examen final", description: "Tout le cours", passingScore: 70, timeLimit: null, questionCount: 2 };
  const sitting = {
    success: true as const,
    token: "t",
    startedAt: Date.now(),
    resumed: false,
    exam: { id: "x1", title: "Examen final", description: null, passingScore: 70, timeLimit: null, questions: [
      { question: "Q1", options: ["a", "b"] },
      { question: "Q2", options: ["c", "d"] },
    ] },
  };
  const graded = {
    success: true as const,
    score: 1,
    total: 2,
    percentage: 50,
    passed: false,
    passingScore: 70,
    // a failed sitting: which questions were missed, never the right answers
    review: {
      revealed: false as const,
      items: [
        { index: 0, isCorrect: true, selected: 1 },
        { index: 1, isCorrect: false, selected: null },
      ],
    },
    next: { retryAt: new Date(Date.now() + 15 * 60_000).toISOString(), sittingsLeftToday: 2 },
    course: { percent: 80, isComplete: false, justIssued: false, certificate: null },
  };
  const passedGraded = {
    ...graded,
    score: 2,
    percentage: 100,
    passed: true,
    review: {
      revealed: true as const,
      items: [
        { index: 0, isCorrect: true, selected: 1, correctOption: 1, explanation: "parce que b" },
        { index: 1, isCorrect: true, selected: 0, correctOption: 0, explanation: "parce que c" },
      ],
    },
    next: null,
  };
  const run = (props = {}) => renderInLearning(<ExamRunner courseId="c1" exam={exam} last={null} blockedMessage={null} {...props} />);

  it("explains the rules before starting", () => {
    run();
    expect(screen.getByText(/2 questions/)).toBeTruthy();
    expect(screen.getByText(/Seuil de réussite : 70\s%/)).toBeTruthy();
    expect(screen.getByText(/Pas de limite de temps/)).toBeTruthy();
  });

  it("takes the sitting with radio groups, sends all the answers once, and shows which questions were missed", async () => {
    m.start.mockResolvedValue(sitting);
    m.submit.mockResolvedValue(graded);
    run();
    fireEvent.click(screen.getByRole("button", { name: /Commencer l’examen/ }));
    await waitFor(() => screen.getByRole("group", { name: /1\. Q1/ }));
    fireEvent.click(screen.getByLabelText("b"));
    expect(screen.getByText("1 / 2 réponses")).toBeTruthy();
    expect(screen.getByText(/sans réponse comptent comme fausses/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Envoyer l’examen/ }));
    await waitFor(() => screen.getByRole("heading", { name: "Examen non réussi" }));
    expect(m.submit).toHaveBeenCalledTimes(1);
    expect(m.submit).toHaveBeenCalledWith({ examId: "x1", token: "t", answers: [1, null] });
    expect(screen.getByText(/Pas de réponse/)).toBeTruthy();
    // what the learner is told to do next: when, and how many sittings are left
    expect(screen.getByText(/Vous pourrez repasser l’examen dans \d+ min \(2 passages restants aujourd’hui\)/)).toBeTruthy();
    // the answers read as text: the questions and the learner's own choices
    const answers = screen.getByRole("region", { name: "Vos réponses" });
    expect(within(answers).getByText(/1\. Q1/)).toBeTruthy();
    expect(within(answers).getByText("Votre réponse : b")).toBeTruthy();
    expect(within(answers).getByText(/2\. Q2/)).toBeTruthy();
    // after a failure the right answers and the explanations stay hidden
    expect(screen.queryByText(/Bonne réponse :/)).toBeNull();
    expect(screen.queryByText("parce que b")).toBeNull();
    expect(screen.queryByRole("region", { name: "Correction" })).toBeNull();
  });

  it("reveals the right answers and the explanations once the exam is passed", async () => {
    m.start.mockResolvedValue(sitting);
    m.submit.mockResolvedValue(passedGraded);
    run();
    fireEvent.click(screen.getByRole("button", { name: /Commencer l’examen/ }));
    await waitFor(() => screen.getByRole("group", { name: /1\. Q1/ }));
    fireEvent.click(screen.getByLabelText("b"));
    fireEvent.click(screen.getByLabelText("c"));
    fireEvent.click(screen.getByRole("button", { name: /Envoyer l’examen/ }));
    await waitFor(() => screen.getByRole("heading", { name: "Examen réussi !" }));
    const correction = screen.getByRole("region", { name: "Correction" });
    expect(within(correction).getByText("parce que b")).toBeTruthy();
    expect(within(correction).getByText("parce que c")).toBeTruthy();
  });

  it("says when the sitting was resumed instead of restarted", async () => {
    m.start.mockResolvedValue({ ...sitting, resumed: true });
    run();
    fireEvent.click(screen.getByRole("button", { name: /Commencer l’examen/ }));
    await waitFor(() => screen.getByRole("group", { name: /1\. Q1/ }));
    expect(m.toastInfo).toHaveBeenCalledWith(expect.stringContaining("repris"));
  });

  it("asks before leaving the page while a sitting is in progress", async () => {
    m.start.mockResolvedValue(sitting);
    run();
    fireEvent.click(screen.getByRole("button", { name: /Commencer l’examen/ }));
    await waitFor(() => screen.getByRole("group", { name: /1\. Q1/ }));
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("says why it cannot start, before any attempt", () => {
    run({ blockedMessage: "Vous pourrez repasser l’examen dans 15 min.", last: { percentage: 40, passed: false } });
    expect(screen.getByRole("status").textContent).toContain("dans 15 min");
    expect(screen.queryByRole("button", { name: /Commencer l’examen/ })).toBeNull();
    expect(screen.getByText("Non réussi")).toBeTruthy();
  });
});
