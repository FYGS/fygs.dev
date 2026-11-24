import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, Award, BookOpen, CreditCard, Star, UserPlus, type LucideIcon } from "lucide-react";
import { formatTimeAgo, type AdminActivity, type AdminActivityType } from "@/lib/services/admin-activity";

const APPEARANCE: Record<AdminActivityType, { icon: LucideIcon; color: string }> = {
  user_registered: { icon: UserPlus, color: "text-green-600" },
  course_enrolled: { icon: BookOpen, color: "text-blue-600" },
  payment_received: { icon: CreditCard, color: "text-orange-600" },
  review_posted: { icon: Star, color: "text-purple-600" },
  certificate_issued: { icon: Award, color: "text-yellow-600" },
};

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * Server component: the relative labels are computed once on the server and sent as
 * text, so there is nothing to hydrate and no clock mismatch between server and browser.
 */
export function RecentActivity({ activities, now = new Date() }: { activities: AdminActivity[]; now?: Date }) {
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
          {activities.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Aucune activité récente.</p>
          ) : (
            <ul
              className="space-y-4 p-4 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
              tabIndex={0}
              aria-label="Dernières activités"
            >
              {activities.map((activity) => {
                const { icon: Icon, color } = APPEARANCE[activity.type];
                return (
                  <li
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full bg-muted ${color}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTimeAgo(activity.at, now)}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground">{activity.description}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={activity.userImage ?? ""} alt="" />
                          <AvatarFallback className="text-xs">{initials(activity.userName)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{activity.userName}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
