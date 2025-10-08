"use client";

import { ReactNode, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableWithPaginationProps<T> {
  // Données
  data: T[];
  totalItems: number;
  isLoading?: boolean;
  
  // Configuration de pagination
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  
  // Configuration de la table
  title: string;
  description?: string;
  renderTable: (data: T[]) => ReactNode;
  
  // Recherche et filtres
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  
  // Filtres personnalisés
  filters?: Array<{
    key: string;
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
  }>;
  
  // Actions
  actions?: ReactNode;
  onRefresh?: () => void;
  onExport?: () => void;
  
  // Style
  className?: string;
}

export function TableWithPagination<T>({
  data,
  totalItems,
  isLoading = false,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  title,
  description,
  renderTable,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  filters = [],
  actions,
  onRefresh,
  onExport,
  className,
}: TableWithPaginationProps<T>) {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && localSearchValue !== searchValue) {
        onSearchChange(localSearchValue);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [localSearchValue, onSearchChange, searchValue]);

  const handlePageSizeChange = (newSize: string) => {
    const size = parseInt(newSize, 10);
    onPageSizeChange(size);
    // Reset to first page when changing page size
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {title}
              </CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            
            {/* Actions principales */}
            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              )}
              
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              )}
              
              {actions}
            </div>
          </div>
          
          {/* Barre de recherche et filtres */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Recherche */}
            {onSearchChange && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={localSearchValue}
                  onChange={(e) => setLocalSearchValue(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
            
            {/* Filtres personnalisés */}
            {filters.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                {filters.map((filter) => (
                  <Select
                    key={filter.key}
                    value={filter.value}
                    onValueChange={filter.onChange}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Table */}
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            )}
            
            {renderTable(data)}
          </div>
          
          {/* Pagination */}
          {totalItems > 0 && (
            <div className="border-t p-4">
              <Pagination
                totalItems={totalItems}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={onPageChange}
                baseUrl="" // Not used in controlled mode
                searchParams={{
                  page: currentPage,
                  size: pageSize,
                }}
              />
              
              {/* Page size selector */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Affichage de {Math.min((currentPage - 1) * pageSize + 1, totalItems)} à{" "}
                  {Math.min(currentPage * pageSize, totalItems)} sur {totalItems} éléments
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Éléments par page:</span>
                  <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          {/* Empty state */}
          {!isLoading && totalItems === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium mb-2">Aucun élément trouvé</h3>
                <p className="text-sm">
                  {searchValue || filters.some(f => f.value !== "all")
                    ? "Essayez de modifier vos critères de recherche"
                    : "Il n'y a pas encore d'éléments à afficher"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
