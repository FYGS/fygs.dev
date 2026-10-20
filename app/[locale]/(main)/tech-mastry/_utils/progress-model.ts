/**
 * TechMastery learner progress: the data model and the pure functions that update it.
 *
 * The progress lives in the browser (localStorage), there is no account behind the
 * TechMastery section. The React hook (`_hooks/use-progress.ts`) only stores and
 * persists what these functions return, so every rule here is testable without a DOM.
 */

export type ActivityType = "learning" | "quiz" | "challenge";

export interface ActivityEntry {
  type: ActivityType;
  /** Page path (learning), quiz id or challenge id */
  ref: string;
  /** ISO date-time */
  at: string;
  score?: number;
  total?: number;
}

export interface UserProgress {
  challengesCompleted: string[];
  quizScores: Record<string, { score: number; total: number; date: string }>;
  visitedPages: string[];
  /** UTC days (yyyy-mm-dd) on which the learner opened the section */
  streakDates: string[];
  /** Minutes per page path */
  timeSpent: Record<string, number>;
  lastVisit: string;
  totalTimeMinutes: number;
  /** Newest last, capped at MAX_ACTIVITY */
  activityLog: ActivityEntry[];
}

export const STORAGE_KEY = "tech-mastry-progress";
export const MAX_ACTIVITY = 100;

export function emptyProgress(now: Date = new Date()): UserProgress {
  return {
    challengesCompleted: [],
    quizScores: {},
    visitedPages: [],
    streakDates: [],
    timeSpent: {},
    lastVisit: now.toISOString(),
    totalTimeMinutes: 0,
    activityLog: [],
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

/** Reads whatever was stored (older versions, hand edits, corruption) into a valid progress. */
export function parseStoredProgress(raw: unknown, now: Date = new Date()): UserProgress {
  const base = emptyProgress(now);
  if (!isRecord(raw)) return base;

  const quizScores: UserProgress["quizScores"] = {};
  if (isRecord(raw.quizScores)) {
    for (const [id, value] of Object.entries(raw.quizScores)) {
      if (
        isRecord(value) &&
        typeof value.score === "number" &&
        typeof value.total === "number" &&
        value.total > 0 &&
        typeof value.date === "string"
      ) {
        quizScores[id] = { score: value.score, total: value.total, date: value.date };
      }
    }
  }

  const timeSpent: Record<string, number> = {};
  if (isRecord(raw.timeSpent)) {
    for (const [path, minutes] of Object.entries(raw.timeSpent)) {
      if (typeof minutes === "number" && Number.isFinite(minutes) && minutes > 0) timeSpent[path] = minutes;
    }
  }

  const activityLog: ActivityEntry[] = [];
  if (Array.isArray(raw.activityLog)) {
    for (const entry of raw.activityLog) {
      if (
        isRecord(entry) &&
        (entry.type === "learning" || entry.type === "quiz" || entry.type === "challenge") &&
        typeof entry.ref === "string" &&
        typeof entry.at === "string" &&
        !Number.isNaN(Date.parse(entry.at))
      ) {
        activityLog.push({
          type: entry.type,
          ref: entry.ref,
          at: entry.at,
          ...(typeof entry.score === "number" ? { score: entry.score } : {}),
          ...(typeof entry.total === "number" ? { total: entry.total } : {}),
        });
      }
    }
  }

  return {
    challengesCompleted: strings(raw.challengesCompleted),
    quizScores,
    visitedPages: strings(raw.visitedPages),
    streakDates: strings(raw.streakDates),
    timeSpent,
    lastVisit: typeof raw.lastVisit === "string" ? raw.lastVisit : base.lastVisit,
    totalTimeMinutes:
      typeof raw.totalTimeMinutes === "number" && raw.totalTimeMinutes > 0 ? raw.totalTimeMinutes : 0,
    activityLog: activityLog.slice(-MAX_ACTIVITY),
  };
}

/** "/fr/tech-mastry/algorithms/?x=1#top" -> "/tech-mastry/algorithms" */
export function normalizePath(pathname: string): string {
  const withoutQuery = pathname.split(/[?#]/)[0];
  const withoutLocale = withoutQuery.replace(/^\/(fr|en|es)(?=\/|$)/, "");
  const trimmed = withoutLocale.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/** The day a date belongs to, the way `streakDates` stores it (UTC). */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const DAY_MS = 24 * 60 * 60 * 1000;
const dayIndex = (key: string) => Math.floor(Date.parse(`${key}T00:00:00Z`) / DAY_MS);

/**
 * Consecutive active days ending today. A learner who has not opened the section yet today
 * keeps yesterday's streak (it only breaks once a whole day is missed).
 */
export function computeStreak(dates: string[], now: Date = new Date()): number {
  const days = new Set(dates.filter((d) => !Number.isNaN(dayIndex(d))).map(dayIndex));
  const today = dayIndex(dayKey(now));
  let cursor = days.has(today) ? today : days.has(today - 1) ? today - 1 : null;
  if (cursor === null) return 0;
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor--;
  }
  return streak;
}

const withActivity = (progress: UserProgress, entry: ActivityEntry): UserProgress => ({
  ...progress,
  activityLog: [...progress.activityLog, entry].slice(-MAX_ACTIVITY),
});

/** The learner opened the section today. */
export function recordDay(prev: UserProgress, now: Date): UserProgress {
  const today = dayKey(now);
  const streakDates = prev.streakDates.includes(today) ? prev.streakDates : [...prev.streakDates, today];
  return { ...prev, streakDates, lastVisit: now.toISOString() };
}

/** First visit of a page; later visits change nothing. */
export function recordVisit(prev: UserProgress, path: string, now: Date): UserProgress {
  if (prev.visitedPages.includes(path)) return prev;
  return withActivity(
    { ...prev, visitedPages: [...prev.visitedPages, path], lastVisit: now.toISOString() },
    { type: "learning", ref: path, at: now.toISOString() },
  );
}

/** Every attempt is logged; the best score per quiz is the one kept in `quizScores`. */
export function recordQuiz(prev: UserProgress, quizId: string, score: number, total: number, now: Date): UserProgress {
  if (!(total > 0) || score < 0 || score > total) return prev;
  const best = prev.quizScores[quizId];
  const isBest = !best || score / total >= best.score / best.total;
  return withActivity(
    {
      ...prev,
      quizScores: isBest ? { ...prev.quizScores, [quizId]: { score, total, date: now.toISOString() } } : prev.quizScores,
    },
    { type: "quiz", ref: quizId, at: now.toISOString(), score, total },
  );
}

export function recordChallenge(prev: UserProgress, challengeId: string, now: Date): UserProgress {
  if (prev.challengesCompleted.includes(challengeId)) return prev;
  return withActivity(
    { ...prev, challengesCompleted: [...prev.challengesCompleted, challengeId] },
    { type: "challenge", ref: challengeId, at: now.toISOString() },
  );
}

export function recordTime(prev: UserProgress, path: string, minutes: number): UserProgress {
  if (!(minutes > 0)) return prev;
  return {
    ...prev,
    timeSpent: { ...prev.timeSpent, [path]: (prev.timeSpent[path] ?? 0) + minutes },
    totalTimeMinutes: prev.totalTimeMinutes + minutes,
  };
}
