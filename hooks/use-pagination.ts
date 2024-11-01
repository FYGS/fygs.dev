"use client";

import { useCallback, useMemo } from "react";

interface UsePaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  siblingsCount?: number;
}

export function usePagination({
  totalItems,
  pageSize,
  currentPage,
  siblingsCount = 1,
}: UsePaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginationRange = useMemo(() => {
    // Pages à toujours afficher
    const DOTS = "...";
    const totalPageNumbers = siblingsCount * 2 + 5; // first + last + current + 2 siblings + 2 dots

    // Si le nombre de pages est inférieur au nombre total de numéros à afficher
    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingsCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingsCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    // Cas 1: Pas de points à gauche, points à droite
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingsCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, DOTS, totalPages];
    }

    // Cas 2: Pas de points à droite, points à gauche
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingsCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, DOTS, ...rightRange];
    }

    // Cas 3: Points des deux côtés
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, DOTS, ...middleRange, DOTS, totalPages];
    }

    return [];
  }, [totalItems, pageSize, currentPage, siblingsCount, totalPages]);

  const nextPage = useCallback(() => {
    return Math.min(currentPage + 1, totalPages);
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    return Math.max(currentPage - 1, 1);
  }, [currentPage]);

  const firstPage = useCallback(() => {
    return 1;
  }, []);

  const lastPage = useCallback(() => {
    return totalPages;
  }, [totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return {
    paginationRange,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}
