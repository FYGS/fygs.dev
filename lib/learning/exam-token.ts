import { createHmac, timingSafeEqual } from "node:crypto";
import { deriveKey } from "@/lib/secret";

/**
 * The proof that a sitting was started by this learner for this exam. The token names the sitting (an `ExamAttempt`
 * row, or a `preview-<time>` id for the author who tries their own exam) and carries an HMAC made with a key derived
 * for this purpose only (lib/secret.ts). The start time and the right to submit live in the database: the token alone
 * grants nothing, and submitting claims the row once, so a token cannot be replayed.
 */

const PREVIEW_PREFIX = "preview-";

function mac(userId: string, examId: string, attemptId: string): string {
  return createHmac("sha256", deriveKey("exam-attempt"))
    .update(`exam:${userId}:${examId}:${attemptId}`)
    .digest("base64url");
}

export function signExamAttempt(userId: string, examId: string, attemptId: string): string {
  return `${attemptId}.${mac(userId, examId, attemptId)}`;
}

/** The sitting id inside a token made for this learner and this exam, or null if it was altered or is malformed. */
export function verifyExamAttempt(token: string, userId: string, examId: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0 || dot === token.length - 1) return null;
  const attemptId = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(mac(userId, examId, attemptId));
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return attemptId;
}

/** Id of the throw-away sitting of an author previewing their exam (nothing is stored for it). */
export const previewAttemptId = (startedAt: number) => `${PREVIEW_PREFIX}${startedAt}`;
export const isPreviewAttempt = (attemptId: string) => attemptId.startsWith(PREVIEW_PREFIX);
export const previewAttemptStart = (attemptId: string): number | null => {
  const start = Number(attemptId.slice(PREVIEW_PREFIX.length));
  return Number.isInteger(start) ? start : null;
};
