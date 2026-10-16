import type { ProgressStats } from "./types";

// Merge the real (localStorage) progress into the mock data: the best value wins
export function mergeProgressData(
  base: ProgressStats,
  real: { streakDays: number; challengesCompleted: number },
): ProgressStats {
  return {
    ...base,
    streakDays: Math.max(real.streakDays, base.streakDays),
    challengesCompleted: Math.max(
      real.challengesCompleted,
      base.challengesCompleted,
    ),
  };
}
