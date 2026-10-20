"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, UserPlus, BookOpen, CreditCard, Award, TrendingDown } from "lucide-react";

interface ConversionFunnelProps {
  data: {
    signups: number;
    learners: number;
    payers: number;
    certified: number;
  };
}

/** A share in percent, 0 when there is nobody to divide by. */
const share = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);

function FunnelStep({
  icon: Icon,
  title,
  value,
  percentage,
  conversionRate,
  color,
  isLast = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number;
  percentage: number;
  conversionRate?: number;
  color: string;
  isLast?: boolean;
}) {
  return (
    <div className="relative">
      <div className={`relative p-4 rounded-lg border-2 ${color} bg-linear-to-r from-transparent to-muted/20`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${color.replace("border-", "bg-").replace("/20", "/10")}`}>
            <Icon className={`h-5 w-5 ${color.replace("border-", "text-").replace("/20", "")}`} />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">{title}</h3>
              {conversionRate !== undefined && (
                <Badge variant="outline" className="text-xs">
                  {conversionRate.toFixed(1)}% de l&apos;étape précédente
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">{value.toLocaleString("fr-FR")}</span>
              <span className="text-xs text-muted-foreground">({percentage.toFixed(1)}% des inscrits)</span>
            </div>
          </div>
        </div>

        <div className="mt-3 bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${color.replace("border-", "bg-").replace("/20", "/60")}`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>

      {!isLast && (
        <div className="flex justify-center my-2">
          <TrendingDown className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

/** Each step counts distinct people who did that, out of everyone registered; nothing is estimated. */
export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const steps = [
    { icon: UserPlus, title: "Inscrits", value: data.signups, percentage: share(data.signups, data.signups), color: "border-blue-500/20" },
    {
      icon: BookOpen,
      title: "Ont suivi une formation",
      value: data.learners,
      percentage: share(data.learners, data.signups),
      conversionRate: share(data.learners, data.signups),
      color: "border-green-500/20",
    },
    {
      icon: CreditCard,
      title: "Clients payants",
      value: data.payers,
      percentage: share(data.payers, data.signups),
      conversionRate: share(data.payers, data.learners),
      color: "border-orange-500/20",
    },
    {
      icon: Award,
      title: "Certifiés",
      value: data.certified,
      percentage: share(data.certified, data.signups),
      conversionRate: share(data.certified, data.payers),
      color: "border-yellow-500/20",
      isLast: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Funnel de conversion
          </CardTitle>
          <Badge variant="outline">Inscrit → client : {share(data.payers, data.signups).toFixed(1)}%</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {data.signups === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun inscrit pour le moment.</p>
        ) : (
          <div className="space-y-1">
            {steps.map((step) => (
              <FunnelStep key={step.title} {...step} />
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Chaque étape compte des personnes distinctes. Une personne certifiée sur une formation gratuite n&apos;a pas payé : les étapes ne
          s&apos;emboîtent donc pas toujours exactement.
        </p>
      </CardContent>
    </Card>
  );
}
