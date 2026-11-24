import { createHash } from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RecorderMode } from "./db-recorder";

const rec = vi.hoisted(() => ({ current: null as null | ReturnType<typeof import("./db-recorder").createDbRecorder> }));
vi.mock("@/lib/db", async () => {
  const { createDbRecorder } = await import("./db-recorder");
  rec.current = createDbRecorder();
  return { db: rec.current.db };
});

import { CommunityService as S } from "@/lib/services/community-service";

const hash = (v: unknown) =>
  createHash("sha256").update(JSON.stringify(v, (_k, x) => (typeof x === "bigint" ? String(x) : x))).digest("hex");

const filters = { sort: "latest" as const, page: 2, limit: 5 };

const scenarios: Record<string, () => Promise<unknown>> = {
  ...Object.fromEntries(
    ["latest", "trending", "most_replies", "most_votes", "oldest", "top", "recent", "solved", "unsolved"].map((sort) => [
      `getDiscussions-sort-${sort}`,
      () => S.getDiscussions({ ...filters, sort: sort as never }, "u1"),
    ]),
  ),
  getTopics: () => S.getTopics(),
  getTopicsUser: () => S.getTopics("u1"),
  getDiscussions: () => S.getDiscussions(filters),
  getDiscussionsFull: () =>
    S.getDiscussions(
      { ...filters, sort: "trending", topicId: "t1", courseId: "c1", tags: ["a", "b"], authorId: "u2", status: "solved", search: "react" },
      "u1",
    ),
  getDiscussionsPinned: () => S.getDiscussions({ ...filters, sort: "popular" as never, status: "pinned" }, "u1"),
  getDiscussionsUnsolved: () => S.getDiscussions({ ...filters, status: "unsolved" }),
  getDiscussion: () => S.getDiscussion("slug", "topic", "u1"),
  getDiscussionAnon: () => S.getDiscussion("slug", "topic"),
  getDiscussionById: () => S.getDiscussionById("d1"),
  getDiscussionByIdReplies: () => S.getDiscussionById("d1", { userId: "u1", includeReplies: true }),
  getReplies: () => S.getReplies("d1", "u1"),
  getRepliesAnon: () => S.getReplies("d1"),
  searchDiscussions: () => S.searchDiscussions("react hooks", {}, "u1"),
  searchDiscussionsFiltered: () => S.searchDiscussions("x", { sort: "trending", topicId: "t1", page: 3, limit: 4 }),
  getTrendingDiscussions: () => S.getTrendingDiscussions(),
  getTrendingDiscussionsLimit: () => S.getTrendingDiscussions(3, "u1"),
  getCommunityStats: () => S.getCommunityStats(),
  getRecommendations: () => S.getRecommendations("u1"),
  getFollowedTopics: () => S.getFollowedTopics("u1"),
  isFollowingTopic: () => S.isFollowingTopic("u1", "t1"),
  getUnreadNotificationsCount: () => S.getUnreadNotificationsCount("u1"),
  getUserBookmarks: () => S.getUserBookmarks("u1"),
  getUserBookmarksPage: () => S.getUserBookmarks("u1", 3, 7),
  getUserReplies: () => S.getUserReplies("u1"),
  getUserRepliesPage: () => S.getUserReplies("u1", 2, 10),
  getUserProfile: () => S.getUserProfile("u1"),
  getAvailableMentors: () => S.getAvailableMentors(),
  getMentorshipStats: () => S.getMentorshipStats(),
};

describe("CommunityService (pinned queries and results)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2030-06-15T10:20:30Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("exposes the same static API", () => {
    expect(
      Object.getOwnPropertyNames(S)
        .filter((k) => typeof (S as never)[k] === "function")
        // private helpers are implementation details, not part of the API
        .filter((k) => !["getDiscussionOrderBy", "getTopContributors", "getTrendingTopics", "getRecentActivity"].includes(k))
        .sort(),
    ).toMatchSnapshot();
  });

  for (const mode of ["empty", "rich"] as RecorderMode[]) {
    for (const [name, run] of Object.entries(scenarios)) {
      it(`${name} [${mode}]`, async () => {
        const r = rec.current!;
        r.state.mode = mode;
        r.calls.length = 0;
        let outcome: unknown;
        try {
          outcome = { value: await run() };
        } catch (e) {
          outcome = { error: (e as Error).message };
        }
        expect({
          callCount: r.calls.length,
          calls: hash(r.calls),
          outcome: hash(outcome),
          error: (outcome as { error?: string }).error,
          // readable view of which tables/methods were hit, in order
          order: r.calls.map((c) => (c as string[])[0]),
        }).toMatchSnapshot();
      });
    }
  }
});
