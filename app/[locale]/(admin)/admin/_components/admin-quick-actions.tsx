"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BarChart3, Eye, MessageCircleQuestion, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canOpenAdminHref } from "@/lib/admin-navigation";
import { isAdminHrefAvailable } from "@/lib/admin-routes";

interface AdminQuickActionsProps {
  userRole: string;
}

interface QuickAction {
  label: string;
  href: string;
  icon: typeof Plus;
  variant: "default" | "outline";
  external?: boolean;
}

/** The shortcuts of the header, for the page being viewed, limited to what the user may open. */
export function quickActionsFor(pathname: string, role: string): QuickAction[] {
  const actions: QuickAction[] = [];
  if (pathname === "/admin/courses") {
    actions.push({ label: "Nouvelle formation", href: "/admin/courses/new", icon: Plus, variant: "default" });
  }
  if (pathname.startsWith("/admin/courses")) {
    actions.push({ label: "Voir le catalogue", href: "/formations", icon: Eye, variant: "outline", external: true });
  }
  if (pathname === "/admin") {
    actions.push(
      { label: "Nouvelle formation", href: "/admin/courses/new", icon: Plus, variant: "default" },
      { label: "Questions des apprenants", href: "/admin/questions", icon: MessageCircleQuestion, variant: "outline" },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3, variant: "outline" },
    );
  }
  return actions.filter((a) => isAdminHrefAvailable(a.href) && (!a.href.startsWith("/admin") || canOpenAdminHref(role, a.href)));
}

export function AdminQuickActions({ userRole }: AdminQuickActionsProps) {
  const pathname = usePathname();
  const actions = quickActionsFor(pathname, userRole);
  if (actions.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {actions.map((action) => (
        <Button key={action.href} variant={action.variant} size="sm" asChild>
          <Link href={action.href} {...(action.external && { target: "_blank", rel: "noopener noreferrer" })}>
            <action.icon className="mr-2 h-4 w-4" aria-hidden />
            {action.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}
