import { db } from "@/lib/db";
import { ReviewStatus, Prisma } from "@/lib/generated/prisma/browser";
import { cache } from "react";

export interface ReviewSearchFilters {
  courseId?: string;
  search?: string;
  rating?: number | number[];
  status?: ReviewStatus | ReviewStatus[];
  verified?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  hasComment?: boolean;
  hasReplies?: boolean;
  minHelpfulVotes?: number;
  userId?: string;
  instructorId?: string;
  reportCount?: {
    min?: number;
    max?: number;
  };
}

export interface ReviewSearchOptions {
  page?: number;
  limit?: number;
  sortBy?:
    | "newest"
    | "oldest"
    | "helpful"
    | "rating_high"
    | "rating_low"
    | "relevance";
  includeStats?: boolean;
  includeReplies?: boolean;
  includeVotes?: boolean;
  /**
   * The caller has checked that the viewer may read reviews that are not approved (an administrator, or an instructor
   * looking at their own courses) and may see reports and voters. Default false: the search answers like it would
   * to the public. Never set it from a request parameter.
   */
  privileged?: boolean;
  /** The signed-in viewer: they get their own vote on each review, and can list their own reviews whatever their status. */
  viewerId?: string;
}

/**
 * What the public may ask for. A review is public once approved: other statuses (pending, rejected, flagged), report
 * counts and the list of who voted are moderation data. Without `privileged`, the status is forced to APPROVED
 * (a viewer listing their OWN reviews keeps the status they asked for) and the report filter is dropped.
 */
export function scopeReviewFilters(
  filters: ReviewSearchFilters,
  { privileged, viewerId }: { privileged: boolean; viewerId?: string },
): ReviewSearchFilters {
  if (privileged) return filters;
  const own = viewerId !== undefined && filters.userId === viewerId;
  const { reportCount: _dropped, ...rest } = filters;
  void _dropped;
  return { ...rest, ...(own ? {} : { status: ReviewStatus.APPROVED }) };
}

const MAX_REVIEW_PAGE_SIZE = 100;

export interface ReviewSearchResult {
  reviews: any[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats?: {
    averageRating: number;
    ratingDistribution: Record<number, number>;
    totalVerified: number;
    totalWithComments: number;
    totalWithReplies: number;
  };
  facets?: {
    ratings: Array<{ value: number; count: number }>;
    statuses: Array<{ value: ReviewStatus; count: number }>;
    dateRanges: Array<{ label: string; count: number }>;
  };
}

/**
 * The review search could not be answered (database down, schema drift, ...).
 * The original error is kept as `cause` for diagnostics; its message may embed
 * query details, so callers must not log it verbatim.
 */
export class ReviewSearchUnavailableError extends Error {
  readonly code: string | undefined;

