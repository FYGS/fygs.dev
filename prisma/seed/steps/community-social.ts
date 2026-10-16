import {
  type Badge,
  type Discussion,
  type PrismaClient,
  type User,
} from "@prisma/client";
import { randomDate, randomBetween } from "../utils";

/** Notifications, mentor requests, user follows and community stats. */
export async function seedCommunitySocial(
  prisma: PrismaClient,
  { students, users, discussions, badges, instructor, courses }: { students: User[]; users: User[]; discussions: Discussion[]; badges: Badge[]; instructor: User; courses: any[] },
): Promise<void> {
  // Create community notifications
  const notificationTypes = [
    {
      recipientId: students[2].id,
      senderId: users[1].id,
      type: "DISCUSSION_REPLY" as const,
      title: "Nouvelle réponse à votre discussion",
      message: "Votre question sur React a reçu une nouvelle réponse",
      data: { discussionId: discussions[1].id },
    },
    {
      recipientId: students[3].id,
      type: "BADGE_EARNED" as const,
      title: "Nouveau badge débloqué !",
      message: "Vous avez gagné le badge 'Conversationnel'",
      data: { badgeId: badges[1].id },
    },
    {
      recipientId: students[4].id,
      senderId: instructor.id,
      type: "DISCUSSION_MENTION" as const,
      title: "Vous avez été mentionné",
      message: "Fernand vous a mentionné dans une discussion",
      data: { discussionId: discussions[0].id },
    },
  ];

  for (const notification of notificationTypes) {
    await prisma.notification.create({
      data: notification,
    });
  }
  console.log("✅ Created community notifications");

  // Create mentor requests
  const mentorRequests = [
    {
      studentId: students[5].id,
      mentorId: instructor.id,
      courseId: courses[2].id, // Next.js course
      message:
        "Bonjour ! J'aimerais avoir des conseils personnalisés pour progresser en Next.js et améliorer mon code. Serait-il possible d'avoir un mentorat ?",
      status: "PENDING" as const,
    },
    {
      studentId: students[7].id,
      mentorId: instructor.id,
      courseId: courses[1].id, // React course
      message:
        "Salut Fernand ! Je galère un peu avec les patterns avancés React. Peux-tu m'aider à structurer mon apprentissage ?",
      status: "ACCEPTED" as const,
    },
  ];

  for (const request of mentorRequests) {
    await prisma.mentorRequest.create({
      data: request,
    });
  }
  console.log("✅ Created mentor requests");

  // Create user follow relationships
  console.log("👥 Creating user follow relationships...");
  const userFollows = [
    // Students follow the instructor
    { followerId: students[0].id, followingId: instructor.id },
    { followerId: students[1].id, followingId: instructor.id },
    { followerId: students[2].id, followingId: instructor.id },
    { followerId: students[3].id, followingId: instructor.id },
    { followerId: students[5].id, followingId: instructor.id },
    { followerId: students[7].id, followingId: instructor.id },
    // Active students follow each other
    { followerId: students[0].id, followingId: students[1].id },
    { followerId: students[1].id, followingId: students[0].id },
    { followerId: students[0].id, followingId: students[2].id },
    { followerId: students[2].id, followingId: students[0].id },
    { followerId: students[1].id, followingId: students[3].id },
    { followerId: students[3].id, followingId: students[1].id },
    // Some asymmetric follows
    { followerId: students[4].id, followingId: students[0].id },
    { followerId: students[5].id, followingId: students[1].id },
    { followerId: students[6].id, followingId: students[2].id },
  ];

  for (const follow of userFollows) {
    await prisma.userFollow.create({
      data: follow,
    });
  }
  console.log(`✅ Created ${userFollows.length} user follow relationships`);

  // Update user community data
  await prisma.user.update({
    where: { id: instructor.id },
    data: {
      communityPoints: 1500,
      communityLevel: 5,
      lastActiveAt: new Date(),
    },
  });

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    await prisma.user.update({
      where: { id: student.id },
      data: {
        communityPoints: randomBetween(50, 500),
        communityLevel: randomBetween(1, 3),
        lastActiveAt: randomDate(
          new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          new Date()
        ),
      },
    });
  }
  console.log("✅ Updated user community data");
}
