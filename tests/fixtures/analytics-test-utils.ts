import { db } from "@/lib/db";

export interface TestData {
  user: any;
  course: any;
  lessons: any[];
}

export async function createAnalyticsTestData(): Promise<TestData> {
  // Create test user
  const user = await db.user.create({
    data: {
      id: "test-analytics-user",
      email: "analytics-test@example.com",
      name: "Analytics Test User",
      emailVerified: true,
    },
  });

  // Create test course
  const course = await db.course.create({
    data: {
      id: "analytics-test-course",
      title: "Analytics Test Course",
      slug: "analytics-test-course",
      description: "Course for testing analytics integration",
      category: "JAVASCRIPT",
      level: "BEGINNER",
      accessTier: "FREE",
      published: true,
    },
  });

  // Create test lessons
  const lessons = await Promise.all([
    db.lesson.create({
      data: {
        id: "analytics-test-lesson-1",
        title: "Analytics Test Lesson 1",
        slug: "analytics-test-lesson-1",
        order: 1,
        courseId: course.id,
        published: true,
        content: "Test lesson content 1",
      },
    }),
    db.lesson.create({
      data: {
        id: "analytics-test-lesson-2",
        title: "Analytics Test Lesson 2",
        slug: "analytics-test-lesson-2",
        order: 2,
        courseId: course.id,
        published: true,
        content: "Test lesson content 2",
      },
    }),
  ]);

  return { user, course, lessons };
}

export async function cleanupAnalyticsTestData() {
  // Clean up in dependency order to avoid foreign key constraint errors
  await db.analyticsEvent.deleteMany({
    where: {
      userId: { in: ["test-analytics-user", "test-analytics-user-2"] },
    },
  });
  await db.certificate.deleteMany({
    where: {
      userId: { in: ["test-analytics-user", "test-analytics-user-2"] },
    },
  });
  await db.progress.deleteMany({
    where: {
      userId: { in: ["test-analytics-user", "test-analytics-user-2"] },
    },
  });
  await db.enrollment.deleteMany({
    where: {
      userId: { in: ["test-analytics-user", "test-analytics-user-2"] },
    },
  });

  // Delete lessons first (they reference course)
  await db.lesson.deleteMany({
    where: {
      courseId: "analytics-test-course",
    },
  });

  // Delete course
  await db.course.deleteMany({
    where: { id: "analytics-test-course" },
  });

  // Delete user last
  await db.user.deleteMany({
    where: { id: { in: ["test-analytics-user", "test-analytics-user-2"] } },
  });
}
