import { describe, expect, it } from "vitest";
import { AREAS, PATH, lessonsOf } from "@/app/[locale]/(main)/tech-mastry/_catalog";
import {
  TOTAL_CHALLENGES,
  TOTAL_PAGES,
  deriveProgressStats,
} from "@/app/[locale]/(main)/tech-mastry/_utils/progress-stats";
import { selfCheckId } from "@/app/[locale]/(main)/tech-mastry/_utils/catalog-progress";
import {
  emptyProgress,
  recordChallenge,
  recordDay,
  recordQuiz,
  recordTime,
  recordTopicCompleted,
  recordVisit,
  type UserProgress,
} from "@/app/[locale]/(main)/tech-mastry/_utils/progress-model";

const NOW = new Date("2026-10-20T10:00:00Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000);

const area = (id: string) => AREAS.find((candidate) => candidate.id === id)!;
const lessons = (id: string) => lessonsOf(area(id));

function visitAll(progress: UserProgress, routes: string[]): UserProgress {
  return routes.reduce((p, route, i) => recordVisit(p, route, hoursAgo(100 - i)), progress);
}
function completeAll(progress: UserProgress, routes: string[]): UserProgress {
  return routes.reduce((p, route, i) => recordTopicCompleted(p, route, hoursAgo(100 - i)), progress);
}

describe("deriveProgressStats for a learner who did nothing", () => {
  const stats = deriveProgressStats(emptyProgress(NOW), NOW);

  it("shows zeros, not sample data", () => {
    expect(stats.hasActivity).toBe(false);
    expect(stats.challengesCompleted).toBe(0);
    expect(stats.topicsCompleted).toBe(0);
    expect(stats.selfChecksTaken).toBe(0);
    expect(stats.selfCheckAverage).toBeNull();
    expect(stats.streakDays).toBe(0);
    expect(stats.totalTimeMinutes).toBe(0);
    expect(stats.pagesVisited).toBe(0);
    expect(stats.recentActivities).toEqual([]);
    expect(Object.values(stats.skillLevels).every((level) => level === 0)).toBe(true);
    expect(stats.learningPaths.every((path) => path.progress === 0 && path.completedModules === 0 && path.startedModules === 0)).toBe(true);
    expect(stats.achievements.every((a) => !a.isUnlocked && a.progress === 0)).toBe(true);
    expect(stats.lastActivityAt).toBeNull();
  });

  it("measures against the catalog: one path per area, the whole path of lessons", () => {
    expect(stats.totalPages).toBe(TOTAL_PAGES);
    expect(stats.totalTopics).toBe(PATH.length);
    expect(stats.totalChallenges).toBe(TOTAL_CHALLENGES);
    expect(stats.learningPaths.map((path) => path.id)).toEqual(AREAS.filter((a) => a.id !== "tools").map((a) => a.id));
    expect(stats.learningPaths.every((path) => path.totalModules > 0 && path.minutesLeft > 0)).toBe(true);
  });

  it("points every path to its first lesson and suggests where to start", () => {
    for (const path of stats.learningPaths) expect(path.href).toBe(lessons(path.id)[0].route);
    expect(stats.next).toMatchObject({ kind: "start" });
    expect(stats.next!.href.startsWith("/tech-mastry/")).toBe(true);
  });
});

describe("deriveProgressStats from real progress", () => {
  it("opening a lesson counts as started, not as done, and nudges the skill a little", () => {
    const frontend = lessons("frontend");
    const stats = deriveProgressStats(visitAll(emptyProgress(NOW), [frontend[0].route]), NOW);
    const path = stats.learningPaths.find((p) => p.id === "frontend")!;

    expect(stats.hasActivity).toBe(true);
    expect(stats.pagesVisited).toBe(1);
    expect(stats.topicsCompleted).toBe(0);
    expect(path).toMatchObject({ completedModules: 0, startedModules: 1, progress: 0 });
    expect(stats.skillLevels.frontend).toBeGreaterThan(0);
    expect(stats.skillLevels.frontend).toBeLessThan(15);
    expect(stats.skillLevels.backend).toBe(0);
  });

  it("marking a lesson as done moves its path and its skill far more than opening it", () => {
    const frontend = lessons("frontend");
    const opened = deriveProgressStats(visitAll(emptyProgress(NOW), [frontend[0].route]), NOW);
    const done = deriveProgressStats(completeAll(emptyProgress(NOW), [frontend[0].route]), NOW);
    const path = done.learningPaths.find((p) => p.id === "frontend")!;

    expect(done.topicsCompleted).toBe(1);
    expect(path).toMatchObject({ completedModules: 1, progress: Math.round(100 / frontend.length) });
    expect(path.href).toBe(frontend[1].route); // continue with the next lesson that is not done
    expect(done.skillLevels.frontend).toBeGreaterThan(opened.skillLevels.frontend);
  });

  it("a page below a lesson counts as opening that lesson", () => {
    const [topic] = lessons("backend");
    const progress = recordVisit(emptyProgress(NOW), `${topic.route}/some/deep/page`, NOW);
    expect(deriveProgressStats(progress, NOW).pagesVisited).toBe(1);
  });

  it("a self-check alone counts as started", () => {
    const [topic] = lessons("backend");
    const stats = deriveProgressStats(recordQuiz(emptyProgress(NOW), selfCheckId(topic.route), 3, 5, NOW), NOW);
    expect(stats.pagesVisited).toBe(1);
    expect(stats.selfChecksTaken).toBe(1);
    expect(stats.selfCheckAverage).toBe(60);
  });

  it("finishing every lesson of an area completes the path and unlocks the area achievement", () => {
    const backend = lessons("backend").map((topic) => topic.route);
    const stats = deriveProgressStats(completeAll(emptyProgress(NOW), backend), NOW);

    const path = stats.learningPaths.find((p) => p.id === "backend")!;
    expect(path).toMatchObject({ progress: 100, minutesLeft: 0 });
    expect(path.href).toBe(backend[0]); // review starts from the top
    expect(stats.achievements.find((a) => a.id === "path-master")).toMatchObject({ isUnlocked: true, progress: 100 });
  });

  it("suggests the next lesson after the last one finished, never one already done", () => {
    const route = PATH[3].route;
    const stats = deriveProgressStats(completeAll(emptyProgress(NOW), [route]), NOW);
    expect(stats.next).toMatchObject({ kind: "continue" });
    expect(stats.next!.href).not.toBe(route);
    expect(PATH.findIndex((topic) => topic.route === stats.next!.href)).toBeGreaterThan(3);
  });

  it("has nothing to suggest once everything is done", () => {
    const stats = deriveProgressStats(completeAll(emptyProgress(NOW), PATH.map((topic) => topic.route)), NOW);
    expect(stats.next).toBeNull();
    expect(stats.topicsCompleted).toBe(PATH.length);
    expect(stats.learningPaths.every((path) => path.progress === 100)).toBe(true);
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

  it("seven days in a row unlock the regularity achievement", () => {
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

  it("a self-check at 90 % or more unlocks the quiz achievement, a weak one does not", () => {
    const strong = deriveProgressStats(recordQuiz(emptyProgress(NOW), "qa", 9, 10, NOW), NOW);
    expect(strong.skillLevels.problemSolving).toBe(90);
    expect(strong.achievements.find((a) => a.id === "quiz-ace")?.isUnlocked).toBe(true);

    const weak = deriveProgressStats(recordQuiz(emptyProgress(NOW), "qa", 5, 10, NOW), NOW);
    expect(weak.achievements.find((a) => a.id === "quiz-ace")?.isUnlocked).toBe(false);
  });

  it("Explorateur needs 25 different topics opened, Assidu needs 10 finished", () => {
    const all = PATH.map((topic) => topic.route);
    const some = deriveProgressStats(visitAll(emptyProgress(NOW), all.slice(0, 10)), NOW);
    expect(some.achievements.find((a) => a.id === "explorer")).toMatchObject({ isUnlocked: false, progress: 40 });
    const many = deriveProgressStats(visitAll(emptyProgress(NOW), all.slice(0, 25)), NOW);
    expect(many.achievements.find((a) => a.id === "explorer")?.isUnlocked).toBe(true);

    const finished = deriveProgressStats(completeAll(emptyProgress(NOW), all.slice(0, 10)), NOW);
    expect(finished.achievements.find((a) => a.id === "finisher")?.isUnlocked).toBe(true);
    expect(some.achievements.find((a) => a.id === "finisher")?.progress).toBe(0);
  });

  it("an achievement is dated by the activity that unlocked it", () => {
    const progress = recordChallenge(emptyProgress(NOW), "1", hoursAgo(5));
    const first = deriveProgressStats(progress, NOW).achievements.find((a) => a.id === "first-challenge");
    expect(first?.unlockedAt?.toISOString()).toBe(hoursAgo(5).toISOString());
  });

  it("recent activities are the newest first, with a result for quizzes and self-checks", () => {
    const topic = lessons("frontend")[0];
    let progress = recordVisit(emptyProgress(NOW), topic.route, hoursAgo(4));
    progress = recordQuiz(progress, "sorting-bubble", 9, 10, hoursAgo(3));
    progress = recordQuiz(progress, selfCheckId(topic.route), 2, 10, hoursAgo(2));
    progress = recordChallenge(progress, "1", hoursAgo(0.5));

    const [challenge, selfCheck, quiz, opened] = deriveProgressStats(progress, NOW).recentActivities;

    expect(challenge).toMatchObject({ type: "challenge", title: "Two Sum", result: "success" });
    expect(selfCheck).toMatchObject({ type: "quiz", title: `Auto-évaluation : ${topic.title}`, score: 20, result: "failed" });
    expect(quiz).toMatchObject({ type: "quiz", title: "Quiz : Sorting bubble", score: 90, result: "success" });
    expect(opened).toMatchObject({ type: "learning", title: topic.title });
  });

  it("lists at most 8 recent activities", () => {
    const all = PATH.map((topic) => topic.route).slice(0, 20);
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
