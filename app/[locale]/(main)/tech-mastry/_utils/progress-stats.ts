import { challenges } from "../challenges/_components/advanced-coding-challenges/data";
import { AREAS, PATH, getTopic, lessonsOf, type Topic } from "../_catalog";
import { nextToLearn, selfCheckId } from "./catalog-progress";
import { computeStreak, dayKey, type ActivityEntry, type UserProgress } from "./progress-model";

/**
 * Everything the TechMastery dashboard shows, computed from the learner's real progress and from the
 * catalog (one entry per lesson, see _catalog). Nothing is invented: a learner who has done nothing sees zeros.
 */

export type PathIcon =
  | "algorithms"
  | "systemDesign"
  | "frontend"
  | "backend"
  | "security"
  | "career"
  | "data"
  | "ai"
  | "git"
  | "types"
  | "practice";
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
  /** 0-100, from the topics marked as done */
  progress: number;
  totalModules: number;
  completedModules: number;
  /** Opened or self-checked, not marked as done */
  startedModules: number;
  minutesLeft: number;
  /** Where "Continue" leads: the first topic not done, else the first topic */
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

export interface NextTopic {
  href: string;
  title: string;
  area: string;
  minutes: number;
  /** "start" when nothing was done yet, else "continue" */
  kind: "start" | "continue";
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
  topicsCompleted: number;
  totalTopics: number;
  selfChecksTaken: number;
  /** Mean of the best self-check scores in percent, null when none was taken */
  selfCheckAverage: number | null;
  next: NextTopic | null;
  skillLevels: Record<SkillKey, number>;
  recentActivities: DashboardActivity[];
  learningPaths: LearningPathStats[];
  achievements: AchievementStats[];
  /** Activity count per UTC day, for the streak calendar */
  activityByDay: Record<string, number>;
}

const ROOT = "/tech-mastry";

const AREA_ICON: Record<string, PathIcon> = {
  algorithms: "algorithms",
  "data-structures": "algorithms",
  architecture: "systemDesign",
  "system-design": "systemDesign",
  frontend: "frontend",
  backend: "backend",
  "typescript-mastery": "types",
  "git-mastery": "git",
  "security-devops": "security",
  "data-science": "data",
  "ai-mastery": "ai",
  "best-practices": "career",
  career: "career",
  practice: "practice",
};

/** The areas whose lessons feed each skill of the radar. */
const SKILL_AREAS: Record<Exclude<SkillKey, "problemSolving">, string[]> = {
  algorithms: ["algorithms"],
  dataStructures: ["data-structures"],
  systemDesign: ["system-design", "architecture"],
  frontend: ["frontend", "typescript-mastery"],
  backend: ["backend", "security-devops"],
  communication: ["career", "best-practices"],
};

export const TOTAL_PAGES = PATH.length;
export const TOTAL_CHALLENGES = challenges.length;

const percent = (done: number, total: number) => (total > 0 ? Math.round((done / total) * 100) : 0);
const within = (href: string, prefix: string) => href === prefix || href.startsWith(`${prefix}/`);

/** A topic counts as opened when the learner opened it or any page below it. */
const isOpened = (topic: Topic, progress: UserProgress) =>
  progress.visitedPages.some((path) => within(path, topic.route)) || Boolean(progress.quizScores[selfCheckId(topic.route)]);
const isDone = (topic: Topic, progress: UserProgress) => progress.completedTopics.includes(topic.route);

function titleOf(path: string): string {
  const exact = getTopic(path);
  if (exact) return exact.title;
  const parent = [...PATH].sort((a, b) => b.route.length - a.route.length).find((topic) => within(path, topic.route));
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
  const title = entry.ref.startsWith("topic:") ? `Auto-évaluation : ${titleOf(entry.ref.slice("topic:".length))}` : `Quiz : ${labelOf(entry.ref)}`;
  return {
    id,
    type: "quiz",
    title,
    timestamp,
    score,
    result: score === undefined ? undefined : score >= 80 ? "success" : score >= 50 ? "partial" : "failed",
  };
}

function learningPaths(progress: UserProgress): LearningPathStats[] {
  return AREAS.filter((area) => area.id !== "tools")
    .map((area) => {
      const lessons = lessonsOf(area);
      const done = lessons.filter((topic) => isDone(topic, progress));
      const started = lessons.filter((topic) => !isDone(topic, progress) && isOpened(topic, progress));
      const next = lessons.find((topic) => !isDone(topic, progress)) ?? lessons[0];
      return {
        id: area.id,
        title: area.title,
        description: area.description,
        icon: AREA_ICON[area.id] ?? "practice",
        progress: percent(done.length, lessons.length),
        totalModules: lessons.length,
        completedModules: done.length,
        startedModules: started.length,
        minutesLeft: lessons.filter((topic) => !isDone(topic, progress)).reduce((sum, topic) => sum + topic.minutes, 0),
        href: next?.route ?? area.route ?? ROOT,
      };
    })
    .filter((path) => path.totalModules > 0);
}

/** A finished topic counts fully, a topic only opened counts a little: the radar moves as soon as the learner starts. */
const STARTED_WEIGHT = 0.35;

