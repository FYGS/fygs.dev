import { describe, expect, it } from "vitest";
import {
  computePathProgress,
  formatMinutes,
  parsePathLevel,
  parsePathSort,
  pathCourseStatus,
  pathPublishIssues,
  type PathCourseState,
} from "@/lib/paths/rules";
import { pathInputSchema } from "@/lib/paths/schema";

const course = (courseId: string, over: Partial<PathCourseState> = {}): PathCourseState => ({
  courseId,
  optional: false,
  available: true,
  percent: 0,
  isComplete: false,
  ...over,
});

describe("computePathProgress", () => {
  it("is the mean of the required courses and points at the first one left", () => {
    const p = computePathProgress([course("a", { isComplete: true, percent: 100 }), course("b", { percent: 50 }), course("c")]);
    expect(p).toEqual({ requiredTotal: 3, requiredDone: 1, percent: 50, isComplete: false, nextCourseId: "b" });
  });

  it("is complete (100 %) only when every required course is", () => {
    const p = computePathProgress([course("a", { isComplete: true }), course("b", { isComplete: true })]);
    expect(p).toMatchObject({ percent: 100, isComplete: true, nextCourseId: null });
  });

  it("never shows 100 % while a course is left", () => {
    const nearly = computePathProgress([course("a", { isComplete: true }), course("b", { percent: 99 })]);
    expect(nearly.percent).toBe(99);
    expect(nearly.isComplete).toBe(false);
  });

  it("an optional course neither counts nor blocks", () => {
    const p = computePathProgress([
      course("a", { isComplete: true }),
      course("opt", { optional: true, percent: 0 }),
      course("b", { isComplete: true }),
    ]);
    expect(p).toMatchObject({ requiredTotal: 2, requiredDone: 2, isComplete: true });
    // and it is never the "next" course
    expect(computePathProgress([course("opt", { optional: true }), course("a")]).nextCourseId).toBe("a");
  });

  it("a course unpublished since it was added no longer blocks", () => {
    const p = computePathProgress([course("a", { isComplete: true }), course("gone", { available: false })]);
    expect(p).toMatchObject({ requiredTotal: 1, isComplete: true });
  });

  it("a path with nothing required is not complete", () => {
    expect(computePathProgress([])).toMatchObject({ percent: 0, isComplete: false, nextCourseId: null });
    expect(computePathProgress([course("o", { optional: true })]).isComplete).toBe(false);
  });
});

describe("pathCourseStatus", () => {
  const base = { available: true, entitled: true, enrolled: true, percent: 0, isComplete: false };
  it("orders the cases", () => {
    expect(pathCourseStatus({ ...base, available: false })).toBe("unavailable");
    expect(pathCourseStatus({ ...base, isComplete: true, percent: 100 })).toBe("completed");
    expect(pathCourseStatus({ ...base, entitled: false })).toBe("needs_access");
    expect(pathCourseStatus({ ...base, percent: 40 })).toBe("in_progress");
    expect(pathCourseStatus({ ...base, enrolled: false })).toBe("not_started");
    expect(pathCourseStatus({ ...base, percent: 0 })).toBe("not_started");
  });
  it("a completed course stays completed after the subscription lapsed", () => {
    expect(pathCourseStatus({ ...base, entitled: false, isComplete: true, percent: 100 })).toBe("completed");
  });
});

describe("pathPublishIssues", () => {
  const ready = {
    description: "Un parcours complet pour apprendre dans l'ordre.",
    thumbnail: "https://cdn.test/cover.png",
    courses: [
      { title: "A", published: true, optional: false, lessonsCount: 3 },
      { title: "B", published: true, optional: false, lessonsCount: 1 },
    ],
  };
  it("accepts a complete path", () => expect(pathPublishIssues(ready)).toEqual([]));
  it("lists what is missing", () => {
    const issues = pathPublishIssues({
      description: "court",
      thumbnail: null,
      courses: [{ title: "Brouillon", published: false, optional: false, lessonsCount: 2 }],
    });
    expect(issues).toHaveLength(4);
    expect(issues.join(" ")).toMatch(/description/);
    expect(issues.join(" ")).toMatch(/couverture/);
    expect(issues.join(" ")).toMatch(/au moins 2/);
    expect(issues.join(" ")).toMatch(/« Brouillon » n'est pas publiée/);
  });
  it("refuses a course with no published lesson: it could never be completed", () => {
    const issues = pathPublishIssues({
      ...ready,
      courses: [ready.courses[0], { title: "Vide", published: true, optional: false, lessonsCount: 0 }],
    });
    expect(issues).toEqual(["« Vide » n'a aucune leçon publiée : elle ne pourrait pas être terminée."]);
  });
  it("needs at least one required course", () => {
    const issues = pathPublishIssues({ ...ready, courses: ready.courses.map((c) => ({ ...c, optional: true })) });
    expect(issues).toEqual(["Au moins une formation doit être obligatoire."]);
  });
});

describe("helpers", () => {
  it("formats durations", () => {
    expect(formatMinutes(0)).toBe("—");
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(120)).toBe("2 h");
    expect(formatMinutes(200)).toBe("3 h 20");
    expect(formatMinutes(65)).toBe("1 h 05");
  });
  it("ignores unknown filter values from the URL", () => {
    expect(parsePathLevel("ADVANCED")).toBe("ADVANCED");
    expect(parsePathLevel("<script>")).toBeUndefined();
    expect(parsePathSort("title")).toBe("title");
    expect(parsePathSort("drop table")).toBe("featured");
  });
});

describe("pathInputSchema", () => {
  const valid = {
    title: "Full-stack JavaScript",
    slug: "full-stack-javascript",
    description: "Un parcours complet",
    thumbnail: "",
    level: "BEGINNER",
    objectives: ["Déployer"],
    courses: [{ courseId: "c1" }, { courseId: "c2", optional: true }],
  };
  it("accepts a path and normalises the empty cover to null", () => {
    const parsed = pathInputSchema.parse(valid);
    expect(parsed.thumbnail).toBeNull();
    expect(parsed.courses[0].optional).toBe(false);
    expect(parsed.featured).toBe(false);
  });
  it.each([
    ["a bad slug", { slug: "Not A Slug" }],
    ["the reserved slug", { slug: "verification" }],
    ["an unknown level", { level: "GURU" }],
    ["too many objectives", { objectives: Array.from({ length: 9 }, (_, i) => `o${i}`) }],
    ["the same course twice", { courses: [{ courseId: "c1" }, { courseId: "c1" }] }],
    ["a javascript: cover", { thumbnail: "javascript:alert(1)" }],
    ["a blank title", { title: "  " }],
  ])("rejects %s", (_name, over) => {
    expect(pathInputSchema.safeParse({ ...valid, ...over }).success).toBe(false);
  });
});
