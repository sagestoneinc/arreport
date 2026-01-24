import { AppState } from './types';
import { calculateAR, formatAR } from './calc';

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
