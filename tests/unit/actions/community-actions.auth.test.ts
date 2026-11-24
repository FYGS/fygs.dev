/**
 * Characterization tests: access control of app/actions/community-actions.ts
 *
 * These tests freeze the CURRENT behaviour before the file is split into
 * domain modules (refactor stage 2). They run against mocked auth and Prisma:
 * they prove that guards run before any database access and that role /
 * ownership checks return the same errors. They do NOT prove SQL behaviour
 * or query counts (that needs the Docker test database).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const { dbCalls, dbResults, getSession } = vi.hoisted(() => ({
  dbCalls: [] as { key: string; args: unknown[] }[],
  dbResults: new Map<string, unknown>(),
  getSession: vi.fn(),
}));

vi.mock("@/lib/db", () => {
  const model = (name: string) =>
    new Proxy(
      {},
      {
        get: (_target, method) => (...args: unknown[]) => {
          const key = `${name}.${String(method)}`;
          dbCalls.push({ key, args });
          const result = dbResults.has(key) ? dbResults.get(key) : null;
          return Promise.resolve(result);
        },
      },
    );
  return {
    db: new Proxy({}, { get: (_target, name) => model(String(name)) }),
  };
});

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession } },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import * as actions from "@/app/actions/community-actions";

const WRITE_METHODS = /\.(create|update|updateMany|delete|deleteMany|upsert)$/;

function formData(fields: Record<string, string> = {}): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

function sessionFor(role: string, id = "user-1") {
  getSession.mockResolvedValue({ user: { id, role, name: "Test" } });
}

function writes() {
  return dbCalls.filter((c) => WRITE_METHODS.test(c.key));
}

beforeEach(() => {
  dbCalls.length = 0;
  dbResults.clear();
  getSession.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("export surface (must survive the file split)", () => {
  it("exports exactly the 29 known server actions", () => {
    expect(Object.keys(actions).sort()).toEqual(
      [
        "banUser",
        "checkUserFollow",
        "createDiscussion",
        "createMentorRequest",
        "createReply",
        "deleteDiscussion",
        "deleteNotification",
        "deleteReply",
        "getAvailableMentors",
        "getMentorRequests",
        "getNotifications",
        "getUserFollowers",
        "getUserFollowing",
        "markAllNotificationsAsRead",
        "markNotificationAsRead",
        "markNotificationsAsRead",
        "moderateContent",
        "respondToMentorRequest",
        "toggleBookmark",
        "toggleTopicFollow",
        "toggleUserFollow",
        "unbanUser",
        "updateCommunityProfile",
        "updateDiscussion",
        "updateReply",
        "updateUserRole",
        "vote",
        "voteOnDiscussion",
        "voteOnReply",
      ].sort(),
    );
  });
});

describe("unauthenticated callers", () => {
  const AUTH_REQUIRED = "Authentication required";
  const NOT_AUTH = "Not authenticated";

  const cases: [string, () => Promise<unknown>, string][] = [
    ["createDiscussion", () => actions.createDiscussion(formData()), AUTH_REQUIRED],
    ["updateDiscussion", () => actions.updateDiscussion("d1", formData()), AUTH_REQUIRED],
    ["deleteDiscussion", () => actions.deleteDiscussion("d1"), AUTH_REQUIRED],
    ["createReply", () => actions.createReply(formData()), AUTH_REQUIRED],
    ["vote", () => actions.vote(formData()), AUTH_REQUIRED],
    ["voteOnDiscussion", () => actions.voteOnDiscussion("d1", "UPVOTE"), AUTH_REQUIRED],
    ["voteOnReply", () => actions.voteOnReply("r1", "UPVOTE"), AUTH_REQUIRED],
    ["toggleBookmark", () => actions.toggleBookmark("d1"), AUTH_REQUIRED],
    ["toggleTopicFollow", () => actions.toggleTopicFollow("t1"), AUTH_REQUIRED],
    ["createMentorRequest", () => actions.createMentorRequest(formData()), AUTH_REQUIRED],
    ["updateCommunityProfile", () => actions.updateCommunityProfile(formData()), AUTH_REQUIRED],
    ["deleteReply", () => actions.deleteReply("r1"), AUTH_REQUIRED],
    ["updateReply", () => actions.updateReply("r1", "text"), AUTH_REQUIRED],
    ["getMentorRequests", () => actions.getMentorRequests("user-1"), "Unauthorized"],
    ["respondToMentorRequest", () => actions.respondToMentorRequest("m1", "accept"), AUTH_REQUIRED],
    ["markNotificationsAsRead", () => actions.markNotificationsAsRead(["n1"]), NOT_AUTH],
    ["markNotificationAsRead", () => actions.markNotificationAsRead(formData({ notificationId: "n1" })), NOT_AUTH],
    ["markAllNotificationsAsRead", () => actions.markAllNotificationsAsRead(), NOT_AUTH],
    ["deleteNotification", () => actions.deleteNotification(formData({ notificationId: "n1" })), NOT_AUTH],
    ["moderateContent", () => actions.moderateContent(formData()), "Insufficient permissions"],
    ["updateUserRole", () => actions.updateUserRole(formData()), "Insufficient permissions"],
    ["banUser", () => actions.banUser(formData()), "Insufficient permissions"],
    ["unbanUser", () => actions.unbanUser(formData()), "Insufficient permissions"],
    ["toggleUserFollow", () => actions.toggleUserFollow("user-2"), AUTH_REQUIRED],
    ["getNotifications", () => actions.getNotifications("user-1", { filter: "all" }), "Unauthorized"],
    ["getUserFollowers", () => actions.getUserFollowers("user-2"), AUTH_REQUIRED],
    ["getUserFollowing", () => actions.getUserFollowing("user-2"), AUTH_REQUIRED],
  ];

  it.each(cases)("%s rejects without a session and touches no data", async (_name, call, error) => {
    getSession.mockResolvedValue(null);
    const result = (await call()) as { success: boolean; error?: string };
    expect(result.success).toBe(false);
    expect(result.error).toBe(error);
    expect(dbCalls).toEqual([]);
  });
});

describe("role-gated actions", () => {
  const gated: [string, () => Promise<unknown>][] = [
    ["moderateContent", () => actions.moderateContent(formData())],
    ["banUser", () => actions.banUser(formData())],
    ["unbanUser", () => actions.unbanUser(formData())],
    ["updateUserRole", () => actions.updateUserRole(formData())],
  ];

  it.each(gated)("%s rejects a plain USER", async (_name, call) => {
    sessionFor("USER");
    const result = (await call()) as { success: boolean; error?: string };
    expect(result).toEqual({ success: false, error: "Insufficient permissions" });
    expect(dbCalls).toEqual([]);
  });

  it("updateUserRole rejects a MODERATOR (ADMIN only)", async () => {
    sessionFor("MODERATOR");
    expect(await actions.updateUserRole(formData())).toEqual({
      success: false,
      error: "Insufficient permissions",
    });
    expect(dbCalls).toEqual([]);
  });

  it("moderateContent, banUser and unbanUser let MODERATOR past the role gate", async () => {
    sessionFor("MODERATOR");
    for (const call of [
      () => actions.moderateContent(formData()),
      () => actions.banUser(formData()),
      () => actions.unbanUser(formData()),
    ]) {
      const result = (await call()) as { error?: string };
      expect(result.error).not.toBe("Insufficient permissions");
    }
  });
});

describe("ownership checks", () => {
  it("updateDiscussion rejects a non-owner STUDENT without writing", async () => {
    sessionFor("STUDENT", "user-1");
    dbResults.set("discussion.findUnique", { id: "d1", authorId: "someone-else" });
    const result = await actions.updateDiscussion("d1", formData());
    expect(result).toEqual({ success: false, error: "Permission denied" });
    expect(writes()).toEqual([]);
  });

  it("deleteDiscussion rejects a non-owner who is not ADMIN without writing", async () => {
    sessionFor("INSTRUCTOR", "user-1");
    dbResults.set("discussion.findUnique", { id: "d1", authorId: "someone-else" });
    const result = await actions.deleteDiscussion("d1");
    expect(result).toEqual({ success: false, error: "Permission denied" });
    expect(writes()).toEqual([]);
  });

  it("deleteReply rejects a non-owner who is not ADMIN without writing", async () => {
    sessionFor("INSTRUCTOR", "user-1");
    dbResults.set("discussionReply.findUnique", { id: "r1", authorId: "someone-else" });
    const result = await actions.deleteReply("r1");
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(writes()).toEqual([]);
  });

  it("updateReply rejects a non-owner even when ADMIN", async () => {
    sessionFor("ADMIN", "user-1");
    dbResults.set("discussionReply.findUnique", { id: "r1", authorId: "someone-else" });
    const result = await actions.updateReply("r1", "edited");
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(writes()).toEqual([]);
  });

  it("respondToMentorRequest rejects a user who is not the mentor", async () => {
    sessionFor("INSTRUCTOR", "user-1");
    dbResults.set("mentorRequest.findUnique", { id: "m1", mentorId: "someone-else" });
    const result = await actions.respondToMentorRequest("m1", "accept");
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(writes()).toEqual([]);
  });

  it("getMentorRequests rejects reading another user's requests", async () => {
    sessionFor("ADMIN", "user-1");
    const result = await actions.getMentorRequests("someone-else");
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(dbCalls).toEqual([]);
  });
});

describe("session required for notifications and follow lists", () => {
  it("getNotifications rejects a signed-in user asking for someone else's notifications", async () => {
    sessionFor("USER", "user-1");
    const result = await actions.getNotifications("victim", { filter: "all" });
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(dbCalls).toEqual([]);
  });

  it("getNotifications returns the caller's own notifications", async () => {
    sessionFor("USER", "user-1");
    dbResults.set("notification.findMany", [{ id: "n1", recipientId: "user-1" }]);
    const result = (await actions.getNotifications("user-1", { filter: "unread" })) as {
      success: boolean;
      data: unknown[];
    };
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    const call = dbCalls.find((c) => c.key === "notification.findMany");
    expect((call?.args[0] as { where: { recipientId: string; isRead: boolean } }).where).toEqual({
      recipientId: "user-1",
      isRead: false,
    });
  });

  it("getUserFollowers and getUserFollowing work for a signed-in user", async () => {
    sessionFor("USER", "user-1");
    dbResults.set("userFollow.findMany", []);
    dbResults.set("userFollow.count", 0);
    expect(((await actions.getUserFollowers("user-2")) as { success: boolean }).success).toBe(true);
    expect(((await actions.getUserFollowing("user-2")) as { success: boolean }).success).toBe(true);
  });
});

/**
 * Still public on purpose: these only expose data meant to be shown to any
 * visitor (instructor directory) or answer "false" without a session.
 */
describe("actions that stay readable without a session", () => {
  it("getAvailableMentors lists instructors without a session", async () => {
    getSession.mockResolvedValue(null);
    dbResults.set("user.findMany", []);
    const result = await actions.getAvailableMentors();
    expect(result).toEqual({ success: true, data: [] });
  });

  it("checkUserFollow answers isFollowing=false without a session (not an error)", async () => {
    getSession.mockResolvedValue(null);
    const result = await actions.checkUserFollow("user-2");
    expect(result).toEqual({ success: true, data: { isFollowing: false } });
    expect(dbCalls).toEqual([]);
  });
});
