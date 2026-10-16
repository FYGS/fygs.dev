import {
  type PrismaClient,
  type Tag,
} from "@prisma/client";

/** Course <-> tag relationships. */
export async function seedCourseTags(
  prisma: PrismaClient,
  { courses, tags }: { courses: any[]; tags: Tag[] },
): Promise<void> {
  // 5. Create course tags relationships
  console.log("🔗 Linking courses with tags...");
  const courseTagMappings = [
    {
      courseIndex: 0,
      tagNames: ["JavaScript", "Beginner", "Hands-On", "Frontend"],
    },
    {
      courseIndex: 1,
      tagNames: ["React", "Advanced", "Frontend", "Best Practices"],
    },
    {
      courseIndex: 2,
      tagNames: [
        "Next.js",
        "React",
        "Full-Stack",
        "Intermediate",
        "TypeScript",
      ],
    },
    {
      courseIndex: 3,
      tagNames: ["TypeScript", "JavaScript", "Beginner", "Best Practices"],
    },
    {
      courseIndex: 4,
      tagNames: ["AI/ML", "Advanced", "JavaScript", "Project-Based"],
    },
    {
      courseIndex: 5,
      tagNames: ["DevOps", "Docker", "Kubernetes", "AWS", "Intermediate"],
    },
    {
      courseIndex: 6,
      tagNames: ["Frontend", "Beginner", "Hands-On", "Tailwind CSS"],
    },
    {
      courseIndex: 7,
      tagNames: ["Backend", "Node.js", "Advanced", "Express"],
    },
  ];

  for (const mapping of courseTagMappings) {
    const course = courses[mapping.courseIndex];
    for (const tagName of mapping.tagNames) {
      const tag = tags.find((t) => t.name === tagName);
      if (tag && course) {
        await prisma.courseTag.create({
          data: {
            courseId: course.id,
            tagId: tag.id,
          },
        });
      }
    }
  }
  console.log("✅ Linked courses with relevant tags");
}
