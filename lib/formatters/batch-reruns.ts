export interface BatchRerunsData {
  date: string;
  usca_reruns: number;
  usca_sales: number;
  usca_approval: number;
  usca_visa_appr: number;
  usca_visa_approvals: number;
  usca_visa_txns: number;
  usca_mc_appr: number;
  usca_mc_approvals: number;
  usca_mc_txns: number;
  usca_decline1_reason: string;
  usca_decline1_count: number;
  usca_decline2_reason: string;
  usca_decline2_count: number;
  usca_decline3_reason: string;
  usca_decline3_count: number;
  other_reruns: number;
  other_sales: number;
  other_approval: number;
  other_visa_appr: number;
  other_visa_approvals: number;
  other_visa_txns: number;
  other_mc_appr: number;
  other_mc_approvals: number;
  other_mc_txns: number;
  other_decline1_reason: string;
  other_decline1_count: number;
  other_decline2_reason: string;
  other_decline2_count: number;
  other_decline3_reason: string;
  other_decline3_count: number;
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

export function formatBatchReruns(data: BatchRerunsData): string {
  // Compute approval percentages if needed
  const uscaVisaAppr =
    data.usca_visa_appr || computeApprovalRate(data.usca_visa_approvals, data.usca_visa_txns);
  const uscaMcAppr =
    data.usca_mc_appr || computeApprovalRate(data.usca_mc_approvals, data.usca_mc_txns);
  const uscaApproval =
    data.usca_approval ||
    computeApprovalRate(
      data.usca_visa_approvals + data.usca_mc_approvals,
      data.usca_visa_txns + data.usca_mc_txns
    );

  const otherVisaAppr =
    data.other_visa_appr || computeApprovalRate(data.other_visa_approvals, data.other_visa_txns);
  const otherMcAppr =
    data.other_mc_appr || computeApprovalRate(data.other_mc_approvals, data.other_mc_txns);
  const otherApproval =
    data.other_approval ||
    computeApprovalRate(
      data.other_visa_approvals + data.other_mc_approvals,
      data.other_visa_txns + data.other_mc_txns
    );

  const lines: string[] = [];

  lines.push(`Daily Batch Re-runs Summary: ${formatDate(data.date)}`);
  lines.push('');
  lines.push(
    `I re-ran ${data.usca_reruns} US/CA declines from yesterday to Revolv3 and got ${data.usca_sales} sales (${uscaApproval.toFixed(2)}% approval).`
  );
  lines.push(
    `- Visa: ${uscaVisaAppr.toFixed(2)}% (${data.usca_visa_approvals} approvals, ${data.usca_visa_txns} txns)`
  );
  lines.push(
    `- MC: ${uscaMcAppr.toFixed(2)}% (${data.usca_mc_approvals} approvals, ${data.usca_mc_txns} txns)`
  );
  lines.push(
    `Common Declines: ${data.usca_decline1_reason} (${data.usca_decline1_count}), ${data.usca_decline2_reason} (${data.usca_decline2_count}), ${data.usca_decline3_reason} (${data.usca_decline3_count})`
  );
  lines.push('');
  lines.push(
    `I re-ran ${data.other_reruns} declines (all other geos) to Quantum and got ${data.other_sales} sales (${otherApproval.toFixed(2)}% approval).`
  );
  lines.push(
    `- Visa: ${otherVisaAppr.toFixed(2)}% (${data.other_visa_approvals} approvals, ${data.other_visa_txns} txns)`
  );
  lines.push(
    `- MC: ${otherMcAppr.toFixed(2)}% (${data.other_mc_approvals} approvals, ${data.other_mc_txns} txns)`
  );
  lines.push(
    `Common Declines: ${data.other_decline1_reason} (${data.other_decline1_count}), ${data.other_decline2_reason} (${data.other_decline2_count}), ${data.other_decline3_reason} (${data.other_decline3_count})`
  );

  return lines.join('\n');
}
