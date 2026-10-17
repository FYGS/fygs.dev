import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { db } from "@/lib/db";
import { enrollCourse } from "@/app/[locale]/(main)/dashboard/actions/enrollCourse";
import { getCachedCourseList } from "@/lib/repositories/course-repository";
import { AccessService } from "@/lib/access-service";
import { auth } from "@/lib/auth";

// Mock auth for testing
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() =>
        Promise.resolve({
          user: { id: "test-user-id", email: "test@example.com" },
        })
      ),
    },
  },
}));

// Mock headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

// Mock Next.js cache functions
vi.mock("next/cache", () => ({
  unstable_cache: vi.fn((fn) => fn),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

describe("Unpublished Course Visibility Integration Tests", () => {
  let testUserId: string;
  let publishedCourseId: string;
  let unpublishedCourseId: string;
  let testEmail: string;

  beforeEach(async () => {
    // unique per test: no collision with leftovers of another test or file
    const suffix = Math.random().toString(36).slice(2, 10);
    testEmail = `visibility-test-${suffix}@example.com`;
    // Create test user
    const user = await db.user.create({
      data: {
        email: testEmail,
        name: "Visibility Test User",
        emailVerified: true,
      },
    });
    testUserId = user.id;

    // Create published course
    const publishedCourse = await db.course.create({
      data: {
        title: "Published Test Course",
        slug: `published-test-course-${suffix}`,
        description: "Published course for testing",
        category: "JAVASCRIPT",
        level: "BEGINNER",
        published: true,
        accessTier: "FREE",
      },
    });
    publishedCourseId = publishedCourse.id;

    // Create unpublished course
    const unpublishedCourse = await db.course.create({
      data: {
        title: "Unpublished Test Course",
        slug: `unpublished-test-course-${suffix}`,
        description: "Unpublished course for testing",
        category: "TYPESCRIPT",
        level: "INTERMEDIATE",
        published: false,
        accessTier: "PREMIUM",
      },
    });
    unpublishedCourseId = unpublishedCourse.id;

    // Create lessons for both courses
    await Promise.all([
      // Published course lessons
      db.lesson.create({
        data: {
          title: "Published Lesson 1",
          slug: "published-lesson-1",
          courseId: publishedCourseId,
          order: 1,
          published: true,
        },
      }),
      db.lesson.create({
        data: {
          title: "Published Lesson 2",
          slug: "published-lesson-2",
          courseId: publishedCourseId,
          order: 2,
          published: true,
        },
      }),
      // Unpublished course lessons
      db.lesson.create({
        data: {
          title: "Unpublished Lesson 1",
          slug: "unpublished-lesson-1",
          courseId: unpublishedCourseId,
          order: 1,
          published: true,
        },
      }),
      db.lesson.create({
        data: {
          title: "Unpublished Lesson 2",
          slug: "unpublished-lesson-2",
          courseId: unpublishedCourseId,
          order: 2,
          published: true,
        },
      }),
    ]);

    // Mock the auth user ID to match our test user
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: testUserId, email: testEmail },
    } as never);
  });

  afterEach(async () => {
    // Cleanup in reverse dependency order
    await db.progress.deleteMany({ where: { userId: testUserId } });
    await db.enrollment.deleteMany({ where: { userId: testUserId } });
    await db.lesson.deleteMany({
      where: {
        courseId: {
          in: [publishedCourseId, unpublishedCourseId],
        },
      },
    });
    await db.course.deleteMany({
      where: {
        id: {
          in: [publishedCourseId, unpublishedCourseId],
        },
      },
    });
    await db.user.delete({ where: { id: testUserId } });
    vi.clearAllMocks();
  });

  test("catalog hides unpublished courses from non-enrolled users", async () => {
    // Get catalog courses (should only show published)
    const catalogCourses = await getCachedCourseList({
      publishedOnly: true,
    });

    // Should include published course
    const publishedInCatalog = catalogCourses.find(
      (c) => c.id === publishedCourseId
    );
    expect(publishedInCatalog).toBeDefined();
    expect(publishedInCatalog?.title).toBe("Published Test Course");

    // Should NOT include unpublished course
    const unpublishedInCatalog = catalogCourses.find(
      (c) => c.id === unpublishedCourseId
    );
    expect(unpublishedInCatalog).toBeUndefined();
  });

  test("catalog shows unpublished courses when publishedOnly is false", async () => {
    // Get all courses including unpublished (admin view)
    const allCourses = await getCachedCourseList({
      publishedOnly: false,
    });

    // Should include both courses
    const publishedInList = allCourses.find((c) => c.id === publishedCourseId);
    const unpublishedInList = allCourses.find(
      (c) => c.id === unpublishedCourseId
    );

    expect(publishedInList).toBeDefined();
    expect(unpublishedInList).toBeDefined();
    expect(unpublishedInList?.title).toBe("Unpublished Test Course");
  });

  test("enrolled user retains access to unpublished course", async () => {
    // First, publish the course to allow enrollment
    await db.course.update({
      where: { id: unpublishedCourseId },
      data: { published: true },
    });

    // Create subscription for premium access
    await db.subscription.create({
      data: {
        userId: testUserId,
        status: "ACTIVE",
        priceId: "price_test_premium",
        stripeCustomerId: "cus_test",
        stripeSubscriptionId: "sub_test",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Enroll in the course while it's published
    const enrollResult = await enrollCourse({ courseId: unpublishedCourseId });
    expect(enrollResult.success).toBe(true);

    // Now unpublish the course
    await db.course.update({
      where: { id: unpublishedCourseId },
      data: { published: false },
    });

    // Verify catalog no longer shows the course
    const catalogAfterUnpublish = await getCachedCourseList({
      publishedOnly: true,
    });
    const courseInCatalog = catalogAfterUnpublish.find(
      (c) => c.id === unpublishedCourseId
    );
    expect(courseInCatalog).toBeUndefined();

    // But enrolled user should still have access
    const accessResult = await AccessService.checkCourseAccess(
      testUserId,
      unpublishedCourseId
    );
    expect(accessResult.canAccessCourse).toBe(true);
    expect(accessResult.isEnrolledInCourse).toBe(true);

    // Verify enrollment still exists
    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: testUserId,
        courseId: unpublishedCourseId,
      },
    });
    expect(enrollment).toBeDefined();
  });

  test("dashboard shows unpublished enrolled courses", async () => {
    // Enroll in published course first
    await enrollCourse({ courseId: publishedCourseId });

    // Publish unpublished course temporarily, enroll, then unpublish
    await db.course.update({
      where: { id: unpublishedCourseId },
      data: { published: true },
    });

    // Create subscription for premium access
    await db.subscription.create({
      data: {
        userId: testUserId,
        status: "ACTIVE",
        priceId: "price_test_premium",
        stripeCustomerId: "cus_test",
        stripeSubscriptionId: "sub_test",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await enrollCourse({ courseId: unpublishedCourseId });

    // Unpublish the course
    await db.course.update({
      where: { id: unpublishedCourseId },
      data: { published: false },
    });

    // Get user's enrolled courses (dashboard query - no published filter)
    const userWithEnrollments = await db.user.findUnique({
      where: { id: testUserId },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                published: true,
              },
            },
          },
        },
      },
    });

    expect(userWithEnrollments?.enrollments).toHaveLength(2);

    const enrolledCourseIds =
      userWithEnrollments?.enrollments.map((e) => e.course.id) || [];
    expect(enrolledCourseIds).toContain(publishedCourseId);
    expect(enrolledCourseIds).toContain(unpublishedCourseId);

    // Verify one course is published, one is not
    const courses = userWithEnrollments?.enrollments.map((e) => e.course) || [];
    const publishedEnrolledCourse = courses.find(
      (c) => c.id === publishedCourseId
    );
    const unpublishedEnrolledCourse = courses.find(
      (c) => c.id === unpublishedCourseId
    );

    expect(publishedEnrolledCourse?.published).toBe(true);
    expect(unpublishedEnrolledCourse?.published).toBe(false);
  });

  test("non-enrolled user cannot access unpublished course", async () => {
    // Verify unpublished course is not accessible to non-enrolled user
    const accessResult = await AccessService.checkCourseAccess(
      testUserId,
      unpublishedCourseId
    );
    expect(accessResult.canAccessCourse).toBe(false);
    expect(accessResult.isEnrolledInCourse).toBe(false);
    // a draft course offers no first-lesson preview either (previewEnabled
    // defaults to true: the draft must stay hidden regardless)
    expect(accessResult.canPreviewFirstLesson).toBe(false);
    expect(accessResult.accessReason).toBe("not_enrolled");

    // ...so none of its lessons can be opened
    const draftLessons = await db.lesson.findMany({
      where: { courseId: unpublishedCourseId },
      select: { id: true },
    });
    expect(draftLessons.length).toBeGreaterThan(0);
    for (const lesson of draftLessons) {
      expect(await AccessService.canAccessLesson(testUserId, lesson.id)).toBe(
        false
      );
    }

    // Verify course doesn't appear in catalog
    const catalogCourses = await getCachedCourseList({
      publishedOnly: true,
    });
    const courseInCatalog = catalogCourses.find(
      (c) => c.id === unpublishedCourseId
    );
    expect(courseInCatalog).toBeUndefined();
  });

  test("search and filters respect published status", async () => {
    // Search for courses by category
    const typescriptCourses = await getCachedCourseList({
      category: "TYPESCRIPT",
      publishedOnly: true,
    });

    // Should not find unpublished TypeScript course
    const unpublishedInSearch = typescriptCourses.find(
      (c) => c.id === unpublishedCourseId
    );
    expect(unpublishedInSearch).toBeUndefined();

    // But should find it when including unpublished
    const allTypescriptCourses = await getCachedCourseList({
      category: "TYPESCRIPT",
      publishedOnly: false,
    });

    const unpublishedInAllSearch = allTypescriptCourses.find(
      (c) => c.id === unpublishedCourseId
    );
    expect(unpublishedInAllSearch).toBeDefined();

    // Text search should also respect published status
    const searchResults = await getCachedCourseList({
      search: "Unpublished",
      publishedOnly: true,
    });

    const unpublishedInTextSearch = searchResults.find(
      (c) => c.id === unpublishedCourseId
    );
    expect(unpublishedInTextSearch).toBeUndefined();
  });

  test("course progress persists for unpublished enrolled courses", async () => {
    // Enroll while published
    await db.course.update({
      where: { id: unpublishedCourseId },
      data: { published: true },
    });

    await db.subscription.create({
      data: {
        userId: testUserId,
        status: "ACTIVE",
        priceId: "price_test_premium",
        stripeCustomerId: "cus_test",
        stripeSubscriptionId: "sub_test",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await enrollCourse({ courseId: unpublishedCourseId });

    // Create some progress
    const lessons = await db.lesson.findMany({
      where: { courseId: unpublishedCourseId },
      orderBy: { order: "asc" },
    });

    await db.progress.create({
      data: {
        userId: testUserId,
        lessonId: lessons[0].id,
        completed: true,
        watchTime: 300,
      },
    });

    // Unpublish course
    await db.course.update({
      where: { id: unpublishedCourseId },
      data: { published: false },
    });

    // Verify progress still accessible
    const progress = await db.progress.findMany({
      where: {
        userId: testUserId,
        lesson: { courseId: unpublishedCourseId },
      },
    });

    expect(progress).toHaveLength(1);
    expect(progress[0].completed).toBe(true);
    expect(progress[0].watchTime).toBe(300);

    // Verify access to course and lessons still works
    const accessResult = await AccessService.checkCourseAccess(
      testUserId,
      unpublishedCourseId
    );
    expect(accessResult.canAccessCourse).toBe(true);

    const lessonAccess = await AccessService.canAccessLesson(
      testUserId,
      lessons[0].id
    );
    expect(lessonAccess).toBe(true);
  });
});
