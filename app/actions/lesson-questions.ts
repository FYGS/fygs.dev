"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AccessService } from "@/lib/access-service";
import { slugify } from "@/lib/text/slug";
import { communityWriteBlock } from "@/app/actions/community/_rate-limit";
import { checkAndAwardBadges } from "@/app/actions/community/_badges";

const askSchema = z.object({
  lessonId: z.string().min(1).max(64),
  title: z.string().trim().min(5, "Le titre doit faire au moins 5 caractères").max(200),
  content: z.string().trim().min(20, "Détaillez votre question (20 caractères minimum)").max(10000),
});

export type AskLessonQuestionResult =
  | { success: true; discussion: { id: string; title: string } }
  | { success: false; error: string };

/**
 * A question asked from a lesson. It is a community discussion tied to the lesson and to the
 * course (so the instructor and other learners find it in the lesson and in the community),
 * filed in the course's own topic, which is created the first time.
 */
export async function askLessonQuestion(input: z.infer<typeof askSchema>): Promise<AskLessonQuestionResult> {
  const parsed = askSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Question invalide" };
  const { lessonId, title, content } = parsed.data;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "Connectez-vous pour poser une question" };
  const userId = session.user.id;

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, courseId: true, course: { select: { id: true, title: true, slug: true } } },
  });
  if (!lesson) return { success: false, error: "Leçon introuvable" };

  // Asking is for the course's learners: a free preview does not open the community
  const access = await AccessService.checkCourseAccess(userId, lesson.courseId);
  if (!access.canAccessCourse) return { success: false, error: "Inscrivez-vous à la formation pour poser une question" };

  const blocked = await communityWriteBlock(userId);
  if (blocked) return { success: false, error: "Trop de messages à la suite, réessayez dans un instant" };

  const topic = await courseTopic(lesson.course);
  const base = slugify(title, "question");
  const taken = await db.discussion.findFirst({ where: { topicId: topic.id, slug: base }, select: { id: true } });

  const discussion = await db.discussion.create({
    data: {
      title,
      slug: taken ? `${base}-${Date.now().toString(36)}` : base,
      content,
      authorId: userId,
      topicId: topic.id,
      courseId: lesson.courseId,
      lessonId: lesson.id,
      tags: ["question"],
    },
    select: { id: true, title: true },
  });

  await db.user.update({
    where: { id: userId },
    data: { communityPoints: { increment: 10 }, lastActiveAt: new Date() },
  });
  await checkAndAwardBadges(userId, "DISCUSSION_CREATED");

  revalidatePath("/community");
  revalidatePath(`/learn/${lesson.course.slug}`, "layout");
  return { success: true, discussion };
}

async function courseTopic(course: { id: string; title: string; slug: string }) {
  const existing = await db.topic.findFirst({ where: { courseId: course.id }, select: { id: true } });
  if (existing) return existing;

  const slug = `formation-${course.slug}`;
  try {
    return await db.topic.create({
      data: {
        name: `Formation : ${course.title}`,
        slug,
        description: `Questions et échanges autour de la formation « ${course.title} ».`,
        courseId: course.id,
      },
      select: { id: true },
    });
  } catch (error) {
    // Two first questions at once: the other request created the topic
    const created = await db.topic.findFirst({ where: { OR: [{ courseId: course.id }, { slug }] }, select: { id: true } });
    if (created) return created;
    throw error;
  }
}
