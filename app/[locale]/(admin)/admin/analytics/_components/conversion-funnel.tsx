"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Filter,
  Eye,
  UserPlus,
  BookOpen,
  CreditCard,
  Award,
  TrendingDown
} from "lucide-react";

interface ConversionFunnelProps {
  data: {
    visitors: number;
    signups: number;
    enrollments: number;
    purchases: number;
    certificates: number;
  };
}

interface FunnelStepProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number;
  percentage: number;
  conversionRate?: number;
  color: string;
  isLast?: boolean;
}

function FunnelStep({ 
  icon: Icon, 
  title, 
  value, 
  percentage, 
  conversionRate, 
  color,
  isLast = false 
}: FunnelStepProps) {
  return (
    <div className="relative">
      {/* Step content */}
      <div className={`relative p-4 rounded-lg border-2 ${color} bg-linear-to-r from-transparent to-muted/20`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${color.replace('border-', 'bg-').replace('/20', '/10')}`}>
            <Icon className={`h-5 w-5 ${color.replace('border-', 'text-').replace('/20', '')}`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">{title}</h3>
              {conversionRate && (
                <Badge variant="outline" className="text-xs">
                  {conversionRate.toFixed(1)}%
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">{value.toLocaleString("fr-FR")}</span>
              <span className="text-xs text-muted-foreground">
                ({percentage.toFixed(1)}% du total)
              </span>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-700 ease-out ${color.replace('border-', 'bg-').replace('/20', '/60')}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      {/* Connector arrow */}
      {!isLast && (
        <div className="flex justify-center my-2">
          <TrendingDown className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  // Calculer les pourcentages et taux de conversion
  const steps = [
    {
      icon: Eye,
      title: "Visiteurs",
      value: data.visitors,
      percentage: 100,
      color: "border-blue-500/20",
    },
    {
      icon: UserPlus,
      title: "Inscriptions",
      value: data.signups,
      percentage: (data.signups / data.visitors) * 100,
      conversionRate: (data.signups / data.visitors) * 100,
      color: "border-green-500/20",
    },
    {
      icon: BookOpen,
      title: "Cours suivis",
      value: data.enrollments,
      percentage: (data.enrollments / data.visitors) * 100,
      conversionRate: (data.enrollments / data.signups) * 100,
      color: "border-purple-500/20",
    },
    {
      icon: CreditCard,
      title: "Achats",
      value: data.purchases,
      percentage: (data.purchases / data.visitors) * 100,
      conversionRate: (data.purchases / data.enrollments) * 100,
      color: "border-orange-500/20",
    },
    {
      icon: Award,
      title: "Certifications",
      value: data.certificates,
      percentage: (data.certificates / data.visitors) * 100,
      conversionRate: (data.certificates / data.purchases) * 100,
      color: "border-yellow-500/20",
      isLast: true,
    },
  ];

  // Calculer les métriques globales
  const overallConversionRate = (data.purchases / data.visitors) * 100;
  const completionRate = (data.certificates / data.purchases) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Funnel de conversion
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">
              Conversion: {overallConversionRate.toFixed(1)}%
            </Badge>
            <Badge variant="outline">
              Complétion: {completionRate.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {steps.map((step, index) => (
            <FunnelStep
              key={index}
              icon={step.icon}
              title={step.title}
              value={step.value}
              percentage={step.percentage}
              conversionRate={step.conversionRate}
              color={step.color}
              isLast={step.isLast}
            />
          ))}
        </div>

        {/* Insights */}
        <div className="border-t pt-4 mt-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Analyse du funnel
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="text-muted-foreground">Points forts:</p>
                <p>• Taux d&apos;inscription: {((data.signups / data.visitors) * 100).toFixed(1)}%</p>
                <p>• Engagement cours: {((data.enrollments / data.signups) * 100).toFixed(1)}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">À améliorer:</p>
                <p>• Conversion achat: {((data.purchases / data.enrollments) * 100).toFixed(1)}%</p>
                <p>• Taux de complétion: {completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
