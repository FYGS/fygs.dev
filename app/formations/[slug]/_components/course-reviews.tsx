"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { SerializedReview } from "../types";
import { useState, useTransition } from "react";
import { submitCourseReview } from "@/lib/actions/learning";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CourseReviewsProps {
  reviews: SerializedReview[];
  courseId: string;
  canReview?: boolean; // Provided by server if user has access
}

export function CourseReviews({ reviews: initialReviews, courseId, canReview = false }: CourseReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = () => {
    const fd = new FormData();
    fd.append('courseId', courseId);
    fd.append('rating', String(rating));
    if (comment.trim()) fd.append('comment', comment.trim());
    startTransition(() => {
      submitCourseReview(fd).then(res => {
        if (res?.ok) {
          toast.success('Avis enregistré');
          // Optimistic: append placeholder (real revalidation will replace)
          setReviews(prev => [
            {
              id: `temp-${Date.now()}`,
              userId: 'me',
              courseId,
              rating,
              comment: comment.trim() || null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              user: { name: 'Vous', image: null }
            } as SerializedReview,
            ...prev,
          ]);
          setComment("");
        } else {
          toast.error("Échec de l'envoi", { description: (res as any)?.error || 'Erreur inconnue' });
        }
      }).catch(() => toast.error('Erreur réseau'));
    });
  };
  if (reviews.length === 0 && !canReview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Avis des étudiants</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Aucun avis pour le moment. Soyez le premier à laisser un avis !
          </p>
        </CardContent>
      </Card>
    );
  }

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between w-full">
          <span>Avis des étudiants</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(Math.round(averageRating))}</div>
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} ({reviews.length} avis)
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {canReview && (
          <div className="space-y-3 border rounded-md p-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Votre évaluation :</span>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="p-1"
                  >
                    <Star className={`h-5 w-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Partagez votre retour sur cette formation..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[90px] resize-y"
            />
            <div className="flex justify-end">
              <Button onClick={onSubmit} disabled={isPending || rating < 1}>
                {isPending ? 'Envoi...' : 'Publier mon avis'}
              </Button>
            </div>
          </div>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="space-y-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.user.image || undefined} />
                <AvatarFallback>
                  {review.user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {review.user.name || "Utilisateur anonyme"}
                    </p>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            </div>
            {reviews.indexOf(review) < reviews.length - 1 && (
              <div className="border-b" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
