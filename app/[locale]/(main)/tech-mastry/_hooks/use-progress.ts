"use client";

import { useState, useEffect, useCallback } from "react";

export interface UserProgress {
  challengesCompleted: string[];
  quizScores: Record<string, { score: number; total: number; date: string }>;
  visitedPages: string[];
  streakDates: string[];
  timeSpent: Record<string, number>;
  lastVisit: string;
  totalTimeMinutes: number;
}

const STORAGE_KEY = "tech-mastry-progress";

const defaultProgress: UserProgress = {
  challengesCompleted: [],
  quizScores: {},
  visitedPages: [],
  streakDates: [],
  timeSpent: {},
  lastVisit: new Date().toISOString(),
  totalTimeMinutes: 0,
};

function loadProgress(): UserProgress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProgress;
    return { ...defaultProgress, ...JSON.parse(stored) };
  } catch {
    return defaultProgress;
  }
}

function saveProgress(progress: UserProgress) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or unavailable
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadProgress();
    // Update streak
    const today = new Date().toISOString().split("T")[0];
    if (!loaded.streakDates.includes(today)) {
      loaded.streakDates = [...loaded.streakDates, today];
    }
    loaded.lastVisit = new Date().toISOString();
    setProgress(loaded);
    saveProgress(loaded);
    setIsLoaded(true);
  }, []);

  const trackPageVisit = useCallback((path: string) => {
    setProgress((prev) => {
      if (prev.visitedPages.includes(path)) return prev;
      const updated = {
        ...prev,
        visitedPages: [...prev.visitedPages, path],
        lastVisit: new Date().toISOString(),
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const trackQuizScore = useCallback((quizId: string, score: number, total: number) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        quizScores: {
          ...prev.quizScores,
          [quizId]: { score, total, date: new Date().toISOString() },
        },
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const trackChallengeComplete = useCallback((challengeId: string) => {
    setProgress((prev) => {
      if (prev.challengesCompleted.includes(challengeId)) return prev;
      const updated = {
        ...prev,
        challengesCompleted: [...prev.challengesCompleted, challengeId],
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const trackTimeSpent = useCallback((path: string, minutes: number) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        timeSpent: {
          ...prev.timeSpent,
          [path]: (prev.timeSpent[path] || 0) + minutes,
        },
        totalTimeMinutes: prev.totalTimeMinutes + minutes,
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const getStreakDays = useCallback((): number => {
    const dates = [...progress.streakDates].sort().reverse();
    if (dates.length === 0) return 0;
    let streak = 1;
    const today = new Date();
    for (let i = 0; i < dates.length - 1; i++) {
      const current = new Date(dates[i]);
      const prev = new Date(dates[i + 1]);
      const diffDays = Math.floor((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    // Check if streak includes today
    const lastDate = new Date(dates[0]);
    const diffFromToday = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffFromToday > 1) return 0; // Streak broken
    return streak;
  }, [progress.streakDates]);

  const getSkillLevels = useCallback(() => {
    const categoryScores: Record<string, { total: number; correct: number }> = {};
    Object.entries(progress.quizScores).forEach(([, data]) => {
      // Infer category from quiz ID or use default
      const category = "general";
      if (!categoryScores[category]) {
        categoryScores[category] = { total: 0, correct: 0 };
      }
      categoryScores[category].total += data.total;
      categoryScores[category].correct += data.score;
    });
    return categoryScores;
  }, [progress.quizScores]);

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress);
    saveProgress(defaultProgress);
  }, []);

  return {
    progress,
    isLoaded,
    trackPageVisit,
    trackQuizScore,
    trackChallengeComplete,
    trackTimeSpent,
    getStreakDays,
    getSkillLevels,
    resetProgress,
  };
}
