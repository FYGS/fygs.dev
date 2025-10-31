'use server';

import { auth } from '@/lib/auth';
import { AccessService } from '@/lib/access-service';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { generateSampleQuizzes } from '@/lib/loaders/visual-supports-loader';

export async function getQuizzes(courseSlug: string) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error('Authentication required');
    }

    // Get course ID from slug
    const course = await db.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true, title: true }
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // Check if user has access to the course
    const userAccess = await AccessService.checkCourseAccess(userId, course.id);
    if (!userAccess.canAccessCourse) {
      throw new Error('Access denied');
    }

    // Fetch quizzes for the course with their questions
    const quizzes = await db.quiz.findMany({
      where: { courseId: course.id },
      include: {
        questions: {
          orderBy: { order: "asc" }
        }
      },
      orderBy: { moduleId: "asc" },
    });

    // If no quizzes exist, generate sample data
    if (quizzes.length === 0) {
      return generateSampleQuizzes(course.title, courseSlug);
    }

    return quizzes;
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw error;
  }
}