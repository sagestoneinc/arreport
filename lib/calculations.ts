export function calculateAR(sales: number, declines: number): string {
  const total = sales + declines;
  if (total === 0) return '0.00';
  const ar = (sales / total) * 100;
  return ar.toFixed(2);
}

export function formatMetric(
  ar: string,
  sales: number,
  declines: number,
  isOverall: boolean
): string {
  if (isOverall) {
    return `${ar}% (${sales} sales / ${declines} declines)`;
  }
  return `${ar}% (${sales} / ${declines})`;
}
