import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Search,
  Calendar,
  MessageCircle,
  Download,
  Zap,
  Target,
  CreditCard,
  Award
} from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      title: "Parcourir les formations",
      description: "Découvrez de nouveaux cours",
      icon: BookOpen,
      href: "/formations",
      color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
      badge: "Populaire"
    },
    {
      title: "Rechercher du contenu",
      description: "Trouvez rapidement ce que vous cherchez",
      icon: Search,
      href: "/formations?search=",
      color: "bg-green-500/10 text-green-600 hover:bg-green-500/20"
    },
    {
      title: "Planifier une session",
      description: "Organisez votre apprentissage",
      icon: Calendar,
      href: "/dashboard/schedule",
      color: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20"
    },
    {
      title: "Communauté",
      description: "Rejoignez les discussions",
      icon: MessageCircle,
      href: "/community",
      color: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20",
      badge: "Nouveau"
    },
    {
      title: "Téléchargements",
      description: "Ressources et certificats",
      icon: Download,
      href: "/dashboard/downloads",
      color: "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20"
    },
    {
      title: "Défis rapides",
      description: "Exercices de 5 minutes",
      icon: Zap,
      href: "/challenges",
      color: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
      badge: "⚡"
    },
    {
      title: "Facturation",
      description: "Gérez vos abonnements",
      icon: CreditCard,
      href: "/dashboard/billing",
      color: "bg-pink-500/10 text-pink-600 hover:bg-pink-500/20"
    },
    {
      title: "Mes certificats",
      description: "Liste & téléchargements",
      icon: Award,
      href: "/dashboard/certificates",
      color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20",
      badge: "✔"
    }
  ];

  return (
    <Card className="border-0 shadow-lg bg-linear-to-br from-card via-card to-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Actions rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {actions.map((action) => (
            <Button
              key={action.href}
              variant="outline"
              className="relative flex flex-col items-center justify-center gap-1 h-24 sm:h-28 rounded-xl bg-background/60 backdrop-blur-sm supports-backdrop-filter:bg-background/50 hover:shadow-md transition-all group"
              asChild
            >
              <Link href={action.href} className="w-full h-full flex flex-col items-center justify-center px-2 py-2 text-center">
                {action.badge && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-[10px] sm:text-xs px-1.5 py-0.5 bg-primary text-primary-foreground"
                  >
                    {action.badge}
                  </Badge>
                )}
                <span className={`flex items-center justify-center rounded-md p-2 mb-1 transition-colors ${action.color}`}>
                  <action.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <div className="text-center w-full">
                  <div className="font-medium text-[11px] sm:text-sm leading-tight line-clamp-2 mb-0.5">
                    {action.title}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground opacity-80 line-clamp-2 hidden sm:block">
                    {action.description}
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
