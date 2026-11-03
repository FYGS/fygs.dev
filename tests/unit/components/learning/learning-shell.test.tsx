/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, within, render } from "@testing-library/react";
import { LearningShell } from "@/components/learning/learning-shell";
import { LearningSidebar } from "@/components/learning/learning-sidebar";
import { LearningTopBar } from "@/components/learning/learning-top-bar";
import { renderInLearning, sampleOutline } from "../../../support/learning-fixtures";

const m = vi.hoisted(() => ({ pathname: "/fr/learn/react/lessons/fonctions" }));

vi.mock("next/navigation", () => ({
  usePathname: () => m.pathname,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

beforeEach(() => {
  m.pathname = "/fr/learn/react/lessons/fonctions";
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("min-width") ? false : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

describe("LearningSidebar", () => {
  const sidebar = (state = {}, props: Partial<React.ComponentProps<typeof LearningSidebar>> = {}) =>
    renderInLearning(<LearningSidebar hidden={false} collapsedOnDesktop={false} onNavigate={vi.fn()} {...props} />, state);

  it("lists the sections in course order, the quiz after its lessons and the exam last", () => {
    sidebar();
    const links = screen.getAllByRole("link").map((a) => a.textContent);
    expect(links.findIndex((t) => t?.includes("Variables"))).toBeLessThan(links.findIndex((t) => t?.includes("Fonctions")));
    expect(links.findIndex((t) => t?.includes("Fonctions"))).toBeLessThan(links.findIndex((t) => t?.includes("Quiz des bases")));
    expect(links.at(-1)).toContain("Examen final");
  });

  it("marks the current item and the done ones, and counts per module", () => {
    sidebar({ completed: ["l1"] });
    expect(screen.getByRole("link", { name: /Fonctions/ }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByText(/\(terminé\)/)).toBeTruthy();
    expect(within(screen.getByRole("button", { name: /Bases/ })).getByText(/1\/3/)).toBeTruthy();
  });

  it("points the learner at the next step instead of locking anything", () => {
    m.pathname = "/fr/learn/react/lessons/variables";
    sidebar({ completed: ["l1"] });
    expect(within(screen.getByRole("link", { name: /Fonctions/ })).getByText("Suivant")).toBeTruthy();
    // every item is a real link: no lock, no disabled entry
    for (const link of screen.getAllByRole("link")) expect(link.getAttribute("href")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Examen final/ }).getAttribute("href")).toBe("/learn/react/exam");
  });

  it("sends an item the visitor cannot open (a preview) to the course page", () => {
    sidebar({ mode: "preview", openable: ["l1"] });
    expect(screen.getByRole("link", { name: /Fonctions/ }).getAttribute("href")).toBe("/formations/react");
    expect(screen.getByRole("link", { name: /Variables/ }).getAttribute("href")).toBe("/learn/react/lessons/variables");
  });

  it("is out of reach of the keyboard when hidden", () => {
    const { container } = sidebar({}, { hidden: true });
    expect(container.querySelector("aside")?.hasAttribute("inert")).toBe(true);
  });

  it("closes the panel on a small screen when a link is followed", () => {
    const onNavigate = vi.fn();
    sidebar({}, { onNavigate });
    fireEvent.click(screen.getByRole("link", { name: /Variables/ }));
    expect(onNavigate).toHaveBeenCalled();
  });

  it("offers the visual supports only when the course has some", () => {
    sidebar({ hasSupports: true });
    expect(screen.getByRole("link", { name: /Supports visuels/ }).getAttribute("href")).toBe("/learn/react/supports");
  });
});

describe("LearningTopBar", () => {
  it("shows the course, the current item, the progress and a way out", () => {
    renderInLearning(<LearningTopBar sidebarOpen onToggleSidebar={vi.fn()} />, { completed: ["l1", "l2"] });
    expect(screen.getByText("React")).toBeTruthy();
    expect(screen.getByText("Fonctions")).toBeTruthy();
    expect(screen.getByText("40 %")).toBeTruthy(); // 2 of 5 items
    expect(screen.getByRole("link", { name: /Quitter/ }).getAttribute("href")).toBe("/formations/react");
  });

  it("names the toggle by what it does", () => {
    const onToggle = vi.fn();
    renderInLearning(<LearningTopBar sidebarOpen={false} onToggleSidebar={onToggle} />);
    fireEvent.click(screen.getByRole("button", { name: "Afficher le plan de la formation" }));
    expect(onToggle).toHaveBeenCalled();
  });

  it("hides the progress for a preview", () => {
    renderInLearning(<LearningTopBar sidebarOpen onToggleSidebar={vi.fn()} />, { mode: "preview" });
    expect(screen.queryByText("0%")).toBeNull();
  });
});

describe("LearningShell", () => {
  const shell = () =>
    render(
      <LearningShell
        courseSlug="react"
        courseTitle="React"
        mode="full"
        outline={sampleOutline()}
        openableIds={sampleOutline().items.map((i) => i.id)}
        completedLessonIds={[]}
        passedQuizIds={[]}
        examPassed={false}
        hasSupports={false}
      >
        <p>Contenu de la leçon</p>
      </LearningShell>,
    );

  it("has a single main landmark holding the page", () => {
    shell();
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(within(screen.getByRole("main")).getByText("Contenu de la leçon")).toBeTruthy();
  });

  it("starts with the plan closed on a small screen and opens it from the top bar", () => {
    const { container } = shell();
    const aside = container.querySelector("aside")!;
    expect(aside.hasAttribute("inert")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Afficher le plan de la formation" }));
    expect(aside.hasAttribute("inert")).toBe(false);
  });

  it("closes the plan with Escape and when a link is followed", () => {
    const { container } = shell();
    const aside = container.querySelector("aside")!;
    fireEvent.click(screen.getByRole("button", { name: "Afficher le plan de la formation" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(aside.hasAttribute("inert")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Afficher le plan de la formation" }));
    fireEvent.click(within(aside).getByRole("link", { name: /Variables/ }));
    expect(aside.hasAttribute("inert")).toBe(true);
  });

  describe("the bar of small screens", () => {
    const bar = () => shell().container.querySelector("nav.learning-mobile-bar")!;

    it("carries the class the stylesheet uses to lift the floating buttons above it", () => {
      expect(bar()).toBeTruthy();
    });

    it("has no control without a name: at the ends of the course the missing step is only a space", () => {
      m.pathname = `/fr/learn/react/lessons/${sampleOutline().items.find((i) => i.kind === "lesson")!.slug}`;
      const mobile = bar();
      for (const control of mobile.querySelectorAll("a, button")) {
        expect(control.getAttribute("aria-label") ?? control.textContent?.trim(), control.outerHTML).toBeTruthy();
      }
      expect(mobile.querySelectorAll("button[disabled]")).toHaveLength(0);
    });
  });
});
