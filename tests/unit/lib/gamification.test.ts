import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  awardXp,
  updateStreak,
} from "@/lib/gamification";

// Mock Prisma
vi.mock("@/lib/db", () => ({
  db: {
    xpEvent: {
      create: vi
        .fn()
        .mockResolvedValue({
          id: "xp1",
          amount: 10,
          reason: "LESSON_COMPLETED",
        }),
      aggregate: vi.fn().mockResolvedValue({ _sum: { amount: 45 } }),
    },
    user: {
      findUnique: vi
        .fn()
        .mockResolvedValue({ communityPoints: 250, communityLevel: 3 }),
      update: vi.fn().mockResolvedValue({}),
    },
    userStreak: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const { db } = await import("@/lib/db");

describe("Gamification Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("awardXp", () => {
    it("creates XP event and updates user points", async () => {
      const result = await awardXp("user-1", "LESSON_COMPLETED", {
        lessonId: "l1",
      });

      expect(db.xpEvent.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          amount: 10,
          reason: "LESSON_COMPLETED",
          metadata: { lessonId: "l1" },
        },
      });
      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { communityPoints: { increment: 10 } },
      });
      expect(result.amount).toBe(10);
    });

    it("awards correct XP for quiz passed", async () => {
      vi.mocked(db.xpEvent.create).mockResolvedValueOnce({
        id: "xp2",
        amount: 25,
        reason: "QUIZ_PASSED",
      } as never);

      await awardXp("user-1", "QUIZ_PASSED", { quizId: "q1" });

      expect(db.xpEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ amount: 25, reason: "QUIZ_PASSED" }),
        }),
      );
    });

    it("awards correct XP for course completed", async () => {
      vi.mocked(db.xpEvent.create).mockResolvedValueOnce({
        id: "xp3",
        amount: 100,
        reason: "COURSE_COMPLETED",
      } as never);

      await awardXp("user-1", "COURSE_COMPLETED", { courseId: "c1" });

      expect(db.xpEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ amount: 100 }),
        }),
      );
    });
  });

  describe("updateStreak", () => {
    it("creates a new streak for first activity", async () => {
      vi.mocked(db.userStreak.findUnique).mockResolvedValueOnce(null);
      vi.mocked(db.userStreak.create).mockResolvedValueOnce({} as never);

      const result = await updateStreak("user-1");

      expect(db.userStreak.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-1",
            currentStreak: 1,
            longestStreak: 1,
          }),
        }),
      );
      expect(result.currentStreak).toBe(1);
      expect(result.isNewDay).toBe(true);
    });

    it("returns same streak if already active today", async () => {
      vi.mocked(db.userStreak.findUnique).mockResolvedValueOnce({
        currentStreak: 5,
        longestStreak: 10,
        lastActivityAt: new Date(), // today
      } as never);

      const result = await updateStreak("user-1");

      expect(result.currentStreak).toBe(5);
      expect(result.isNewDay).toBe(false);
      expect(db.userStreak.update).not.toHaveBeenCalled();
    });

    it("extends streak if last activity was yesterday", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      vi.mocked(db.userStreak.findUnique).mockResolvedValueOnce({
        currentStreak: 3,
        longestStreak: 5,
        lastActivityAt: yesterday,
      } as never);
      vi.mocked(db.userStreak.update).mockResolvedValueOnce({} as never);

      const result = await updateStreak("user-1");

      expect(result.currentStreak).toBe(4);
      expect(result.isNewDay).toBe(true);
      expect(db.userStreak.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            currentStreak: 4,
            longestStreak: 5,
          }),
        }),
      );
    });

    it("resets streak if gap is more than 1 day", async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      vi.mocked(db.userStreak.findUnique).mockResolvedValueOnce({
        currentStreak: 10,
        longestStreak: 10,
        lastActivityAt: threeDaysAgo,
      } as never);
      vi.mocked(db.userStreak.update).mockResolvedValueOnce({} as never);

      const result = await updateStreak("user-1");

      expect(result.currentStreak).toBe(1);
      expect(result.isNewDay).toBe(true);
    });
  });
});
