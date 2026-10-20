"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Euro,
  Users,
  TrendingUp,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";

interface AnalyticsOverviewProps {
  stats: {
    totalRevenue: number;
    monthlyRevenue: number;
    monthlyUsers: number;
    monthlyEnrollments: number;
  };
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
    period: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  format?: "currency" | "number" | "percentage";
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = "text-primary",
  format = "number"
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (format === "currency") {
      return typeof val === "number" ? `${val.toLocaleString("fr-FR")}€` : val;
    }
    if (format === "percentage") {
      return typeof val === "number" ? `${val}%` : val;
    }
    return typeof val === "number" ? val.toLocaleString("fr-FR") : val;
  };

  const getChangeIcon = () => {
    if (!change) return null;
    switch (change.type) {
      case "increase":
        return <ArrowUpRight className="h-3 w-3" />;
      case "decrease":
        return <ArrowDownRight className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getChangeColor = () => {
    if (!change) return "";
    switch (change.type) {
      case "increase":
        return "text-green-400 bg-green-950 border-green-800";
      case "decrease":
        return "text-red-400 bg-red-950 border-red-800";
      default:
        return "text-muted-foreground bg-muted border-muted";
    }
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
        <div className="space-y-3">
          <div className="text-3xl font-bold">
            {formatValue(value)}
          </div>
          
          {change && (
            <Badge 
              variant="outline" 
              className={`${getChangeColor()} w-fit`}
            >
              {getChangeIcon()}
              <span className="ml-1">
                {change.value > 0 ? '+' : ''}{change.value}%
              </span>
              <span className="ml-1 text-xs opacity-75">
                {change.period}
              </span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsOverview({ stats }: AnalyticsOverviewProps) {
  // Calculer les changements (simulés pour l'exemple)
  const revenueGrowth = 15.2; // +15.2% par rapport au mois précédent
  const userGrowth = 8.7; // +8.7% par rapport au mois précédent
  const enrollmentGrowth = 12.4; // +12.4% par rapport au mois précédent

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Revenus totaux"
        value={stats.totalRevenue}
        change={{
          value: revenueGrowth,
          type: "increase",
          period: "vs mois dernier"
        }}
        icon={Euro}
        color="text-green-600"
        format="currency"
      />
      
      <MetricCard
        title="Revenus ce mois"
        value={stats.monthlyRevenue}
        change={{
          value: revenueGrowth,
          type: "increase",
          period: "vs mois dernier"
        }}
        icon={TrendingUp}
        color="text-blue-600"
        format="currency"
      />
      
      <MetricCard
        title="Nouveaux utilisateurs"
        value={stats.monthlyUsers}
        change={{
          value: userGrowth,
          type: "increase",
          period: "ce mois"
        }}
        icon={Users}
        color="text-purple-600"
      />
      
      <MetricCard
        title="Nouvelles inscriptions"
        value={stats.monthlyEnrollments}
        change={{
          value: enrollmentGrowth,
          type: "increase",
          period: "ce mois"
        }}
        icon={BookOpen}
        color="text-orange-600"
      />
    </div>
  );
}
