import {
  type PrismaClient,
  type User,
} from "@prisma/client";
import { realisticUsers } from "../data/users";

/** Users with realistic profiles. */
export async function seedUsers(
  prisma: PrismaClient,
): Promise<{ students: User[]; instructor: User; users: User[] }> {
  // 1. Create users with realistic profiles
  console.log("👥 Creating realistic user profiles...");
  const users = [];

  for (const userData of realisticUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        emailVerified: true,
        image: userData.image,
        bio: userData.bio,
        githubUrl: userData.githubUrl,
        linkedinUrl: userData.linkedinUrl,
        websiteUrl: userData.websiteUrl,
      },
    });
    users.push(user);
  }

  const [instructor, , ...students] = users;
  console.log(
    `✅ Created ${users.length} users (1 instructor, 1 admin, ${students.length} students)`
  );

  return { students, instructor, users };
}
