"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Activity,
  UserPlus,
 BookOpen,
  CreditCard,
  MessageSquare,
  FileText,
  Award
} from "lucide-react";

// Données simulées pour l'activité récente
const recentActivities = [
  {
    id: 1,
    type: "user_registered",
    title: "Nouvel utilisateur",
    description: "Alice Martin s'est inscrite",
    user: {
      name: "Alice Martin",
      email: "alice@example.com",
      avatar: null,
    },
    minutesAgo: 5,
    icon: UserPlus,
    color: "text-green-600",
  },
  {
    id: 2,
    type: "course_enrolled",
    title: "Nouvelle inscription",
    description: "Thomas s'est inscrit à 'Next.js 15 Mastery'",
    user: {
      name: "Thomas Dubois",
      email: "thomas@example.com", 
      avatar: null,
    },
    minutesAgo: 15,
    icon: BookOpen,
    color: "text-blue-600",
  },
  {
    id: 3,
    type: "payment_received",
    title: "Paiement reçu",
    description: "129€ pour 'IA & Applications Modernes'",
    user: {
      name: "Marie Bernard",
      email: "marie@example.com",
      avatar: null,
    },
    minutesAgo: 30,
    icon: CreditCard,
    color: "text-orange-600",
  },
  {
    id: 4,
    type: "message_received",
    title: "Nouveau message",
    description: "Question sur le cours TypeScript",
    user: {
      name: "Pierre Durand",
      email: "pierre@example.com",
      avatar: null,
    },
    minutesAgo: 45,
    icon: MessageSquare,
    color: "text-purple-600",
  },
  {
    id: 5,
    type: "blog_published",
    title: "Article publié",
    description: "Les nouveautés de React 19",
    user: {
      name: "Fernand Soualo",
      email: "fernand@fygs.dev",
      avatar: "/images/fernand-avatar.jpg",
    },
    minutesAgo: 120,
    icon: FileText,
    color: "text-indigo-600",
 },
  {
    id: 6,
    type: "certificate_issued",
    title: "Certificat délivré",
    description: "JavaScript Moderne et ES6+ complété",
    user: {
      name: "Sophie Laurent",
      email: "sophie@example.com",
      avatar: null,
    },
    minutesAgo: 180,
    icon: Award,
    color: "text-yellow-600",
  },
];

// The activity below is sample data expressed as an age, not as a date: a date computed
// from Date.now() at module load differs between the server (started long ago) and the
// browser, which made the labels mismatch at hydration.
function formatTimeAgo(minutesAgo: number): string {
  const diffHours = Math.floor(minutesAgo / 60);
  const diffDays = Math.floor(minutesAgo / (60 * 24));

  if (minutesAgo < 1) return "À l'instant";
  if (minutesAgo < 60) return `Il y a ${minutesAgo}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${diffDays}j`;
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[380px] w-full rounded-md">
          <div className="space-y-4 p-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Icon */}
                <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                  <activity.icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">
                      {activity.title}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatTimeAgo(activity.minutesAgo)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>

                  {/* User info */}
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.user.avatar || ""} />
                      <AvatarFallback className="text-xs">
                        {activity.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {activity.user.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
