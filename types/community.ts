/**
 * Community Forum Type Definitions
 * Comprehensive type system for the FYGS community platform
 */

import { z } from "zod";
import type {
  Discussion,
  DiscussionReply,
  Topic,
  Badge,
  UserBadge,
  Notification,
  MentorRequest,
  DiscussionVote,
  User,
  Course,
} from "@prisma/client";

// Base Community Types
export type CommunityUser = User & {
  userBadges: (UserBadge & { badge: Badge })[];
  _count: {
    discussions: number;
    discussionReplies: number;
    discussionVotes: number;
  };
};

export type CommunityTopic = Topic & {
  _count: {
    discussions: number;
    followers: number;
  };
  isFollowing?: boolean;
};

export type CommunityDiscussion = Discussion & {
  author: Pick<User, "id" | "name" | "image" | "role" | "communityLevel">;
  topic: Pick<Topic, "id" | "name" | "slug" | "color" | "icon">;
  course?: Pick<Course, "id" | "title" | "slug"> | null;
  _count: {
    replies: number;
    votes: number;
    bookmarks: number;
  };
  userVote?: DiscussionVote | null;
  isBookmarked?: boolean;
  replies?: CommunityReply[];
};

export type CommunityReply = DiscussionReply & {
  author: Pick<User, "id" | "name" | "image" | "role" | "communityLevel">;
  children?: CommunityReply[];
  userVote?: DiscussionVote | null;
  _count: {
    votes: number;
    children: number;
  };
};

export type CommunityNotification = Notification & {
  sender?: Pick<User, "id" | "name" | "image"> | null;
};

export type CommunityMentorRequest = MentorRequest & {
  student: Pick<User, "id" | "name" | "image" | "communityLevel">;
  mentor: Pick<User, "id" | "name" | "image" | "role">;
  course?: Pick<Course, "id" | "title"> | null;
};

// API Response Types
export interface DiscussionsResponse {
  discussions: CommunityDiscussion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    topic?: string;
    course?: string;
    tags?: string[];
    sort: DiscussionSortType;
  };
}

export interface TopicsResponse {
  topics: CommunityTopic[];
  featuredTopics: CommunityTopic[];
}

export interface UserProfileResponse {
  user: CommunityUser;
  stats: {
    totalDiscussions: number;
    totalReplies: number;
    totalUpvotes: number;
    joinedDate: Date;
    lastActive: Date;
  };
  recentActivity: CommunityDiscussion[];
}

// Enums
export type DiscussionSortType =
  | "latest"
  | "trending"
  | "most_replies"
  | "most_votes"
  | "oldest"
  | "top"
  | "recent"
  | "solved"
  | "unsolved";

export type VoteType = "UPVOTE" | "DOWNVOTE";
export type BadgeType =
  | "PARTICIPATION"
  | "ACHIEVEMENT"
  | "SPECIAL"
  | "MODERATOR";
export type NotificationType =
  | "DISCUSSION_REPLY"
  | "DISCUSSION_MENTION"
  | "DISCUSSION_UPVOTE"
  | "BADGE_EARNED"
  | "MENTOR_REQUEST"
  | "SYSTEM_ANNOUNCEMENT";

// Validation Schemas
export const createTopicSchema = z.object({
  name: z.string().min(3).max(50),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().min(10).max(500),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  icon: z.string().optional(),
  courseId: z.string().optional(),
});

export const createDiscussionSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(20).max(10000),
  topicId: z.string().cuid(),
  courseId: z.string().cuid().optional(),
  tags: z.array(z.string().max(20)).max(5).optional(),
});

export const updateDiscussionSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  content: z.string().min(20).max(10000).optional(),
  tags: z.array(z.string().max(20)).max(5).optional(),
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  isSolved: z.boolean().optional(),
});

export const createReplySchema = z.object({
  content: z.string().min(10).max(5000),
  discussionId: z.string().cuid(),
  parentId: z.string().cuid().optional(),
});

export const updateReplySchema = z.object({
  content: z.string().min(10).max(5000),
});

export const voteSchema = z.object({
  voteType: z.enum(["UPVOTE", "DOWNVOTE"]),
  targetId: z.string().cuid(),
  targetType: z.enum(["discussion", "reply"]),
});

export const mentorRequestSchema = z.object({
  mentorId: z.string().cuid(),
  courseId: z.string().cuid().optional(),
  message: z.string().min(20).max(1000),
});

export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  topicId: z.string().cuid().optional(),
  courseId: z.string().cuid().optional(),
  authorId: z.string().cuid().optional(),
  tags: z.array(z.string()).optional(),
  sort: z
    .enum([
      "latest",
      "trending",
      "most_replies",
      "most_votes",
      "oldest",
      "solved",
      "unsolved",
    ])
    .default("latest"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

export const updateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
});

// Action Result Types
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DiscussionActionResult extends ActionResult {
  discussion?: CommunityDiscussion;
}

export interface ReplyActionResult extends ActionResult {
  reply?: CommunityReply;
}

export interface VoteActionResult extends ActionResult {
  vote?: {
    type: VoteType;
    count: number;
    userVoted: boolean;
  };
}

// Filter and Search Types
export interface DiscussionFilters {
  topicId?: string;
  courseId?: string;
  tags?: string[];
  authorId?: string;
  userId?: string;
  status?: "all" | "solved" | "unsolved" | "pinned";
  sort: DiscussionSortType;
  page: number;
  limit: number;
}

export interface CommunityStats {
  totalUsers: number;
  totalDiscussions: number;
  totalReplies: number;
  activeUsers: number;
  topContributors: CommunityUser[];
  trendingTopics: CommunityTopic[];
  recentActivity: CommunityDiscussion[];
}

// UI Component Props Types
export interface DiscussionCardProps {
  discussion: CommunityDiscussion;
  showTopic?: boolean;
  showCourse?: boolean;
  compact?: boolean;
  onVote?: (voteType: VoteType) => void;
  onBookmark?: () => void;
}

export interface ReplyItemProps {
  reply: CommunityReply;
  depth?: number;
  maxDepth?: number;
  onVote?: (voteType: VoteType) => void;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface TopicCardProps {
  topic: CommunityTopic;
  onFollow?: () => void;
  showStats?: boolean;
}

export interface UserBadgeProps {
  badge: Badge;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

// Advanced Feature Types
export interface AIModeration {
  score: number;
  flags: string[];
  suggestions: string[];
  autoAction?: "approve" | "flag" | "reject";
}

export interface TrendingAnalysis {
  score: number;
  factors: {
    recentActivity: number;
    engagementRate: number;
    uniqueParticipants: number;
    timeDecay: number;
  };
}

export interface RecommendationEngine {
  discussions: CommunityDiscussion[];
  topics: CommunityTopic[];
  mentors: CommunityUser[];
  reasons: string[];
}

// Export validation schema types
export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type CreateDiscussionInput = z.infer<typeof createDiscussionSchema>;
export type UpdateDiscussionInput = z.infer<typeof updateDiscussionSchema>;
export type CreateReplyInput = z.infer<typeof createReplySchema>;
export type UpdateReplyInput = z.infer<typeof updateReplySchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type MentorRequestInput = z.infer<typeof mentorRequestSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
