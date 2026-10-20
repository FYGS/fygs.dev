/** Change in percent between two figures (one decimal), or null when there is nothing to compare with (no division by zero). */
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
