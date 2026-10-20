import { describe, expect, it } from "vitest";
import {
  MAX_ACTIVITY,
  computeStreak,
  dayKey,
  emptyProgress,
  normalizePath,
  parseStoredProgress,
  recordChallenge,
  recordDay,
  recordQuiz,
  recordTime,
  recordVisit,
} from "@/app/[locale]/(main)/tech-mastry/_utils/progress-model";

const NOW = new Date("2026-10-20T10:00:00Z");
const at = (iso: string) => new Date(iso);

describe("normalizePath", () => {
  it.each([
    ["/fr/tech-mastry/algorithms", "/tech-mastry/algorithms"],
    ["/en/tech-mastry/algorithms/", "/tech-mastry/algorithms"],
    ["/tech-mastry/algorithms?tab=2#top", "/tech-mastry/algorithms"],
    ["/es", "/"],
    ["/", "/"],
    ["/french-fries", "/french-fries"], // only a whole segment is a locale
  ])("%s -> %s", (input, expected) => {
    expect(normalizePath(input)).toBe(expected);
  });
});

describe("computeStreak", () => {
  it("is 0 without any activity", () => {
    expect(computeStreak([], NOW)).toBe(0);
  });

  it("counts the consecutive days ending today", () => {
    expect(computeStreak(["2026-10-18", "2026-10-19", "2026-10-20"], NOW)).toBe(3);
  });

  it("keeps yesterday's streak until a whole day is missed", () => {
    expect(computeStreak(["2026-10-18", "2026-10-19"], NOW)).toBe(2);
    expect(computeStreak(["2026-10-17", "2026-10-18"], NOW)).toBe(0);
  });

  it("stops at the first gap and ignores older runs", () => {
    expect(computeStreak(["2026-10-10", "2026-10-11", "2026-10-12", "2026-10-19", "2026-10-20"], NOW)).toBe(2);
  });

  it("does not depend on the order or on duplicates, and ignores garbage", () => {
    expect(computeStreak(["2026-10-20", "2026-10-19", "2026-10-20", "not-a-date", "2026-10-18"], NOW)).toBe(3);
  });

  it("crosses a month boundary", () => {
    expect(computeStreak(["2026-09-30", "2026-10-01"], at("2026-10-01T08:00:00Z"))).toBe(2);
  });
});

describe("recordDay", () => {
  it("adds today once", () => {
    const once = recordDay(emptyProgress(NOW), NOW);
    const twice = recordDay(once, at("2026-10-20T23:59:00Z"));
    expect(twice.streakDates).toEqual(["2026-10-20"]);
  });
});

describe("recordVisit", () => {
  it("logs the first visit of a page and ignores the next ones", () => {
    const first = recordVisit(emptyProgress(NOW), "/tech-mastry/frontend", NOW);
    expect(first.visitedPages).toEqual(["/tech-mastry/frontend"]);
    expect(first.activityLog).toEqual([{ type: "learning", ref: "/tech-mastry/frontend", at: NOW.toISOString() }]);

    expect(recordVisit(first, "/tech-mastry/frontend", at("2026-10-21T10:00:00Z"))).toBe(first);
  });
});

describe("recordQuiz", () => {
  it("keeps the best score per quiz but logs every attempt", () => {
    let p = recordQuiz(emptyProgress(NOW), "qa", 3, 5, NOW);
    p = recordQuiz(p, "qa", 5, 5, NOW);
    p = recordQuiz(p, "qa", 1, 5, NOW);

    expect(p.quizScores.qa).toMatchObject({ score: 5, total: 5 });
    expect(p.activityLog.filter((entry) => entry.type === "quiz")).toHaveLength(3);
  });

  it("compares ratios, not raw scores", () => {
    let p = recordQuiz(emptyProgress(NOW), "q", 4, 5, NOW); // 80%
    p = recordQuiz(p, "q", 8, 20, NOW); // 40%
    expect(p.quizScores.q).toMatchObject({ score: 4, total: 5 });
  });

  it.each([
    [0, 0],
    [-1, 5],
    [6, 5],
  ])("rejects an impossible score %i/%i", (score, total) => {
    const start = emptyProgress(NOW);
    expect(recordQuiz(start, "q", score, total, NOW)).toBe(start);
  });
});

