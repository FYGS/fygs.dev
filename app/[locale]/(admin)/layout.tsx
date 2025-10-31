import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminSidebar } from "./admin/_components/admin-sidebar";
import { AdminHeader } from "./admin/_components/admin-header";
import { AdminBreadcrumb } from "./admin/_components/admin-breadcrumb";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ScrollArea } from "@/components/ui/scroll-area";
import { defaultMetadata } from "../../_lib/metadata";
import { Role } from "@prisma/client";

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

  // Vérifier le rôle admin ou instructeur
  if (
    session.user.role !== Role.ADMIN &&
    session.user.role !== Role.INSTRUCTOR
  ) {
    redirect("/dashboard");
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar userRole={session.user.role || Role.STUDENT} />

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
          />

          {/* Breadcrumb */}
          <AdminBreadcrumb />

          {/* Page Content */}
          <ScrollArea className="flex-1 p-6" type="auto" scrollHideDelay={300}>
            <div className="max-w-7xl mx-auto space-y-6 h-full">
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster position="top-right" expand={true} richColors closeButton />
    </>
  );
}
