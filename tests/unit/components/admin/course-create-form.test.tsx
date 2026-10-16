import { createHash } from "crypto";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";

import { renderWalk } from "../../visualizations/render-walk";

const { push, toast, createCourse } = vi.hoisted(() => ({
  push: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
  createCourse: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
}));
vi.mock("sonner", () => ({ toast }));
vi.mock("@/app/[locale]/(admin)/admin/_actions/create-course", () => ({
  createCourse: (...a: unknown[]) => createCourse(...a),
}));
vi.mock("@/app/[locale]/(admin)/admin/courses/_actions/create-course", () => ({
  createCourse: (...a: unknown[]) => createCourse(...a),
}));

import { CourseCreateForm } from "@/app/[locale]/(admin)/admin/courses/new/_components/course-create-form";

// Radix Switch measures its thumb with ResizeObserver (absent from jsdom)
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

const tags = [
  { id: "t1", name: "React", color: "#61dafb" },
  { id: "t2", name: "Next", color: "#000000" },
];
const norm = (html: string) =>
  html.replace(/_r_[0-9a-z]+_/g, "_r_X_").replace(/<svg[\s\S]*?<\/svg>/g, "<svg/>");
const hash = (s: string) => createHash("md5").update(s).digest("hex");

describe("CourseCreateForm (pinned DOM + behaviour)", () => {
  it("renders the same DOM through a click walk", () => {
    expect(renderWalk(() => <CourseCreateForm tags={tags} />)).toMatchSnapshot();
  });

  it("renders without tags", () => {
    expect(renderWalk(() => <CourseCreateForm tags={undefined as never} />, 1)).toMatchSnapshot();
  });

  it("initial markup is stable", () => {
    const { container } = render(<CourseCreateForm tags={tags} />);
    expect(hash(norm(container.innerHTML))).toMatchSnapshot();
    expect(norm(container.innerHTML).length).toMatchSnapshot();
  });

  it("title typing generates the slug; tags toggle; draft/publish send the payload", async () => {
    createCourse.mockReset();
    push.mockReset();
    toast.success.mockReset();
    toast.error.mockReset();
    createCourse.mockResolvedValue({ success: true, course: { id: "c-1" } });

    const { container, getByText, getAllByText, getByPlaceholderText } = render(
      <CourseCreateForm tags={tags} />,
    );
    const title = getByPlaceholderText("Ex: Introduction à React") as HTMLInputElement;
    fireEvent.change(title, { target: { value: "Mon Cours  React & Co" } });
    const slug = getByPlaceholderText("introduction-a-react") as HTMLInputElement;
    expect(slug.value).toMatchSnapshot();

    fireEvent.change(getByPlaceholderText("Décrivez votre formation en détail..."), {
      target: { value: "Une description assez longue" },
    });
    fireEvent.click(getAllByText("React")[0]);
    fireEvent.click(getAllByText("Next")[0]);
    fireEvent.click(getAllByText("React")[0]); // toggle off again
    expect(hash(norm(container.innerHTML))).toMatchSnapshot();

    fireEvent.click(getByText("Sauvegarder comme brouillon"));
    await waitFor(() => expect(createCourse).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/courses/c-1"));
    expect(createCourse.mock.calls[0][0]).toMatchSnapshot();
    expect(toast.success.mock.calls).toMatchSnapshot();

    fireEvent.click(getByText("Créer et publier"));
    await waitFor(() => expect(createCourse).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(2));
    expect(createCourse.mock.calls[1][0]).toMatchSnapshot();
    expect(toast.success.mock.calls[1]).toMatchSnapshot();
  });

  it("reports server errors and exceptions", async () => {
    createCourse.mockReset();
    toast.error.mockReset();
    createCourse.mockResolvedValueOnce({ success: false, error: "Slug pris" });
    createCourse.mockRejectedValueOnce(new Error("boom"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { getByText } = render(<CourseCreateForm tags={tags} />);
    fireEvent.click(getByText("Créer et publier"));
    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    fireEvent.click(getByText("Sauvegarder comme brouillon"));
    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(2));
    expect(toast.error.mock.calls).toMatchSnapshot();
  });
});