  constructor(cause: unknown) {
    super("Review search is temporarily unavailable", { cause });
    this.name = "ReviewSearchUnavailableError";
    this.code =
      cause && typeof cause === "object" && "code" in cause
        ? String((cause as { code?: unknown }).code)
        : undefined;
  }
}

export class ReviewSearchService {
  /**
   * Search reviews with advanced filtering and sorting
   */
  static async searchReviews(
    filters: ReviewSearchFilters,
    options: ReviewSearchOptions = {},
  ): Promise<ReviewSearchResult> {
    const {
      sortBy = "newest",
      includeStats = false,
      includeReplies = true,
      includeVotes = true,
      privileged = false,
      viewerId,
    } = options;
    // Paging comes from a query string: negative, fractional or huge values are brought back into range
    const page = Math.min(10_000, Math.max(1, Math.floor(Number(options.page)) || 1));
    const limit = Math.min(MAX_REVIEW_PAGE_SIZE, Math.max(1, Math.floor(Number(options.limit)) || 20));

    try {
      const scoped = scopeReviewFilters(filters, { privileged, viewerId });
      // Build where clause
      const where = this.buildWhereClause(scoped);

      // Build order clause
      const orderBy = this.buildOrderClause(sortBy, filters.search);

      // Get total count
      const totalCount = await db.review.count({ where });

      // Get reviews
      const reviews = await db.review.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          // The public only gets its own vote (to show "you found this helpful"); the voters are moderation data
          ...(includeVotes &&
            (privileged
              ? { votes: { select: { id: true, userId: true, helpful: true } } }
              : viewerId
                ? { votes: { where: { userId: viewerId }, select: { id: true, helpful: true } } }
                : {})),
          ...(includeReplies && {
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    role: true,
                  },
                },
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          }),
          _count: {
            select: {
              votes: true,
              replies: true,
              ...(privileged && { reports: true }),
            },
          },
        },
      });

      // Calculate pagination
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const result: ReviewSearchResult = {
        reviews,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      };

      // Add stats if requested
      if (includeStats) {
        result.stats = await this.getSearchStats(where);
      }

      // Add facets for filtering UI
      if (scoped.courseId) {
        result.facets = await this.getFacets(scoped, privileged);
      }

      return result;
    } catch (error) {
      // An empty result must mean "no review matches", never "the query failed":
      // callers decide how to degrade (503 for the API, a banner for admin pages).
      throw new ReviewSearchUnavailableError(error);
    }
  }

  /**
   * Get reviews for a specific course with optimized caching
   */
  static getCourseReviews = cache(
    async (
      courseId: string,
      options: ReviewSearchOptions = {},
    ): Promise<ReviewSearchResult> => {
      return this.searchReviews(
        { courseId, status: ReviewStatus.APPROVED },
        options,
      );
    },
  );

  /**
   * Search reviews by text with full-text search
   */
  static async searchByText(
    query: string,
    filters: Omit<ReviewSearchFilters, "search"> = {},
    options: ReviewSearchOptions = {},
  ): Promise<ReviewSearchResult> {
    if (!query.trim()) {
      return this.searchReviews(filters, options);
    }

    // Use PostgreSQL full-text search if available, otherwise fall back to LIKE
    const searchFilters: ReviewSearchFilters = {
      ...filters,
      search: query.trim(),
    };

    return this.searchReviews(searchFilters, {
      ...options,
      sortBy: "relevance",
    });
  }

  /**
   * Get trending reviews (high engagement)
   */
  static async getTrendingReviews(
    filters: ReviewSearchFilters = {},
    options: ReviewSearchOptions = {},
  ): Promise<ReviewSearchResult> {
    const trendingFilters: ReviewSearchFilters = {
      ...filters,
      status: ReviewStatus.APPROVED,
      minHelpfulVotes: 1,
    };

    return this.searchReviews(trendingFilters, {
      ...options,
      sortBy: "helpful",
      includeStats: true,
    });
  }

  /**
   * Get reviews needing moderation
   */
  static async getModerationQueue(
    filters: ReviewSearchFilters = {},
    options: ReviewSearchOptions = {},
  ): Promise<ReviewSearchResult> {
    const moderationFilters: ReviewSearchFilters = {
      ...filters,
      status: [ReviewStatus.PENDING],
    };

    // Callers are the moderation page and route, which check the role (and scope instructors to their courses) first
    return this.searchReviews(moderationFilters, {
      ...options,
      privileged: true,
      sortBy: "oldest",
      includeStats: true,
    });
  }

  /**
   * Build Prisma where clause from filters
   */
  private static buildWhereClause(
    filters: ReviewSearchFilters,
  ): Prisma.ReviewWhereInput {
    const where: Prisma.ReviewWhereInput = {};

    // Course filter
    if (filters.courseId) {
      where.courseId = filters.courseId;
    }

    // Text search
    if (filters.search) {
      const searchTerm = filters.search.trim();
      where.OR = [
        {
          comment: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          course: {
            title: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // Rating filter
    if (filters.rating !== undefined) {
      if (Array.isArray(filters.rating)) {
        where.rating = { in: filters.rating };
      } else {
        where.rating = filters.rating;
      }
    }

    // Status filter
    if (filters.status !== undefined) {
      if (Array.isArray(filters.status)) {
        where.status = { in: filters.status };
      } else {
        where.status = filters.status;
      }
    }

    // Verified filter
    if (filters.verified !== undefined) {
      where.verified = filters.verified;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    // Comment filter
    if (filters.hasComment !== undefined) {
      if (filters.hasComment) {
        where.comment = { not: null };
      } else {
        where.comment = null;
      }
    }

    // Replies filter
    if (filters.hasReplies !== undefined) {
      if (filters.hasReplies) {
        where.replies = { some: {} };
      } else {
        where.replies = { none: {} };
      }
    }

    // Helpful votes filter
    if (filters.minHelpfulVotes !== undefined) {
      where.helpfulCount = { gte: filters.minHelpfulVotes };
    }

    // User filter
    if (filters.userId) {
      where.userId = filters.userId;
    }

    // Instructor filter (for instructor's course reviews)
    if (filters.instructorId) {
      where.course = {
        instructorId: filters.instructorId,
      };
    }

    // Report count filter
    if (filters.reportCount) {
      where.reportCount = {};
      if (filters.reportCount.min !== undefined) {
        where.reportCount.gte = filters.reportCount.min;
      }
      if (filters.reportCount.max !== undefined) {
        where.reportCount.lte = filters.reportCount.max;
      }
    }

    return where;
  }

  /**
   * Build Prisma order clause from sort option
   */
  private static buildOrderClause(
    sortBy: string,
    hasSearch?: string,
  ): Prisma.ReviewOrderByWithRelationInput[] {
    switch (sortBy) {
      case "oldest":
        return [{ createdAt: "asc" }];

      case "helpful":
        return [{ helpfulCount: "desc" }, { createdAt: "desc" }];

      case "rating_high":
        return [{ rating: "desc" }, { createdAt: "desc" }];

      case "rating_low":
        return [{ rating: "asc" }, { createdAt: "desc" }];

      case "relevance":
        if (hasSearch) {
          // For text search, prioritize verified reviews and helpful votes
          return [
            { verified: "desc" },
            { helpfulCount: "desc" },
            { createdAt: "desc" },
          ];
        }
        return [{ createdAt: "desc" }];

      case "newest":
      default:
        return [{ createdAt: "desc" }];
    }
  }

  /**
   * Get statistics for search results
   */
  private static async getSearchStats(where: Prisma.ReviewWhereInput) {
    const [ratingStats, verifiedCount, commentCount, replyCount] =
      await Promise.all([
        // Rating statistics
        db.review.groupBy({
          by: ["rating"],
          where,
          _count: { rating: true },
          _avg: { rating: true },
        }),

        // Verified count
        db.review.count({
          where: { ...where, verified: true },
        }),

        // Comment count
        db.review.count({
          where: { ...where, comment: { not: null } },
        }),

        // Reply count
        db.review.count({
          where: { ...where, replies: { some: {} } },
        }),
      ]);

    const ratingDistribution: Record<number, number> = {};
    let totalRatings = 0;
    let sumRatings = 0;

    ratingStats.forEach((stat) => {
      ratingDistribution[stat.rating] = stat._count.rating;
      totalRatings += stat._count.rating;
      sumRatings += stat.rating * stat._count.rating;
    });

    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    return {
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
      totalVerified: verifiedCount,
      totalWithComments: commentCount,
      totalWithReplies: replyCount,
    };
  }

  /**
   * Get facets for filtering UI
   */
  private static async getFacets(filters: ReviewSearchFilters, privileged: boolean) {
    // The public sees counts of approved reviews only: other statuses would reveal what was hidden
    const baseWhere = this.buildWhereClause({
      courseId: filters.courseId,
      ...(privileged ? {} : { status: ReviewStatus.APPROVED }),
    });

    const [ratingFacets, statusFacets, dateRangeFacets] = await Promise.all([
      // Rating facets
      db.review.groupBy({
        by: ["rating"],
        where: baseWhere,
        _count: { rating: true },
        orderBy: { rating: "desc" },
      }),

      // Status facets
      db.review.groupBy({
        by: ["status"],
        where: baseWhere,
        _count: { status: true },
      }),

      // Date range facets (last 30 days, last 3 months, etc.)
      this.getDateRangeFacets(baseWhere),
    ]);

    return {
      ratings: ratingFacets.map((facet) => ({
        value: facet.rating,
        count: facet._count.rating,
      })),
      statuses: privileged
        ? statusFacets.map((facet) => ({
            value: facet.status,
            count: facet._count.status,
          }))
        : statusFacets
            .filter((facet) => facet.status === ReviewStatus.APPROVED)
            .map((facet) => ({ value: facet.status, count: facet._count.status })),
      dateRanges: dateRangeFacets,
    };
  }

  /**
   * Get date range facets
   */
  private static async getDateRangeFacets(baseWhere: Prisma.ReviewWhereInput) {
    const now = new Date();
    const ranges = [
      { label: "Dernières 24h", days: 1 },
      { label: "Dernière semaine", days: 7 },
      { label: "Dernier mois", days: 30 },
      { label: "Derniers 3 mois", days: 90 },
      { label: "Dernière année", days: 365 },
    ];

    const counts = await Promise.all(
      ranges.map((range) => {
        const dateFrom = new Date(
          now.getTime() - range.days * 24 * 60 * 60 * 1000,
        );
        return db.review.count({
          where: {
            ...baseWhere,
            createdAt: { gte: dateFrom },
          },
        });
      }),
    );

    return ranges.map((range, index) => ({
      label: range.label,
      count: counts[index],
    }));
  }
}
