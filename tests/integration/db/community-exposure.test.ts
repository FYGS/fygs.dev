import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { PRIVATE_USER_KEYS } from "@/lib/services/community/public-user";
import { CommunityService } from "@/lib/services/community-service";
import { resetDatabase } from "../../support/test-db";
import { createCourse, createUser, enroll } from "../../support/factories";

const h = vi.hoisted(() => ({ session: null as { user: { id: string; role: string } } | null }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn(async () => h.session) } } }));
vi.mock("@/lib/redis", () => ({ default: { eval: vi.fn(async () => { throw new Error("redis down"); }) } }));

import { getAvailableMentors } from "@/app/actions/community/mentors";
import { getUserFollowers, getUserFollowing } from "@/app/actions/community/follows";

/** Keys that must never be found anywhere in what the community pages receive (e-mail, ban, billing, 2FA, secrets). */
const FORBIDDEN = new Set<string>([...PRIVATE_USER_KEYS, "stripeCustomerId", "password"]);

function privateKeysIn(value: unknown, path = "$", found: string[] = []): string[] {
  if (value === null || typeof value !== "object") return found;
  if (value instanceof Date) return found;
  if (Array.isArray(value)) {
    value.forEach((item, index) => privateKeysIn(item, `${path}[${index}]`, found));
    return found;
  }
  for (const [key, child] of Object.entries(value)) {
    // `updatedAt` of a discussion or a reply is public content metadata; only a USER's own timestamps are private,
    // and a user object is recognised by its `communityLevel`
    const isUserObject = "communityLevel" in (value as object);
    if (FORBIDDEN.has(key) && (key !== "updatedAt" || isUserObject)) found.push(`${path}.${key}`);
    privateKeysIn(child, `${path}.${key}`, found);
  }
  return found;
}

let ids: { author: string; mentor: string; reader: string; discussion: string; topic: string; topicSlug: string; slug: string };

beforeAll(async () => {
  await resetDatabase(db);
  const author = await createUser({
    name: "Auteur",
    email: "auteur-prive@example.test",
    bio: "Bio publique",
    githubUrl: "https://github.com/auteur",
    communityPoints: 120,
    communityLevel: 3,
    lastActiveAt: new Date(),
  });
  const mentor = await createUser({
    name: "Formateur",
    email: "formateur-prive@example.test",
    role: "INSTRUCTOR",
    lastActiveAt: new Date(),
    communityPoints: 500,
  });
  const reader = await createUser({ name: "Lecteur", email: "lecteur-prive@example.test" });
  const course = await createCourse({ instructorId: mentor.id });
  await enroll(reader.id, course.id);
  const topic = await db.topic.create({ data: { name: "General", slug: "general", description: "General topic" } });
  const discussion = await db.discussion.create({
    data: { title: "Une question utile", slug: "une-question-utile", content: "x".repeat(30), authorId: author.id, topicId: topic.id, courseId: course.id },
  });
  await db.discussionReply.create({ data: { content: "Une réponse détaillée.", authorId: mentor.id, discussionId: discussion.id } });
  await db.discussionVote.create({ data: { userId: reader.id, discussionId: discussion.id, voteType: "UPVOTE" } });
  await db.discussionBookmark.create({ data: { userId: reader.id, discussionId: discussion.id } });
  const badge = await db.badge.create({
    data: { name: "Premier message", description: "Premier message posté", icon: "star", type: "PARTICIPATION", condition: "{}" },
  });
  await db.userBadge.create({ data: { userId: author.id, badgeId: badge.id } });
  await db.userFollow.create({ data: { followerId: reader.id, followingId: author.id } });
  ids = { author: author.id, mentor: mentor.id, reader: reader.id, discussion: discussion.id, topic: topic.id, topicSlug: topic.slug, slug: discussion.slug };
});
afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

describe("what the community pages receive never carries private user fields", () => {
  it("the profile page of a member (the anonymous e-mail harvesting finding)", async () => {
    const profile = await CommunityService.getUserProfile(ids.author);
    expect(profile).not.toBeNull();
    expect(profile!.user.name).toBe("Auteur");
    expect(profile!.user.bio).toBe("Bio publique");
    expect(profile!.user.githubUrl).toBe("https://github.com/auteur");
    expect(privateKeysIn(profile)).toEqual([]);
    expect(JSON.stringify(profile)).not.toContain("auteur-prive@example.test");
  });

  it("mentors, contributors and recommendations", async () => {
    const mentors = await CommunityService.getAvailableMentors();
    expect(mentors.map((m) => m.id)).toContain(ids.mentor);
    expect(privateKeysIn(mentors)).toEqual([]);

    const stats = await CommunityService.getCommunityStats();
    expect(stats.topContributors.length).toBeGreaterThan(0);
    expect(privateKeysIn(stats)).toEqual([]);

    const recommendations = await CommunityService.getRecommendations(ids.reader);
    expect(privateKeysIn(recommendations)).toEqual([]);
  });

  it("discussion lists, detail, replies, search, trending, bookmarks", async () => {
    const list = await CommunityService.getDiscussions({ page: 1, limit: 20, sort: "latest" }, ids.reader);
    expect(list.discussions.length).toBe(1);
    expect(privateKeysIn(list)).toEqual([]);

    const detail = await CommunityService.getDiscussionById(ids.discussion, { userId: ids.reader, includeReplies: true });
    expect(detail).not.toBeNull();
    expect(privateKeysIn(detail)).toEqual([]);

    const replies = await CommunityService.getReplies(ids.discussion, ids.reader);
    expect(replies.length).toBe(1);
    expect(privateKeysIn(replies)).toEqual([]);

    expect(privateKeysIn(await CommunityService.searchDiscussions("question", {}, ids.reader))).toEqual([]);
    expect(privateKeysIn(await CommunityService.getTrendingDiscussions(10, ids.reader))).toEqual([]);
    expect(privateKeysIn(await CommunityService.getUserReplies(ids.mentor))).toEqual([]);
    expect(privateKeysIn(await CommunityService.getUserBookmarks(ids.reader))).toEqual([]);
  });

  it("the server actions that list members", async () => {
    h.session = { user: { id: ids.reader, role: "STUDENT" } };
    const mentors = await getAvailableMentors();
    expect(mentors.success).toBe(true);
    expect(privateKeysIn(mentors)).toEqual([]);

    const followers = await getUserFollowers(ids.author);
    expect(followers.success).toBe(true);
    expect(privateKeysIn(followers)).toEqual([]);
    expect(privateKeysIn(await getUserFollowing(ids.reader))).toEqual([]);
  });

  it("the detector itself finds a private key (so an empty result means something)", () => {
    expect(privateKeysIn({ user: { id: "1", communityLevel: 1, email: "a@b.c" } })).toEqual(["$.user.email"]);
    expect(privateKeysIn([{ a: { isBanned: false } }])).toEqual(["$[0].a.isBanned"]);
  });
});
