import { describe, expect, it } from "vitest";

import { AREAS, PATH, lessonsOf } from "@/app/[locale]/(main)/tech-mastry/_catalog";
import {
  areaProgress,
  missingPrerequisites,
  nextToLearn,
  pathProgress,
  selfCheckId,
  topicStatus,
} from "@/app/[locale]/(main)/tech-mastry/_utils/catalog-progress";
import {
  emptyProgress,
  parseStoredProgress,
  recordQuiz,
  recordTopicCompleted,
  recordTopicReopened,
  recordVisit,
} from "@/app/[locale]/(main)/tech-mastry/_utils/progress-model";

const NOW = new Date("2026-10-22T10:00:00Z");
const FIRST = PATH[0].route;
const SECOND = PATH[1].route;

describe("marking a topic as done", () => {
  it("records it once, logs it, and lets the learner take it back", () => {
    const done = recordTopicCompleted(emptyProgress(NOW), FIRST, NOW);
    expect(done.completedTopics).toEqual([FIRST]);
    expect(done.activityLog.at(-1)).toMatchObject({ type: "learning", ref: FIRST });

    expect(recordTopicCompleted(done, FIRST, NOW)).toBe(done);
    expect(recordTopicReopened(done, FIRST).completedTopics).toEqual([]);
    expect(recordTopicReopened(done, SECOND)).toBe(done);
  });

  it("survives a round trip through the stored form, and ignores garbage", () => {
    const done = recordTopicCompleted(emptyProgress(NOW), FIRST, NOW);
    expect(parseStoredProgress(JSON.parse(JSON.stringify(done)), NOW).completedTopics).toEqual([FIRST]);
    expect(parseStoredProgress({ completedTopics: [FIRST, FIRST, 42, null, SECOND] }, NOW).completedTopics).toEqual([FIRST, SECOND]);
    expect(parseStoredProgress({ completedTopics: "nope" }, NOW).completedTopics).toEqual([]);
    // progress saved before topics could be marked has no such field
    expect(parseStoredProgress({ visitedPages: ["/tech-mastry/qa"] }, NOW).completedTopics).toEqual([]);
  });
});

describe("topicStatus", () => {
  it("is new, started (opened or self-checked) or done", () => {
    const fresh = emptyProgress(NOW);
    expect(topicStatus(fresh, FIRST)).toBe("new");
    expect(topicStatus(recordVisit(fresh, FIRST, NOW), FIRST)).toBe("started");
    expect(topicStatus(recordQuiz(fresh, selfCheckId(FIRST), 3, 5, NOW), FIRST)).toBe("started");
    expect(topicStatus(recordTopicCompleted(recordVisit(fresh, FIRST, NOW), FIRST, NOW), FIRST)).toBe("done");
  });
});

describe("areaProgress", () => {
  const area = AREAS.find((candidate) => lessonsOf(candidate).length >= 3)!;
  const [a, b] = lessonsOf(area);

  it("is empty for a new learner", () => {
    expect(areaProgress(emptyProgress(NOW), area)).toMatchObject({ done: 0, percent: 0, selfCheckAverage: null });
  });

  it("counts the lessons done, the minutes left and the mean of the best self-checks", () => {
    let progress = recordTopicCompleted(emptyProgress(NOW), a.route, NOW);
    progress = recordQuiz(progress, selfCheckId(a.route), 4, 5, NOW);
    progress = recordQuiz(progress, selfCheckId(b.route), 2, 5, NOW);

    const stats = areaProgress(progress, area);
    const lessons = lessonsOf(area);

    expect(stats.done).toBe(1);
    expect(stats.total).toBe(lessons.length);
    expect(stats.percent).toBe(Math.round((1 / lessons.length) * 100));
    expect(stats.minutesLeft).toBe(lessons.reduce((sum, topic) => sum + topic.minutes, 0) - a.minutes);
    expect(stats.selfCheckAverage).toBe(60); // (80 % + 40 %) / 2
  });

  it("reaches 100 % when every lesson is done", () => {
    const everything = lessonsOf(area).reduce((progress, topic) => recordTopicCompleted(progress, topic.route, NOW), emptyProgress(NOW));
    expect(areaProgress(everything, area)).toMatchObject({ percent: 100, minutesLeft: 0 });
  });

  it("measures the whole path too", () => {
    expect(pathProgress(emptyProgress(NOW)).total).toBe(PATH.length);
  });
});

describe("nextToLearn", () => {
  it("starts at the beginning of the path", () => {
    expect(nextToLearn(emptyProgress(NOW))?.route).toBe(PATH.find((topic) => !(topic.prerequisites ?? []).length)!.route);
  });

  it("goes on after the last topic finished, and skips what is already done", () => {
    const progress = recordTopicCompleted(emptyProgress(NOW), PATH[4].route, NOW);
    const next = nextToLearn(progress)!;
    expect(next.route).not.toBe(PATH[4].route);
    expect(PATH.indexOf(next)).toBeGreaterThan(4);
  });

  it("waits for the prerequisites: a topic whose prerequisites are not done is not suggested while another one is ready", () => {
    const withPrerequisite = PATH.find((topic) => (topic.prerequisites ?? []).length > 0);
    if (!withPrerequisite) return;
    const progress = recordTopicCompleted(emptyProgress(NOW), PATH[PATH.indexOf(withPrerequisite) - 1].route, NOW);
    const suggested = nextToLearn(progress);
    if (suggested) expect(missingPrerequisites(progress, suggested.route)).toEqual([]);
  });

  it("is null once everything is done", () => {
    const everything = PATH.reduce((progress, topic) => recordTopicCompleted(progress, topic.route, NOW), emptyProgress(NOW));
    expect(nextToLearn(everything)).toBeNull();
  });
});

describe("missingPrerequisites", () => {
  it("lists the prerequisites not done yet, and none for a topic without any", () => {
    const needy = PATH.find((topic) => (topic.prerequisites ?? []).length > 0);
    if (!needy) return;
    expect(missingPrerequisites(emptyProgress(NOW), needy.route).map((topic) => topic.route)).toEqual(needy.prerequisites);
    const ready = (needy.prerequisites ?? []).reduce((progress, route) => recordTopicCompleted(progress, route, NOW), emptyProgress(NOW));
    expect(missingPrerequisites(ready, needy.route)).toEqual([]);
    expect(missingPrerequisites(emptyProgress(NOW), "/tech-mastry/nope")).toEqual([]);
  });
});
