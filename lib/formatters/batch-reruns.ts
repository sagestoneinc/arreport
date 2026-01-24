import {
  FormatMode,
  EMOJI,
  formatTitle,
  formatSectionHeader,
  escapeIfNeeded,
  formatDateForReport,
} from '../telegram-format';

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

function computeShare(count: number, total: number): string {
  if (!total || total === 0) return '—';
  const percentage = ((count || 0) / total) * 100;
  return `${percentage.toFixed(2)}%`;
}

function formatDeclineWithShare(reason: string, share: string): string {
  if (!reason || reason.trim() === '') return '';
  return `${reason} — ${share}`;
}

export function formatBatchReruns(data: BatchRerunsData, mode: FormatMode = 'telegram'): string {
  // Compute approval percentages if needed
  const uscaVisaAppr =
    data.usca_visa_appr || computeApprovalRate(data.usca_visa_approvals, data.usca_visa_txns);
  const uscaMcAppr =
    data.usca_mc_appr || computeApprovalRate(data.usca_mc_approvals, data.usca_mc_txns);
  
  // Use computed approval rate (sales/reruns) instead of card-network based calculation
  const uscaApproval = data.usca_reruns > 0
    ? (((data.usca_sales || 0) / data.usca_reruns) * 100).toFixed(2)
    : '0.00';

  const otherVisaAppr =
    data.other_visa_appr || computeApprovalRate(data.other_visa_approvals, data.other_visa_txns);
  const otherMcAppr =
    data.other_mc_appr || computeApprovalRate(data.other_mc_approvals, data.other_mc_txns);
  
  // Use computed approval rate (sales/reruns) instead of card-network based calculation
  const otherApproval = data.other_reruns > 0
    ? (((data.other_sales || 0) / data.other_reruns) * 100).toFixed(2)
    : '0.00';

  // Compute decline shares
  const uscaDecline1Share = computeShare(data.usca_decline1_count, data.usca_reruns);
  const uscaDecline2Share = computeShare(data.usca_decline2_count, data.usca_reruns);
  const uscaDecline3Share = computeShare(data.usca_decline3_count, data.usca_reruns);

  const otherDecline1Share = computeShare(data.other_decline1_count, data.other_reruns);
  const otherDecline2Share = computeShare(data.other_decline2_count, data.other_reruns);
  const otherDecline3Share = computeShare(data.other_decline3_count, data.other_reruns);

  const lines: string[] = [];
  const dateFormatted = formatDateForReport(data.date);

  // Title with emoji and bold
  lines.push(formatTitle(EMOJI.REPORT_SUMMARY, `Daily Batch Re-runs Summary — ${dateFormatted}`, mode));
  lines.push('');

  // US/CA Section
  lines.push(formatSectionHeader(EMOJI.US_FLAG, 'US/CA Declines → Revolv3', mode));
  lines.push(
    escapeIfNeeded(`- Re-runs: ${data.usca_reruns}`, mode)
  );
  lines.push(
    escapeIfNeeded(`- Sales: ${data.usca_sales}`, mode)
  );
  lines.push(
    escapeIfNeeded(`- Approval Rate: ${uscaApproval}%`, mode)
  );
  lines.push('');

  // Card network breakdown for US/CA
  lines.push(
    escapeIfNeeded(`${EMOJI.CARD_NETWORK} Visa — ${data.usca_visa_approvals} approvals / ${data.usca_visa_txns} txns (${uscaVisaAppr.toFixed(2)}%)`, mode)
  );
  lines.push(
    escapeIfNeeded(`${EMOJI.CARD_NETWORK} MC — ${data.usca_mc_approvals} approvals / ${data.usca_mc_txns} txns (${uscaMcAppr.toFixed(2)}%)`, mode)
  );
  
  // Format Common Declines with shares for US/CA
  const uscaDeclines = [
    formatDeclineWithShare(data.usca_decline1_reason, uscaDecline1Share),
    formatDeclineWithShare(data.usca_decline2_reason, uscaDecline2Share),
    formatDeclineWithShare(data.usca_decline3_reason, uscaDecline3Share),
  ].filter(d => d !== '');
  
  if (uscaDeclines.length > 0) {
    lines.push('');
    lines.push(formatSectionHeader(EMOJI.DECLINES, 'Common Declines', mode));
    uscaDeclines.forEach(decline => {
      lines.push(escapeIfNeeded(`- ${decline}`, mode));
    });
  }
  
  lines.push('');

  // Other Geos Section
  lines.push(formatSectionHeader(EMOJI.GLOBE, 'All Other Geos → Quantum', mode));
  lines.push(
    escapeIfNeeded(`- Re-runs: ${data.other_reruns}`, mode)
  );
  lines.push(
    escapeIfNeeded(`- Sales: ${data.other_sales}`, mode)
  );
  lines.push(
    escapeIfNeeded(`- Approval Rate: ${otherApproval}%`, mode)
  );
  lines.push('');

  // Card network breakdown for Other Geos
  lines.push(
    escapeIfNeeded(`${EMOJI.CARD_NETWORK} Visa — ${data.other_visa_approvals} approvals / ${data.other_visa_txns} txns (${otherVisaAppr.toFixed(2)}%)`, mode)
  );
  lines.push(
    escapeIfNeeded(`${EMOJI.CARD_NETWORK} MC — ${data.other_mc_approvals} approvals / ${data.other_mc_txns} txns (${otherMcAppr.toFixed(2)}%)`, mode)
  );
  
  // Format Common Declines with shares for Other Geos
  const otherDeclines = [
    formatDeclineWithShare(data.other_decline1_reason, otherDecline1Share),
    formatDeclineWithShare(data.other_decline2_reason, otherDecline2Share),
    formatDeclineWithShare(data.other_decline3_reason, otherDecline3Share),
  ].filter(d => d !== '');
  
  if (otherDeclines.length > 0) {
    lines.push('');
    lines.push(formatSectionHeader(EMOJI.DECLINES, 'Common Declines', mode));
    otherDeclines.forEach(decline => {
      lines.push(escapeIfNeeded(`- ${decline}`, mode));
    });
  }

  return lines.join('\n');
}
