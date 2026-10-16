import {
  type PrismaClient,
  type User,
} from "@prisma/client";
import { randomDate } from "../utils";
import { comprehensiveCourses } from "../data/courses";

/** Course catalog. */
export async function seedCourses(
  prisma: PrismaClient,
  { instructor }: { instructor: User },
): Promise<{ courses: any[] }> {
  // 4. Create comprehensive course catalog
  console.log("📚 Building course catalog...");
  const courses: any[] = [];

  for (const courseData of comprehensiveCourses) {
    const course = await prisma.course.create({
      data: {
        ...courseData,
        instructorId: instructor.id,
        published: true,
        createdAt: randomDate(
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          new Date()
        ),
        updatedAt: new Date(),
      },
    });
    courses.push(course);
  }
  console.log(`✅ Created ${courses.length} courses`);

  return { courses };
}
