"use client";

import { isAdminHrefAvailable } from "@/lib/admin-routes";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  FolderOpen,
  Settings,
  BarChart3,
  CreditCard,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  MessageSquare,
  Tag,
  Calendar,
  Database,
  Palette,
  Globe,
  Activity,
  MessageCircle,
} from "lucide-react";

interface AdminSidebarProps {
  userRole: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
  adminOnly?: boolean;
}

const navigation: NavItem[] = [
  // Dashboard - Always visible
  {
    title: "Vue d'ensemble",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Tableau de bord et métriques",
  },

  // Content Management Section
  {
    title: "Formations",
    href: "/admin/courses",
    icon: BookOpen,
    description: "Cours, leçons et contenus pédagogiques",
  },
  {
    title: "Leçons",
    href: "/admin/lessons",
    icon: GraduationCap,
    description: "Gestion détaillée des leçons",
  },
  {
    title: "Tags & Catégories",
    href: "/admin/tags",
    icon: Tag,
    description: "Organisation du contenu",
  },
  {
    title: "Certificats",
    href: "/admin/certificates",
    icon: Shield,
    description: "Génération et gestion des certificats",
    adminOnly: true,
  },

  // User Management Section (Role-based visibility)
  {
    title: "Utilisateurs",
    href: "/admin/users",
    icon: Users,
    description: "Gestion des comptes utilisateurs",
    adminOnly: true,
  },
  {
    title: "Inscriptions",
    href: "/admin/enrollments",
    icon: Activity,
    description: "Suivi des inscriptions aux cours",
    adminOnly: true,
  },
  {
    title: "Progrès & Performance",
    href: "/admin/progress",
    icon: BarChart3,
    description: "Progression et analytics des étudiants",
  },

  // Business & Analytics Section (Admin-focused)
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Rapports détaillés et métriques",
  },
  {
    title: "Paiements",
    href: "/admin/payments",
    icon: CreditCard,
    description: "Transactions et gestion financière",
    adminOnly: true,
  },
  {
    title: "Abonnements",
    href: "/admin/subscriptions",
    icon: Zap,
    description: "Gestion des plans premium",
    adminOnly: true,
  },
  {
    title: "Revenus",
    href: "/admin/revenue",
    icon: Database,
    description: "Suivi des revenus et facturations",
    adminOnly: true,
  },

  // Communication & Content
  {
    title: "Avis & Commentaires",
    href: "/admin/reviews",
    icon: MessageSquare,
    description: "Modération des avis utilisateurs",
  },
  {
    title: "Communauté",
    href: "/admin/community",
    icon: MessageCircle,
    description: "Gestion du forum et discussions",
  },
  {
    title: "Blog",
    href: "/admin/blog",
    icon: FileText,
    description: "Articles et actualités",
  },
  {
    title: "Projets",
    href: "/admin/projects",
    icon: FolderOpen,
    description: "Portfolio et projets réalisés",
  },
  {
    title: "Pages",
    href: "/admin/pages",
    icon: Globe,
    description: "Pages statiques et contenu",
  },

  // System Administration (Admin only)
  {
    title: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
    description: "Configuration de la plateforme",
    adminOnly: true,
  },
  {
    title: "Base de données",
    href: "/admin/database",
    icon: Database,
    description: "Maintenance et backups",
    adminOnly: true,
  },
  {
    title: "Sécurité",
    href: "/admin/security",
    icon: Shield,
    description: "Logs et sécurité",
    adminOnly: true,
  },
];

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const filteredNavigation = navigation.filter(
    (item) =>
      isAdminHrefAvailable(item.href) &&
      (!item.adminOnly || userRole === "ADMIN"),
  );

  return (
    <div
      className={cn(
        "bg-slate-900 border-r border-slate-700 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-72",
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary/80 flex items-center justify-center">
                <Palette className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gradient-heading">
                  Admin
                </h2>
                <p className="text-xs text-muted-foreground">FYGS Platform</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea
        className="flex-1 p-4 space-y-2"
        type="auto"
        scrollHideDelay={300}
      >
        {filteredNavigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary/50",
                  isActive &&
                    "bg-primary/10 text-primary border border-primary/20",
                  collapsed && "justify-center px-2",
                )}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    window.location.href = item.href;
                  }
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                  aria-hidden="true"
                />

                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "font-medium text-sm truncate",
                            isActive ? "text-primary" : "text-foreground",
                          )}
                        >
                          {item.title}
                        </span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="ml-2 h-5 text-xs"
                            aria-label={`Badge: ${item.badge}`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p
                          className="text-xs text-muted-foreground truncate mt-0.5"
                          aria-hidden="true"
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        {!collapsed && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span>Platform v2.0</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date().getFullYear()} FYGS</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
