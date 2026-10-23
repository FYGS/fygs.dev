import { createHmac, timingSafeEqual } from "node:crypto";

function secret(): string {
  return process.env.BETTER_AUTH_SECRET || "build-time-placeholder-secret-not-for-production";
}

function mac(userId: string, examId: string, startedAt: number): string {
  return createHmac("sha256", secret()).update(`exam:${userId}:${examId}:${startedAt}`).digest("base64url");
}

/** Proof of when a sitting started. The exam keeps no attempt row, so the start time travels signed. */
export function signExamStart(userId: string, examId: string, startedAt: number): string {
  return `${startedAt}.${mac(userId, examId, startedAt)}`;
}

/** The start time inside a token made for this learner and this exam, or null if it was altered. */
export function verifyExamStart(token: string, userId: string, examId: string): number | null {
  const [rawTime, signature] = token.split(".");
  const startedAt = Number(rawTime);
  if (!signature || !Number.isInteger(startedAt)) return null;
  const expected = Buffer.from(mac(userId, examId, startedAt));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return startedAt;
}
