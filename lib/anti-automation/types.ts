/**
 * Contract of the anti-automation layer (implemented in lib/anti-automation/*). Callers depend on this file only.
 *
 * A "human proof" is a small signed proof-of-work the browser computes in the background before a sensitive request:
 * cheap for one visitor, expensive for a script that fires thousands. It travels in the `x-human-proof` header.
 * It complements, and never replaces, rate limits and server-side validation.
 */

export const HUMAN_PROOF_ACTIONS = [
  "sign-up",
  "sign-in",
  "password-reset",
  "contact",
  "review",
  "community-post",
  "ai-guest",
] as const;

export type HumanProofAction = (typeof HUMAN_PROOF_ACTIONS)[number];

export type HumanProofResult =
  | { ok: true }
  | { ok: false; status: 400 | 403 | 429; error: string };

/** Header carrying the proof. */
export const HUMAN_PROOF_HEADER = "x-human-proof";
