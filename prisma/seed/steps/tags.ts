import {
  type PrismaClient,
  type Tag,
} from "../../../lib/generated/prisma/client";

/** Tag ecosystem. */
export async function seedTags(
  prisma: PrismaClient,
): Promise<{ tags: Tag[] }> {
  // 3. Create comprehensive tag system
  console.log("🏷️ Building tag ecosystem...");
  const tagCategories = [
    // Technologies
    { name: "JavaScript", color: "#F7DF1E" },
    { name: "TypeScript", color: "#3178C6" },
    { name: "React", color: "#61DAFB" },
    { name: "Next.js", color: "#000000" },
    { name: "Node.js", color: "#339933" },
    { name: "Express", color: "#000000" },
    { name: "Prisma", color: "#2D3748" },
    { name: "PostgreSQL", color: "#4169E1" },
    { name: "Docker", color: "#2496ED" },
    { name: "Kubernetes", color: "#326CE5" },
    { name: "AWS", color: "#FF9900" },
    { name: "Tailwind CSS", color: "#06B6D4" },
    // Levels
    { name: "Beginner", color: "#22C55E" },
    { name: "Intermediate", color: "#F59E0B" },
    { name: "Advanced", color: "#EF4444" },
    { name: "Expert", color: "#8B5A2B" },
    // Types
    { name: "Full-Stack", color: "#F97316" },
    { name: "Frontend", color: "#EC4899" },
    { name: "Backend", color: "#8B5CF6" },
    { name: "DevOps", color: "#6366F1" },
    { name: "AI/ML", color: "#FF6B6B" },
    // Approaches
    { name: "Hands-On", color: "#10B981" },
    { name: "Project-Based", color: "#84CC16" },
    { name: "Interview Prep", color: "#A855F7" },
    { name: "Best Practices", color: "#06B6D4" },
  ];

  const tags = [];
  for (const tag of tagCategories) {
    const createdTag = await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    });
    tags.push(createdTag);
  }
  console.log(`✅ Created ${tags.length} tags`);

  return { tags };
}
