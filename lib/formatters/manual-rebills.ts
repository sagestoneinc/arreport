export interface ManualRebillsData {
  date: string;
  rebills_reruns: number;
  rebills_sales: number;
  rebills_approval: number;
  visa_appr: number;
  visa_approvals: number;
  visa_txns: number;
  mc_appr: number;
  mc_approvals: number;
  mc_txns: number;
  decline1_reason: string;
  decline1_count: number;
  decline2_reason: string;
  decline2_count: number;
  decline3_reason: string;
  decline3_count: number;
  insights?: string;
}

function computeApprovalRate(approvals: number, txns: number): number {
  if (txns === 0) return 0;
  return Math.round((approvals / txns) * 10000) / 100;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function computeShare(count: number, total: number): string {
  if (!total || total === 0) return '—';
  const percentage = ((count || 0) / total) * 100;
  return `${percentage.toFixed(2)}%`;
}

function formatDeclineWithShare(reason: string, count: number, share: string): string {
  if (!reason || reason.trim() === '') return '';
  return `${reason} (${share})`;
}

export function formatManualRebills(data: ManualRebillsData): string {
  // Compute approval percentages if needed
  const visaAppr = data.visa_appr || computeApprovalRate(data.visa_approvals, data.visa_txns);
  const mcAppr = data.mc_appr || computeApprovalRate(data.mc_approvals, data.mc_txns);
  
  // Use computed approval rate (sales/reruns) instead of card-network based calculation
  const rebillsApproval = data.rebills_reruns > 0
    ? (((data.rebills_sales || 0) / data.rebills_reruns) * 100).toFixed(2)
    : '0.00';

  // Compute decline shares
  const decline1Share = computeShare(data.decline1_count, data.rebills_reruns);
  const decline2Share = computeShare(data.decline2_count, data.rebills_reruns);
  const decline3Share = computeShare(data.decline3_count, data.rebills_reruns);

  const lines: string[] = [];

  lines.push(`Re-Bills Summary: ${formatDate(data.date)}`);
  lines.push('');
  lines.push(
    `I re-ran ${data.rebills_reruns} rebills declines from yesterday to PayCafe and got ${data.rebills_sales} sales (${rebillsApproval}% approval).`
  );
  lines.push(
    `- Visa: ${visaAppr.toFixed(2)}% (${data.visa_approvals} approvals, ${data.visa_txns} txns)`
  );
  lines.push(`- MC: ${mcAppr.toFixed(2)}% (${data.mc_approvals} approvals, ${data.mc_txns} txns)`);
  
  // Format Common Declines with shares
  const declines = [
    formatDeclineWithShare(data.decline1_reason, data.decline1_count, decline1Share),
    formatDeclineWithShare(data.decline2_reason, data.decline2_count, decline2Share),
    formatDeclineWithShare(data.decline3_reason, data.decline3_count, decline3Share),
  ].filter(d => d !== '');
  
  if (declines.length > 0) {
    lines.push(`Common Declines: ${declines.join(', ')}`);
  }

  // Add insights if provided
  if (data.insights && data.insights.trim()) {
    lines.push('');
    lines.push('Insights:');
    lines.push(data.insights.trim());
  }

  return lines.join('\n');
}
