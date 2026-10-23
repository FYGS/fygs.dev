import { describe, expect, it, vi, beforeEach } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";

const { replace, refresh, toast, savePathAction, setPathPublishedAction, deletePathAction, checkPathSlugAction } = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
  savePathAction: vi.fn(),
  setPathPublishedAction: vi.fn(),
  deletePathAction: vi.fn(),
  checkPathSlugAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh, push: vi.fn() }) }));
vi.mock("sonner", () => ({ toast }));
vi.mock("@/app/[locale]/(admin)/admin/paths/_actions/path-actions", () => ({
  savePathAction: (...a: unknown[]) => savePathAction(...a),
  setPathPublishedAction: (...a: unknown[]) => setPathPublishedAction(...a),
  deletePathAction: (...a: unknown[]) => deletePathAction(...a),
  checkPathSlugAction: (...a: unknown[]) => checkPathSlugAction(...a),
}));
vi.mock("@/components/ui/image-upload", () => ({
  ImageUpload: ({ onImageUploaded }: { onImageUploaded: (url: string) => void }) => (
    <button type="button" onClick={() => onImageUploaded("https://cdn.test/cover.png")}>
      téléverser
    </button>
  ),
}));

import { PathEditor, type CourseOption, type PathEditorInitial } from "@/app/[locale]/(admin)/admin/paths/_components/path-editor";

// Radix Switch measures its thumb with ResizeObserver (absent from jsdom)
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

const course = (id: string, title: string, over: Partial<CourseOption> = {}): CourseOption => ({
  id,
  title,
  level: "BEGINNER",
  thumbnail: null,
  accessTier: "FREE",
  published: true,
  lessonsCount: 3,
  ...over,
});
const options = [course("c1", "JavaScript"), course("c2", "TypeScript"), course("c3", "React"), course("c4", "Brouillon", { published: false })];

const empty: PathEditorInitial = {
  id: null,
  title: "",
  slug: "",
  description: "",
  thumbnail: null,
  level: "BEGINNER",
  objectives: [],
  featured: false,
  published: false,
  courses: [],
  enrollmentCount: 0,
  certificateCount: 0,
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  checkPathSlugAction.mockResolvedValue({ available: true, valid: true });
  savePathAction.mockResolvedValue({ success: true, id: "p1", slug: "x" });
});

