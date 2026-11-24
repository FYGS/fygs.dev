/**
 * Paging values that come from a client (a server action argument, a query string) are untrusted numbers: negative,
 * fractional, NaN or a million. Every listing clamps them here before they reach `skip` and `take`.
 */

export const MAX_PAGE_SIZE = 50;
const MAX_PAGE = 10_000;

export function clampPaging(page: unknown, limit: unknown, defaultLimit = 20): { page: number; limit: number; skip: number } {
  const pageNumber = Math.min(MAX_PAGE, Math.max(1, Math.floor(Number(page)) || 1));
  const limitNumber = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(Number(limit)) || defaultLimit));
  return { page: pageNumber, limit: limitNumber, skip: (pageNumber - 1) * limitNumber };
}
