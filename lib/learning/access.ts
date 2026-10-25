import {
  getEntitlements,
  previewLessonIds,
  type EntitlementSource,
  type LapsedReason,
} from "@/lib/access/entitlement";
import { loadCourseOutline } from "./course-state";
import type { CourseOutline, OutlineItem } from "./outline";

/**
 * How a visitor may use the learning area of one course (the rule itself is `lib/access/entitlement.ts`).
 * - `full`: enrolled and entitled, everything is open and progress is recorded.
 * - `staff`: the author (or an admin) looking at their own course, published or not; read only, nothing is recorded.
 * - `preview`: not entitled (or not signed in), but the published course has free sample lessons
 *   (`previewLessonIds`); they can be watched, nothing is recorded.
 * - `none`: nothing to see, the course page explains why.
 */
export type LearnerMode = "full" | "staff" | "preview" | "none";

export interface LearnerAccessInput {
  /** `null` for a visitor without an account. */
  userId: string | null;
  role?: string | null;
  course: {
    id: string;
    published: boolean;
    instructorId: string | null;
  };
  /** The outline already loaded by the caller (saves its queries). */
  outline?: CourseOutline;
}

export interface LearnerAccess {
  mode: LearnerMode;
  /** Why `none`: shown on the course page. */
  reason?: "not_enrolled" | "premium_locked" | "unpublished";
  signedIn: boolean;
  isEnrolled: boolean;
  /** An ACTIVE or TRIALING subscription: premium courses are open to it once enrolled. */
  hasActiveSubscription: boolean;
  /** What opens the course for this learner (`staff` for the author or an admin), or null. */
  source: EntitlementSource | null;
  /** Holds a right to the course; when not enrolled yet, one click on "Commencer" enrols them. */
  eligible: boolean;
  /** Enrolled, but the right ended: why. */
  lapsed: LapsedReason | null;
  /** The free sample lessons of the course (published lessons only). */
  previewLessonIds: string[];
}

export async function resolveLearnerAccess(input: LearnerAccessInput): Promise<LearnerAccess> {
  const { userId, role, course } = input;
  const [all, outline] = await Promise.all([
    getEntitlements(userId ? { id: userId, role } : null, [course.id]),
    input.outline ?? loadCourseOutline(course.id),
  ]);
  const entitlement = all.courses.get(course.id);
  const lessons = outline.items.flatMap((item) => (item.kind === "lesson" ? [{ id: item.id, isPreview: item.isPreview }] : []));
  const preview = [...previewLessonIds({ published: course.published, previewEnabled: entitlement?.previewEnabled ?? false }, lessons)];

  const base = {
    signedIn: all.signedIn,
    isEnrolled: entitlement?.enrolled ?? false,
    hasActiveSubscription: all.hasActiveSubscription,
    source: entitlement?.source ?? null,
    eligible: entitlement?.eligible ?? false,
    lapsed: entitlement?.lapsed ?? null,
    previewLessonIds: preview,
  };

  if (entitlement?.entitled && entitlement.source === "staff") return { mode: "staff", ...base };
  if (!course.published) return { mode: "none", reason: "unpublished", ...base };
  if (entitlement?.entitled) return { mode: "full", ...base };
  if (preview.length > 0) return { mode: "preview", ...base };
  return { mode: "none", reason: base.isEnrolled ? "premium_locked" : "not_enrolled", ...base };
}

/**
 * Whether `item` can be opened in `mode`. In preview mode only the free sample lessons open; quizzes and the exam
 * need full access (they record results); the staff may open anything.
 *
 * `preview` is the set of sample lesson ids (`LearnerAccess.previewLessonIds`). A boolean is still accepted from
 * older callers and means "the outline has flagged lessons": then only flagged lessons open, otherwise the first one.
 */
export function canOpenItem(
  mode: LearnerMode,
  item: OutlineItem,
  outline: CourseOutline,
  preview: ReadonlySet<string> | readonly string[] | boolean,
): boolean {
  if (mode === "full" || mode === "staff") return true;
  if (mode === "none" || item.kind !== "lesson") return false;
  if (typeof preview !== "boolean") {
    return (preview instanceof Set ? preview : new Set(preview as readonly string[])).has(item.id);
  }
  if (item.isPreview) return true;
  if (preview) return false;
  const first = outline.items.find((i) => i.kind === "lesson");
  return first?.id === item.id;
}

export function outlineHasFlaggedPreview(outline: CourseOutline): boolean {
  return outline.items.some((i) => i.kind === "lesson" && i.isPreview);
}

/** The author of the course or an admin: they may look at everything, nothing they do is recorded. */
export async function isCourseStaff(userId: string, courseId: string): Promise<boolean> {
  const all = await getEntitlements(userId, [courseId]);
  return all.courses.get(courseId)?.isStaff ?? false;
}
