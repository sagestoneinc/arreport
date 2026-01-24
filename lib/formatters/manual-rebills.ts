import { computeApprovalRate, formatShare } from '../calc';
import {
  FormatMode,
  EMOJI,
  formatTitle,
  formatSectionHeader,
  escapeIfNeeded,
  formatDateForReport,
} from '../telegram-format';

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

function formatDeclineWithShare(reason: string, share: string): string {
  if (!reason || reason.trim() === '') return '';
  return `${reason} — ${share}`;
}

export function formatManualRebills(
  data: ManualRebillsData,
  mode: FormatMode = 'telegram'
): string {
  // Compute approval percentages if needed
  const visaAppr = data.visa_appr || computeApprovalRate(data.visa_approvals, data.visa_txns);
  const mcAppr = data.mc_appr || computeApprovalRate(data.mc_approvals, data.mc_txns);

  // Use computed approval rate (sales/reruns) instead of card-network based calculation
  const rebillsApproval =
    data.rebills_reruns > 0
      ? (((data.rebills_sales || 0) / data.rebills_reruns) * 100).toFixed(2)
      : '0.00';

  // Compute decline shares
  const decline1Share = formatShare(data.decline1_count, data.rebills_reruns);
  const decline2Share = formatShare(data.decline2_count, data.rebills_reruns);
  const decline3Share = formatShare(data.decline3_count, data.rebills_reruns);

  const lines: string[] = [];
  const dateFormatted = formatDateForReport(data.date);

  // Title with emoji and bold
  lines.push(formatTitle(EMOJI.RERUNS, `Manual Rebills Summary — ${dateFormatted}`, mode));
  lines.push('');

  // Summary stats
  lines.push(escapeIfNeeded(`- Re-runs: ${data.rebills_reruns}`, mode));
  lines.push(escapeIfNeeded(`- Sales: ${data.rebills_sales}`, mode));
  lines.push(escapeIfNeeded(`- Approval Rate: ${rebillsApproval}%`, mode));
  lines.push('');

  // Card network breakdown
  lines.push(
    escapeIfNeeded(
      `${EMOJI.CARD_NETWORK} Visa — ${data.visa_approvals} approvals / ${data.visa_txns} txns (${visaAppr.toFixed(2)}%)`,
      mode
    )
  );
  lines.push(
    escapeIfNeeded(
      `${EMOJI.CARD_NETWORK} MC — ${data.mc_approvals} approvals / ${data.mc_txns} txns (${mcAppr.toFixed(2)}%)`,
      mode
    )
  );

  // Format Common Declines with shares
  const declines = [
    formatDeclineWithShare(data.decline1_reason, decline1Share),
    formatDeclineWithShare(data.decline2_reason, decline2Share),
    formatDeclineWithShare(data.decline3_reason, decline3Share),
  ].filter((d) => d !== '');

  if (declines.length > 0) {
    lines.push('');
    lines.push(formatSectionHeader(EMOJI.DECLINES, 'Common Declines', mode));
    declines.forEach((decline) => {
      lines.push(escapeIfNeeded(`- ${decline}`, mode));
    });
  }

  // Add insights if provided
  if (data.insights && data.insights.trim()) {
    lines.push('');
    lines.push(formatSectionHeader(EMOJI.INSIGHTS, 'Insights', mode));
    lines.push(escapeIfNeeded(data.insights.trim(), mode));
  }

  return lines.join('\n');
}
