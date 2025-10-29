"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  TrendingUp, 
  BarChart3, 
  Users, 
  MessageSquare,
  Star,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { ReviewFilterPanel, ReviewFilters } from "./review-filters";
import { ReviewList } from "./review-display";
import { useReviewSearch } from "@/hooks/use-review-search";
import { cn } from "@/lib/utils";

interface ReviewSearchPageProps {
  courseId?: string;
  initialFilters?: ReviewFilters;
  showStats?: boolean;
  showFacets?: boolean;
  className?: string;
}

export function ReviewSearchPage({
  courseId,
  initialFilters,
  showStats = true,
  showFacets = true,
  className
}: ReviewSearchPageProps) {
  const {
    reviews,
    loading,
    error,
    filters,
    pagination,
    stats,
    facets,
    setFilters,
    search,
    loadMore,
    refresh,
    reset
  } = useReviewSearch({
    courseId,
    initialFilters,
    autoSearch: true,
  });

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await loadMore();
    setIsLoadingMore(false);
  };

  const handleSearch = async (query: string) => {
    await search(query);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recherche et filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewFilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
            facets={showFacets ? facets : undefined}
          />
        </CardContent>
      </Card>

      {/* Statistics */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Note moyenne</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalVerified}</p>
                  <p className="text-xs text-muted-foreground">Utilisateurs vérifiés</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalWithComments}</p>
                  <p className="text-xs text-muted-foreground">Avec commentaires</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalWithReplies}</p>
                  <p className="text-xs text-muted-foreground">Avec réponses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rating Distribution */}
      {showStats && stats && Object.keys(stats.ratingDistribution).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribution des notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating] || 0;
                const total = Object.values(stats.ratingDistribution).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground w-16 text-right">
                      {count} ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {loading && pagination.totalCount === 0 ? (
              "Recherche en cours..."
            ) : (
              `${pagination.totalCount} avis trouvé${pagination.totalCount !== 1 ? 's' : ''}`
            )}
          </h2>
          
          {filters.search && (
            <Badge variant="outline">
              Recherche: &quot;{filters.search}&quot;
            </Badge>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="ml-2"
            >
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && reviews.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Chargement des avis...</span>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && reviews.length === 0 && !error && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun avis trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Essayez de modifier vos critères de recherche ou de supprimer certains filtres.
            </p>
            <Button onClick={reset} variant="outline">
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      )}

      {reviews.length > 0 && (
        <>
          <ReviewList
            reviews={reviews}
            loading={false}
            canVote={true}
            canReply={false}
            canReport={true}
          />

          {/* Load More */}
          {pagination.hasNextPage && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                variant="outline"
                className="gap-2"
              >
                {isLoadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
                {isLoadingMore ? "Chargement..." : "Charger plus"}
              </Button>
            </div>
          )}

          {/* Pagination Info */}
          <div className="text-center text-sm text-muted-foreground">
            Affichage de {reviews.length} sur {pagination.totalCount} avis
            {pagination.totalPages > 1 && (
              <span> • Page {pagination.page} sur {pagination.totalPages}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}