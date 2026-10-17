import type {
  DiscussionSortType,
} from "@/types/community";
import { Prisma } from "@/lib/generated/prisma/browser";

/** Maps a discussion sort type to its Prisma orderBy clause. */
export class DiscussionOrder {
  // Helper methods
  static getDiscussionOrderBy(
    sort: DiscussionSortType
  ): Prisma.DiscussionOrderByWithRelationInput[] {
    switch (sort) {
      case "latest":
        return [{ createdAt: "desc" }];
      case "trending":
        return [
          { lastActivityAt: "desc" },
          { upvoteCount: "desc" },
          { replyCount: "desc" },
        ];
      case "most_replies":
        return [{ replyCount: "desc" }, { createdAt: "desc" }];
      case "most_votes":
        return [{ upvoteCount: "desc" }, { createdAt: "desc" }];
      case "oldest":
        return [{ createdAt: "asc" }];
      case "solved":
        return [{ isSolved: "desc" }, { lastActivityAt: "desc" }];
      case "unsolved":
        return [{ isSolved: "asc" }, { lastActivityAt: "desc" }];
      default:
        return [{ createdAt: "desc" }];
    }
  }
}
