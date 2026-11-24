import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { __resetRateLimitMemory } from "@/lib/rate-limit";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createUser } from "../../support/factories";

type SessionUser = { id: string; role: string; name?: string };
const h = vi.hoisted(() => ({ session: null as { user: SessionUser } | null }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn(async () => h.session) } } }));
vi.mock("@/lib/redis", () => ({ default: { eval: vi.fn(async () => { throw new Error("redis down"); }) } }));

import { updateDiscussion } from "@/app/actions/community/discussions";
import { createReply, updateReply } from "@/app/actions/community/replies";
import { vote } from "@/app/actions/community/votes";
import { createMentorRequest, respondToMentorRequest } from "@/app/actions/community/mentors";
import { updateCommunityProfile } from "@/app/actions/community/profile";
import { getUserFollowers } from "@/app/actions/community/follows";
import { banUser, moderateContent, unbanUser, updateUserRole } from "@/app/actions/community/moderation";

const as = (user: { id: string; role: string; name?: string } | null) => {
  h.session = user ? { user: { id: user.id, role: user.role, name: user.name ?? "Membre" } } : null;
};
const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};

let f: Awaited<ReturnType<typeof fixture>>;

async function fixture() {
  const author = await createUser({ name: "Auteur" });
  const other = await createUser({ name: "Autre élève" });
  const instructor = await createUser({ role: "INSTRUCTOR", name: "Formateur du cours" });
  const otherInstructor = await createUser({ role: "INSTRUCTOR", name: "Autre formateur" });
  const admin = await createUser({ role: "ADMIN", name: "Admin" });
  const course = await createCourse({ instructorId: instructor.id });
  const topic = await db.topic.create({ data: { name: "General", slug: "general", description: "General topic" } });
  const discussion = await db.discussion.create({
    data: { title: "Une question sur le cours", slug: "une-question", content: "x".repeat(40), authorId: author.id, topicId: topic.id, courseId: course.id },
  });
  const standalone = await db.discussion.create({
    data: { title: "Discussion libre sans cours", slug: "discussion-libre", content: "y".repeat(40), authorId: author.id, topicId: topic.id },
  });
  return { author, other, instructor, otherInstructor, admin, course, topic, discussion, standalone };
}

