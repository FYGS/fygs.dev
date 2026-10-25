"use client";

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from './star-rating';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Send, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  existingReview?: {
    rating: number;
    comment: string | null;
  };
  /** Saves the review; it reports success and errors itself. */
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
  className?: string;
  disabled?: boolean;
}

export function ReviewForm({ 
  existingReview, 
  onSubmit,
  className,
  disabled = false
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating < 1 || rating > 5) {
      toast.error('Veuillez sélectionner une note entre 1 et 5 étoiles');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Votre commentaire doit contenir au moins 10 caractères');
      return;
    }

    startTransition(async () => {
      await onSubmit({ rating, comment: comment.trim() });
    });
  };

  const getRatingDescription = (rating: number) => {
    const descriptions = {
      1: 'Très décevant',
      2: 'Décevant', 
      3: 'Correct',
      4: 'Très bien',
      5: 'Excellent'
    };
    return descriptions[rating as keyof typeof descriptions] || '';
  };

  const getCommentPlaceholder = (rating: number) => {
    if (rating >= 4) {
      return 'Qu\'avez-vous particulièrement apprécié dans cette formation ? Partagez les points forts qui vous ont marqué...';
    } else if (rating === 3) {
      return 'Cette formation était correcte. Quels sont les points à améliorer selon vous ?';
    } else {
      return 'Nous sommes désolés que cette formation n\'ait pas répondu à vos attentes. Pouvez-vous nous expliquer ce qui pourrait être amélioré ?';
    }
  };

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      {/* Decorative gradient border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500" />
      
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-900/30 to-purple-900/30">
            <MessageSquare className="h-5 w-5 text-blue-400" />
          </div>
          <span>
            {existingReview ? 'Modifier votre avis' : 'Laisser un avis'}
          </span>
          {!existingReview && (
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              Nouveau
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Votre note globale
            </Label>
            <div className="flex items-center gap-4">
              <StarRating
                rating={rating}
                interactive={!disabled}
                size="lg"
                onRatingChange={setRating}
              />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-400">
                  {rating}/5
                </span>
                <span className="text-sm text-muted-foreground">
                  {getRatingDescription(rating)}
                </span>
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-3">
            <Label htmlFor="comment" className="text-base font-medium">
              Votre commentaire
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={getCommentPlaceholder(rating)}
              rows={6}
              className="resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={disabled || isPending}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {comment.length}/1000 caractères
              </span>
              {comment.length >= 10 ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Commentaire valide</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  <span>Minimum 10 caractères</span>
                </div>
              )}
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800">
            <h4 className="text-sm font-medium text-blue-200 mb-2">
              Conseils pour un avis utile
            </h4>
            <ul className="text-xs text-blue-300 space-y-1">
              <li>• Soyez précis sur ce que vous avez apprécié ou non</li>
              <li>• Mentionnez votre niveau avant de commencer la formation</li>
              <li>• Partagez ce que vous avez appris concrètement</li>
              <li>• Restez constructif et respectueux</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={disabled || isPending || rating < 1 || comment.length < 10}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6"
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {existingReview ? 'Mise à jour...' : 'Publication...'}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {existingReview ? 'Mettre à jour' : 'Publier mon avis'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface QuickRatingProps {
  onRatingSelect: (rating: number) => void;
  className?: string;
}

export function QuickRating({ onRatingSelect, className }: QuickRatingProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-sm font-medium text-center">
        Notez rapidement cette formation
      </p>
      <div className="flex justify-center">
        <StarRating
          rating={0}
          interactive={true}
          size="xl"
          onRatingChange={onRatingSelect}
        />
      </div>
    </div>
  );
}
