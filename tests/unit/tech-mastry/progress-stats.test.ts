import { describe, expect, it } from "vitest";
import {
  TOTAL_CHALLENGES,
  TOTAL_PAGES,
  deriveProgressStats,
} from "@/app/[locale]/(main)/tech-mastry/_utils/progress-stats";
import {
  emptyProgress,
  recordChallenge,
  recordDay,
  recordQuiz,
  recordTime,
  recordVisit,
  type UserProgress,
} from "@/app/[locale]/(main)/tech-mastry/_utils/progress-model";
import { searchIndex } from "@/app/[locale]/(main)/tech-mastry/_utils/search-index";

const NOW = new Date("2026-10-20T10:00:00Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000);

const topics = (prefix: string) => [
  ...new Set(searchIndex.map((item) => item.href).filter((href) => href === prefix || href.startsWith(`${prefix}/`))),
];

function visitAll(progress: UserProgress, hrefs: string[]): UserProgress {
  return hrefs.reduce((p, href, i) => recordVisit(p, href, hoursAgo(100 - i)), progress);
}

describe("deriveProgressStats for a learner who did nothing", () => {
  const stats = deriveProgressStats(emptyProgress(NOW), NOW);

  it("shows zeros, not sample data", () => {
    expect(stats.hasActivity).toBe(false);
    expect(stats.challengesCompleted).toBe(0);
    expect(stats.streakDays).toBe(0);
    expect(stats.totalTimeMinutes).toBe(0);
    expect(stats.pagesVisited).toBe(0);
    expect(stats.recentActivities).toEqual([]);
    expect(Object.values(stats.skillLevels).every((level) => level === 0)).toBe(true);
    expect(stats.learningPaths.every((path) => path.progress === 0 && path.completedModules === 0)).toBe(true);
    expect(stats.achievements.every((a) => !a.isUnlocked && a.progress === 0)).toBe(true);
    expect(stats.lastActivityAt).toBeNull();
  });

  it("measures against the real catalog", () => {
    expect(stats.totalPages).toBe(TOTAL_PAGES);
    expect(stats.totalPages).toBeGreaterThan(30);
    expect(stats.totalChallenges).toBe(TOTAL_CHALLENGES);
    expect(stats.learningPaths.length).toBeGreaterThanOrEqual(5);
    expect(stats.learningPaths.every((path) => path.totalModules > 0)).toBe(true);
  });

  it("points every path to its first topic", () => {
    for (const path of stats.learningPaths) expect(path.href.startsWith("/tech-mastry/")).toBe(true);
  });
});

describe("deriveProgressStats from real progress", () => {
  it("opening a topic moves its path, its skill and the page count", () => {
    const frontend = topics("/tech-mastry/frontend");
    const progress = visitAll(emptyProgress(NOW), [frontend[0]]);

    const stats = deriveProgressStats(progress, NOW);
    const path = stats.learningPaths.find((p) => p.id === "frontend")!;

    expect(stats.hasActivity).toBe(true);
    expect(stats.pagesVisited).toBe(1);
    expect(path.completedModules).toBe(1);
    expect(path.progress).toBe(Math.round(100 / frontend.length));
    expect(path.href).toBe(frontend[1]); // continue with the next unvisited topic
    expect(stats.skillLevels.frontend).toBe(path.progress);
    expect(stats.skillLevels.backend).toBe(0);
  });

  it("a page below a topic counts for that topic", () => {
    const [topic] = topics("/tech-mastry/backend");
    const progress = recordVisit(emptyProgress(NOW), `${topic}/some/deep/page`, NOW);

    expect(deriveProgressStats(progress, NOW).pagesVisited).toBe(1);
  });

  it("finishing every topic of a path completes it and unlocks Path Master", () => {
    const backend = topics("/tech-mastry/backend");
    const stats = deriveProgressStats(visitAll(emptyProgress(NOW), backend), NOW);

    const path = stats.learningPaths.find((p) => p.id === "backend")!;
    expect(path.progress).toBe(100);
    expect(path.href).toBe(backend[0]); // review starts from the top
    expect(stats.achievements.find((a) => a.id === "path-master")).toMatchObject({ isUnlocked: true, progress: 100 });
  });

  it("the streak comes from the days really opened", () => {
    let progress = emptyProgress(NOW);
    for (const iso of ["2026-10-18T09:00:00Z", "2026-10-19T09:00:00Z", "2026-10-20T09:00:00Z"]) {
      progress = recordDay(progress, new Date(iso));
    }
    const stats = deriveProgressStats(progress, NOW);

    expect(stats.streakDays).toBe(3);
    expect(stats.achievements.find((a) => a.id === "consistent-learner")?.progress).toBe(Math.round((3 / 7) * 100));
  });

  it("seven days in a row unlock Consistent Learner", () => {
    let progress = emptyProgress(NOW);
    for (let d = 14; d <= 20; d++) progress = recordDay(progress, new Date(`2026-10-${d}T09:00:00Z`));

    expect(deriveProgressStats(progress, NOW).achievements.find((a) => a.id === "consistent-learner")).toMatchObject({
      isUnlocked: true,
      progress: 100,
    });
  });

  it("problem solving blends the challenges and the quiz results", () => {
    let progress = recordChallenge(emptyProgress(NOW), "1", NOW);
    progress = recordQuiz(progress, "qa", 4, 5, NOW); // 80%

    const expected = Math.round(((1 / TOTAL_CHALLENGES) * 100 + 80) / 2);
    expect(deriveProgressStats(progress, NOW).skillLevels.problemSolving).toBe(expected);
  });

  it("a quiz alone feeds problem solving and may unlock Quiz Ace", () => {
    const strong = deriveProgressStats(recordQuiz(emptyProgress(NOW), "qa", 9, 10, NOW), NOW);
    expect(strong.skillLevels.problemSolving).toBe(90);
    expect(strong.achievements.find((a) => a.id === "quiz-ace")?.isUnlocked).toBe(true);

    const weak = deriveProgressStats(recordQuiz(emptyProgress(NOW), "qa", 5, 10, NOW), NOW);
    expect(weak.achievements.find((a) => a.id === "quiz-ace")?.isUnlocked).toBe(false);
  });

  it("Explorer needs 25 different topics", () => {
    const all = [...new Set(searchIndex.map((i) => i.href))];
    const some = deriveProgressStats(visitAll(emptyProgress(NOW), all.slice(0, 10)), NOW);
    expect(some.achievements.find((a) => a.id === "explorer")).toMatchObject({ isUnlocked: false, progress: 40 });

    const many = deriveProgressStats(visitAll(emptyProgress(NOW), all.slice(0, 25)), NOW);
    expect(many.achievements.find((a) => a.id === "explorer")?.isUnlocked).toBe(true);
  });

  it("an achievement is dated by the activity that unlocked it", () => {
    const progress = recordChallenge(emptyProgress(NOW), "1", hoursAgo(5));

    const first = deriveProgressStats(progress, NOW).achievements.find((a) => a.id === "first-challenge");
    expect(first?.unlockedAt?.toISOString()).toBe(hoursAgo(5).toISOString());
  });

  it("recent activities are the newest first, with a result for quizzes", () => {
    let progress = recordVisit(emptyProgress(NOW), topics("/tech-mastry/frontend")[0], hoursAgo(3));
    progress = recordQuiz(progress, "sorting-bubble", 9, 10, hoursAgo(2));
    progress = recordQuiz(progress, "searching", 2, 10, hoursAgo(1));
    progress = recordChallenge(progress, "1", hoursAgo(0.5));

    const [challenge, failedQuiz, goodQuiz, topic] = deriveProgressStats(progress, NOW).recentActivities;

    expect(challenge).toMatchObject({ type: "challenge", title: "Two Sum", result: "success" });
    expect(failedQuiz).toMatchObject({ type: "quiz", title: "Quiz: Searching", score: 20, result: "failed" });
    expect(goodQuiz).toMatchObject({ type: "quiz", title: "Quiz: Sorting bubble", score: 90, result: "success" });
    expect(topic.type).toBe("learning");
    expect(topic.title).toBe(searchIndex.find((i) => i.href === topics("/tech-mastry/frontend")[0])!.title);
  });

  it("lists at most 8 recent activities", () => {
    const all = [...new Set(searchIndex.map((i) => i.href))].slice(0, 20);
    expect(deriveProgressStats(visitAll(emptyProgress(NOW), all), NOW).recentActivities).toHaveLength(8);
  });

  it("the calendar data counts what happened each day", () => {
    let progress = recordDay(emptyProgress(NOW), hoursAgo(30)); // 2026-10-19
    progress = recordVisit(progress, "/tech-mastry/frontend", NOW);
    progress = recordQuiz(progress, "qa", 3, 4, NOW);

    const { activityByDay } = deriveProgressStats(progress, NOW);
    expect(activityByDay["2026-10-19"]).toBe(1);
    expect(activityByDay["2026-10-20"]).toBe(2);
  });

  it("reports the time spent", () => {
    const progress = recordTime(emptyProgress(NOW), "/tech-mastry/frontend", 95);
    expect(deriveProgressStats(progress, NOW).totalTimeMinutes).toBe(95);
  });
});
