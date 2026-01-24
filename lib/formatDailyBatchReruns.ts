import { AppState } from './types';
import { formatDate, formatTime } from './dateTimeUtils';

/**
 * Format the Daily Batch Reruns Report message
 */
export function formatDailyBatchReruns(state: AppState): string {
  const lines: string[] = [];

  // Header
  lines.push('📊 Daily Batch Reruns Report');
  lines.push(`🗓️ ${formatDate(state.dateISO)} | 🕐 ${formatTime(state.timeHHMM)} EST`);
  lines.push('');

  // Notes
  lines.push('📝 Batch Reruns Details:');
  lines.push(state.notes);

  return lines.join('\n');
}
