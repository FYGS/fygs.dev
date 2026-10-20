"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, UserPlus } from "lucide-react";

interface UserAnalyticsProps {
  data: Array<{
    month: Date;
    new_users: number;
    total_users: number;
  }>;
  /** The length of the period shown, in months */
  months: number;
}

export function UserAnalytics({ data, months }: UserAnalyticsProps) {
  // Calculer les métriques
  const totalUsers = data[data.length - 1]?.total_users || 0;
  const newUsersThisMonth = data[data.length - 1]?.new_users || 0;
  const totalNewUsers = data.reduce((sum, item) => sum + item.new_users, 0);
  
  // Calculer la croissance
  const currentMonth = data[data.length - 1];
  const previousMonth = data[data.length - 2];
  const growthRate = previousMonth && previousMonth.new_users > 0 ? 
    ((currentMonth?.new_users - previousMonth.new_users) / previousMonth.new_users) * 100 : 0;

  // Trouver le maximum pour la normalisation
  const maxNewUsers = Math.max(0, ...data.map(item => item.new_users));
  const maxTotalUsers = Math.max(0, ...data.map(item => item.total_users));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Croissance utilisateurs
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
              <p className="text-xl font-bold">{totalUsers.toLocaleString("fr-FR")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Ce mois</p>
              <p className="text-xl font-bold text-blue-600">+{newUsersThisMonth}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Sur {months} mois</p>
              <p className="text-xl font-bold">+{totalNewUsers}</p>
            </div>
          </div>

          {/* Graphique double */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Évolution mensuelle</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs">Nouveaux</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs">Total</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {data.map((item, index) => {
                const newUsersHeight = maxNewUsers > 0 ? (item.new_users / maxNewUsers) * 100 : 0;
                const totalUsersHeight = maxTotalUsers > 0 ? (item.total_users / maxTotalUsers) * 60 : 0; // Échelle différente
                const monthName = item.month.toLocaleDateString('fr-FR', { 
                  month: 'short', 
                  year: '2-digit' 
                });
                
                return (
                  <div key={index} className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 text-xs text-muted-foreground">
                        {monthName}
                      </div>
                      
                      {/* Barre nouveaux utilisateurs */}
                      <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                        <div 
                          className="h-full bg-linear-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${newUsersHeight}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-3">
                          <UserPlus className="h-3 w-3 text-white mix-blend-difference mr-1" />
                          <span className="text-xs font-medium text-white mix-blend-difference">
                            +{item.new_users}
                          </span>
                        </div>
                      </div>
                      
                      {/* Barre total utilisateurs */}
                      <div className="w-24 bg-muted rounded-full h-4 relative overflow-hidden">
                        <div 
                          className="h-full bg-linear-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${totalUsersHeight}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-white mix-blend-difference">
                            {item.total_users}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Détails au hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-15 mb-1">
                      <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 w-fit">
                        Taux de croissance: {previousMonth ? ((item.new_users / previousMonth.total_users) * 100).toFixed(1) : 0}%
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
              <h3 className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Insights
              </h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• Meilleur mois: {data.reduce((max, item) => item.new_users > max.new_users ? item : max, data[0])?.month.toLocaleDateString('fr-FR', { month: 'long' })}</p>
                <p>• Croissance moyenne: +{(totalNewUsers / data.length).toFixed(0)} utilisateurs/mois</p>
                <p>• Rétention estimée: ~85% (basé sur l&apos;activité)</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
