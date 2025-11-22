"use server";

import { db } from "@/lib/db";
import { logger } from "@/lib/structured-logger";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Create a new quiz for a course module
 */
export async function createQuiz(
  courseId: string,
  data: {
    moduleId: number;
    title: string;
    questions: Array<{
      question: string;
      options: string[];
      correct: number;
      explanation: string | null;
      order?: number;
    }>;
  }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Non authentifié" };
    }

    // Check if user has permission to edit this course
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (!course) {
      return { success: false, error: "Formation non trouvée" };
    }

    // Only instructor or admin can create quizzes
    if (
      session.user.role !== "ADMIN" &&
      session.user.id !== course.instructorId
    ) {
      return { success: false, error: "Permission refusée" };
    }

    // Auto-number questions if order not provided
    const questionsWithOrder = data.questions.map((q, index) => ({
      question: q.question,
      options: q.options,
      correct: q.correct,
      explanation: q.explanation,
      order: q.order ?? index + 1,
    }));

    // Create the quiz
    const quiz = await db.quiz.create({
      data: {
        courseId,
        moduleId: data.moduleId,
        title: data.title,
        questions: {
          create: questionsWithOrder,
        },
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    // Get course slug for revalidation
    const courseSlug = await db.course.findUnique({
      where: { id: courseId },
      select: { slug: true },
    });

    // Revalidate all relevant paths
    revalidatePath(`/admin/courses/${courseId}`);
    if (courseSlug?.slug) {
      revalidatePath(`/formations/${courseSlug.slug}`);
      revalidatePath(`/formations/${courseSlug.slug}/details`);
    }
    revalidatePath("/formations");
    revalidatePath("/sitemap.xml");

    // Create analytics event
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "QUIZ_CREATED",
        source: "admin",
        properties: {
          courseId,
          quizId: quiz.id,
          moduleId: data.moduleId,
          title: data.title,
          questionCount: data.questions.length,
        },
      },
    });

    return { success: true, quiz };
  } catch (error) {
    logger.error("Error creating quiz", {
      metadata: {
        courseId,
        moduleId: data.moduleId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return { success: false, error: "Erreur lors de la création du quiz" };
  }
}

/**
 * Update an existing quiz
 */
export async function updateQuiz(
  quizId: string,
  data: {
    title?: string;
    order?: number;
    questions?: Array<{
      id?: string;
      question: string;
      options: string[];
      correct: number;
      explanation: string | null;
      order: number;
    }>;
  }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Non authentifié" };
    }

    // Get the quiz with course info
    const existingQuiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: { course: { select: { instructorId: true } } },
    });

    if (!existingQuiz) {
      return { success: false, error: "Quiz non trouvé" };
    }

    // Only instructor or admin can update quizzes
    if (
      session.user.role !== "ADMIN" &&
      session.user.id !== existingQuiz.course.instructorId
    ) {
      return { success: false, error: "Permission refusée" };
    }

    // // Generate new slug if title is updated
    // let slug = undefined;
    // if (data.title) {
    //   slug = data.title
    //     .toLowerCase()
    //     .replace(/[^a-z0-9\s-]/g, '')
    //     .replace(/\s+/g, '-')
    //     .replace(/-+/g, '-')
    //     .trim();
    // }

    // Update the quiz
    const updatedQuiz = await db.quiz.update({
      where: { id: quizId },
      data: {
        title: data.title,
        questions: data.questions
          ? {
              upsert: data.questions.map((q) => ({
                where: { id: q.id || "" },
                create: {
                  question: q.question,
                  options: q.options,
                  correct: q.correct,
                  explanation: q.explanation,
                  order: q.order,
                },
                update: {
                  question: q.question,
                  options: q.options,
                  correct: q.correct,
                  explanation: q.explanation,
                  order: q.order,
                },
              })),
            }
          : undefined,
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    // Get course slug for revalidation
    const courseSlug = await db.course.findUnique({
      where: { id: existingQuiz.courseId },
      select: { slug: true },
    });

    // Revalidate all relevant paths
    revalidatePath(`/admin/courses/${existingQuiz.courseId}`);
    if (courseSlug?.slug) {
      revalidatePath(`/formations/${courseSlug.slug}`);
      revalidatePath(`/formations/${courseSlug.slug}/details`);
    }
    revalidatePath("/formations");

    // Create analytics event
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "QUIZ_UPDATED",
        source: "admin",
        properties: {
          courseId: existingQuiz.courseId,
          quizId,
          changes: {
            title: data.title,
            questionsUpdated: data.questions?.length,
          },
        },
      },
    });

    return { success: true, quiz: updatedQuiz };
  } catch (error) {
    logger.error("Error updating quiz", {
      metadata: {
        quizId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return { success: false, error: "Erreur lors de la mise à jour du quiz" };
  }
}

/**
 * Delete a quiz
 */
export async function deleteQuiz(quizId: string) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Non authentifié" };
    }

    // Get the quiz with course info
    const existingQuiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: { course: { select: { instructorId: true } } },
    });

    if (!existingQuiz) {
      return { success: false, error: "Quiz non trouvé" };
    }

    // Only instructor or admin can delete quizzes
    if (
      session.user.role !== "ADMIN" &&
      session.user.id !== existingQuiz.course.instructorId
    ) {
      return { success: false, error: "Permission refusée" };
    }

    // Delete the quiz (this will cascade to questions)
    await db.quiz.delete({
      where: { id: quizId },
    });

    // Get course slug for revalidation
    const courseSlug = await db.course.findUnique({
      where: { id: existingQuiz.courseId },
      select: { slug: true },
    });

    // Revalidate all relevant paths
    revalidatePath(`/admin/courses/${existingQuiz.courseId}`);
    if (courseSlug?.slug) {
      revalidatePath(`/formations/${courseSlug.slug}`);
      revalidatePath(`/formations/${courseSlug.slug}/details`);
    }
    revalidatePath("/formations");

    // Create analytics event
    await db.analyticsEvent.create({
      data: {
        userId: session.user.id,
        type: "QUIZ_DELETED",
        source: "admin",
        properties: {
          courseId: existingQuiz.courseId,
          quizId,
          moduleId: existingQuiz.moduleId,
        },
      },
    });

    return { success: true };
  } catch (error) {
    logger.error("Error deleting quiz", {
      metadata: {
        quizId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return { success: false, error: "Erreur lors de la suppression du quiz" };
  }
}

// /**
//  * Reorder quizzes within a course
//  */
// export async function reorderQuizzes(courseId: string, quizOrders: { id: string; order: number }[]) {
//   try {
//     // Check authentication
//     const session = await auth.api.getSession({
//       headers: await headers(),
//     });

//     if (!session?.user) {
//       return { success: false, error: "Non authentifié" };
//     }

//     // Check if user has permission to edit this course
//     const course = await db.course.findUnique({
//       where: { id: courseId },
//       select: { instructorId: true }
//     });

//     if (!course) {
//       return { success: false, error: "Formation non trouvée" };
//     }

//     // Only instructor or admin can reorder quizzes
//     if (session.user.role !== "ADMIN" && session.user.id !== course.instructorId) {
//       return { success: false, error: "Permission refusée" };
//     }

//     // Update the order of each quiz
//     await Promise.all(
//       quizOrders.map(({ id, order }) =>
//         db.quiz.update({
//           where: { id },
//           data: { order }
//         })
//       )
//     );

//     return { success: true };
//   } catch (error) {
//     logger.error("Error reordering quizzes", {
//       metadata: {
//         courseId,
//         error: error instanceof Error ? error.message : String(error)
//       }
//     });
//     return { success: false, error: "Erreur lors du réordonnancement des quizzes" };
//   }
// }
