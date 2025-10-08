"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Download, 
  Calendar,
  Filter,
  RefreshCw,
  Share,
  BarChart3
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AnalyticsHeader() {
  const [timeRange, setTimeRange] = useState("12months");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simuler un refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-4">
      {/* Title and main actions */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Analytics & Rapports
          </h1>
          <p className="text-muted-foreground">
            Analyses détaillées des performances de la plateforme FYGS Learning
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Partager
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Format d&apos;export</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Rapport PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                Données CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                Graphiques PNG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters and controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Time range selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 derniers jours</SelectItem>
              <SelectItem value="30days">30 derniers jours</SelectItem>
              <SelectItem value="3months">3 derniers mois</SelectItem>
              <SelectItem value="6months">6 derniers mois</SelectItem>
              <SelectItem value="12months">12 derniers mois</SelectItem>
              <SelectItem value="custom">Période personnalisée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Metric selector */}
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <Select defaultValue="revenue">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenus</SelectItem>
              <SelectItem value="users">Utilisateurs</SelectItem>
              <SelectItem value="courses">Cours</SelectItem>
              <SelectItem value="enrollments">Inscriptions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Additional filters */}
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtres avancés
        </Button>

        {/* Auto-refresh indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Mise à jour automatique</span>
        </div>
      </div>
    </div>
  );
}
