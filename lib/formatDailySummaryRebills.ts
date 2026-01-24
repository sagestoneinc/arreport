import { AppState } from './types';
import { formatDate, formatTime } from './dateTimeUtils';

/**
 * Format the Daily Summary Rebills Report message
 */
export function formatDailySummaryRebills(state: AppState): string {
  const lines: string[] = [];

  // Header
  lines.push('📊 Daily Summary Rebills Report');
  lines.push(`🗓️ ${formatDate(state.dateISO)} | 🕐 ${formatTime(state.timeHHMM)} EST`);
  lines.push('');

  // Notes
  lines.push('📝 Rebills Summary:');
  lines.push(state.notes);

  return lines.join('\n');
}
