"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StarRatingDisplay } from './star-rating';
import { ReviewInteractions } from './review-interactions';
import { ReviewReplies } from './review-replies';
import { 
  MoreHorizontal,
  Verified,
  Clock,
  User,
  Edit,
  Trash2,
  Flag,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

// Same zone on the server and in the browser, or the dates of the server HTML do not hydrate
const longDate = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" });

export interface ReviewData {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  isModerated: boolean;
  isFlagged: boolean;
  status: "PUBLISHED" | "PENDING" | "REJECTED";
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  course?: {
    id: string;
    title: string;
  };
  votes?: {
    helpful: number;
    unhelpful: number;
    userVote?: { helpful: boolean } | null;
  };
  replies?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name: string | null;
      avatar: string | null;
      role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
    };
    isInstructorReply?: boolean;
  }>;
  reportCount?: number;
  verified?: boolean;
  helpfulCount?: number;
  userVote?: 'helpful' | 'unhelpful' | null;
  canReply?: boolean;
  canReport?: boolean;
}

interface ReviewCardProps {
  review: ReviewData;
  showActions?: boolean;
  showCourse?: boolean;
  compact?: boolean;
  className?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canModerate?: boolean;
  canVote?: boolean;
  canReply?: boolean;
  canReport?: boolean;
  isInstructor?: boolean;
  onEdit?: (review: ReviewData) => void;
  onDelete?: (reviewId: string) => void;
  onModerate?: (reviewId: string, action: 'approve' | 'reject' | 'flag' | 'unflag') => void;
}

