import { formatBatchReruns, BatchRerunsData } from './batch-reruns';
import { formatManualRebills, ManualRebillsData } from './manual-rebills';
import { formatMintAdditionalSales, MintAdditionalSalesData } from './mint-additional-sales';
import { formatHourlyApprovalRate, HourlyApprovalRateData } from './hourly-approval-rate';
import { MidRowData } from '../templates';
import { FormatMode } from '../telegram-format';

export type FormDataType = Record<string, string | number | MidRowData[]>;

export type { FormatMode } from '../telegram-format';

export function formatMessage(
  slug: string,
  data: FormDataType,
  mode: FormatMode = 'telegram'
): string {
  switch (slug) {
    case 'batch-reruns':
      return formatBatchReruns(data as unknown as BatchRerunsData, mode);
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
