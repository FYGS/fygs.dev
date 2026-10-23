/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";

const h = vi.hoisted(() => ({
  push: vi.fn(),
  createCourse: vi.fn(),
  addModule: vi.fn(),
  addLesson: vi.fn(),
  renameModule: vi.fn(),
  removeModule: vi.fn(),
  reorderModules: vi.fn(),
  moveLesson: vi.fn(),
  removeLesson: vi.fn(),
  setModulePublished: vi.fn(),
  getModuleImpact: vi.fn(),
  loadLesson: vi.fn(),
  saveLesson: vi.fn(),
  publishCourse: vi.fn(),
  unpublishCourse: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: h.push, refresh: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: h.toast }));
vi.mock("@/app/[locale]/(admin)/admin/courses/_actions/course-actions", () => ({
  createCourse: (...a: unknown[]) => h.createCourse(...a),
  publishCourse: (...a: unknown[]) => h.publishCourse(...a),
  unpublishCourse: (...a: unknown[]) => h.unpublishCourse(...a),
  createQuickTag: vi.fn(),
  changeCourseSlug: vi.fn(),
  checkCourseSlug: vi.fn(),
  deleteCourse: vi.fn(),
  duplicateCourse: vi.fn(),
  updateCourse: vi.fn(),
}));
vi.mock("@/app/[locale]/(admin)/admin/courses/[id]/_actions/curriculum-actions", () => ({
  addModule: (...a: unknown[]) => h.addModule(...a),
  addLesson: (...a: unknown[]) => h.addLesson(...a),
  renameModule: (...a: unknown[]) => h.renameModule(...a),
  removeModule: (...a: unknown[]) => h.removeModule(...a),
  reorderModules: (...a: unknown[]) => h.reorderModules(...a),
  moveLesson: (...a: unknown[]) => h.moveLesson(...a),
  removeLesson: (...a: unknown[]) => h.removeLesson(...a),
  setModulePublished: (...a: unknown[]) => h.setModulePublished(...a),
  getModuleImpact: (...a: unknown[]) => h.getModuleImpact(...a),
  loadLesson: (...a: unknown[]) => h.loadLesson(...a),
  saveLesson: (...a: unknown[]) => h.saveLesson(...a),
  loadCurriculum: vi.fn(),
  reorderLessons: vi.fn(),
  addLessonResource: vi.fn(),
  renameLessonResource: vi.fn(),
  removeLessonResource: vi.fn(),
  reorderLessonResources: vi.fn(),
}));
// the rich editor and the video uploader are exercised by their own tests
vi.mock("@/components/admin/rich-text-editor", () => ({
  RichTextEditor: ({ content, onChange }: { content: string; onChange: (v: string) => void }) => (
    <textarea aria-label="Contenu écrit" value={content} onChange={(e) => onChange(e.target.value)} />
  ),
}));
vi.mock("@/components/admin/video-upload", () => ({
  VideoUpload: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <input aria-label="Adresse de la vidéo" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

import { NewCourseForm } from "@/app/[locale]/(admin)/admin/courses/new/_components/new-course-form";
import { FaqEditor } from "@/app/[locale]/(admin)/admin/courses/[id]/_components/builder/faq-editor";
import { StringListEditor } from "@/components/admin/string-list-editor";
import { emptyQuestion, QuestionsEditor, QuizPreview, questionsProblem, type QuestionDraft } from "@/app/[locale]/(admin)/admin/courses/[id]/_components/builder/questions-editor";
import { SaveIndicator, SaveStatusProvider } from "@/app/[locale]/(admin)/admin/courses/[id]/_components/builder/save-status";
import { useAutosave } from "@/app/[locale]/(admin)/admin/courses/[id]/_components/builder/use-autosave";
import { BuilderHeader } from "@/app/[locale]/(admin)/admin/courses/[id]/_components/builder/builder-header";
import { CurriculumPanel } from "@/app/[locale]/(admin)/admin/courses/[id]/_components/builder/curriculum-panel";
import { checkPublishReadiness } from "@/lib/curriculum/publish";
import type { CurriculumSnapshot, LessonSummary } from "@/lib/curriculum/curriculum";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("NewCourseForm", () => {
  it("asks for a title only and opens the builder on the programme", async () => {
    h.createCourse.mockResolvedValue({ success: true, courseId: "c1" });
    render(<NewCourseForm />);
    const submit = screen.getByRole("button", { name: "Créer et commencer" });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Titre de la formation"), { target: { value: "Maîtriser TypeScript" } });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() => expect(h.createCourse).toHaveBeenCalledWith({ title: "Maîtriser TypeScript", category: "JAVASCRIPT", level: "BEGINNER" }));
    await waitFor(() => expect(h.push).toHaveBeenCalledWith("/admin/courses/c1?section=programme"));
  });

  it("shows the server's refusal and stays on the page", async () => {
    h.createCourse.mockResolvedValue({ success: false, error: "Vous n'avez pas les permissions." });
    render(<NewCourseForm />);
    fireEvent.change(screen.getByLabelText("Titre de la formation"), { target: { value: "Titre valide" } });
    fireEvent.click(screen.getByRole("button", { name: "Créer et commencer" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("permissions");
    expect(h.push).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Créer et commencer" })).toBeEnabled();
  });
});

describe("FaqEditor", () => {
  function Harness({ initial }: { initial: { q: string; a: string }[] }) {
    const [entries, setEntries] = useState(initial);
    return (
      <>
        <FaqEditor entries={entries} onChange={setEntries} />
        <output data-testid="state">{JSON.stringify(entries)}</output>
      </>
    );
  }
  const state = () => JSON.parse(screen.getByTestId("state").textContent!);

  it("adds, edits, reorders and removes entries (no JSON to type)", () => {
    render(<Harness initial={[{ q: "Un", a: "a1" }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Ajouter une question" }));
    const questions = screen.getAllByLabelText("Question");
    fireEvent.change(questions[1], { target: { value: "Deux" } });
    fireEvent.change(screen.getAllByLabelText("Réponse")[1], { target: { value: "a2" } });
    expect(state()).toEqual([{ q: "Un", a: "a1" }, { q: "Deux", a: "a2" }]);

    fireEvent.click(screen.getByRole("button", { name: "Monter la question 2" }));
    expect(state().map((e: { q: string }) => e.q)).toEqual(["Deux", "Un"]);

    fireEvent.click(screen.getAllByRole("button", { name: "Supprimer" })[0]);
    expect(state()).toEqual([{ q: "Un", a: "a1" }]);
  });

  it("explains the empty state", () => {
    render(<Harness initial={[]} />);
    expect(screen.getByText(/Aucune question pour l'instant/)).toBeInTheDocument();
  });
});

describe("StringListEditor", () => {
  function Harness({ initial = [] as string[], max }: { initial?: string[]; max?: number }) {
    const [items, setItems] = useState(initial);
    return (
      <>
        <StringListEditor items={items} onChange={setItems} label="Objectifs" max={max} />
        <output data-testid="state">{JSON.stringify(items)}</output>
      </>
    );
  }
  const state = () => JSON.parse(screen.getByTestId("state").textContent!);

  it("adds with Enter, ignores duplicates and blanks, reorders and removes", () => {
    render(<Harness />);
    const input = screen.getByLabelText("Ajouter : Objectifs");
    fireEvent.change(input, { target: { value: "Premier" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.change(input, { target: { value: "premier" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.change(input, { target: { value: "Second" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(state()).toEqual(["Premier", "Second"]);

    fireEvent.click(screen.getByRole("button", { name: "Monter : Second" }));
    expect(state()).toEqual(["Second", "Premier"]);
    fireEvent.click(screen.getByRole("button", { name: "Retirer : Second" }));
    expect(state()).toEqual(["Premier"]);
  });

  it("stops offering to add at the maximum", () => {
    render(<Harness initial={["a", "b"]} max={2} />);
    expect(screen.queryByLabelText("Ajouter : Objectifs")).not.toBeInTheDocument();
    expect(screen.getByText(/Maximum atteint/)).toBeInTheDocument();
  });
});

describe("QuestionsEditor", () => {
  function Harness({ initial }: { initial: QuestionDraft[] }) {
    const [questions, setQuestions] = useState(initial);
    return (
      <>
        <QuestionsEditor questions={questions} onChange={setQuestions} />
        <output data-testid="problem">{questionsProblem(questions) ?? "ok"}</output>
        <output data-testid="state">{JSON.stringify(questions.map(({ key: _k, ...q }) => q))}</output>
      </>
    );
  }
  const state = () => JSON.parse(screen.getByTestId("state").textContent!);
  const draft = (patch: Partial<QuestionDraft> = {}): QuestionDraft => ({ ...emptyQuestion(), question: "Q ?", options: ["a", "b"], ...patch });

  it("builds a valid question: statement, answers, the right one, an explanation", () => {
    render(<Harness initial={[emptyQuestion()]} />);
    expect(screen.getByTestId("problem")).toHaveTextContent("Question 1 : l'énoncé est vide.");

    fireEvent.change(screen.getByLabelText("Énoncé"), { target: { value: "Capitale ?" } });
    fireEvent.change(screen.getByLabelText("Réponse 1 de la question 1"), { target: { value: "Paris" } });
    fireEvent.change(screen.getByLabelText("Réponse 2 de la question 1"), { target: { value: "Rome" } });
    fireEvent.click(screen.getByLabelText("Bonne réponse : réponse 2"));
    fireEvent.change(screen.getByLabelText(/Explication/), { target: { value: "Parce que." } });

    expect(screen.getByTestId("problem")).toHaveTextContent("ok");
    expect(state()[0]).toMatchObject({ question: "Capitale ?", options: ["Paris", "Rome"], correct: 1, explanation: "Parce que." });
  });

  it("keeps the right answer pointing at the same text when an earlier answer is removed", () => {
    render(<Harness initial={[draft({ options: ["a", "b", "c"], correct: 2 })]} />);
    fireEvent.click(screen.getByRole("button", { name: "Retirer la réponse 1" }));
    expect(state()[0]).toMatchObject({ options: ["b", "c"], correct: 1 });
  });

  it("never goes below two answers", () => {
    render(<Harness initial={[draft()]} />);
    expect(screen.getByRole("button", { name: "Retirer la réponse 1" })).toBeDisabled();
  });

  it("caps the answers at six", () => {
    render(<Harness initial={[draft({ options: ["1", "2", "3", "4", "5", "6"] })]} />);
    expect(screen.queryByRole("button", { name: "Ajouter une réponse" })).not.toBeInTheDocument();
  });

  it("reorders and deletes questions", () => {
    render(<Harness initial={[draft({ question: "Premier" }), draft({ question: "Second" })]} />);
    fireEvent.click(screen.getByRole("button", { name: "Monter la question 2" }));
    expect(state().map((q: { question: string }) => q.question)).toEqual(["Second", "Premier"]);
    fireEvent.click(screen.getAllByRole("button", { name: "Supprimer" })[0]);
    expect(state().map((q: { question: string }) => q.question)).toEqual(["Premier"]);
  });

  it("previews the quiz as a learner takes it", () => {
    render(<QuizPreview questions={[draft({ question: "Capitale ?", options: ["Paris", "Rome"], correct: 0, explanation: "Parce que." })]} />);
    expect(screen.queryByText("Parce que.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Rome" }));
    expect(screen.getByLabelText("Mauvaise réponse")).toBeInTheDocument();
    expect(screen.getByLabelText("Bonne réponse")).toBeInTheDocument();
    expect(screen.getByText("Parce que.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Paris/ })).toBeDisabled();
  });
});

describe("useAutosave", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function Harness({ save }: { save: (patch: { a?: number; b?: number }) => Promise<{ success: true } | { success: false; error: string }> }) {
    const { queue, flush, error } = useAutosave<{ a?: number; b?: number }>({ name: "t", save, delay: 500 });
    return (
      <>
        <button onClick={() => queue({ a: 1 })}>a</button>
        <button onClick={() => queue({ b: 2 })}>b</button>
        <button onClick={() => void flush()}>flush</button>
        <div data-testid="error">{error ?? ""}</div>
        <SaveIndicator />
      </>
    );
  }
  const mount = (save: Parameters<typeof Harness>[0]["save"]) =>
    render(
      <SaveStatusProvider>
        <Harness save={save} />
      </SaveStatusProvider>,
    );

  it("waits for a pause in typing and sends the changes together", async () => {
    const save = vi.fn().mockResolvedValue({ success: true });
    mount(save);
    fireEvent.click(screen.getByText("a"));
    await act(() => vi.advanceTimersByTimeAsync(300));
    fireEvent.click(screen.getByText("b"));
    expect(screen.getByRole("status")).toHaveTextContent("Modifications en attente");
    await act(() => vi.advanceTimersByTimeAsync(499));
    expect(save).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(2));
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ a: 1, b: 2 });
    expect(screen.getByRole("status")).toHaveTextContent("Enregistré");
  });

  it("keeps the changes after a failure and resends them with the next edit", async () => {
    const save = vi.fn().mockResolvedValueOnce({ success: false, error: "Titre trop court" }).mockResolvedValue({ success: true });
    mount(save);
    fireEvent.click(screen.getByText("a"));
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(screen.getByTestId("error")).toHaveTextContent("Titre trop court");
    expect(screen.getByRole("status")).toHaveTextContent("Titre trop court");

    fireEvent.click(screen.getByText("b"));
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(save).toHaveBeenLastCalledWith({ a: 1, b: 2 });
    expect(screen.getByTestId("error")).toHaveTextContent("");
  });

  it("treats a thrown error as a failed save", async () => {
    const save = vi.fn().mockRejectedValue(new Error("offline"));
    mount(save);
    fireEvent.click(screen.getByText("a"));
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(screen.getByTestId("error")).toHaveTextContent("Connexion perdue");
  });

  it("flushes at once on demand", async () => {
    const save = vi.fn().mockResolvedValue({ success: true });
    mount(save);
    fireEvent.click(screen.getByText("a"));
    fireEvent.click(screen.getByText("flush"));
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("warns before the page is left while something is unsaved", async () => {
    const save = vi.fn().mockResolvedValue({ success: true });
    mount(save);
    fireEvent.click(screen.getByText("a"));
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);

    await act(() => vi.advanceTimersByTimeAsync(600));
    const after = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(after);
    expect(after.defaultPrevented).toBe(false);
  });
});

describe("BuilderHeader", () => {
  const incomplete = checkPublishReadiness({ title: "Titre", description: "", thumbnail: null, accessTier: "FREE", price: null, lessons: [] });
  const complete = checkPublishReadiness({
    title: "Titre",
    description: "Une description assez longue",
    thumbnail: "https://cdn.example.com/c.png",
    accessTier: "FREE",
    price: null,
    lessons: [{ title: "A", published: true, hasVideo: true, hasContent: false }],
  });
  const renderHeader = (over: Partial<Parameters<typeof BuilderHeader>[0]> = {}) => {
    const props = {
      courseId: "c1",
      slug: "ma-formation",
      title: "Ma formation",
      published: false,
      enrollments: 0,
      readiness: incomplete,
      beforePublish: vi.fn().mockResolvedValue(undefined),
      onPublishedChange: vi.fn(),
      onGoToSection: vi.fn(),
      ...over,
    };
    render(
      <SaveStatusProvider>
        <BuilderHeader {...props} />
      </SaveStatusProvider>,
    );
    return props;
  };

  it("shows what is missing and blocks publishing", () => {
    const props = renderHeader();
    fireEvent.click(screen.getByRole("button", { name: /Publier/ }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Il reste à compléter")).toBeInTheDocument();
    expect(within(dialog).getAllByLabelText("À faire").length).toBe(incomplete.missing.length);
    expect(within(dialog).getByRole("button", { name: "Publier maintenant" })).toBeDisabled();

    fireEvent.click(within(dialog).getAllByRole("button", { name: "Compléter" })[0]);
    expect(props.onGoToSection).toHaveBeenCalledWith("infos");
    expect(h.publishCourse).not.toHaveBeenCalled();
  });

  it("publishes a ready course after saving pending edits", async () => {
    h.publishCourse.mockResolvedValue({ success: true });
    const props = renderHeader({ readiness: complete });
    fireEvent.click(screen.getByRole("button", { name: "Publier" }));
    fireEvent.click(screen.getByRole("button", { name: "Publier maintenant" }));
    await waitFor(() => expect(h.publishCourse).toHaveBeenCalledWith("c1"));
    expect(props.beforePublish).toHaveBeenCalled();
    await waitFor(() => expect(props.onPublishedChange).toHaveBeenCalledWith(true));
  });

  it("reports the server's refusal and does not mark the course published", async () => {
    h.publishCourse.mockResolvedValue({ success: false, error: "La formation n'est pas prête : Une image de couverture." });
    const props = renderHeader({ readiness: complete });
    fireEvent.click(screen.getByRole("button", { name: "Publier" }));
    fireEvent.click(screen.getByRole("button", { name: "Publier maintenant" }));
    await waitFor(() => expect(h.toast.error).toHaveBeenCalledWith(expect.stringContaining("image de couverture")));
    expect(props.onPublishedChange).not.toHaveBeenCalled();
  });

  it("unpublishes after a warning that mentions enrolled learners", async () => {
    h.unpublishCourse.mockResolvedValue({ success: true });
    const props = renderHeader({ published: true, enrollments: 12, readiness: complete });
    expect(screen.getByText("Publiée")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dépublier" }));
    expect(screen.getByText(/12 personne\(s\) déjà inscrites/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dépublier", hidden: false, description: undefined }));
    await waitFor(() => expect(h.unpublishCourse).toHaveBeenCalledWith("c1"));
    expect(props.onPublishedChange).toHaveBeenCalledWith(false);
  });

  it("opens the preview of the draft on the public page", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /Aperçu/ })).toHaveAttribute("href", "/formations/ma-formation?preview=true");
  });
});

describe("CurriculumPanel", () => {
  const lesson = (id: string, order: number, moduleId: string | null, patch: Partial<LessonSummary> = {}): LessonSummary => ({
    id,
    moduleId,
    title: `Leçon ${id}`,
    slug: id,
    order,
    published: false,
    isPreview: false,
    duration: null,
    hasVideo: false,
    hasContent: false,
    resourceCount: 0,
    status: "draft",
    ...patch,
  });
  const base: CurriculumSnapshot = {
    modules: [
      { id: "m1", title: "Les bases", slug: "les-bases", order: 1, quizCount: 1, supportCount: 0, lessons: [lesson("a", 1, "m1", { published: true, hasContent: true, status: "ready" }), lesson("b", 2, "m1", { published: true, status: "incomplete" })] },
      { id: "m2", title: "Aller plus loin", slug: "plus-loin", order: 2, quizCount: 0, supportCount: 0, lessons: [] },
    ],
    looseLessons: [],
  };

  function Harness({ initial = base }: { initial?: CurriculumSnapshot }) {
    const [snapshot, setSnapshot] = useState(initial);
    return (
      <>
        <SaveStatusProvider>
          <CurriculumPanel courseId="c1" courseSlug="ma-formation" coursePublished={false} snapshot={snapshot} onSnapshot={setSnapshot} onGoToSection={vi.fn()} />
        </SaveStatusProvider>
        <output data-testid="modules">{snapshot.modules.map((m) => m.title).join("|")}</output>
      </>
    );
  }

  it("shows status badges so unfinished lessons are visible at a glance", () => {
    render(<Harness />);
    const a = screen.getByRole("button", { name: "Leçon a" }).closest("div")!;
    expect(within(a).getByText("Prête")).toBeInTheDocument();
    const b = screen.getByRole("button", { name: "Leçon b" }).closest("div")!;
    expect(within(b).getByText("À compléter")).toBeInTheDocument();
    expect(screen.getAllByText(/1 quiz/).length).toBeGreaterThan(0);
  });

  it("adds a module with just a title", async () => {
    const next: CurriculumSnapshot = { ...base, modules: [...base.modules, { id: "m3", title: "Projet", slug: "projet", order: 3, quizCount: 0, supportCount: 0, lessons: [] }] };
    h.addModule.mockResolvedValue({ success: true, snapshot: next, moduleId: "m3" });
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("Titre du nouveau module"), { target: { value: "Projet" } });
    fireEvent.click(screen.getByRole("button", { name: "Ajouter un module" }));
    await waitFor(() => expect(h.addModule).toHaveBeenCalledWith("c1", "Projet"));
    await waitFor(() => expect(screen.getByTestId("modules")).toHaveTextContent("Les bases|Aller plus loin|Projet"));
  });

  it("adds a lesson from the module and opens it for editing", async () => {
    const withLesson: CurriculumSnapshot = { ...base, modules: [base.modules[0], { ...base.modules[1], lessons: [lesson("n", 1, "m2")] }] };
    h.addLesson.mockResolvedValue({ success: true, snapshot: withLesson, lessonId: "n" });
    h.loadLesson.mockResolvedValue({
      success: true,
      lesson: { id: "n", courseId: "c1", moduleId: "m2", title: "Leçon n", slug: "n", description: "", content: "", videoUrl: "", duration: null, published: false, isPreview: false, resources: [] },
    });
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("Titre de la nouvelle leçon du module Aller plus loin"), { target: { value: "Leçon n" } });
    const form = screen.getByLabelText("Titre de la nouvelle leçon du module Aller plus loin").closest("form")!;
    fireEvent.click(within(form).getByRole("button", { name: "Ajouter" }));
    await waitFor(() => expect(h.addLesson).toHaveBeenCalledWith("c1", "m2", "Leçon n"));
    // the editing panel opens on the new lesson, no page navigation
    expect(await screen.findByRole("textbox", { name: "Contenu écrit" })).toBeInTheDocument();
    expect(h.loadLesson).toHaveBeenCalledWith("n");
    expect(h.push).not.toHaveBeenCalled();
  });

  it("moves a module up with the arrow button, instantly, and tells the server the new order", async () => {
    h.reorderModules.mockResolvedValue({ success: true, snapshot: { ...base, modules: [{ ...base.modules[1], order: 1 }, { ...base.modules[0], order: 2 }] } });
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Monter le module Aller plus loin" }));
    expect(screen.getByTestId("modules")).toHaveTextContent("Aller plus loin|Les bases");
    await waitFor(() => expect(h.reorderModules).toHaveBeenCalledWith("c1", ["m2", "m1"]));
  });

  it("puts the order back and says why when the server refuses", async () => {
    h.reorderModules.mockResolvedValue({ success: false, error: "La liste des modules ne correspond plus." });
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Monter le module Aller plus loin" }));
    await waitFor(() => expect(h.toast.error).toHaveBeenCalledWith("La liste des modules ne correspond plus."));
    expect(screen.getByTestId("modules")).toHaveTextContent("Les bases|Aller plus loin");
  });

  it("moves a lesson down within its module", async () => {
    h.moveLesson.mockResolvedValue({ success: true, snapshot: base });
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Descendre la leçon Leçon a" }));
    await waitFor(() => expect(h.moveLesson).toHaveBeenCalledWith("a", "m1", 1));
  });

  it("states what deleting a module removes before asking to confirm", async () => {
    h.getModuleImpact.mockResolvedValue({ success: true, lessons: 2, quizzes: 1, supports: 0, learnersWithProgress: 3 });
    h.removeModule.mockResolvedValue({ success: true, snapshot: { ...base, modules: [base.modules[1]] } });
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Actions du module Les bases" });
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
    fireEvent.click(await screen.findByRole("menuitem", { name: /Supprimer le module/ }));

    const dialog = await screen.findByRole("alertdialog");
    expect(await within(dialog).findByText(/2 leçons/)).toBeInTheDocument();
    expect(within(dialog).getByText(/1 quiz et 0 support/)).toBeInTheDocument();
    expect(within(dialog).getByText(/3 apprenants perdront sa progression/)).toBeInTheDocument();
    expect(h.removeModule).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole("button", { name: "Supprimer le module" }));
    await waitFor(() => expect(h.removeModule).toHaveBeenCalledWith("m1"));
    await waitFor(() => expect(screen.getByTestId("modules")).toHaveTextContent(/^Aller plus loin$/));
  });

  it("offers to file loose lessons into a module", () => {
    render(<Harness initial={{ ...base, looseLessons: [lesson("orphan", 1, null)] }} />);
    expect(screen.getByText("Leçons sans module")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Leçon orphan" })).toBeInTheDocument();
  });

  it("starts with a clear next step when the course is empty", () => {
    render(<Harness initial={{ modules: [], looseLessons: [] }} />);
    expect(screen.getByText("Commencez par un premier module")).toBeInTheDocument();
    expect(screen.getByLabelText("Titre du nouveau module")).toHaveAttribute("placeholder", "Titre du premier module");
  });
});
