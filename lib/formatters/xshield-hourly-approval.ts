import { FormatMode, formatDateForReport } from '../telegram-format';
import { MidRowData } from '../templates';

export interface XShieldHourlyApprovalData {
  report_date: string;
  yesterday_good: MidRowData[];
  yesterday_bad: MidRowData[];
  as_of_date: string;
  as_of_time: string;
  as_of_good: MidRowData[];
  as_of_bad: MidRowData[];
  insights: string;
}

const formatNumber = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
};

const calculateAR = (sales: number, declines: number): string => {
  const total = sales + declines;
  if (total === 0) return '0.00%';
  return ((sales / total) * 100).toFixed(2) + '%';
};

const formatTimeForReport = (timeValue: string): string => {
  const trimmed = timeValue.trim();
  if (!trimmed) return '';

  const amPmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (amPmMatch) {
    const hours = Number(amPmMatch[1]);
    const minutes = amPmMatch[2];
    const suffix = amPmMatch[3].toUpperCase();
    const normalizedHours = hours === 0 ? 12 : hours;
    return `${normalizedHours}:${minutes} ${suffix}`;
  }

  const twentyFourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourMatch) {
    const hours = Number(twentyFourMatch[1]);
    const minutes = twentyFourMatch[2];
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const twelveHour = hours % 12 === 0 ? 12 : hours % 12;
    return `${twelveHour}:${minutes} ${suffix}`;
  }

  return trimmed;
};

const formatMidLines = (mids: MidRowData[], emoji: string): string[] => {
  return mids
    .filter((mid) => mid.mid_name || mid.initial_sales || mid.initial_decline)
    .map((mid) => {
      const sales = formatNumber(mid.initial_sales || 0);
      const declines = formatNumber(mid.initial_decline || 0);
      const ar = calculateAR(sales, declines);
      return `${emoji} ${mid.mid_name} — ${sales} sales / ${declines} declines (${ar})`;
    });
};

export function formatXShieldHourlyApproval(
  data: XShieldHourlyApprovalData,
  mode: FormatMode = 'telegram'
): string {
  void mode;
  const lines: string[] = [];
  const reportDate = formatDateForReport(data.report_date);
  const asOfDate = formatDateForReport(data.as_of_date);
  const asOfTime = formatTimeForReport(data.as_of_time || '');

  lines.push(`⏱ XSHIELD MID Ops Report — ${reportDate}`);
  lines.push('');
  lines.push('Yesterday');
  lines.push(...formatMidLines(data.yesterday_good || [], '🟢⬆️'));
  lines.push(...formatMidLines(data.yesterday_bad || [], '🔴⬇️'));
  lines.push('');
  lines.push(`${asOfDate} AS OF ${asOfTime} EST`);
  lines.push(...formatMidLines(data.as_of_good || [], '🟢⬆️'));
  lines.push(...formatMidLines(data.as_of_bad || [], '🔴⬇️'));
  lines.push('');
  lines.push('🧠 Insights & Actions');
  lines.push(data.insights || '');

  return lines.join('\n');
}
