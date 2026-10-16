import {
  type Badge,
  type PrismaClient,
} from "@prisma/client";

/** Community badges. */
export async function seedCommunityBadges(
  prisma: PrismaClient,
): Promise<{ badges: Badge[] }> {
  // Create community badges
  const communityBadges = [
    {
      name: "Premier Pas",
      description: "Première connexion à la communauté",
      icon: "User",
      color: "#22C55E",
      points: 0,
      type: "PARTICIPATION" as const,
      condition: JSON.stringify({ type: "first_login" }),
    },
    {
      name: "Conversationnel",
      description: "Première discussion créée",
      icon: "MessageSquare",
      color: "#3B82F6",
      points: 10,
      type: "PARTICIPATION" as const,
      condition: JSON.stringify({ type: "first_discussion" }),
    },
    {
      name: "Serviable",
      description: "Première réponse utile",
      icon: "Heart",
      color: "#EF4444",
      points: 25,
      type: "PARTICIPATION" as const,
      condition: JSON.stringify({ type: "first_helpful_reply" }),
    },
    {
      name: "Expert",
      description: "100 réponses acceptées",
      icon: "Award",
      color: "#F59E0B",
      points: 500,
      type: "ACHIEVEMENT" as const,
      condition: JSON.stringify({ type: "accepted_replies", count: 100 }),
    },
    {
      name: "Mentor",
      description: "Guide et aide les nouveaux membres",
      icon: "Users",
      color: "#8B5CF6",
      points: 1000,
      type: "SPECIAL" as const,
      condition: JSON.stringify({ type: "mentor_activity" }),
    },
    {
      name: "Modérateur",
      description: "Équipe de modération",
      icon: "Shield",
      color: "#6366F1",
      points: 0,
      type: "MODERATOR" as const,
      condition: JSON.stringify({ type: "staff_role" }),
    },
  ];

  const badges = [];
  for (const badgeData of communityBadges) {
    const badge = await prisma.badge.create({
      data: badgeData,
    });
    badges.push(badge);
  }
  console.log(`✅ Created ${badges.length} community badges`);

  return { badges };
}
