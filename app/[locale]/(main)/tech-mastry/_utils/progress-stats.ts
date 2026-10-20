import { challenges } from "../challenges/_components/advanced-coding-challenges/data";
import { searchIndex } from "./search-index";
import { computeStreak, dayKey, type ActivityEntry, type UserProgress } from "./progress-model";

/**
 * Everything the TechMastery dashboard shows, computed from the learner's real progress
 * and from the site's own catalog (the search index lists every topic page). Nothing is
 * invented: a learner who has done nothing sees zeros.
 */

export type PathIcon = "algorithms" | "systemDesign" | "frontend" | "backend" | "security" | "career";
export type AchievementIcon = "compass" | "target" | "flame" | "award" | "trophy";
export type SkillKey =
  | "algorithms"
  | "dataStructures"
  | "systemDesign"
  | "frontend"
  | "backend"
  | "problemSolving"
  | "communication";

export interface DashboardActivity {
  id: string;
  type: "challenge" | "quiz" | "interview" | "learning";
  title: string;
  timestamp: Date;
  result?: "success" | "partial" | "failed";
  /** Percentage */
  score?: number;
}

export interface LearningPathStats {
  id: string;
  title: string;
  description: string;
  icon: PathIcon;
  /** 0-100 */
  progress: number;
  totalModules: number;
  completedModules: number;
  /** Where "Continue" leads: the first topic not visited yet, else the first topic */
  href: string;
}

export interface AchievementStats {
  id: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  isUnlocked: boolean;
  /** 0-100 */
  progress: number;
  unlockedAt?: Date;
}

export interface ProgressStats {
  hasActivity: boolean;
  challengesCompleted: number;
  totalChallenges: number;
  streakDays: number;
  lastActivityAt: Date | null;
  totalTimeMinutes: number;
  pagesVisited: number;
  totalPages: number;
  skillLevels: Record<SkillKey, number>;
  recentActivities: DashboardActivity[];
  learningPaths: LearningPathStats[];
  achievements: AchievementStats[];
  /** Activity count per UTC day, for the streak calendar */
  activityByDay: Record<string, number>;
}

interface PathDefinition {
  id: string;
  title: string;
  description: string;
  icon: PathIcon;
  prefixes: string[];
}

const ROOT = "/tech-mastry";

const PATHS: PathDefinition[] = [
  {
    id: "algorithms",
    title: "Algorithms & Data Structures",
    description: "Complexity, sorting, searching and the data structures behind them",
    icon: "algorithms",
    prefixes: [`${ROOT}/algorithms`, `${ROOT}/data-structures`],
  },
  {
    id: "system-design",
    title: "System Design & Architecture",
    description: "Design scalable and robust systems, from patterns to distributed architectures",
    icon: "systemDesign",
    prefixes: [`${ROOT}/system-design`, `${ROOT}/architecture`],
  },
  {
    id: "frontend",
    title: "Frontend Development",
    description: "Modern frameworks, performance, accessibility and best practices",
    icon: "frontend",
    prefixes: [`${ROOT}/frontend`],
  },
  {
    id: "backend",
    title: "Backend Development",
    description: "APIs, databases, services and everything that runs on the server",
    icon: "backend",
    prefixes: [`${ROOT}/backend`],
  },
  {
    id: "security-devops",
    title: "Security & DevOps",
    description: "Secure your applications and ship them reliably",
    icon: "security",
    prefixes: [`${ROOT}/security-devops`],
  },
  {
    id: "career",
    title: "Career & Interview Preparation",
    description: "Prepare interviews, negotiate and plan your career",
    icon: "career",
    prefixes: [`${ROOT}/career`, `${ROOT}/preparation`, `${ROOT}/interview-simulation`],
  },
];

const SKILL_PREFIXES: Record<Exclude<SkillKey, "problemSolving">, string[]> = {
  algorithms: [`${ROOT}/algorithms`],
  dataStructures: [`${ROOT}/data-structures`, `${ROOT}/algorithms/data-structures`],
  systemDesign: [`${ROOT}/system-design`, `${ROOT}/architecture`],
  frontend: [`${ROOT}/frontend`],
  backend: [`${ROOT}/backend`],
  communication: [`${ROOT}/career`, `${ROOT}/preparation`, `${ROOT}/interview-simulation`],
};

