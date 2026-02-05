import { FormatMode } from '../telegram-format';
import { XShieldMerchantRow } from '../templates';

export interface XShieldHourlyApprovalData {
  header_time_start: string;
  header_time_end: string;
  yesterday_from_time: string;
  yesterday_to_time: string;
  yesterday_merchants: XShieldMerchantRow[];
  today_as_of_from_time: string;
  today_as_of_to_time: string;
  today_merchants: XShieldMerchantRow[];
  insights: string;
}

const formatNumber = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
};

const calculatePercent = (sales: number, declines: number): string => {
  const safeSales = Number.isFinite(sales) ? sales : 0;
  const safeDeclines = Number.isFinite(declines) ? declines : 0;
  const total = safeSales + safeDeclines;
  if (total <= 0) return '0.00%';
  return ((safeSales / total) * 100).toFixed(2) + '%';
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

const formatMerchantBlocks = (rows: XShieldMerchantRow[] = []): string[] => {
  const fallbackRow: XShieldMerchantRow = {
    merchant_name: '',
    visa_sales: 0,
    visa_declines: 0,
    mc_sales: 0,
    mc_declines: 0,
  };
  const normalizedRows = rows.length > 0 ? rows : [fallbackRow];
  const populatedRows = normalizedRows.filter(
    (row) =>
      row.merchant_name ||
      row.visa_sales ||
      row.visa_declines ||
      row.mc_sales ||
      row.mc_declines
  );

  const outputRows = populatedRows.length > 0 ? populatedRows : [fallbackRow];
  const lines: string[] = [];

  outputRows.forEach((row, index) => {
    const merchantName = row.merchant_name?.trim() || '';
    const visaSales = formatNumber(row.visa_sales || 0);
    const visaDeclines = formatNumber(row.visa_declines || 0);
    const mcSales = formatNumber(row.mc_sales || 0);
    const mcDeclines = formatNumber(row.mc_declines || 0);
    const visaPercent = calculatePercent(visaSales, visaDeclines);
    const mcPercent = calculatePercent(mcSales, mcDeclines);

    lines.push(`Merchant Account Name: ${merchantName}`);
    lines.push(`- VISA: ${visaSales}/${visaDeclines} trxns - ${visaPercent}`);
    lines.push(`- MC:  ${mcSales}/${mcDeclines} trxns - ${mcPercent}`);

    if (index < outputRows.length - 1) {
      lines.push('');
    }
  });

  return lines;
};

export function formatXShieldHourlyApproval(
  data: XShieldHourlyApprovalData,
  mode: FormatMode = 'telegram'
): string {
  void mode;
  const lines: string[] = [];
  const headerStart = formatTimeForReport(data.header_time_start || '');
  const headerEnd = formatTimeForReport(data.header_time_end || '');
  const yesterdayFrom = formatTimeForReport(data.yesterday_from_time || '');
  const yesterdayTo = formatTimeForReport(data.yesterday_to_time || '');
  const todayFrom = formatTimeForReport(data.today_as_of_from_time || '');
  const todayTo = formatTimeForReport(data.today_as_of_to_time || '');

  lines.push('XSHIELD MID Performance Report');
  lines.push(`Time: ${headerStart} - ${headerEnd} EST`);
  lines.push('');
  lines.push(`Yesterday from ${yesterdayFrom} to ${yesterdayTo}`);
  lines.push('');
  lines.push(...formatMerchantBlocks(data.yesterday_merchants || []));
  lines.push('');
  lines.push(`Today as of ${todayFrom} to ${todayTo}`);
  lines.push('');
  lines.push(...formatMerchantBlocks(data.today_merchants || []));
  lines.push('');
  lines.push('Insights/Actions');
  lines.push(data.insights || '');

  return lines.join('\n');
}
