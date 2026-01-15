/**
 * Calculate approval rate percentage
 * AR% = sales / (sales + declines) * 100
 * If sales + declines == 0 then AR% = 0.00
 */
export function calculateAR(sales: number, declines: number): number {
  const total = sales + declines;
  if (total === 0) return 0;
  return (sales / total) * 100;
}

/**
 * Format AR to 2 decimal places
 */
export function formatAR(ar: number): string {
  return ar.toFixed(2);
}

/**
 * Determine status based on threshold
 * if AR% >= threshold => "PERFORMING"
 * else => "LOW"
 */
export function determineStatus(ar: number, threshold: number): 'PERFORMING' | 'LOW' {
  return ar >= threshold ? 'PERFORMING' : 'LOW';
}

