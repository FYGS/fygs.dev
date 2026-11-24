import { AREAS, PATH, getTopic, lessonsOf, type Topic } from "../_catalog";
import type { UserProgress } from "./progress-model";

/** The id under which the score of a topic's self-check is stored in `quizScores`. */
export const selfCheckId = (route: string) => `topic:${route}`;

export type TopicStatus = "done" | "started" | "new";

/** Done = marked as done by the learner; started = opened (or self-checked) without being marked. */
export function topicStatus(progress: UserProgress, route: string): TopicStatus {
  if (progress.completedTopics.includes(route)) return "done";
  if (progress.visitedPages.includes(route) || progress.quizScores[selfCheckId(route)]) return "started";
  return "new";
}

export interface AreaProgress {
  done: number;
  total: number;
  percent: number;
  /** Minutes of the lessons that are not done yet */
  minutesLeft: number;
  /** Mean of the best self-check scores, in percent, or null when no self-check was taken */
  selfCheckAverage: number | null;
}

export function areaProgress(progress: UserProgress, area: { topics: Topic[] }): AreaProgress {
  const lessons = lessonsOf(area);
  const done = lessons.filter((topic) => progress.completedTopics.includes(topic.route));
  const scores = lessons
    .map((topic) => progress.quizScores[selfCheckId(topic.route)])
    .filter((score): score is NonNullable<typeof score> => Boolean(score))
    .map((score) => score.score / score.total);
  return {
    done: done.length,
    total: lessons.length,
    percent: lessons.length === 0 ? 0 : Math.round((done.length / lessons.length) * 100),
    minutesLeft: lessons.filter((topic) => !done.includes(topic)).reduce((sum, topic) => sum + topic.minutes, 0),
    selfCheckAverage: scores.length === 0 ? null : Math.round((scores.reduce((sum, value) => sum + value, 0) / scores.length) * 100),
  };
}

export function pathProgress(progress: UserProgress): AreaProgress {
  return areaProgress(progress, { topics: PATH });
}

/**
 * What to learn next: the first topic of the path that is not done and whose prerequisites are, starting after the
 * last topic the learner finished. Falls back to the first topic not done, and to null when everything is done.
 */
export function nextToLearn(progress: UserProgress): Topic | null {
  const done = new Set(progress.completedTopics);
  const lastDone = PATH.reduce((last, topic, index) => (done.has(topic.route) ? index : last), -1);
  const ready = (topic: Topic) => !done.has(topic.route) && (topic.prerequisites ?? []).every((needed) => done.has(needed));
  const ordered = [...PATH.slice(lastDone + 1), ...PATH.slice(0, lastDone + 1)];
  return ordered.find(ready) ?? ordered.find((topic) => !done.has(topic.route)) ?? null;
}

/** The prerequisites of a topic the learner has not finished. */
export function missingPrerequisites(progress: UserProgress, route: string): Topic[] {
  return (getTopic(route)?.prerequisites ?? [])
    .filter((needed) => !progress.completedTopics.includes(needed))
    .map((needed) => getTopic(needed))
    .filter((topic): topic is Topic => Boolean(topic));
}

export { AREAS };
