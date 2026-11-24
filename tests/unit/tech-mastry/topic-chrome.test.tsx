import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PATH, getArea, lessonsOf, neighbours } from "@/app/[locale]/(main)/tech-mastry/_catalog";
import { QUIZZES } from "@/app/[locale]/(main)/tech-mastry/_catalog/quizzes";
import { TopicFooter, TopicHeader } from "@/app/[locale]/(main)/tech-mastry/_components/topic/topic-chrome";
import { STORAGE_KEY } from "@/app/[locale]/(main)/tech-mastry/_utils/progress-model";
import { selfCheckId } from "@/app/[locale]/(main)/tech-mastry/_utils/catalog-progress";

const nav = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

// a lesson with questions, a takeaway list and a neighbour on each side
const lesson = PATH.slice(1, -1).find((topic) => (topic.takeaways?.length ?? 0) >= 3 && (QUIZZES[topic.route]?.length ?? 0) >= 5)!;
const questions = QUIZZES[lesson.route];
const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");

beforeEach(() => {
  localStorage.clear();
  nav.pathname = `/fr${lesson.route}`;
});
afterEach(() => cleanup());

function answer(index: number, right: boolean) {
  const options = within(screen.getByRole("list", { name: /./ })).getAllByRole("button");
  const target = right ? questions[index].correctIndex : (questions[index].correctIndex + 1) % 4;
  fireEvent.click(options[target]);
}

describe("the shell around a lesson", () => {
  it("shows nothing on a page that is not in the catalog, nor a footer on a landing page", () => {
    nav.pathname = "/fr/tech-mastry/dashboard";
    const { container } = render(
      <>
        <TopicHeader />
        <TopicFooter />
      </>,
    );
    expect(container).toBeEmptyDOMElement();

    const area = getArea(lesson.route)!;
    nav.pathname = area.route!;
    render(<TopicFooter />);
    expect(screen.queryByText("À retenir")).toBeNull();
  });

  it("tells where the lesson is, how long it takes and its level", () => {
    render(<TopicHeader />);
    const header = screen.getByRole("complementary", { name: "À propos de ce sujet" });
    expect(within(header).getByText(`Environ ${lesson.minutes} min`)).toBeInTheDocument();
    expect(within(header).getByText(getArea(lesson.route)!.title)).toBeInTheDocument();
    expect(within(header).getByText("Pas encore commencé")).toBeInTheDocument();
  });

  it("shows the takeaways, the neighbours and what to explore next", () => {
    render(<TopicFooter />);
    for (const line of lesson.takeaways!) expect(screen.getByText(line)).toBeInTheDocument();
    const { previous, next } = neighbours(lesson.route);
    const neighbourNav = screen.getByRole("navigation", { name: "Sujets voisins" });
    expect(within(neighbourNav).getByRole("link", { name: new RegExp(previous!.title) })).toHaveAttribute("href", previous!.route);
    expect(within(neighbourNav).getByRole("link", { name: new RegExp(next!.title) })).toHaveAttribute("href", next!.route);
    expect(screen.getByRole("heading", { name: "À explorer ensuite" })).toBeInTheDocument();
  });

  it("marks the lesson as done, saves it, shows it in the header, and takes it back", async () => {
    render(
      <>
        <TopicHeader />
        <TopicFooter />
      </>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Marquer comme terminé" }));

    await waitFor(() => expect(stored().completedTopics).toEqual([lesson.route]));
    expect(screen.getByText("Terminé")).toBeInTheDocument();
    expect(screen.getByText("Vous avez terminé ce sujet.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reprendre" }));
    await waitFor(() => expect(stored().completedTopics).toEqual([]));
    expect(screen.getByRole("button", { name: "Marquer comme terminé" })).toBeInTheDocument();
  });

  it("shows the progress of the area on its landing page", async () => {
    const area = getArea(lesson.route)!;
    const first = lessonsOf(area)[0];
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedTopics: [first.route] }));
    nav.pathname = area.route!;
    render(<TopicHeader />);
    expect(await screen.findByText(new RegExp(`1 sujet terminé sur ${lessonsOf(area).length}`))).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", String(Math.round((1 / lessonsOf(area).length) * 100)));
  });
});

