import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { Role, SubscriptionStatus } from "@/lib/generated/prisma/client";
import { __resetRateLimitMemory } from "@/lib/rate-limit";
import { changeUserRole, setUserBan } from "@/lib/services/user-admin";
import { listUsers } from "@/lib/services/admin-listings";
import { resetDatabase } from "../../support/test-db";
import { createSubscription, createUser } from "../../support/factories";

const h = vi.hoisted(() => ({ session: null as { user: { id: string; role: string } } | null }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn(async () => h.session) } } }));
vi.mock("@/lib/redis", () => ({
  default: { eval: vi.fn(async () => { throw new Error("redis down"); }) },
}));

import { createDiscussion } from "@/app/actions/community/discussions";
import { createReply } from "@/app/actions/community/replies";
import { vote } from "@/app/actions/community/votes";
import { toggleTopicFollow } from "@/app/actions/community/follows";
import { updateUserRole } from "@/app/actions/community/moderation";

beforeEach(async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  __resetRateLimitMemory();
  h.session = null;
  await resetDatabase(db);
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

const admin = () => createUser({ role: Role.ADMIN });
const roleOf = async (id: string) => (await db.user.findUniqueOrThrow({ where: { id } })).role;

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("changeUserRole", () => {
  it("changes the role of another account", async () => {
    const actor = await admin();
    const target = await createUser();

    expect(await changeUserRole(actor.id, target.id, "INSTRUCTOR")).toEqual({ ok: true });
    expect(await roleOf(target.id)).toBe(Role.INSTRUCTOR);
  });

  it("refuses roles the platform does not have", async () => {
    const actor = await admin();
    const target = await createUser();

    for (const role of ["MODERATOR", "USER", "MENTOR", "", "admin"]) {
      expect(await changeUserRole(actor.id, target.id, role), role).toEqual({ ok: false, code: "INVALID_ROLE" });
    }
    expect(await roleOf(target.id)).toBe(Role.STUDENT);
  });

  it("does not let an administrator change their own role", async () => {
    const actor = await admin();
    const other = await admin(); // not the last one: the refusal is about the self change

    expect(await changeUserRole(actor.id, actor.id, "STUDENT")).toEqual({ ok: false, code: "SELF" });
    expect(await roleOf(actor.id)).toBe(Role.ADMIN);
    expect(other.id).not.toBe(actor.id);
  });

  it("keeps the last administrator", async () => {
    const actor = await admin();
    const last = await admin();
    await db.user.update({ where: { id: actor.id }, data: { role: Role.INSTRUCTOR } }); // actor is no longer an admin

    expect(await changeUserRole(actor.id, last.id, "STUDENT")).toEqual({ ok: false, code: "LAST_ADMIN" });
    expect(await roleOf(last.id)).toBe(Role.ADMIN);
  });

  it("never leaves the platform without an administrator when two demote each other at once", async () => {
    const a = await admin();
    const b = await admin();

    const results = await Promise.all([changeUserRole(a.id, b.id, "STUDENT"), changeUserRole(b.id, a.id, "STUDENT")]);

    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(await db.user.count({ where: { role: Role.ADMIN } })).toBe(1);
  });

  it("reports an unknown account", async () => {
    const actor = await admin();
    expect(await changeUserRole(actor.id, "nobody", "STUDENT")).toEqual({ ok: false, code: "NOT_FOUND" });
  });
});

describe("setUserBan", () => {
  it("suspends and restores an account", async () => {
    const actor = await admin();
    const target = await createUser();

    expect(await setUserBan(actor.id, target.id, true)).toEqual({ ok: true });
    expect((await db.user.findUniqueOrThrow({ where: { id: target.id } })).isBanned).toBe(true);
    expect(await setUserBan(actor.id, target.id, false)).toEqual({ ok: true });
    expect((await db.user.findUniqueOrThrow({ where: { id: target.id } })).isBanned).toBe(false);
  });

  it("does not suspend oneself, nor an administrator", async () => {
    const actor = await admin();
    const other = await admin();

    expect(await setUserBan(actor.id, actor.id, true)).toEqual({ ok: false, code: "SELF" });
    expect(await setUserBan(actor.id, other.id, true)).toEqual({ ok: false, code: "PROTECTED_ADMIN" });
  });
});

describe("the community ban is enforced", () => {
  it("refuses every community write from a suspended account, and stores nothing", async () => {
    const author = await createUser();
    const banned = await createUser({ isBanned: true });
    const topic = await db.topic.create({ data: { name: "General", slug: "general", description: "General topic" } });

    h.session = { user: { id: author.id, role: "STUDENT" } };
    const created = await createDiscussion(form({ title: "A discussion title", content: "A sufficiently long body for the discussion.", topicId: topic.id }));
    expect(created.success).toBe(true);
    const discussionId = created.discussion!.id;

    h.session = { user: { id: banned.id, role: "STUDENT" } };
    const suspended = { success: false, error: "Your account is suspended from the community" };
    expect(await createDiscussion(form({ title: "Another discussion", content: "A sufficiently long body for the discussion.", topicId: topic.id }))).toEqual(suspended);
    expect(await createReply(form({ content: "A reply from a suspended account", discussionId }))).toEqual(suspended);
    expect(await vote(form({ voteType: "UPVOTE", targetId: discussionId, targetType: "discussion" }))).toEqual(suspended);
    expect(await toggleTopicFollow(topic.id)).toMatchObject(suspended);

    expect(await db.discussion.count({ where: { authorId: banned.id } })).toBe(0);
    expect(await db.discussionReply.count({ where: { authorId: banned.id } })).toBe(0);
    expect(await db.discussionVote.count({ where: { userId: banned.id } })).toBe(0);
  });

  it("lets the account write again once the suspension is lifted", async () => {
    const actor = await admin();
    const user = await createUser({ isBanned: true });
    const topic = await db.topic.create({ data: { name: "General", slug: "general", description: "General topic" } });
    h.session = { user: { id: user.id, role: "STUDENT" } };
    const body = form({ title: "Back in the community", content: "A sufficiently long body for the discussion.", topicId: topic.id });

    expect((await createDiscussion(body)).success).toBe(false);
    await setUserBan(actor.id, user.id, false);
    expect((await createDiscussion(body)).success).toBe(true);
  });
});

describe("the community role action", () => {
  it("applies the same rules and answers in French", async () => {
    const actor = await admin();
    const target = await createUser();
    h.session = { user: { id: actor.id, role: "ADMIN" } };

    expect(await updateUserRole(form({ userId: target.id, role: "INSTRUCTOR" }))).toEqual({ success: true });
    expect(await roleOf(target.id)).toBe(Role.INSTRUCTOR);
    expect(await updateUserRole(form({ userId: target.id, role: "MODERATOR" }))).toMatchObject({ success: false, error: "Rôle inconnu." });
    expect(await updateUserRole(form({ userId: actor.id, role: "STUDENT" }))).toMatchObject({ success: false });
  });
});

describe("listUsers", () => {
  it("filters by name or e-mail, role and plan, and counts what the person did", async () => {
    const ada = await createUser({ name: "Ada Lovelace", email: "ada@example.test" });
    const bob = await createUser({ name: "Bob Martin", email: "bob@example.test", role: Role.INSTRUCTOR });
    await createSubscription(ada.id, { status: SubscriptionStatus.ACTIVE });

    expect((await listUsers({})).total).toBe(2);
    expect((await listUsers({ q: "lovelace" })).rows.map((row) => row.id)).toEqual([ada.id]);
    expect((await listUsers({ q: "BOB@" })).rows.map((row) => row.id)).toEqual([bob.id]);
    expect((await listUsers({ role: "INSTRUCTOR" })).rows.map((row) => row.id)).toEqual([bob.id]);
    expect((await listUsers({ plan: "premium" })).rows.map((row) => row.id)).toEqual([ada.id]);
    expect((await listUsers({ plan: "free" })).rows.map((row) => row.id)).toEqual([bob.id]);
    expect((await listUsers({ q: "%" })).total).toBe(0); // a wildcard is text, not "everything"
    expect((await listUsers({ role: "NOPE" })).total).toBe(2); // unknown filter values are ignored
    expect((await listUsers({ plan: "premium" })).rows[0]).toMatchObject({ premium: true, isBanned: false, enrollments: 0, spent: 0 });
  });
});
