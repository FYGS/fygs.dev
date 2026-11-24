import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RecorderMode } from "./db-recorder";

/**
 * Characterisation tests for ReviewDatabaseOptimizer: every db / logger call is
 * recorded into one ordered log together with the returned (or thrown) value.
 * Each db call advances the fake clock by 5ms so duration maths is exercised.
 */
const h = vi.hoisted(() => ({
  log: [] as unknown[],
  dbRec: null as null | ReturnType<typeof import("./db-recorder").createDbRecorder>,
  tick: null as null | (() => void),
  raw: { fail: new Set<number>(), results: [] as unknown[], n: 0 },
}));

vi.mock("@/lib/db", async () => {
  const { createDbRecorder } = await import("./db-recorder");
  h.dbRec = createDbRecorder(h.log);
  const rec = h.dbRec.db as Record<string, unknown>;
  const db = new Proxy(
    {},
    {
      get: (_t, prop: string) => {
        if (prop === "$queryRaw") {
          return (strings: TemplateStringsArray, ...values: unknown[]) => {
            const idx = h.raw.n++;
            h.log.push(["$queryRaw", Array.from(strings).join("?").replace(/\s+/g, " ").trim(), values]);
            h.tick?.();
            const result = h.raw.fail.has(idx)
              ? Promise.reject(new Error(`raw ${idx} failed`))
              : Promise.resolve(h.raw.results[idx] ?? []);
            return result;
          };
        }
        const model = rec[prop] as Record<string, (a?: unknown) => Promise<unknown>>;
        return new Proxy(
          {},
          {
            get:
              (_m, method: string) =>
              async (args?: unknown) => {
                h.tick?.();
                return model[method](args);
              },
          },
        );
      },
    },
  );
  return { db };
});

vi.mock("@/lib/structured-logger", () => ({
  logger: Object.fromEntries(
    ["debug", "info", "warn", "error"].map((lvl) => [
      lvl,
      (...a: unknown[]) =>
        h.log.push([`log.${lvl}`, a.map((x) => (x instanceof Error ? x.message : x))]),
    ]),
  ),
}));

import { ReviewDatabaseOptimizer as S } from "@/lib/services/review-database-optimizer";

const norm = (v: unknown) =>
  JSON.parse(JSON.stringify(v, (_k, x) => (x instanceof Error ? { __error: x.message } : x)) ?? "null");

type Setup = {
  mode?: RecorderMode;
  overrides?: Record<string, unknown>;
  rawFail?: number[];
  rawResults?: unknown[];
};
async function scenario(setup: Setup, run: () => unknown) {
  h.log.length = 0;
  h.dbRec!.state.mode = setup.mode ?? "rich";
  h.dbRec!.state.overrides = { ...(setup.overrides ?? {}) };
  h.raw.fail = new Set(setup.rawFail ?? []);
  h.raw.results = setup.rawResults ?? [];
  h.raw.n = 0;
  let outcome: unknown;
  try {
    outcome = { value: await run() };
  } catch (e) {
    outcome = { thrown: (e as Error).message };
  }
  return norm({ outcome, log: h.log });
}

const reviews = [
  { userId: "u1", courseId: "c1", rating: 5, comment: "great", verified: true },
  { userId: "u2", courseId: "c1", rating: 3 },
];
const statRows = [
  { rating: 5, _count: { rating: 3 }, _avg: { rating: 5 } },
  { rating: 2, _count: { rating: 1 }, _avg: { rating: null } },
];
const instructor = {
  id: "i1",
  name: "Prof",
  instructedCourses: [
    {
      id: "c1",
      title: "T1",
      slug: "t1",
      _count: { reviews: 4, enrollments: 10 },
      reviews: [
        { id: "r1", rating: 5, replies: [{ id: "x" }] },
        { id: "r2", rating: 3, replies: [] },
      ],
    },
    { id: "c2", title: "T2", slug: "t2", _count: { reviews: 0, enrollments: 2 }, reviews: [] },
  ],
};

