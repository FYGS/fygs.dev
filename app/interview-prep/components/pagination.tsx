import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => Promise<void> | void;
  isFirstPage: boolean;
  isLastPage: boolean;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isFirstPage,
  isLastPage,
  isLoading = false,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage || isLoading}
      >
        <ChevronLeft className="h-4 w-4" />
        Précédent
      </Button>

      <div className="flex items-center gap-1 font-mono text-sm">
        <span className="text-primary">{currentPage}</span>
        <span className="text-muted-foreground">/ {totalPages}</span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage || isLoading}
      >
        Suivant
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
