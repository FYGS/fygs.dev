import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { __resetRateLimitMemory } from "@/lib/rate-limit";
import { resetDatabase } from "../../support/test-db";
import { createUser, sessionFor } from "../../support/factories";

const h = vi.hoisted(() => ({ session: null as { user: { id: string; role: string } } | null }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn(async () => h.session) } } }));
// Redis is unreachable here: the limiter must keep enforcing with its in-process
// fallback (it never fails open), which is exactly what is exercised below.
vi.mock("@/lib/redis", () => ({
  default: { eval: vi.fn(async () => { throw new Error("redis down"); }) },
}));

import { createDiscussion } from "@/app/actions/community/discussions";
import { createReply } from "@/app/actions/community/replies";
import { vote } from "@/app/actions/community/votes";

const LIMIT = 30; // app/actions/community/_rate-limit.ts

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

async function topic() {
  return db.topic.create({ data: { name: "General", slug: "general", description: "General topic" } });
}

const discussionForm = (topicId: string, n: number) =>
  form({ title: `Discussion number ${n}`, content: "A sufficiently long body for the discussion.", topicId });

beforeEach(async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  __resetRateLimitMemory();
  h.session = null;
  await resetDatabase(db);
});
afterAll(async () => {
  await resetDatabase(db); // leave an empty database for the suites that run next
  await db.$disconnect();
});

describe("community write limits (real database, real limiter, Redis down)", () => {
  it("needs a session", async () => {
    const t = await topic();
    expect(await createDiscussion(discussionForm(t.id, 1))).toMatchObject({
      success: false,
      error: "Authentication required",
    });
    expect(await db.discussion.count()).toBe(0);
  });

  it(`lets a user write ${LIMIT} times a minute, then refuses and stores nothing more`, async () => {
    const user = await createUser();
    const t = await topic();
    h.session = { ...sessionFor(user.id)!, user: { id: user.id, role: "STUDENT" } };

    for (let i = 0; i < LIMIT; i++) {
      const result = await createDiscussion(discussionForm(t.id, i));
      expect(result.success, `write #${i + 1}`).toBe(true);
    }
    expect(await db.discussion.count({ where: { authorId: user.id } })).toBe(LIMIT);

    const refused = await createDiscussion(discussionForm(t.id, 99));
    expect(refused).toEqual({ success: false, error: "Too many requests" });
    expect(await db.discussion.count({ where: { authorId: user.id } })).toBe(LIMIT);
    // points were only granted for the writes that happened
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).communityPoints).toBeGreaterThanOrEqual(LIMIT * 10);
  }, 120_000);

  it("shares one budget across discussions, replies and votes, per user", async () => {
    const user = await createUser();
    const other = await createUser();
    const t = await topic();
    h.session = { user: { id: user.id, role: "STUDENT" } };

    const created = await createDiscussion(discussionForm(t.id, 0));
    expect(created.success).toBe(true);
    const discussionId = created.discussion!.id;

    // the first write above counted: LIMIT - 1 left, spend them on replies
    for (let i = 1; i < LIMIT; i++) {
      const reply = await createReply(form({ content: `Reply number ${i} to the topic`, discussionId }));
      expect(reply.success, `reply #${i}`).toBe(true);
    }
    expect(await createReply(form({ content: "One reply too many here", discussionId })))
      .toEqual({ success: false, error: "Too many requests" });
    expect(await vote(form({ voteType: "UPVOTE", targetId: discussionId, targetType: "discussion" })))
      .toEqual({ success: false, error: "Too many requests" });
    expect(await db.discussionVote.count()).toBe(0);

    // another user has an untouched budget
    h.session = { user: { id: other.id, role: "STUDENT" } };
    const ok = await vote(form({ voteType: "UPVOTE", targetId: discussionId, targetType: "discussion" }));
    expect(ok.success).toBe(true);
    expect(await db.discussionVote.count({ where: { userId: other.id } })).toBe(1);
  }, 120_000);
});
