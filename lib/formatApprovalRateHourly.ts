import { AppState } from './types';
import { calculateAR, formatAR } from './calc';
import { formatDate, formatTime } from './dateTimeUtils';

/**
 * Format the Approval Rate Hourly Report message
 */
export function formatApprovalRateHourly(state: AppState): string {
  const lines: string[] = [];

  // Header
  lines.push(`Date: ${formatDate(state.dateISO)}`);
  if (state.timeEndHHMM) {
    lines.push(`Time Range: ${formatTime(state.timeHHMM)} - ${formatTime(state.timeEndHHMM)} EST`);
  } else {
    lines.push(`Time: ${formatTime(state.timeHHMM)} EST`);
  }
  lines.push('Filter Used: Affiliate > Card Brand > Merchant Account');
  lines.push('');

  // MASTERCARD MIDs
  if (state.mcMids.length > 0) {
    lines.push('Master Card - Active PAY REV MIDs');
    lines.push('');
    state.mcMids.forEach((mid) => {
      const ar = calculateAR(mid.sales, mid.declines);
      lines.push(`${mid.name} - ${mid.sales}/${mid.declines} trxns - ${formatAR(ar)}%`);
    });
    lines.push('');
  }

  // VISA MIDs
  if (state.visaMids.length > 0) {
    lines.push('VISA - Active CS MIDs');
    lines.push('');
    state.visaMids.forEach((mid) => {
      const ar = calculateAR(mid.sales, mid.declines);
      lines.push(`${mid.name} - ${mid.sales}/${mid.declines} trxns - ${formatAR(ar)}%`);
    });
    lines.push('');
  }

  // Insights & Actions
  lines.push('Insights & Actions:');
  lines.push(state.notes);

  return lines.join('\n');
}