function skillLevels(progress: UserProgress): Record<SkillKey, number> {
  const coverage = (areaIds: string[]) => {
    const lessons = AREAS.filter((area) => areaIds.includes(area.id)).flatMap(lessonsOf);
    const done = lessons.filter((topic) => isDone(topic, progress)).length;
    const started = lessons.filter((topic) => !isDone(topic, progress) && isOpened(topic, progress)).length;
    return Math.min(100, percent(done + started * STARTED_WEIGHT, lessons.length));
  };

  const scores = Object.values(progress.quizScores);
  const parts: number[] = [];
  if (TOTAL_CHALLENGES > 0 && progress.challengesCompleted.length > 0) {
    parts.push(percent(progress.challengesCompleted.length, TOTAL_CHALLENGES));
  }
  if (scores.length > 0) {
    parts.push(Math.round(scores.reduce((sum, quiz) => sum + (quiz.score / quiz.total) * 100, 0) / scores.length));
  }

  return {
    algorithms: coverage(SKILL_AREAS.algorithms),
    dataStructures: coverage(SKILL_AREAS.dataStructures),
    systemDesign: coverage(SKILL_AREAS.systemDesign),
    frontend: coverage(SKILL_AREAS.frontend),
    backend: coverage(SKILL_AREAS.backend),
    problemSolving: parts.length ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : 0,
    communication: coverage(SKILL_AREAS.communication),
  };
}

const EXPLORER_TARGET = 25;
const FINISHER_TARGET = 10;
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
  const completed = progress.completedTopics.length;

  const make = (
    base: Pick<AchievementStats, "id" | "title" | "description" | "icon">,
    progressPercent: number,
    unlockedAt: Date | undefined,
  ): AchievementStats => {
    const isUnlocked = progressPercent >= 100;
    return { ...base, isUnlocked, progress: Math.min(100, progressPercent), unlockedAt: isUnlocked ? unlockedAt : undefined };
  };

  return [
    make({ id: "first-steps", title: "Premiers pas", description: "Ouvrir votre premier sujet", icon: "compass" }, visited > 0 ? 100 : 0, at(learning[0])),
    make(
      { id: "first-completed", title: "Premier sujet maîtrisé", description: "Marquer un sujet comme terminé", icon: "award" },
      completed > 0 ? 100 : 0,
      at(learning.find((entry) => progress.completedTopics.includes(entry.ref))),
    ),
    make(
      { id: "first-challenge", title: "Premier défi", description: "Réussir votre premier défi de code", icon: "trophy" },
      progress.challengesCompleted.length > 0 ? 100 : 0,
      at(firstChallenge),
    ),
    make(
      { id: "consistent-learner", title: "Régularité", description: `Apprendre ${STREAK_TARGET} jours de suite`, icon: "flame" },
      percent(Math.min(streak, STREAK_TARGET), STREAK_TARGET),
      lastActivityAt ?? undefined,
    ),
    make(
      { id: "quiz-ace", title: "As de l'auto-évaluation", description: `Obtenir ${QUIZ_ACE_PERCENT} % ou plus à un questionnaire`, icon: "target" },
      quizAce ? 100 : 0,
      at(quizAce),
    ),
    make(
      { id: "explorer", title: "Explorateur", description: `Ouvrir ${EXPLORER_TARGET} sujets différents`, icon: "compass" },
      percent(Math.min(visited, EXPLORER_TARGET), EXPLORER_TARGET),
      at(learning[EXPLORER_TARGET - 1]),
    ),
    make(
      { id: "finisher", title: "Assidu", description: `Terminer ${FINISHER_TARGET} sujets`, icon: "award" },
      percent(Math.min(completed, FINISHER_TARGET), FINISHER_TARGET),
      lastActivityAt ?? undefined,
    ),
    make(
      { id: "path-master", title: "Domaine maîtrisé", description: "Terminer tous les sujets d'un domaine", icon: "trophy" },
      completedPath ? 100 : Math.max(0, ...paths.map((path) => path.progress)),
      lastActivityAt ?? undefined,
    ),
  ];
}

export function deriveProgressStats(progress: UserProgress, now: Date = new Date()): ProgressStats {
  const streakDays = computeStreak(progress.streakDates, now);
  const paths = learningPaths(progress);

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

  const checks = PATH.map((topic) => progress.quizScores[selfCheckId(topic.route)]).filter((score): score is NonNullable<typeof score> => Boolean(score));
  const upNext = nextToLearn(progress);
  const hasActivity =
    progress.visitedPages.length > 0 ||
    progress.completedTopics.length > 0 ||
    progress.challengesCompleted.length > 0 ||
    Object.keys(progress.quizScores).length > 0;

  return {
    hasActivity,
    challengesCompleted: progress.challengesCompleted.length,
    totalChallenges: TOTAL_CHALLENGES,
    streakDays,
    lastActivityAt,
    totalTimeMinutes: progress.totalTimeMinutes,
    pagesVisited: PATH.filter((topic) => isOpened(topic, progress)).length,
    totalPages: TOTAL_PAGES,
    topicsCompleted: PATH.filter((topic) => isDone(topic, progress)).length,
    totalTopics: PATH.length,
    selfChecksTaken: checks.length,
    selfCheckAverage: checks.length === 0 ? null : Math.round((checks.reduce((sum, score) => sum + score.score / score.total, 0) / checks.length) * 100),
    next: upNext
      ? {
          href: upNext.route,
          title: upNext.title,
          area: AREAS.find((area) => area.topics.includes(upNext))?.title ?? "TechMastery",
          minutes: upNext.minutes,
          kind: hasActivity ? "continue" : "start",
        }
      : null,
    skillLevels: skillLevels(progress),
    recentActivities: [...progress.activityLog].reverse().slice(0, 8).map(activityOf),
    learningPaths: paths,
    achievements: achievements(progress, streakDays, paths, lastActivityAt),
    activityByDay,
  };
}
