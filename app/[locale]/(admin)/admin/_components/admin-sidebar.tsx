"use client";

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
  BarChart3,
  CreditCard,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Tag,
  Calendar,
  Palette,
  Globe,
  Activity,
  MessageCircle,
  MessageCircleQuestion,
  Route,
} from "lucide-react";
import { navigationFor, type AdminNavEntry } from "@/lib/admin-navigation";

interface AdminSidebarProps {
  userRole: string;
  /** Things waiting for the user, shown next to their entry. */
  counters?: Partial<Record<NonNullable<AdminNavEntry["counter"]>, number>>;
}

const ICONS: Record<AdminNavEntry["icon"], React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>> = {
  dashboard: LayoutDashboard,
  courses: BookOpen,
  questions: MessageCircleQuestion,
  paths: Route,
  tags: Tag,
  certificates: Shield,
  users: Users,
  enrollments: Activity,
  analytics: BarChart3,
  payments: CreditCard,
  subscriptions: Zap,
  reviews: MessageSquare,
  community: MessageCircle,
};

export function AdminSidebar({ userRole, counters = {} }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const filteredNavigation = navigationFor(userRole).map((entry) => ({
    ...entry,
    icon: ICONS[entry.icon],
    badge: entry.counter && counters[entry.counter] ? String(counters[entry.counter]) : undefined,
  }));

  return (
    <aside
      aria-label="Menu d'administration"
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
                <p className="font-bold text-lg text-gradient-heading">Admin</p>
                <p className="text-xs text-muted-foreground">FYGS Platform</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
            aria-label={collapsed ? "Développer le menu" : "Réduire le menu"}
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
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
        <nav aria-label="Navigation d'administration">
        {filteredNavigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50",
                isActive && "bg-primary/10 text-primary border border-primary/20",
                collapsed && "justify-center px-2",
              )}
              aria-current={isActive ? "page" : undefined}
              aria-label={collapsed ? item.title : undefined}
            >
              <>
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
                            aria-label={`${item.badge} en attente`}
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
              </>
            </Link>
          );
        })}
        </nav>
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
    </aside>
  );
}
