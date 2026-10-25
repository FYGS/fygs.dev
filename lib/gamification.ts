import { db } from "@/lib/db";

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

/**
 * Award XP to a user and update streak
 */
export async function awardXp(
  userId: string,
  reason: XpReason,
  metadata?: Record<string, string>,
) {
  const amount = XP_AMOUNTS[reason];

  const [xpEvent] = await Promise.all([
    db.xpEvent.create({
      data: {
        userId,
        amount,
        reason,
        metadata: metadata ?? undefined,
      },
    }),
    db.user.update({
      where: { id: userId },
      data: { communityPoints: { increment: amount } },
    }),
  ]);

  return xpEvent;
}

/**
 * Update user streak — call on every learning activity
 */
export async function updateStreak(userId: string) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86_400_000);

  const existing = await db.userStreak.findUnique({
    where: { userId },
  });

  if (!existing) {
    // First activity ever
    await db.userStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityAt: now,
      },
    });
    return { currentStreak: 1, isNewDay: true };
  }

  const lastActivity = new Date(existing.lastActivityAt);
  const lastActivityDay = new Date(
    lastActivity.getFullYear(),
    lastActivity.getMonth(),
    lastActivity.getDate(),
  );

  // Already active today
  if (lastActivityDay.getTime() >= todayStart.getTime()) {
    return { currentStreak: existing.currentStreak, isNewDay: false };
  }

  // Active yesterday — extend streak
  if (lastActivityDay.getTime() >= yesterdayStart.getTime()) {
    const newStreak = existing.currentStreak + 1;
    const longestStreak = Math.max(newStreak, existing.longestStreak);

    await db.userStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak,
        lastActivityAt: now,
      },
    });

    // Streak bonus XP every 7 days
    if (newStreak % 7 === 0) {
      await awardXp(userId, "STREAK_BONUS", { streak: String(newStreak) });
    }

    return { currentStreak: newStreak, isNewDay: true };
  }

  // Streak broken — reset to 1
  await db.userStreak.update({
    where: { userId },
    data: {
      currentStreak: 1,
      lastActivityAt: now,
    },
  });

  return { currentStreak: 1, isNewDay: true };
}
