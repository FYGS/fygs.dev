"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

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

// Progress lives in a tiny external store: the server and the first client
// render both see defaultProgress; the mount effect then loads the persisted
// value (and bumps the streak) without setting React state inside the effect.
interface ProgressStore {
  progress: UserProgress;
  isLoaded: boolean;
}

let store: ProgressStore = { progress: defaultProgress, isLoaded: false };
const serverStore: ProgressStore = store;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return store;
}

function getServerSnapshot() {
  return serverStore;
}

function setStore(next: ProgressStore) {
  store = next;
  listeners.forEach((listener) => listener());
}

/** Applies the updater to the current progress, persists the result, notifies readers. */
function updateProgress(update: (prev: UserProgress) => UserProgress) {
  const prev = store.progress;
  const updated = update(prev);
  if (updated === prev) return;
  saveProgress(updated);
  setStore({ ...store, progress: updated });
}

function loadOnMount() {
  const loaded = loadProgress();
  // Update streak
  const today = new Date().toISOString().split("T")[0];
  if (!loaded.streakDates.includes(today)) {
    loaded.streakDates = [...loaded.streakDates, today];
  }
  loaded.lastVisit = new Date().toISOString();
  saveProgress(loaded);
  setStore({ progress: loaded, isLoaded: true });
}

export function useProgress() {
  const { progress, isLoaded } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    loadOnMount();
  }, []);

  const trackPageVisit = useCallback((path: string) => {
    updateProgress((prev) => {
      if (prev.visitedPages.includes(path)) return prev;
      return {
        ...prev,
        visitedPages: [...prev.visitedPages, path],
        lastVisit: new Date().toISOString(),
      };
    });
  }, []);

  const trackQuizScore = useCallback((quizId: string, score: number, total: number) => {
    updateProgress((prev) => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [quizId]: { score, total, date: new Date().toISOString() },
      },
    }));
  }, []);

  const trackChallengeComplete = useCallback((challengeId: string) => {
    updateProgress((prev) => {
      if (prev.challengesCompleted.includes(challengeId)) return prev;
      return {
        ...prev,
        challengesCompleted: [...prev.challengesCompleted, challengeId],
      };
    });
  }, []);

  const trackTimeSpent = useCallback((path: string, minutes: number) => {
    updateProgress((prev) => ({
      ...prev,
      timeSpent: {
        ...prev.timeSpent,
        [path]: (prev.timeSpent[path] || 0) + minutes,
      },
      totalTimeMinutes: prev.totalTimeMinutes + minutes,
    }));
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
    saveProgress(defaultProgress);
    setStore({ ...store, progress: defaultProgress });
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
