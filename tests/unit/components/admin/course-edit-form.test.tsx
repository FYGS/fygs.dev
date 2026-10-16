import { createHash } from "crypto";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { renderWalk } from "../../visualizations/render-walk";

const h = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
  updateCourse: vi.fn(),
  deleteCourse: vi.fn(),
  autoSave: { status: "idle", lastSaved: null as Date | null, last: null as null | Record<string, unknown> },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.push, refresh: h.refresh }),
}));
vi.mock("sonner", () => ({ toast: h.toast }));
vi.mock("@/app/[locale]/(admin)/admin/courses/[id]/_actions/edit-course", () => ({
  updateCourse: (...a: unknown[]) => h.updateCourse(...a),
  deleteCourse: (...a: unknown[]) => h.deleteCourse(...a),
}));
vi.mock("@/hooks/use-auto-save", () => ({
  useAutoSave: (opts: Record<string, unknown>) => {
    h.autoSave.last = opts;
    return { status: h.autoSave.status, lastSaved: h.autoSave.lastSaved, save: vi.fn() };
  },
}));

// Radix Switch measures its thumb with ResizeObserver (absent from jsdom)
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

import { CourseEditForm } from "@/app/[locale]/(admin)/admin/courses/[id]/_components/course-edit-form";

const tags = [
  { id: "t1", name: "React", color: "#61dafb" },
  { id: "t2", name: "Next", color: "#000000" },
  { id: "t3", name: "Node", color: "#00ff00" },
];
const course = (over: Record<string, unknown> = {}) =>
  ({
    id: "c1",
    title: "Intro React",
    slug: "intro-react",
    description: "Une description suffisamment longue",
    category: "JAVASCRIPT",
    level: "BEGINNER",
    accessTier: "FREE",
    price: 19.5,
    duration: 90,
    published: false,
    featured: true,
    previewEnabled: true,
    thumbnail: "https://img.test/c.png",
    publicStructure: "# Structure",
    publicResources: null,
    publicEvaluation: "Quiz",
    publicPrerequisites: null,
    trailerUrl: "https://v.test/t.mp4",
    faq: [{ q: "Q?", a: "A" }],
    tags: [{ tag: tags[0] }],
    modules: [],
    ...over,
  }) as never;

const norm = (html: string) =>
  html.replace(/_r_[0-9a-z]+_/g, "_r_X_").replace(/<svg[\s\S]*?<\/svg>/g, "<svg/>");
const hash = (s: string) => createHash("md5").update(s).digest("hex");

describe("CourseEditForm (pinned DOM + behaviour)", () => {
  it("renders the same DOM through a click walk (draft)", () => {
    expect(renderWalk(() => <CourseEditForm course={course()} tags={tags} />)).toMatchSnapshot();
  });

  it("renders the same DOM through a click walk (published, minimal course)", () => {
    expect(
      renderWalk(
        () => <CourseEditForm course={course({ published: true, price: null, duration: null, thumbnail: null, faq: null, tags: [] })} tags={tags} />,
        1,
      ),
    ).toMatchSnapshot();
  });

  it("renders the auto-save indicator states", () => {
    const out: Record<string, string> = {};
    for (const status of ["idle", "saving", "saved", "error"]) {
      h.autoSave.status = status;
      h.autoSave.lastSaved = status === "saved" ? new Date("2030-01-01T10:00:00Z") : null;
      const { container, unmount } = render(<CourseEditForm course={course()} tags={tags} />);
      out[status] = hash(norm(container.innerHTML));
      unmount();
    }
    h.autoSave.status = "idle";
    h.autoSave.lastSaved = null;
    expect(out).toMatchSnapshot();
  });

  it("slug follows the title, tags toggle, submit sends the payload", async () => {
    h.updateCourse.mockReset();
    h.refresh.mockReset();
    h.toast.success.mockReset();
    h.toast.error.mockReset();
    h.updateCourse.mockResolvedValue({ success: true });
    const { container, getByPlaceholderText, getAllByText, getByText } = render(
      <CourseEditForm course={course()} tags={tags} />,
    );
    fireEvent.change(getByPlaceholderText("Ex: Introduction à React"), {
      target: { value: "Nouveau Titre  Génial!" },
    });
    expect((getByPlaceholderText("introduction-a-react") as HTMLInputElement).value).toMatchSnapshot();
    fireEvent.click(getAllByText("Next")[0]);
    fireEvent.click(getAllByText("React")[0]);
    expect(hash(norm(container.innerHTML))).toMatchSnapshot();

    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(h.updateCourse).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(h.refresh).toHaveBeenCalled());
    expect(h.updateCourse.mock.calls[0]).toMatchSnapshot();
    expect(h.toast.success.mock.calls).toMatchSnapshot();

    // the auto-save callback uses the current selection too
    const onSave = h.autoSave.last!.onSave as (d: unknown) => Promise<unknown>;
    h.updateCourse.mockResolvedValueOnce({ success: false, error: "nope" });
    const r1 = await onSave({ title: "x" });
    h.updateCourse.mockRejectedValueOnce(new Error("net"));
    const r2 = await onSave({ title: "y" });
    expect([r1, r2, h.updateCourse.mock.calls.slice(1)]).toMatchSnapshot();
    void getByText;
  });

  it("reports update errors", async () => {
    h.updateCourse.mockReset();
    h.toast.error.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
    h.updateCourse.mockResolvedValueOnce({ success: false, error: "Slug pris" });
    h.updateCourse.mockRejectedValueOnce(new Error("boom"));
    const { container } = render(<CourseEditForm course={course()} tags={tags} />);
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(h.toast.error).toHaveBeenCalledTimes(1));
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(h.toast.error).toHaveBeenCalledTimes(2));
    expect(h.toast.error.mock.calls).toMatchSnapshot();
  });

  it("delete flow: confirm dialog, success, failure", async () => {
    h.deleteCourse.mockReset();
    h.push.mockReset();
    h.toast.success.mockReset();
    h.toast.error.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
    h.deleteCourse.mockResolvedValueOnce({ success: true });
    h.deleteCourse.mockResolvedValueOnce({ success: false, error: "Impossible" });
    h.deleteCourse.mockRejectedValueOnce(new Error("boom"));
    const { getByText } = render(<CourseEditForm course={course()} tags={tags} />);
    for (let i = 0; i < 3; i++) {
      fireEvent.mouseDown(getByText("Supprimer"), { button: 0 });
      fireEvent.click(getByText("Supprimer"));
      const confirm = await screen.findByText("Supprimer définitivement");
      fireEvent.click(confirm);
      await waitFor(() => expect(h.deleteCourse).toHaveBeenCalledTimes(i + 1));
      await waitFor(() => expect(h.toast.success.mock.calls.length + h.toast.error.mock.calls.length).toBe(i + 1));
    }
    expect(h.deleteCourse.mock.calls).toMatchSnapshot();
    expect(h.push.mock.calls).toMatchSnapshot();
    expect([h.toast.success.mock.calls, h.toast.error.mock.calls]).toMatchSnapshot();
  });
});
