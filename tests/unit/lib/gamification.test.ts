import { describe, it, expect, vi, beforeEach } from "vitest";
import { awardXp, updateStreak } from "@/lib/gamification";

const m = vi.hoisted(() => ({
  xpCreate: vi.fn(),
  userUpdate: vi.fn(),
  streakFind: vi.fn(),
  streakCreate: vi.fn(),
  streakUpdate: vi.fn(),
  executeRaw: vi.fn(),
}));

vi.mock("@/lib/db", () => {
  const tx = {
    $executeRaw: m.executeRaw,
    userStreak: { findUnique: m.streakFind, create: m.streakCreate, update: m.streakUpdate },
  };
  return {
    db: {
      xpEvent: { create: m.xpCreate },
      user: { update: m.userUpdate },
      // the array form groups the XP event with the points, the function form is a transaction with a lock
      $transaction: (arg: Promise<unknown>[] | ((client: unknown) => Promise<unknown>)) =>
        typeof arg === "function" ? arg(tx) : Promise.all(arg),
    },
  };
});

const uniqueViolation = Object.assign(new Error("Unique constraint failed"), { code: "P2002" });

beforeEach(() => {
  vi.clearAllMocks();
  m.xpCreate.mockImplementation(async ({ data }: { data: { amount: number; reason: string } }) => ({ id: "xp", ...data }));
  m.userUpdate.mockResolvedValue({});
  m.streakCreate.mockResolvedValue({});
  m.streakUpdate.mockResolvedValue({});
});

describe("awardXp", () => {
  it("creates the XP event for its target and adds the points", async () => {
    const result = await awardXp("user-1", "LESSON_COMPLETED", "lesson-1", { lessonId: "l1" });

    expect(m.xpCreate).toHaveBeenCalledWith({
      data: { userId: "user-1", amount: 10, reason: "LESSON_COMPLETED", refId: "lesson-1", metadata: { lessonId: "l1" } },
    });
    expect(m.userUpdate).toHaveBeenCalledWith({ where: { id: "user-1" }, data: { communityPoints: { increment: 10 } } });
    expect(result?.amount).toBe(10);
  });

  it("awards the amount of each reason", async () => {
    expect((await awardXp("user-1", "QUIZ_PASSED", "q1"))?.amount).toBe(25);
    expect((await awardXp("user-1", "COURSE_COMPLETED", "c1"))?.amount).toBe(100);
    expect((await awardXp("user-1", "FIRST_LESSON", "first-lesson"))?.amount).toBe(20);
  });

  it("gives nothing the second time for the same target: the database refuses it", async () => {
    m.xpCreate.mockRejectedValueOnce(uniqueViolation);

    expect(await awardXp("user-1", "LESSON_COMPLETED", "lesson-1")).toBeNull();
  });

  it("does not hide other failures", async () => {
    m.xpCreate.mockRejectedValueOnce(new Error("connection lost"));

    await expect(awardXp("user-1", "LESSON_COMPLETED", "lesson-1")).rejects.toThrow("connection lost");
  });
});

describe("updateStreak", () => {
  it("works under a lock per user", async () => {
    m.streakFind.mockResolvedValueOnce(null);

    await updateStreak("user-1");

    expect(m.executeRaw).toHaveBeenCalledTimes(1);
  });

  it("creates a new streak for first activity", async () => {
    m.streakFind.mockResolvedValueOnce(null);

    const result = await updateStreak("user-1");

    expect(m.streakCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user-1", currentStreak: 1, longestStreak: 1 }) }),
    );
    expect(result).toEqual({ currentStreak: 1, isNewDay: true });
  });

  it("returns the same streak if already active today", async () => {
    m.streakFind.mockResolvedValueOnce({ currentStreak: 5, longestStreak: 10, lastActivityAt: new Date() });

    const result = await updateStreak("user-1");

    expect(result).toEqual({ currentStreak: 5, isNewDay: false });
    expect(m.streakUpdate).not.toHaveBeenCalled();
  });

  it("extends the streak if the last activity was yesterday", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    m.streakFind.mockResolvedValueOnce({ currentStreak: 3, longestStreak: 5, lastActivityAt: yesterday });

    const result = await updateStreak("user-1");

    expect(result).toEqual({ currentStreak: 4, isNewDay: true });
    expect(m.streakUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ currentStreak: 4, longestStreak: 5 }) }),
    );
    expect(m.xpCreate).not.toHaveBeenCalled(); // no bonus at 4 days
  });

  it("pays the 7-day bonus once, keyed by the streak and the day", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    m.streakFind.mockResolvedValueOnce({ currentStreak: 6, longestStreak: 6, lastActivityAt: yesterday });

    await updateStreak("user-1");

    expect(m.xpCreate).toHaveBeenCalledTimes(1);
    const data = m.xpCreate.mock.calls[0][0].data;
    expect(data).toMatchObject({ reason: "STREAK_BONUS", amount: 5 });
    expect(data.refId).toMatch(/^streak-7-\d{4}-\d{1,2}-\d{1,2}$/);
  });

  it("resets the streak if the gap is more than one day", async () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    m.streakFind.mockResolvedValueOnce({ currentStreak: 10, longestStreak: 10, lastActivityAt: threeDaysAgo });

    const result = await updateStreak("user-1");

    expect(result).toEqual({ currentStreak: 1, isNewDay: true });
  });
});
