import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/db";
import { 
  Flame, 
  Calendar, 
  TrendingUp, 
  Clock,
  Star
} from "lucide-react";

interface LearningStreakProps {
  userId: string;
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function LearningStreak({ userId }: LearningStreakProps) {
  // Get user's learning activity for streak calculation
  const recentProgress = await db.progress.findMany({
    where: { 
      userId,
      completed: true,
      completedAt: {
        gte: daysAgo(30) // Last 30 days
      }
    },
    orderBy: { completedAt: 'desc' },
    select: {
      completedAt: true,
      watchTime: true
    }
  });

  // Calculate streak
  const calculateStreak = () => {
    if (recentProgress.length === 0) return 0;
    
    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const progressByDate = new Map();
    recentProgress.forEach(p => {
      if (p.completedAt) {
        const date = new Date(p.completedAt);
        date.setHours(0, 0, 0, 0);
        const dateKey = date.getTime();
        progressByDate.set(dateKey, true);
      }
    });
    
    // Check consecutive days
    while (progressByDate.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();
  const totalWatchTime = recentProgress.reduce((acc, p) => acc + (p.watchTime || 0), 0);
  const averageDaily = recentProgress.length > 0 ? Math.round(totalWatchTime / recentProgress.length / 60) : 0;
  
  // Weekly goal progress (example: 5 hours per week)
  const weeklyGoalMinutes = 5 * 60; // 5 hours
  const thisWeekProgress = recentProgress
    .filter(p => {
      if (!p.completedAt) return false;
      const weekAgo = daysAgo(7);
      return new Date(p.completedAt) >= weekAgo;
    })
    .reduce((acc, p) => acc + (p.watchTime || 0), 0);
  
  const weeklyProgressPercent = Math.min(100, (thisWeekProgress / (weeklyGoalMinutes * 60)) * 100);

  const getStreakBadge = (streak: number) => {
    if (streak >= 30) return { text: "🔥 Légende", color: "bg-red-700" };
    if (streak >= 14) return { text: "⭐ Expert", color: "bg-yellow-700" };
    if (streak >= 7) return { text: "🚀 Champion", color: "bg-blue-700" };
    if (streak >= 3) return { text: "💪 Motivé", color: "bg-green-700" };
    return { text: "🌱 Débutant", color: "bg-gray-500" };
  };

  const streakBadge = getStreakBadge(currentStreak);

  return (
    <Card className="border-0 shadow-lg bg-linear-to-br from-orange-950/20 via-red-950/20 to-pink-950/20">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-900/30">
              <Flame className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Série d&apos;apprentissage</h3>
              <p className="text-sm text-muted-foreground">Votre progression quotidienne</p>
            </div>
          </div>
          <Badge className={`${streakBadge.color} text-white px-3 py-1 text-sm font-medium`}>
            {streakBadge.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Current Streak */}
          <div className="text-center p-6 bg-linear-to-br from-orange-900/40 to-orange-800/20 rounded-xl border border-orange-700/30">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-orange-400">
                {currentStreak}
              </div>
              <div className="text-sm font-medium text-orange-300">
                Jour{currentStreak !== 1 ? 's' : ''} consécutif{currentStreak !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="p-6 bg-linear-to-br from-blue-900/40 to-blue-800/20 rounded-xl border border-blue-700/30">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">Objectif hebdo</span>
                </div>
                <span className="text-xs text-blue-400 font-medium">
                  {Math.round(weeklyProgressPercent)}%
                </span>
              </div>
              <Progress value={weeklyProgressPercent} className="h-3 bg-blue-800/30" />
              <div className="text-xs text-blue-400 font-medium">
                {Math.round(thisWeekProgress / 60)}min / {weeklyGoalMinutes}min
              </div>
            </div>
          </div>

          {/* Average Daily */}
          <div className="text-center p-6 bg-linear-to-br from-green-900/40 to-green-800/20 rounded-xl border border-green-700/30">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-green-300">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Moyenne/jour</span>
              </div>
              <div className="text-3xl font-bold text-green-400">
                {averageDaily}
              </div>
              <div className="text-sm font-medium text-green-300">minutes</div>
            </div>
          </div>

          {/* This Week */}
          <div className="text-center p-6 bg-linear-to-br from-purple-900/40 to-purple-800/20 rounded-xl border border-purple-700/30">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-purple-300">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Cette semaine</span>
              </div>
              <div className="text-3xl font-bold text-purple-400">
                {recentProgress.length > 0 ? '+' : ''}{recentProgress.length}
              </div>
              <div className="text-sm font-medium text-purple-300">leçons</div>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="relative overflow-hidden rounded-xl bg-linear-to-r from-orange-500 via-red-500 to-pink-500 p-6 text-white">
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 text-center">
              {currentStreak === 0 && (
                <>
                  <Star className="h-6 w-6 text-yellow-300" />
                  <span className="text-lg font-semibold">
                    Commencez votre série dès aujourd&apos;hui ! 🚀
                  </span>
                </>
              )}
              {currentStreak > 0 && currentStreak < 3 && (
                <>
                  <Flame className="h-6 w-6 text-orange-300" />
                  <span className="text-lg font-semibold">
                    Excellent début ! Continuez sur cette lancée. 💪
                  </span>
                </>
              )}
              {currentStreak >= 3 && currentStreak < 7 && (
                <>
                  <Flame className="h-6 w-6 text-orange-300" />
                  <span className="text-lg font-semibold">
                    Fantastique ! Vous développez une excellente habitude. 🔥
                  </span>
                </>
              )}
              {currentStreak >= 7 && (
                <>
                  <Flame className="h-6 w-6 text-red-300" />
                  <span className="text-lg font-semibold">
                    Incroyable série ! Vous êtes un champion de l&apos;apprentissage. 🏆
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="absolute inset-0 bg-linear-to-r from-orange-600/20 via-red-600/20 to-pink-600/20 backdrop-blur-xs" />
        </div>
      </CardContent>
    </Card>
  );
}
