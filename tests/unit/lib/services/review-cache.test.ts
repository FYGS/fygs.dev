import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RecorderMode } from "./db-recorder";

/**
 * Characterisation tests for ReviewCacheService: db, redis and logger calls are
 * recorded into one ordered log together with the returned values.
 */
const h = vi.hoisted(() => ({
  log: [] as unknown[],
  dbRec: null as null | ReturnType<typeof import("./db-recorder").createDbRecorder>,
  redis: {
    cached: null as unknown,
    keys: ["k:1", "k:2"] as string[],
    fail: false,
  },
}));

vi.mock("@/lib/db", async () => {
  const { createDbRecorder } = await import("./db-recorder");
  h.dbRec = createDbRecorder(h.log);
  return { db: h.dbRec.db };
});

vi.mock("@/lib/redis", () => {
  const redis = {
    getJSON: async (key: string) => {
      h.log.push(["redis.getJSON", key]);
      if (h.redis.fail) throw new Error("redis down");
      return h.redis.cached;
    },
    setJSON: async (...a: unknown[]) => {
      h.log.push(["redis.setJSON", a]);
      return "OK";
    },
    keys: async (pattern: string) => {
      h.log.push(["redis.keys", pattern]);
      if (h.redis.fail) throw new Error("redis down");
      return h.redis.keys;
    },
    multi: () => {
      h.log.push(["redis.multi"]);
      const pipeline = {
        del: (k: string) => {
          h.log.push(["pipeline.del", k]);
          return pipeline;
        },
        exec: async () => {
          h.log.push(["pipeline.exec"]);
          return [];
        },
      };
      return pipeline;
    },
  };
  return { RedisClient: { getInstance: () => redis } };
});

vi.mock("@/lib/structured-logger", () => ({
  logger: Object.fromEntries(
    ["debug", "info", "warn", "error"].map((lvl) => [
      lvl,
      (...a: unknown[]) =>
        h.log.push([
          `log.${lvl}`,
          a.map((x) => (x instanceof Error ? x.message : x)),
        ]),
    ]),
  ),
}));

import { ReviewCacheService as S } from "@/lib/services/review-cache";

const norm = (v: unknown) =>
  JSON.parse(JSON.stringify(v, (_k, x) => (x instanceof Error ? { __error: x.message } : x)) ?? "null");

type Setup = { mode?: RecorderMode; cached?: unknown; fail?: boolean; keys?: string[] };
async function scenario(setup: Setup, run: () => unknown) {
  h.log.length = 0;
  h.dbRec!.state.mode = setup.mode ?? "rich";
  h.redis.cached = setup.cached ?? null;
  h.redis.fail = setup.fail ?? false;
  h.redis.keys = setup.keys ?? ["k:1", "k:2"];
  let outcome: unknown;
  try {
    outcome = { value: await run() };
  } catch (e) {
    outcome = { thrown: (e as Error).message };
  }
  return norm({ outcome, log: h.log });
}

const hit = { cachedMarker: true };
const calls: Record<string, (s: Setup) => Promise<unknown>> = {
  getReview: (s) => scenario(s, () => S.getReview("r1")),
  getCourseReviews: (s) => scenario(s, () => S.getCourseReviews("c1")),
  getCourseReviewsOpts: (s) =>
    scenario(s, () =>
      S.getCourseReviews("c1", {
        page: 2,
        limit: 5,
        sortBy: "helpful",
        filterBy: { rating: 4, verified: true, status: "APPROVED" as never },
      }),
    ),
  getCourseReviewsRatingHigh: (s) => scenario(s, () => S.getCourseReviews("c1", { sortBy: "rating_high" })),
  getCourseReviewsRatingLow: (s) => scenario(s, () => S.getCourseReviews("c1", { sortBy: "rating_low" })),
  getCourseReviewsOldest: (s) => scenario(s, () => S.getCourseReviews("c1", { sortBy: "oldest" })),
  getUserReviews: (s) => scenario(s, () => S.getUserReviews("u1")),
  getUserReviewsOpts: (s) => scenario(s, () => S.getUserReviews("u1", { page: 3, limit: 4, status: "PENDING" as never })),
  getReviewStats: (s) => scenario(s, () => S.getReviewStats("c1")),
  searchReviews: (s) => scenario(s, () => S.searchReviews("great")),
  searchReviewsFilters: (s) =>
    scenario(s, () =>
      S.searchReviews(
        "great",
        { courseId: "c1", rating: [4, 5], verified: true, dateRange: { from: new Date("2030-01-01"), to: new Date("2030-02-01") } },
        { page: 2, limit: 3 },
      ),
    ),
  getPopularReviews: (s) => scenario(s, () => S.getPopularReviews()),
  getPopularReviewsLimit: (s) => scenario(s, () => S.getPopularReviews(3)),
  getRecentReviews: (s) => scenario(s, () => S.getRecentReviews()),
  getRecentReviewsLimit: (s) => scenario(s, () => S.getRecentReviews(2)),
  invalidateReviewOnly: (s) => scenario(s, () => S.invalidateReviewCache("r1")),
  invalidateReviewAll: (s) => scenario(s, () => S.invalidateReviewCache("r1", "c1", "u1")),
  invalidateReviewNoKeys: (s) => scenario({ ...s, keys: [] }, () => S.invalidateReviewCache("r1")),
  invalidateCourse: (s) => scenario(s, () => S.invalidateCourseCache("c1")),
  invalidateCourseNone: (s) => scenario({ ...s, keys: [] }, () => S.invalidateCourseCache("c1")),
  warmUp: (s) => scenario(s, () => S.warmUpCourseCache("c1")),
  getCacheStats: (s) => scenario(s, () => S.getCacheStats()),
  clearAllCache: (s) => scenario(s, () => S.clearAllCache()),
  clearAllCacheEmpty: (s) => scenario({ ...s, keys: [] }, () => S.clearAllCache()),
};

describe("ReviewCacheService (pinned behaviour)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2030-06-15T10:20:30Z"));
  });

  it("exposes the same static API", () => {
    const names = new Set<string>();
    for (let o: object | null = S; o && o !== Function.prototype; o = Object.getPrototypeOf(o)) {
      for (const k of Object.getOwnPropertyNames(o)) {
        if (typeof Object.getOwnPropertyDescriptor(o, k)?.value === "function" && k !== "constructor") names.add(k);
      }
    }
    expect([...names].sort()).toMatchSnapshot();
  });

  const variants: Array<[string, Setup]> = [
    ["miss-rich", { mode: "rich" }],
    ["miss-empty", { mode: "empty" }],
    ["hit", { cached: hit }],
    ["redis-down", { fail: true }],
  ];
  for (const [vname, setup] of variants) {
    for (const [name, run] of Object.entries(calls)) {
      it(`${name} [${vname}]`, async () => {
        expect(await run(setup)).toMatchSnapshot();
      });
    }
  }
});
