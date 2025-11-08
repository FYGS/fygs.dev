import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AccessService, UserAccess } from "@/lib/access-service";
import { CourseRepository } from "@/lib/repositories/course-repository";
import { db } from "@/lib/db";
import { serializeCourseDetail } from "@/lib/serializers/course-serializer";
import { logger, createLogger } from "@/lib/structured-logger";
import { Analytics } from "@/lib/analytics";
import { CourseHeader } from "./_components/course-header";
import { CourseCurriculum } from "./_components/course-curriculum";
import { CourseEnrollment } from "./_components/course-enrollment";
import { CourseReviews } from "./_components/course-reviews";
import { CourseBreadcrumb } from "./_components/course-breadcrumb";
import { PaymentStatus } from "./_components/payment-status";
import { CourseResumeBanner } from "./_components/course-resume-banner";
import { TrainingOverview } from "./_components/training-overview";
import { CoursePublicContent } from "./_components/course-public-content";
import { SerializedCourse } from "./types";

interface CoursePageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ success?: string; canceled?: string }>;
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
    const { slug } = await params;
    // Lightweight fetch via repository (TODO: add specialized lightweight method if needed)
    const course = await CourseRepository.findBySlug(slug);

    if (!course) {
        return {
            title: "Formation non trouvée",
        };
    }

    return {
        title: `${course.title} | Formations FYGS`,
        description: course.description,
        openGraph: {
            title: course.title,
            description: course.description,
            images: course.thumbnail ? [course.thumbnail] : [],
        },
    };
}