describe("PathEditor", () => {
  it("derives the slug from the title until the author edits it", () => {
    render(<PathEditor initial={empty} courseOptions={options} />);
    fireEvent.change(screen.getByLabelText("Titre"), { target: { value: "Développeur Web Créatif" } });
    expect((screen.getByLabelText("Adresse (slug)") as HTMLInputElement).value).toBe("developpeur-web-creatif");
    fireEvent.change(screen.getByLabelText("Adresse (slug)"), { target: { value: "mon-adresse" } });
    fireEvent.change(screen.getByLabelText("Titre"), { target: { value: "Autre titre" } });
    expect((screen.getByLabelText("Adresse (slug)") as HTMLInputElement).value).toBe("mon-adresse");
  });

  it("lists what blocks publication and clears it as the path is completed", () => {
    render(<PathEditor initial={empty} courseOptions={options} />);
    expect(screen.getByText(/au moins 2 formations/)).toBeTruthy();
    expect(screen.getByText(/Ajoutez une image de couverture/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Ajouter JavaScript" }));
    fireEvent.click(screen.getByRole("button", { name: "Ajouter TypeScript" }));
    fireEvent.click(screen.getByRole("button", { name: "téléverser" }));
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Une description assez longue pour passer." } });
    expect(screen.getByText("Le parcours peut être publié.")).toBeTruthy();
  });

  it("only offers published courses that are not already in the path, and filters by search", () => {
    render(<PathEditor initial={empty} courseOptions={options} />);
    const picker = screen.getByRole("list", { name: "Formations disponibles" });
    expect(within(picker).getAllByRole("listitem")).toHaveLength(3); // the draft course is not offered
    fireEvent.change(screen.getByLabelText("Rechercher une formation"), { target: { value: "script" } });
    expect(within(picker).getAllByRole("listitem")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Ajouter JavaScript" }));
    expect(within(screen.getByRole("list", { name: "Formations disponibles" })).getAllByRole("listitem")).toHaveLength(1);
  });

  it("reorders, marks optional and removes courses with the buttons", () => {
    render(
      <PathEditor
        initial={{ ...empty, courses: [{ courseId: "c1", optional: false }, { courseId: "c2", optional: false }, { courseId: "c3", optional: false }] }}
        courseOptions={options}
      />,
    );
    const order = () => within(screen.getByRole("list", { name: "Formations du parcours" })).getAllByRole("listitem").map((li) => li.textContent);
    const titles = () => order().map((text) => ["JavaScript", "TypeScript", "React"].find((t) => text?.includes(t)));
    expect(titles()).toEqual(["JavaScript", "TypeScript", "React"]);

    fireEvent.click(screen.getByRole("button", { name: "Descendre JavaScript" }));
    expect(titles()).toEqual(["TypeScript", "JavaScript", "React"]);
    fireEvent.click(screen.getByRole("button", { name: "Monter React" }));
    expect(titles()).toEqual(["TypeScript", "React", "JavaScript"]);
    expect((screen.getByRole("button", { name: "Monter TypeScript" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Descendre JavaScript" }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole("switch", { name: "React : facultative" }));
    fireEvent.click(screen.getByRole("button", { name: "Retirer TypeScript du parcours" }));
    expect(titles()).toEqual(["React", "JavaScript"]);
  });

  it("adds and removes objectives, with Enter and a cap of eight", () => {
    render(<PathEditor initial={empty} courseOptions={options} />);
    const input = screen.getByLabelText("Nouvel objectif");
    fireEvent.change(input, { target: { value: "Déployer en production" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("Déployer en production")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retirer l'objectif : Déployer en production" }));
    expect(screen.queryByText("Déployer en production")).toBeNull();
    for (let i = 0; i < 9; i++) {
      fireEvent.change(input, { target: { value: `Objectif ${i}` } });
      fireEvent.keyDown(input, { key: "Enter" });
    }
    expect(screen.getAllByRole("button", { name: /Retirer l'objectif/ })).toHaveLength(8);
  });

  it("refuses to save an invalid path without calling the server, and shows why", async () => {
    render(<PathEditor initial={empty} courseOptions={options} />);
    fireEvent.change(screen.getByLabelText("Titre"), { target: { value: "ab" } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/au moins 3 caractères/);
    expect(savePathAction).not.toHaveBeenCalled();
  });

  it("creates the path, then moves to its page", async () => {
    render(<PathEditor initial={empty} courseOptions={options} />);
    fireEvent.change(screen.getByLabelText("Titre"), { target: { value: "Mon parcours" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Une description assez longue pour passer." } });
    fireEvent.click(screen.getByRole("button", { name: "Ajouter JavaScript" }));
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => expect(savePathAction).toHaveBeenCalledTimes(1));
    const [id, payload] = savePathAction.mock.calls[0];
    expect(id).toBeNull();
    expect(payload).toMatchObject({ title: "Mon parcours", slug: "mon-parcours", courses: [{ courseId: "c1", optional: false }] });
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/admin/paths/p1"));
  });

  it("shows the server's refusal and its list of issues", async () => {
    savePathAction.mockResolvedValue({ success: false, error: "Ce parcours est publié et doit rester publiable.", issues: ["Un parcours contient au moins 2 formations."] });
    render(
      <PathEditor
        initial={{ ...empty, id: "p1", title: "Mon parcours", slug: "mon-parcours", description: "Une description assez longue pour passer.", published: true, courses: [{ courseId: "c1", optional: false }, { courseId: "c2", optional: false }] }}
        courseOptions={options}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Retirer TypeScript du parcours" }));
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/doit rester publiable/);
    expect(alert.textContent).toMatch(/au moins 2 formations/);
    expect(replace).not.toHaveBeenCalled();
  });

  it("publishes only once saved, and unpublishes a published path", async () => {
    setPathPublishedAction.mockResolvedValue({ success: true, id: "p1", slug: "x" });
    const initial: PathEditorInitial = {
      ...empty,
      id: "p1",
      title: "Mon parcours",
      slug: "mon-parcours",
      description: "Une description assez longue pour passer.",
      thumbnail: "https://cdn.test/c.png",
      courses: [{ courseId: "c1", optional: false }, { courseId: "c2", optional: false }],
    };
    render(<PathEditor initial={initial} courseOptions={options} />);
    const publish = screen.getByRole("button", { name: "Publier" }) as HTMLButtonElement;
    expect(publish.disabled).toBe(false);

    fireEvent.change(screen.getByLabelText("Titre"), { target: { value: "Titre modifié" } });
    expect(publish.disabled).toBe(true); // unsaved changes: save first
    fireEvent.change(screen.getByLabelText("Titre"), { target: { value: "Mon parcours" } });
    expect(publish.disabled).toBe(false);

    fireEvent.click(publish);
    await waitFor(() => expect(setPathPublishedAction).toHaveBeenCalledWith("p1", true));
    await waitFor(() => expect(screen.getByRole("button", { name: "Dépublier" })).toBeTruthy());
  });

  it("asks before deleting and navigates away once done", async () => {
    deletePathAction.mockResolvedValue({ success: true });
    render(<PathEditor initial={{ ...empty, id: "p1", title: "Mon parcours", slug: "mon-parcours", enrollmentCount: 4 }} courseOptions={options} />);
    fireEvent.click(screen.getByRole("button", { name: /Supprimer le parcours/ }));
    expect(await screen.findByText(/Les 4 inscriptions au parcours seront supprimées/)).toBeTruthy();
    expect(deletePathAction).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
    await waitFor(() => expect(deletePathAction).toHaveBeenCalledWith("p1"));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/admin/paths"));
  });
});