beforeEach(async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  __resetRateLimitMemory();
  as(null);
  await resetDatabase(db);
  f = await fixture();
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

const reload = (id: string) => db.discussion.findUniqueOrThrow({ where: { id } });

describe("updateDiscussion: who may change what", () => {
  it("the author edits the text and marks the discussion solved or unsolved, but cannot pin or lock it", async () => {
    as(f.author);
    expect(await updateDiscussion(f.discussion.id, form({ title: "Un titre plus précis", content: "z".repeat(40) }))).toMatchObject({ success: true });
    expect((await reload(f.discussion.id)).title).toBe("Un titre plus précis");

    expect(await updateDiscussion(f.discussion.id, form({ isSolved: "true" }))).toMatchObject({ success: true });
    expect((await reload(f.discussion.id)).isSolved).toBe(true);
    // "false" really unsolves (an absent field used to be indistinguishable from false)
    expect(await updateDiscussion(f.discussion.id, form({ isSolved: "false" }))).toMatchObject({ success: true });
    expect((await reload(f.discussion.id)).isSolved).toBe(false);

    for (const flag of ["isPinned", "isLocked"]) {
      expect(await updateDiscussion(f.discussion.id, form({ [flag]: "true" }))).toMatchObject({ success: false, error: "Permission denied" });
    }
    const after = await reload(f.discussion.id);
    expect([after.isPinned, after.isLocked]).toEqual([false, false]);
  });

  it("another student can do nothing", async () => {
    as(f.other);
    const attempts: Record<string, string>[] = [{ title: "Titre détourné par un tiers" }, { isSolved: "true" }, { isPinned: "true" }, { isLocked: "true" }];
    for (const fields of attempts) {
      expect(await updateDiscussion(f.discussion.id, form(fields)), JSON.stringify(fields)).toMatchObject({ success: false });
    }
    expect(await reload(f.discussion.id)).toMatchObject({ title: "Une question sur le cours", isSolved: false, isPinned: false, isLocked: false });
  });

  it("the instructor of the discussion's course moderates it (pin, lock, solved) but does not rewrite the author's text", async () => {
    as(f.instructor);
    expect(await updateDiscussion(f.discussion.id, form({ isPinned: "true", isLocked: "true", isSolved: "true" }))).toMatchObject({ success: true });
    expect(await reload(f.discussion.id)).toMatchObject({ isPinned: true, isLocked: true, isSolved: true });
    expect(await updateDiscussion(f.discussion.id, form({ title: "Titre réécrit par le formateur" }))).toMatchObject({ success: false });
    expect((await reload(f.discussion.id)).title).toBe("Une question sur le cours");
  });

  it("another instructor has no power over a discussion of someone else's course, nor over a free one", async () => {
    as(f.otherInstructor);
    for (const id of [f.discussion.id, f.standalone.id]) {
      expect(await updateDiscussion(id, form({ isPinned: "true" }))).toMatchObject({ success: false });
      expect(await updateDiscussion(id, form({ isLocked: "true" }))).toMatchObject({ success: false });
    }
    expect(await reload(f.discussion.id)).toMatchObject({ isPinned: false, isLocked: false });
    expect(await reload(f.standalone.id)).toMatchObject({ isPinned: false, isLocked: false });
  });

  it("an administrator moderates everything, and a locked discussion freezes its author's text", async () => {
    as(f.admin);
    expect(await updateDiscussion(f.standalone.id, form({ isLocked: "true" }))).toMatchObject({ success: true });
    as(f.author);
    expect(await updateDiscussion(f.standalone.id, form({ content: "w".repeat(40) }))).toMatchObject({ success: false, error: "Discussion is locked" });
  });
});

describe("replies", () => {
  const reply = (discussionId: string, over: Record<string, string> = {}) =>
    createReply(form({ discussionId, content: "Une réponse suffisamment longue.", ...over }));

  it("refuses to reply to a locked, closed or archived discussion", async () => {
    as(f.other);
    await db.discussion.update({ where: { id: f.discussion.id }, data: { isLocked: true } });
    expect(await reply(f.discussion.id)).toMatchObject({ success: false, error: "Discussion is closed to new replies" });
    await db.discussion.update({ where: { id: f.discussion.id }, data: { isLocked: false, status: "CLOSED" } });
    expect(await reply(f.discussion.id)).toMatchObject({ success: false });
    expect(await db.discussionReply.count()).toBe(0);
    await db.discussion.update({ where: { id: f.discussion.id }, data: { status: "ACTIVE" } });
    expect(await reply(f.discussion.id)).toMatchObject({ success: true });
    expect((await reload(f.discussion.id)).replyCount).toBe(1);
  });

  it("a reply to a reply must stay in the same discussion", async () => {
    as(f.other);
    const first = await reply(f.discussion.id);
    expect(first.success).toBe(true);
    const parentId = first.reply!.id;
    expect(await reply(f.standalone.id, { parentId })).toMatchObject({ success: false, error: "Parent reply not found" });
    expect(await reply(f.discussion.id, { parentId })).toMatchObject({ success: true });
    expect(await reply(f.discussion.id, { parentId: "clzzzzzzzzzzzzzzzzzzzzzzz" })).toMatchObject({ success: false });
  });

  it("marks as moderator only an administrator or the instructor of THIS discussion's course", async () => {
    const markOf = async (user: SessionUser, discussionId: string) => {
      as(user);
      const result = await reply(discussionId);
      return (await db.discussionReply.findUniqueOrThrow({ where: { id: result.reply!.id } })).isModerator;
    };
    expect(await markOf(f.instructor, f.discussion.id)).toBe(true);
    expect(await markOf(f.admin, f.standalone.id)).toBe(true);
    expect(await markOf(f.otherInstructor, f.discussion.id)).toBe(false);
    expect(await markOf(f.other, f.discussion.id)).toBe(false);
  });

  it("an edit follows the length rule and respects the lock", async () => {
    as(f.other);
    const created = await reply(f.discussion.id);
    expect(await updateReply(created.reply!.id, "court")).toMatchObject({ success: false });
    expect(await updateReply(created.reply!.id, "x".repeat(6000))).toMatchObject({ success: false });
    expect(await updateReply(created.reply!.id, "Une réponse corrigée et complète.")).toMatchObject({ success: true });
    await db.discussion.update({ where: { id: f.discussion.id }, data: { isLocked: true } });
    expect(await updateReply(created.reply!.id, "Une autre correction après verrouillage.")).toMatchObject({ success: false });
    as(f.author);
    expect(await updateReply(created.reply!.id, "Quelqu'un d'autre qui réécrit la réponse.")).toMatchObject({ success: false });
  });
});

describe("votes", () => {
  const upvote = (discussionId: string) => vote(form({ targetId: discussionId, targetType: "discussion", voteType: "UPVOTE" }));
  const downvote = (discussionId: string) => vote(form({ targetId: discussionId, targetType: "discussion", voteType: "DOWNVOTE" }));

  async function expectCountersMatchRows(discussionId: string) {
    const [row, up, down] = await Promise.all([
      reload(discussionId),
      db.discussionVote.count({ where: { discussionId, voteType: "UPVOTE" } }),
      db.discussionVote.count({ where: { discussionId, voteType: "DOWNVOTE" } }),
    ]);
    expect({ up: row.upvoteCount, down: row.downvoteCount }).toEqual({ up, down });
    return { up, down };
  }

  it("nobody votes on their own content, on something missing or on a locked discussion", async () => {
    as(f.author);
    expect(await upvote(f.discussion.id)).toMatchObject({ success: false, error: "You cannot vote on your own content" });
    as(f.other);
    expect(await upvote("clzzzzzzzzzzzzzzzzzzzzzzz")).toMatchObject({ success: false, error: "Target not found" });
    await db.discussion.update({ where: { id: f.discussion.id }, data: { isLocked: true } });
    expect(await upvote(f.discussion.id)).toMatchObject({ success: false, error: "Discussion is closed" });
  });

  it("switching from up to down moves the counter instead of growing both", async () => {
    as(f.other);
    expect((await upvote(f.discussion.id)).vote).toMatchObject({ count: 1, userVoted: true });
    expect((await downvote(f.discussion.id)).vote).toMatchObject({ count: -1, userVoted: true });
    expect(await expectCountersMatchRows(f.discussion.id)).toEqual({ up: 0, down: 1 });
    expect((await downvote(f.discussion.id)).vote).toMatchObject({ count: 0, userVoted: false });
    expect(await expectCountersMatchRows(f.discussion.id)).toEqual({ up: 0, down: 0 });
  });

  it("toggling earns nothing: the author's points follow the upvotes they hold now", async () => {
    const pointsOfAuthor = async () => (await db.user.findUniqueOrThrow({ where: { id: f.author.id } })).communityPoints;
    const before = await pointsOfAuthor();
    as(f.other);
    for (let i = 0; i < 6; i++) await upvote(f.discussion.id); // up, off, up, off, up, off
    expect(await pointsOfAuthor()).toBe(before);
    await upvote(f.discussion.id);
    expect(await pointsOfAuthor()).toBe(before + 1);
    await downvote(f.discussion.id); // up -> down takes the point back
    expect(await pointsOfAuthor()).toBe(before);
  });

  it("counters equal the vote rows however many requests arrive together", async () => {
    const voters = await Promise.all(Array.from({ length: 6 }, () => createUser()));
    // each voter fires several toggles at once (the session is global, so voters go one after the other)
    for (const voter of voters) {
      as(voter);
      await Promise.all([upvote(f.discussion.id), upvote(f.discussion.id), downvote(f.discussion.id), upvote(f.discussion.id)]);
    }
    const { up, down } = await expectCountersMatchRows(f.discussion.id);
    expect(up + down).toBeLessThanOrEqual(voters.length);
    const authorPoints = (await db.user.findUniqueOrThrow({ where: { id: f.author.id } })).communityPoints;
    expect(authorPoints).toBe(up); // points = upvotes held now, whatever the order of the requests
  });
});

describe("mentor requests", () => {
  const ask = (fields: Record<string, string>) =>
    createMentorRequest(form({ message: "Pourriez-vous m'accompagner sur ce projet ?", ...fields }));

  it("targets an instructor, never yourself nor an arbitrary account", async () => {
    as(f.other);
    expect(await ask({ mentorId: f.author.id })).toMatchObject({ success: false, error: "Mentor not found" });
    expect(await ask({ mentorId: f.admin.id })).toMatchObject({ success: false });
    expect(await ask({ mentorId: "clzzzzzzzzzzzzzzzzzzzzzzz" })).toMatchObject({ success: false });
    as(f.instructor);
    expect(await ask({ mentorId: f.instructor.id })).toMatchObject({ success: false, error: expect.stringContaining("yourself") });
    expect(await db.mentorRequest.count()).toBe(0);
  });

  it("a banned instructor cannot be asked", async () => {
    await db.user.update({ where: { id: f.instructor.id }, data: { isBanned: true } });
    as(f.other);
    expect(await ask({ mentorId: f.instructor.id })).toMatchObject({ success: false, error: "Mentor not found" });
  });

  it("the course, if any, must be one of the mentor's own", async () => {
    as(f.other);
    expect(await ask({ mentorId: f.otherInstructor.id, courseId: f.course.id })).toMatchObject({ success: false, error: expect.stringContaining("not taught") });
    expect(await ask({ mentorId: f.instructor.id, courseId: f.course.id })).toMatchObject({ success: true });
  });

  it("only the mentor answers, and an answer is final", async () => {
    as(f.other);
    await ask({ mentorId: f.instructor.id });
    const request = await db.mentorRequest.findFirstOrThrow();
    as(f.otherInstructor);
    expect(await respondToMentorRequest(request.id, "accept")).toMatchObject({ success: false, error: "Unauthorized" });
    as(f.instructor);
    expect(await respondToMentorRequest(request.id, "decline")).toMatchObject({ success: true });
    expect(await respondToMentorRequest(request.id, "accept")).toMatchObject({ success: false, error: "Request already answered" });
    expect((await db.mentorRequest.findUniqueOrThrow({ where: { id: request.id } })).status).toBe("DECLINED");
  });
});

describe("community profile links", () => {
  const save = (fields: Record<string, string>) => updateCommunityProfile(form(fields));

  it("accepts https addresses only", async () => {
    as(f.author);
    for (const bad of ["javascript:alert(1)", "http://example.com", "data:text/html,x", "//evil.tld", "ftp://example.com", "not a url"]) {
      expect(await save({ websiteUrl: bad }), bad).toMatchObject({ success: false });
    }
    expect((await db.user.findUniqueOrThrow({ where: { id: f.author.id } })).websiteUrl).toBeNull();
    expect(await save({ websiteUrl: "https://example.com/moi", githubUrl: "https://github.com/moi", bio: "Développeur" })).toMatchObject({ success: true });
    expect(await db.user.findUniqueOrThrow({ where: { id: f.author.id } })).toMatchObject({ websiteUrl: "https://example.com/moi", githubUrl: "https://github.com/moi", bio: "Développeur" });
  });

  it("an empty field clears the link, an absent one leaves it", async () => {
    as(f.author);
    await save({ websiteUrl: "https://example.com/moi", linkedinUrl: "https://linkedin.com/in/moi" });
    await save({ websiteUrl: "" });
    expect(await db.user.findUniqueOrThrow({ where: { id: f.author.id } })).toMatchObject({ websiteUrl: null, linkedinUrl: "https://linkedin.com/in/moi" });
  });

  it("a link saved before the https rule never reaches a page", async () => {
    await db.user.update({ where: { id: f.author.id }, data: { websiteUrl: "javascript:alert(1)", githubUrl: "https://github.com/ok" } });
    const { CommunityService } = await import("@/lib/services/community-service");
    const profile = await CommunityService.getUserProfile(f.author.id);
    expect(profile!.user.websiteUrl).toBeNull();
    expect(profile!.user.githubUrl).toBe("https://github.com/ok");
  });
});

describe("paging arguments of public actions", () => {
  it("are clamped: a million rows or a negative page never reach the query", async () => {
    as(f.other);
    const many = await Promise.all(Array.from({ length: 60 }, () => createUser()));
    await db.userFollow.createMany({ data: many.map((u) => ({ followerId: u.id, followingId: f.author.id })) });
    const huge = await getUserFollowers(f.author.id, 1, 1_000_000);
    expect(huge.success).toBe(true);
    expect(huge.data.followers.length).toBe(50);
    expect(huge.data.pagination.limit).toBe(50);
    const negative = await getUserFollowers(f.author.id, -4, -10);
    expect(negative.success).toBe(true);
    expect(negative.data.pagination.page).toBe(1);
    const nan = await getUserFollowers(f.author.id, Number.NaN, Number.NaN);
    expect(nan.success).toBe(true);
  });
});

describe("administration actions leave a trail", () => {
  const entries = (action: string) => db.auditLog.findMany({ where: { action }, orderBy: { createdAt: "asc" } });

  it("role change, ban and unban", async () => {
    as(f.admin);
    expect(await updateUserRole(form({ userId: f.other.id, role: "INSTRUCTOR" }))).toEqual({ success: true });
    expect(await banUser(form({ userId: f.author.id }))).toEqual({ success: true });
    expect(await unbanUser(form({ userId: f.author.id }))).toEqual({ success: true });

    expect(await entries("user.role_changed")).toEqual([
      expect.objectContaining({ actorId: f.admin.id, targetType: "user", targetId: f.other.id, metadata: { from: "STUDENT", to: "INSTRUCTOR" } }),
    ]);
    expect(await entries("user.banned")).toHaveLength(1);
    expect(await entries("user.unbanned")).toHaveLength(1);
  });

  it("a refused change leaves no entry", async () => {
    as(f.admin);
    expect(await updateUserRole(form({ userId: f.admin.id, role: "STUDENT" }))).toMatchObject({ success: false });
    expect(await entries("user.role_changed")).toHaveLength(0);
    as(f.other);
    expect(await banUser(form({ userId: f.author.id }))).toMatchObject({ success: false });
    expect(await entries("user.banned")).toHaveLength(0);
  });

  it("closing a discussion and deleting a reply", async () => {
    const reply = await db.discussionReply.create({ data: { content: "Une réponse à retirer.", authorId: f.author.id, discussionId: f.discussion.id } });
    as(f.admin);
    expect(await moderateContent(form({ discussionId: f.discussion.id, action: "moderate" }))).toEqual({ success: true });
    expect(await moderateContent(form({ replyId: reply.id, action: "delete" }))).toEqual({ success: true });
    expect((await entries("content.moderated")).map((e) => e.targetType)).toEqual(["discussion", "discussion_reply"]);
    expect(await reload(f.discussion.id)).toMatchObject({ status: "CLOSED", isLocked: true });
  });
});
