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
}

export function Pagination({
  totalItems,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 20, 30, 50],
  className,
  baseUrl,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("size")) || initialPageSize;

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
  });

  const createQueryString = (params: Record<string, string | number>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      newSearchParams.set(key, String(value));
    });
    return newSearchParams.toString();
  };

  const handlePageChange = (page: number) => {
    const queryString = createQueryString({ page });
    router.push(`${baseUrl}?${queryString}`);
  };

  const handlePageSizeChange = (newSize: string) => {
    const queryString = createQueryString({
      size: newSize,
      page: 1,
    });
    router.push(`${baseUrl}?${queryString}`);
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center gap-4 justify-between",
        className
      )}
    >
      <div className="text-sm text-muted-foreground">
        Showing {startIndex + 1} to {endIndex} of {totalItems} results
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(firstPage())}
            disabled={!hasPrevPage}
            className="hidden sm:flex"
          >
            <ChevronFirst className="h-4 w-4" />
            <span className="sr-only">First page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(prevPage())}
            disabled={!hasPrevPage}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>

          <div className="flex items-center gap-1 mx-2">
            {paginationRange.map((pageNumber, i) =>
              pageNumber === "..." ? (
                <span key={`dots-${i}`} className="px-2 text-muted-foreground">
                  {pageNumber}
                </span>
              ) : (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="icon"
                  onClick={() => handlePageChange(pageNumber as number)}
                  className="hidden sm:flex"
                >
                  {pageNumber}
                </Button>
              )
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(nextPage())}
            disabled={!hasNextPage}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(lastPage())}
            disabled={!hasNextPage}
            className="hidden sm:flex"
          >
            <ChevronLast className="h-4 w-4" />
            <span className="sr-only">Last page</span>
          </Button>
        </div>

        <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} per page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
