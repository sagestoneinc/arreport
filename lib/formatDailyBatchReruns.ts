import { AppState } from './types';
import { formatDatePadded } from './dateTimeUtils';

/**
 * Format the Daily Batch Reruns Report message
 * Template format:
 * Daily Batch Re-runs Summary: MM/DD/YYYY
 * 
 * I re-ran X US/CA declines from yesterday to PAY-REV and got Y sales (Z% approval).
 * 
 * Visa: X% (Y approvals, Z txns)
 * MC: X% (Y approvals, Z txns)
 * Common Declines: Decline1 (X%), Decline2 (Y%), Decline3 (Z%)
 * 
 * I re-ran X declines (all other geos) to NS and got Y sales (Z% approval).
 * Visa: X% (Y approvals, Z txns)
 * MC: X% (Y approvals, Z txns)
 * Common Declines: Decline1 (X%), Decline2 (Y%), Decline3 (Z%)
 */
export function formatDailyBatchReruns(state: AppState): string {
  const lines: string[] = [];

  // Header
  lines.push(`Daily Batch Re-runs Summary: ${formatDatePadded(state.dateISO)}`);
  lines.push('');

  // Content from notes
  lines.push(state.notes);

  return lines.join('\n');
}
