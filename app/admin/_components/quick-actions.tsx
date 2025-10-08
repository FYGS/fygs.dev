"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus,
  FileText,
  Users,
  BarChart3,
  Mail,
  BookOpen,
  FolderOpen
} from "lucide-react";

const quickActions = [
  {
    title: "Nouveau cours",
    description: "Créer une formation",
    href: "/admin/courses/new",
    icon: BookOpen,
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    title: "Nouvel article",
    description: "Rédiger un article",
    href: "/admin/blog/new", 
    icon: FileText,
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    title: "Nouveau projet",
    description: "Ajouter au portfolio",
    href: "/admin/projects/new",
    icon: FolderOpen,
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    title: "Gérer utilisateurs",
    description: "Administration",
    href: "/admin/users",
    icon: Users,
    color: "bg-orange-500 hover:bg-orange-600",
  },
  {
    title: "Analytics",
    description: "Voir les stats",
    href: "/admin/analytics",
    icon: BarChart3,
    color: "bg-indigo-500 hover:bg-indigo-600",
  },
  {
    title: "Campagne email",
    description: "Envoyer un email",
    href: "/admin/emails/new",
    icon: Mail,
    color: "bg-pink-500 hover:bg-pink-600",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Actions rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button
                variant="ghost"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted/50 transition-all duration-200 group"
              >
                <div className={`p-3 rounded-lg text-white transition-colors ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm group-hover:text-primary transition-colors">
                    {action.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
