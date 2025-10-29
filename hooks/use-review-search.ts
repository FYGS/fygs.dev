import { useState, useEffect, useCallback } from "react";
import { ReviewFilters } from "@/components/reviews/review-filters";

interface UseReviewSearchOptions {
  courseId?: string;
  initialFilters?: ReviewFilters;
  autoSearch?: boolean;
}

interface ReviewSearchHookResult {
  reviews: any[];
  loading: boolean;
  error: string | null;
  filters: ReviewFilters;
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
    statuses: Array<{ value: string; count: number }>;
    dateRanges: Array<{ label: string; count: number }>;
  };
  setFilters: (filters: ReviewFilters) => void;
  updateFilter: (key: keyof ReviewFilters, value: any) => void;
  search: (query?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export function useReviewSearch({
  courseId,
  initialFilters = {},
  autoSearch = true,
}: UseReviewSearchOptions = {}): ReviewSearchHookResult {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ReviewFilters>({
    sortBy: "newest",
    ...initialFilters,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [stats, setStats] = useState<any>(undefined);
  const [facets, setFacets] = useState<any>(undefined);

  const buildSearchParams = useCallback(
    (searchFilters: ReviewFilters, page = 1) => {
      const params = new URLSearchParams();

      if (courseId) params.set("courseId", courseId);
      if (searchFilters.search) params.set("search", searchFilters.search);
      if (searchFilters.rating && searchFilters.rating.length > 0) {
        params.set("rating", searchFilters.rating.join(","));
      }
      if (searchFilters.verified !== undefined) {
        params.set("verified", searchFilters.verified.toString());
      }
      if (searchFilters.hasComment !== undefined) {
        params.set("hasComment", searchFilters.hasComment.toString());
      }
      if (searchFilters.hasReplies !== undefined) {
        params.set("hasReplies", searchFilters.hasReplies.toString());
      }
      if (searchFilters.minHelpfulVotes !== undefined) {
        params.set("minHelpfulVotes", searchFilters.minHelpfulVotes.toString());
      }
      if (searchFilters.dateFrom) {
        params.set("dateFrom", searchFilters.dateFrom.toISOString());
      }
      if (searchFilters.dateTo) {
        params.set("dateTo", searchFilters.dateTo.toISOString());
      }
      if (searchFilters.sortBy) {
        params.set("sortBy", searchFilters.sortBy);
      }

      params.set("page", page.toString());
      params.set("limit", pagination.limit.toString());
      params.set("includeStats", "true");

      return params;
    },
    [courseId, pagination.limit]
  );

  const performSearch = useCallback(
    async (searchFilters: ReviewFilters, page = 1, append = false) => {
      if (!courseId && !searchFilters.search) return;

      setLoading(true);
      setError(null);

      try {
        const params = buildSearchParams(searchFilters, page);
        const endpoint = searchFilters.search
          ? "/api/reviews/search"
          : "/api/reviews";

        if (searchFilters.search) {
          params.set("q", searchFilters.search);
        }

        const response = await fetch(`${endpoint}?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erreur lors de la recherche");
        }

        if (append) {
          setReviews((prev) => [...prev, ...data.reviews]);
        } else {
          setReviews(data.reviews);
        }

        setPagination(data.pagination);

        if (data.stats) {
          setStats(data.stats);
        }

        if (data.facets) {
          setFacets(data.facets);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
        console.error("Review search error:", err);
      } finally {
        setLoading(false);
      }
    },
    [courseId, buildSearchParams]
  );

  // Auto-search on filter changes
  useEffect(() => {
    if (autoSearch) {
      performSearch(filters, 1, false);
    }
  }, [filters, autoSearch, performSearch]);

  const setFilters = useCallback((newFilters: ReviewFilters) => {
    setFiltersState(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const updateFilter = useCallback(
    (key: keyof ReviewFilters, value: any) => {
      setFilters({ ...filters, [key]: value });
    },
    [filters, setFilters]
  );

  const search = useCallback(
    async (query?: string) => {
      const searchFilters =
        query !== undefined ? { ...filters, search: query } : filters;
      await performSearch(searchFilters, 1, false);
    },
    [filters, performSearch]
  );

  const loadMore = useCallback(async () => {
    if (!pagination.hasNextPage || loading) return;
    await performSearch(filters, pagination.page + 1, true);
  }, [
    filters,
    pagination.hasNextPage,
    pagination.page,
    loading,
    performSearch,
  ]);

  const refresh = useCallback(async () => {
    await performSearch(filters, 1, false);
  }, [filters, performSearch]);

  const reset = useCallback(() => {
    const defaultFilters = { sortBy: "newest" as const };
    setFilters(defaultFilters);
    setReviews([]);
    setStats(undefined);
    setFacets(undefined);
    setError(null);
  }, [setFilters]);

  return {
    reviews,
    loading,
    error,
    filters,
    pagination,
    stats,
    facets,
    setFilters,
    updateFilter,
    search,
    loadMore,
    refresh,
    reset,
  };
}

// Hook for trending reviews
export function useTrendingReviews(courseId?: string, period: string = "week") {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        period,
        limit: "10",
      });

      if (courseId) {
        params.set("courseId", courseId);
      }

      const response = await fetch(`/api/reviews/trending?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la récupération des avis tendance"
        );
      }

      setReviews(data.reviews);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [courseId, period]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return {
    reviews,
    loading,
    error,
    refresh: fetchTrending,
  };
}

// Hook for moderation queue
export function useModerationQueue() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchModerationQueue = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
          includeFlagged: "true",
        });

        const response = await fetch(`/api/reviews/moderation?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Erreur lors de la récupération de la file de modération"
          );
        }

        setReviews(data.reviews);
        setPagination(data.pagination);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit]
  );

  useEffect(() => {
    fetchModerationQueue();
  }, [fetchModerationQueue]);

  const loadPage = useCallback(
    (page: number) => {
      fetchModerationQueue(page);
    },
    [fetchModerationQueue]
  );

  return {
    reviews,
    loading,
    error,
    pagination,
    refresh: () => fetchModerationQueue(pagination.page),
    loadPage,
  };
}
