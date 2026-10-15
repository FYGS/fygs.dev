/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QuizStudent } from "@/app/[locale]/(main)/formations/[slug]/_components/quiz-student";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: {
      children: React.ReactNode;
      className?: string;
    }) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Grading lives on the server: the component only sees what these actions return.
const { checkQuizAnswer, submitQuizAnswers } = vi.hoisted(() => ({
  checkQuizAnswer: vi.fn(),
  submitQuizAnswers: vi.fn(),
}));
vi.mock("@/app/actions/quiz-actions", () => ({ checkQuizAnswer, submitQuizAnswers }));

vi.mock("@/app/[locale]/(learning)/learn/_actions/gamification-actions", () => ({
  onQuizPassed: vi.fn().mockResolvedValue(null),
  onCourseCompleted: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/hooks/use-quiz-completion", () => ({
  useQuizCompletion: () => ({
    checkCertificate: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const mockQuiz = {
  id: "quiz-1",
  title: "JavaScript Basics",
  questions: [
    {
      id: "q1",
      question: "What is 1 + 1?",
      options: ["1", "2", "3", "4"],
      order: 1,
    },
    {
      id: "q2",
      question: "What is typeof null?",
      options: ["null", "undefined", "object", "number"],
      order: 2,
    },
  ],
};

const serverAnswers: Record<string, { correct: number; explanation: string }> = {
  q1: { correct: 1, explanation: "Basic arithmetic" },
  q2: { correct: 2, explanation: "Known JS quirk" },
};

beforeEach(() => {
  vi.clearAllMocks();
  checkQuizAnswer.mockImplementation(
    async ({ questionId, selectedOption }: { questionId: string; selectedOption: number }) => ({
      success: true,
      questionId,
      isCorrect: selectedOption === serverAnswers[questionId].correct,
      correctOption: serverAnswers[questionId].correct,
      explanation: serverAnswers[questionId].explanation,
    }),
  );
  submitQuizAnswers.mockResolvedValue({
    success: true,
    score: 2,
    total: 2,
    percentage: 100,
    review: [
      { questionId: "q1", isCorrect: true, correctOption: 1, explanation: "Basic arithmetic" },
      { questionId: "q2", isCorrect: true, correctOption: 2, explanation: "Known JS quirk" },
    ],
  });
});

describe("QuizStudent", () => {
  const defaultProps = {
    quiz: mockQuiz,
    allQuizzes: [],
    courseSlug: "js-course",
    courseId: "course-1",
    currentQuizId: "quiz-1",
    previousLessonSlug: null,
  };

  it("renders quiz title and first question", () => {
    render(<QuizStudent {...defaultProps} />);

    expect(screen.getByText("Quiz : JavaScript Basics")).toBeTruthy();
    expect(screen.getByText("What is 1 + 1?")).toBeTruthy();
  });

  it("shows options for current question", () => {
    render(<QuizStudent {...defaultProps} />);

    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("does not show the explanation before answering", () => {
    render(<QuizStudent {...defaultProps} />);

    expect(screen.queryByText("Basic arithmetic")).toBeNull();
    expect(checkQuizAnswer).not.toHaveBeenCalled();
  });

  it("asks the server to check the chosen option", async () => {
    render(<QuizStudent {...defaultProps} />);

    fireEvent.click(screen.getByText("2"));

    await waitFor(() =>
      expect(checkQuizAnswer).toHaveBeenCalledWith({
        quizId: "quiz-1",
        questionId: "q1",
        selectedOption: 1,
      }),
    );
  });

  it("shows correct feedback and the explanation returned by the server", async () => {
    render(<QuizStudent {...defaultProps} />);

    fireEvent.click(screen.getByText("2"));

    expect(await screen.findByText("Correct!")).toBeTruthy();
    expect(screen.getByText("Basic arithmetic")).toBeTruthy();
  });

  it("shows incorrect feedback for a wrong answer", async () => {
    render(<QuizStudent {...defaultProps} />);

    fireEvent.click(screen.getByText("3"));

    // shown on the chosen option and in the explanation panel
    expect((await screen.findAllByText("Incorrect")).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Basic arithmetic")).toBeTruthy();
  });

  it("shows next question button after answering", async () => {
    render(<QuizStudent {...defaultProps} />);

    fireEvent.click(screen.getByText("2"));

    expect(await screen.findByText("Question suivante")).toBeTruthy();
  });

  it("ignores a second click while the answer is being checked", async () => {
    render(<QuizStudent {...defaultProps} />);

    fireEvent.click(screen.getByText("2"));
    fireEvent.click(screen.getByText("3"));

    await screen.findByText("Question suivante");
    expect(checkQuizAnswer).toHaveBeenCalledTimes(1);
  });

  it("lets the user retry when the check fails", async () => {
    checkQuizAnswer.mockResolvedValueOnce({ success: false, error: "Accès refusé" });
    render(<QuizStudent {...defaultProps} />);

    fireEvent.click(screen.getByText("2"));
    await waitFor(() => expect(checkQuizAnswer).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("Question suivante")).toBeNull();

    fireEvent.click(screen.getByText("2"));
    expect(await screen.findByText("Correct!")).toBeTruthy();
  });

  it("submits the chosen answers, not a score, once the quiz is finished", async () => {
    render(<QuizStudent {...defaultProps} />);

    fireEvent.click(screen.getByText("2"));
    fireEvent.click(await screen.findByText("Question suivante"));
    fireEvent.click(await screen.findByText("object"));
    fireEvent.click(await screen.findByText(/Terminer|Voir/));

    await waitFor(() => expect(submitQuizAnswers).toHaveBeenCalledTimes(1));
    expect(submitQuizAnswers).toHaveBeenCalledWith({
      quizId: "quiz-1",
      courseId: "course-1",
      answers: [
        { questionId: "q1", selectedOption: 1 },
        { questionId: "q2", selectedOption: 2 },
      ],
    });
  });

  it("shows progress bar", () => {
    render(<QuizStudent {...defaultProps} />);

    expect(screen.getByText("Progression")).toBeTruthy();
  });

  it("shows question count badge", () => {
    render(<QuizStudent {...defaultProps} />);

    expect(screen.getByText("2 questions")).toBeTruthy();
  });
});
