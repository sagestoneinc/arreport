import { AppState } from './types';
import { formatTemplateA } from './formatTemplateA';
import { formatTemplateB } from './formatTemplateB';
import { formatApprovalRateHourly } from './formatApprovalRateHourly';
import { formatDailyBatchReruns } from './formatDailyBatchReruns';
import { formatDailySummaryRebills } from './formatDailySummaryRebills';
import { formatMintAdditionalSales } from './formatMintAdditionalSales';

/**
 * Format the complete Telegram message based on template type
 */
export function formatTelegramMessage(state: AppState): string {
  if (state.templateType === 'template-b') {
    return formatTemplateB(state);
  }
  if (state.templateType === 'approval-rate-hourly') {
    return formatApprovalRateHourly(state);
  }
  if (state.templateType === 'daily-batch-reruns') {
    return formatDailyBatchReruns(state);
  }
  if (state.templateType === 'daily-summary-rebills') {
    return formatDailySummaryRebills(state);
  }
  if (state.templateType === 'mint-additional-sales') {
    return formatMintAdditionalSales(state);
  }
  return formatTemplateA(state);
}


