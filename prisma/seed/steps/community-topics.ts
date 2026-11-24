import {
  type PrismaClient,
  type Topic,
} from "../../../lib/generated/prisma/client";

/** Community topics. */
export async function seedCommunityTopics(
  prisma: PrismaClient,
  { courses }: { courses: any[] },
): Promise<{ topics: Topic[] }> {
  // 8. Create comprehensive community system
  console.log("🏛️ Building community forum system...");

  // Create community topics
  const communityTopics = [
    {
      name: "Général",
      slug: "general",
      description: "Discussions générales sur le développement web",
      color: "#3B82F6",
      icon: "MessageSquare",
      order: 1,
      isDefault: true,
    },
    {
      name: "JavaScript",
      slug: "javascript",
      description: "Questions et discussions autour de JavaScript",
      color: "#F7DF1E",
      icon: "Code",
      order: 2,
      courseId: courses[0].id,
    },
    {
      name: "React",
      slug: "react",
      description: "Tout sur React et son écosystème",
      color: "#61DAFB",
      icon: "Atom",
      order: 3,
      courseId: courses[1].id,
    },
    {
      name: "Next.js",
      slug: "nextjs",
      description: "Framework Next.js et développement full-stack",
      color: "#000000",
      icon: "Zap",
      order: 4,
      courseId: courses[2].id,
    },
    {
      name: "Aide & Support",
      slug: "help-support",
      description: "Demandez de l'aide à la communauté",
      color: "#10B981",
      icon: "HelpCircle",
      order: 5,
      isDefault: true,
    },
    {
      name: "Projets & Showcases",
      slug: "projects-showcases",
      description: "Partagez vos projets et réalisations",
      color: "#F59E0B",
      icon: "Star",
      order: 6,
      isDefault: true,
    },
    {
      name: "Career & Jobs",
      slug: "career-jobs",
      description: "Conseils carrière et opportunités d'emploi",
      color: "#8B5CF6",
      icon: "Briefcase",
      order: 7,
      isDefault: true,
    },
  ];

  const topics = [];
  for (const topicData of communityTopics) {
    const topic = await prisma.topic.create({
      data: topicData,
    });
    topics.push(topic);
  }
  console.log(`✅ Created ${topics.length} community topics`);

  return { topics };
}