const calls: Record<string, () => Promise<unknown>> = {
  bulkCreate: () => scenario({}, () => S.bulkCreateReviews(reviews)),
  bulkCreateEmpty: () => scenario({ overrides: { "review.createMany": { count: 0 } } }, () => S.bulkCreateReviews([])),
  bulkCreateFails: () =>
    scenario({ overrides: { "review.createMany": new Error("dup") } }, () => S.bulkCreateReviews(reviews)),

  courseStats: () => scenario({ overrides: { "review.groupBy": statRows, "review.count": 4 } }, () => S.getOptimizedCourseStats("c1")),
  courseStatsEmpty: () => scenario({ mode: "empty" }, () => S.getOptimizedCourseStats("c1")),
  courseStatsFails: () =>
    scenario({ overrides: { "review.count": new Error("boom") } }, () => S.getOptimizedCourseStats("c1")),

  helpful: () => scenario({}, () => S.batchUpdateHelpfulCounts(["r1", "r2"])),
  helpfulEmpty: () => scenario({}, () => S.batchUpdateHelpfulCounts([])),
  helpfulFails: () =>
    scenario({ overrides: { "review.update": new Error("nf") } }, () => S.batchUpdateHelpfulCounts(["r1"])),

  searchDefaults: () => scenario({}, () => S.performOptimizedSearch("  react hooks ")),
  searchBlank: () => scenario({}, () => S.performOptimizedSearch("   ")),
  searchFilters: () =>
    scenario({}, () =>
      S.performOptimizedSearch(
        "ts",
        {
          courseIds: ["c1", "c2"],
          ratings: [4, 5],
          verified: false,
          dateRange: { from: new Date("2030-01-01"), to: new Date("2030-02-01") },
        },
        { page: 3, limit: 4, sortBy: "newest" },
      ),
    ),
  searchEmptyFilters: () =>
    scenario({}, () => S.performOptimizedSearch("ts", { courseIds: [], ratings: [], verified: true }, { sortBy: "rating" })),
  searchHelpful: () => scenario({}, () => S.performOptimizedSearch("ts", {}, { sortBy: "helpful" })),
  searchUnknownSort: () => scenario({}, () => S.performOptimizedSearch("ts", {}, { sortBy: "bogus" as never })),
  searchNone: () => scenario({ mode: "empty" }, () => S.performOptimizedSearch("ts")),
  searchFails: () =>
    scenario({ overrides: { "review.findMany": new Error("fts") } }, () => S.performOptimizedSearch("ts", { verified: true })),

  dashboard: () => scenario({ overrides: { "user.findUnique": instructor } }, () => S.getInstructorDashboardData("i1")),
  dashboardNoCourses: () =>
    scenario({ overrides: { "user.findUnique": { id: "i1", name: "P", instructedCourses: [] } } }, () =>
      S.getInstructorDashboardData("i1"),
    ),
  dashboardMissing: () => scenario({ mode: "empty" }, () => S.getInstructorDashboardData("nope")),
  dashboardFails: () =>
    scenario({ overrides: { "user.findUnique": new Error("db") } }, () => S.getInstructorDashboardData("i1")),

  metrics: () =>
    scenario({ rawResults: [[{ avg_reviews: "2.5" }], [{ query: "q", calls: 1 }]] }, () => S.getPerformanceMetrics()),
  metricsNoStats: () => scenario({ rawFail: [1], rawResults: [[{ avg_reviews: "2.5" }]] }, () => S.getPerformanceMetrics()),
  metricsEmptyAvg: () => scenario({}, () => S.getPerformanceMetrics()),
  metricsFails: () =>
    scenario({ rawFail: [0], overrides: { "review.count": 3 } }, () => S.getPerformanceMetrics()),
  metricsCountFails: () =>
    scenario({ overrides: { "reviewVote.count": new Error("down") } }, () => S.getPerformanceMetrics()),

  health: () => scenario({}, () => S.healthCheck()),
  healthConnFails: () => scenario({ rawFail: [0] }, () => S.healthCheck()),
  healthTableFails: () =>
    scenario({ overrides: { "review.findFirst": new Error("denied") } }, () => S.healthCheck()),
  healthBothFail: () =>
    scenario({ rawFail: [0], overrides: { "review.findFirst": new Error("denied") } }, () => S.healthCheck()),

  recommendationsNoIndexNeeded: () => scenario({}, () => S.getOptimizationRecommendations()),
  recommendationsIndexNeeded: () =>
    scenario({ rawResults: [[{ count: 5 }]] }, () => S.getOptimizationRecommendations()),
  recommendationsRawFails: () => scenario({ rawFail: [0] }, () => S.getOptimizationRecommendations()),
};

describe("ReviewDatabaseOptimizer (pinned behaviour)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2030-06-15T10:20:30Z"));
    h.tick = () => vi.advanceTimersByTime(5);
  });

  for (const [name, fn] of Object.entries(calls)) {
    it(name, async () => {
      expect(await fn()).toMatchSnapshot();
    });
  }

  it("exposes the same static API", () => {
    expect(
      Object.getOwnPropertyNames(S)
        .filter((k) => typeof (S as unknown as Record<string, unknown>)[k] === "function")
        .concat(
          // inherited statics (after the split) are still reachable on the class
          [
            "bulkCreateReviews",
            "getOptimizedCourseStats",
            "batchUpdateHelpfulCounts",
            "performOptimizedSearch",
            "getInstructorDashboardData",
            "getPerformanceMetrics",
            "healthCheck",
            "getOptimizationRecommendations",
          ].filter((k) => typeof (S as unknown as Record<string, unknown>)[k] === "function"),
        )
        .filter((k, i, a) => a.indexOf(k) === i)
        .sort(),
    ).toMatchSnapshot();
    expect(S.name).toBe("ReviewDatabaseOptimizer");
  });
});
