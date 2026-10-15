"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  MessageCircle, 
  Filter,
  Search,
  TrendingUp,
  CheckCircle
} from "lucide-react";
import { SerializedReview } from "../types";
import { useState, useMemo, useEffect } from "react";
import { submitCourseReview } from "@/app/actions/learning";
import { reportReview, getReviewReplies, getReviewVotes } from "@/app/actions/reviews";
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewList, ReviewData } from "@/components/reviews/review-display";
import { useTrendingReviews } from "@/hooks/use-review-search";
import { ReviewUpdatesProvider, useReviewUpdates } from "@/contexts/review-updates-context";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CourseReviewsProps {
  reviews: SerializedReview[];
  courseId: string;
  canReview?: boolean;
}

type SortOption = "newest" | "oldest" | "rating-high" | "rating-low" | "helpful";
type FilterOption = "all" | "5" | "4" | "3" | "2" | "1" | "verified";

interface ReviewWithInteractions extends SerializedReview {
  helpfulCount?: number;
  userVote?: { helpful: boolean; createdAt: string } | null;
  replies?: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string; image?: string; role?: string };
  }>;
  showReplies?: boolean;
  replyText?: string;
}

interface ReportDialogData {
  reviewId: string;
  reason: string;
  description: string;
}

export function CourseReviews({ 
  reviews: initialReviews, 
  courseId, 
  canReview = false 
}: CourseReviewsProps) {
  return (
    <ReviewUpdatesProvider>
      <CourseReviewsContent 
        reviews={initialReviews}
        courseId={courseId}
        canReview={canReview}
      />
    </ReviewUpdatesProvider>
  );
}

