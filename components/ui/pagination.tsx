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
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  totalItems: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  className?: string;
  baseUrl: string;
  searchParams?: {
    q?: string;
    page?: string;
    category?: string;
    [key: string]: string | undefined;
  };
}

export function Pagination({
  totalItems,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [6, 10, 20, 30, 50],
  className,
  baseUrl,
  searchParams: externalSearchParams,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSize = Number(searchParams.get("size")) || initialPageSize;
  const pageSize = currentSize;

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
    pageSize,
    currentPage,
    siblingsCount: 1,
  });

  const createQueryString = (
    params: Record<string, string | number | null>
  ) => {
    const newSearchParams = new URLSearchParams();

    // Préserver les paramètres existants de l'URL
    if (externalSearchParams) {
      Object.entries(externalSearchParams).forEach(([key, value]) => {
        if (value && key !== "page" && key !== "size") {
          newSearchParams.set(key, value);
        }
      });
    }

    // Ajouter ou mettre à jour les nouveaux paramètres
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
    const query = createQueryString({
      page: page === 1 ? null : page,
      size: pageSize === initialPageSize ? null : pageSize,
    });
    router.push(`${baseUrl}${query}`);
  };

  const handlePageSizeChange = (newSize: string) => {
    const query = createQueryString({
      page: null,
      size: Number(newSize) === initialPageSize ? null : newSize,
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
        <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize} />
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

      <div className="flex items-center justify-end gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(firstPage())}
          disabled={!hasPrevPage}
        >
          <ChevronFirst className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(prevPage())}
          disabled={!hasPrevPage}
        >
          <ChevronLeft className="h-4 w-4" />
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
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(lastPage())}
          disabled={!hasNextPage}
        >
          <ChevronLast className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
