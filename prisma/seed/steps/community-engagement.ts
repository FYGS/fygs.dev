import {
  Role,
  type Badge,
  type Discussion,
  type DiscussionReply,
  type PrismaClient,
  type Topic,
  type User,
} from "../../../lib/generated/prisma/client";
import { randomBetween } from "../utils";

/** Votes, topic follows, bookmarks and badge awards. */
export async function seedCommunityEngagement(
  prisma: PrismaClient,
  { students, discussions, replies, topics, instructor, badges }: { students: User[]; discussions: Discussion[]; replies: DiscussionReply[]; topics: Topic[]; instructor: User; badges: Badge[] },
): Promise<void> {
  // Create discussion votes
  const votingUsers = students.slice(0, 8);
  for (const discussion of discussions) {
    const voteCount = randomBetween(2, 10);
    const votingSubset = votingUsers.slice(0, voteCount);

    for (const voter of votingSubset) {
      if (voter.id !== discussion.authorId) {
        await prisma.discussionVote.create({
          data: {
            userId: voter.id,
            discussionId: discussion.id,
            voteType: Math.random() > 0.8 ? "DOWNVOTE" : "UPVOTE",
          },
        });
      }
    }
  }

  // Create reply votes
  for (const reply of replies) {
    const voteCount = randomBetween(1, 8);
    const votingSubset = votingUsers.slice(0, voteCount);

    for (const voter of votingSubset) {
      if (voter.id !== reply.authorId) {
        await prisma.discussionVote.create({
          data: {
            userId: voter.id,
            replyId: reply.id,
            voteType: Math.random() > 0.9 ? "DOWNVOTE" : "UPVOTE",
          },
        });
      }
    }
  }
  console.log("✅ Created discussion and reply votes");

  // Create topic follows
  for (const student of students.slice(0, 6)) {
    const followCount = randomBetween(2, 4);
    const topicsToFollow = topics.slice(0, followCount);

    for (const topic of topicsToFollow) {
      await prisma.topicFollow.create({
        data: {
          userId: student.id,
          topicId: topic.id,
        },
      });
    }
  }
  console.log("✅ Created topic follows");

  // Create discussion bookmarks
  for (const student of students.slice(0, 5)) {
    const bookmarkCount = randomBetween(1, 3);
    const discussionsToBookmark = discussions.slice(0, bookmarkCount);

    for (const discussion of discussionsToBookmark) {
      await prisma.discussionBookmark.create({
        data: {
          userId: student.id,
          discussionId: discussion.id,
        },
      });
    }
  }
  console.log("✅ Created discussion bookmarks");

  // Award community badges to active users
  const activeUsers = [instructor, ...students.slice(0, 5)];
  for (const user of activeUsers) {
    // Everyone gets "Premier Pas"
    await prisma.userBadge.create({
      data: {
        userId: user.id,
        badgeId: badges[0].id, // Premier Pas
      },
    });

    // Some get more badges based on activity
    if (user.role === Role.INSTRUCTOR) {
      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: badges[5].id, // Modérateur
        },
      });
      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: badges[4].id, // Mentor
        },
      });
    } else if (students.indexOf(user) < 3) {
      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: badges[1].id, // Conversationnel
        },
      });
      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: badges[2].id, // Serviable
        },
      });
    }
  }
  console.log("✅ Awarded community badges");
}
