import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  session: { user: { id: "user-1", role: "STUDENT" } } as { user: { id: string; role: string } } | null,
  allowed: true,
  record: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn(async () => m.session) } } }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn(async () => ({ allowed: m.allowed })) }));
vi.mock("@/lib/learning/lesson-progress", () => ({ recordLessonProgress: m.record }));

import { updateLessonProgress } from "@/app/[locale]/(main)/dashboard/actions/updateLessonProgress";
import { checkRateLimit } from "@/lib/rate-limit";

beforeEach(() => {
  vi.clearAllMocks();
  m.session = { user: { id: "user-1", role: "STUDENT" } };
  m.allowed = true;
  m.record.mockResolvedValue({ success: true });
});

describe("updateLessonProgress", () => {
  it("limits the reports of one learner, not of one address", async () => {
    await updateLessonProgress({ lessonId: "clesson123456789012345678" });
    expect(checkRateLimit).toHaveBeenCalledWith(expect.anything(), "lesson-progress", expect.objectContaining({ subject: "user:user-1" }));
    expect(m.record).toHaveBeenCalledTimes(1);
  });

  it("answers RATE_LIMITED without recording anything when the learner goes over the limit", async () => {
    m.allowed = false;
    const result = await updateLessonProgress({ lessonId: "clesson123456789012345678", completed: true });
    expect(result).toMatchObject({ success: false, error: "RATE_LIMITED" });
    expect(m.record).not.toHaveBeenCalled();
  });

  it("leaves a visitor without session to the rule that refuses it", async () => {
    m.session = null;
    await updateLessonProgress({ lessonId: "clesson123456789012345678" });
    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(m.record).toHaveBeenCalledWith(null, expect.anything());
  });
});
