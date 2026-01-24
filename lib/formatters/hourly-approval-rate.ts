export interface HourlyApprovalRateData {
  date: string;
  time_range: string;
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
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

export function formatHourlyApprovalRate(data: HourlyApprovalRateData): string {
  const lines: string[] = [];

  lines.push('HOURLY MID OPS REPORT');
  lines.push('');
  lines.push(`Date: ${formatDate(data.date)}`);
  lines.push(`Time Range: ${data.time_range}`);
  lines.push('');

  // Process and sort VISA mids
  const visaMidsWithAR: MidWithAR[] = (data.visa_mids || []).map((mid) => ({
    ...mid,
    ar_percent: calculateARPercent(mid.initial_sales || 0, mid.initial_decline || 0),
    total: (mid.initial_sales || 0) + (mid.initial_decline || 0),
  }));
  const sortedVisaMids = sortMids(visaMidsWithAR);

  lines.push('VISA');
  if (sortedVisaMids.length === 0) {
    lines.push('- —');
  } else {
    sortedVisaMids.forEach((mid) => {
      lines.push(
        `- ${mid.mid_name} - ${mid.initial_sales} sales / ${mid.initial_decline} declines - ${formatARPercent(mid.ar_percent)}`
      );
    });
  }
  lines.push('');

  // Process and sort MasterCard mids
  const mcMidsWithAR: MidWithAR[] = (data.mc_mids || []).map((mid) => ({
    ...mid,
    ar_percent: calculateARPercent(mid.initial_sales || 0, mid.initial_decline || 0),
    total: (mid.initial_sales || 0) + (mid.initial_decline || 0),
  }));
  const sortedMcMids = sortMids(mcMidsWithAR);

  lines.push('MasterCard');
  if (sortedMcMids.length === 0) {
    lines.push('- —');
  } else {
    sortedMcMids.forEach((mid) => {
      lines.push(
        `- ${mid.mid_name} - ${mid.initial_sales} sales / ${mid.initial_decline} declines - ${formatARPercent(mid.ar_percent)}`
      );
    });
  }
  lines.push('');

  lines.push('Insights/Actions:');
  lines.push(data.insights || '');

  return lines.join('\n');
}