interface CatalogItem {
  href: string;
  title: string;
}

/** Every topic page of the section, once (the index lists a page under several keywords). */
const CATALOG: CatalogItem[] = [
  ...new Map(
    searchIndex.filter((item) => item.href.startsWith(`${ROOT}/`)).map((item) => [item.href, item] as const),
  ).values(),
].map(({ href, title }) => ({ href, title }));

export const TOTAL_PAGES = CATALOG.length;
export const TOTAL_CHALLENGES = challenges.length;

const within = (href: string, prefix: string) => href === prefix || href.startsWith(`${prefix}/`);
const inAny = (href: string, prefixes: string[]) => prefixes.some((prefix) => within(href, prefix));
const percent = (done: number, total: number) => (total > 0 ? Math.round((done / total) * 100) : 0);

/** A topic counts as visited when the learner opened it or any page below it. */
const isVisited = (item: CatalogItem, visited: string[]) => visited.some((path) => within(path, item.href));

function titleOf(path: string): string {
  const exact = CATALOG.find((item) => item.href === path);
  if (exact) return exact.title;
  const parent = [...CATALOG].sort((a, b) => b.href.length - a.href.length).find((item) => within(path, item.href));
  if (parent) return parent.title;
  return path.replace(`${ROOT}/`, "").split("/").join(" / ") || "TechMastery";
}

