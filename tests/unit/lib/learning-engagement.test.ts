import { describe, expect, it } from "vitest";
import {
  FIRST_REPORT_MAX_SECONDS,
  MAX_COMPLETIONS_PER_DAY,
  MIN_DWELL_SECONDS,
  REPORT_SLACK_SECONDS,
  completionDecision,
  completionRefusalMessage,
  creditedSeconds,
  requiredWatchSeconds,
} from "@/lib/learning/engagement";
import { QUIZ_COOLDOWN_MINUTES, canStartQuizAttempt, sittingEndTimes } from "@/lib/quiz-attempt-policy";

describe("time a lesson needs before it can be completed", () => {
  it("is 80 % of a video of known duration", () => {
    expect(requiredWatchSeconds({ duration: 600, videoUrl: "https://cdn.test/v.mp4" })).toBe(480);
    expect(requiredWatchSeconds({ duration: 125, videoUrl: "https://cdn.test/v.mp4" })).toBe(100);
  });
  it("never goes under the short dwell time", () => {
    expect(requiredWatchSeconds({ duration: 10, videoUrl: "https://cdn.test/v.mp4" })).toBe(MIN_DWELL_SECONDS);
  });
  it("is the dwell time for a lesson without video or without duration", () => {
    expect(requiredWatchSeconds({ duration: null, videoUrl: null })).toBe(MIN_DWELL_SECONDS);
    expect(requiredWatchSeconds({ duration: 600, videoUrl: null })).toBe(MIN_DWELL_SECONDS);
    expect(requiredWatchSeconds({ duration: null, videoUrl: "https://cdn.test/v.mp4" })).toBe(MIN_DWELL_SECONDS);
    expect(requiredWatchSeconds({ duration: 0, videoUrl: "https://cdn.test/v.mp4" })).toBe(MIN_DWELL_SECONDS);
  });
});

describe("time credited by a report", () => {
  it("never exceeds the time that passed since the previous report, plus a little slack", () => {
    expect(creditedSeconds(7200, 10)).toBe(10 + REPORT_SLACK_SECONDS);
    expect(creditedSeconds(5, 10)).toBe(5);
    expect(creditedSeconds(30, 0)).toBe(REPORT_SLACK_SECONDS);
  });
  it("caps the very first report", () => {
    expect(creditedSeconds(7200, null)).toBe(FIRST_REPORT_MAX_SECONDS);
    expect(creditedSeconds(40, null)).toBe(40);
  });
  it("is whole and never negative", () => {
    expect(creditedSeconds(-5, 10)).toBe(0);
    expect(creditedSeconds(12.9, 100)).toBe(12);
    expect(creditedSeconds(10, -30)).toBe(REPORT_SLACK_SECONDS); // a clock that went back credits nothing extra
  });
});

describe("completionDecision", () => {
  const now = new Date("2026-10-23T12:00:00Z");
  const base = { watchTime: 100, requiredSeconds: 96, lastCompletionAt: null, completionsLast24h: 0, now };

  it("allows a lesson that was watched long enough", () => {
    expect(completionDecision(base)).toEqual({ allowed: true });
  });
  it("tells how much time is missing", () => {
    expect(completionDecision({ ...base, watchTime: 70 })).toEqual({ allowed: false, reason: "WATCH_MORE", remainingSeconds: 26 });
  });
  it("keeps two completions 20 seconds apart", () => {
    const decision = completionDecision({ ...base, lastCompletionAt: new Date(now.getTime() - 8_000) });
    expect(decision).toEqual({ allowed: false, reason: "TOO_FAST", remainingSeconds: 12 });
    expect(completionDecision({ ...base, lastCompletionAt: new Date(now.getTime() - 20_000) })).toEqual({ allowed: true });
  });
  it("stops at the daily limit", () => {
    expect(completionDecision({ ...base, completionsLast24h: MAX_COMPLETIONS_PER_DAY })).toEqual({ allowed: false, reason: "DAILY_LIMIT" });
    expect(completionDecision({ ...base, completionsLast24h: MAX_COMPLETIONS_PER_DAY - 1 })).toEqual({ allowed: true });
  });
  it("asks for the time first, then the pace", () => {
    const decision = completionDecision({ ...base, watchTime: 1, lastCompletionAt: now });
    expect(decision).toMatchObject({ reason: "WATCH_MORE" });
  });
  it("words what it asks of the learner", () => {
    expect(completionRefusalMessage({ allowed: false, reason: "WATCH_MORE", remainingSeconds: 40 })).toBe(
      "Prenez encore 40 s sur cette leçon avant de la marquer comme terminée.",
    );
    expect(completionRefusalMessage({ allowed: false, reason: "WATCH_MORE", remainingSeconds: 300 })).toMatch(/environ 5 min/);
    expect(completionRefusalMessage({ allowed: false, reason: "TOO_FAST", remainingSeconds: 7 })).toMatch(/7 s/);
    expect(completionRefusalMessage({ allowed: false, reason: "DAILY_LIMIT" })).toMatch(/demain/);
  });
});

describe("quiz sittings counted from their start", () => {
  const now = new Date("2026-10-23T12:00:00Z");
  const hoursAgo = (n: number) => new Date(now.getTime() - n * 3_600_000);

  it("counts a submitted sitting from its submission, an abandoned one from its start, not an open one", () => {
    const times = sittingEndTimes(
      [
        { startedAt: hoursAgo(5), submittedAt: hoursAgo(4.9) },
        { startedAt: hoursAgo(10), submittedAt: null }, // past its two hours: abandoned
        { startedAt: new Date(now.getTime() - 20 * 60_000), submittedAt: null }, // still open: the one being continued
      ],
      now,
    );
    expect(times).toEqual([hoursAgo(4.9), hoursAgo(10)]);
  });

  it("makes five abandoned sittings a day block the sixth like five submitted ones", () => {
    const abandoned = [20, 17, 14, 11, 8].map((h) => ({ startedAt: hoursAgo(h), submittedAt: null }));
    expect(canStartQuizAttempt(sittingEndTimes(abandoned, now), now)).toMatchObject({ allowed: false, reason: "DAILY_LIMIT" });
  });

  it("applies the waiting time to a sitting that was just abandoned", () => {
    const justExpired = [{ startedAt: new Date(now.getTime() - (2 * 60 + 2) * 60_000), submittedAt: null }];
    // started 2 h 2 min ago: the wait of QUIZ_COOLDOWN_MINUTES is over
    expect(canStartQuizAttempt(sittingEndTimes(justExpired, now), now)).toEqual({ allowed: true });
    expect(QUIZ_COOLDOWN_MINUTES).toBe(5);
  });
});
