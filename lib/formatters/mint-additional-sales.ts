import {
  FormatMode,
  EMOJI,
  formatTitle,
  formatSectionHeader,
  escapeIfNeeded,
} from '../telegram-format';

export interface MintAdditionalSalesData {
  additional_sales: number;
  affiliate_lines: string;
  c1c3_lines: string;
}

export function formatMintAdditionalSales(data: MintAdditionalSalesData, mode: FormatMode = 'telegram'): string {
  const lines: string[] = [];

  // Title with emoji and bold
  lines.push(formatTitle(EMOJI.SALES, `Mint Additional Sales Update`, mode));
  lines.push('');
  lines.push(
    escapeIfNeeded(`We re-ran yesterday's declines and got an additional ${data.additional_sales} sales for you:`, mode)
  );
  lines.push('');

  // Affiliate sales section
  if (data.affiliate_lines && data.affiliate_lines.trim()) {
    data.affiliate_lines.split('\n').forEach(line => {
      if (line.trim()) {
        lines.push(escapeIfNeeded(`- ${line.trim()}`, mode));
      }
    });
  }

  // C1 & C3 section
  if (data.c1c3_lines && data.c1c3_lines.trim()) {
    lines.push('');
    lines.push(formatSectionHeader(EMOJI.ACTION_REQUIRED, `c1 & c3's`, mode));
    data.c1c3_lines.split('\n').forEach(line => {
      if (line.trim()) {
        lines.push(escapeIfNeeded(`- ${line.trim()}`, mode));
      }
    });
  }

  return lines.join('\n');
}