export function ReviewCard({
  review,
  showActions = true,
  showCourse = false,
  compact = false,
  className,
  canEdit = false,
  canDelete = false,
  canModerate = false,
  canVote = false,
  canReply = false,
  canReport = false,
  isInstructor = false,
  onEdit,
  onDelete,
  onModerate
}: ReviewCardProps) {
  const [showFullComment, setShowFullComment] = useState(false);
  const [isVisible, setIsVisible] = useState(!review.isFlagged);
  
  const formatDate = (dateString: string) => {
    return longDate.format(new Date(dateString));
  };

  const shouldTruncateComment = (comment: string, maxLength: number = 300) => {
    return comment.length > maxLength;
  };

  const truncatedComment = review.comment && shouldTruncateComment(review.comment) 
    ? review.comment.substring(0, 300) + '...'
    : review.comment;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleReplyAdded = () => {
    // This could trigger a parent component update if needed
  };

  if (!isVisible) {
    return (
      <Card className={cn("border-red-200 bg-red-50", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600">
              <EyeOff className="h-4 w-4" />
              <span className="text-sm font-medium">Avis masqué</span>
              <Badge variant="destructive" className="text-xs">
                Signalé
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(true)}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Afficher
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-200 hover:shadow-md',
      'border-l-4 border-l-transparent hover:border-l-blue-500',
      review.isFlagged && "border-amber-200 bg-amber-50",
      review.status === "PENDING" && "border-yellow-200 bg-yellow-50",
      review.status === "REJECTED" && "border-red-200 bg-red-50",
      className
    )}>
      <CardContent className={cn('p-6', compact && 'p-4')}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className={cn('ring-2 ring-offset-2 ring-transparent', compact ? 'h-8 w-8' : 'h-10 w-10')}>
              <AvatarImage src={review.user.image || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {review.user.name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('font-semibold truncate', compact ? 'text-sm' : 'text-base')}>
                  {review.user.name || 'Utilisateur anonyme'}
                </span>
                {review.verified && (
                  <Badge variant="outline" className="text-xs gap-1 bg-green-50 text-green-700 border-green-200">
                    <Verified className="h-3 w-3" />
                    Vérifié
                  </Badge>
                )}
                <StarRatingDisplay 
                  rating={review.rating} 
                  showNumbers={false}
                  size={compact ? 'sm' : 'md'}
                />
                <span className="text-sm text-muted-foreground">
                  {review.rating}/5
                </span>
              </div>

              {/* Course info */}
              {showCourse && review.course && (
                <p className="text-xs text-muted-foreground mb-1">
                  Cours: {review.course.title}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDate(review.createdAt)}</span>
                {review.updatedAt !== review.createdAt && (
                  <span>(modifié)</span>
                )}
                {review.status !== "PUBLISHED" && (
                  <Badge className={getStatusColor(review.status)}>
                    {review.status === "PENDING" ? "En attente" : "Rejeté"}
                  </Badge>
                )}
                {review.isFlagged && (
                  <Badge variant="destructive" className="text-xs">
                    Signalé ({review.reportCount})
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {showActions && (canEdit || canDelete || canModerate) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={() => onEdit?.(review)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                )}
                
                {canDelete && (
                  <>
                    {canEdit && <DropdownMenuSeparator />}
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(review.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </>
                )}

                {canModerate && (
                  <>
                    <DropdownMenuSeparator />
                    {review.status === "PENDING" && (
                      <DropdownMenuItem 
                        onClick={() => onModerate?.(review.id, 'approve')}
                        className="text-green-600"
                      >
                        Approuver
                      </DropdownMenuItem>
                    )}
                    {review.status !== "REJECTED" && (
                      <DropdownMenuItem 
                        onClick={() => onModerate?.(review.id, 'reject')}
                        className="text-red-600"
                      >
                        Rejeter
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => onModerate?.(review.id, review.isFlagged ? 'unflag' : 'flag')}
                      className={review.isFlagged ? "text-green-600" : "text-amber-600"}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      {review.isFlagged ? "Retirer le signalement" : "Signaler"}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Review title */}
        {review.title && (
          <h3 className="font-semibold mb-2 leading-tight">
            {review.title}
          </h3>
        )}

        {/* Comment */}
        {review.comment && (
          <div className="mb-4">
            <p className={cn(
              'text-muted-foreground leading-relaxed whitespace-pre-wrap',
              compact ? 'text-sm' : 'text-base'
            )}>
              {showFullComment ? review.comment : truncatedComment}
            </p>
            
            {shouldTruncateComment(review.comment) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullComment(!showFullComment)}
                className="mt-2 h-auto p-0 text-blue-600 hover:text-blue-800"
              >
                {showFullComment ? 'Voir moins' : 'Voir plus'}
              </Button>
            )}
          </div>
        )}

        {/* Interactions */}
        <ReviewInteractions
          reviewId={review.id}
          initialVotes={review.votes}
          canVote={canVote}
          canReply={canReply}
          canReport={canReport}
          isInstructor={isInstructor}
          onReplyAdded={handleReplyAdded}
        />

        {/* Replies */}
        <ReviewReplies
          reviewId={review.id}
          initialReplies={review.replies || []}
          canReply={canReply}
          onReplyAdded={handleReplyAdded}
          className="mt-4"
        />
      </CardContent>
    </Card>
  );
}

interface ReviewListProps {
  reviews: ReviewData[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  showActions?: boolean;
  showCourse?: boolean;
  compact?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canModerate?: boolean;
  canVote?: boolean;
  canReply?: boolean;
  canReport?: boolean;
  isInstructor?: boolean;
  onEdit?: (review: ReviewData) => void;
  onDelete?: (reviewId: string) => void;
  onModerate?: (reviewId: string, action: 'approve' | 'reject' | 'flag' | 'unflag') => void;
}

export function ReviewList({
  reviews,
  loading = false,
  emptyMessage = 'Aucun avis pour le moment',
  className,
  showActions = true,
  showCourse = false,
  compact = false,
  canEdit = false,
  canDelete = false,
  canModerate = false,
  canVote = false,
  canReply = false,
  canReport = false,
  isInstructor = false,
  onEdit,
  onDelete,
  onModerate
}: ReviewListProps) {
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Aucun avis</h3>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          showActions={showActions}
          showCourse={showCourse}
          compact={compact}
          canEdit={canEdit}
          canDelete={canDelete}
          canModerate={canModerate}
          canVote={canVote}
          canReply={canReply}
          canReport={canReport}
          isInstructor={isInstructor}
          onEdit={onEdit}
          onDelete={onDelete}
          onModerate={onModerate}
        />
      ))}
    </div>
  );
}
