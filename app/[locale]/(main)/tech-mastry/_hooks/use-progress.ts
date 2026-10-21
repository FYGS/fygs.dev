"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  STORAGE_KEY,
  computeStreak,
  emptyProgress,
  parseStoredProgress,
  recordChallenge,
  recordChallengeAttempt,
  recordDay,
  recordQuiz,
  recordTime,
  recordTopicCompleted,
  recordTopicReopened,
  recordVisit,
  type UserProgress,
} from "../_utils/progress-model";

export type { UserProgress } from "../_utils/progress-model";

function loadProgress(): UserProgress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseStoredProgress(JSON.parse(stored)) : emptyProgress();
  } catch {
    return emptyProgress();
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
// render both see the empty progress; the mount effect then loads the persisted
// value (and records today as an active day) without setting React state inside the effect.
interface ProgressStore {
  progress: UserProgress;
  isLoaded: boolean;
}

let store: ProgressStore = { progress: emptyProgress(new Date(0)), isLoaded: false };
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
  // A tracker can run before the mount effect has read localStorage: never save on top of unread data
  if (!store.isLoaded) loadOnMount();
  const prev = store.progress;
  const updated = update(prev);
  if (updated === prev) return;
  saveProgress(updated);
  setStore({ ...store, progress: updated });
}

function loadOnMount() {
  const loaded = recordDay(loadProgress(), new Date());
  saveProgress(loaded);
  setStore({ progress: loaded, isLoaded: true });
}

let listeningToOtherTabs = false;

/** The progress is shared by every tab of the browser: when another tab saves, read what it saved. */
function listenToOtherTabs() {
  if (listeningToOtherTabs || typeof window === "undefined") return;
  listeningToOtherTabs = true;
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    setStore({ progress: loadProgress(), isLoaded: true });
  });
}

export function useProgress() {
  const { progress, isLoaded } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    loadOnMount();
    listenToOtherTabs();
  }, []);

  const trackPageVisit = useCallback((path: string) => {
    updateProgress((prev) => recordVisit(prev, path, new Date()));
  }, []);

  const trackQuizScore = useCallback((quizId: string, score: number, total: number) => {
    updateProgress((prev) => recordQuiz(prev, quizId, score, total, new Date()));
  }, []);

  const trackChallengeComplete = useCallback((challengeId: string) => {
    updateProgress((prev) => recordChallenge(prev, challengeId, new Date()));
  }, []);

  const trackChallengeAttempt = useCallback((challengeId: string, passed: number, total: number) => {
    updateProgress((prev) => recordChallengeAttempt(prev, challengeId, passed, total, new Date()));
  }, []);

  const completeTopic = useCallback((route: string) => {
    updateProgress((prev) => recordTopicCompleted(prev, route, new Date()));
  }, []);

  const reopenTopic = useCallback((route: string) => {
    updateProgress((prev) => recordTopicReopened(prev, route));
  }, []);

  const trackTimeSpent = useCallback((path: string, minutes: number) => {
    updateProgress((prev) => recordTime(prev, path, minutes));
  }, []);

  const getStreakDays = useCallback(
    (): number => computeStreak(progress.streakDates, new Date()),
    [progress.streakDates],
  );

  const resetProgress = useCallback(() => {
    const fresh = recordDay(emptyProgress(), new Date());
    saveProgress(fresh);
    setStore({ ...store, progress: fresh });
  }, []);

  return {
    progress,
    isLoaded,
    trackPageVisit,
    trackQuizScore,
    trackChallengeComplete,
    trackChallengeAttempt,
    trackTimeSpent,
    completeTopic,
    reopenTopic,
    getStreakDays,
    resetProgress,
  };
}