describe("the self-check", () => {
  it("asks the questions one by one, explains each answer, and saves the score of a full pass", async () => {
    render(<TopicFooter />);
    fireEvent.click(screen.getByRole("button", { name: "Commencer" }));

    // all right but the first one
    for (let i = 0; i < questions.length; i++) {
      expect(screen.getByText(`Question ${i + 1} sur ${questions.length}`)).toBeInTheDocument();
      answer(i, i !== 0);
      expect(screen.getByText(questions[i].explanation)).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: i + 1 < questions.length ? "Question suivante" : "Voir le résultat" }));
    }

    const expected = questions.length - 1;
    expect(screen.getByText(`${expected} / ${questions.length}`)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /À revoir \(1\)/ })).toBeInTheDocument();
    await waitFor(() => expect(stored().quizScores[selfCheckId(lesson.route)]).toMatchObject({ score: expected, total: questions.length }));
  });

  it("locks the options after an answer and says which one was right", () => {
    render(<TopicFooter />);
    fireEvent.click(screen.getByRole("button", { name: "Commencer" }));
    answer(0, false);

    const options = within(screen.getByRole("list", { name: /./ })).getAllByRole("button");
    expect(options.every((option) => option.hasAttribute("disabled"))).toBe(true);
    expect(screen.getByText("Bonne réponse")).toBeInTheDocument();
    expect(screen.getByText("Votre réponse")).toBeInTheDocument();
    expect(screen.getByText("Pas tout à fait.")).toBeInTheDocument();
  });

  it("offers a retry of the missed questions that does not replace the saved score", async () => {
    render(<TopicFooter />);
    fireEvent.click(screen.getByRole("button", { name: "Commencer" }));
    for (let i = 0; i < questions.length; i++) {
      answer(i, i !== 0);
      fireEvent.click(screen.getByRole("button", { name: i + 1 < questions.length ? "Question suivante" : "Voir le résultat" }));
    }
    await waitFor(() => expect(stored().quizScores[selfCheckId(lesson.route)].score).toBe(questions.length - 1));

    fireEvent.click(screen.getByRole("button", { name: "Refaire les questions manquées" }));
    expect(screen.getByText(/Question 1 sur 1 \(questions manquées\)/)).toBeInTheDocument();
    // answer the single question right, whatever the order of its options
    const options = within(screen.getByRole("list", { name: /./ })).getAllByRole("button");
    const right = options.find((option) => option.textContent?.includes(questions[0].options[questions[0].correctIndex]))!;
    fireEvent.click(right);
    fireEvent.click(screen.getByRole("button", { name: "Voir le résultat" }));

    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    expect(screen.getByText(/ne remplace pas votre meilleur score/)).toBeInTheDocument();
    expect(stored().quizScores[selfCheckId(lesson.route)].score).toBe(questions.length - 1);
  });

  it("proposes to mark the lesson as done after a good full pass", async () => {
    render(<TopicFooter />);
    fireEvent.click(screen.getByRole("button", { name: "Commencer" }));
    for (let i = 0; i < questions.length; i++) {
      answer(i, true);
      fireEvent.click(screen.getByRole("button", { name: i + 1 < questions.length ? "Question suivante" : "Voir le résultat" }));
    }
    expect(screen.getByText("Sans faute. Le sujet est solide.")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Marquer le sujet comme terminé" }));
    });
    await waitFor(() => expect(stored().completedTopics).toEqual([lesson.route]));
  });

  it("shows the best score from an earlier visit", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ quizScores: { [selfCheckId(lesson.route)]: { score: 4, total: 5, date: "2026-10-01T00:00:00Z" } } }));
    render(<TopicFooter />);
    expect(await screen.findByText("Meilleur score : 4/5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refaire le questionnaire" })).toBeInTheDocument();
  });
});
