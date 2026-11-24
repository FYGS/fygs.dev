"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageCircle, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewList, type ReviewData } from "@/components/reviews/review-display";
import { ReviewUpdatesProvider } from "@/contexts/review-updates-context";
import { loadCourseReviews, submitCourseReview } from "@/app/actions/learning";
import type { OwnReview, ReviewSort, ReviewSummary } from "@/lib/reviews/course-reviews";
import { cn } from "@/lib/utils";

interface CourseReviewsProps {
  courseId: string;
  summary: ReviewSummary;
  initialReviews: ReviewData[];
  initialHasMore: boolean;
  /** Follows the course with a real right: may write a review. */
  canReview: boolean;
  /** Author of the course or administrator: may answer reviews. */
  canAnswer: boolean;
  signedIn: boolean;
  ownReview: OwnReview | null;
}

const SORT_LABELS: Record<ReviewSort, string> = {
  recent: "Plus récents",
  helpful: "Plus utiles",
  best: "Meilleures notes",
  worst: "Notes les plus basses",
};

const OWN_STATUS: Record<OwnReview["status"], string> = {
  APPROVED: "Publié",
  PENDING: "En attente de relecture",
  REJECTED: "Non publié",
  FLAGGED: "En cours de vérification",
};

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className="flex" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn(className ?? "h-4 w-4", i < rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40")} />
      ))}
    </span>
  );
}

export function CourseReviews(props: CourseReviewsProps) {
  return (
    <ReviewUpdatesProvider>
      <CourseReviewsContent {...props} />
    </ReviewUpdatesProvider>
  );
}

function CourseReviewsContent({
  courseId,
  summary,
  initialReviews,
  initialHasMore,
  canReview,
  canAnswer,
  signedIn,
  ownReview,
}: CourseReviewsProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [sort, setSort] = useState<ReviewSort>("recent");
  const [rating, setRating] = useState<number | null>(null);
  const [writing, setWriting] = useState(false);
  const [loading, startLoading] = useTransition();

  const reload = (next: { sort?: ReviewSort; rating?: number | null; append?: boolean }) =>
    startLoading(async () => {
      const nextSort = next.sort ?? sort;
      const nextRating = next.rating === undefined ? rating : next.rating;
      const page = await loadCourseReviews({
        courseId,
        sort: nextSort,
        rating: nextRating,
        offset: next.append ? reviews.length : 0,
      });
      setReviews((current) => (next.append ? [...current, ...page.reviews] : page.reviews));
      setHasMore(page.hasMore);
    });

  const submit = async (data: { rating: number; comment: string }) => {
    const result = await submitCourseReview({ courseId, rating: data.rating, comment: data.comment });
    if (!result.ok) {
      toast.error("Avis non enregistré", { description: result.message });
      return;
    }
    toast.success(result.message);
    setWriting(false);
    router.refresh();
  };

  const max = Math.max(1, ...Object.values(summary.distribution));

  return (
    <section aria-labelledby="reviews-heading" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle as="h2" id="reviews-heading" className="flex items-center gap-2 text-xl">
            <Star className="h-5 w-5 fill-amber-500 text-amber-500" aria-hidden />
            Avis des apprenants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {summary.count > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 text-center">
                <p className="text-4xl font-bold">{summary.average.toFixed(1).replace(".", ",")}</p>
                <div className="flex justify-center">
                  <Stars rating={Math.round(summary.average)} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {summary.count} avis · note moyenne {summary.average.toFixed(1).replace(".", ",")} sur 5
                </p>
              </div>
              <ul className="space-y-2" aria-label="Répartition des notes">
                {([5, 4, 3, 2, 1] as const).map((value) => {
                  const count = summary.distribution[value];
                  return (
                    <li key={value} className="flex items-center gap-2 text-sm">
                      <span className="w-14 shrink-0">
                        {value} étoile{value > 1 ? "s" : ""}
                      </span>
                      <span className="relative h-2 flex-1 rounded-full bg-muted" aria-hidden>
                        <span className="absolute inset-y-0 left-0 rounded-full bg-amber-500" style={{ width: `${(count / max) * 100}%` }} />
                      </span>
                      <span className="w-10 shrink-0 text-right text-muted-foreground">{count}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="py-6 text-center">
              <MessageCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden />
              <p className="font-medium">Aucun avis pour le moment</p>
              <p className="text-sm text-muted-foreground">
                {canReview ? "Partagez votre expérience : votre avis aide les autres apprenants." : "Les avis des apprenants apparaîtront ici."}
              </p>
            </div>
          )}

          {ownReview && !writing && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border p-4">
              <div className="min-w-0 flex-1 space-y-1">
                {/* a div, not a p: Badge renders a div, which a p cannot hold (the server HTML would not hydrate) */}
                <div className="flex flex-wrap items-center gap-2 font-medium">
                  Votre avis <Stars rating={ownReview.rating} className="h-3.5 w-3.5" />
                  <span className="sr-only">{ownReview.rating} sur 5</span>
                  <Badge variant="secondary">{OWN_STATUS[ownReview.status]}</Badge>
                </div>
                {ownReview.comment && <p className="line-clamp-2 text-sm text-muted-foreground">{ownReview.comment}</p>}
              </div>
              {canReview && (
                <Button variant="outline" size="sm" onClick={() => setWriting(true)}>
                  Modifier mon avis
                </Button>
              )}
            </div>
          )}

          {canReview && !ownReview && !writing && (
            <Button className="w-full" onClick={() => setWriting(true)}>
              Écrire un avis
            </Button>
          )}
          {!canReview && !ownReview && signedIn && summary.count > 0 && (
            <p className="text-sm text-muted-foreground">Suivez la formation pour pouvoir laisser un avis.</p>
          )}
        </CardContent>
      </Card>

      {writing && (
        <div className="space-y-2">
          <ReviewForm existingReview={ownReview ?? undefined} onSubmit={submit} />
          <Button variant="ghost" onClick={() => setWriting(false)}>
            Annuler
          </Button>
        </div>
      )}

      {summary.count > 0 && (
        <>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label htmlFor="reviews-sort">Trier</Label>
              <Select
                value={sort}
                onValueChange={(value) => {
                  setSort(value as ReviewSort);
                  reload({ sort: value as ReviewSort });
                }}
              >
                <SelectTrigger id="reviews-sort" className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SORT_LABELS) as ReviewSort[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {SORT_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="reviews-rating">Note</Label>
              <Select
                value={rating ? String(rating) : "all"}
                onValueChange={(value) => {
                  const next = value === "all" ? null : Number(value);
                  setRating(next);
                  reload({ rating: next });
                }}
              >
                <SelectTrigger id="reviews-rating" className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les notes</SelectItem>
                  {[5, 4, 3, 2, 1].map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {value} étoile{value > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {loading && <Loader2 className="mb-2 h-5 w-5 animate-spin text-muted-foreground" aria-label="Chargement des avis" />}
          </div>

          <div aria-live="polite" aria-busy={loading}>
            <ReviewList
              reviews={reviews}
              emptyMessage="Aucun avis avec cette note."
              canVote={signedIn}
              canReply={canAnswer}
              canReport={signedIn}
              isInstructor={canAnswer}
            />
          </div>

          {hasMore && (
            <div className="text-center">
              <Button variant="outline" onClick={() => reload({ append: true })} disabled={loading}>
                Afficher plus d’avis
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
