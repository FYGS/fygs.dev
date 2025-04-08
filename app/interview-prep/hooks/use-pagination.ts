import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
  shouldScrollToTop?: boolean;
}

export function usePagination<T>({
  totalItems,
  itemsPerPage,
  initialPage = 1,
  shouldScrollToTop = false,
}: UsePaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const currentPage = useMemo(() => {
    const page = Number(searchParams.get("page")) || initialPage;
    return Math.max(1, Math.min(page, Math.ceil(totalItems / itemsPerPage)));
  }, [searchParams, totalItems, itemsPerPage, initialPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedItems = useCallback(
    (items: T[]) => {
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return items.slice(start, end);
    },
    [currentPage, itemsPerPage]
  );

  const setPage = useCallback(
    async (page: number) => {
      setIsLoading(true);
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      await router.push(`?${params.toString()}`, { scroll: shouldScrollToTop });
      setIsLoading(false);
    },
    [router, searchParams, shouldScrollToTop]
  );

  return {
    currentPage,
    totalPages,
    paginatedItems,
    setPage,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    isLoading,
  };
}
