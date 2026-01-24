import { AppState } from './types';

/**
 * Format the Daily Summary Rebills Report message
 * Template format:
 * Re-Bills Summary: YYYY-MM-DD
 *
 * I re-ran X rebills declines from yesterday to PayCafe and got Y sales (Z% approval).
 *
 * Visa: X% (Y approvals, Z txns)
 * MC: X% (Y approvals, Z txns)
 * Common Declines: Decline1 (X%), Decline2 (Y%)...
 */
export function formatDailySummaryRebills(state: AppState): string {
  const lines: string[] = [];

  // Header - use ISO format for this template
  lines.push(`Re-Bills Summary: ${state.dateISO}`);
  lines.push('');

  // Content from notes
  lines.push(state.notes);

  return lines.join('\n');
}
