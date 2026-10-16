import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";

import { renderWalk } from "../../visualizations/render-walk";

const h = vi.hoisted(() => ({
  refresh: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
  createModule: vi.fn(),
  deleteModule: vi.fn(),
  reorderModules: vi.fn(),
  createLessonInline: vi.fn(),
  updateLessonInline: vi.fn(),
  deleteLessonInline: vi.fn(),
  reorderLessons: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: h.refresh, push: vi.fn() }),
}));
vi.mock("sonner", () => ({ toast: h.toast }));
vi.mock("@/app/[locale]/(admin)/admin/courses/[id]/_actions/module-actions", () => ({
  createModule: (...a: unknown[]) => h.createModule(...a),
  deleteModule: (...a: unknown[]) => h.deleteModule(...a),
  reorderModules: (...a: unknown[]) => h.reorderModules(...a),
}));
vi.mock("@/app/[locale]/(admin)/admin/courses/[id]/_actions/lesson-actions", () => ({
  createLessonInline: (...a: unknown[]) => h.createLessonInline(...a),
  updateLessonInline: (...a: unknown[]) => h.updateLessonInline(...a),
  deleteLessonInline: (...a: unknown[]) => h.deleteLessonInline(...a),
  reorderLessons: (...a: unknown[]) => h.reorderLessons(...a),
}));

import { CurriculumTab } from "@/app/[locale]/(admin)/admin/courses/[id]/_components/curriculum-tab";

const modules = [
  {
    id: "m1", title: "Introduction", slug: "introduction", order: 1,
    lessons: [
      { id: "l1", title: "Bienvenue", slug: "bienvenue", order: 1, published: true, duration: 5 },
      { id: "l2", title: "Prérequis", slug: "prerequis", order: 2, published: false, duration: null },
    ],
  },
  { id: "m2", title: "Fondamentaux", slug: "fondamentaux", order: 2, lessons: [] },
];

describe("CurriculumTab (pinned DOM)", () => {
  it("click walk with modules", () => {
    expect(renderWalk(() => <CurriculumTab courseId="c1" modules={modules} />, 3)).toMatchSnapshot();
  });

  it("click walk with no modules (empty state)", () => {
    expect(renderWalk(() => <CurriculumTab courseId="c1" modules={[]} />, 2)).toMatchSnapshot();
  });

  it("add module / add lesson / delete lesson flows call the actions", async () => {
    for (const k of Object.keys(h)) {
      const v = (h as Record<string, unknown>)[k];
      if (typeof v === "function" && "mockReset" in (v as object)) (v as { mockReset: () => void }).mockReset();
    }
    h.createModule.mockResolvedValue({ success: true, module: { id: "new" } });
    h.createLessonInline.mockResolvedValue({ success: true, lesson: { id: "nl" } });
    h.deleteLessonInline.mockResolvedValue({ success: true });
    h.updateLessonInline.mockResolvedValue({ success: true, lesson: {} });
    h.deleteModule.mockResolvedValue({ success: true });
    const { getByText, getAllByRole, container } = render(<CurriculumTab courseId="c1" modules={modules} />);
    fireEvent.click(getByText("Ajouter un module"));
    const input = container.querySelector("input")!;
    fireEvent.change(input, { target: { value: "Nouveau module" } });
    fireEvent.submit(input.closest("form")!);
    await waitFor(() => expect(h.createModule).toHaveBeenCalled());
    expect(h.createModule.mock.calls).toMatchSnapshot();
    expect(h.toast.success.mock.calls).toMatchSnapshot();
    expect(h.refresh).toHaveBeenCalled();
    void getAllByRole;
  });
});
