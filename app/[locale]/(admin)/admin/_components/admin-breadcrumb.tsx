"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const pathNameMap: Record<string, string> = {
  "/admin": "Vue d'ensemble",
  "/admin/courses": "Formations",
  "/admin/courses/new": "Nouvelle formation",
  "/admin/tags": "Tags & Catégories",
  "/admin/paths": "Parcours",
  "/admin/paths/new": "Nouveau parcours",
  "/admin/certificates": "Certificats",
  "/admin/users": "Utilisateurs",
  "/admin/enrollments": "Inscriptions",
  "/admin/payments": "Paiements",
  "/admin/subscriptions": "Abonnements",
  "/admin/analytics": "Analytics",
  "/admin/reviews": "Avis & Commentaires",
  "/admin/reviews/moderation": "Modération",
  "/admin/reviews/analytics": "Analytics des avis",
  "/admin/community": "Communauté",
  "/admin/community/users": "Membres",
  "/admin/community/moderation": "Modération",
  "/admin/community/analytics": "Analytics",
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
    <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-3">
      <nav aria-label="Fil d'Ariane" className="flex items-center space-x-2 text-sm">
        <Link
          href="/admin"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Accueil de l'administration"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
        </Link>

        {breadcrumbs.map((breadcrumb) => (
          <div key={breadcrumb.path} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {breadcrumb.isLast ? (
              <span className="font-medium text-foreground" aria-current="page">
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
