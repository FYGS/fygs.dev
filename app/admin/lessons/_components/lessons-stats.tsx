"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Eye, Users, TrendingUp, CheckCircle } from "lucide-react";

interface LessonsStatsProps {
  totalLessons: number;
  publishedLessons: number;
  totalDuration: number; // in seconds
  totalProgress: number;
  coursesWithLessons: number;
  averageLessonDuration: number; // in seconds
}

export function LessonsStats({ 
  totalLessons, 
  publishedLessons, 
  totalDuration, 
  totalProgress,
  coursesWithLessons,
  averageLessonDuration
}: LessonsStatsProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const completionRate = totalLessons > 0 ? Math.round((publishedLessons / totalLessons) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Lessons */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total des leçons</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLessons}</div>
          <p className="text-xs text-muted-foreground">
            {publishedLessons} publiées, {totalLessons - publishedLessons} brouillons
          </p>
        </CardContent>
      </Card>

      {/* Total Duration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Durée totale</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDuration(totalDuration)}</div>
          <p className="text-xs text-muted-foreground">
            Moyenne: {formatDuration(averageLessonDuration)} par leçon
          </p>
        </CardContent>
      </Card>

      {/* Student Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progrès étudiants</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProgress}</div>
          <p className="text-xs text-muted-foreground">
            Leçons complétées au total
          </p>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taux de publication</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <p className="text-xs text-muted-foreground">
            Leçons publiées / Total
          </p>
        </CardContent>
      </Card>

      {/* Courses with Lessons */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Formations actives</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{coursesWithLessons}</div>
          <p className="text-xs text-muted-foreground">
            Formations avec leçons
          </p>
        </CardContent>
      </Card>

      {/* Average Views */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Engagement</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalLessons > 0 ? Math.round(totalProgress / totalLessons) : 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Vues moyennes par leçon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}