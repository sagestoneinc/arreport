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

function formatMidSection(
  mids: MidWithAR[],
  mode: FormatMode
): string[] {
  const lines: string[] = [];
  
  if (mids.length === 0) {
    lines.push(escapeIfNeeded('- —', mode));
  } else if (mids.length === 1) {
    // Single MID: only show top performer emoji (green up arrow).
    // Design decision: A single MID is considered a "top performer" since there's no comparison.
    // This avoids showing a negative indicator when there's no context for comparison.
    const mid = mids[0];
    lines.push(
      escapeIfNeeded(`${EMOJI.TOP_PERFORMER} ${mid.mid_name} — ${mid.initial_sales} sales / ${mid.initial_decline} declines (${formatARPercent(mid.ar_percent)})`, mode)
    );
  } else {
    // Multiple MIDs: show top, middle (no emoji), and bottom.
    // Note: mids are pre-sorted by AR% descending via sortMids(),
    // so first item is highest AR%, last item is lowest AR%.
    mids.forEach((mid, index) => {
      const isTop = index === 0;
      const isBottom = index === mids.length - 1;
      const prefix = isTop ? EMOJI.TOP_PERFORMER : isBottom ? EMOJI.LOW_PERFORMER : '-';
      lines.push(
        escapeIfNeeded(`${prefix} ${mid.mid_name} — ${mid.initial_sales} sales / ${mid.initial_decline} declines (${formatARPercent(mid.ar_percent)})`, mode)
      );
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
