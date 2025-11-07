import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AccessService } from "@/lib/access-service";
import { logger, createLogger } from "@/lib/structured-logger";
import { Analytics } from "@/lib/analytics";
import { RouteGuard } from "@/components/auth/route-guard";
import { FadeIn, FadeInWhenVisible } from "@/components/ui/fade-in";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AsyncComponentWrapper } from "@/components/ui/suspense-wrapper";
import { DashboardStats } from "./_components/dashboard-stats";
import { EnrolledCourses } from "./_components/enrolled-courses";
import { LearningProgress } from "./_components/learning-progress";
import { RecentActivity } from "./_components/recent-activity";
import { QuickActions } from "./_components/quick-actions";
import { LearningStreak } from "./_components/learning-streak";
import { RecommendedCourses } from "./_components/recommended-courses";
import { SubscriptionStatus } from "./_components/subscription-status";
import { PremiumUpgradeCard } from "@/components/premium-upgrade-card";
import { db } from "@/lib/db";
import { CourseProgressGridServer } from './_components/course-progress-grid-server';
import { SubscriptionStatus as PrismaSubscriptionStatus } from '@prisma/client';


interface DashboardPageProps {
  searchParams: Promise<{ subscription?: string; cycle?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const correlationId = logger.generateCorrelationId();
  const dashboardLogger = createLogger({ 
    operation: 'dashboard-page-view',
    correlationId,
    resourceType: 'dashboard'
  });

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  dashboardLogger.info("Dashboard accessed", {
    userId: session.user.id
  });

  // Track dashboard visit
  await Analytics.previewViewed(session.user.id, {
    page: 'dashboard',
    correlationId
  });

  const { subscription, cycle } = await searchParams;

  // Get user's subscription status and course counts
  const hasActiveSubscription = await AccessService.hasActiveSubscription(session.user.id);
  // Fetch subscription details to check for cancellation status
  const subscriptionDetails = await db.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: PrismaSubscriptionStatus.ACTIVE
    },
    select: {
      cancelAtPeriodEnd: true
    }
  });
  const subscriptionCancelAtPeriodEnd = subscriptionDetails?.cancelAtPeriodEnd || false;
  
  const [enrolledCourseCount, totalCourseCount] = await Promise.all([
    db.enrollment.count({ where: { userId: session.user.id } }),
    db.course.count({ where: { published: true } })
  ]);


  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
        <div className="container py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6">
          {/* Subscription Status Messages */}
          {subscription === "success" && (
            <>
              <SubscriptionStatus type="success" userName={session.user.name || undefined} cycle={cycle === 'yearly' ? 'yearly' : 'monthly'} />
            </>
          )}
          {subscription === "canceled" && (
            <SubscriptionStatus type="canceled" />
          )}

          <FadeIn delay={0.1}>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                Bonjour, {session.user.name || "Étudiant"} 👋
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Voici un aperçu de votre progression d&apos;apprentissage.
              </p>
            </div>
          </FadeIn>

          <ErrorBoundary>
            <FadeInWhenVisible delay={0.2}>
              <AsyncComponentWrapper loadingText="Chargement des statistiques...">
                <DashboardStats userId={session.user.id} />
              </AsyncComponentWrapper>
            </FadeInWhenVisible>
          </ErrorBoundary>

          <FadeInWhenVisible delay={0.3}>
            <QuickActions />
          </FadeInWhenVisible>

          {/* Responsive layout: on xl use 12 cols for finer placement */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 auto-rows-min">
            {/* Main Content */}
            <div className="xl:col-span-8 space-y-6 lg:space-y-8">
              <ErrorBoundary>
                <FadeInWhenVisible delay={0.4}>
                  <AsyncComponentWrapper loadingText="Chargement des cours...">
                    <EnrolledCourses userId={session.user.id} />
                  </AsyncComponentWrapper>
                </FadeInWhenVisible>
              </ErrorBoundary>

              {/* Server-hydrated per-course progress grid */}
              <ErrorBoundary>
                <FadeInWhenVisible delay={0.425}>
                  {/* Direct server component render (already async) */}
                  <CourseProgressGridServer />
                </FadeInWhenVisible>
              </ErrorBoundary>
              
              {/* Learning Streak */}
              <ErrorBoundary>
                <FadeInWhenVisible delay={0.45}>
                  <AsyncComponentWrapper loadingText="Chargement de votre série...">
                    <LearningStreak userId={session.user.id} />
                  </AsyncComponentWrapper>
                </FadeInWhenVisible>
              </ErrorBoundary>
              
              <ErrorBoundary>
                <FadeInWhenVisible delay={0.5}>
                  <AsyncComponentWrapper loadingText="Chargement des progrès...">
                    <LearningProgress userId={session.user.id} />
                  </AsyncComponentWrapper>
                </FadeInWhenVisible>
              </ErrorBoundary>

              {/* Recent Activity integrated earlier for continuity on large screens */}
              <ErrorBoundary>
                <FadeInWhenVisible delay={0.55}>
                  <AsyncComponentWrapper loadingText="Chargement de l'activité...">
                    <RecentActivity userId={session.user.id} />
                  </AsyncComponentWrapper>
                </FadeInWhenVisible>
              </ErrorBoundary>

              {/* Recommendations full-width under progress to reduce sidebar height & wasted space */}
              <ErrorBoundary>
                <FadeInWhenVisible delay={0.6}>
                  <AsyncComponentWrapper loadingText="Chargement des recommandations...">
                    <RecommendedCourses userId={session.user.id} />
                  </AsyncComponentWrapper>
                </FadeInWhenVisible>
              </ErrorBoundary>
            </div>

            {/* Sidebar - sticky on large screens */}
            <div className="xl:col-span-4 space-y-6 lg:space-y-8 xl:sticky xl:top-24 self-start order-first xl:order-0">
              <ErrorBoundary>
                <FadeInWhenVisible delay={0.3} direction="left">
                  <PremiumUpgradeCard
                    hasActiveSubscription={hasActiveSubscription}
                    enrolledCourseCount={enrolledCourseCount}
                    totalCourseCount={totalCourseCount}
                    subscriptionCancelAtPeriodEnd={subscriptionCancelAtPeriodEnd}
                  />
                </FadeInWhenVisible>
              </ErrorBoundary>
              {/* Keep quick actions mobile grouping unaffected; additions could go here later */}
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
