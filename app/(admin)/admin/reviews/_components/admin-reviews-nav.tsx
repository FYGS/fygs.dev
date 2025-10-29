"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  MessageSquare, 
  Settings, 
  Shield
} from "lucide-react";

export function AdminReviewsNav() {
  const pathname = usePathname();
  
  const navItems = [
    {
      title: "Vue d'ensemble",
      href: "/admin/reviews",
      icon: MessageSquare,
      description: "Tous les avis"
    },
    {
      title: "Analytics",
      href: "/admin/reviews/analytics", 
      icon: BarChart3,
      description: "Statistiques détaillées"
    },
    {
      title: "Modération",
      href: "/admin/reviews/moderation",
      icon: Shield,
      description: "File d'attente de modération"
    },
    {
      title: "Paramètres",
      href: "/admin/reviews/settings",
      icon: Settings,
      description: "Configuration des avis"
    }
  ];

  return (
    <div className="border-b border-border">
      <div className="container mx-auto px-4">
        <nav className="flex space-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}