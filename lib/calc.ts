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

/**
 * Compute approval rate (approvals / txns) * 100
 * Returns 0 if txns is 0
 */
export function computeApprovalRate(approvals: number, txns: number): number {
  if (txns === 0) return 0;
  return Math.round((approvals / txns) * 10000) / 100;
}

/**
 * Compute share percentage (count / total) * 100
 * Returns null if total is 0 or falsy
 */
export function computeShare(count: number, total: number): string | null {
  if (!total || total === 0) return null;
  const percentage = (count / total) * 100;
  return percentage.toFixed(2);
}

/**
 * Format share for display with percentage sign
 * Returns '—' if total is 0
 */
export function formatShare(count: number, total: number): string {
  if (!total || total === 0) return '—';
  const percentage = ((count || 0) / total) * 100;
  return `${percentage.toFixed(2)}%`;
}
