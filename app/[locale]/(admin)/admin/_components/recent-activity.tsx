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
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
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
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
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
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
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
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
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
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
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
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3h ago
    icon: Award,
    color: "text-yellow-600",
  },
];

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 24));

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins}min`;
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
                      {formatTimeAgo(activity.timestamp)}
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
