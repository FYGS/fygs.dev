"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  FileText, 
  FolderOpen, 
  BookOpen,
  GraduationCap,
  Users,
  BarChart3,
  Settings,
  Eye,
  Download
} from "lucide-react";
import { Role } from "@/lib/generated/prisma/browser";

interface AdminQuickActionsProps {
  userRole: string;
}

export function AdminQuickActions({ userRole }: AdminQuickActionsProps) {
  const pathname = usePathname();
  
  // Define quick actions based on current path
  const getQuickActions = () => {
    const actions = [];
    
    // Global actions available everywhere
    if (userRole === Role.ADMIN || userRole === Role.INSTRUCTOR) {
      // Course management actions
      if (pathname.startsWith("/admin/courses")) {
        if (pathname === "/admin/courses") {
          actions.push({
            label: "Nouvelle formation",
            href: "/admin/courses/new",
            icon: Plus,
            variant: "default" as const
          });
        }
        
        actions.push({
          label: "Voir les formations",
          href: "/formations",
          icon: Eye,
          variant: "outline" as const,
          external: true
        });
      }
      
      // Blog management actions
      else if (pathname.startsWith("/admin/blog")) {
        if (pathname === "/admin/blog") {
          actions.push({
            label: "Nouvel article",
            href: "/admin/blog/new",
            icon: FileText,
            variant: "default" as const
          });
        }
        
        actions.push({
          label: "Voir le blog",
          href: "/blog",
          icon: Eye,
          variant: "outline" as const,
          external: true
        });
      }
      
      // Project management actions
      else if (pathname.startsWith("/admin/projects")) {
        if (pathname === "/admin/projects") {
          actions.push({
            label: "Nouveau projet",
            href: "/admin/projects/new",
            icon: FolderOpen,
            variant: "default" as const
          });
        }
        
        actions.push({
          label: "Voir les projets",
          href: "/projects",
          icon: Eye,
          variant: "outline" as const,
          external: true
        });
      }
      
      // Lessons management
      else if (pathname.startsWith("/admin/lessons")) {
        if (pathname === "/admin/lessons") {
          actions.push({
            label: "Nouvelle leçon",
            href: "/admin/lessons/new",
            icon: GraduationCap,
            variant: "default" as const
          });
        }
      }
      
      // Analytics actions
      else if (pathname.startsWith("/admin/analytics")) {
        actions.push({
          label: "Exporter rapport",
          href: "/admin/analytics/export",
          icon: Download,
          variant: "outline" as const
        });
      }
      
      // User management (Admin only)
      else if (pathname.startsWith("/admin/users") && userRole === Role.ADMIN) {
        actions.push({
          label: "Inviter utilisateur",
          href: "/admin/users/invite",
          icon: Users,
          variant: "default" as const
        });
      }
      
      // Dashboard quick actions
      else if (pathname === "/admin") {
        actions.push(
          {
            label: "Nouvelle formation",
            href: "/admin/courses/new",
            icon: BookOpen,
            variant: "default" as const
          },
          {
            label: "Analytics",
            href: "/admin/analytics",
            icon: BarChart3,
            variant: "outline" as const
          }
        );
      }
    }
    
    // Admin-only global actions
    if (userRole === Role.ADMIN) {
      // Settings access from anywhere
      if (!pathname.startsWith("/admin/settings")) {
        actions.push({
          label: "Paramètres",
          href: "/admin/settings",
          icon: Settings,
          variant: "ghost" as const
        });
      }
    }
    
    return actions;
  };
  
  const quickActions = getQuickActions();
  
  if (quickActions.length === 0) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-2">
      {quickActions.map((action, index) => (
        <Button
          key={`${action.href}-${index}`}
          variant={action.variant}
          size="sm"
          asChild
        >
          <Link 
            href={action.href}
            {...(action.external && { target: "_blank", rel: "noopener noreferrer" })}
          >
            <action.icon className="h-4 w-4 mr-2" />
            {action.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}