import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProgressDashboard } from "@/app/[locale]/(main)/tech-mastry/dashboard/_components/progress-dashboard";
import { ProgressTracker } from "@/app/[locale]/(main)/tech-mastry/_components/progress-tracker";
import { getArea, lessonsOf } from "@/app/[locale]/(main)/tech-mastry/_catalog";
import { STORAGE_KEY, emptyProgress, recordChallenge, recordQuiz, recordTopicCompleted, recordVisit } from "@/app/[locale]/(main)/tech-mastry/_utils/progress-model";

const nav = vi.hoisted(() => ({ pathname: "/tech-mastry/frontend" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));
vi.mock("@/providers/theme-provider", () => ({
  useTheme: () => ({ resolvedTheme: "light", theme: "light", setTheme: () => {} }),
}));

const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");

beforeEach(() => {
  localStorage.clear();
  nav.pathname = "/tech-mastry/frontend";
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ProgressDashboard", () => {
  it("is empty and honest for a learner who has not done anything", async () => {
    render(<ProgressDashboard />);

    expect(await screen.findByText("Votre tableau de bord est vide pour le moment")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Commencer à apprendre" })).toHaveAttribute("href", "/tech-mastry/algorithms");
    expect(screen.getByText("Rien de débloqué pour l'instant")).toBeInTheDocument();
    expect(screen.getByText(/Aucune activité|Aujourd'hui/)).toBeInTheDocument();
    // none of the figures the old sample data made up
    expect(screen.queryByText("42")).not.toBeInTheDocument();
    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
    expect(screen.queryByText(/8 heures/)).not.toBeInTheDocument();
  });

  it("shows what the learner really did", async () => {
    let progress = emptyProgress();
    progress = recordVisit(progress, "/tech-mastry/frontend", new Date());
    progress = recordChallenge(progress, "1", new Date());
    progress = recordQuiz(progress, "qa-interview", 9, 10, new Date());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

    render(<ProgressDashboard />);

    await waitFor(() => expect(screen.queryByText("Votre tableau de bord est vide pour le moment")).not.toBeInTheDocument());
    expect(screen.getByText("Défis réussis").closest("div[class*=rounded]")).toHaveTextContent("1");
    expect(screen.getByText(/Dernier :/)).toBeInTheDocument();
    expect(screen.getByText("Two Sum")).toBeInTheDocument(); // recent activity, from the challenge catalog
    expect(screen.getByText("Quiz : Qa interview")).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument();
  });

  it("lets the learner continue a path where it stopped", async () => {
    const topic = lessonsOf(getArea("/tech-mastry/frontend/react-basics")!)[0].route;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recordTopicCompleted(emptyProgress(), topic, new Date())));
    render(<ProgressDashboard />);
    await screen.findByRole("tab", { name: /Parcours/ });

    const tab = screen.getByRole("tab", { name: /Parcours/ });
    fireEvent.mouseDown(tab, { button: 0 });
    fireEvent.click(tab);

    const panel = await screen.findByRole("tabpanel");
    const cards = within(panel).getAllByRole("link", { name: /Continuer|Commencer/ });
    expect(cards.length).toBeGreaterThanOrEqual(10);
    const frontend = within(panel).getAllByRole("link", { name: "Continuer" }).find((link) => link.getAttribute("href")?.startsWith("/tech-mastry/frontend"))!;
    expect(frontend).toBeDefined();
    // the lesson that was finished is not the one offered again
    expect(frontend.getAttribute("href")).not.toBe(topic);
  });

  it("every skill recommendation links somewhere", async () => {
    render(<ProgressDashboard />);
    await screen.findByRole("tab", { name: /Compétences/ });
    const tab = screen.getByRole("tab", { name: /Compétences/ });
    fireEvent.mouseDown(tab, { button: 0 });
    fireEvent.click(tab);

    const panel = await screen.findByRole("tabpanel");
    const links = within(panel).getAllByRole("link", { name: "Voir les sujets du domaine" });
    expect(links).toHaveLength(3);
    for (const link of links) expect(link.getAttribute("href")).toMatch(/^\/tech-mastry\//);
    expect(within(panel).queryByText(/will be displayed here/)).not.toBeInTheDocument();
  });

  it("has no dead 'Tout voir' button", async () => {
    render(<ProgressDashboard />);
    await screen.findByRole("tab", { name: /Vue d'ensemble/ });
    expect(screen.queryByRole("button", { name: "Tout voir" })).not.toBeInTheDocument();
  });
});

describe("ProgressTracker", () => {
  it("records the first visit of a TechMastery topic, once, without the locale", async () => {
    nav.pathname = "/fr/tech-mastry/backend/";
    const { rerender } = render(<ProgressTracker />);
    await waitFor(() => expect(stored()?.visitedPages).toEqual(["/tech-mastry/backend"]));

    rerender(<ProgressTracker />);
    expect(stored().visitedPages).toEqual(["/tech-mastry/backend"]);
    expect(stored().activityLog).toHaveLength(1);
  });

  it("follows the learner from page to page", async () => {
    const { rerender } = render(<ProgressTracker />);
    await waitFor(() => expect(stored()?.visitedPages).toContain("/tech-mastry/frontend"));

    nav.pathname = "/tech-mastry/backend";
    rerender(<ProgressTracker />);
    await waitFor(() => expect(stored().visitedPages).toEqual(["/tech-mastry/frontend", "/tech-mastry/backend"]));
  });

  it("does not track the dashboard, the section root or other sections", async () => {
    for (const pathname of ["/tech-mastry/dashboard", "/tech-mastry", "/formations/react", "/"]) {
      nav.pathname = pathname;
      const { unmount } = render(<ProgressTracker />);
      unmount();
    }
    expect(stored()?.visitedPages ?? []).toEqual([]);
  });

  it("counts a minute per minute spent on a visible tab, and nothing while hidden", async () => {
    vi.useFakeTimers();
    render(<ProgressTracker />);
    await act(async () => {});

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3 * 60_000);
    });
    expect(stored().timeSpent["/tech-mastry/frontend"]).toBe(3);

    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60_000);
    });
    expect(stored().totalTimeMinutes).toBe(3);
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
  });

  it("never overwrites progress stored by an earlier session", async () => {
    const earlier = recordQuiz(emptyProgress(), "qa", 4, 5, new Date("2026-10-01T10:00:00Z"));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(earlier));

    render(<ProgressTracker />);
    await waitFor(() => expect(stored().visitedPages).toContain("/tech-mastry/frontend"));

    expect(stored().quizScores.qa).toMatchObject({ score: 4, total: 5 });
  });

  it("survives a corrupted storage", async () => {
    localStorage.setItem(STORAGE_KEY, "{not json");

    render(<ProgressTracker />);

    await waitFor(() => expect(stored()?.visitedPages).toEqual(["/tech-mastry/frontend"]));
  });
});
