import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { updateLessonProgress as realUpdateLessonProgress } from "@/app/[locale]/(main)/dashboard/actions/updateLessonProgress";

/**
 * Tests that complete lessons through the real action (`updateLessonProgress`) go through the engagement rules of
 * lib/learning/engagement.ts: time spent on the lesson, a pause between two completions. This prepares a lesson as if
 * the learner had spent the time (watch time recorded) and had finished their previous lesson a while ago, so the test
 * is about what it wants to check and not about waiting. A test of the engagement rules themselves must NOT use it.
 */
export async function primeLessonForCompletion(userId: string, lessonId: string, watchTime: number | null = 100_000): Promise<void> {
  // `null`: the test sends the time itself (watchTimeDelta) and only the pace between completions is arranged
  if (watchTime !== null) {
    await db.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, completed: false, watchTime },
      update: { watchTime },
    });
  }
  // Earlier completions of this learner are moved back in time (a raw statement: it leaves updatedAt alone)
  await db.$executeRaw`UPDATE "Progress" SET "completedAt" = "completedAt" - interval '10 minutes'
    WHERE "userId" = ${userId} AND "completed" = true AND "completedAt" IS NOT NULL`;
}

/**
 * `updateLessonProgress` for tests that complete lessons as a means, not as the subject: when the call completes a
 * lesson, the lesson is first prepared with `primeLessonForCompletion` for the user of the mocked session. Everything
 * else (validation, access, rewards, certificates) is the real action.
 */
export async function updateLessonProgress(input: Parameters<typeof realUpdateLessonProgress>[0]) {
  if (input.completed) {
    const session = await auth.api.getSession({ headers: new Headers() });
    if (session?.user?.id && typeof input.lessonId === "string") {
      await primeLessonForCompletion(session.user.id, input.lessonId, typeof input.watchTimeDelta === "number" ? null : 100_000);
    }
  }
  return realUpdateLessonProgress(input);
}

/**
 * Moves the last report of a lesson back in time. Time spent is credited no faster than the clock runs since the previous
 * report (lib/learning/engagement.ts): a test that adds up several reports lets the time pass this way instead of sleeping.
 */
export async function ageProgress(userId: string, lessonId: string, seconds: number): Promise<void> {
  await db.$executeRaw`UPDATE "Progress" SET "updatedAt" = "updatedAt" - make_interval(secs => ${seconds})
    WHERE "userId" = ${userId} AND "lessonId" = ${lessonId}`;
}
