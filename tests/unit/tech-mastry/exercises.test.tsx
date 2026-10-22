import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { TopicExercise } from "@/app/[locale]/(main)/tech-mastry/_catalog/exercises";
import { Exercises } from "@/app/[locale]/(main)/tech-mastry/_components/topic/exercises";
import { STORAGE_KEY } from "@/app/[locale]/(main)/tech-mastry/_utils/progress-model";

const order: TopicExercise = {
  id: "t-order-1",
  type: "order",
  prompt: "Remettez les étapes du workflow dans l'ordre.",
  explanation: "On crée la branche avant de committer, puis on pousse, puis on ouvre la pull request.",
  steps: ["Créer la branche", "Committer", "Pousser", "Ouvrir la pull request"],
};
const match: TopicExercise = {
  id: "t-match-1",
  type: "match",
  prompt: "Associez chaque commande à son effet.",
  explanation: "Add prépare, commit enregistre, push publie.",
  pairs: [
    { term: "git add", definition: "Prépare les changements" },
    { term: "git commit", definition: "Enregistre un instantané" },
    { term: "git push", definition: "Publie les commits" },
  ],
};
const fill: TopicExercise = {
  id: "t-fill-1",
  type: "fill",
  prompt: "Complétez la commande.",
  explanation: "On crée la branche et on s'y place en une commande.",
  code: "git {{1}} -b {{2}}",
  blanks: [
    { options: ["branch", "checkout", "merge"], answer: 1 },
    { options: ["feature/login", "--force", "origin"], answer: 0 },
  ],
};
const classify: TopicExercise = {
  id: "t-classify-1",
  type: "classify",
  prompt: "Classez ces commandes.",
  explanation: "Rebase et amend réécrivent l'historique, merge et revert non.",
  categories: ["Réécrit l'historique", "Conserve l'historique"],
  items: [
    { text: "git rebase", category: 0 },
    { text: "git merge", category: 1 },
    { text: "git commit --amend", category: 0 },
    { text: "git revert", category: 1 },
  ],
};

const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

describe("the exercises of a lesson", () => {
  it("shows how many are solved and one card per exercise, with its kind", () => {
    render(<Exercises exercises={[order, match, fill, classify]} />);
    expect(screen.getByText("0 / 4 résolus")).toBeInTheDocument();
    for (const kind of ["Remettre dans l'ordre", "Associer", "Compléter le code", "Classer"]) expect(screen.getByText(kind)).toBeInTheDocument();
  });
});

describe("put in order", () => {
  it("starts mixed, never in the right order, and moves a step with the buttons", () => {
    render(<Exercises exercises={[order]} />);
    const items = screen.getAllByRole("listitem").map((li) => li.textContent ?? "");
    expect(items.map((text) => text.replace(/^\d/, "").slice(0, 8))).not.toEqual(["Créer la", "Committe", "Pousser", "Ouvrir l"]);

    const firstUp = screen.getAllByRole("button", { name: /^Monter/ })[1];
    fireEvent.click(firstUp);
    expect(screen.queryByText(/élément\(s\) juste\(s\)/)).toBeNull(); // moving clears an earlier verdict
  });

  it("solves by moving every step to its place, saves it, and says so", async () => {
    render(<Exercises exercises={[order]} />);
    // bubble sort with the buttons: move each step up until the list reads in the right order
    for (let guard = 0; guard < 30; guard++) {
      const texts = screen.getAllByRole("listitem").map((li) => li.querySelector("span.flex-1")?.textContent ?? "");
      const wanted = order.type === "order" ? order.steps : [];
      const wrong = texts.findIndex((text, index) => text !== wanted[index]);
      if (wrong < 0) break;
      const target = texts.indexOf(wanted[wrong]);
      fireEvent.click(screen.getAllByRole("button", { name: new RegExp(`^Monter l'étape « ${wanted[wrong]} »`) })[0]);
      expect(target).toBeGreaterThan(wrong);
    }
    fireEvent.click(screen.getByRole("button", { name: "Vérifier" }));

    expect(await screen.findByText("Bravo, tout est juste.")).toBeInTheDocument();
    await waitFor(() => expect(stored().exercisesSolved).toEqual(["t-order-1"]));
    expect(screen.getByText("Résolu")).toBeInTheDocument();
    expect(screen.getByText("1 / 1 résolus")).toBeInTheDocument();
  });

  it("shows the solution on request without counting it as solved", async () => {
    render(<Exercises exercises={[order]} />);
    fireEvent.click(screen.getByRole("button", { name: "Vérifier" }));
    fireEvent.click(await screen.findByRole("button", { name: "Voir la solution" }));

    expect(screen.getByText("Voici la solution.")).toBeInTheDocument();
    const texts = screen.getAllByRole("listitem").map((li) => li.querySelector("span.flex-1")?.textContent);
    expect(texts).toEqual(order.type === "order" ? order.steps : []);
    expect(stored()?.exercisesSolved ?? []).toEqual([]);
  });
});

