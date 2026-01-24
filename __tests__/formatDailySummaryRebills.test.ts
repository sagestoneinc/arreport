import { describe, it, expect } from 'vitest';
import { formatDailySummaryRebills } from '../lib/formatDailySummaryRebills';
import { AppState } from '../lib/types';

describe('formatDailySummaryRebills', () => {
  it('generates correct output for Daily Summary Rebills with sample data', () => {
    const state: AppState = {
      templateType: 'daily-summary-rebills',
      dateISO: '2026-01-21',
      timeHHMM: '13:45',
      threshold: 50,
      dailySummary: {
        sales: 0,
        declines: 0,
      },
      visaMids: [],
      mcMids: [],
      notes:
        'I re-ran 541 rebills declines from yesterday to PayCafe and got 77 sales (14.2% approval).\n\nVisa: 16.9% (48 approvals, 284 txns)\nMC: 11.3% (29 approvals, 257 txns)\nCommon Declines: Do Not Honor (34.9%)',
    };

    const output = formatDailySummaryRebills(state);

    // Check header uses ISO format
    expect(output).toContain('Re-Bills Summary: 2026-01-21');

    // Check content
    expect(output).toContain(
      'I re-ran 541 rebills declines from yesterday to PayCafe and got 77 sales (14.2% approval).'
    );
    expect(output).toContain('Visa: 16.9% (48 approvals, 284 txns)');
    expect(output).toContain('MC: 11.3% (29 approvals, 257 txns)');
    expect(output).toContain('Common Declines: Do Not Honor (34.9%)');
  });

  it('handles different dates correctly', () => {
    const state: AppState = {
      templateType: 'daily-summary-rebills',
      dateISO: '2026-12-31',
      timeHHMM: '13:45',
      threshold: 50,
      dailySummary: {
        sales: 0,
        declines: 0,
      },
      visaMids: [],
      mcMids: [],
      notes: 'Test rebills summary.',
    };

    const output = formatDailySummaryRebills(state);

    // Check ISO date format
    expect(output).toContain('Re-Bills Summary: 2026-12-31');
  });
});
