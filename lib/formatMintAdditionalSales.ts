import { AppState } from './types';

/**
 * Format date from YYYY-MM-DD to M/D/YYYY
 */
function formatDate(dateISO: string): string {
  const [year, month, day] = dateISO.split('-');
  return `${parseInt(month)}/${parseInt(day)}/${year}`;
}

/**
 * Format time from HH:mm (24h) to h:mm AM/PM
 */
function formatTime(timeHHMM: string): string {
  const [hours, minutes] = timeHHMM.split(':');
  let hourNum = parseInt(hours);
  const period = hourNum >= 12 ? 'PM' : 'AM';

  if (hourNum === 0) hourNum = 12;
  else if (hourNum > 12) hourNum -= 12;

  return `${hourNum}:${minutes} ${period}`;
}

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
