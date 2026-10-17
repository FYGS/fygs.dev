import {
  type PrismaClient,
  type User,
} from "../../../lib/generated/prisma/client";
import { randomDate, randomChoice } from "../utils";

/** Analytics events. */
export async function seedAnalytics(
  prisma: PrismaClient,
  { users, courses }: { users: User[]; courses: any[] },
): Promise<void> {
  // 16. Create analytics events
  console.log("📈 Creating analytics data...");

  const eventTypes = [
    "course_view",
    "lesson_start",
    "lesson_complete",
    "quiz_attempt",
    "review_submit",
    "payment_success",
    "enrollment_create",
  ];

  // Create 500 analytics events over the last 30 days
  for (let i = 0; i < 500; i++) {
    const randomUser = randomChoice(users);
    const randomCourse = randomChoice(courses);

    await prisma.analyticsEvent.create({
      data: {
        userId: randomUser.id,
        type: randomChoice(eventTypes),
        source: randomChoice(["web", "mobile", "api"]),
        createdAt: randomDate(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date()
        ),
        properties: {
          courseId: randomCourse.id,
          userAgent: "Mozilla/5.0 (compatible)",
          platform: randomChoice(["desktop", "mobile", "tablet"]),
        },
      },
    });
  }
  console.log("✅ Created analytics events");
}
