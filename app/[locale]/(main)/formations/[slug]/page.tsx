import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { headers } from "next/headers";
import { Award, CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger, createLogger } from "@/lib/structured-logger";
import { Analytics } from "@/lib/analytics-helper";
import { CourseFaq } from "@/components/marketing/course-faq";
import { CourseTrailer } from "@/components/marketing/course-trailer";
import { Button } from "@/components/ui/button";
import { CoursePathBadges } from "@/components/paths/course-path-badges";
import { CourseOfferPanel, type OfferViewerState } from "@/app/_components/payment/course-offer-panel";
import { courseOffer } from "@/lib/access/offer";
import { findRedirectedCourseSlug } from "@/lib/courses/slug-redirect";
import { canOpenItem, resolveLearnerAccess } from "@/lib/learning/access";
import { loadCourseOutline, loadLearnerCourseState } from "@/lib/learning/course-state";
import { buildCurriculumView, curriculumStats } from "@/lib/learning/curriculum-view";
import { displayedCourseMinutes } from "@/lib/format-duration";
import { computeProgress, itemHref, type OutlineItem } from "@/lib/learning/outline";
import { getOwnReview, getReviewPage, getReviewSummary } from "@/lib/reviews/course-reviews";
import { CourseBreadcrumb } from "./_components/course-breadcrumb";
import { CourseCurriculum } from "./_components/course-curriculum";
import { CourseHeader } from "./_components/course-header";
import { CoursePublicContent } from "./_components/course-public-content";
import { CourseResumeBanner } from "./_components/course-resume-banner";
import { CourseReviews } from "./_components/course-reviews";
import { LockedNotice } from "./_components/locked-notice";
import { PaymentStatus } from "./_components/payment-status";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    success?: string;
    canceled?: string;
    preview?: string;
    locked?: string;
    /** The step of the learning area that sent the visitor here (sign-in comes back to it). */
    from?: string;
  }>;
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await db.course.findFirst({
    where: { slug, published: true },
    select: { title: true, description: true, thumbnail: true },
  });
  if (!course) return { title: "Formation introuvable", robots: { index: false } };

  const title = `${course.title} | Formations FYGS`;
  return {
    title,
    description: course.description,
    alternates: { canonical: `/formations/${slug}` },
    openGraph: {
      title,
      description: course.description,
      type: "website",
      url: `/formations/${slug}`,
      siteName: "FYGS Learning Platform",
      images: course.thumbnail ? [{ url: course.thumbnail, width: 1200, height: 630, alt: course.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: course.description,
      images: course.thumbnail ? [course.thumbnail] : [],
      creator: "@fernand_soualo",
    },
  };
}

export default async function CoursePage({ params, searchParams }: CoursePageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const correlationId = logger.generateCorrelationId();
  const courseLogger = createLogger({ operation: "course-page-view", correlationId, resourceType: "course", resourceId: slug });

  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user ?? null;
  courseLogger.info("Course page accessed", { userId: user?.id, resourceId: slug, metadata: { authenticated: !!user } });

  const course = await db.course.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      thumbnail: true,
      price: true,
      category: true,
      level: true,
      published: true,
      accessTier: true,
      duration: true,
      instructorId: true,
      instructor: { select: { name: true } },
      updatedAt: true,
      trailerUrl: true,
      faq: true,
      objectives: true,
      publicStructure: true,
      publicResources: true,
      publicEvaluation: true,
      publicPrerequisites: true,
      tags: { select: { tag: { select: { name: true, color: true } } } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    // A former address of a course leads to its current one
    const current = await findRedirectedCourseSlug(slug);
    if (current) permanentRedirect(`/formations/${current}`);
    notFound();
  }

  // A draft is shown to its author (or an admin) who asks for the preview
  const isStaff = !!user && (user.role === "ADMIN" || (user.role === "INSTRUCTOR" && course.instructorId === user.id));
  if (!course.published && !(query.preview === "true" && isStaff)) notFound();

  const outline = await loadCourseOutline(course.id);
  const [state, access, resourceCount, certificate, summary, firstReviews, ownReview] = await Promise.all([
    user ? loadLearnerCourseState(user.id, course.id, outline) : Promise.resolve(null),
    resolveLearnerAccess({ userId: user?.id ?? null, role: user?.role, course, outline }),
    db.lessonResource.count({ where: { lesson: { courseId: course.id, published: true } } }),
    // A certificate stays the learner's, whatever happens to their access
    user
      ? db.certificate.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } }, select: { id: true } })
      : Promise.resolve(null),
    getReviewSummary(course.id),
    getReviewPage({ courseId: course.id, viewerId: user?.id ?? null }),
    user ? getOwnReview(user.id, course.id) : Promise.resolve(null),
  ]);

  if (user) {
    await Analytics.courseCardViewed(user.id, {
      courseId: course.id,
      courseSlug: slug,
      courseTier: course.accessTier,
      hasActiveSubscription: access.hasActiveSubscription,
      isEnrolled: access.isEnrolled,
      correlationId,
    });
  }

  const progress = state?.progress ?? computeProgress(outline, { completedLessonIds: new Set(), passedQuizIds: new Set(), examPassed: false });
  const isDone = (item: OutlineItem) =>
    !state ? false : item.kind === "lesson" ? state.completedLessonIds.has(item.id) : item.kind === "quiz" ? state.passedQuizIds.has(item.id) : state.examPassed;

  const entitled = access.mode === "full";
  const previewIds = new Set(access.previewLessonIds);
  const canOpen = (item: OutlineItem) => canOpenItem(access.mode, item, outline, previewIds);

  // "Aperçu gratuit" marks the lessons the sample rule opens (flagged ones, and the first one when the course offers it)
  const sections = buildCurriculumView(outline, course.slug, { isDone, nextId: entitled ? (progress.next?.id ?? null) : null, canOpen }).map(
    (section) => ({ ...section, items: section.items.map((item) => ({ ...item, isPreview: !entitled && previewIds.has(item.id) })) }),
  );
  const stats = curriculumStats(outline);
  const minutes = displayedCourseMinutes(stats.minutes, course.duration);
  const nextSection = progress.next ? sections.findIndex((s) => s.items.some((i) => i.id === progress.next?.id)) : -1;

  const offer = courseOffer(course.accessTier, course.price);
  const viewerState: OfferViewerState = !user
    ? "anonymous"
    : access.mode === "staff"
      ? "staff"
      : entitled
        ? "entitled"
        : access.lapsed
          ? "lapsed"
          : access.eligible
            ? "eligible"
            : "none";
  const paymentPending = query.success === "true" && !entitled;
  const returnTo =
    query.from && query.from.startsWith(`/learn/${course.slug}`) ? query.from : `/formations/${course.slug}`;

  const offerPanel = (
      <CourseOfferPanel
        course={{ id: course.id, slug: course.slug, title: course.title }}
        offer={offer}
        state={viewerState}
        source={access.source}
        lapsed={access.lapsed}
        continueHref={progress.next ? itemHref(course.slug, progress.next) : `/learn/${course.slug}`}
        continueLabel={progress.done > 0 ? (progress.next ? "Reprendre la formation" : "Revoir la formation") : "Commencer la formation"}
        hasPreview={previewIds.size > 0}
        paymentPending={paymentPending}
        includes={{
          lessons: stats.lessons,
          minutes,
          resources: resourceCount,
          quizzes: stats.quizzes,
          hasExam: stats.hasExam,
        }}
      />
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="container mx-auto max-w-7xl py-8">
        <CourseBreadcrumb courseTitle={course.title} />

        {query.success === "true" && (
          <PaymentStatus type="success" courseTitle={course.title} courseSlug={course.slug} unlocked={entitled} />
        )}
        {query.canceled === "true" && (
          <PaymentStatus type="canceled" courseTitle={course.title} courseSlug={course.slug} unlocked={entitled} />
        )}
        {access.mode === "staff" && (
          <p role="note" className="mb-6 flex flex-wrap items-center gap-3 rounded-md border border-dashed bg-muted/40 p-3 text-sm">
            <span className="flex-1">
              Aperçu auteur{course.published ? "" : " (formation non publiée)"} : vous voyez la page comme un visiteur.
            </span>
            <Button asChild size="sm" variant="outline">
              <Link href={`/learn/${course.slug}`}>Parcourir comme un apprenant</Link>
            </Button>
          </p>
        )}
        {query.locked === "1" && !entitled && access.mode !== "staff" && (
          <div className="mb-6">
            <LockedNotice
              signedIn={!!user}
              free={offer.kind === "free"}
              eligible={access.eligible && !access.isEnrolled}
              lapsed={access.lapsed}
              unpublished={!course.published}
              returnTo={returnTo}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {entitled && (
              <CourseResumeBanner
                percent={progress.percent}
                done={progress.done}
                total={progress.total}
                next={progress.next ? { title: progress.next.title, href: itemHref(course.slug, progress.next) } : null}
                completedHref={`/learn/${course.slug}/completed`}
                hasCertificate={!!certificate}
              />
            )}

            {course.trailerUrl && <CourseTrailer trailerUrl={course.trailerUrl} thumbnail={course.thumbnail} title={course.title} />}

            <CourseHeader
              title={course.title}
              description={course.description}
              thumbnail={course.thumbnail}
              category={course.category}
              level={course.level}
              tags={course.tags.map((t) => t.tag)}
              enrollmentCount={course._count.enrollments}
              averageRating={summary.average}
              reviewCount={summary.count}
              updatedAt={course.updatedAt.toISOString()}
              minutes={minutes}
              instructorName={course.instructor?.name ?? null}
              showThumbnail={!course.trailerUrl}
            />

            {/* The panel comes right after the header on small screens, beside the content on large ones */}
            <div className="lg:hidden">
              {offerPanel}
            </div>

            <CoursePathBadges courseId={course.id} />

            {course.objectives.length > 0 && (
              <section aria-labelledby="objectives-heading" className="rounded-xl border bg-card p-6">
                <h2 id="objectives-heading" className="mb-4 text-xl font-semibold">
                  Ce que vous saurez faire
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {course.objectives.map((objective, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <CoursePublicContent
              course={{
                id: course.id,
                title: course.title,
                slug: course.slug,
                publicStructure: course.publicStructure,
                publicResources: course.publicResources,
                publicEvaluation: course.publicEvaluation,
                publicPrerequisites: course.publicPrerequisites,
              }}
            />

            <CourseCurriculum sections={sections} stats={stats} resourceCount={resourceCount} initiallyOpen={Math.max(0, nextSection)} />

            {entitled && (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border p-4 text-sm">
                <span className="flex-1 text-muted-foreground">Schémas et diapositives de la formation, module par module.</span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/learn/${course.slug}/supports`}>Supports visuels</Link>
                </Button>
              </div>
            )}

            {certificate && (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-amber-50 p-4 text-amber-950 dark:bg-amber-950/30 dark:text-amber-50">
                <Award className="h-6 w-6 shrink-0" aria-hidden />
                <span className="flex-1 font-medium">Vous avez obtenu le certificat de cette formation.</span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/certificates/${course.id}`}>Voir mon certificat</Link>
                </Button>
              </div>
            )}

            <div id="reviews">
              <CourseReviews
                courseId={course.id}
                summary={summary}
                initialReviews={firstReviews.reviews}
                initialHasMore={firstReviews.hasMore}
                canReview={entitled}
                canAnswer={access.mode === "staff" || isStaff}
                signedIn={!!user}
                ownReview={ownReview}
              />
            </div>

            {Array.isArray(course.faq) && course.faq.length > 0 && <CourseFaq items={course.faq as { q: string; a: string }[]} />}
          </div>

          <div className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-8">
              {offerPanel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
