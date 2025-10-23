"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Euro,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

interface AdminDashboardStatsProps {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  recentUsers: number;
  recentEnrollments: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  description?: string;
  color?: string;
}

function StatCard({ title, value, icon: Icon, trend, description, color = "text-primary" }: StatCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value === 0) return <Minus className="h-3 w-3" />;
    return trend.isPositive ? 
      <TrendingUp className="h-3 w-3" /> : 
      <TrendingDown className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.value === 0) return "text-muted-foreground";
    return trend.isPositive ? "text-green-600" : "text-red-600";
  };

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
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          
          {trend && (
            <div className="flex items-center gap-1">
              <Badge 
                variant="outline" 
                className={`${getTrendColor()} border-current`}
              >
                {getTrendIcon()}
                <span className="ml-1">
                  {trend.value > 0 ? '+' : ''}{trend.value}
                </span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            </div>
          )}
          
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboardStats({
  totalUsers,
  totalCourses,
  totalEnrollments,
  totalRevenue,
  recentUsers,
  recentEnrollments,
}: AdminDashboardStatsProps) {
  // Calculate real growth rates based on recent activity
  const userGrowthRate = totalUsers > 0 ? Math.round((recentUsers / totalUsers) * 100) : 0;
  const enrollmentGrowthRate = totalEnrollments > 0 ? Math.round((recentEnrollments / totalEnrollments) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Utilisateurs totaux"
        value={totalUsers}
        icon={Users}
        trend={{
          value: userGrowthRate,
          isPositive: userGrowthRate > 0,
          label: `${userGrowthRate}% cette semaine`
        }}
        description="Étudiants et instructeurs"
        color="text-blue-600"
      />
      
      <StatCard
        title="Formations publiées"
        value={totalCourses}
        icon={BookOpen}
        description="Cours disponibles"
        color="text-green-600"
      />
      
      <StatCard
        title="Inscriptions totales"
        value={totalEnrollments}
        icon={GraduationCap}
        trend={{
          value: enrollmentGrowthRate,
          isPositive: enrollmentGrowthRate > 0,
          label: `${enrollmentGrowthRate}% cette semaine`
        }}
        description="Toutes formations confondues"
        color="text-purple-600"
      />
      
      <StatCard
        title="Revenus totaux"
        value={`${totalRevenue.toLocaleString()}€`}
        icon={Euro}
        description="Paiements confirmés"
        color="text-orange-600"
      />
    </div>
  );
}
