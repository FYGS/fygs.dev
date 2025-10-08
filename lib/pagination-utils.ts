/**
 * Utilitaires pour la pagination côté serveur
 * Gestion des paramètres de pagination et génération des requêtes Prisma
 */

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface PaginationResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Normalise les paramètres de pagination
 */
export function normalizePaginationParams(params: PaginationParams): Required<PaginationParams> {
  return {
    page: Math.max(1, params.page || 1),
    pageSize: Math.min(Math.max(1, params.pageSize || 25), 100), // Limite à 100 pour la performance
    search: params.search?.trim() || '',
    sortBy: params.sortBy || 'createdAt',
    sortOrder: params.sortOrder || 'desc',
    filters: params.filters || {},
  };
}

/**
 * Génère les paramètres skip et take pour Prisma
 */
export function getPaginationArgs(page: number, pageSize: number) {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

/**
 * Génère les paramètres de tri pour Prisma
 */
export function getSortArgs(sortBy: string, sortOrder: 'asc' | 'desc') {
  return {
    orderBy: {
      [sortBy]: sortOrder,
    },
  };
}

/**
 * Génère les paramètres de recherche pour Prisma
 */
export function getSearchArgs(search: string, searchFields: string[]) {
  if (!search || searchFields.length === 0) {
    return {};
  }

  return {
    OR: searchFields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive' as const,
      },
    })),
  };
}

/**
 * Crée un objet de résultat de pagination
 */
export function createPaginationResult<T>(
  data: T[],
  totalItems: number,
  currentPage: number,
  pageSize: number
): PaginationResult<T> {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  return {
    data,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

/**
 * Service générique de pagination pour Prisma
 */
export class PaginationService {
  /**
   * Exécute une requête paginée avec Prisma
   */
  static async paginate<T>(
    model: any,
    params: PaginationParams,
    searchFields: string[] = [],
    additionalWhere: any = {}
  ): Promise<PaginationResult<T>> {
    const normalizedParams = normalizePaginationParams(params);
    const { page, pageSize, search, sortBy, sortOrder, filters } = normalizedParams;

    // Construire la clause WHERE
    const whereClause = {
      ...additionalWhere,
      ...filters,
      ...getSearchArgs(search, searchFields),
    };

    // Exécuter les requêtes en parallèle
    const [data, totalItems] = await Promise.all([
      model.findMany({
        where: whereClause,
        ...getPaginationArgs(page, pageSize),
        ...getSortArgs(sortBy, sortOrder),
      }),
      model.count({
        where: whereClause,
      }),
    ]);

    return createPaginationResult(data, totalItems, page, pageSize);
  }

  /**
   * Exécute une requête paginée avec des includes
   */
  static async paginateWithIncludes<T>(
    model: any,
    params: PaginationParams,
    includes: any,
    searchFields: string[] = [],
    additionalWhere: any = {}
  ): Promise<PaginationResult<T>> {
    const normalizedParams = normalizePaginationParams(params);
    const { page, pageSize, search, sortBy, sortOrder, filters } = normalizedParams;

    const whereClause = {
      ...additionalWhere,
      ...filters,
      ...getSearchArgs(search, searchFields),
    };

    const [data, totalItems] = await Promise.all([
      model.findMany({
        where: whereClause,
        include: includes,
        ...getPaginationArgs(page, pageSize),
        ...getSortArgs(sortBy, sortOrder),
      }),
      model.count({
        where: whereClause,
      }),
    ]);

    return createPaginationResult(data, totalItems, page, pageSize);
  }
}

/**
 * Hook pour extraire les paramètres de pagination depuis les searchParams
 */
export function extractPaginationParams(searchParams: URLSearchParams): PaginationParams {
  return {
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
    pageSize: searchParams.get('size') ? parseInt(searchParams.get('size')!, 10) : 25,
    search: searchParams.get('q') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  };
}

/**
 * Génère une URL avec les paramètres de pagination
 */
export function buildPaginationUrl(
  baseUrl: string,
  params: Partial<PaginationParams>,
  additionalParams: Record<string, string> = {}
): string {
  const url = new URL(baseUrl, 'http://localhost'); // Base temporaire pour URL constructor
  
  if (params.page && params.page > 1) {
    url.searchParams.set('page', params.page.toString());
  }
  
  if (params.pageSize && params.pageSize !== 25) {
    url.searchParams.set('size', params.pageSize.toString());
  }
  
  if (params.search) {
    url.searchParams.set('q', params.search);
  }
  
  if (params.sortBy && params.sortBy !== 'createdAt') {
    url.searchParams.set('sortBy', params.sortBy);
  }
  
  if (params.sortOrder && params.sortOrder !== 'desc') {
    url.searchParams.set('sortOrder', params.sortOrder);
  }
  
  // Ajouter les paramètres additionnels
  Object.entries(additionalParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  
  return url.pathname + url.search;
}
