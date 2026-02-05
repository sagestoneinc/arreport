import {
  formatBatchReruns,
  BatchRerunsData,
  BatchRerunsProcessorConfig,
} from './batch-reruns';
import { formatManualRebills, ManualRebillsData } from './manual-rebills';
import { formatMintAdditionalSales, MintAdditionalSalesData } from './mint-additional-sales';
import { formatHourlyApprovalRate, HourlyApprovalRateData } from './hourly-approval-rate';
import {
  formatXShieldHourlyApproval,
  XShieldHourlyApprovalData,
} from './xshield-hourly-approval';
import { MidRowData } from '../templates';
import { FormatMode } from '../telegram-format';

export type FormDataType = Record<string, string | number | MidRowData[]>;

export type { FormatMode } from '../telegram-format';
export type { BatchRerunsProcessorConfig } from './batch-reruns';

/**
 * Options for message formatting
 */
export interface FormatMessageOptions {
  mode?: FormatMode;
  processorConfig?: BatchRerunsProcessorConfig;
}

export function formatMessage(
  slug: string,
  data: FormDataType,
  modeOrOptions: FormatMode | FormatMessageOptions = 'telegram'
): string {
  // Handle both old signature (mode only) and new signature (options object)
  const options: FormatMessageOptions =
    typeof modeOrOptions === 'string' ? { mode: modeOrOptions } : modeOrOptions;
  const mode = options.mode ?? 'telegram';

  switch (slug) {
    case 'batch-reruns':
      return formatBatchReruns(
        data as unknown as BatchRerunsData,
        mode,
        options.processorConfig
      );
    case 'manual-rebills':
      return formatManualRebills(data as unknown as ManualRebillsData, mode);
    case 'mint-additional-sales':
      return formatMintAdditionalSales(data as unknown as MintAdditionalSalesData, mode);
    case 'hourly-approval-rate':
      return formatHourlyApprovalRate(data as unknown as HourlyApprovalRateData, mode);
    default:
      return '';
  }
}
