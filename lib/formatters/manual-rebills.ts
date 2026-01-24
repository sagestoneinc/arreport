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

export function formatManualRebills(data: ManualRebillsData): string {
  // Compute approval percentages if needed
  const visaAppr = data.visa_appr || computeApprovalRate(data.visa_approvals, data.visa_txns);
  const mcAppr = data.mc_appr || computeApprovalRate(data.mc_approvals, data.mc_txns);
  const rebillsApproval =
    data.rebills_approval ||
    computeApprovalRate(data.visa_approvals + data.mc_approvals, data.visa_txns + data.mc_txns);

  const lines: string[] = [];

  lines.push(`Re-Bills Summary: ${formatDate(data.date)}`);
  lines.push('');
  lines.push(
    `I re-ran ${data.rebills_reruns} rebills declines from yesterday to PayCafe and got ${data.rebills_sales} sales (${rebillsApproval.toFixed(2)}% approval).`
  );
  lines.push(
    `- Visa: ${visaAppr.toFixed(2)}% (${data.visa_approvals} approvals, ${data.visa_txns} txns)`
  );
  lines.push(`- MC: ${mcAppr.toFixed(2)}% (${data.mc_approvals} approvals, ${data.mc_txns} txns)`);
  lines.push(
    `Common Declines: ${data.decline1_reason} (${data.decline1_count}), ${data.decline2_reason} (${data.decline2_count}), ${data.decline3_reason} (${data.decline3_count})`
  );

  return lines.join('\n');
}
