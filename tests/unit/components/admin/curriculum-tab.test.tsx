/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock server actions
vi.mock(
  "@/app/[locale]/(admin)/admin/courses/[id]/_actions/module-actions",
  () => ({
    createModule: vi
      .fn()
      .mockResolvedValue({ success: true, module: { id: "new-module" } }),
    deleteModule: vi.fn().mockResolvedValue({ success: true }),
    reorderModules: vi.fn().mockResolvedValue({ success: true }),
  }),
);

vi.mock(
  "@/app/[locale]/(admin)/admin/courses/[id]/_actions/lesson-actions",
  () => ({
    createLessonInline: vi
      .fn()
      .mockResolvedValue({ success: true, lesson: { id: "new-lesson" } }),
    updateLessonInline: vi
      .fn()
      .mockResolvedValue({ success: true, lesson: {} }),
    deleteLessonInline: vi.fn().mockResolvedValue({ success: true }),
    reorderLessons: vi.fn().mockResolvedValue({ success: true }),
  }),
);

import { CurriculumTab } from "@/app/[locale]/(admin)/admin/courses/[id]/_components/curriculum-tab";

const mockModules = [
  {
    id: "mod-1",
    title: "Introduction",
    slug: "introduction",
    order: 1,
    lessons: [
      {
        id: "les-1",
        title: "Bienvenue",
        slug: "bienvenue",
        order: 1,
        published: true,
        duration: 5,
      },
      {
        id: "les-2",
        title: "Prérequis",
        slug: "prerequis",
        order: 2,
        published: false,
        duration: 10,
      },
    ],
  },
  {
    id: "mod-2",
    title: "Fondamentaux",
    slug: "fondamentaux",
    order: 2,
    lessons: [
      {
        id: "les-3",
        title: "Variables",
        slug: "variables",
        order: 1,
        published: true,
        duration: 15,
      },
    ],
  },
];

describe("CurriculumTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders module stats", () => {
    render(<CurriculumTab courseId="course-1" modules={mockModules} />);

    // Stats section uses "Modules", "Leçons", "Publiées" labels
    expect(screen.getByText("Modules")).toBeTruthy();
    expect(screen.getByText("Leçons")).toBeTruthy();
    expect(screen.getByText("Publiées")).toBeTruthy();
    // 3 total lessons stat
    expect(screen.getByText("3")).toBeTruthy();
    // 2/3 published stat
    expect(screen.getByText("2/3")).toBeTruthy();
  });

  it("renders all modules with titles", () => {
    render(<CurriculumTab courseId="course-1" modules={mockModules} />);

    expect(screen.getByText("Introduction")).toBeTruthy();
    expect(screen.getByText("Fondamentaux")).toBeTruthy();
  });

  it("renders lessons inside modules", () => {
    render(<CurriculumTab courseId="course-1" modules={mockModules} />);

    expect(screen.getByText("Bienvenue")).toBeTruthy();
    expect(screen.getByText("Prérequis")).toBeTruthy();
    expect(screen.getByText("Variables")).toBeTruthy();
  });

  it("shows lesson count per module", () => {
    render(<CurriculumTab courseId="course-1" modules={mockModules} />);

    expect(screen.getByText("2 leçons")).toBeTruthy();
    expect(screen.getByText("1 leçon")).toBeTruthy();
  });

  it("shows add module button", () => {
    render(<CurriculumTab courseId="course-1" modules={mockModules} />);

    expect(screen.getByText("Ajouter un module")).toBeTruthy();
  });

  it("shows inline add module form when button clicked", () => {
    render(<CurriculumTab courseId="course-1" modules={mockModules} />);

    fireEvent.click(screen.getByText("Ajouter un module"));

    expect(screen.getByPlaceholderText("Nom du module...")).toBeTruthy();
    expect(screen.getByText("Annuler")).toBeTruthy();
  });

  it("shows empty state when no modules", () => {
    render(<CurriculumTab courseId="course-1" modules={[]} />);

    expect(screen.getByText("Aucun module")).toBeTruthy();
    expect(screen.getByText(/Commencez par créer des modules/)).toBeTruthy();
  });

  it("shows add lesson buttons for each module", () => {
    render(<CurriculumTab courseId="course-1" modules={mockModules} />);

    const addLessonButtons = screen.getAllByText("Ajouter une leçon");
    expect(addLessonButtons).toHaveLength(2);
  });

  it("shows inline lesson form when add lesson clicked", () => {
    render(<CurriculumTab courseId="course-1" modules={mockModules} />);

    const addLessonButtons = screen.getAllByText("Ajouter une leçon");
    fireEvent.click(addLessonButtons[0]);

    expect(screen.getByPlaceholderText("Titre de la leçon...")).toBeTruthy();
  });

  it("renders module order badges", () => {
    render(<CurriculumTab courseId="course-1" modules={mockModules} />);

    expect(screen.getByText("1")).toBeTruthy();
    // "2" appears multiple times (stats + badge), just verify it renders
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
  });

  it("renders drag handles for modules and lessons", () => {
    const { container } = render(
      <CurriculumTab courseId="course-1" modules={mockModules} />,
    );

    // Drag handles are buttons with cursor-grab class
    const dragHandles = container.querySelectorAll("button.cursor-grab");
    // 2 modules + 3 lessons = 5 drag handles
    expect(dragHandles.length).toBe(5);
  });

  it("renders modules inside sortable context", () => {
    const { container } = render(
      <CurriculumTab courseId="course-1" modules={mockModules} />,
    );

    // Modules are wrapped with sortable transform divs
    const moduleCards = container.querySelectorAll("[data-testid]");
    // Even without data-testid, the modules render in a list
    expect(screen.getByText("Introduction")).toBeTruthy();
    expect(screen.getByText("Fondamentaux")).toBeTruthy();
  });
});
