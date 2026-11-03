import { db } from "@/lib/db";
import type {
  CommunityUser,
} from "@/types/community";
import { PUBLIC_USER_WITH_BADGES_SELECT, withSafeLinks } from "./public-user";

/** Mentorship queries. */
export class MentorshipQueries {
  /**
   * Get available mentors
   */
  static async getAvailableMentors(): Promise<CommunityUser[]> {
    try {
      const mentors = await db.user.findMany({
        where: {
          role: "INSTRUCTOR",
          lastActiveAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Active in last 30 days
          },
        },
        select: PUBLIC_USER_WITH_BADGES_SELECT,
        orderBy: [{ communityLevel: "desc" }, { communityPoints: "desc" }],
      });

      return mentors.map(withSafeLinks) satisfies CommunityUser[];
    } catch (error) {
      console.error("Error fetching available mentors:", error);
      return [];
    }
  }

  /**
   * Get mentorship statistics
   */
  static async getMentorshipStats(): Promise<{
    totalMentors: number;
    totalRequests: number;
    activeMatches: number;
  }> {
    try {
      const [totalMentors, totalRequests, activeMatches] = await Promise.all([
        db.user.count({
          where: {
            role: "INSTRUCTOR",
            lastActiveAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Active in last 30 days
            },
          },
        }),
        db.mentorRequest.count(),
        db.mentorRequest.count({
          where: {
            status: "ACCEPTED",
          },
        }),
      ]);

      return {
        totalMentors,
        totalRequests,
        activeMatches,
      };
    } catch (error) {
      console.error("Error fetching mentorship stats:", error);
      return {
        totalMentors: 0,
        totalRequests: 0,
        activeMatches: 0,
      };
    }
  }
}
