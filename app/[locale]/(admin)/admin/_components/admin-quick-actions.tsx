"use client";

import { isAdminHrefAvailable } from "@/lib/admin-routes";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, GraduationCap, BarChart3, Eye } from "lucide-react";
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

    return actions;
  };

  const quickActions = getQuickActions().filter((action) =>
    isAdminHrefAvailable(action.href),
  );

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