function CourseReviewsContent({ 
  reviews: initialReviews, 
  courseId, 
  canReview = false 
}: CourseReviewsProps) {
  const [reviews, setReviews] = useState<ReviewWithInteractions[]>(
    initialReviews.map(r => ({ ...r, showReplies: false, replyText: "" }))
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reportDialog, setReportDialog] = useState<ReportDialogData | null>(null);

  // Use the review updates context  
  const { subscribeToUpdates } = useReviewUpdates();

  // Subscribe to updates for all reviews
  useEffect(() => {
    const unsubscribeFunctions = reviews.map(review => 
      subscribeToUpdates(review.id, (update) => {
        if (update.type === 'reply_added') {
          setReviews(prevReviews => 
            prevReviews.map(r => 
              r.id === update.reviewId 
                ? { 
                    ...r, 
                    replies: [...(r.replies || []), {
                      id: update.data.id,
                      content: update.data.content,
                      createdAt: update.data.createdAt,
                      user: update.data.author || update.data.user,
                    }]
                  }
                : r
            )
          );
        } else if (update.type === 'vote_updated') {
          setReviews(prevReviews => 
            prevReviews.map(r => 
              r.id === update.reviewId 
                ? { 
                    ...r, 
                    helpfulCount: update.data.helpful || r.helpfulCount,
                    userVote: update.data.userVote || r.userVote
                  }
                : r
            )
          );
        }
      })
    );

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [reviews, subscribeToUpdates]);

  // Use trending reviews hook
  const { 
    reviews: trendingReviews, 
    loading: trendingLoading 
  } = useTrendingReviews(courseId, "week");

  // Transform SerializedReview to ReviewData format for ReviewList component
  const transformToReviewData = (review: ReviewWithInteractions): ReviewData => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment || "",
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    isModerated: true, // Assuming published reviews are moderated
    isFlagged: false,  // We don't have this info in SerializedReview
    status: "PUBLISHED" as const,
    user: {
      id: review.userId,
      name: review.user.name,
      image: review.user.image,
    },
    votes: {
      helpful: review.helpfulCount || 0,
      unhelpful: 0, // We don't track unhelpful separately
      userVote: review.userVote,
    },
    replies: review.replies?.map(reply => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt,
      author: {
        id: reply.user.id,
        name: reply.user.name,
        avatar: reply.user.image || null,
        role: (reply.user.role as "STUDENT" | "INSTRUCTOR" | "ADMIN") || "STUDENT",
      },
      isInstructorReply: reply.user.role === "INSTRUCTOR",
    })) || [],
    helpfulCount: review.helpfulCount,
    canReply: canReview,
    canReport: true,
  });

  // Load vote data and replies for reviews on mount only
  useEffect(() => {
    const loadReviewData = async () => {
      const updatedReviews = await Promise.all(
        reviews.map(async (review) => {
          try {
            // Get vote data
            const voteResult = await getReviewVotes(review.id);
            const votesData = voteResult.success ? voteResult.data : {};
            
            // Get replies
            const repliesResult = await getReviewReplies(review.id);
            const repliesData = repliesResult.success ? repliesResult.data : [];

            return {
              ...review,
              helpfulCount: votesData.helpful || 0,
              userVote: votesData.userVote || null,
              replies: repliesData,
            };
          } catch (err) {
            console.error(`Error loading data for review ${review.id}:`, err);
            return review;
          }
        })
      );
      setReviews(updatedReviews);
    };

    if (reviews.length > 0) {
      loadReviewData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute statistics
  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        verifiedCount: 0,
      };
    }

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews;
    const ratingDistribution = reviews.reduce((acc, review) => {
      acc[review.rating as keyof typeof acc] = (acc[review.rating as keyof typeof acc] || 0) + 1;
      return acc;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    
    const verifiedCount = reviews.filter(r => (r as any).verified).length;

    return {
      averageRating,
      totalReviews,
      ratingDistribution,
      verifiedCount,
    };
  }, [reviews]);

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = reviews;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(review => 
        review.comment?.toLowerCase().includes(query) ||
        review.user.name?.toLowerCase().includes(query)
      );
    }

    // Apply rating filter
    if (filterBy !== "all") {
      if (filterBy === "verified") {
        filtered = filtered.filter(review => (review as any).verified);
      } else {
        const ratingFilter = parseInt(filterBy);
        filtered = filtered.filter(review => review.rating === ratingFilter);
      }
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "rating-high":
          return b.rating - a.rating;
        case "rating-low":
          return a.rating - b.rating;
        case "helpful":
          return (b.helpfulCount || 0) - (a.helpfulCount || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [reviews, searchQuery, filterBy, sortBy]);

  const handleReport = async () => {
    if (!reportDialog) return;

    try {
      const result = await reportReview(reportDialog.reviewId, reportDialog.reason, reportDialog.description);
      
      if (result.success) {
        toast.success("Avis signalé avec succès");
        setReportDialog(null);
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      console.error("Report error:", err);
      toast.error("Erreur lors du signalement");
    }
  };

  const renderStars = (rating: number, size = "h-4 w-4") => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          size,
          i < rating 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        )}
      />
    ));
  };

  const renderRatingDistribution = () => {
    const maxCount = Math.max(...Object.values(stats.ratingDistribution));
    
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 w-12">
                <span className="text-xs">{rating}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                <div 
                  className="bg-yellow-400 h-2 rounded-full" 
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-12 text-right">
                {count} ({percentage.toFixed(0)}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (reviews.length === 0 && !canReview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Avis des étudiants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun avis pour le moment</h3>
            <p className="text-muted-foreground">
              Soyez le premier à partager votre expérience avec cette formation !
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Statistics - Show even when no reviews if user can review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Avis des étudiants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Rating */}
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center">
                    {renderStars(Math.round(stats.averageRating))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Basé sur {stats.totalReviews} avis
                  </p>
                  {stats.verifiedCount > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {stats.verifiedCount} avis vérifiés
                    </Badge>
                  )}
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Répartition des notes</h4>
                {renderRatingDistribution()}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucun avis pour le moment</h3>
              <p className="text-muted-foreground">
                Soyez le premier à partager votre expérience avec cette formation !
              </p>
            </div>
          )}

          {/* Quick Actions */}
          {canReview && (
            <div className="pt-4 border-t">
              <Button 
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="w-full"
                variant={showReviewForm ? "outline" : "default"}
              >
                {showReviewForm ? "Annuler" : "Écrire un avis"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending Reviews Section */}
      {trendingReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Avis tendance cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendingLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Chargement...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trendingReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating, "h-3 w-3")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{review.user?.name || "Utilisateur"}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {review.comment || "Avis sans commentaire"}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {review.helpfulCount || 0} utile{(review.helpfulCount || 0) !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Submission Form */}
      {canReview && showReviewForm && (
        <ReviewForm
          courseId={courseId}
          onSubmit={async (data) => {
            const fd = new FormData();
            fd.append('courseId', courseId);
            fd.append('rating', String(data.rating));
            if (data.comment.trim()) fd.append('comment', data.comment.trim());
            
            try {
              const res = await submitCourseReview(fd);
              if (res?.ok) {
                toast.success('Avis enregistré avec succès!');
                // Optimistic update
                const newReview: ReviewWithInteractions = {
                  id: `temp-${Date.now()}`,
                  userId: 'me',
                  courseId,
                  rating: data.rating,
                  comment: data.comment.trim() || "",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  user: { name: 'Vous', image: null },
                  showReplies: false,
                  replyText: ""
                };
                setReviews(prev => [newReview, ...prev]);
                setShowReviewForm(false);
              } else {
                throw new Error((res as any)?.error || 'Erreur inconnue');
              }
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Erreur réseau');
            }
          }}
          className="w-full"
        />
      )}

      {/* Filters and Search */}
      {reviews.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher dans les avis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="5">5 étoiles</SelectItem>
                    <SelectItem value="4">4 étoiles</SelectItem>
                    <SelectItem value="3">3 étoiles</SelectItem>
                    <SelectItem value="2">2 étoiles</SelectItem>
                    <SelectItem value="1">1 étoile</SelectItem>
                    <SelectItem value="verified">Vérifiés</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Plus récents</SelectItem>
                    <SelectItem value="oldest">Plus anciens</SelectItem>
                    <SelectItem value="rating-high">Note ↑</SelectItem>
                    <SelectItem value="rating-low">Note ↓</SelectItem>
                    <SelectItem value="helpful">Plus utiles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(searchQuery || filterBy !== "all") && (
              <div className="mt-4 text-sm text-muted-foreground">
                {filteredAndSortedReviews.length} avis trouvé(s)
                {searchQuery && ` pour "${searchQuery}"`}
                {filterBy !== "all" && ` (filtre: ${filterBy})`}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {filteredAndSortedReviews.length > 0 ? (
        <ReviewList
          reviews={filteredAndSortedReviews.map(transformToReviewData)}
          loading={false}
          emptyMessage="Aucun avis pour le moment"
          canVote={true}
          canReply={true}
          canReport={true}
          showActions={true}
          compact={false}
        />
      ) : reviews.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun avis trouvé</h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche ou de filtrage.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Report Dialog */}
      <Dialog open={!!reportDialog} onOpenChange={() => setReportDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signaler cet avis</DialogTitle>
            <DialogDescription>
              Dites-nous pourquoi cet avis ne respecte pas nos conditions d&apos;utilisation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Raison du signalement</label>
              <Select
                value={reportDialog?.reason || ""}
                onValueChange={(value) => setReportDialog(prev => 
                  prev ? { ...prev, reason: value } : null
                )}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une raison" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="inappropriate">Contenu inapproprié</SelectItem>
                  <SelectItem value="fake">Faux avis</SelectItem>
                  <SelectItem value="harassment">Harcèlement</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optionnel)</label>
              <Textarea
                placeholder="Décrivez le problème..."
                value={reportDialog?.description || ""}
                onChange={(e) => setReportDialog(prev => 
                  prev ? { ...prev, description: e.target.value } : null
                )}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialog(null)}>
              Annuler
            </Button>
            <Button 
              onClick={handleReport}
              disabled={!reportDialog?.reason}
            >
              Signaler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
