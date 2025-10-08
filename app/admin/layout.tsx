import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminHeader } from "./_components/admin-header";
import { AdminBreadcrumb } from "./_components/admin-breadcrumb";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export const metadata: Metadata = {
  title: "Admin Dashboard | FYGS Learning Platform",
  description: "Interface d'administration pour gérer la plateforme d'apprentissage",
  robots: "noindex, nofollow", // Empêche l'indexation
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
  if (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar userRole={session.user.role || "STUDENT"} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <AdminHeader user={{
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image || null,
            role: session.user.role || "STUDENT"
          }} />
          
          {/* Breadcrumb */}
          <AdminBreadcrumb />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-7xl mx-auto">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        expand={true}
        richColors
        closeButton
      />
    </div>
  );
}
