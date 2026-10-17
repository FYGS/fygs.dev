"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLocale } from "next-intlayer";
import { useRouter } from "next/navigation";

const LABELS = {
  fr: { nav: "Pagination", first: "Première page", prev: "Page précédente", next: "Page suivante", last: "Dernière page", page: "Page", perPage: "Éléments par page" },
  en: { nav: "Pagination", first: "First page", prev: "Previous page", next: "Next page", last: "Last page", page: "Page", perPage: "Items per page" },
  es: { nav: "Paginación", first: "Primera página", prev: "Página anterior", next: "Página siguiente", last: "Última página", page: "Página", perPage: "Elementos por página" },
} as const;

const pageSizeOptions = [6, 12, 24, 48];
const initialPageSize = 6;

interface PaginationProps {
  totalItems: number;
  pageSize: number;
  baseUrl: string;
  className?: string;
  // Support both interfaces
  currentPage?: number;
  onPageChange?: (page: number) => void;
  searchParams?: {
    q?: string;
    page?: number;
    category?: string;
    size?: number;
  };
}

export const Pagination = ({
  totalItems,
  pageSize,
  baseUrl,
  className,
  currentPage: propCurrentPage,
  onPageChange,
  searchParams,
}: PaginationProps) => {
  const router = useRouter();
  const { locale } = useLocale();
  const labels = LABELS[(locale in LABELS ? locale : "fr") as keyof typeof LABELS];

  // Use either provided currentPage or get from searchParams
  const currentSize = searchParams
    ? Number(searchParams.size) || pageSize
    : pageSize;
  const currentPage =
    propCurrentPage || (searchParams ? Number(searchParams.page) || 1 : 1);

  const {
    paginationRange,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
  } = usePagination({
    totalItems,
    pageSize: currentSize,
    currentPage,
    siblingsCount: 1,
  });

  const createQueryString = (
    params: Record<string, string | number | null>
  ) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString() || "");

    // Update or remove parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null) {
        newSearchParams.set(key, String(value));
      } else {
        newSearchParams.delete(key);
      }
    });

    const queryString = newSearchParams.toString();
    return queryString ? `?${queryString}` : "";
  };

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
      return;
    }

    if (searchParams) {
      const query = createQueryString({
        page: page === 1 ? null : page,
        size: currentSize === initialPageSize ? null : currentSize,
      });
      router.push(`${baseUrl}${query}`);
    }
  };

  const handlePageSizeChange = (newSize: string) => {
    const size = Number(newSize);
    const query = createQueryString({
      page: null, // Reset to first page when changing size
      size: size === initialPageSize ? null : size,
    });
    router.push(`${baseUrl}${query}`);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {totalItems > 0
            ? `${startIndex + 1} - ${Math.min(
                endIndex,
                totalItems
              )} of ${totalItems} items`
            : "No items"}
        </span>
        <Select
          value={String(currentSize)}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="h-8 w-[70px]" aria-label={labels.perPage}>
            <SelectValue placeholder={currentSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <nav aria-label={labels.nav} className="flex items-center justify-end gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(firstPage())}
          disabled={!hasPrevPage}
          aria-label={labels.first}
        >
          <ChevronFirst className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(prevPage())}
          disabled={!hasPrevPage}
          aria-label={labels.prev}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>

        {paginationRange.map((pageNumber, i) => {
          if (pageNumber === "...") {
            return (
              <Button
                key={`ellipsis-${i}`}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled
                aria-hidden="true"
              >
                &#8230;
              </Button>
            );
          }

          return (
            <Button
              key={pageNumber}
              variant={pageNumber === currentPage ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(pageNumber as number)}
              aria-label={`${labels.page} ${pageNumber}`}
              aria-current={pageNumber === currentPage ? "page" : undefined}
            >
              {pageNumber}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(nextPage())}
          disabled={!hasNextPage}
          aria-label={labels.next}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(lastPage())}
          disabled={!hasNextPage}
          aria-label={labels.last}
        >
          <ChevronLast className="h-4 w-4" aria-hidden="true" />
        </Button>
      </nav>
    </div>
  );
};
