"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from "lucide-react";

// Données simulées pour la croissance des utilisateurs
const userGrowthData = [
  { month: "Jan", users: 120, newUsers: 25 },
  { month: "Fév", users: 145, newUsers: 32 },
  { month: "Mar", users: 180, newUsers: 45 },
  { month: "Avr", users: 220, newUsers: 38 },
  { month: "Mai", users: 265, newUsers: 52 },
  { month: "Juin", users: 310, newUsers: 48 },
  { month: "Juil", users: 365, newUsers: 65 },
  { month: "Août", users: 420, newUsers: 58 },
  { month: "Sep", users: 485, newUsers: 72 },
  { month: "Oct", users: 560, newUsers: 68 },
  { month: "Nov", users: 635, newUsers: 85 },
  { month: "Déc", users: 720, newUsers: 92 },
];

export function UserGrowthChart() {
  const totalUsers = userGrowthData[userGrowthData.length - 1].users;
  const previousMonthUsers = userGrowthData[userGrowthData.length - 2].users;
  const growthRate = ((totalUsers - previousMonthUsers) / previousMonthUsers) * 100;
  
  const maxUsers = Math.max(...userGrowthData.map(item => item.users));
  const maxNewUsers = Math.max(...userGrowthData.map(item => item.newUsers));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Croissance utilisateurs
          </CardTitle>
          <Badge variant="default">
            <TrendingUp className="h-3 w-3 mr-1" />
            +{growthRate.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Métriques principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total utilisateurs</p>
              <p className="text-2xl font-bold">{totalUsers.toLocaleString("fr-FR")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Ce mois-ci</p>
              <p className="text-2xl font-bold text-green-600">
                +{userGrowthData[userGrowthData.length - 1].newUsers}
              </p>
            </div>
          </div>

          {/* Graphique en aires */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Évolution sur 12 mois</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-xs">Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Nouveaux</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {userGrowthData.map((item, index) => {
                const totalHeight = (item.users / maxUsers) * 100;
                const newHeight = (item.newUsers / maxNewUsers) * 60; // Échelle différente pour les nouveaux
                
                return (
                  <div key={index} className="flex items-end gap-2">
                    <div className="w-8 text-xs text-muted-foreground">
                      {item.month}
                    </div>
                    
                    {/* Barre total utilisateurs */}
                    <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                        style={{ width: `${totalHeight}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-2">
                        <span className="text-xs font-medium text-white mix-blend-difference">
                          {item.users}
                        </span>
                      </div>
                    </div>
                    
                    {/* Barre nouveaux utilisateurs */}
                    <div className="w-16 bg-muted rounded-full h-4 relative overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                        style={{ width: `${newHeight}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white mix-blend-difference">
                          +{item.newUsers}
                        </span>
                      </div>
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
