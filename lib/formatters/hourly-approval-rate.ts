export interface HourlyApprovalRateData {
  date: string;
  time_range: string;
  filter_used: string;
  mc_mid_lines: string;
  visa_mid_lines: string;
  insights: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

export function formatHourlyApprovalRate(data: HourlyApprovalRateData): string {
  const lines: string[] = [];

  lines.push('HOURLY MID OPS REPORT');
  lines.push('');
  lines.push(`Date: ${formatDate(data.date)}`);
  lines.push(`Time Range: ${data.time_range}`);
  lines.push(`Filter Used: ${data.filter_used}`);
  lines.push('');
  lines.push('Master Card - Active PAY REV MIDs');
  lines.push('');
  lines.push(data.mc_mid_lines);
  lines.push('');
  lines.push('VISA - Active NS MIDs');
  lines.push('');
  lines.push(data.visa_mid_lines);
  lines.push('');
  lines.push('Insights & Actions:');
  lines.push(data.insights);

  return lines.join('\n');
}