describe("match", () => {
  it("needs every term answered, tells which are wrong, then accepts the right pairs", async () => {
    render(<Exercises exercises={[match]} />);
    const check = screen.getByRole("button", { name: "Vérifier" });
    expect(check).toBeDisabled();

    const pick = (term: string, definition: string) => {
      const select = screen.getByRole("combobox", { name: `Définition de « ${term} »` });
      const option = within(select).getByRole("option", { name: definition });
      fireEvent.change(select, { target: { value: (option as HTMLOptionElement).value } });
    };
    pick("git add", "Enregistre un instantané"); // wrong
    pick("git commit", "Enregistre un instantané");
    pick("git push", "Publie les commits");
    fireEvent.click(check);
    expect(await screen.findByText("2 élément(s) juste(s) sur 3.")).toBeInTheDocument();
    expect(stored()?.exercisesSolved ?? []).toEqual([]);

    pick("git add", "Prépare les changements");
    fireEvent.click(screen.getByRole("button", { name: "Vérifier" }));
    expect(await screen.findByText("Bravo, tout est juste.")).toBeInTheDocument();
    await waitFor(() => expect(stored().exercisesSolved).toEqual(["t-match-1"]));
  });
});

describe("fill the blanks", () => {
  it("checks the chosen options and explains", async () => {
    render(<Exercises exercises={[fill]} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Trou 1" }), { target: { value: "1" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Trou 2" }), { target: { value: "1" } }); // wrong
    fireEvent.click(screen.getByRole("button", { name: "Vérifier" }));

    expect(await screen.findByText("1 élément(s) juste(s) sur 2.")).toBeInTheDocument();
    expect(screen.getByText(fill.explanation)).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Trou 2" }), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Vérifier" }));
    expect(await screen.findByText("Bravo, tout est juste.")).toBeInTheDocument();
  });
});

describe("classify", () => {
  it("accepts the right categories and lets the learner start over", async () => {
    render(<Exercises exercises={[classify]} />);
    const choose = (item: string, category: string) => {
      const group = screen.getByRole("group", { name: item });
      fireEvent.click(within(group).getByLabelText(category));
    };
    choose("git rebase", "Réécrit l'historique");
    choose("git merge", "Conserve l'historique");
    choose("git commit --amend", "Conserve l'historique"); // wrong
    choose("git revert", "Conserve l'historique");
    fireEvent.click(screen.getByRole("button", { name: "Vérifier" }));
    expect(await screen.findByText("3 élément(s) juste(s) sur 4.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Recommencer" }));
    expect(screen.getByRole("button", { name: "Vérifier" })).toBeDisabled();

    choose("git rebase", "Réécrit l'historique");
    choose("git merge", "Conserve l'historique");
    choose("git commit --amend", "Réécrit l'historique");
    choose("git revert", "Conserve l'historique");
    fireEvent.click(screen.getByRole("button", { name: "Vérifier" }));
    expect(await screen.findByText("Bravo, tout est juste.")).toBeInTheDocument();
    await waitFor(() => expect(stored().exercisesSolved).toEqual(["t-classify-1"]));
  });
});

