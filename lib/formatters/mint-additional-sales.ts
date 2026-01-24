export interface MintAdditionalSalesData {
  additional_sales: number;
  affiliate_lines: string;
  c1c3_lines: string;
}

export function formatMintAdditionalSales(data: MintAdditionalSalesData): string {
  const lines: string[] = [];

  lines.push(
    `Hey guys, we re-ran yesterday's declines and got an additional ${data.additional_sales} sales for you:`
  );
  lines.push(data.affiliate_lines);
  lines.push('');
  lines.push(`c1 & c3's:`);
  lines.push(data.c1c3_lines);

  return lines.join('\n');
}
