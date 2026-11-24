"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Settings,
  Info,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AdvancedPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
  showPageSizeSelector?: boolean;
  showQuickJump?: boolean;
  showInfo?: boolean;
  pageSizeOptions?: number[];
  maxVisiblePages?: number;
}

export function AdvancedPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  onPageSizeChange,
  className,
  showPageSizeSelector = true,
  showQuickJump = true,
  showInfo = true,
  pageSizeOptions = [10, 25, 50, 100],
  maxVisiblePages = 7,
}: AdvancedPaginationProps) {
  const [jumpToPage, setJumpToPage] = useState("");

  // Générer la liste des pages visibles
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Ajuster si on est près de la fin
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    
    // Première page + ellipsis si nécessaire
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    // Pages du milieu
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Ellipsis + dernière page si nécessaire
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const handleQuickJump = () => {
    const pageNum = parseInt(jumpToPage, 10);
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setJumpToPage("");
    }
  };

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      {/* Informations et sélecteur de taille */}
      <div className="flex items-center gap-4">
        {showInfo && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>
              {totalItems > 0 
                ? `${startIndex}-${endIndex} sur ${totalItems.toLocaleString("fr-FR")}`
                : "Aucun élément"
              }
            </span>
          </div>
        )}

        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <Label htmlFor="page-size" className="text-sm text-muted-foreground">
              Par page:
            </Label>
            <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}>
              <SelectTrigger id="page-size" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Navigation et contrôles */}
      <div className="flex items-center gap-2">
        {/* Saut rapide */}
        {showQuickJump && totalPages > 10 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="jump-to-page" className="text-sm font-medium">
                    Aller à la page
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="jump-to-page"
                      type="number"
                      min="1"
                      max={totalPages}
                      value={jumpToPage}
                      onChange={(e) => setJumpToPage(e.target.value)}
                      placeholder={`1-${totalPages}`}
                      className="h-8"
                    />
                    <Button size="sm" onClick={handleQuickJump} className="h-8">
                      Aller
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Page actuelle: <Badge variant="secondary">{currentPage}</Badge> sur {totalPages}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Navigation première/précédente */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage}
          title="Première page"
        >
          <ChevronFirst className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          title="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Pages numérotées */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => {
            if (page === "...") {
              return (
                <Button
                  key={`ellipsis-${index}`}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              );
            }

            return (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Navigation suivante/dernière */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          title="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          title="Dernière page"
        >
          <ChevronLast className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
