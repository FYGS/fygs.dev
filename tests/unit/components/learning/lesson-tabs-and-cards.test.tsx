/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LessonTabs } from "@/components/learning/lesson-tabs";
import { MyCourseCard, courseStatusLabel } from "@/components/dashboard/my-course-card";
import type { CourseProgressSummary } from "@/lib/progress-summary";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}));
vi.mock("@/components/learning/lesson-notes", () => ({ LessonNotes: () => <p>Les notes de la leçon</p> }));
vi.mock("@/app/actions/lesson-questions", () => ({ askLessonQuestion: vi.fn() }));

const tabs = (over: Partial<React.ComponentProps<typeof LessonTabs>> = {}) =>
  render(
    <LessonTabs
      lessonId="l1"
      content={<p>Le texte de la leçon</p>}
      transcript={null}
      captionsDownload={null}
      timedVideo
      notes={[]}
      resources={[]}
      questions={[]}
      canAsk
      signedIn
      loginHref="/auth/login?callbackUrl=%2Flearn%2Freact%2Flessons%2Fintro"
      {...over}
    />,
  );

/** Radix tabs switch on mouse down (and on keyboard focus), not on click. */
const openTab = (name: RegExp) => fireEvent.mouseDown(screen.getByRole("tab", { name }), { button: 0 });

describe("LessonTabs", () => {
  it("opens on the lesson text and only lists the tabs that have something", () => {
    tabs();
    expect(screen.getByText("Le texte de la leçon")).toBeTruthy();
    expect(screen.queryByRole("tab", { name: /Transcription/ })).toBeNull();
    expect(screen.queryByRole("tab", { name: /Ressources/ })).toBeNull();
    expect(screen.getByRole("tab", { name: /Mes notes/ })).toBeTruthy();
  });

  it("offers the transcript and the captions file", () => {
    tabs({ transcript: "Bonjour à tous.", captionsDownload: "/api/learn/captions/l1" });
    openTab(/Transcription/);
    expect(screen.getByText("Bonjour à tous.")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Télécharger les sous-titres/ }).getAttribute("href")).toBe("/api/learn/captions/l1?download=1");
  });

  it("never shows the stored address of an uploaded file: a download goes through the site, a link goes to its own address", () => {
    tabs({
      resources: [
        { id: "r1", title: "Support de cours", url: "https://media.fygs.test/resources/u1/1-a.pdf", kind: "FILE", sizeBytes: 2048 },
        { id: "r2", title: "Documentation", url: "https://developer.example.org/docs", kind: "LINK", sizeBytes: null },
      ],
    });
    openTab(/Ressources/);
    const file = screen.getByRole("link", { name: /Support de cours/ });
    expect(file.getAttribute("href")).toBe("/api/learn/resource/r1");
    expect(file.hasAttribute("download")).toBe(true);
    const link = screen.getByRole("link", { name: /Documentation/ });
    expect(link.getAttribute("href")).toBe("https://developer.example.org/docs");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(document.body.innerHTML).not.toContain("media.fygs.test");
  });

  it("asks a visitor to sign in for notes and questions, and brings them back to the lesson", () => {
    tabs({ signedIn: false, canAsk: false });
    openTab(/Mes notes/);
    expect(screen.queryByText("Les notes de la leçon")).toBeNull();
    expect(screen.getByRole("link", { name: "Se connecter" }).getAttribute("href")).toBe(
      "/auth/login?callbackUrl=%2Flearn%2Freact%2Flessons%2Fintro",
    );
  });
});

const summary = (over: Partial<CourseProgressSummary> = {}): CourseProgressSummary => ({
  courseId: "c1",
  title: "React",
  slug: "react",
  description: "",
  thumbnail: null,
  category: "FRONTEND",
  level: "BEGINNER",
  enrolledAt: new Date("2026-10-01"),
  lastActivityAt: new Date("2026-10-20"),
  percent: 40,
  done: 2,
  total: 5,
  completedLessons: 2,
  totalLessons: 4,
  totalDurationSec: 3600,
  consumedDurationSec: 1200,
  hasCertificate: false,
  hasAccess: true,
  lapsed: null,
  published: true,
  isComplete: false,
  continueHref: "/learn/react/lessons/hooks",
  nextStepTitle: "Les hooks",
  ...over,
});

describe("MyCourseCard", () => {
  it("leads to the next step, named", () => {
    render(<MyCourseCard course={summary()} lifetime={false} />);
    expect(screen.getByText("Les hooks")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Continuer/ }).getAttribute("href")).toBe("/learn/react/lessons/hooks");
    expect(screen.getByText("Frontend")).toBeTruthy();
    expect(screen.getByText("Débutant")).toBeTruthy();
  });

  it("says when the access ended, keeps the progress and leads to the course page", () => {
    const course = summary({ hasAccess: false, lapsed: "subscription_ended", continueHref: "/formations/react", nextStepTitle: null });
    render(<MyCourseCard course={course} lifetime={false} />);
    expect(courseStatusLabel(course)).toBe("Accès expiré");
    expect(screen.getByText(/progression est conservée/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Voir comment reprendre/ }).getAttribute("href")).toBe("/formations/react");
  });

  it("marks a finished course and links its certificate with a real target", () => {
    render(<MyCourseCard course={summary({ isComplete: true, hasCertificate: true, percent: 100 })} lifetime={false} />);
    expect(screen.getByText("Terminée")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Certificat/ }).getAttribute("href")).toBe("/certificates/c1");
  });

  it("does not call an empty course finished", () => {
    const course = summary({ total: 0, done: 0, percent: 0, nextStepTitle: null });
    render(<MyCourseCard course={course} lifetime={false} />);
    expect(courseStatusLabel(course)).toBeNull();
    expect(screen.getByText("Pas encore d’étape publiée")).toBeTruthy();
  });
});
