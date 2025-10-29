"use client";

import { createContext, useContext, useCallback, useState, ReactNode } from 'react';

interface ReviewUpdate {
  reviewId: string;
  type: 'reply_added' | 'vote_updated';
  data: any;
  timestamp: number;
}

interface ReviewUpdatesContextValue {
  addReply: (reviewId: string, reply: any) => void;
  updateVote: (reviewId: string, voteData: any) => void;
  getUpdatesForReview: (reviewId: string) => ReviewUpdate[];
  subscribeToUpdates: (reviewId: string, callback: (update: ReviewUpdate) => void) => () => void;
}

const ReviewUpdatesContext = createContext<ReviewUpdatesContextValue | null>(null);

export function ReviewUpdatesProvider({ children }: { children: ReactNode }) {
  const [updates, setUpdates] = useState<ReviewUpdate[]>([]);
  const [subscribers, setSubscribers] = useState<Map<string, Set<(update: ReviewUpdate) => void>>>(new Map());

  const addUpdate = useCallback((update: ReviewUpdate) => {
    setUpdates(prev => [...prev, update]);
    
    // Notify subscribers
    const reviewSubscribers = subscribers.get(update.reviewId);
    if (reviewSubscribers) {
      reviewSubscribers.forEach(callback => callback(update));
    }
  }, [subscribers]);

  const addReply = useCallback((reviewId: string, reply: any) => {
    const update: ReviewUpdate = {
      reviewId,
      type: 'reply_added',
      data: reply,
      timestamp: Date.now(),
    };
    addUpdate(update);
  }, [addUpdate]);

  const updateVote = useCallback((reviewId: string, voteData: any) => {
    const update: ReviewUpdate = {
      reviewId,
      type: 'vote_updated',
      data: voteData,
      timestamp: Date.now(),
    };
    addUpdate(update);
  }, [addUpdate]);

  const getUpdatesForReview = useCallback((reviewId: string) => {
    return updates.filter(update => update.reviewId === reviewId);
  }, [updates]);

  const subscribeToUpdates = useCallback((reviewId: string, callback: (update: ReviewUpdate) => void) => {
    setSubscribers(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(reviewId)) {
        newMap.set(reviewId, new Set());
      }
      newMap.get(reviewId)!.add(callback);
      return newMap;
    });

    return () => {
      setSubscribers(prev => {
        const newMap = new Map(prev);
        const reviewSubscribers = newMap.get(reviewId);
        if (reviewSubscribers) {
          reviewSubscribers.delete(callback);
          if (reviewSubscribers.size === 0) {
            newMap.delete(reviewId);
          }
        }
        return newMap;
      });
    };
  }, []);

  return (
    <ReviewUpdatesContext.Provider value={{
      addReply,
      updateVote,
      getUpdatesForReview,
      subscribeToUpdates,
    }}>
      {children}
    </ReviewUpdatesContext.Provider>
  );
}

export function useReviewUpdates() {
  const context = useContext(ReviewUpdatesContext);
  if (!context) {
    throw new Error('useReviewUpdates must be used within a ReviewUpdatesProvider');
  }
  return context;
}