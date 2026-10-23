/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { CourseCurriculum } from "@/app/[locale]/(main)/formations/[slug]/_components/course-curriculum";
import { CourseResumeBanner } from "@/app/[locale]/(main)/formations/[slug]/_components/course-resume-banner";
import { LockedNotice } from "@/app/[locale]/(main)/formations/[slug]/_components/locked-notice";
import { CatalogPager } from "@/app/[locale]/(main)/formations/_components/catalog-pager";
import { ExamRunner } from "@/components/learning/exam-runner";
import { buildCurriculumView, curriculumStats } from "@/lib/learning/curriculum-view";
import { renderInLearning, sampleOutline } from "../../../support/learning-fixtures";

const m = vi.hoisted(() => ({ start: vi.fn(), submit: vi.fn() }));
vi.mock("@/app/actions/exam-actions", () => ({ startFinalExam: m.start, submitFinalExam: m.submit }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));
vi.mock("next/link", () => ({
  default: ({ children, href, prefetch: _p, ...props }: { children: React.ReactNode; href: string; prefetch?: boolean }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

beforeEach(() => vi.clearAllMocks());

describe("CourseCurriculum", () => {
  const outline = sampleOutline();
  const sections = buildCurriculumView(outline, "react", {
    isDone: (i) => i.id === "l1",
    nextId: "l2",
    canOpen: (i) => i.kind === "lesson" && i.id !== "l3",
  });
  const render_ = () => render(<CourseCurriculum sections={sections} stats={curriculumStats(outline)} resourceCount={3} initiallyOpen={0} />);

  it("summarises the course, resources included", () => {
    render_();
    expect(screen.getByText(/2 modules · 3 leçons · 1 quiz · examen final · 3 ressources · 30 min/)).toBeTruthy();
  });

  it("opens the section of the next step and links what can be opened", () => {
    render_();
    expect(screen.getByRole("link", { name: /Variables/ }).getAttribute("href")).toBe("/learn/react/lessons/variables");
    expect(screen.getByText("Aperçu")).toBeTruthy();
    expect(screen.getByText("Suivant")).toBeTruthy();
    expect(screen.getByText(/\(terminé\)/)).toBeTruthy();
    // the second module is closed until the learner opens it
    expect(screen.queryByText("Asynchrone")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Avancé/ }));
    expect(screen.getByText("Asynchrone")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Asynchrone/ })).toBeNull(); // not openable for this visitor
  });

  it("says when the course has no content yet", () => {
    render(<CourseCurriculum sections={[]} stats={{ modules: 0, lessons: 0, quizzes: 0, hasExam: false, minutes: 0 }} resourceCount={0} initiallyOpen={0} />);
    expect(screen.getByText("Le contenu de cette formation sera bientôt disponible.")).toBeTruthy();
  });
});

describe("CourseResumeBanner", () => {
  it("continues where the learner left off", () => {
    render(
      <CourseResumeBanner percent={40} done={2} total={5} next={{ title: "Quiz des bases", href: "/learn/react/quizzes/q1" }} completedHref="/learn/react/completed" hasCertificate={false} />,
    );
    expect(screen.getByText("2 étapes sur 5")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Reprendre/ }).getAttribute("href")).toBe("/learn/react/quizzes/q1");
    expect(screen.getByText("Quiz des bases")).toBeTruthy();
  });

  it("offers to start when nothing is done, and the certificate when everything is", () => {
    const { rerender } = render(
      <CourseResumeBanner percent={0} done={0} total={5} next={{ title: "Variables", href: "/learn/react/lessons/variables" }} completedHref="/learn/react/completed" hasCertificate={false} />,
    );
    expect(screen.getByRole("link", { name: /Commencer/ })).toBeTruthy();
    rerender(<CourseResumeBanner percent={100} done={5} total={5} next={null} completedHref="/learn/react/completed" hasCertificate />);
    expect(screen.getByRole("link", { name: /Voir mon certificat/ }).getAttribute("href")).toBe("/learn/react/completed");
  });
});

describe("LockedNotice", () => {
  it("tells an expired subscriber their progress is kept, and where to renew", () => {
    render(<LockedNotice reason="premium_locked" signedIn />);
    expect(screen.getByRole("alert").textContent).toContain("n’est plus actif");
    expect(screen.getByRole("link", { name: "Voir les abonnements" }).getAttribute("href")).toBe("/pricing");
  });

  it("asks a visitor to sign in, and a signed-in one to enrol", () => {
    const { rerender } = render(<LockedNotice reason="not_enrolled" signedIn={false} />);
    expect(screen.getByRole("link", { name: "Se connecter" })).toBeTruthy();
    rerender(<LockedNotice reason="not_enrolled" signedIn />);
    expect(screen.getByRole("alert").textContent).toContain("Inscrivez-vous");
    expect(screen.queryByRole("link", { name: "Se connecter" })).toBeNull();
  });
});

describe("CatalogPager", () => {
  it("renders nothing for a single page", () => {
    const { container } = render(<CatalogPager page={1} pageCount={1} params={{}} />);
    expect(container.innerHTML).toBe("");
  });

  it("keeps the filters in every link and marks the current page", () => {
    render(<CatalogPager page={3} pageCount={6} params={{ category: "CLOUD", sort: "recent", search: undefined }} />);
    const nav = screen.getByRole("navigation", { name: "Pagination du catalogue" });
    expect(within(nav).getByRole("link", { name: /Précédent/ }).getAttribute("href")).toBe("/formations?category=CLOUD&sort=recent&page=2#courses");
    expect(within(nav).getByRole("link", { name: /Suivant/ }).getAttribute("href")).toBe("/formations?category=CLOUD&sort=recent&page=4#courses");
    expect(within(nav).getByRole("link", { name: "Page 3" }).getAttribute("aria-current")).toBe("page");
    expect(within(nav).getByRole("link", { name: "Page 1" }).getAttribute("href")).toBe("/formations?category=CLOUD&sort=recent#courses");
  });
});

describe("ExamRunner", () => {
  const exam = { id: "x1", title: "Examen final", description: "Tout le cours", passingScore: 70, timeLimit: null, questionCount: 2 };
  const sitting = {
    success: true as const,
    token: "t",
    startedAt: Date.now(),
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
    review: [
      { index: 0, isCorrect: true, selected: 1, correctOption: 1, explanation: "parce que b" },
      { index: 1, isCorrect: false, selected: null, correctOption: 0, explanation: "" },
    ],
    course: { percent: 80, isComplete: false, justIssued: false, certificate: null },
  };
  const run = (props = {}) => renderInLearning(<ExamRunner courseId="c1" exam={exam} last={null} blockedMessage={null} {...props} />);

  it("explains the rules before starting", () => {
    run();
    expect(screen.getByText(/2 questions/)).toBeTruthy();
    expect(screen.getByText(/Seuil de réussite : 70%/)).toBeTruthy();
    expect(screen.getByText(/Pas de limite de temps/)).toBeTruthy();
  });

  it("takes the sitting with radio groups, sends all the answers once, and shows the correction", async () => {
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
    expect(screen.getByText("parce que b")).toBeTruthy();
    expect(screen.getByText(/Pas de réponse/)).toBeTruthy();
  });

  it("says why it cannot start, before any attempt", () => {
    run({ blockedMessage: "Vous pourrez repasser l’examen dans 15 min.", last: { percentage: 40, passed: false } });
    expect(screen.getByRole("status").textContent).toContain("dans 15 min");
    expect(screen.queryByRole("button", { name: /Commencer l’examen/ })).toBeNull();
    expect(screen.getByText("Non réussi")).toBeTruthy();
  });
});
