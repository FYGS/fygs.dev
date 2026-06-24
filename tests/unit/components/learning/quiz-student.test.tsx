/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

vi.mock("@/app/actions/quiz-actions", () => ({
  submitQuizResult: vi.fn().mockResolvedValue({ success: true }),
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
      correct: 1,
      explanation: "Basic arithmetic",
      order: 1,
    },
    {
      id: "q2",
      question: "What is typeof null?",
      options: ["null", "undefined", "object", "number"],
      correct: 2,
      explanation: "Known JS quirk",
      order: 2,
    },
  ],
};

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

  it("shows correct/incorrect feedback after answering", () => {
    render(<QuizStudent {...defaultProps} />);

    // Select the correct answer (index 1 = "2")
    fireEvent.click(screen.getByText("2"));

    expect(screen.getByText("Correct!")).toBeTruthy();
    expect(screen.getByText("Basic arithmetic")).toBeTruthy();
  });

  it("shows next question button after answering", () => {
    render(<QuizStudent {...defaultProps} />);

    fireEvent.click(screen.getByText("2"));

    expect(screen.getByText("Question suivante")).toBeTruthy();
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