export default async function CoursePage({ params, searchParams }: CoursePageProps) {
    const { slug } = await params;
    const { success, canceled } = await searchParams;
    
    const correlationId = logger.generateCorrelationId();
    const courseLogger = createLogger({ 
        operation: 'course-page-view',
        correlationId,
        resourceType: 'course',
        resourceId: slug
    });
    
    // Check authentication
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    
    const isAuthenticated = !!session?.user;
    const userId = session?.user?.id;
    
    courseLogger.info("Course page accessed", {
        userId,
        resourceId: slug,
        metadata: { authenticated: isAuthenticated }
    });
    
    const course = await CourseRepository.findBySlug(slug);

    // Check user access using AccessService
        let userAccess: UserAccess = {
            hasActiveSubscription: false,
            isEnrolledInCourse: false,
            canAccessCourse: false,
            canAccessLessons: false,
            canPreviewFirstLesson: false,
            isFreeCourse: false,
            isPremiumCourse: false,
        };
    let userProgress: { lessonId: string; completed: boolean; completedAt?: Date | null }[] = [];
        // Compute resume information (lastPosition & next uncompleted)
        let lastPosition: { lessonId: string; slug: string; seconds?: number } | null = null;
        let nextUncompletedLesson: { lessonId: string; title: string; slug: string } | null = null;
        try {
            if (userId && course) {
                const lessons = await db.lesson.findMany({
                    where: { courseId: course.id, published: true },
                    orderBy: { order: 'asc' },
                    select: { id: true, slug: true, title: true, order: true }
                });
                if (lessons.length) {
                    const progresses = await db.progress.findMany({
                        where: { userId, lesson: { courseId: course.id } },
                        select: { lessonId: true, watchTime: true, completed: true }
                    });
                    const progMap = new Map(progresses.map(p => [p.lessonId, p] as const));
                    // Last position = highest watchTime among non-completed or last completed
                    let candidate: { lessonId: string; slug: string; seconds?: number } | null = null;
                    for (const l of lessons) {
                        const p = progMap.get(l.id);
                        if (!p) continue;
                        if (!candidate || (p.watchTime > (candidate.seconds || 0))) {
                            candidate = { lessonId: l.id, slug: l.slug, seconds: p.watchTime };
                        }
                    }
                    if (candidate) lastPosition = candidate;
                    // Next uncompleted lesson (first lesson without completed progress)
                    const next = lessons.find(l => !(progMap.get(l.id)?.completed));
                    if (next) nextUncompletedLesson = { lessonId: next.id, slug: next.slug, title: next.title };
                }
            }
        } catch (error) {
            courseLogger.error("Failed to load course resume data", {
                resourceId: slug,
                userId,
                metadata: { error: error instanceof Error ? error.message : String(error) }
            }, error instanceof Error ? error : new Error(String(error)));
        }

    if (userId && course?.id) {
        userAccess = await AccessService.checkCourseAccess(userId, course.id);
        
        // Track analytics for course view
        await Analytics.courseCardViewed(userId, {
            courseId: course.id,
            courseSlug: slug,
            courseTier: course.accessTier || 'FREE',
            hasActiveSubscription: userAccess.hasActiveSubscription,
            isEnrolled: userAccess.isEnrolledInCourse,
            correlationId
        });
        
        // Get user progress if they have access
                if (userAccess.canAccessLessons) {
                        userProgress = await AccessService.getCourseProgress(userId, course.id);
                        // Compute last position & next lesson
                        const completedLessonIds = new Set(userProgress.filter(p => p.completed).map(p => p.lessonId));
                        const orderedLessons = (course.lessons || []).sort((a: { order: number }, b: { order: number }) => a.order - b.order);
                        // Last completed
                        const lastCompleted = [...userProgress]
                            .filter(p => p.completed)
                            .sort((a,b)=> (b.completedAt?.getTime()||0) - (a.completedAt?.getTime()||0))[0];
                        if (lastCompleted) {
                            const l = orderedLessons.find((l: { id: string; slug: string }) => l.id === lastCompleted.lessonId);
                            if (l) lastPosition = { lessonId: l.id, slug: l.slug };
                        }
                        // Next uncompleted
                        const next = orderedLessons.find((l: { id: string; slug: string; title: string }) => !completedLessonIds.has(l.id));
                        if (next) nextUncompletedLesson = { lessonId: next.id, slug: next.slug, title: next.title };
                }
    }

    const isUnlocked = userAccess.canAccessCourse;
    const canPreview = userAccess.canPreviewFirstLesson;
    const isEnrolled = userAccess.isEnrolledInCourse;
    const hasActiveSubscription = userAccess.hasActiveSubscription;

    if (!course || !course.published) {
        notFound();
    }

    const detail = serializeCourseDetail(course);
    
    // Adapt to legacy SerializedCourse shape (components still expect nested tag.tag)
    const serializedCourse: SerializedCourse = {
        id: detail.id,
        title: detail.title,
        slug: detail.slug,
        description: detail.description,
        thumbnail: detail.thumbnail,
        price: detail.price,
        category: course.category,
        level: detail.level,
        published: course.published,
        featured: detail.featured,
        duration: detail.duration,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt,
        lessons: detail.lessons.map(l => ({
            id: l.id,
            title: l.title,
            slug: l.slug,
            description: l.description ?? null,
            duration: l.duration,
            order: l.order,
            moduleId: l.moduleId || null,
        })),
        modules: detail.modules.map(m => ({
            id: m.id,
            title: m.title,
            slug: m.slug,
            order: m.order,
            courseId: m.courseId,
            lessons: m.lessons.map(l => ({
                id: l.id,
                title: l.title,
                slug: l.slug,
                description: l.description ?? null,
                duration: l.duration,
                order: l.order,
                moduleId: l.moduleId || null,
            })),
        })),
        quizzes: detail.quizzes?.map(q => ({
            id: q.id,
            moduleId: q.moduleId,
            title: q.title,
            questions: q.questions.map(question => ({
                id: question.id,
                question: question.question,
                options: question.options,
                correct: question.correct,
                explanation: question.explanation || "",
                order: question.order,
            })),
        })) || [],
        visualSupports: detail.visualSupports?.map(vs => ({
            id: vs.id,
            title: vs.title,
            moduleId: vs.moduleId,
            order: vs.order,
            content: vs.content as { slides: Array<{ title: string; content: any }> },
        })) || [],
        reviews: detail.reviews.map(r => ({
            id: r.id,
            userId: r.userId,
            courseId: r.courseId,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            user: r.user,
        })),
        tags: detail.tags.map(t => ({ tag: { id: t.id, name: t.name, color: t.color } })),
        enrollments: (course.enrollments || []).map((e: { id: string }) => ({ id: e.id })),
        // Enriched flags (for client components expecting them later)
        isUnlocked,
        isInSubscription: hasActiveSubscription,
        isEnrolled,
        hasEntitlement: hasActiveSubscription || isEnrolled || detail.price === 0,
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
            <div className="container py-8 max-w-7xl mx-auto">
                <CourseBreadcrumb courseTitle={course.title} courseSlug={course.slug} />
                
                {/* Payment Status Messages */}
                {success && (
                    <PaymentStatus 
                        type="success" 
                        courseTitle={course.title} 
                        courseSlug={course.slug} 
                    />
                )}
                {canceled && (
                    <PaymentStatus 
                        type="canceled" 
                        courseTitle={course.title} 
                        courseSlug={course.slug} 
                    />
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <CourseResumeBanner courseSlug={course.slug} lastPosition={lastPosition} nextLesson={nextUncompletedLesson} isEnrolled={isUnlocked} />
                        <CourseHeader course={serializedCourse} />
                        
                        {/* Public Marketing Content - Always visible */}
                        <CoursePublicContent 
                          course={{
                            id: course.id,
                            title: course.title,
                            slug: course.slug,
                            publicStructure: detail.publicStructure,
                            publicResources: detail.publicResources,
                            publicEvaluation: detail.publicEvaluation,
                            publicPrerequisites: detail.publicPrerequisites,
                          }}
                        />
                        
                        {/* Training Overview Section - Key points to be covered in the training */}
                        {isUnlocked && serializedCourse.visualSupports && serializedCourse.visualSupports.length > 0 && (
                          <TrainingOverview
                            course={{
                              id: serializedCourse.id,
                              title: serializedCourse.title,
                              slug: serializedCourse.slug,
                            }}
                            visualSupports={serializedCourse.visualSupports}
                          />
                        )}
                        
                        <CourseCurriculum
                          modules={serializedCourse.modules}
                          courseSlug={course.slug}
                          isEnrolled={isUnlocked}
                          userProgress={userProgress}
                          isAuthenticated={isAuthenticated}
                          canPreview={canPreview && !!serializedCourse.modules.length}
                          quizzes={serializedCourse.quizzes}
                        />

                        <CourseReviews reviews={serializedCourse.reviews} courseId={serializedCourse.id} canReview={isUnlocked} />
                        
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                                                                                            <CourseEnrollment 
                                                                                                course={serializedCourse} 
                                                                                                isEnrolled={isUnlocked} 
                                                                                                canPreview={canPreview}
                                                                                                hasPurchased={serializedCourse.hasEntitlement}
                                                                                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
