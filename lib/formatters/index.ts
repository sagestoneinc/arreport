import { formatBatchReruns, BatchRerunsData } from './batch-reruns';
import { formatManualRebills, ManualRebillsData } from './manual-rebills';
import { formatMintAdditionalSales, MintAdditionalSalesData } from './mint-additional-sales';
import { formatHourlyApprovalRate, HourlyApprovalRateData } from './hourly-approval-rate';

export type FormDataType = Record<string, string | number>;

export function formatMessage(slug: string, data: FormDataType): string {
  switch (slug) {
    case 'batch-reruns':
      return formatBatchReruns(data as unknown as BatchRerunsData);
    case 'manual-rebills':
      return formatManualRebills(data as unknown as ManualRebillsData);
    case 'mint-additional-sales':
      return formatMintAdditionalSales(data as unknown as MintAdditionalSalesData);
    case 'hourly-approval-rate':
      return formatHourlyApprovalRate(data as unknown as HourlyApprovalRateData);
    default:
      return '';
  }
}
