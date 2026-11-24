/**
 * Row factories for DB-backed tests. Each helper creates the minimum valid row
 * and lets the caller override anything. Emails/slugs are unique per call.
 */
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import {
  CourseAccessTier,
  CourseCategory,
  CourseLevel,
  Role,
  SubscriptionStatus,
} from "@/lib/generated/prisma/client";
import type { Prisma } from "@/lib/generated/prisma/client";

const uid = () => randomUUID().slice(0, 8);

export function createUser(data: Partial<Prisma.UserUncheckedCreateInput> = {}) {
  const id = uid();
  return db.user.create({
    data: {
      name: `User ${id}`,
      email: `user-${id}@example.test`,
      emailVerified: true,
      role: Role.STUDENT,
      ...data,
    },
  });
}

export function createCourse(data: Partial<Prisma.CourseUncheckedCreateInput> = {}) {
  const id = uid();
  return db.course.create({
    data: {
      title: `Course ${id}`,
      slug: `course-${id}`,
      description: "Course used by an integration test",
      category: CourseCategory.JAVASCRIPT,
      level: CourseLevel.BEGINNER,
      published: true,
      accessTier: CourseAccessTier.FREE,
      ...data,
    },
  });
}

export function enroll(userId: string, courseId: string) {
  return db.enrollment.create({ data: { userId, courseId } });
}

export function createSubscription(
  userId: string,
  data: Partial<Prisma.SubscriptionUncheckedCreateInput> = {},
) {
  return db.subscription.create({
    data: {
      userId,
      status: SubscriptionStatus.ACTIVE,
      stripeCustomerId: `cus_${uid()}`,
      stripeSubscriptionId: `sub_${uid()}`,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      ...data,
    },
  });
}

/** A quiz with `correct.length` questions of four options; `correct[i]` is the right index. */
export async function createQuiz(courseId: string, correct: number[]) {
  const courseModule =
    (await db.module.findFirst({ where: { courseId }, orderBy: { order: "asc" } })) ??
    (await db.module.create({ data: { courseId, title: "Module 1", slug: "module-1", order: 1 } }));
  const quiz = await db.quiz.create({
    data: {
      courseId,
      moduleId: courseModule.id,
      title: "Quiz",
      questions: {
        create: correct.map((c, order) => ({
          question: `Question ${order}`,
          options: ["A", "B", "C", "D"],
          correct: c,
          explanation: `Because ${c}`,
          order,
        })),
      },
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  return quiz;
}

/** Makes `getSession` of the mocked `@/lib/auth` return this user (or nobody). */
export function sessionFor(userId: string | null) {
  return userId ? { user: { id: userId } } : null;
}
