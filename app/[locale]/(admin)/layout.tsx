import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminSidebar } from "./admin/_components/admin-sidebar";
import { AdminHeader } from "./admin/_components/admin-header";
import { AdminBreadcrumb } from "./admin/_components/admin-breadcrumb";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ScrollArea } from "@/components/ui/scroll-area";
import { defaultMetadata } from "../../_lib/metadata";
import { ReportStatus, ReviewStatus, Role } from "@/lib/generated/prisma/browser";
import { db } from "@/lib/db";
import { countQuestionsToAnswer } from "@/lib/curriculum/lesson-questions";
import { STAFF_TWO_FACTOR_SETUP_HREF } from "@/lib/staff-2fa";

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "Admin Dashboard | FYGS Learning Platform",
  description:
    "Interface d'administration pour gérer la plateforme d'apprentissage",
  robots: { index: false, follow: false }, // Empêche l'indexation
};

export const viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#0f172a" }],
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Vérifier l'authentification et les permissions
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  // Staff without a second factor hold no staff powers (the session reports them as students): set it up first
  if (session.user.pendingStaffRole) {
    redirect(STAFF_TWO_FACTOR_SETUP_HREF);
  }

  // Vérifier le rôle admin ou instructeur
  if (
    session.user.role !== Role.ADMIN &&
    session.user.role !== Role.INSTRUCTOR
  ) {
    redirect("/dashboard");
  }

  // Questions asked from the lessons wait for the course's team (an instructor sees those of their courses)
  const questionsToAnswer = await countQuestionsToAnswer({ id: session.user.id, role: session.user.role === Role.ADMIN ? "ADMIN" : "INSTRUCTOR" });
  const questionAlert = {
    label: "Questions d'apprenants sans réponse",
    count: questionsToAnswer,
    href: "/admin/questions",
  };

  // Only an administrator moderates: the counts are for them
  const moderationAlerts =
    session.user.role === Role.ADMIN
      ? [
          {
            label: "Avis à modérer",
            count: await db.review.count({ where: { status: { in: [ReviewStatus.PENDING, ReviewStatus.FLAGGED] } } }),
            href: "/admin/reviews/moderation",
          },
          {
            label: "Signalements d'avis à traiter",
            count: await db.reviewReport.count({ where: { status: ReportStatus.PENDING } }),
            href: "/admin/reviews/moderation",
          },
        ]
      : [];
  const alerts = [questionAlert, ...moderationAlerts];

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar userRole={session.user.role || Role.STUDENT} counters={{ questions: questionsToAnswer }} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <AdminHeader
            user={{
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              image: session.user.image || null,
              role: session.user.role || Role.STUDENT,
            }}
            alerts={alerts}
          />

          {/* Breadcrumb */}
          <AdminBreadcrumb />

          {/* Page Content */}
          <ScrollArea className="flex-1 p-6" type="auto" scrollHideDelay={300}>
            <main id="main-content" tabIndex={-1} className="max-w-7xl mx-auto space-y-6 h-full outline-hidden">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
          </ScrollArea>
        </div>
      </div>

    </>
  );
}
