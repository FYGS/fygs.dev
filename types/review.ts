/**
 * Enhanced Review System Types
 * Modern, comprehensive types for the review module
 */

// Basic enums (duplicated temporarily until Prisma types are available)
export enum ReviewStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  FLAGGED = "FLAGGED",
}

export enum ReportReason {
  SPAM = "SPAM",
  INAPPROPRIATE = "INAPPROPRIATE",
  FAKE = "FAKE",
  OFFENSIVE = "OFFENSIVE",
  COPYRIGHT = "COPYRIGHT",
  OTHER = "OTHER",
}

export enum ReportStatus {
  PENDING = "PENDING",
  REVIEWED = "REVIEWED",
  RESOLVED = "RESOLVED",
  DISMISSED = "DISMISSED",
}

export interface ReviewUserInfo {
  id: string;
  name: string;
  image: string | null;
  role?: string;
}

export interface ReviewVoteInfo {
  id: string;
  userId: string;
  helpful: boolean;
  createdAt: string;
}

export interface ReviewReplyInfo {
  id: string;
  userId: string;
  content: string;
  user: ReviewUserInfo;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewReportInfo {
  id: string;
  userId: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  createdAt: string;
  user: ReviewUserInfo;
}

export interface EnhancedReviewDTO {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string | null;
  verified: boolean;
  helpfulCount: number;
  reportCount: number;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  user: ReviewUserInfo;
  votes?: ReviewVoteInfo[];
  replies?: ReviewReplyInfo[];
  reports?: ReviewReportInfo[];
  // UI state
  userVote?: "helpful" | "unhelpful" | null;
  canEdit?: boolean;
  canDelete?: boolean;
  canReply?: boolean;
  canReport?: boolean;
}

export interface ReviewStatsDTO {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  verifiedReviews: number;
  recentReviews: number;
  verificationRate: number;
  lastUpdated: string;
}

export interface ReviewFilters {
  rating?: number | number[];
  verified?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: "newest" | "oldest" | "helpful" | "rating_high" | "rating_low";
  page?: number;
  limit?: number;
  search?: string;
}

export interface ReviewFormData {
  rating: number;
  comment?: string;
  courseId: string;
}

export interface ReviewActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface ReviewModerationAction {
  reviewId: string;
  action: "approve" | "reject" | "flag" | "delete";
  reason?: string;
  moderatorId: string;
}

export interface ReviewAnalytics {
  totalReviews: number;
  averageRating: number;
  ratingTrend: Array<{
    date: string;
    rating: number;
    count: number;
  }>;
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
    totalAnalyzed: number;
  };
  topKeywords: Array<{
    word: string;
    count: number;
    sentiment: "positive" | "neutral" | "negative";
  }>;
  responseRate: number; // Instructor response rate
  averageResponseTime: number; // In hours
}

export interface GlobalReviewStats {
  totalReviews: number;
  totalCourses: number;
  averageRating: number;
  topRatedCourses: Array<{
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
    averageRating: number;
    reviewCount: number;
  }>;
  reviewsByMonth: Record<
    string,
    {
      count: number;
      averageRating: number;
    }
  >;
  lastUpdated: string;
}

export interface ReviewNotificationData {
  type: "new_review" | "review_reply" | "helpful_vote" | "review_milestone";
  reviewId: string;
  courseId: string;
  courseName: string;
  rating?: number;
  comment?: string;
  userName: string;
  userImage?: string;
  timestamp: string;
}

export interface ReviewSEOData {
  aggregateRating: {
    ratingValue: number;
    bestRating: number;
    worstRating: number;
    ratingCount: number;
  };
  reviews: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    reviewRating: number;
  }>;
}

// Form validation schemas
export interface ReviewValidationRules {
  rating: {
    min: number;
    max: number;
    required: boolean;
  };
  comment: {
    minLength?: number;
    maxLength?: number;
    required: boolean;
    allowHTML: boolean;
  };
  cooldownPeriod: number; // Hours between reviews from same user
  maxReportsBeforeHide: number;
  autoApprove: boolean;
}

// Permissions interface
export interface ReviewPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canReply: boolean;
  canVote: boolean;
  canReport: boolean;
  canModerate: boolean;
  requiresEnrollment: boolean;
  requiresCompletion: boolean;
}

export type ReviewSortOption =
  | { field: "createdAt"; direction: "asc" | "desc" }
  | { field: "rating"; direction: "asc" | "desc" }
  | { field: "helpfulCount"; direction: "asc" | "desc" }
  | { field: "verified"; direction: "asc" | "desc" };

export interface ReviewQueryOptions {
  filters: ReviewFilters;
  sort: ReviewSortOption[];
  include?: {
    votes?: boolean;
    replies?: boolean;
    reports?: boolean;
    user?: boolean;
  };
}

export interface ReviewBulkAction {
  reviewIds: string[];
  action: "approve" | "reject" | "delete" | "flag";
  reason?: string;
}

export interface ReviewExportOptions {
  format: "csv" | "json" | "xlsx";
  filters?: ReviewFilters;
  fields: string[];
  includePersonalData: boolean;
}
