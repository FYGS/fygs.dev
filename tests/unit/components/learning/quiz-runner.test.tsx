/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { QuizRunner } from "@/components/learning/quiz-runner";
import { renderInLearning } from "../../../support/learning-fixtures";

const m = vi.hoisted(() => ({ check: vi.fn(), submit: vi.fn() }));

vi.mock("@/app/actions/quiz-actions", () => ({ checkQuizAnswer: m.check, submitQuizAnswers: m.submit }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const quiz = {
  id: "q1",
  title: "Quiz des bases",
  questions: [
    { id: "a", question: "Que retourne typeof null ?", options: ["'null'", "'object'", "'undefined'"] },
    { id: "b", question: "let ou var ?", options: ["var", "let"] },
  ],
};

const feedback = (questionId: string, isCorrect: boolean, correctOption: number, selectedOption: number) => ({
  success: true as const,
  questionId,
  selectedOption,
  isCorrect,
  correctOption,
  explanation: isCorrect ? "Exact." : "Raison historique.",
});

const submitted = (over = {}) => ({
  success: true as const,
  score: 2,
  total: 2,
  percentage: 100,
  passed: true,
  bestPercentage: 100,
  reward: { xp: 25 },
  review: [],
  course: { percent: 60, isComplete: false, justIssued: false, certificate: null },
  ...over,
});

const run = (props: Partial<React.ComponentProps<typeof QuizRunner>> = {}, state = {}) =>
  renderInLearning(<QuizRunner quiz={quiz} courseId="c1" best={null} blockedMessage={null} {...props} />, state);

beforeEach(() => {
  vi.clearAllMocks();
  m.check.mockImplementation(async ({ questionId, selectedOption }: { questionId: string; selectedOption: number }) =>
    questionId === "a" ? feedback("a", selectedOption === 1, 1, selectedOption) : feedback("b", selectedOption === 1, 1, selectedOption),
  );
  m.submit.mockResolvedValue(submitted());
});

describe("QuizRunner", () => {
  it("starts on the first question with a labelled list of choices", () => {
    run();
    expect(screen.getByRole("heading", { name: "Que retourne typeof null ?" })).toBeTruthy();
    expect(screen.getByRole("list", { name: "Choix de réponse" })).toBeTruthy();
    expect(screen.getByText("Question 1 sur 2")).toBeTruthy();
  });

  it("gives the server's feedback in a live region and locks the answer", async () => {
    run();
    fireEvent.click(screen.getByRole("button", { name: /'object'/ }));
    await waitFor(() => expect(screen.getByText("Bonne réponse", { selector: "p" })).toBeTruthy());
    expect(screen.getByText("Exact.")).toBeTruthy();
    expect(m.check).toHaveBeenCalledWith({ quizId: "q1", questionId: "a", selectedOption: 1 });
    // the first answer is final: the choices are disabled
    expect((screen.getByRole("button", { name: /'null'/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(document.querySelector("[aria-live='polite']")).toBeTruthy();
  });

  it("explains a wrong answer", async () => {
    run();
    fireEvent.click(screen.getByRole("button", { name: /'null'/ }));
    await waitFor(() => expect(screen.getByText("Mauvaise réponse")).toBeTruthy());
    expect(screen.getByText("Raison historique.")).toBeTruthy();
  });

  it("grades on the server at the end and shows the result with the way on", async () => {
    run();
    fireEvent.click(screen.getByRole("button", { name: /'object'/ }));
    await waitFor(() => screen.getByRole("button", { name: "Question suivante" }));
    fireEvent.click(screen.getByRole("button", { name: "Question suivante" }));
    fireEvent.click(screen.getByRole("button", { name: /^B?.*let/ }));
    await waitFor(() => screen.getByRole("button", { name: "Terminer le quiz" }));
    fireEvent.click(screen.getByRole("button", { name: "Terminer le quiz" }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "Quiz réussi !" })).toBeTruthy());
    expect(m.submit).toHaveBeenCalledWith({
      quizId: "q1",
      courseId: "c1",
      answers: [
        { questionId: "a", selectedOption: 1 },
        { questionId: "b", selectedOption: 1 },
      ],
    });
    expect(screen.getByText("100 %")).toBeTruthy();
    // the next step of the course (the next lesson after this quiz is in module 2)
    expect(screen.getByRole("link", { name: /Asynchrone/ }).getAttribute("href")).toBe("/learn/react/lessons/async");
  });

  it("shows the previous best result first and tells about the waiting time before any answer", () => {
    run({ best: { percentage: 50, score: 1, total: 2 }, blockedMessage: "Vous pourrez refaire ce quiz dans 3 min." });
    expect(screen.getByText(/Meilleur score/)).toBeTruthy();
    expect(screen.getByText("Non réussi")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("Vous pourrez refaire ce quiz dans 3 min.");
    expect(screen.queryByRole("button", { name: /Refaire le quiz/ })).toBeNull();
    expect(m.check).not.toHaveBeenCalled();
  });

  it("lets the learner start again when nothing blocks", () => {
    run({ best: { percentage: 50, score: 1, total: 2 } });
    fireEvent.click(screen.getByRole("button", { name: /Refaire le quiz/ }));
    expect(screen.getByText("Question 1 sur 2")).toBeTruthy();
  });

  it("shows the next step right away when the quiz was already passed", () => {
    run({ best: { percentage: 100, score: 2, total: 2 } });
    expect(screen.getByRole("link", { name: /Asynchrone/ })).toBeTruthy();
  });

  it("continues a sitting in progress at its first open question, answers already given kept", async () => {
    run({
      best: { percentage: 50, score: 1, total: 2 },
      resumed: [{ questionId: "a", selectedOption: 0, isCorrect: false, correctOption: 1, explanation: "Raison historique." }],
    });
    expect(screen.getByText("Question 2 sur 2")).toBeTruthy();
    expect(screen.getByText(/reprenez votre tentative/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /^B?.*let/ }));
    await waitFor(() => screen.getByRole("button", { name: "Terminer le quiz" }));
    fireEvent.click(screen.getByRole("button", { name: "Terminer le quiz" }));
    await waitFor(() => expect(m.submit).toHaveBeenCalled());
    expect(m.submit.mock.calls[0][0].answers).toEqual([
      { questionId: "a", selectedOption: 0 },
      { questionId: "b", selectedOption: 1 },
    ]);
  });

  it("shows the answer the server counts, not the one clicked again", async () => {
    // an earlier answer to this question is final: the server answers for it
    m.check.mockResolvedValueOnce(feedback("a", false, 1, 0));
    run();
    fireEvent.click(screen.getByRole("button", { name: /'object'/ }));
    await waitFor(() => expect(screen.getByText("Mauvaise réponse")).toBeTruthy());
    expect(screen.getByRole("button", { name: /'null'/ }).getAttribute("aria-pressed")).toBe("true");
  });

  it("leaves the way on open after a failed quiz, even while a new sitting must wait", () => {
    run({ best: { percentage: 50, score: 1, total: 2 }, blockedMessage: "Vous pourrez refaire ce quiz dans 3 min." });
    expect(screen.getByRole("link", { name: /Asynchrone/ })).toBeTruthy();
  });

  it("does not render a blank page for a quiz without questions", () => {
    run({ quiz: { ...quiz, questions: [] } });
    expect(screen.getByText("Ce quiz n’a pas encore de questions.")).toBeTruthy();
  });

  it("congratulates when this quiz finished the course", async () => {
    m.submit.mockResolvedValue(
      submitted({ course: { percent: 100, isComplete: true, justIssued: true, certificate: { id: "c", code: "abc" } } }),
    );
    run();
    fireEvent.click(screen.getByRole("button", { name: /'object'/ }));
    await waitFor(() => screen.getByRole("button", { name: "Question suivante" }));
    fireEvent.click(screen.getByRole("button", { name: "Question suivante" }));
    fireEvent.click(screen.getByRole("button", { name: /let/ }));
    await waitFor(() => screen.getByRole("button", { name: "Terminer le quiz" }));
    fireEvent.click(screen.getByRole("button", { name: "Terminer le quiz" }));
    await waitFor(() => expect(screen.getByText(/Formation terminée/)).toBeTruthy());
    expect(screen.getByRole("link", { name: "Le voir" }).getAttribute("href")).toBe("/learn/react/completed");
  });
});
