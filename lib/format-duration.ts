/**
 * Durations are stored in two units: a lesson in seconds, a course in minutes (the author's estimate).
 * Everything displayed goes through these functions; the duration of a course is `displayedCourseMinutes`.
 */

/** "45 min", "1 h", "2 h 05". Under a minute: "< 1 min". */
export function formatMinutes(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return "";
  const total = Math.round(minutes);
  if (total < 1) return "< 1 min";
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

/** Same for a duration in seconds: "45 s", "12 min", "1 h 05". */
export function formatSeconds(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "";
  if (seconds < 60) return `${Math.round(seconds)} s`;
  return formatMinutes(Math.round(seconds / 60));
}

/** Course duration in minutes from lesson durations in seconds (published lessons only). */
export function courseMinutesFromLessons(lessonSeconds: readonly (number | null)[]): number {
  const total = lessonSeconds.reduce<number>((sum, s) => sum + (s && s > 0 ? s : 0), 0);
  return total === 0 ? 0 : Math.max(1, Math.round(total / 60));
}

/**
 * The duration shown for a course, the same on every screen (catalogue, course page, paths, back office): the total of
 * its published lessons when they announce one, else the author's estimate (`Course.duration`, minutes), else 0.
 */
export function displayedCourseMinutes(lessonMinutes: number, manualMinutes: number | null | undefined): number {
  if (lessonMinutes > 0) return lessonMinutes;
  return manualMinutes && manualMinutes > 0 ? manualMinutes : 0;
}
