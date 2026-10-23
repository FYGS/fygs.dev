import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canOpenItem, outlineHasFlaggedPreview, resolveLearnerAccess, type LearnerMode } from "./access";
import { loadLearnerCourseState, type LearnerCourseState } from "./course-state";
import type { OutlineItem } from "./outline";

export interface LearningPageContext {
  user: { id: string; name: string | null; email: string };
  course: { id: string; title: string; slug: string; published: boolean; instructorId: string | null };
  mode: Exclude<LearnerMode, "none">;
  state: LearnerCourseState;
  hasFlaggedPreview: boolean;
  supportCount: number;
  /** Whether the visitor may open this item (see lib/learning/access.ts). */
  canOpen: (item: OutlineItem) => boolean;
}

/**
 * Session, course, access mode and learner state of a /learn/[slug] request. The layout and the
 * page of the same request share one load (React cache). Redirects to the login, 404s or sends
 * to the course page when there is nothing to show.
 */
export const getLearningContext = cache(async (slug: string): Promise<LearningPageContext> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/learn/${slug}`)}`);

  const course = await db.course.findUnique({
    where: { slug },
    select: { id: true, title: true, slug: true, published: true, instructorId: true },
  });
  if (!course) notFound();

  const access = await resolveLearnerAccess({ userId: session.user.id, role: session.user.role, course });
  if (access.mode === "none") {
    redirect(`/formations/${course.slug}?locked=1&reason=${access.reason ?? "not_enrolled"}`);
  }
  const mode = access.mode;

  const [state, supportCount] = await Promise.all([
    loadLearnerCourseState(session.user.id, course.id),
    db.visualSupport.count({ where: { courseId: course.id } }),
  ]);
  const hasFlaggedPreview = outlineHasFlaggedPreview(state.outline);

  return {
    user: { id: session.user.id, name: session.user.name ?? null, email: session.user.email },
    course,
    mode,
    state,
    hasFlaggedPreview,
    supportCount,
    canOpen: (item) => canOpenItem(mode, item, state.outline, hasFlaggedPreview),
  };
});
