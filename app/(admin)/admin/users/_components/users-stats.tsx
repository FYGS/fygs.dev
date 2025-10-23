"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  Shield,
  TrendingUp} from "lucide-react";

interface UsersStatsProps {
  stats: {
    total: number;
    students: number;
    instructors: number;
    admins: number;
    weeklyNew: number;
    monthlyNew: number;
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
            {value.toLocaleString()}
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
                {trend.isPositive ? '+' : ''}{trend.value}
              </span>
              <span className="text-muted-foreground">cette semaine</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function UsersStats({ stats }: UsersStatsProps) {
  const studentPercentage = stats.total > 0 ? Math.round((stats.students / stats.total) * 100) : 0;
  const instructorPercentage = stats.total > 0 ? Math.round((stats.instructors / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total utilisateurs"
        value={stats.total}
        icon={Users}
        description={`${studentPercentage}% étudiants`}
        color="text-blue-600"
        trend={{ value: stats.weeklyNew, isPositive: stats.weeklyNew > 0 }}
      />
      
      <StatCard
        title="Étudiants"
        value={stats.students}
        icon={GraduationCap}
        description={`${studentPercentage}% du total`}
        color="text-green-600"
      />
      
      <StatCard
        title="Instructeurs"
        value={stats.instructors}
        icon={UserCheck}
        description={`${instructorPercentage}% du total`}
        color="text-purple-600"
      />
      
      <StatCard
        title="Administrateurs"
        value={stats.admins}
        icon={Shield}
        description="Accès complet"
        color="text-red-600"
      />
    </div>
  );
}
