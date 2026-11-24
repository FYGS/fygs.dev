"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Eye, 
  Star, 
  FileText,
  TrendingUp
} from "lucide-react";

interface CoursesStatsProps {
  stats: {
    total: number;
    published: number;
    featured: number;
    draft: number;
    totalLessons: number;
    totalEnrollments: number;
  };
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, icon: Icon, description, color = "text-primary", trend }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {value.toLocaleString("fr-FR")}
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className={`h-3 w-3 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`} />
              <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                {trend.isPositive ? '+' : ''}{trend.value} %
              </span>
              <span className="text-muted-foreground">vs mois dernier</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function CoursesStats({ stats }: CoursesStatsProps) {
  const publishedRate = stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0;
  const avgLessonsPerCourse = stats.published > 0 ? Math.round(stats.totalLessons / stats.published) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total des cours"
        value={stats.total}
        icon={BookOpen}
        description={`${publishedRate} % publiés`}
        color="text-blue-600"
        trend={{ value: 12, isPositive: true }}
      />
      
      <StatCard
        title="Cours publiés"
        value={stats.published}
        icon={Eye}
        description={`${stats.draft} brouillons`}
        color="text-green-600"
        trend={{ value: 8, isPositive: true }}
      />
      
      <StatCard
        title="Cours mis en avant"
        value={stats.featured}
        icon={Star}
        description="Promus sur l'accueil"
        color="text-yellow-600"
      />
      
      <StatCard
        title="Total des leçons"
        value={stats.totalLessons}
        icon={FileText}
        description={`~${avgLessonsPerCourse} par cours`}
        color="text-purple-600"
        trend={{ value: 15, isPositive: true }}
      />
    </div>
  );
}
