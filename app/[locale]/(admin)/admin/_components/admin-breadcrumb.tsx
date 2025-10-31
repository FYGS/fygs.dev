"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const pathNameMap: Record<string, string> = {
  "/admin": "Vue d'ensemble",
  "/admin/courses": "Formations",
  "/admin/courses/new": "Nouvelle formation",
  "/admin/lessons": "Leçons",
  "/admin/projects": "Projets", 
  "/admin/projects/new": "Nouveau projet",
  "/admin/blog": "Blog",
  "/admin/blog/new": "Nouvel article",
  "/admin/tags": "Tags & Catégories",
  "/admin/certificates": "Certificats",
  "/admin/users": "Utilisateurs",
  "/admin/enrollments": "Inscriptions",
  "/admin/progress": "Progrès & Performance",
  "/admin/payments": "Paiements",
  "/admin/subscriptions": "Abonnements",
  "/admin/revenue": "Revenus",
  "/admin/analytics": "Analytics",
  "/admin/reviews": "Avis & Commentaires",
  "/admin/pages": "Pages",
  "/admin/settings": "Paramètres",
  "/admin/database": "Base de données",
  "/admin/security": "Sécurité",
};

export function AdminBreadcrumb() {
  const pathname = usePathname();
  
  // Générer les segments du breadcrumb
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    const name = pathNameMap[path] || segment.charAt(0).toUpperCase() + segment.slice(1);
    return { name, path, isLast: index === segments.length - 1 };
  });

  if (pathname === "/admin") {
    return null; // Pas de breadcrumb sur la page d'accueil admin
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 px-6 py-3">
      <nav className="flex items-center space-x-2 text-sm">
        <Link 
          href="/admin"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
        </Link>
        
        {breadcrumbs.map((breadcrumb) => (
          <div key={breadcrumb.path} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {breadcrumb.isLast ? (
              <span className="font-medium text-foreground">
                {breadcrumb.name}
              </span>
            ) : (
              <Link
                href={breadcrumb.path}
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors",
                  "hover:underline"
                )}
              >
                {breadcrumb.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
