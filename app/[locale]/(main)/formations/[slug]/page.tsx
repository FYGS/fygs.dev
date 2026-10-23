import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Award, CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger, createLogger } from "@/lib/structured-logger";
import { Analytics } from "@/lib/analytics-helper";
import { CourseFaq } from "@/components/marketing/course-faq";
import { CourseTrailer } from "@/components/marketing/course-trailer";
import { SocialProof } from "@/components/marketing/social-proof";
import { TrustBadges } from "@/components/marketing/trust-badges";
import { Button } from "@/components/ui/button";
import { CoursePathBadges } from "@/components/paths/course-path-badges";
import { canOpenItem, outlineHasFlaggedPreview, resolveLearnerAccess, type LearnerAccess } from "@/lib/learning/access";
import { loadCourseOutline, loadLearnerCourseState } from "@/lib/learning/course-state";
import { buildCurriculumView, curriculumStats } from "@/lib/learning/curriculum-view";
import { computeProgress, itemHref, type OutlineItem } from "@/lib/learning/outline";
import { CourseBreadcrumb } from "./_components/course-breadcrumb";
import { CourseCurriculum } from "./_components/course-curriculum";
import { CourseEnrollment } from "./_components/course-enrollment";
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
    reason?: string;
  }>;
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await db.course.findFirst({
    where: { slug, published: true },
    select: { title: true, description: true, thumbnail: true },
  });
  if (!course) return { title: "Formation introuvable" };

  const title = `${course.title} | Formations FYGS`;
  return {
    title,
    description: course.description,
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
  const { success, canceled, preview, locked, reason } = await searchParams;

  const correlationId = logger.generateCorrelationId();
  const courseLogger = createLogger({ operation: "course-page-view", correlationId, resourceType: "course", resourceId: slug });

  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

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
      previewEnabled: true,
      instructorId: true,
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
      reviews: {
        where: { status: "APPROVED" },
        select: {
          id: true,
          userId: true,
          courseId: true,
          rating: true,
          comment: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  // A draft is shown to its author (or an admin) who asks for the preview
  const isStaff = !!user && (user.role === "ADMIN" || (user.role === "INSTRUCTOR" && course?.instructorId === user.id));
  if (!course || (!course.published && !(preview === "true" && isStaff))) notFound();

  // The plan of the course for everyone; what has been done only for a signed-in user
  const state = user ? await loadLearnerCourseState(user.id, course.id) : null;
  const outline = state?.outline ?? (await loadCourseOutline(course.id));
  const progress = state?.progress ?? computeProgress(outline, { completedLessonIds: new Set(), passedQuizIds: new Set(), examPassed: false });
  const isDone = (item: OutlineItem) =>
    !state ? false : item.kind === "lesson" ? state.completedLessonIds.has(item.id) : item.kind === "quiz" ? state.passedQuizIds.has(item.id) : state.examPassed;

  let access: LearnerAccess = { mode: "none", reason: "not_enrolled", isEnrolled: false, hasActiveSubscription: false };
  if (user) {
    access = await resolveLearnerAccess({ userId: user.id, role: user.role, course });
    await Analytics.courseCardViewed(user.id, {
      courseId: course.id,
      courseSlug: slug,
      courseTier: course.accessTier || "FREE",
      hasActiveSubscription: access.hasActiveSubscription,
      isEnrolled: access.isEnrolled,
      correlationId,
    });
  } else if (course.published && (outlineHasFlaggedPreview(outline) || (course.previewEnabled && course.accessTier === "PREMIUM"))) {
    access = { mode: "preview", isEnrolled: false, hasActiveSubscription: false };
  }

  const hasFlaggedPreview = outlineHasFlaggedPreview(outline);
  const entitled = access.mode === "full";
  const canOpen = (item: OutlineItem) => canOpenItem(access.mode, item, outline, hasFlaggedPreview);

  const resourceCount = await db.lessonResource.count({ where: { lesson: { courseId: course.id, published: true } } });

  const certificate =
    user && entitled
      ? await db.certificate.findUnique({
          where: { userId_courseId: { userId: user.id, courseId: course.id } },
          select: { id: true },
        })
      : null;

  const sections = buildCurriculumView(outline, course.slug, {
    isDone,
    nextId: entitled ? (progress.next?.id ?? null) : null,
    canOpen,
  });
  const stats = curriculumStats(outline);
  const nextSection = progress.next ? sections.findIndex((s) => s.items.some((i) => i.id === progress.next?.id)) : -1;

  const ratings = course.reviews;
  const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;
  const price = course.price ? Number(course.price) : 0;
  const serializedReviews = ratings.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    user: { name: r.user.name, image: r.user.image },
  }));

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="container mx-auto max-w-7xl py-8">
        <CourseBreadcrumb courseTitle={course.title} courseSlug={course.slug} />

        {success && <PaymentStatus type="success" courseTitle={course.title} courseSlug={course.slug} />}
        {canceled && <PaymentStatus type="canceled" courseTitle={course.title} courseSlug={course.slug} />}
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
        {locked === "1" && !entitled && (
          <div className="mb-6">
            <LockedNotice reason={reason} signedIn={!!user} />
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
              averageRating={averageRating}
              reviewCount={ratings.length}
              updatedAt={course.updatedAt.toISOString()}
              minutes={stats.minutes}
              showThumbnail={!course.trailerUrl}
            />

            <CoursePathBadges courseId={course.id} />

            {course.objectives.length > 0 && (
              <section aria-labelledby="objectives-heading" className="rounded-xl border bg-card p-6">
                <h2 id="objectives-heading" className="mb-4 text-xl font-semibold">
                  Ce que vous saurez faire
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {course.objectives.map((objective, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <SocialProof enrollmentCount={course._count.enrollments} averageRating={averageRating} reviewCount={ratings.length} />

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
              <CourseReviews reviews={serializedReviews} courseId={course.id} canReview={entitled} />
            </div>

            {Array.isArray(course.faq) && course.faq.length > 0 && <CourseFaq items={course.faq as { q: string; a: string }[]} />}

            <TrustBadges />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <CourseEnrollment
                course={{
                  id: course.id,
                  slug: course.slug,
                  title: course.title,
                  price,
                  level: course.level,
                  duration: stats.minutes,
                  enrollmentCount: course._count.enrollments,
                  averageRating,
                }}
                isEnrolled={entitled}
                canPreview={access.mode === "preview"}
                hasPurchased={access.hasActiveSubscription || access.isEnrolled || price === 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
