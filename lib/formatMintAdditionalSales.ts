import { AppState } from './types';

/**
 * Format the Mint Additional Sales Report message
 * Template format:
 * Hey guys, we re-ran yesterday's declines and got an additional X sales for you:
 * MID: count
 * MID: count
 * ...
 * 
 * c1 & c3's:
 * MID - transaction_id
 * MID - transaction_id
 * ...
 */
export function formatMintAdditionalSales(state: AppState): string {
  const lines: string[] = [];

  // Content from notes (contains the full formatted message)
  lines.push(state.notes);

  return lines.join('\n');
}
