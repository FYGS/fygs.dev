/**
 * The questions learners ask from a lesson (community discussions tied to a lesson), seen from the back office:
 * an administrator sees every course, an instructor the courses assigned to them. Answers posted here are
 * community replies marked as coming from the team, and the learner is notified.
 */
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { AuthorUser } from "./guard";
import type { Result } from "./curriculum";

import {
  ANSWER_MAX_LENGTH,
  ANSWER_MIN_LENGTH,
  QUESTIONS_PAGE_SIZE,
  type LessonQuestion,
  type QuestionFilter,
  type QuestionPage,
} from "./lesson-questions-shared";

export { ANSWER_MAX_LENGTH, ANSWER_MIN_LENGTH, QUESTIONS_PAGE_SIZE };
export type { LessonQuestion, QuestionFilter, QuestionPage, QuestionReply } from "./lesson-questions-shared";

const fail = (error: string): { success: false; error: string } => ({ success: false, error });

/** Discussions asked from a lesson of a course the user may answer for. */
function scope(user: AuthorUser, courseId?: string): Prisma.DiscussionWhereInput {
  return {
    lessonId: { not: null },
    status: "ACTIVE",
    ...(courseId ? { courseId } : {}),
    ...(user.role === "ADMIN" ? {} : { course: { instructorId: user.id } }),
  };
}

const FILTERS: Record<QuestionFilter, Prisma.DiscussionWhereInput> = {
  todo: { isSolved: false, replies: { none: { isModerator: true } } },
  answered: { isSolved: false, replies: { some: { isModerator: true } } },
  solved: { isSolved: true },
  all: {},
};

export async function countQuestionsToAnswer(user: AuthorUser): Promise<number> {
  return db.discussion.count({ where: { ...scope(user), ...FILTERS.todo } });
}

export async function listLessonQuestions(
  user: AuthorUser,
  query: { filter?: QuestionFilter; courseId?: string; page?: number } = {},
): Promise<QuestionPage> {
  const filter = query.filter ?? "todo";
  const where = { ...scope(user, query.courseId), ...FILTERS[filter] };
  const [total, todo] = await Promise.all([db.discussion.count({ where }), countQuestionsToAnswer(user)]);
  const pages = Math.max(1, Math.ceil(total / QUESTIONS_PAGE_SIZE));
  const page = Math.min(Math.max(1, Math.floor(query.page ?? 1)), pages);

  const found = await db.discussion.findMany({
    where,
    // oldest unanswered first: the one who waits longest is answered first
    orderBy: filter === "todo" ? { createdAt: "asc" } : { lastActivityAt: "desc" },
    skip: (page - 1) * QUESTIONS_PAGE_SIZE,
    take: QUESTIONS_PAGE_SIZE,
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      isSolved: true,
      author: { select: { name: true, email: true } },
      course: { select: { id: true, title: true, slug: true } },
      lesson: { select: { title: true, slug: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        select: { id: true, content: true, createdAt: true, isModerator: true, author: { select: { name: true, email: true } } },
      },
    },
  });

  const rows: LessonQuestion[] = found
    .filter((d) => d.course && d.lesson)
    .map((d) => ({
      id: d.id,
      title: d.title,
      content: d.content,
      createdAt: d.createdAt,
      authorName: d.author.name || d.author.email,
      isSolved: d.isSolved,
      answeredByTeam: d.replies.some((r) => r.isModerator),
      course: d.course!,
      lesson: d.lesson!,
      replies: d.replies.map((r) => ({
        id: r.id,
        content: r.content,
        createdAt: r.createdAt,
        authorName: r.author.name || r.author.email,
        fromTeam: r.isModerator,
      })),
    }));
  return { rows, total, todo, page, pages };
}

/** The question when the user may answer it, else the refusal. */
async function questionFor(user: AuthorUser, discussionId: string) {
  const discussion = await db.discussion.findFirst({
    where: { id: discussionId, ...scope(user) },
    select: { id: true, title: true, authorId: true, isLocked: true, course: { select: { slug: true } } },
  });
  return discussion;
}

export async function answerLessonQuestion(
  user: AuthorUser & { name: string },
  discussionId: string,
  content: string,
  markSolved: boolean,
): Promise<Result<{ replyId: string; courseSlug: string | null }>> {
  const text = content.trim();
  if (text.length < ANSWER_MIN_LENGTH) return fail(`La réponse doit faire au moins ${ANSWER_MIN_LENGTH} caractères.`);
  if (text.length > ANSWER_MAX_LENGTH) return fail(`La réponse est trop longue (${ANSWER_MAX_LENGTH} caractères maximum).`);

  const discussion = await questionFor(user, discussionId);
  if (!discussion) return fail("Cette question n'existe plus ou ne concerne pas vos formations.");
  if (discussion.isLocked) return fail("Cette discussion est verrouillée : on ne peut plus y répondre.");

  const reply = await db.$transaction(async (tx) => {
    const created = await tx.discussionReply.create({
      data: { content: text, authorId: user.id, discussionId, isModerator: true, isAccepted: markSolved },
      select: { id: true },
    });
    await tx.discussion.update({
      where: { id: discussionId },
      data: { replyCount: { increment: 1 }, lastActivityAt: new Date(), ...(markSolved ? { isSolved: true } : {}) },
    });
    if (discussion.authorId !== user.id) {
      await tx.notification.create({
        data: {
          recipientId: discussion.authorId,
          senderId: user.id,
          type: "DISCUSSION_REPLY",
          title: "Réponse à votre question",
          message: `${user.name} a répondu à votre question « ${discussion.title} ».`,
          data: { discussionId, replyId: created.id },
        },
      });
    }
    return created;
  });
  return { success: true, replyId: reply.id, courseSlug: discussion.course?.slug ?? null };
}

export async function setQuestionSolved(
  user: AuthorUser,
  discussionId: string,
  solved: boolean,
): Promise<Result<{ courseSlug: string | null }>> {
  const discussion = await questionFor(user, discussionId);
  if (!discussion) return fail("Cette question n'existe plus ou ne concerne pas vos formations.");
  await db.discussion.update({ where: { id: discussionId }, data: { isSolved: solved } });
  return { success: true, courseSlug: discussion.course?.slug ?? null };
}
