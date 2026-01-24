import { AppState } from './types';
import { formatDate, formatTime } from './dateTimeUtils';

/**
 * Format the Mint Additional Sales Report message
 */
export function formatMintAdditionalSales(state: AppState): string {
  const lines: string[] = [];

  // Header
  lines.push('📊 Mint Additional Sales Report');
  lines.push(`🗓️ ${formatDate(state.dateISO)} | 🕐 ${formatTime(state.timeHHMM)} EST`);
  lines.push('');

  // Notes
  lines.push('📝 Additional Sales Details:');
  lines.push(state.notes);

  return lines.join('\n');
}
