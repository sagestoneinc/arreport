import { describe, it, expect } from 'vitest';
import { formatMintAdditionalSales } from '../lib/formatMintAdditionalSales';
import { AppState } from '../lib/types';

describe('formatMintAdditionalSales', () => {
  it('generates correct output for Mint Additional Sales with sample data', () => {
    const state: AppState = {
      templateType: 'mint-additional-sales',
      dateISO: '2026-01-23',
      timeHHMM: '13:45',
      threshold: 50,
      dailySummary: {
        sales: 0,
        declines: 0,
      },
      visaMids: [],
      mcMids: [],
      notes:
        "Hey guys, we re-ran yesterday's declines and got an additional 80 sales for you:\n3: 22\n22: 4\n51: 32\n60: 1\n88: 1\n235: 2\n301: 4\n331: 1\n346: 1\n377: 2\n404: 4\n579: 1\n585: 2\n586: 1\n587: 1\n670: 1\n\nc1 & c3's:\n3 - bffb00689c484df0bc1c61607358ef10\n3 - 18bde3794d894856ae1925d410680fb3\n3 - 108e68801cc243ae857096a684979c19",
    };

    const output = formatMintAdditionalSales(state);

    // Check header
    expect(output).toContain(
      "Hey guys, we re-ran yesterday's declines and got an additional 80 sales for you:"
    );

    // Check sales by MID
    expect(output).toContain('3: 22');
    expect(output).toContain('22: 4');
    expect(output).toContain('51: 32');

    // Check transaction IDs section
    expect(output).toContain("c1 & c3's:");
    expect(output).toContain('3 - bffb00689c484df0bc1c61607358ef10');
    expect(output).toContain('3 - 18bde3794d894856ae1925d410680fb3');
    expect(output).toContain('3 - 108e68801cc243ae857096a684979c19');
  });

  it('handles minimal notes correctly', () => {
    const state: AppState = {
      templateType: 'mint-additional-sales',
      dateISO: '2026-01-23',
      timeHHMM: '13:45',
      threshold: 50,
      dailySummary: {
        sales: 0,
        declines: 0,
      },
      visaMids: [],
      mcMids: [],
      notes:
        "Hey guys, we re-ran yesterday's declines and got an additional 10 sales for you:\n3: 5\n22: 5",
    };

    const output = formatMintAdditionalSales(state);

    expect(output).toContain(
      "Hey guys, we re-ran yesterday's declines and got an additional 10 sales for you:"
    );
    expect(output).toContain('3: 5');
    expect(output).toContain('22: 5');
  });
});
