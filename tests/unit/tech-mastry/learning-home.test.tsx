import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { AREAS, PATH } from "@/app/[locale]/(main)/tech-mastry/_catalog";
import { LearningHome } from "@/app/[locale]/(main)/tech-mastry/_components/learning-home";

describe("LearningHome", () => {
  beforeEach(() => localStorage.clear());

  it("offers a first topic and a progress bar for every area of the path", () => {
    render(<LearningHome />);
    expect(screen.getByRole("heading", { name: "Par où commencer ?" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Commencer/ })).toBeTruthy();
    expect(screen.getAllByRole("progressbar")).toHaveLength(AREAS.filter((area) => area.id !== "tools").length);
    expect(screen.getByText(new RegExp(`0 sujet terminé sur ${PATH.length}`))).toBeTruthy();
  });

  it("continues where the learner left off", () => {
    localStorage.setItem(
      "tech-mastry-progress",
      JSON.stringify({ completedTopics: [PATH[0].route], visitedPages: [PATH[0].route] }),
    );
    render(<LearningHome />);
    expect(screen.getByRole("heading", { name: "Votre parcours" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Continuer/ })).toBeTruthy();
  });
});
