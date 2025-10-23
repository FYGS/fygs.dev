"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Euro, TrendingUp, Calendar } from "lucide-react";

// Client-safe validation function for revenue data
function validateRevenueData(data: unknown[]): Array<{
  month: Date;
  revenue: number;
  transactions: number;
  avg_order_value: number;
}> {
  if (!Array.isArray(data)) {
    console.warn("Revenue data is not an array, returning empty array");
    return [];
  }

  return data.map(item => {
    const validItem = item as Record<string, unknown>;
    return {
      month: new Date(validItem.month as string | Date),
      revenue: Number(validItem.revenue) || 0,
      transactions: Number(validItem.transactions) || 0,
      avg_order_value: Number(validItem.avg_order_value) || 0,
    };
  });
}

interface RevenueAnalyticsProps {
  data: Array<{
    month: Date;
    revenue: number;
    transactions: number;
    avg_order_value: number;
  }>;
}

export function RevenueAnalytics({ data }: RevenueAnalyticsProps) {
  // Valider et nettoyer les données
  const validatedData = validateRevenueData(data);
  
  // Calculer les métriques
  const totalRevenue = validatedData.reduce((sum, item) => sum + Number(item.revenue), 0);
  const totalTransactions = validatedData.reduce((sum, item) => sum + Number(item.transactions), 0);
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  
  // Calculer la croissance
  const currentMonth = validatedData[validatedData.length - 1];
  const previousMonth = validatedData[validatedData.length - 2];
  const growthRate = previousMonth && Number(previousMonth.revenue) > 0 ? 
    ((Number(currentMonth?.revenue) - Number(previousMonth.revenue)) / Number(previousMonth.revenue)) * 100 : 0;

  // Trouver le maximum pour la normalisation
  const maxRevenue = Math.max(...validatedData.map(item => Number(item.revenue)));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Analyse des revenus
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
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{totalRevenue.toLocaleString()}€</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="text-xl font-bold">{totalTransactions}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Panier moyen</p>
              <p className="text-xl font-bold">{avgOrderValue.toFixed(0)}€</p>
            </div>
          </div>

          {/* Graphique en aires */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Évolution mensuelle</span>
              <span>Max: {maxRevenue.toLocaleString()}€</span>
            </div>
            
            <div className="space-y-2">
              {validatedData.map((item, index) => {
                const height = maxRevenue > 0 ? (Number(item.revenue) / maxRevenue) * 100 : 0;
                const monthName = item.month.toLocaleDateString('fr-FR', { 
                  month: 'short', 
                  year: '2-digit' 
                });
                
                return (
                  <div key={index} className="group">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-12 text-xs text-muted-foreground">
                        {monthName}
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                        <div 
                          className="h-full bg-linear-to-r from-green-500 to-green-400 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${height}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="text-xs font-medium text-white mix-blend-difference">
                            {Number(item.revenue).toLocaleString()}€
                          </span>
                        </div>
                      </div>
                      <div className="w-12 text-xs text-muted-foreground text-right">
                        {Number(item.transactions)}
                      </div>
                    </div>
                    
                    {/* Détails au hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-15 mb-2">
                      <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 w-fit">
                        Panier moyen: {(Number(item.revenue) / Number(item.transactions)).toFixed(0)}€
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Insights
              </h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• Meilleur mois: {data.reduce((max, item) => item.revenue > max.revenue ? item : max, data[0])?.month.toLocaleDateString('fr-FR', { month: 'long' })}</p>
                <p>• Croissance moyenne: +{(growthRate / data.length).toFixed(1)}% par mois</p>
                <p>• Tendance: {growthRate > 0 ? 'Croissance' : growthRate < 0 ? 'Décroissance' : 'Stable'}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
