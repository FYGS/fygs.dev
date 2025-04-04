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
import { useRouter } from "next/navigation";

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
          <SelectTrigger className="h-8 w-[70px]">
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
};
