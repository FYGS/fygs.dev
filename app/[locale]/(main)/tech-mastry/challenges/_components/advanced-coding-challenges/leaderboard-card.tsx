import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

export function LeaderboardCard() {
  return (
    <Card className="backdrop-blur-xl bg-background/80 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <span>Challenge Leaderboard</span>
        </CardTitle>
        <CardDescription>
          Top performers in coding challenges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((rank) => (
            <div
              key={rank}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border",
                rank === 1 && "bg-yellow-500/10 border-yellow-500/20",
                rank === 2 && "bg-gray-500/10 border-gray-500/20",
                rank === 3 && "bg-orange-800/10 border-orange-800/20",
                rank > 3 && "border-border/50 hover:bg-muted/30",
              )}
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center font-bold",
                  rank === 1 && "bg-yellow-500/20 text-yellow-500",
                  rank === 2 && "bg-gray-500/20 text-gray-500",
                  rank === 3 && "bg-orange-800/20 text-orange-800",
                  rank > 3 && "bg-muted text-muted-foreground",
                )}
              >
                {rank}
              </div>

              <div className="flex-1">
                <p className="font-medium">User {rank}</p>
                <p className="text-sm text-muted-foreground">
                  @username{rank}
                </p>
              </div>

              <div className="text-right">
                <p className="font-medium">{1000 - rank * 100} pts</p>
                <p className="text-xs text-muted-foreground">
                  {50 - rank * 5} challenges
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
