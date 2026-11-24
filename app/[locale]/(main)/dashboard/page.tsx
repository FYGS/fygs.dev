import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEntitlements } from "@/lib/access/entitlement";
import { Analytics } from "@/lib/analytics-helper";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AsyncComponentWrapper } from "@/components/ui/suspense-wrapper";
import { PremiumUpgradeCard } from "@/components/premium-upgrade-card";
import { MyPaths } from "@/components/paths/my-paths";
import { DashboardStats } from "./_components/dashboard-stats";
import { EnrolledCourses } from "./_components/enrolled-courses";
import { LearningStreak } from "./_components/learning-streak";
import { RecentActivity } from "./_components/recent-activity";
import { RecommendedCourses } from "./_components/recommended-courses";
import { SubscriptionStatus } from "./_components/subscription-status";

interface DashboardPageProps {
  searchParams: Promise<{ subscription?: string; cycle?: string }>;
}

/**
 * The learner's home: what to resume first (courses, then paths), where they stand, their regularity and what
 * they did lately, then what to take next. The subscription offer comes last.
 */
export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/auth/login?callbackUrl=${encodeURIComponent("/dashboard")}`);
  const userId = session.user.id;

  void Analytics.previewViewed(userId, { page: "dashboard" });
  const { subscription, cycle } = await searchParams;

  const [entitlements, enrolledCourseCount, totalCourseCount] = await Promise.all([
    getEntitlements(userId, []),
    db.enrollment.count({ where: { userId } }),
    db.course.count({ where: { published: true } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:py-8">
      {subscription === "success" && (
        <SubscriptionStatus type="success" userName={session.user.name || undefined} cycle={cycle === "yearly" ? "yearly" : "monthly"} />
      )}
      {subscription === "canceled" && <SubscriptionStatus type="canceled" />}

      <header className="space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">Bonjour{session.user.name ? `, ${session.user.name}` : ""}</h1>
        <p className="text-muted-foreground">Reprenez votre apprentissage là où vous l’avez laissé.</p>
      </header>

      <ErrorBoundary>
        <AsyncComponentWrapper loadingText="Chargement de vos formations…">
          <EnrolledCourses userId={userId} />
        </AsyncComponentWrapper>
      </ErrorBoundary>

      <ErrorBoundary>
        <AsyncComponentWrapper loadingText="Chargement de vos parcours…">
          <MyPaths userId={userId} />
        </AsyncComponentWrapper>
      </ErrorBoundary>

      <ErrorBoundary>
        <AsyncComponentWrapper loadingText="Chargement des statistiques…">
          <DashboardStats userId={userId} />
        </AsyncComponentWrapper>
      </ErrorBoundary>

      <div className="grid gap-6 lg:grid-cols-2">
        <ErrorBoundary>
          <AsyncComponentWrapper loadingText="Chargement de votre régularité…">
            <LearningStreak userId={userId} />
          </AsyncComponentWrapper>
        </ErrorBoundary>
        <ErrorBoundary>
          <AsyncComponentWrapper loadingText="Chargement de l’activité…">
            <RecentActivity userId={userId} />
          </AsyncComponentWrapper>
        </ErrorBoundary>
      </div>

      <ErrorBoundary>
        <AsyncComponentWrapper loadingText="Chargement des suggestions…">
          <RecommendedCourses userId={userId} />
        </AsyncComponentWrapper>
      </ErrorBoundary>

      <ErrorBoundary>
        <PremiumUpgradeCard
          hasActiveSubscription={entitlements.hasActiveSubscription}
          enrolledCourseCount={enrolledCourseCount}
          totalCourseCount={totalCourseCount}
          subscriptionCancelAtPeriodEnd={entitlements.subscription?.cancelAtPeriodEnd ?? false}
        />
      </ErrorBoundary>
    </div>
  );
}
