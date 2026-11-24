/**
 * New accounts get tighter caps. Mass-registered accounts are fresh by definition, and the first hours of a real
 * account are rarely spent posting dozens of reviews or questions to the AI tutor.
 *
 *   const limit = penalizedLimit(20, user);        // 20 for an established account, 5 for one created an hour ago
 *   await enforceRateLimit(req, "review", { limit, windowSeconds: 3600, subject: `user:${user.id}` });
 *
 * The multiplier applies to the LIMIT of an action (never below 1); an established, verified account is not touched.
 */

const HOUR_MS = 60 * 60 * 1000;

export interface AccountAge {
  createdAt: Date | string | number;
  emailVerified?: boolean | null;
}

/** 1 for an established account; smaller (down to 0.125) for a recent or unverified one. */
export function newAccountPenalty(user: AccountAge, nowMs = Date.now()): number {
  const created = new Date(user.createdAt).getTime();
  if (!Number.isFinite(created)) return 0.25; // an account whose age cannot be told is treated as new
  const age = nowMs - created;

  let multiplier = 1;
  if (age < HOUR_MS) multiplier = 0.25;
  else if (age < 24 * HOUR_MS) multiplier = 0.5;
  else if (age < 7 * 24 * HOUR_MS) multiplier = 0.75;

  if (user.emailVerified === false) multiplier *= 0.5;
  return multiplier;
}

/** `limit` scaled by the penalty, at least 1. */
export function penalizedLimit(limit: number, user: AccountAge, nowMs = Date.now()): number {
  return Math.max(1, Math.floor(limit * newAccountPenalty(user, nowMs)));
}