function labelOf(ref: string): string {
  const words = ref.replace(/[-:_]+/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : ref;
}

function activityOf(entry: ActivityEntry, index: number): DashboardActivity {
  const timestamp = new Date(entry.at);
  const id = `${entry.type}:${entry.ref}:${index}`;
  if (entry.type === "learning") return { id, type: "learning", title: titleOf(entry.ref), timestamp };
  if (entry.type === "challenge") {
    const known = challenges.find((challenge) => challenge.id === entry.ref);
    return { id, type: "challenge", title: known?.title ?? labelOf(entry.ref), timestamp, result: "success", score: 100 };
  }
  const score = entry.total ? Math.round(((entry.score ?? 0) / entry.total) * 100) : undefined;
  return {
    id,
    type: "quiz",
    title: `Quiz: ${labelOf(entry.ref)}`,
    timestamp,
    score,
    result: score === undefined ? undefined : score >= 80 ? "success" : score >= 50 ? "partial" : "failed",
  };
}

function learningPaths(visited: string[]): LearningPathStats[] {
  return PATHS.map((path) => {
    const items = CATALOG.filter((item) => inAny(item.href, path.prefixes));
    const completed = items.filter((item) => isVisited(item, visited));
    const next = items.find((item) => !isVisited(item, visited)) ?? items[0];
    return {
      id: path.id,
      title: path.title,
      description: path.description,
      icon: path.icon,
      progress: percent(completed.length, items.length),
      totalModules: items.length,
      completedModules: completed.length,
      href: next?.href ?? path.prefixes[0],
    };
  }).filter((path) => path.totalModules > 0);
}

function skillLevels(progress: UserProgress): Record<SkillKey, number> {
  const coverage = (prefixes: string[]) => {
    const items = CATALOG.filter((item) => inAny(item.href, prefixes));
    return percent(items.filter((item) => isVisited(item, progress.visitedPages)).length, items.length);
  };

  const quizzes = Object.values(progress.quizScores);
  const parts: number[] = [];
  if (TOTAL_CHALLENGES > 0 && progress.challengesCompleted.length > 0) {
    parts.push(percent(progress.challengesCompleted.length, TOTAL_CHALLENGES));
  }
  if (quizzes.length > 0) {
    parts.push(Math.round(quizzes.reduce((sum, quiz) => sum + (quiz.score / quiz.total) * 100, 0) / quizzes.length));
  }

  return {
    algorithms: coverage(SKILL_PREFIXES.algorithms),
    dataStructures: coverage(SKILL_PREFIXES.dataStructures),
    systemDesign: coverage(SKILL_PREFIXES.systemDesign),
    frontend: coverage(SKILL_PREFIXES.frontend),
    backend: coverage(SKILL_PREFIXES.backend),
    problemSolving: parts.length ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : 0,
    communication: coverage(SKILL_PREFIXES.communication),
  };
}

const EXPLORER_TARGET = 25;
const STREAK_TARGET = 7;
const QUIZ_ACE_PERCENT = 90;

function achievements(
  progress: UserProgress,
  streak: number,
  paths: LearningPathStats[],
  lastActivityAt: Date | null,
): AchievementStats[] {
  const log = progress.activityLog;
  const at = (entry?: ActivityEntry) => (entry ? new Date(entry.at) : (lastActivityAt ?? undefined));
  const learning = log.filter((entry) => entry.type === "learning");
  const firstChallenge = log.find((entry) => entry.type === "challenge");
  const quizAce = log.find(
    (entry) => entry.type === "quiz" && entry.total && ((entry.score ?? 0) / entry.total) * 100 >= QUIZ_ACE_PERCENT,
  );
  const completedPath = paths.find((path) => path.progress === 100);
  const visited = progress.visitedPages.length;

  const make = (
    base: Pick<AchievementStats, "id" | "title" | "description" | "icon">,
    progressPercent: number,
    unlockedAt: Date | undefined,
  ): AchievementStats => {
    const isUnlocked = progressPercent >= 100;
    return { ...base, isUnlocked, progress: Math.min(100, progressPercent), unlockedAt: isUnlocked ? unlockedAt : undefined };
  };

  return [
    make(
      { id: "first-steps", title: "First Steps", description: "Open your first topic", icon: "compass" },
      visited > 0 ? 100 : 0,
      at(learning[0]),
    ),
    make(
      { id: "first-challenge", title: "First Blood", description: "Complete your first coding challenge", icon: "trophy" },
      progress.challengesCompleted.length > 0 ? 100 : 0,
      at(firstChallenge),
    ),
    make(
      { id: "consistent-learner", title: "Consistent Learner", description: `Keep a ${STREAK_TARGET}-day learning streak`, icon: "flame" },
      percent(Math.min(streak, STREAK_TARGET), STREAK_TARGET),
      lastActivityAt ?? undefined,
    ),
    make(
      { id: "quiz-ace", title: "Quiz Ace", description: `Score ${QUIZ_ACE_PERCENT}% or more on a quiz`, icon: "target" },
      quizAce ? 100 : 0,
      at(quizAce),
    ),
    make(
      { id: "explorer", title: "Explorer", description: `Open ${EXPLORER_TARGET} different topics`, icon: "compass" },
      percent(Math.min(visited, EXPLORER_TARGET), EXPLORER_TARGET),
      at(learning[EXPLORER_TARGET - 1]),
    ),
    make(
      { id: "path-master", title: "Path Master", description: "Finish every topic of a learning path", icon: "award" },
      completedPath ? 100 : Math.max(0, ...paths.map((path) => path.progress)),
      lastActivityAt ?? undefined,
    ),
  ];
}

export function deriveProgressStats(progress: UserProgress, now: Date = new Date()): ProgressStats {
  const streakDays = computeStreak(progress.streakDates, now);
  const paths = learningPaths(progress.visitedPages);

  const lastEntry = progress.activityLog.at(-1);
  const lastActivityAt = lastEntry
    ? new Date(lastEntry.at)
    : progress.visitedPages.length > 0 || progress.streakDates.length > 0
      ? new Date(progress.lastVisit)
      : null;

  const activityByDay: Record<string, number> = {};
  for (const day of progress.streakDates) activityByDay[day] = 1;
  for (const entry of progress.activityLog) {
    const day = dayKey(new Date(entry.at));
    activityByDay[day] = (activityByDay[day] ?? 0) + 1;
  }

  return {
    hasActivity:
      progress.visitedPages.length > 0 ||
      progress.challengesCompleted.length > 0 ||
      Object.keys(progress.quizScores).length > 0,
    challengesCompleted: progress.challengesCompleted.length,
    totalChallenges: TOTAL_CHALLENGES,
    streakDays,
    lastActivityAt,
    totalTimeMinutes: progress.totalTimeMinutes,
    pagesVisited: CATALOG.filter((item) => isVisited(item, progress.visitedPages)).length,
    totalPages: TOTAL_PAGES,
    skillLevels: skillLevels(progress),
    recentActivities: [...progress.activityLog].reverse().slice(0, 8).map(activityOf),
    learningPaths: paths,
    achievements: achievements(progress, streakDays, paths, lastActivityAt),
    activityByDay,
  };
}
