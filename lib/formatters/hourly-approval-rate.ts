import {
  FormatMode,
  EMOJI,
  formatTitle,
  formatSectionHeader,
  escapeIfNeeded,
  formatDateForReport,
} from '../telegram-format';

export interface HourlyApprovalRateData {
  date: string;
  time_range: string;
  filter_used?: string;
  visa_mids: Array<{
    mid_name: string;
    initial_sales: number;
    initial_decline: number;
  }>;
  mc_mids: Array<{
    mid_name: string;
    initial_sales: number;
    initial_decline: number;
  }>;
  insights: string;
}

interface MidWithAR {
  mid_name: string;
  initial_sales: number;
  initial_decline: number;
  ar_percent: number | null;
  total: number;
}

function calculateARPercent(sales: number, decline: number): number | null {
  const total = sales + decline;
  if (total === 0) return null;
  return (sales / total) * 100;
}

function formatARPercent(ar: number | null): string {
  if (ar === null) return '—';
  return ar.toFixed(2) + '%';
}

/**
 * Get performance emoji based on MID ranking
 * @param index - The index of the MID in the sorted list (0-based)
 * @param total - Total number of MIDs in the list
 * @returns Performance emoji string
 */
function getPerformanceEmoji(index: number, total: number): string {
  // Rules based on requirements:
  // - If total MIDs >= 3:
  //   - index === 0 → 🟢⬆️ (Top)
  //   - index === last → 🔴⬇️ (Bottom)
  //   - else → 🟡➡️ (Middle)
  // - If only 2 MIDs:
  //   - first → 🟢⬆️ (Top)
  //   - second → 🔴⬇️ (Bottom)
  // - If only 1 MID:
  //   - show 🟢⬆️ only (Top)
  
  if (total === 1) {
    return EMOJI.TOP_PERFORMER;
  }
  
  if (total === 2) {
    return index === 0 ? EMOJI.TOP_PERFORMER : EMOJI.LOW_PERFORMER;
  }
  
  // total >= 3
  if (index === 0) {
    return EMOJI.TOP_PERFORMER;
  } else if (index === total - 1) {
    return EMOJI.LOW_PERFORMER;
  } else {
    return EMOJI.MIDDLE_PERFORMER;
  }
}

/**
 * Format MID name as bold for Telegram MarkdownV2
 * @param midName - The MID name to format
 * @returns Bold formatted MID name (escaped for MarkdownV2)
 */
function formatBoldMID(midName: string): string {
  // Use the bold function from telegram-format which handles escaping
  return `*${escapeIfNeeded(midName, 'telegram')}*`;
}

function formatMidSection(
  mids: MidWithAR[],
  mode: FormatMode
): string[] {
  const lines: string[] = [];
  
  if (mids.length === 0) {
    lines.push(escapeIfNeeded('- —', mode));
  } else {
    // For all MIDs, use the performance emoji logic and bold MID names
    mids.forEach((mid, index) => {
      const emoji = getPerformanceEmoji(index, mids.length);
      
      if (mode === 'telegram') {
        // Bold the MID name only, keep emoji and stats outside
        const boldMidName = formatBoldMID(mid.mid_name);
        const stats = `${mid.initial_sales} sales / ${mid.initial_decline} declines (${formatARPercent(mid.ar_percent)})`;
        const escapedStats = escapeIfNeeded(stats, mode);
        lines.push(`${emoji} ${boldMidName} — ${escapedStats}`);
      } else {
        // Plain mode
        lines.push(
          `${emoji} ${mid.mid_name} — ${mid.initial_sales} sales / ${mid.initial_decline} declines (${formatARPercent(mid.ar_percent)})`
        );
      }
    });
  }
  
  return lines;
}

function sortMids(mids: MidWithAR[]): MidWithAR[] {
  return [...mids].sort((a, b) => {
    // Sort by ar_percent desc, nulls last
    if (a.ar_percent === null && b.ar_percent === null) {
      // Both null, sort by total desc
      return b.total - a.total;
    }
    if (a.ar_percent === null) return 1; // a goes after b
    if (b.ar_percent === null) return -1; // b goes after a
    
    // Both have ar_percent, sort desc
    if (b.ar_percent !== a.ar_percent) {
      return b.ar_percent - a.ar_percent;
    }
    
    // Same ar_percent, tie-breaker by total desc
    return b.total - a.total;
  });
}

export function formatHourlyApprovalRate(data: HourlyApprovalRateData, mode: FormatMode = 'telegram'): string {
  const lines: string[] = [];
  const dateFormatted = formatDateForReport(data.date);

  // Title with emoji and bold
  lines.push(formatTitle(EMOJI.CLOCK, `Hourly MID Ops Report — ${dateFormatted}`, mode));
  lines.push('');
  lines.push(escapeIfNeeded(`Time Range: ${data.time_range}`, mode));
  
  // Add Filter Used if provided
  if (data.filter_used) {
    lines.push(escapeIfNeeded(`Filter Used: ${data.filter_used}`, mode));
  }
  
  lines.push('');

  // Process and sort VISA mids
  const visaMidsWithAR: MidWithAR[] = (data.visa_mids || []).map((mid) => ({
    ...mid,
    ar_percent: calculateARPercent(mid.initial_sales || 0, mid.initial_decline || 0),
    total: (mid.initial_sales || 0) + (mid.initial_decline || 0),
  }));
  const sortedVisaMids = sortMids(visaMidsWithAR);

  lines.push(formatSectionHeader(EMOJI.CARD_NETWORK, 'VISA', mode));
  lines.push(...formatMidSection(sortedVisaMids, mode));
  lines.push('');

  // Process and sort MasterCard mids
  const mcMidsWithAR: MidWithAR[] = (data.mc_mids || []).map((mid) => ({
    ...mid,
    ar_percent: calculateARPercent(mid.initial_sales || 0, mid.initial_decline || 0),
    total: (mid.initial_sales || 0) + (mid.initial_decline || 0),
  }));
  const sortedMcMids = sortMids(mcMidsWithAR);

  lines.push(formatSectionHeader(EMOJI.CARD_NETWORK, 'MasterCard', mode));
  lines.push(...formatMidSection(sortedMcMids, mode));
  lines.push('');

  lines.push(formatSectionHeader(EMOJI.INSIGHTS, 'Insights & Actions', mode));
  lines.push(escapeIfNeeded(data.insights || '', mode));

  return lines.join('\n');
}
