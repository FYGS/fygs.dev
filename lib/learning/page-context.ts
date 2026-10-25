import { cache } from "react";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { findRedirectedCourseSlug } from "@/lib/courses/slug-redirect";
import { canOpenItem, resolveLearnerAccess, type LearnerMode } from "./access";
import { emptyLearnerState, loadCourseOutline, loadLearnerCourseState, type LearnerCourseState } from "./course-state";
import type { OutlineItem } from "./outline";
import { LEARN_PATH_HEADER, returnPathFor } from "./request-path";

export interface LearningPageContext {
  /** `null` for a visitor without an account (free sample lessons only). */
  user: { id: string; name: string | null; email: string } | null;
  course: { id: string; title: string; slug: string; published: boolean; instructorId: string | null };
  mode: Exclude<LearnerMode, "none">;
  state: LearnerCourseState;
  /** Ids of the free sample lessons of the course. */
  previewLessonIds: string[];
  supportCount: number;
  /** Whether the visitor may open this item (see lib/learning/access.ts). */
  canOpen: (item: OutlineItem) => boolean;
  /** The step that was asked for (from the proxy), to come back to after signing in or opening the course. */
  returnTo: string;
}

/** The course page, telling why this step cannot be opened and where to come back. */
export const lockedHref = (courseSlug: string, reason: string, returnTo: string) =>
  `/formations/${courseSlug}?locked=1&reason=${reason}&from=${encodeURIComponent(returnTo)}`;

/**
 * For a step the visitor cannot open (a free sample visitor on a quiz, a lesson outside the sample...): a visitor
 * without an account signs in first, a learner is shown on the course page what opens it; both come back here.
 */
export function leaveStep(ctx: Pick<LearningPageContext, "user" | "course">, here: string): never {
  redirect(ctx.user ? lockedHref(ctx.course.slug, "not_enrolled", here) : learnLoginHref(here));
}

/** Where to send someone who must sign in to see this course: back here once signed in. */
export const learnLoginHref = (returnTo: string) => `/auth/login?callbackUrl=${encodeURIComponent(returnTo)}`;

/**
 * Session, course, access mode and learner state of a /learn/[slug] request. The layout and the
 * page of the same request share one load (React cache). A former address of the course redirects to
 * the current one; a course with nothing to show sends to the course page, which explains why (or to the
 * login when signing in may be enough).
 */
export const getLearningContext = cache(async (slug: string): Promise<LearningPageContext> => {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  const course = await db.course.findUnique({
    where: { slug },
    select: { id: true, title: true, slug: true, published: true, instructorId: true },
  });
  if (!course) {
    const current = await findRedirectedCourseSlug(slug);
    if (current) permanentRedirect(`/learn/${current}`);
    notFound();
  }

  const returnTo = returnPathFor(course.slug, requestHeaders.get(LEARN_PATH_HEADER));
  const publishedOutline = await loadCourseOutline(course.id);
  const access = await resolveLearnerAccess({
    userId: session?.user?.id ?? null,
    role: session?.user?.role,
    course,
    outline: publishedOutline,
  });
  if (access.mode === "none") {
    // A visitor may simply need to sign in (enrolled elsewhere, free course); the course page says what is needed
    if (!session?.user) redirect(learnLoginHref(returnTo));
    redirect(lockedHref(course.slug, access.reason ?? "not_enrolled", returnTo));
  }
  const mode = access.mode;
  // The author sees the course as it will be: draft lessons and the unpublished exam are in their outline, marked
  const outline = mode === "staff" ? await loadCourseOutline(course.id, { includeDrafts: true }) : publishedOutline;
  const preview = new Set(access.previewLessonIds);

  const [state, supportCount] = await Promise.all([
    session?.user ? loadLearnerCourseState(session.user.id, course.id, outline) : emptyLearnerState(outline),
    db.visualSupport.count({ where: { courseId: course.id } }),
  ]);

  return {
    user: session?.user ? { id: session.user.id, name: session.user.name ?? null, email: session.user.email } : null,
    course,
    mode,
    state,
    previewLessonIds: access.previewLessonIds,
    supportCount,
    canOpen: (item) => canOpenItem(mode, item, state.outline, preview),
    returnTo,
  };
});
