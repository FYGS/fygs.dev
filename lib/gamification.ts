import { db } from "@/lib/db";
import { advisoryLock } from "@/lib/learning/locks";

/**
 * XP amounts per action
 */
const XP_AMOUNTS = {
  LESSON_COMPLETED: 10,
  QUIZ_PASSED: 25,
  COURSE_COMPLETED: 100,
  STREAK_BONUS: 5, // per day of streak (bonus)
  FIRST_LESSON: 20,
} as const;

type XpReason = keyof typeof XP_AMOUNTS;

const isUniqueViolation = (error: unknown) => (error as { code?: string } | null)?.code === "P2002";

/**
 * Award XP once. `refId` names what is rewarded (the lesson, quiz or course id; `first-lesson`; the streak and the
 * day for a streak bonus), and the database holds a unique key on (user, reason, refId): the second award for the same
 * target is refused by the database, not by a check that two parallel requests could both pass. Returns null when it
 * was already given, and then neither the event nor the points are added.
 */
export async function awardXp(
  userId: string,
  reason: XpReason,
  refId: string,
  metadata?: Record<string, string>,
) {
  const amount = XP_AMOUNTS[reason];
  try {
    const [xpEvent] = await db.$transaction([
      db.xpEvent.create({ data: { userId, amount, reason, refId, metadata: metadata ?? undefined } }),
      db.user.update({ where: { id: userId }, data: { communityPoints: { increment: amount } } }),
    ]);
    return xpEvent;
  } catch (error) {
    if (isUniqueViolation(error)) return null;
    throw error;
  }
}

/** Day of an instant as the learner's streak counts it (calendar day of the server's zone). */
const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

/**
 * Update user streak — call on every learning activity. At most one change per user and day: the read and the write
 * run under a lock per user, so two parallel calls cannot both extend the streak, and the 7-day bonus is keyed by the
 * streak and the day so it cannot be paid twice.
 */
export async function updateStreak(userId: string) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86_400_000);

  const result = await db.$transaction(async (tx) => {
    await advisoryLock(tx, `streak:${userId}`);
    const existing = await tx.userStreak.findUnique({ where: { userId } });

    if (!existing) {
      // First activity ever
      await tx.userStreak.create({
        data: { userId, currentStreak: 1, longestStreak: 1, lastActivityAt: now },
      });
      return { currentStreak: 1, isNewDay: true, bonusAt: null as number | null };
    }

    const lastActivity = new Date(existing.lastActivityAt);
    const lastActivityDay = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());

    // Already active today
    if (lastActivityDay.getTime() >= todayStart.getTime()) {
      return { currentStreak: existing.currentStreak, isNewDay: false, bonusAt: null as number | null };
    }

    // Active yesterday — extend streak
    if (lastActivityDay.getTime() >= yesterdayStart.getTime()) {
      const newStreak = existing.currentStreak + 1;
      await tx.userStreak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, existing.longestStreak),
          lastActivityAt: now,
        },
      });
      // Streak bonus XP every 7 days
      return { currentStreak: newStreak, isNewDay: true, bonusAt: newStreak % 7 === 0 ? newStreak : null };
    }

    // Streak broken — reset to 1
    await tx.userStreak.update({ where: { userId }, data: { currentStreak: 1, lastActivityAt: now } });
    return { currentStreak: 1, isNewDay: true, bonusAt: null as number | null };
  });

  if (result.bonusAt !== null) {
    await awardXp(userId, "STREAK_BONUS", `streak-${result.bonusAt}-${dayKey(now)}`, { streak: String(result.bonusAt) });
  }
  return { currentStreak: result.currentStreak, isNewDay: result.isNewDay };
}
