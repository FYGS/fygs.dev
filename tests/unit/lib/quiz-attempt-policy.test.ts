import { describe, expect, it } from "vitest";
import {
  QUIZ_ATTEMPT_TTL_HOURS,
  QUIZ_COOLDOWN_MINUTES,
  QUIZ_MAX_ATTEMPTS_PER_DAY,
  canStartQuizAttempt,
  formatRetryDelay,
  quizAttemptExpiry,
  quizDayStart,
} from "@/lib/quiz-attempt-policy";

const NOW = new Date("2026-10-20T12:00:00Z");
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000);
const hoursAgo = (h: number) => minutesAgo(h * 60);

describe("canStartQuizAttempt", () => {
  it("allows the first sitting", () => {
    expect(canStartQuizAttempt([], NOW)).toEqual({ allowed: true });
  });

  it("blocks during the cooldown and says when it ends", () => {
    const decision = canStartQuizAttempt([minutesAgo(2)], NOW);

    expect(decision).toMatchObject({ allowed: false, reason: "COOLDOWN" });
    if (!decision.allowed) {
      expect(decision.retryAt.toISOString()).toBe(minutesAgo(2 - QUIZ_COOLDOWN_MINUTES).toISOString());
    }
  });

  it("allows again exactly when the cooldown has passed", () => {
    expect(canStartQuizAttempt([minutesAgo(QUIZ_COOLDOWN_MINUTES)], NOW)).toEqual({ allowed: true });
    expect(canStartQuizAttempt([minutesAgo(QUIZ_COOLDOWN_MINUTES - 0.5)], NOW)).toMatchObject({ allowed: false });
  });

  it("the cooldown runs from the most recent sitting", () => {
    expect(canStartQuizAttempt([hoursAgo(5), minutesAgo(1), hoursAgo(3)], NOW)).toMatchObject({
      allowed: false,
      reason: "COOLDOWN",
    });
  });

  it("blocks once the daily cap is reached, until the oldest sitting leaves the 24 hours", () => {
    const sittings = Array.from({ length: QUIZ_MAX_ATTEMPTS_PER_DAY }, (_, i) => hoursAgo(2 + i * 4)); // 2h..18h ago
    const decision = canStartQuizAttempt(sittings, NOW);

    expect(decision).toMatchObject({ allowed: false, reason: "DAILY_LIMIT" });
    if (!decision.allowed) expect(decision.retryAt.toISOString()).toBe(hoursAgo(18 - 24).toISOString());
  });

  it("one under the cap is still allowed", () => {
    const sittings = Array.from({ length: QUIZ_MAX_ATTEMPTS_PER_DAY - 1 }, (_, i) => hoursAgo(2 + i * 4));
    expect(canStartQuizAttempt(sittings, NOW)).toEqual({ allowed: true });
  });

  it("sittings older than 24 hours no longer count", () => {
    const old = Array.from({ length: 10 }, (_, i) => hoursAgo(25 + i));
    expect(canStartQuizAttempt(old, NOW)).toEqual({ allowed: true });
  });
});

describe("window helpers", () => {
  it("an unfinished sitting expires after the TTL", () => {
    expect(quizAttemptExpiry(NOW).toISOString()).toBe(hoursAgo(QUIZ_ATTEMPT_TTL_HOURS).toISOString());
  });

  it("the daily window starts 24 hours back", () => {
    expect(quizDayStart(NOW).toISOString()).toBe(hoursAgo(24).toISOString());
  });
});

describe("formatRetryDelay", () => {
  it.each([
    [0.1, "dans 1 min"],
    [1, "dans 1 min"],
    [3.2, "dans 4 min"],
    [59, "dans 59 min"],
    [60, "dans 1 h"],
    [130, "dans 2 h 10 min"],
  ])("%d minutes -> %s", (minutes, label) => {
    expect(formatRetryDelay(new Date(NOW.getTime() + minutes * 60_000), NOW)).toBe(label);
  });

  it("never says zero or negative", () => {
    expect(formatRetryDelay(minutesAgo(5), NOW)).toBe("dans 1 min");
  });
});
