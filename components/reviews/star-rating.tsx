"use client";

import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  showHalf?: boolean;
  className?: string;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  showHalf = true,
  className,
  onRatingChange
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (interactive) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const getStarType = (index: number) => {
    const currentRating = hoverRating ?? rating;
    const starValue = index + 1;

    if (currentRating >= starValue) {
      return 'full';
    } else if (showHalf && currentRating >= starValue - 0.5) {
      return 'half';
    } else {
      return 'empty';
    }
  };

  return (
    <div 
      className={cn(
        'flex items-center gap-0.5',
        interactive && 'cursor-pointer',
        className
      )}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: maxRating }).map((_, index) => {
        const starType = getStarType(index);
        
        return (
          <button
            key={index}
            type="button"
            className={cn(
              'relative transition-colors duration-150',
              interactive && 'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded',
              !interactive && 'pointer-events-none'
            )}
            onClick={() => handleStarClick(index + 1)}
            onMouseEnter={() => handleStarHover(index + 1)}
            disabled={!interactive}
          >
            {starType === 'full' && (
              <Star 
                className={cn(
                  sizeClasses[size],
                  'fill-yellow-400 text-yellow-400'
                )} 
              />
            )}
            {starType === 'half' && (
              <div className="relative">
                <Star 
                  className={cn(
                    sizeClasses[size],
                    'text-gray-300'
                  )} 
                />
                <StarHalf 
                  className={cn(
                    sizeClasses[size],
                    'absolute top-0 left-0 fill-yellow-400 text-yellow-400'
                  )} 
                />
              </div>
            )}
            {starType === 'empty' && (
              <Star 
                className={cn(
                  sizeClasses[size],
                  interactive && hoverRating && hoverRating > index 
                    ? 'text-yellow-200' 
                    : 'text-gray-300'
                )} 
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

interface StarRatingDisplayProps {
  rating: number;
  totalReviews?: number;
  showNumbers?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function StarRatingDisplay({
  rating,
  totalReviews,
  showNumbers = true,
  size = 'md',
  className
}: StarRatingDisplayProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <StarRating 
        rating={rating} 
        size={size} 
        interactive={false} 
        showHalf={true}
      />
      {showNumbers && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {rating.toFixed(1)}
          </span>
          {totalReviews !== undefined && (
            <span>
              ({totalReviews} {totalReviews === 1 ? 'avis' : 'avis'})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface RatingBreakdownProps {
  distribution: Record<number, number>;
  totalReviews: number;
  className?: string;
}

export function RatingBreakdown({ 
  distribution, 
  totalReviews, 
  className 
}: RatingBreakdownProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = distribution[stars] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        
        return (
          <div key={stars} className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 min-w-[60px]">
              <span className="text-muted-foreground">{stars}</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="flex-1 bg-muted rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-muted-foreground min-w-[30px] text-right">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}