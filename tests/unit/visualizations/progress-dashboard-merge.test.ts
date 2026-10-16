import { describe, it, expect } from "vitest";
import { mergeProgressData } from "@/app/[locale]/(main)/tech-mastry/dashboard/_components/progress-dashboard/merge-progress";
import { mockProgressData } from "@/app/[locale]/(main)/tech-mastry/dashboard/_components/progress-dashboard/mock-data";

describe("mergeProgressData", () => {
  it("keeps the mock values when the real progress is lower", () => {
    const merged = mergeProgressData(mockProgressData, { streakDays: 1, challengesCompleted: 2 });
    expect(merged.streakDays).toBe(7);
    expect(merged.challengesCompleted).toBe(42);
  });

  it("takes the real values when they are higher, leaving the rest untouched", () => {
    const merged = mergeProgressData(mockProgressData, { streakDays: 20, challengesCompleted: 100 });
    expect(merged.streakDays).toBe(20);
    expect(merged.challengesCompleted).toBe(100);
    expect(merged.skillLevels).toBe(mockProgressData.skillLevels);
    expect(merged.achievements).toBe(mockProgressData.achievements);
    expect(merged).not.toBe(mockProgressData);
  });
});