describe("recordChallenge / recordTime", () => {
  it("counts a challenge once", () => {
    const first = recordChallenge(emptyProgress(NOW), "1", NOW);
    expect(first.challengesCompleted).toEqual(["1"]);
    expect(recordChallenge(first, "1", NOW)).toBe(first);
  });

  it("accumulates minutes per page and in total, ignoring non-positive amounts", () => {
    let p = recordTime(emptyProgress(NOW), "/a", 1);
    p = recordTime(p, "/a", 2);
    p = recordTime(p, "/b", 1);
    expect(p.timeSpent).toEqual({ "/a": 3, "/b": 1 });
    expect(p.totalTimeMinutes).toBe(4);

    expect(recordTime(p, "/a", 0)).toBe(p);
    expect(recordTime(p, "/a", -5)).toBe(p);
  });
});

describe("the activity log", () => {
  it("keeps the newest MAX_ACTIVITY entries", () => {
    let p = emptyProgress(NOW);
    for (let i = 0; i < MAX_ACTIVITY + 20; i++) p = recordVisit(p, `/tech-mastry/p${i}`, NOW);

    expect(p.activityLog).toHaveLength(MAX_ACTIVITY);
    expect(p.activityLog.at(-1)?.ref).toBe(`/tech-mastry/p${MAX_ACTIVITY + 19}`);
    expect(p.activityLog[0].ref).toBe("/tech-mastry/p20");
    expect(p.visitedPages).toHaveLength(MAX_ACTIVITY + 20); // visited pages are not capped
  });
});

describe("parseStoredProgress", () => {
  it("reads what the previous version stored (no activity log)", () => {
    const old = {
      challengesCompleted: ["1"],
      quizScores: { qa: { score: 3, total: 4, date: "2026-10-01T00:00:00Z" } },
      visitedPages: ["/tech-mastry/frontend"],
      streakDates: ["2026-10-19"],
      timeSpent: { "/tech-mastry/frontend": 12 },
      lastVisit: "2026-10-19T08:00:00Z",
      totalTimeMinutes: 12,
    };
    const parsed = parseStoredProgress(old, NOW);
    expect(parsed).toMatchObject({ ...old, activityLog: [] });
  });

  it.each([null, undefined, 42, "text", [], true])("falls back to an empty progress for %s", (raw) => {
    expect(parseStoredProgress(raw, NOW)).toEqual(emptyProgress(NOW));
  });

  it("drops corrupted pieces and keeps the valid ones", () => {
    const parsed = parseStoredProgress(
      {
        challengesCompleted: ["1", 2, null],
        quizScores: { ok: { score: 1, total: 2, date: "d" }, zero: { score: 0, total: 0, date: "d" }, bad: "x" },
        visitedPages: "nope",
        timeSpent: { a: 3, b: -1, c: "x", d: Infinity },
        totalTimeMinutes: -4,
        activityLog: [
          { type: "learning", ref: "/x", at: "2026-10-20T00:00:00Z" },
          { type: "hacking", ref: "/x", at: "2026-10-20T00:00:00Z" },
          { type: "quiz", ref: "q", at: "not a date" },
          "junk",
        ],
      },
      NOW,
    );

    expect(parsed.challengesCompleted).toEqual(["1"]);
    expect(Object.keys(parsed.quizScores)).toEqual(["ok"]);
    expect(parsed.visitedPages).toEqual([]);
    expect(parsed.timeSpent).toEqual({ a: 3 });
    expect(parsed.totalTimeMinutes).toBe(0);
    expect(parsed.activityLog).toEqual([{ type: "learning", ref: "/x", at: "2026-10-20T00:00:00Z" }]);
  });

  it("round-trips through JSON", () => {
    let p = recordDay(emptyProgress(NOW), NOW);
    p = recordVisit(p, "/tech-mastry/backend", NOW);
    p = recordQuiz(p, "qa", 4, 5, NOW);
    p = recordChallenge(p, "2", NOW);
    p = recordTime(p, "/tech-mastry/backend", 3);

    expect(parseStoredProgress(JSON.parse(JSON.stringify(p)), NOW)).toEqual(p);
  });
});

describe("dayKey", () => {
  it("is the UTC day, the way the streak stores it", () => {
    expect(dayKey(at("2026-10-20T23:30:00Z"))).toBe("2026-10-20");
    expect(dayKey(at("2026-10-21T00:30:00Z"))).toBe("2026-10-21");
  });
});
