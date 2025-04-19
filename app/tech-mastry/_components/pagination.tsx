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
  // Générer un tableau de pages à afficher
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Nombre maximum de pages à afficher

    if (totalPages <= maxPagesToShow) {
      // Afficher toutes les pages si leur nombre est inférieur ou égal au maximum
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Toujours afficher la première page
      pageNumbers.push(1);

      // Déterminer les pages du milieu à afficher
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Ajuster si nous sommes près du début
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4);
      }

      // Ajuster si nous sommes près de la fin
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }

      // Ajouter un ellipsis si nécessaire au début
      if (startPage > 2) {
        pageNumbers.push("...");
      }

      // Ajouter les pages du milieu
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Ajouter un ellipsis si nécessaire à la fin
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Toujours afficher la dernière page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-200"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Page précédente</span>
        </Button>

        <div className="flex items-center gap-1.5">
          {getPageNumbers().map((page, index) => {
            if (page === "...") {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="px-2 text-muted-foreground"
                >
                  ...
                </div>
              );
            }

            const isCurrentPage = page === currentPage;
            return (
              <Button
                key={`page-${page}`}
                variant={isCurrentPage ? "default" : "outline"}
                size="icon"
                className={`h-9 w-9 rounded-full ${
                  isCurrentPage
                    ? "bg-primary text-primary-foreground"
                    : "border-primary/20 hover:bg-primary/5 hover:text-primary"
                } transition-all duration-200`}
                onClick={() => onPageChange(page as number)}
                disabled={isLoading}
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-200"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage || isLoading}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Page suivante</span>
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{currentPage}</span>{" "}
        sur <span className="font-medium text-foreground">{totalPages}</span>
      </div>
    </div>
  );
}
