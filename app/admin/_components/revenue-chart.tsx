"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Euro, TrendingUp } from "lucide-react";

interface RevenueChartProps {
  data: Array<{
    month: Date;
    revenue: number;
    transactions: number;
  }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Calculer les totaux et tendances
  const totalRevenue = data.reduce((sum, item) => sum + Number(item.revenue), 0);
  const totalTransactions = data.reduce((sum, item) => sum + Number(item.transactions), 0);
  
  // Calculer la croissance par rapport au mois précédent
  const currentMonth = data[data.length - 1];
  const previousMonth = data[data.length - 2];
  const growthRate = previousMonth ? 
    ((Number(currentMonth?.revenue) - Number(previousMonth.revenue)) / Number(previousMonth.revenue)) * 100 : 0;

  // Trouver le maximum pour la normalisation
  const maxRevenue = Math.max(...data.map(item => Number(item.revenue)));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Revenus mensuels
          </CardTitle>
          <Badge variant={growthRate >= 0 ? "default" : "destructive"}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Métriques principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Revenus totaux</p>
              <p className="text-2xl font-bold">{totalRevenue.toLocaleString()}€</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold">{totalTransactions}</p>
            </div>
          </div>

          {/* Graphique en barres simple */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Évolution sur 12 mois</span>
              <span>Max: {maxRevenue.toLocaleString()}€</span>
            </div>
            
            <div className="space-y-2">
              {data.map((item, index) => {
                const height = maxRevenue > 0 ? (Number(item.revenue) / maxRevenue) * 100 : 0;
                const monthName = item.month.toLocaleDateString('fr-FR', { 
                  month: 'short', 
                  year: '2-digit' 
                });
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-12 text-xs text-muted-foreground">
                      {monthName}
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                        style={{ width: `${height}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-2">
                        <span className="text-xs font-medium text-white mix-blend-difference">
                          {Number(item.revenue).toLocaleString()}€
                        </span>
                      </div>
                    </div>
                    <div className="w-8 text-xs text-muted-foreground text-right">
                      {Number(item.transactions)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
