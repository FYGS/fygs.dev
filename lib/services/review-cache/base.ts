import { RedisClient } from "@/lib/redis";

/** Shared Redis access, TTL configuration and key prefixes. */
export class ReviewCacheBase {
  protected static get redis() {
    return RedisClient.getInstance();
  }

  // Cache TTL configurations (in seconds)
  protected static readonly CACHE_TTL = {
    REVIEW_DETAILS: 3600, // 1 hour
    REVIEW_LIST: 1800, // 30 minutes
    COURSE_REVIEWS: 1800, // 30 minutes
    USER_REVIEWS: 3600, // 1 hour
    REVIEW_STATS: 7200, // 2 hours
    SEARCH_RESULTS: 900, // 15 minutes
    POPULAR_REVIEWS: 14400, // 4 hours
    RECENT_REVIEWS: 600, // 10 minutes
  };

  // Cache key prefixes
  protected static readonly CACHE_KEYS = {
    REVIEW: "review:",
    COURSE_REVIEWS: "course_reviews:",
    USER_REVIEWS: "user_reviews:",
    REVIEW_STATS: "review_stats:",
    SEARCH: "review_search:",
    POPULAR: "popular_reviews:",
    RECENT: "recent_reviews:",
    ANALYTICS: "review_analytics:",
  };
}
