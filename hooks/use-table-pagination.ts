"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface UseTablePaginationProps {
  totalItems: number;
  initialPageSize?: number;
  baseUrl?: string;
}

interface UseTablePaginationReturn {
  // État de pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;
  
  // Méthodes de navigation
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  
  // Méthodes de configuration
  setPageSize: (size: number) => void;
  
  // Informations calculées
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  
  // Utilitaires pour l'affichage
  getDisplayText: () => string;
  getPaginationInfo: () => {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function useTablePagination({
  totalItems,
  initialPageSize = 25,
  baseUrl,
}: UseTablePaginationProps): UseTablePaginationReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // État local pour la pagination
  const [localPage, setLocalPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(initialPageSize);
  
  // Récupérer les valeurs depuis l'URL si disponibles
  const urlPage = searchParams.get('page');
  const urlPageSize = searchParams.get('size');
  
  const currentPage = urlPage ? parseInt(urlPage, 10) : localPage;
  const pageSize = urlPageSize ? parseInt(urlPageSize, 10) : localPageSize;
  
  // Calculs dérivés
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  
  // Fonction pour mettre à jour l'URL
  const updateUrl = useCallback((newPage: number, newPageSize?: number) => {
    if (!baseUrl) {
      // Mode local - pas de navigation URL
      setLocalPage(newPage);
      if (newPageSize) {
        setLocalPageSize(newPageSize);
      }
      return;
    }
    
    const params = new URLSearchParams(searchParams.toString());
    
    // Mettre à jour la page
    if (newPage === 1) {
      params.delete('page');
    } else {
      params.set('page', newPage.toString());
    }
    
    // Mettre à jour la taille de page si fournie
    if (newPageSize !== undefined) {
      if (newPageSize === initialPageSize) {
        params.delete('size');
      } else {
        params.set('size', newPageSize.toString());
      }
    }
    
    const queryString = params.toString();
    const newUrl = `${baseUrl}${queryString ? `?${queryString}` : ''}`;
    
    router.push(newUrl);
  }, [baseUrl, searchParams, router, initialPageSize]);
  
  // Méthodes de navigation
  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    updateUrl(validPage);
  }, [totalPages, updateUrl]);
  
  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      goToPage(currentPage + 1);
    }
  }, [hasNextPage, currentPage, goToPage]);
  
  const goToPrevPage = useCallback(() => {
    if (hasPrevPage) {
      goToPage(currentPage - 1);
    }
  }, [hasPrevPage, currentPage, goToPage]);
  
  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);
  
  const goToLastPage = useCallback(() => {
    goToPage(totalPages);
  }, [totalPages, goToPage]);
  
  const setPageSize = useCallback((newSize: number) => {
    // Calculer la nouvelle page pour maintenir la position approximative
    const currentFirstItem = startIndex + 1;
    const newPage = Math.ceil(currentFirstItem / newSize);
    
    updateUrl(newPage, newSize);
  }, [startIndex, updateUrl]);
  
  // Utilitaires pour l'affichage
  const getDisplayText = useCallback(() => {
    if (totalItems === 0) {
      return "Aucun élément";
    }
    
    return `Affichage de ${startIndex + 1} à ${endIndex} sur ${totalItems} éléments`;
  }, [startIndex, endIndex, totalItems]);
  
  const getPaginationInfo = useCallback(() => ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    hasNextPage,
    hasPrevPage,
  }), [currentPage, totalPages, pageSize, totalItems, hasNextPage, hasPrevPage]);
  
  return {
    currentPage,
    pageSize,
    totalPages,
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    setPageSize,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
    getDisplayText,
    getPaginationInfo,
  };
}

/**
 * Hook simplifié pour la pagination locale (sans URL)
 */
export function useLocalPagination(totalItems: number, initialPageSize = 25) {
  return useTablePagination({
    totalItems,
    initialPageSize,
    // Pas de baseUrl = mode local
  });
}

/**
 * Hook pour la pagination avec URL
 */
export function useUrlPagination(totalItems: number, baseUrl: string, initialPageSize = 25) {
  return useTablePagination({
    totalItems,
    initialPageSize,
    baseUrl,
  });
}
